import { NextRequest, NextResponse } from 'next/server';
import { TableSession, TableHistory } from '@/types';

// Demo masa geçmişi verileri
let tableSessions: TableSession[] = [
  {
    id: 'session-1',
    tableId: '1',
    tableNumber: 1,
    waiterId: '2',
    waiterName: 'Ahmet Yılmaz',
    startTime: new Date('2024-01-15T10:30:00'),
    endTime: new Date('2024-01-15T12:15:00'),
    duration: 105, // 1 saat 45 dakika
    customerCount: 4,
    totalAmount: 320.00,
    orderCount: 3,
    status: 'completed',
    notes: 'Müşteriler çok memnun kaldı'
  },
  {
    id: 'session-2',
    tableId: '1',
    tableNumber: 1,
    waiterId: '2',
    waiterName: 'Ahmet Yılmaz',
    startTime: new Date('2024-01-15T13:00:00'),
    endTime: new Date('2024-01-15T14:30:00'),
    duration: 90,
    customerCount: 2,
    totalAmount: 180.00,
    orderCount: 2,
    status: 'completed'
  },
  {
    id: 'session-3',
    tableId: '2',
    tableNumber: 2,
    waiterId: '2',
    waiterName: 'Ahmet Yılmaz',
    startTime: new Date('2024-01-15T11:00:00'),
    endTime: new Date('2024-01-15T13:45:00'),
    duration: 165,
    customerCount: 6,
    totalAmount: 450.00,
    orderCount: 5,
    status: 'completed',
    notes: 'Doğum günü kutlaması'
  },
  {
    id: 'session-4',
    tableId: '3',
    tableNumber: 3,
    waiterId: '2',
    waiterName: 'Ahmet Yılmaz',
    startTime: new Date('2024-01-15T12:00:00'),
    endTime: undefined,
    duration: undefined,
    customerCount: 4,
    totalAmount: 0,
    orderCount: 0,
    status: 'active'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('tableId');
    const date = searchParams.get('date');

    let filteredSessions = tableSessions;

    // Masa ID'sine göre filtrele
    if (tableId) {
      filteredSessions = tableSessions.filter(session => session.tableId === tableId);
    }

    // Tarihe göre filtrele
    if (date) {
      const filterDate = new Date(date);
      filteredSessions = filteredSessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate.toDateString() === filterDate.toDateString();
      });
    }

    // Masa bazında grupla
    const tableHistories: TableHistory[] = [];
    const tableGroups = filteredSessions.reduce((acc, session) => {
      if (!acc[session.tableId]) {
        acc[session.tableId] = [];
      }
      acc[session.tableId].push(session);
      return acc;
    }, {} as Record<string, TableSession[]>);

    Object.entries(tableGroups).forEach(([tableId, sessions]) => {
      const completedSessions = sessions.filter(s => s.status === 'completed');
      const totalRevenue = completedSessions.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      const totalCustomers = completedSessions.reduce((sum, s) => sum + s.customerCount, 0);

      tableHistories.push({
        tableId,
        tableNumber: sessions[0].tableNumber,
        sessions: sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
        totalSessions: sessions.length,
        totalRevenue,
        averageDuration: completedSessions.length > 0 ? Math.round(totalDuration / completedSessions.length) : 0,
        averageCustomerCount: completedSessions.length > 0 ? Math.round(totalCustomers / completedSessions.length) : 0
      });
    });

    return NextResponse.json(tableHistories);
  } catch (error) {
    console.error('Masa geçmişi getirme hatası:', error);
    return NextResponse.json({ error: 'Masa geçmişi getirilemedi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tableId, tableNumber, waiterId, waiterName, customerCount, notes } = body;

    if (action === 'start') {
      // Yeni oturum başlat
      const newSession: TableSession = {
        id: `session-${Date.now()}`,
        tableId,
        tableNumber,
        waiterId,
        waiterName,
        startTime: new Date(),
        customerCount: customerCount || 1,
        totalAmount: 0,
        orderCount: 0,
        status: 'active',
        notes
      };

      tableSessions.push(newSession);
      return NextResponse.json(newSession);
    }

    if (action === 'end') {
      // Mevcut oturumu bitir
      const activeSession = tableSessions.find(s => s.tableId === tableId && s.status === 'active');
      if (!activeSession) {
        return NextResponse.json({ error: 'Aktif oturum bulunamadı' }, { status: 404 });
      }

      activeSession.endTime = new Date();
      activeSession.duration = Math.round((activeSession.endTime.getTime() - activeSession.startTime.getTime()) / (1000 * 60));
      activeSession.status = 'completed';

      return NextResponse.json(activeSession);
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error) {
    console.error('Masa oturum işlemi hatası:', error);
    return NextResponse.json({ error: 'İşlem gerçekleştirilemedi' }, { status: 500 });
  }
}






