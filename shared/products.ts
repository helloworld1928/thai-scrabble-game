/**
 * Product definitions for Stripe integration
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // ราคาเป็นบาท
  currency: string;
  type: 'theme' | 'support';
  image?: string;
}

export const PRODUCTS: Record<string, Product> = {
  theme_classic: {
    id: 'theme_classic',
    name: 'ธีมคลาสสิก',
    description: 'ธีมกระดานสไตล์คลาสสิก สีเขียวเข้มสบายตา',
    price: 29,
    currency: 'thb',
    type: 'theme',
  },
  theme_gold: {
    id: 'theme_gold',
    name: 'ธีมทอง',
    description: 'ธีมกระดานสีทองหรูหรา เพิ่มความโดดเด่นให้การเล่น',
    price: 39,
    currency: 'thb',
    type: 'theme',
  },
  theme_rainbow: {
    id: 'theme_rainbow',
    name: 'ธีมสีรุ้ง',
    description: 'ธีมกระดานสีสันสดใส เพิ่มความสนุกสนาน',
    price: 49,
    currency: 'thb',
    type: 'theme',
  },
  support_matcha: {
    id: 'support_matcha',
    name: 'ซื้อชามัชฉะ',
    description: 'สนับสนุนผู้พัฒนาด้วยชามัชฉะสักแก้ว ขอบคุณที่ใช้งานเกม!',
    price: 50,
    currency: 'thb',
    type: 'support',
  },
};

export function getProduct(productId: string): Product | undefined {
  return PRODUCTS[productId];
}

export function getAllProducts(): Product[] {
  return Object.values(PRODUCTS);
}

export function getThemeProducts(): Product[] {
  return getAllProducts().filter(p => p.type === 'theme');
}

export function getSupportProducts(): Product[] {
  return getAllProducts().filter(p => p.type === 'support');
}
