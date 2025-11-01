'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiClock, FiUsers, FiDollarSign, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { TableHistory, TableSession } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function TableHistoryPage() {
  const [tableHistories, setTableHistories] = useState<TableHistory[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTableHistory();
  }, [selectedDate]);

  const fetchTableHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/table-history?date=${selectedDate}`);
      const data = await response.json();
      setTableHistories(data);
    } catch (error) {
      console.error('Masa geçmişi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}s ${mins}dk`;
    }
    return `${mins}dk`;
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';
  };

  const totalStats = tableHistories.reduce((acc, history) => {
    acc.totalSessions += history.totalSessions;
    acc.totalRevenue += history.totalRevenue;
    acc.totalDuration += history.averageDuration * history.totalSessions;
    return acc;
  }, { totalSessions: 0, totalRevenue: 0, totalDuration: 0 });

  return (
    <ProtectedRoute allowedRoles={['admin', 'manager', 'waiter']}>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-[#6A8BA3] shadow-lg">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/mobile/waiter" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <FiArrowLeft className="w-6 h-6 text-white" />
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-white">Masa Geçmişi</h1>
                  <p className="text-sm text-gray-200 font-medium">Pine Resto</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-white text-sm font-medium border-none outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{totalStats.totalSessions}</div>
                  <div className="text-sm text-gray-600">Toplam Oturum</div>
                </div>
                <FiUsers className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">€{totalStats.totalRevenue.toFixed(0)}</div>
                  <div className="text-sm text-gray-600">Toplam Ciro</div>
                </div>
                <FiDollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {totalStats.totalSessions > 0 ? formatDuration(Math.round(totalStats.totalDuration / totalStats.totalSessions)) : '0dk'}
                  </div>
                  <div className="text-sm text-gray-600">Ortalama Süre</div>
                </div>
                <FiClock className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Table Histories */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {tableHistories.map((history) => (
                <div key={history.tableId} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">{history.tableNumber}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Masa {history.tableNumber}</h3>
                          <p className="text-sm text-gray-600">{history.totalSessions} oturum</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">€{history.totalRevenue.toFixed(0)}</div>
                        <div className="text-sm text-gray-600">Toplam Ciro</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Ortalama Süre</div>
                        <div className="text-lg font-semibold text-gray-900">{formatDuration(history.averageDuration)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Ortalama Müşteri</div>
                        <div className="text-lg font-semibold text-gray-900">{history.averageCustomerCount}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Toplam Sipariş</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {history.sessions.reduce((sum, s) => sum + s.orderCount, 0)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Sessions */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Oturum Detayları</h4>
                      {history.sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                              {session.status === 'active' ? 'Aktif' : 'Tamamlandı'}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatTime(session.startTime)} - {session.endTime ? formatTime(session.endTime) : 'Devam ediyor'}
                              </div>
                              <div className="text-xs text-gray-600">
                                {session.waiterName} • {session.customerCount} kişi
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">
                              {session.duration ? formatDuration(session.duration) : '-'}
                            </div>
                            <div className="text-xs text-gray-600">€{session.totalAmount.toFixed(0)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {tableHistories.length === 0 && (
                <div className="text-center py-12">
                  <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Bu tarihte oturum bulunamadı</h3>
                  <p className="text-gray-500">Seçilen tarihte hiçbir masada oturum gerçekleşmemiş.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}






