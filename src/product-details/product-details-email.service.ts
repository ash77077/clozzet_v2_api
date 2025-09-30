import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateProductDetailsDto } from './dto/create-product-details.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductDetailsEmailService {
  private readonly apiBaseUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.apiBaseUrl = this.configService.get<string>('API_BASE_URL', 'http://localhost:3000');
  }

  async sendProductDetailsEmail(productDetails: CreateProductDetailsDto): Promise<void> {
    const emailSubject = `New Production Order: ${productDetails.orderNumber} - ${productDetails.clientName}`;
    
    const htmlContent = this.generateEmailTemplate(productDetails);
    
    await this.mailerService.sendMail({
      to: 'clozzet.corp@gmail.com',
      subject: emailSubject,
      html: htmlContent,
    });
  }

  async sendManufacturingStatusChangeEmail(
    orderNumber: string,
    clientName: string,
    oldStatus: string,
    newStatus: string,
    updatedBy: string
  ): Promise<void> {
    const emailSubject = `Manufacturing Status Update: ${orderNumber} - ${this.getStatusLabel(newStatus)}`;
    
    const htmlContent = this.generateStatusChangeEmailTemplate(
      orderNumber,
      clientName,
      oldStatus,
      newStatus,
      updatedBy
    );
    
    await this.mailerService.sendMail({
      to: 'clozzet.corp@gmail.com',
      subject: emailSubject,
      html: htmlContent,
    });
  }

  private generateEmailTemplate(data: CreateProductDetailsDto): string {
    const sizeQuantitiesTable = this.generateSizeQuantitiesTable(data.sizeQuantities);
    const specificDetails = this.generateSpecificDetails(data);
    const priorityBadge = this.getPriorityBadge(data.priority);
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Production Order - ${data.orderNumber}</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
            .container { max-width: 800px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 30px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .order-number { font-size: 18px; opacity: 0.9; }
            .content { padding: 30px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 20px; font-weight: bold; color: #2c3e50; margin-bottom: 15px; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
            .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
            .detail-item { background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db; }
            .detail-label { font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
            .detail-value { color: #34495e; }
            .priority { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; color: white; }
            .priority.low { background-color: #95a5a6; }
            .priority.normal { background-color: #3498db; }
            .priority.high { background-color: #f39c12; }
            .priority.urgent { background-color: #e74c3c; }
            .size-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .size-table th, .size-table td { padding: 12px; text-align: center; border: 1px solid #ddd; }
            .size-table th { background-color: #3498db; color: white; font-weight: bold; }
            .size-table tr:nth-child(even) { background-color: #f8f9fa; }
            .total-row { background-color: #e8f6fd !important; font-weight: bold; }
            .colors-list { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
            .color-item { padding: 5px 12px; background-color: #ecf0f1; border-radius: 15px; font-size: 14px; }
            .footer { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
            .urgent-banner { background-color: #e74c3c; color: white; padding: 15px; text-align: center; font-weight: bold; margin-bottom: 20px; }
            .file-preview { max-width: 100%; width: auto; height: auto; max-height: 200px; border-radius: 8px; border: 2px solid #e9ecef; margin: 10px 0; display: block; }
            .file-gallery { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px; }
            .file-item { flex: 1; min-width: 200px; max-width: 300px; }
            .file-card { background: #f8f9fa; border-radius: 8px; padding: 15px; border: 1px solid #e9ecef; }
            .file-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-weight: 600; color: #2c3e50; }
            .file-actions { display: flex; gap: 10px; margin-top: 10px; }
            .file-action { display: inline-block; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 500; }
            .download-btn { background-color: #3498db; color: white; }
            .preview-btn { background-color: #2ecc71; color: white; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">CLOZZET</div>
                <div class="order-number">Production Order: ${data.orderNumber}</div>
            </div>
            
            ${data.priority === 'urgent' ? '<div class="urgent-banner">🚨 URGENT ORDER - IMMEDIATE ATTENTION REQUIRED 🚨</div>' : ''}
            
            <div class="content">
                <div class="section">
                    <div class="section-title">📋 Order Information</div>
                    <div class="details-grid">
                        <div class="detail-item">
                            <div class="detail-label">Order Number</div>
                            <div class="detail-value">${data.orderNumber}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Client Name</div>
                            <div class="detail-value">${data.clientName}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Sales Person</div>
                            <div class="detail-value">${data.salesPerson}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Deadline</div>
                            <div class="detail-value">${data.deadline}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Total Quantity</div>
                            <div class="detail-value">${data.quantity} pieces</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Priority</div>
                            <div class="detail-value">${priorityBadge}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">👕 Product Specifications</div>
                    <div class="details-grid">
                        <div class="detail-item">
                            <div class="detail-label">Cloth Type</div>
                            <div class="detail-value">${data.clothType}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Textile Type</div>
                            <div class="detail-value">${data.textileType}</div>
                        </div>
                        ${data.fabricWeight ? `
                        <div class="detail-item">
                            <div class="detail-label">Fabric Weight</div>
                            <div class="detail-value">${data.fabricWeight} GSM</div>
                        </div>
                        ` : ''}
                        <div class="detail-item">
                            <div class="detail-label">Colors</div>
                            <div class="detail-value">
                                <div class="colors-list">
                                    ${data.colors.map(color => `<span class="color-item">${color}</span>`).join('')}
                                </div>
                                ${data.customColorDetails ? `<div style="margin-top: 10px;"><strong>Custom Color:</strong> ${data.customColorDetails}</div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">📏 Size Quantities</div>
                    ${sizeQuantitiesTable}
                </div>

                <div class="section">
                    <div class="section-title">🎨 Design & Printing</div>
                    <div class="details-grid">
                        <div class="detail-item">
                            <div class="detail-label">Printing Method</div>
                            <div class="detail-value">${data.printingMethod}</div>
                        </div>
                        ${data.logoPosition ? `
                        <div class="detail-item">
                            <div class="detail-label">Logo Position</div>
                            <div class="detail-value">${data.logoPosition}</div>
                        </div>
                        ` : ''}
                        ${data.logoSize ? `
                        <div class="detail-item">
                            <div class="detail-label">Logo Size</div>
                            <div class="detail-value">${data.logoSize}</div>
                        </div>
                        ` : ''}
                        ${data.logoFiles && data.logoFiles.length > 0 ? `
                        <div class="detail-item">
                            <div class="detail-label">Logo Files</div>
                            <div class="detail-value">
                                ${this.generateFileLinks(data.logoFiles, '📎')}
                            </div>
                        </div>
                        ` : ''}
                        ${data.designFiles && data.designFiles.length > 0 ? `
                        <div class="detail-item">
                            <div class="detail-label">Design Files</div>
                            <div class="detail-value">
                                ${this.generateFileLinks(data.designFiles, '🎨')}
                            </div>
                        </div>
                        ` : ''}
                        ${data.referenceImages && data.referenceImages.length > 0 ? `
                        <div class="detail-item">
                            <div class="detail-label">Reference Images</div>
                            <div class="detail-value">
                                ${this.generateFileLinks(data.referenceImages, '🖼️')}
                            </div>
                        </div>
                        ` : ''}
                        ${data.pantoneColors ? `
                        <div class="detail-item">
                            <div class="detail-label">Pantone Colors</div>
                            <div class="detail-value">${data.pantoneColors}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>

                ${specificDetails ? `
                <div class="section">
                    <div class="section-title">🔧 Specific Requirements</div>
                    <div class="details-grid">
                        ${specificDetails}
                    </div>
                </div>
                ` : ''}

                ${data.specialInstructions || data.packagingRequirements || data.shippingAddress ? `
                <div class="section">
                    <div class="section-title">📝 Additional Details</div>
                    <div class="details-grid">
                        ${data.specialInstructions ? `
                        <div class="detail-item">
                            <div class="detail-label">Special Instructions</div>
                            <div class="detail-value">${data.specialInstructions}</div>
                        </div>
                        ` : ''}
                        ${data.packagingRequirements ? `
                        <div class="detail-item">
                            <div class="detail-label">Packaging Requirements</div>
                            <div class="detail-value">${data.packagingRequirements}</div>
                        </div>
                        ` : ''}
                        ${data.shippingAddress ? `
                        <div class="detail-item">
                            <div class="detail-label">Shipping Address</div>
                            <div class="detail-value">${data.shippingAddress}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}
            </div>

            <div class="footer">
                <div>CLOZZET Manufacturing Department</div>
                <div>📧 clozzet.corp@gmail.com | 📞 +374 (44) 01 07 44</div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateSizeQuantitiesTable(sizeQuantities: { [size: string]: number }): string {
    const sizes = Object.keys(sizeQuantities);
    const quantities = Object.values(sizeQuantities);
    const total = quantities.reduce((sum, qty) => sum + qty, 0);

    if (sizes.length === 0) {
      return '<p>No size quantities specified</p>';
    }

    const tableRows = sizes.map(size => 
      `<tr><td>${size}</td><td>${sizeQuantities[size]}</td></tr>`
    ).join('');

    return `
      <table class="size-table">
        <thead>
          <tr>
            <th>Size</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          <tr class="total-row">
            <td><strong>TOTAL</strong></td>
            <td><strong>${total}</strong></td>
          </tr>
        </tbody>
      </table>
    `;
  }

  private generateSpecificDetails(data: CreateProductDetailsDto): string {
    const details: string[] = [];

    // T-Shirt specific
    if (data.neckStyle) details.push(`<div class="detail-item"><div class="detail-label">Neck Style</div><div class="detail-value">${data.neckStyle}</div></div>`);
    if (data.sleeveType) details.push(`<div class="detail-item"><div class="detail-label">Sleeve Type</div><div class="detail-value">${data.sleeveType}</div></div>`);
    if (data.fit) details.push(`<div class="detail-item"><div class="detail-label">Fit</div><div class="detail-value">${data.fit}</div></div>`);

    // Hoodie specific
    if (data.hoodieStyle) details.push(`<div class="detail-item"><div class="detail-label">Hoodie Style</div><div class="detail-value">${data.hoodieStyle}</div></div>`);
    if (data.pocketType) details.push(`<div class="detail-item"><div class="detail-label">Pocket Type</div><div class="detail-value">${data.pocketType}</div></div>`);
    if (data.zipperType) details.push(`<div class="detail-item"><div class="detail-label">Zipper Type</div><div class="detail-value">${data.zipperType}</div></div>`);

    // Polo specific
    if (data.collarStyle) details.push(`<div class="detail-item"><div class="detail-label">Collar Style</div><div class="detail-value">${data.collarStyle}</div></div>`);
    if (data.buttonCount) details.push(`<div class="detail-item"><div class="detail-label">Button Count</div><div class="detail-value">${data.buttonCount}</div></div>`);
    if (data.placketStyle) details.push(`<div class="detail-item"><div class="detail-label">Placket Style</div><div class="detail-value">${data.placketStyle}</div></div>`);

    // Eco Bag specific
    if (data.bagStyle) details.push(`<div class="detail-item"><div class="detail-label">Bag Style</div><div class="detail-value">${data.bagStyle}</div></div>`);
    if (data.handleType) details.push(`<div class="detail-item"><div class="detail-label">Handle Type</div><div class="detail-value">${data.handleType}</div></div>`);
    if (data.bagDimensions) details.push(`<div class="detail-item"><div class="detail-label">Bag Dimensions</div><div class="detail-value">${data.bagDimensions}</div></div>`);
    if (data.reinforcement) details.push(`<div class="detail-item"><div class="detail-label">Reinforcement</div><div class="detail-value">${data.reinforcement}</div></div>`);

    // Cap specific
    if (data.capStyle) details.push(`<div class="detail-item"><div class="detail-label">Cap Style</div><div class="detail-value">${data.capStyle}</div></div>`);
    if (data.visorType) details.push(`<div class="detail-item"><div class="detail-label">Visor Type</div><div class="detail-value">${data.visorType}</div></div>`);
    if (data.closure) details.push(`<div class="detail-item"><div class="detail-label">Closure</div><div class="detail-value">${data.closure}</div></div>`);

    // Apron specific
    if (data.apronStyle) details.push(`<div class="detail-item"><div class="detail-label">Apron Style</div><div class="detail-value">${data.apronStyle}</div></div>`);
    if (data.neckStrap) details.push(`<div class="detail-item"><div class="detail-label">Neck Strap</div><div class="detail-value">${data.neckStrap}</div></div>`);
    if (data.waistTie) details.push(`<div class="detail-item"><div class="detail-label">Waist Tie</div><div class="detail-value">${data.waistTie}</div></div>`);
    if (data.pocketDetails) details.push(`<div class="detail-item"><div class="detail-label">Pocket Details</div><div class="detail-value">${data.pocketDetails}</div></div>`);

    return details.join('');
  }

  private getPriorityBadge(priority: string): string {
    return `<span class="priority ${priority}">${priority.toUpperCase()}</span>`;
  }

  private generateFileLinks(files: string[], icon: string): string {
    if (!files || files.length === 0) return '';

    return `
      <div class="file-gallery">
        ${files.map(filename => {
          const downloadUrl = `${this.apiBaseUrl}/product-details/files/${filename}`;
          const previewUrl = `${this.apiBaseUrl}/product-details/preview/${filename}`;
          const isImage = this.isImageFile(filename);
          
          return `
            <div class="file-item">
              <div class="file-card">
                <div class="file-header">
                  <span style="font-size: 18px;">${icon}</span>
                  <span>${filename}</span>
                </div>
                
                ${isImage ? `
                  <div style="text-align: center;">
                    <img src="${previewUrl}" alt="${filename}" class="file-preview" style="max-width: 100%; height: auto; max-height: 200px; border-radius: 6px; border: 1px solid #ddd;" />
                  </div>
                ` : `
                  <div style="text-align: center; padding: 40px 20px; background-color: #f8f9fa; border-radius: 6px; border: 1px dashed #bdc3c7;">
                    <div style="font-size: 32px; margin-bottom: 10px;">${this.getFileIcon(filename)}</div>
                    <div style="font-size: 14px; color: #7f8c8d;">Click to view ${this.getFileType(filename)}</div>
                  </div>
                `}
                
                <div class="file-actions">
                  <a href="${downloadUrl}" class="file-action download-btn" style="background-color: #3498db; color: white; text-decoration: none;">
                    📥 Download
                  </a>
                  <a href="${previewUrl}" target="_blank" class="file-action preview-btn" style="background-color: #2ecc71; color: white; text-decoration: none;">
                    👁️ View
                  </a>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  private isImageFile(filename: string): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension || '');
  }

  private getFileIcon(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'ai':
        return '🎨';
      case 'psd':
        return '🖼️';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'zip':
      case 'rar':
        return '📦';
      default:
        return '📁';
    }
  }

  private getFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'PDF Document';
      case 'ai':
        return 'Adobe Illustrator File';
      case 'psd':
        return 'Photoshop Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'xls':
      case 'xlsx':
        return 'Excel Spreadsheet';
      case 'zip':
      case 'rar':
        return 'Archive File';
      default:
        return 'File';
    }
  }

  private generateStatusChangeEmailTemplate(
    orderNumber: string,
    clientName: string,
    oldStatus: string,
    newStatus: string,
    updatedBy: string
  ): string {
    const oldStatusBadge = this.getStatusBadge(oldStatus);
    const newStatusBadge = this.getStatusBadge(newStatus);
    const statusIcon = this.getStatusIcon(newStatus);
    const currentDateTime = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Manufacturing Status Update - ${orderNumber}</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 30px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .update-title { font-size: 18px; opacity: 0.9; margin-bottom: 5px; }
            .order-number { font-size: 16px; opacity: 0.8; }
            .content { padding: 30px; }
            .status-update { background: linear-gradient(135deg, #e8f5e8, #f0f8f0); border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 5px solid #28a745; }
            .status-change { display: flex; align-items: center; justify-content: center; gap: 15px; margin: 20px 0; }
            .status-badge { padding: 8px 16px; border-radius: 20px; font-weight: bold; color: white; font-size: 14px; }
            .arrow { font-size: 24px; color: #6c757d; }
            .detail-item { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #3498db; }
            .detail-label { font-weight: bold; color: #2c3e50; margin-bottom: 5px; font-size: 14px; }
            .detail-value { color: #34495e; font-size: 16px; }
            .timestamp { background-color: #e9ecef; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px; }
            .footer { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
            .status-pending { background-color: #6c757d; }
            .status-waiting-for-info { background-color: #fff3cd; border: 2px solid #ffc107; color: #664d03; font-weight: 600; }
            .status-in-progress { background-color: #17a2b8; }
            .status-printing { background-color: #6f42c1; }
            .status-quality-check { background-color: #28a745; }
            .status-packaging { background-color: #fd7e14; }
            .status-done { background-color: #28a745; }
            .status-on-hold { background-color: #dc3545; }
            .icon { font-size: 24px; margin-right: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏭 CLOZZET</div>
                <div class="update-title">Manufacturing Status Update</div>
                <div class="order-number">Order: ${orderNumber}</div>
            </div>
            
            <div class="content">
                <div class="status-update">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div class="icon">${statusIcon}</div>
                        <h3 style="margin: 10px 0; color: #2c3e50;">Status Updated Successfully</h3>
                    </div>
                    
                    <div class="status-change">
                        ${oldStatusBadge}
                        <div class="arrow">→</div>
                        ${newStatusBadge}
                    </div>
                </div>

                <div class="detail-item">
                    <div class="detail-label">Order Number</div>
                    <div class="detail-value">${orderNumber}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label">Client Name</div>
                    <div class="detail-value">${clientName}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label">Previous Status</div>
                    <div class="detail-value">${this.getStatusLabel(oldStatus)}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label">New Status</div>
                    <div class="detail-value">${this.getStatusLabel(newStatus)}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label">Updated By</div>
                    <div class="detail-value">${updatedBy}</div>
                </div>

                <div class="timestamp">
                    <strong>Updated:</strong> ${currentDateTime}
                </div>

                <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0d6efd;">
                    <p style="margin: 0; color: #495057; font-size: 14px;">
                        <strong>📧 This is an automated notification.</strong><br>
                        The manufacturing status for order ${orderNumber} has been updated in the system.
                        For any questions, please contact the manufacturing department.
                    </p>
                </div>
            </div>

            <div class="footer">
                <div>CLOZZET Manufacturing Department</div>
                <div>📧 clozzet.corp@gmail.com | 📞 +374 (44) 01 07 44</div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private getStatusBadge(status: string): string {
    const label = this.getStatusLabel(status);
    const className = `status-${status.toLowerCase().replaceAll('_', '-')}`;
    return `<div class="status-badge ${className}">${label}</div>`;
  }

  private getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'waiting_for_info': 'Waiting for Info',
      'in_progress': 'In Progress',
      'printing': 'Printing',
      'quality_check': 'Quality Check',
      'packaging': 'Packaging',
      'done': 'Done',
      'on_hold': 'On Hold'
    };
    return statusMap[status] || 'Unknown';
  }

  private getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'pending': '⏳',
      'waiting_for_info': 'ℹ️',
      'in_progress': '⚙️',
      'printing': '🖨️',
      'quality_check': '✅',
      'packaging': '📦',
      'done': '🎉',
      'on_hold': '⏸️'
    };
    return iconMap[status] || '📋';
  }
}
