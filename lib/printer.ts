import { query } from './mssql';

export interface ReceiptData {
  orderNumber: number;
  tableNumber?: string;
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    price: number;
    totalPrice: number;
    options?: string;
    notes?: string;
  }>;
  orderDate: string;
  orderTime: string;
  estimatedTime: number;
  restaurantName: string;
}

export async function getPrinterForProduct(productId: string): Promise<string | null> {
  try {
    // Önce ürünün yazıcısını kontrol et
    const productResult = await query(`
      SELECT p.printer_id, p.category_id
      FROM products p
      WHERE p.id = @productId
    `, { productId });

    if (productResult.length > 0) {
      const product = productResult[0];
      
      // Ürünün kendi yazıcısı varsa onu kullan
      if (product.printer_id) {
        return product.printer_id;
      }
      
      // Yoksa kategorinin yazıcısını kullan
      if (product.category_id) {
        const categoryResult = await query(`
          SELECT printer_id
          FROM categories
          WHERE id = @categoryId
        `, { categoryId: product.category_id });

        if (categoryResult.length > 0 && categoryResult[0].printer_id) {
          return categoryResult[0].printer_id;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting printer for product:', error);
    return null;
  }
}

export async function getReceiptTemplate(printerId: string): Promise<any> {
  try {
    const templates = await query(`
      SELECT * FROM receipt_templates
      WHERE printer_id = @printerId AND is_active = 1
    `, { printerId });

    return templates.length > 0 ? templates[0] : null;
  } catch (error) {
    console.error('Error getting receipt template:', error);
    return null;
  }
}

export function formatReceipt(template: any, data: ReceiptData): string {
  let receipt = template.header_text
    .replace(/{RESTAURANT_NAME}/g, data.restaurantName)
    .replace(/{TABLE_NUMBER}/g, data.tableNumber || 'N/A')
    .replace(/{ORDER_NUMBER}/g, data.orderNumber.toString())
    .replace(/{ORDER_DATE}/g, data.orderDate)
    .replace(/{ORDER_TIME}/g, data.orderTime)
    .replace(/{ESTIMATED_TIME}/g, data.estimatedTime.toString())
    + '\n\n';

  // Ürünleri ekle
  data.items.forEach(item => {
    const itemText = template.item_format
      .replace(/{ITEM_NAME}/g, item.name)
      .replace(/{ITEM_DESCRIPTION}/g, item.description || '')
      .replace(/{QUANTITY}/g, item.quantity.toString())
      .replace(/{ITEM_PRICE}/g, item.price.toFixed(2))
      .replace(/{TOTAL_PRICE}/g, item.totalPrice.toFixed(2))
      .replace(/{OPTIONS}/g, item.options || '')
      .replace(/{NOTES}/g, item.notes || '');
    
    receipt += itemText + '\n';
  });

  // Alt bilgi
  receipt += '\n' + template.footer_text
    .replace(/{RESTAURANT_NAME}/g, data.restaurantName)
    .replace(/{TABLE_NUMBER}/g, data.tableNumber || 'N/A')
    .replace(/{ORDER_NUMBER}/g, data.orderNumber.toString())
    .replace(/{ORDER_DATE}/g, data.orderDate)
    .replace(/{ORDER_TIME}/g, data.orderTime)
    .replace(/{ESTIMATED_TIME}/g, data.estimatedTime.toString());

  return receipt;
}

export async function sendToPrinter(printerId: string, receiptText: string): Promise<boolean> {
  try {
    // Yazıcı bilgilerini al
    const printers = await query(`
      SELECT * FROM printers
      WHERE id = @printerId AND is_active = 1
    `, { printerId });

    if (printers.length === 0) {
      console.error('Printer not found:', printerId);
      return false;
    }

    const printer = printers[0];
    
    // Burada gerçek yazıcıya gönderme işlemi yapılacak
    // Şimdilik sadece console'a yazdırıyoruz
    console.log(`\n=== YAZICI: ${printer.name} (${printer.location}) ===`);
    console.log(receiptText);
    console.log('=== FİŞ SONU ===\n');
    
    // Gerçek implementasyon için ESC/POS kütüphanesi kullanılabilir
    // Örnek: const escpos = require('escpos');
    // const device = new escpos.Network(printer.ip_address, printer.port);
    // const printerDevice = new escpos.Printer(device);
    // printerDevice.text(receiptText).cut().close();
    
    return true;
  } catch (error) {
    console.error('Error sending to printer:', error);
    return false;
  }
}

export async function printOrder(order: any): Promise<void> {
  try {
    // Sipariş ürünlerini grupla (yazıcıya göre)
    const printerGroups: { [key: string]: any[] } = {};
    
    for (const item of order.items) {
      const printerId = await getPrinterForProduct(item.product.id);
      
      if (printerId) {
        if (!printerGroups[printerId]) {
          printerGroups[printerId] = [];
        }
        printerGroups[printerId].push(item);
      }
    }

    // Her yazıcı için fiş oluştur ve gönder
    for (const [printerId, items] of Object.entries(printerGroups)) {
      const template = await getReceiptTemplate(printerId);
      
      if (template) {
        const receiptData: ReceiptData = {
          orderNumber: order.orderNumber,
          tableNumber: order.customerInfo?.tableNumber,
          items: items.map((item: any) => ({
            name: item.product.name,
            description: item.product.description,
            quantity: item.quantity,
            price: item.product.price,
            totalPrice: item.product.price * item.quantity,
            options: item.selectedOptions ? Object.entries(item.selectedOptions)
              .map(([key, value]) => `${key}: ${value}`).join(', ') : '',
            notes: item.notes
          })),
          orderDate: new Date(order.createdAt).toLocaleDateString('tr-TR'),
          orderTime: new Date(order.createdAt).toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          estimatedTime: order.estimatedTime || 15,
          restaurantName: 'PineResto'
        };

        const receiptText = formatReceipt(template, receiptData);
        await sendToPrinter(printerId, receiptText);
      }
    }
  } catch (error) {
    console.error('Error printing order:', error);
  }
}




