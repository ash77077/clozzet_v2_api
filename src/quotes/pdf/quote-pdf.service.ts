import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class QuotePdfService implements OnModuleInit {
  private readonly logger = new Logger(QuotePdfService.name);

  private readonly fontDir     = path.join(__dirname, 'fonts');
  private readonly regularPath = path.join(this.fontDir, 'NotoSansArmenian-Regular.ttf');
  private readonly boldPath    = path.join(this.fontDir, 'NotoSansArmenian-Bold.ttf');
  private readonly i18nDir     = path.join(__dirname, 'i18n');

  onModuleInit() {
    this.logger.log(`[PDF] Font regular: ${this.regularPath}`);
    this.logger.log(`[PDF] Font bold:    ${this.boldPath}`);
    if (!fs.existsSync(this.regularPath)) {
      throw new Error(`[PDF] MISSING font: ${this.regularPath}. Place NotoSansArmenian-Regular.ttf there.`);
    }
    if (!fs.existsSync(this.boldPath)) {
      throw new Error(`[PDF] MISSING font: ${this.boldPath}. Place NotoSansArmenian-Bold.ttf there.`);
    }
    this.logger.log('[PDF] Fonts: OK');
  }

  private getFonts() {
    return {
      NotoSansArmenian: {
        normal:      this.regularPath,
        bold:        this.boldPath,
        italics:     this.regularPath,
        bolditalics: this.boldPath,
      },
    };
  }

  private loadLabels(lang: string): Record<string, string> {
    const file = path.join(this.i18nDir, `${lang}.json`);
    if (!fs.existsSync(file)) {
      this.logger.warn(`[PDF] i18n file missing for lang "${lang}", falling back to "en"`);
      return JSON.parse(fs.readFileSync(path.join(this.i18nDir, 'en.json'), 'utf8'));
    }
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  // Thousands separator using regular space — avoids U+202F from Intl/toLocaleString
  private fmtNum(n: number): string {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  private fmtAmt(n: number, lang: string): string {
    return this.fmtNum(n) + (lang === 'hy' ? ' ֏' : ' AMD');
  }
  private fmtDate(d?: string | Date): string {
    if (!d) return '—';
    const dt = new Date(d);
    return [
      String(dt.getDate()).padStart(2, '0'),
      String(dt.getMonth() + 1).padStart(2, '0'),
      dt.getFullYear(),
    ].join('.');
  }
  private versionStr(number: string, version: number): string {
    return (!version || version <= 1) ? number : `${number} · v${version}`;
  }

  private buildDocDef(quote: any): any {
    const lang = quote.language === 'en' ? 'en' : 'hy';
    const L    = this.loadLabels(lang);
    const a    = (n: number) => this.fmtAmt(n, lang);
    const c    = quote.company ?? {};

    const headerCells = [L.itemNo, L.description, L.qty, L.unitPrice, L.discount, L.lineTotal]
      .map(h => ({ text: h, bold: true, fontSize: 8, fillColor: '#1e3a5f', color: '#ffffff', margin: [0, 3, 0, 3] }));

    const dataRows = (quote.items ?? []).map((it: any, i: number) => [
      { text: String(i + 1),                                                   fontSize: 8 },
      { text: it.description,                                                   fontSize: 8 },
      { text: this.fmtNum(it.quantity),                                         fontSize: 8, alignment: 'center' },
      { text: a(it.unitPrice),                                                  fontSize: 8, alignment: 'right' },
      { text: it.lineDiscountPercent ? it.lineDiscountPercent + '%' : '—', fontSize: 8, alignment: 'center' },
      { text: a(it.lineTotal),                                                  fontSize: 8, alignment: 'right' },
    ]);

    const totalBody: any[] = [[
      { text: L.subtotal,              alignment: 'right', fontSize: 9, border: [false, false, false, false] },
      { text: a(quote.subtotal ?? 0),  alignment: 'right', fontSize: 9, border: [false, false, false, false] },
    ]];
    if ((quote.discountTotal ?? 0) > 0) {
      const lbl = L.discountRow + (quote.discountType === 'percent' ? ` (${quote.discountValue}%)` : '');
      totalBody.push([
        { text: lbl,                                  alignment: 'right', fontSize: 9, color: '#dc2626', border: [false, false, false, false] },
        { text: '− ' + a(quote.discountTotal), alignment: 'right', fontSize: 9, color: '#dc2626', border: [false, false, false, false] },
      ]);
    }
    totalBody.push([
      { text: L.grandTotal,          alignment: 'right', bold: true, fontSize: 13, color: '#1e3a5f', border: [false, true, false, false], borderColor: ['', '#1e3a5f', '', ''] },
      { text: a(quote.total ?? 0),   alignment: 'right', bold: true, fontSize: 13, color: '#1e3a5f', border: [false, true, false, false], borderColor: ['', '#1e3a5f', '', ''] },
    ]);

    const tr = (label: string, value: string) => [
      { text: label, fontSize: 9, bold: true, border: [false, false, false, true], borderColor: ['', '', '', '#f1f5f9'] },
      { text: value, fontSize: 9,             border: [false, false, false, true], borderColor: ['', '', '', '#f1f5f9'] },
    ];
    const termBody: any[] = [];
    termBody.push(tr(L.payMethod,  quote.paymentType === 'cash' ? L.cash : L.invoice));
    termBody.push(tr(L.prepayment, (quote.prepaymentPercent ?? 50) + '%'));
    if (quote.validUntil)             termBody.push(tr(L.validUntil, this.fmtDate(quote.validUntil)));
    if (quote.productionLeadTimeDays) termBody.push(tr(L.leadTime, quote.productionLeadTimeDays + ' ' + L.workDays));
    if (quote.deliveryTerms)          termBody.push(tr(L.delivery, quote.deliveryTerms));

    return {
      pageSize: 'A4',
      pageMargins: [40, 50, 40, 50],
      defaultStyle: { font: 'NotoSansArmenian', fontSize: 10, lineHeight: 1.4 },

      content: [
        // Company header + quote meta
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'CLOZZET',                                                     fontSize: 22, bold: true, color: '#1e3a5f' },
                ...(c.nameArm   ? [{ text: c.nameArm,                                  fontSize: 9,  color: '#374151', marginTop: 2 }] : []),
                ...(c.address   ? [{ text: c.address,                                  fontSize: 8,  color: '#6b7280', marginTop: 3 }] : []),
                ...([c.phone, c.email].some(Boolean) ? [{ text: [c.phone, c.email].filter(Boolean).join('   '), fontSize: 8, color: '#6b7280' }] : []),
                ...(c.website   ? [{ text: c.website,                                  fontSize: 8,  color: '#6b7280' }] : []),
                ...(c.tin       ? [{ text: L.tin + ': ' + c.tin,                       fontSize: 8,  color: '#6b7280' }] : []),
                ...(c.bankName  ? [{ text: c.bankName + (c.bankAccount ? '   ' + c.bankAccount : ''), fontSize: 8, color: '#6b7280' }] : []),
              ],
            },
            {
              width: 'auto',
              alignment: 'right',
              stack: [
                { text: L.quoteLabel,                                                   fontSize: 20, bold: true, color: '#1e3a5f' },
                { text: this.versionStr(quote.number, quote.version ?? 1),              fontSize: 10, color: '#374151', marginTop: 3 },
                { text: L.date + ': ' + this.fmtDate(quote.issueDate),                 fontSize: 9,  color: '#374151' },
              ],
            },
          ],
          marginBottom: 12,
        },

        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: '#1e3a5f' }], marginBottom: 12 },

        // Client
        {
          stack: [
            { text: L.client, fontSize: 8, bold: true, color: '#6b7280', marginBottom: 2 },
            { text: quote.customerName || quote.customerId || '—', fontSize: 11, bold: true, color: '#111827' },
            ...(quote.contactName ? [{ text: L.contact + ': ' + quote.contactName, fontSize: 9, color: '#374151' }] : []),
          ],
          marginBottom: 14,
        },

        // Items table
        {
          table: {
            headerRows: 1,
            widths: [18, '*', 32, 70, 36, 70],
            body: [headerCells, ...dataRows],
          },
          layout: {
            hLineWidth: (i: number, n: any) => (i === 0 || i === 1 || i === n.table.body.length) ? 1 : 0.3,
            vLineWidth: () => 0,
            hLineColor: (i: number) => (i === 0 || i === 1) ? '#1e3a5f' : '#e2e8f0',
            paddingLeft:   () => 5,
            paddingRight:  () => 5,
            paddingTop:    () => 4,
            paddingBottom: () => 4,
          },
          marginBottom: 14,
        },

        // Totals
        {
          columns: [
            { width: '*', text: '' },
            { width: 240, table: { widths: ['*', 110], body: totalBody }, layout: 'noBorders' },
          ],
          marginBottom: 20,
        },

        // Terms
        {
          stack: [
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#e2e8f0' }], marginBottom: 10 },
            { text: L.termsHead, bold: true, fontSize: 10, color: '#1e3a5f', marginBottom: 6 },
            {
              table: { widths: [160, '*'], body: termBody },
              layout: {
                hLineWidth: () => 0.3,
                vLineWidth: () => 0,
                hLineColor: () => '#f1f5f9',
                paddingLeft: () => 0, paddingRight: () => 8,
                paddingTop:  () => 3, paddingBottom: () => 3,
              },
            },
            ...(quote.notes     ? [{ text: quote.notes,    fontSize: 9, color: '#374151', marginTop: 6 }] : []),
            ...(quote.termsText ? [{ text: quote.termsText, fontSize: 8, color: '#9ca3af', marginTop: 4 }] : []),
          ],
          marginBottom: 16,
        },

        // Manager footer
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              alignment: 'right',
              stack: [
                { text: L.manager + ': ' + (quote.ownerName ?? ''),                                                 fontSize: 9, bold: true, color: '#1e3a5f' },
                ...(quote.ownerRole  ? [{ text: quote.ownerRole,                                                     fontSize: 8, color: '#6b7280' }] : []),
                ...([quote.ownerPhone, quote.ownerEmail].some(Boolean) ? [{ text: [quote.ownerPhone, quote.ownerEmail].filter(Boolean).join('   '), fontSize: 8, color: '#6b7280' }] : []),
              ],
            },
          ],
        },
      ],
    };
  }

  async generate(quote: any): Promise<Buffer> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Printer = require('pdfmake/js/Printer.js').default;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const URLResolver = require('pdfmake/js/URLResolver.js').default;

    const urlResolver = new URLResolver([], {});
    const printer = new Printer(this.getFonts(), undefined, urlResolver);
    const doc = await printer.createPdfKitDocument(this.buildDocDef(quote));

    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.end();
    });
  }
}
