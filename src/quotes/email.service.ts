import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendQuoteNotification(quoteData: CreateQuoteDto): Promise<void> {
    const productTypeLabels = {
      't-shirts': 'Custom T-Shirts',
      'polo-shirts': 'Polo Shirts',
      'hoodies': 'Hoodies & Sweatshirts',
      'caps': 'Custom Caps',
      'jackets': 'Jackets & Outerwear',
      'promotional': 'Promotional Items',
      'other': 'Other'
    };

    const budgetLabels = {
      'under-1000': 'Under $1,000',
      '1000-5000': '$1,000 - $5,000',
      '5000-10000': '$5,000 - $10,000',
      '10000-25000': '$10,000 - $25,000',
      'over-25000': 'Over $25,000'
    };

    const timelineLabels = {
      'asap': 'ASAP',
      '1-week': 'Within 1 week',
      '2-weeks': 'Within 2 weeks',
      '1-month': 'Within 1 month',
      'flexible': 'Flexible timeline'
    };

    const additionalServicesLabels = {
      'logo-design': 'Logo Design Assistance',
      'rush-delivery': 'Rush Delivery',
      'sample-creation': 'Sample Creation',
      'packaging': 'Custom Packaging',
      'shipping': 'Shipping Coordination'
    };

    const formattedServices = quoteData.additionalServices
      .map(service => additionalServicesLabels[service] || service)
      .join(', ');

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-bottom: 10px;">🎯 New Quote Request Received</h2>
          <p style="color: #666; margin: 0;">A new quote request has been submitted through your website.</p>
        </div>

        <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
          <h3 style="color: #007bff; margin-bottom: 20px;">📋 Quote Details</h3>
          
          <div style="margin-bottom: 15px;">
            <h4 style="color: #333; margin-bottom: 5px;">👤 Contact Information</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; width: 150px; color: #666;"><strong>Company:</strong></td>
                <td style="padding: 8px 0; color: #333;">${quoteData.companyName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Contact Name:</strong></td>
                <td style="padding: 8px 0; color: #333;">${quoteData.contactName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; color: #333;"><a href="mailto:${quoteData.email}" style="color: #007bff; text-decoration: none;">${quoteData.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Phone:</strong></td>
                <td style="padding: 8px 0; color: #333;"><a href="tel:${quoteData.phone}" style="color: #007bff; text-decoration: none;">${quoteData.phone}</a></td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 15px;">
            <h4 style="color: #333; margin-bottom: 5px;">🛍️ Project Details</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; width: 150px; color: #666;"><strong>Product Type:</strong></td>
                <td style="padding: 8px 0; color: #333;">${productTypeLabels[quoteData.productType] || quoteData.productType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Quantity:</strong></td>
                <td style="padding: 8px 0; color: #333;">${quoteData.quantity.toLocaleString()} pieces</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Budget Range:</strong></td>
                <td style="padding: 8px 0; color: #333;">${budgetLabels[quoteData.budget] || quoteData.budget}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Timeline:</strong></td>
                <td style="padding: 8px 0; color: #333;">${timelineLabels[quoteData.timeline] || quoteData.timeline}</td>
              </tr>
              ${formattedServices ? `
              <tr>
                <td style="padding: 8px 0; color: #666; vertical-align: top;"><strong>Additional Services:</strong></td>
                <td style="padding: 8px 0; color: #333;">${formattedServices}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="margin-bottom: 20px;">
            <h4 style="color: #333; margin-bottom: 10px;">💬 Project Message</h4>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff;">
              <p style="margin: 0; color: #333; line-height: 1.6;">${quoteData.message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>

          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <p style="margin: 0; color: #0066cc; font-size: 14px;">
              <strong>⏰ Quick Response:</strong> This request was submitted through your website. 
              Consider responding within 4 hours to maintain excellent customer service.
            </p>
          </div>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 6px; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            This email was generated automatically from your CLOZZET website.<br>
            Sent on ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `;

    await this.mailerService.sendMail({
      to: 'clozzet.corp@gmail.com',
      subject: `🎯 New Quote Request from ${quoteData.companyName} - ${productTypeLabels[quoteData.productType] || quoteData.productType}`,
      html: emailContent,
    });
  }
}