'use strict';
const path = require('path');
const fs   = require('fs');

const Printer     = require('pdfmake/js/Printer.js').default;
const URLResolver = require('pdfmake/js/URLResolver.js').default;

// ── Fonts — throw on missing so broken PDFs never reach clients ────────────
const fontDir     = path.join(__dirname, 'src/quotes/pdf/fonts');
const regularPath = path.join(fontDir, 'NotoSansArmenian-Regular.ttf');
const boldPath    = path.join(fontDir, 'NotoSansArmenian-Bold.ttf');

console.log('Font regular:', regularPath);
console.log('Font bold:   ', boldPath);
if (!fs.existsSync(regularPath)) throw new Error('[PDF] MISSING font: ' + regularPath);
if (!fs.existsSync(boldPath))    throw new Error('[PDF] MISSING font: ' + boldPath);
console.log('Fonts: OK');

const fonts = {
  NotoSansArmenian: {
    normal:      regularPath,
    bold:        boldPath,
    italics:     regularPath,
    bolditalics: boldPath,
  },
};

// ── Labels — loaded from i18n JSON, never hardcoded ───────────────────────
const i18nDir = path.join(__dirname, 'src/quotes/pdf/i18n');

function loadLabels(lang) {
  const file = path.join(i18nDir, lang + '.json');
  if (!fs.existsSync(file)) throw new Error('[PDF] Missing i18n file: ' + file);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// ── Test data (Armenian strings stored in UTF-8 JSON) ─────────────────────
const D = JSON.parse(fs.readFileSync(path.join(i18nDir, 'test-data.json'), 'utf8'));

const quote = {
  number:  'Q-2026-0001',
  version: 1,
  issueDate:  new Date('2026-11-06'),
  validUntil: new Date('2026-11-20'),

  company: {
    nameArm:     D.companyNameArm,
    tin:         '01234567',
    address:     D.address,
    phone:       '+374 10 123 456',
    email:       'info@clozzet.am',
    website:     'clozzet.am',
    bankName:    D.bankName,
    bankAccount: '21050000000000',
  },

  customerName: D.customerName,
  contactName:  D.contactName,

  items: [
    { description: D.item1desc, quantity: 50, unitPrice: 6500,  lineDiscountPercent: 0, lineTotal: 325000 },
    { description: D.item2desc, quantity: 30, unitPrice: 4000,  lineDiscountPercent: 0, lineTotal: 120000 },
  ],

  subtotal:      445000,
  discountType:  'percent',
  discountValue: 5,
  discountTotal: 22250,
  total:         422750,

  paymentType:            'cash',
  prepaymentPercent:      50,
  productionLeadTimeDays: 14,
  deliveryTerms:          D.deliveryTerms,
  notes:                  D.notes,
  termsText:              null,

  owner: {
    name:  'Ash Shahbazyan',
    role:  'Sales Manager',
    phone: '+374 55 000 001',
    email: 'ash@clozzet.am',
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────
// Use regular space (U+0020) as thousands separator — avoids U+202F that NotoSans lacks
function fmtNum(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
function fmtAmt(n, lang) {
  // Armenian dram sign U+058F, AMD for English
  return fmtNum(n) + (lang === 'hy' ? ' ֏' : ' AMD');
}
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return [
    String(dt.getDate()).padStart(2, '0'),
    String(dt.getMonth() + 1).padStart(2, '0'),
    dt.getFullYear(),
  ].join('.');
}
function versionStr(number, version) {
  // v1 shows just the number; v2+ appends " · v2"
  return (!version || version <= 1) ? number : (number + ' · v' + version);
}

// ── Document builder ───────────────────────────────────────────────────────
function buildDoc(q, lang) {
  const L = loadLabels(lang);
  const a = (n) => fmtAmt(n, lang);
  const c = q.company;

  const headerCells = [L.itemNo, L.description, L.qty, L.unitPrice, L.discount, L.lineTotal]
    .map(h => ({ text: h, bold: true, fontSize: 8, fillColor: '#1e3a5f', color: '#ffffff', margin: [0, 3, 0, 3] }));

  const dataRows = q.items.map((it, i) => [
    { text: String(i + 1),                                                     fontSize: 8 },
    { text: it.description,                                                     fontSize: 8 },
    { text: fmtNum(it.quantity),                                                fontSize: 8, alignment: 'center' },
    { text: a(it.unitPrice),                                                    fontSize: 8, alignment: 'right' },
    { text: it.lineDiscountPercent ? it.lineDiscountPercent + '%' : '—',   fontSize: 8, alignment: 'center' },
    { text: a(it.lineTotal),                                                    fontSize: 8, alignment: 'right' },
  ]);

  // Totals — two aligned columns, right-flush with table
  const totalBody = [[
    { text: L.subtotal,    alignment: 'right', fontSize: 9, border: [false, false, false, false] },
    { text: a(q.subtotal), alignment: 'right', fontSize: 9, border: [false, false, false, false] },
  ]];
  if (q.discountTotal > 0) {
    const lbl = L.discountRow + (q.discountType === 'percent' ? ' (' + q.discountValue + '%)' : '');
    totalBody.push([
      { text: lbl,                          alignment: 'right', fontSize: 9, color: '#dc2626', border: [false, false, false, false] },
      { text: '− ' + a(q.discountTotal), alignment: 'right', fontSize: 9, color: '#dc2626', border: [false, false, false, false] },
    ]);
  }
  totalBody.push([
    { text: L.grandTotal, alignment: 'right', bold: true, fontSize: 13, color: '#1e3a5f',
      border: [false, true, false, false], borderColor: ['', '#1e3a5f', '', ''] },
    { text: a(q.total),   alignment: 'right', bold: true, fontSize: 13, color: '#1e3a5f',
      border: [false, true, false, false], borderColor: ['', '#1e3a5f', '', ''] },
  ]);

  // Terms table rows
  const tr = (label, value) => [
    { text: label, fontSize: 9, bold: true, border: [false, false, false, true], borderColor: ['', '', '', '#f1f5f9'] },
    { text: value, fontSize: 9,             border: [false, false, false, true], borderColor: ['', '', '', '#f1f5f9'] },
  ];
  const termBody = [];
  termBody.push(tr(L.payMethod,  q.paymentType === 'cash' ? L.cash : L.invoice));
  termBody.push(tr(L.prepayment, q.prepaymentPercent + '%'));
  if (q.validUntil)             termBody.push(tr(L.validUntil, fmtDate(q.validUntil)));
  if (q.productionLeadTimeDays) termBody.push(tr(L.leadTime, q.productionLeadTimeDays + ' ' + L.workDays));
  if (q.deliveryTerms)          termBody.push(tr(L.delivery, q.deliveryTerms));

  return {
    pageSize: 'A4',
    pageMargins: [40, 50, 40, 50],
    defaultStyle: { font: 'NotoSansArmenian', fontSize: 10, lineHeight: 1.4 },

    content: [
      // ── Company header + quote meta ──────────────────────────────────
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'CLOZZET',                             fontSize: 22, bold: true, color: '#1e3a5f' },
              { text: c.nameArm,                             fontSize: 9,  color: '#374151', marginTop: 2 },
              { text: c.address,                             fontSize: 8,  color: '#6b7280', marginTop: 3 },
              { text: c.phone + '   ' + c.email,            fontSize: 8,  color: '#6b7280' },
              { text: c.website,                             fontSize: 8,  color: '#6b7280' },
              { text: L.tin + ': ' + c.tin,                 fontSize: 8,  color: '#6b7280' },
              { text: c.bankName + '   ' + c.bankAccount,   fontSize: 8,  color: '#6b7280' },
            ],
          },
          {
            width: 'auto',
            alignment: 'right',
            stack: [
              { text: L.quoteLabel,                          fontSize: 20, bold: true, color: '#1e3a5f' },
              { text: versionStr(q.number, q.version),       fontSize: 10, color: '#374151', marginTop: 3 },
              { text: L.date + ': ' + fmtDate(q.issueDate), fontSize: 9,  color: '#374151' },
            ],
          },
        ],
        marginBottom: 12,
      },

      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: '#1e3a5f' }], marginBottom: 12 },

      // ── Client ───────────────────────────────────────────────────────
      {
        stack: [
          { text: L.client, fontSize: 8, bold: true, color: '#6b7280', marginBottom: 2 },
          { text: q.customerName, fontSize: 11, bold: true, color: '#111827' },
          ...(q.contactName
            ? [{ text: L.contact + ': ' + q.contactName, fontSize: 9, color: '#374151' }]
            : []),
        ],
        marginBottom: 14,
      },

      // ── Items table ───────────────────────────────────────────────────
      {
        table: {
          headerRows: 1,
          widths: [18, '*', 32, 70, 36, 70],
          body: [headerCells, ...dataRows],
        },
        layout: {
          hLineWidth: (i, n) => (i === 0 || i === 1 || i === n.table.body.length) ? 1 : 0.3,
          vLineWidth: () => 0,
          hLineColor: (i) => (i === 0 || i === 1) ? '#1e3a5f' : '#e2e8f0',
          paddingLeft:   () => 5,
          paddingRight:  () => 5,
          paddingTop:    () => 4,
          paddingBottom: () => 4,
        },
        marginBottom: 14,
      },

      // ── Totals (right-aligned, two columns) ───────────────────────────
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 240,
            table: { widths: ['*', 110], body: totalBody },
            layout: 'noBorders',
          },
        ],
        marginBottom: 20,
      },

      // ── Terms & conditions ────────────────────────────────────────────
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
          ...(q.notes     ? [{ text: q.notes,    fontSize: 9, color: '#374151', marginTop: 6 }] : []),
          ...(q.termsText ? [{ text: q.termsText, fontSize: 8, color: '#9ca3af', marginTop: 4 }] : []),
        ],
        marginBottom: 16,
      },

      // ── Manager footer ────────────────────────────────────────────────
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            alignment: 'right',
            stack: [
              { text: L.manager + ': ' + q.owner.name,       fontSize: 9, bold: true, color: '#1e3a5f' },
              { text: q.owner.role,                           fontSize: 8, color: '#6b7280' },
              { text: q.owner.phone + '   ' + q.owner.email, fontSize: 8, color: '#6b7280' },
            ],
          },
        ],
      },
    ],
  };
}

// ── Generate and save ──────────────────────────────────────────────────────
async function generate(q, lang, outPath) {
  const urlResolver = new URLResolver([], {});
  const printer = new Printer(fonts, undefined, urlResolver);
  const doc = await printer.createPdfKitDocument(buildDoc(q, lang));
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => { fs.writeFileSync(outPath, Buffer.concat(chunks)); resolve(); });
    doc.on('error', reject);
    doc.end();
  });
}

(async () => {
  const outDir = path.join(__dirname, '..', 'test-pdfs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const hyPath = path.join(outDir, 'quote-test-hy.pdf');
  const enPath = path.join(outDir, 'quote-test-en.pdf');
  await generate(quote, 'hy', hyPath);
  console.log('Armenian PDF:', hyPath);
  await generate(quote, 'en', enPath);
  console.log('English PDF: ', enPath);
  console.log('Math: 50x6500 + 30x4000 = 445 000, -5% (22 250) = 422 750');
})();
