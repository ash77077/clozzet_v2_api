import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../products/product.schema';

@Injectable()
export class ProductSeeder {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async seed() {
    // Clear existing products
    await this.productModel.deleteMany({});
    console.log('Cleared existing products');

    const products = [
      {
        id: 'tshirts',
        name: 'Custom T-Shirts',
        category: 'T-Shirt',
        tagline: 'Premium Quality Custom T-Shirts for Every Occasion',
        description: 'Our custom t-shirts are crafted from premium cotton blends, offering superior comfort and durability. Perfect for corporate events, team building, promotional campaigns, and everyday wear. Available in a wide range of colors, sizes, and fabric options to suit your specific needs.',
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800'
        ],
        features: [
          'Premium 100% cotton or cotton blend fabrics',
          'Screen printing and embroidery options',
          'Unisex and fitted styles available',
          'Bulk order discounts',
          'Fast turnaround time',
          'Custom color matching',
          'Fade-resistant printing',
          'Pre-shrunk fabric'
        ],
        variants: [
          {
            name: 'Classic Cotton',
            colors: ['White', 'Black', 'Navy', 'Gray', 'Red', 'Royal Blue', 'Forest Green'],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            materials: ['100% Cotton'],
            gsm: ['150 GSM (Light)', '180 GSM (Medium)', '220 GSM (Heavy)']
          },
          {
            name: 'Performance Blend',
            colors: ['White', 'Black', 'Navy', 'Gray', 'Neon Green', 'Electric Blue'],
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            materials: ['60% Cotton 40% Polyester', '95% Cotton 5% Spandex'],
            gsm: ['165 GSM', '180 GSM']
          }
        ],
        useCases: [
          'Corporate events and team building',
          'Promotional merchandise',
          'Sports teams and clubs',
          'School uniforms',
          'Retail merchandise',
          'Trade show giveaways'
        ],
        startingPrice: 12,
        isActive: true
      },
      {
        id: 'polos',
        name: 'Polo Shirts',
        category: 'Polo',
        tagline: 'Professional Polo Shirts for Business and Casual Wear',
        description: 'Elevate your professional image with our premium polo shirts. Designed for corporate uniforms, golf tournaments, and business casual environments, our polos combine style, comfort, and durability. Features moisture-wicking technology and collar stability for a polished look all day long.',
        images: [
          'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800',
          'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800',
          'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800'
        ],
        features: [
          'Moisture-wicking fabric technology',
          'Reinforced collar for shape retention',
          'Professional fit and finish',
          'Logo embroidery included',
          'Stain-resistant options available',
          'Breathable pique cotton',
          'Colorfast dyes',
          'Machine washable'
        ],
        variants: [
          {
            name: 'Pique Cotton',
            colors: ['White', 'Black', 'Navy', 'Light Blue', 'Burgundy', 'Hunter Green'],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            materials: ['100% Pique Cotton'],
            gsm: ['180 GSM', '200 GSM', '220 GSM']
          },
          {
            name: 'Performance Polo',
            colors: ['White', 'Black', 'Navy', 'Gray', 'Red'],
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            materials: ['65% Polyester 35% Cotton', '92% Cotton 8% Lycra'],
            gsm: ['200 GSM', '240 GSM']
          }
        ],
        useCases: [
          'Corporate uniforms',
          'Golf tournaments',
          'Restaurant and hotel staff',
          'Sales team apparel',
          'Business casual events',
          'Country club merchandise'
        ],
        startingPrice: 18,
        isActive: true
      },
      {
        id: 'hoodies',
        name: 'Custom Hoodies',
        category: 'Hoodie',
        tagline: 'Comfortable and Stylish Custom Hoodies',
        description: 'Stay warm and comfortable with our premium custom hoodies. Perfect for team outings, casual company wear, and promotional merchandise. Featuring soft interior fleece, adjustable drawstrings, and spacious kangaroo pockets. Available in pullover and zip-up styles.',
        images: [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
          'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
          'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800'
        ],
        features: [
          'Soft brushed interior fleece',
          'Adjustable drawstring hood',
          'Kangaroo pocket (pullover style)',
          'Custom embroidery and printing',
          'Available in pullover and zip-up',
          'Ribbed cuffs and hem',
          'Heavy-duty construction',
          'Preshrunk fabric'
        ],
        variants: [
          {
            name: 'Classic Pullover',
            colors: ['Black', 'Navy', 'Gray', 'Maroon', 'Forest Green', 'White'],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            materials: ['80% Cotton 20% Polyester', '100% Cotton Fleece'],
            gsm: ['280 GSM', '320 GSM', '380 GSM']
          },
          {
            name: 'Zip-Up Hoodie',
            colors: ['Black', 'Navy', 'Gray', 'Charcoal'],
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            materials: ['50% Cotton 50% Polyester'],
            gsm: ['300 GSM', '340 GSM']
          }
        ],
        useCases: [
          'Team merchandise',
          'Winter promotional items',
          'College and university wear',
          'Employee appreciation gifts',
          'Sports team apparel',
          'Outdoor event merchandise'
        ],
        startingPrice: 25,
        isActive: true
      },
      {
        id: 'caps',
        name: 'Custom Caps',
        category: 'Cap',
        tagline: 'High-Quality Custom Caps and Hats',
        description: 'Make your brand stand out with our premium custom caps and hats. Perfect for outdoor events, sports teams, and brand visibility. Featuring adjustable sizing, UV protection, and professional embroidered logos. Available in multiple styles including snapbacks, fitted, and trucker caps.',
        images: [
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
          'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800',
          'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800'
        ],
        features: [
          'Adjustable sizing (snapback or velcro)',
          'UV protection',
          'Professional embroidered logos',
          'Structured and unstructured options',
          'Curved and flat brim styles',
          'Moisture-wicking sweatband',
          'Breathable mesh back options',
          'Colorfast materials'
        ],
        variants: [
          {
            name: 'Classic Snapback',
            colors: ['Black', 'Navy', 'White', 'Red', 'Gray', 'Royal Blue'],
            sizes: ['One Size (Adjustable)'],
            materials: ['100% Cotton Twill', '65% Cotton 35% Polyester'],
            gsm: ['Medium Weight', 'Heavy Duty']
          },
          {
            name: 'Trucker Cap',
            colors: ['Black/White', 'Navy/White', 'Red/White', 'Camo'],
            sizes: ['One Size (Adjustable)'],
            materials: ['100% Polyester Mesh', 'Cotton Front/Mesh Back'],
            gsm: ['Lightweight Mesh']
          }
        ],
        useCases: [
          'Outdoor events and festivals',
          'Sports team merchandise',
          'Corporate giveaways',
          'Golf tournaments',
          'Trade show promotions',
          'Employee uniforms'
        ],
        startingPrice: 15,
        isActive: true
      },
      {
        id: 'jackets',
        name: 'Custom Jackets',
        category: 'Jacket',
        tagline: 'Premium Custom Jackets for All Weather',
        description: 'Professional custom jackets for corporate wear, outdoor events, and team uniforms. Our collection includes windbreakers, softshell jackets, and winter jackets with custom embroidery and printing options. Built for comfort, durability, and style.',
        images: [
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
          'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
          'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800'
        ],
        features: [
          'Water-resistant outer shell',
          'Breathable fabric technology',
          'Multiple pocket options',
          'Adjustable cuffs and hem',
          'Custom embroidered logos',
          'Available in multiple styles',
          'Windproof construction',
          'Machine washable'
        ],
        variants: [
          {
            name: 'Windbreaker',
            colors: ['Black', 'Navy', 'Red', 'Royal Blue', 'Gray'],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            materials: ['100% Polyester', 'Nylon Shell'],
            gsm: ['Lightweight (200 GSM)']
          },
          {
            name: 'Softshell Jacket',
            colors: ['Black', 'Navy', 'Charcoal', 'Forest Green'],
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            materials: ['94% Polyester 6% Spandex', 'Bonded Fleece'],
            gsm: ['Medium Weight (280 GSM)']
          }
        ],
        useCases: [
          'Corporate uniforms',
          'Outdoor team building',
          'Trade shows and events',
          'Executive gifts',
          'Sports team warmups',
          'Employee appreciation'
        ],
        startingPrice: 45,
        isActive: true
      },
      {
        id: 'promotional',
        name: 'Promotional Items',
        category: 'Promotional',
        tagline: 'Eco-Friendly Promotional Merchandise',
        description: 'Boost your brand visibility with our range of promotional items including tote bags, aprons, and more. Perfect for corporate events, promotional campaigns, and customer appreciation. All items feature large print areas and eco-friendly material options.',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
          'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
          'https://images.unsplash.com/photo-1577003833619-76bbd7f82948?w=800'
        ],
        features: [
          'Large customizable print area',
          'Eco-friendly material options',
          'Reinforced construction',
          'Machine washable',
          'Multiple sizes available',
          'Screen printing and embroidery',
          'Bulk order discounts',
          'Fast production time'
        ],
        variants: [
          {
            name: 'Tote Bags',
            colors: ['Natural', 'Black', 'Navy', 'Red', 'Green'],
            sizes: ['Standard (15"x16")', 'Large (18"x20")'],
            materials: ['100% Cotton Canvas', '100% Recycled Cotton', '80% Cotton 20% Jute'],
            gsm: ['8 oz', '10 oz', '12 oz Heavy Canvas']
          },
          {
            name: 'Aprons',
            colors: ['Black', 'White', 'Navy', 'Khaki', 'Red'],
            sizes: ['One Size (Adjustable)'],
            materials: ['100% Cotton Duck', '65% Polyester 35% Cotton'],
            gsm: ['Medium Weight', 'Heavy Duty Canvas']
          }
        ],
        useCases: [
          'Corporate events and conferences',
          'Retail merchandise',
          'Restaurant and cafe uniforms',
          'Promotional giveaways',
          'Customer appreciation gifts',
          'Trade show swag'
        ],
        startingPrice: 8,
        isActive: true
      }
    ];

    await this.productModel.insertMany(products);
    console.log('Products seeded successfully');
  }
}