import { NextResponse } from 'next/server';
import { query } from '@/lib/mssql';

export async function GET() {
  try {
    // Toplam istatistikler
    const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)) as today_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'completed') as completed_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
        (SELECT COUNT(*) FROM [tables] WHERE status = 'occupied') as occupied_tables,
        (SELECT COUNT(*) FROM [tables]) as total_tables,
        (SELECT COUNT(*) FROM products WHERE is_active = 1) as active_products,
        (SELECT COUNT(*) FROM users WHERE role != 'customer') as staff_count
    `);

    // Günlük satış grafiği
    const dailySales = await query(`
      SELECT 
        CAST(created_at AS DATE) as date,
        COUNT(*) as order_count,
        SUM(total_amount) as total_revenue
      FROM orders 
      WHERE created_at >= DATEADD(day, -7, GETDATE())
      GROUP BY CAST(created_at AS DATE)
      ORDER BY date
    `);

    // En çok satan ürünler
    const topProducts = await query(`
      SELECT TOP 5
        p.name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total_price) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= DATEADD(day, -30, GETDATE())
      GROUP BY p.name
      ORDER BY total_sold DESC
    `);

    // Son siparişler
    const recentOrders = await query(`
      SELECT TOP 5
        o.id,
        o.order_number,
        o.customer_name,
        o.total_amount,
        o.status,
        o.order_type,
        o.table_id,
        o.created_at,
        t.number as table_number
      FROM orders o
      LEFT JOIN [tables] t ON o.table_id = t.id
      ORDER BY o.created_at DESC
    `);

    // Kategori bazlı satışlar
    const categorySales = await query(`
      SELECT 
        c.name as category_name,
        COUNT(DISTINCT o.id) as order_count,
        SUM(oi.total_price) as total_revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE o.created_at >= DATEADD(day, -30, GETDATE())
      GROUP BY c.name
      ORDER BY total_revenue DESC
    `);

    return NextResponse.json({
      stats: stats[0],
      dailySales,
      topProducts,
      recentOrders,
      categorySales
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}






