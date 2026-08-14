import React, { useState, useEffect } from 'react';
import api from '../../Landing/services/api';

const DonationMonitor = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    donations: true,
    contributions: true,
    pendingPayments: true,
    reports: true,
  });
  const [activeTab, setActiveTab] = useState<'donations' | 'contributions' | 'pendingPayments' | 'reports'>('donations');

  // Fetch data for all tabs on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(prev => ({ ...prev, donations: true, contributions: true, pendingPayments: true, reports: true }));
      try {
        const [donationsData, contributionsData, pendingPaymentsData] = await Promise.all([
          api.getDonations(),
          api.getContributions(),
          api.getPendingPayments(),
        ]);
        setDonations(donationsData);
        setContributions(contributionsData);
        setPendingPayments(pendingPaymentsData);
      } catch (err) {
        console.error('Failed to fetch treasury data:', err);
      } finally {
        setLoading(prev => ({
          ...prev,
          donations: false,
          contributions: false,
          pendingPayments: false,
          reports: false, // reports computed from other data
        }));
      }
    };

    fetchData();
  }, []);

  // Compute reports data
  const reportData = {
    totalDonations: donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0),
    totalContributions: contributions.reduce((sum, c) => sum + (Number(c.amount) || 0), 0),
    totalPending: pendingPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
    settledToday: pendingPayments.filter(p => p.status === 'settled' && new Date(p.updated_at).toDateString() === new Date().toDateString()).length,
    // Add more metrics as needed
  };

  // Handlers for pending payments
  const handleSettle = async (id: string | number, settledBy: string) => {
    try {
      await api.settlePendingPayment(id, settledBy);
      // Refetch pending payments
      const updated = await api.getPendingPayments();
      setPendingPayments(updated);
    } catch (err) {
      console.error('Failed to settle payment:', err);
    }
  };

  const handleCancel = async (id: string | number) => {
    try {
      await api.cancelPendingPayment(id);
      const updated = await api.getPendingPayments();
      setPendingPayments(updated);
    } catch (err) {
      console.error('Failed to cancel payment:', err);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => `KES ${Number(amount).toLocaleString()}`;

  // Format date
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Treasury Dashboard</h1>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'donations'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('donations')}
        >
          Donations
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ml-4 ${
            activeTab === 'contributions'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('contributions')}
        >
          Contributions
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ml-4 ${
            activeTab === 'pendingPayments'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('pendingPayments')}
        >
          Pending Payments
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ml-4 ${
            activeTab === 'reports'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'donations' && (
        <div className="space-y-6">
          {loading.donations ? (
            <p className="text-center py-8 text-gray-500">Loading donations...</p>
          ) : donations.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No donations found.</p>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Donations</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donations
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .slice(0, 20)
                      .map((d, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(d.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(Number(d.amount))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {d.donorName || d.user_id || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              d.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : d.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {d.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {d.checkout_id || '—'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'contributions' && (
        <div className="space-y-6">
          {loading.contributions ? (
            <p className="text-center py-8 text-gray-500">Loading contributions...</p>
          ) : contributions.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No contributions found.</p>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Contributions</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contributions
                      .sort((a, b) => new Date(b.contribution_date).getTime() - new Date(a.contribution_date).getTime())
                      .slice(0, 20)
                      .map((c, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(c.contribution_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(Number(c.amount))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {c.member_id || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {c.contribution_type?.charAt(0).toUpperCase() + c.contribution_type?.slice(1) || 'Offering'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pendingPayments' && (
        <div className="space-y-6">
          {loading.pendingPayments ? (
            <p className="text-center py-8 text-gray-500">Loading pending payments...</p>
          ) : pendingPayments.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No pending payments found.</p>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Pending Payments</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumuiya</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingPayments
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((p, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(p.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(Number(p.amount))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {p.member_id || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {p.jumuiya_id || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                            {p.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    const settledBy = prompt('Enter your name for settlement:') || 'Treasurer';
                                    if (settledBy) handleSettle(p.id, settledBy);
                                  }}
                                  className="px-3 py-1 text-sm font-semibold text-green-600 bg-green-50 hover:bg-green-100 rounded"
                                >
                                  Settle
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('Are you sure you want to cancel this payment?')) {
                                      handleCancel(p.id);
                                    }
                                  }}
                                  className="px-3 py-1 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {p.status !== 'pending' && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          {loading.reports ? (
            <p className="text-center py-8 text-gray-500">Loading reports...</p>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Financial Reports</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Donations */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-left text-xs font-medium text-gray-500 mb-2">Total Donations</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalDonations)}</p>
                </div>
                {/* Total Contributions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-left text-xs font-medium text-gray-500 mb-2">Total Contributions</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalContributions)}</p>
                </div>
                {/* Total Pending */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-left text-xs font-medium text-gray-500 mb-2">Total Pending Payments</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalPending)}</p>
                </div>
                {/* Settled Today */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-left text-xs font-medium text-gray-500 mb-2">Settled Today</h3>
                  <p className="text-2xl font-bold text-gray-900">{reportData.settledToday}</p>
                </div>
              </div>
              
              {/* Additional charts or details can go here */}
              <div className="mt-8">
                <h3 className="text-left text-lg font-semibold text-gray-700 mb-4">Export Options</h3>
                <div className="flex space-x-4">
<button
                     onClick={() => {
                       // Implement CSV export for donations
                       const csv = [
                         ['Date', 'Amount', 'Donor', 'Status', 'Reference'],
                         ...donations.map(d => [
                           formatDate(d.created_at),
                           formatCurrency(Number(d.amount)),
                           d.donorName || d.user_id || '—',
                           d.status,
                           d.checkout_id || '—',
                         ]),
                       ]
                         .map(row => row.map(field => `"${field}"`).join(','))
                         .join('\n');
                       const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                       const url = URL.createObjectURL(blob);
                       const link = document.createElement('a');
                       link.setAttribute('href', url);
                       link.setAttribute('download', 'donations.csv');
                       link.style.visibility = 'hidden';
                       document.body.appendChild(link);
                       link.click();
                       document.body.removeChild(link);
                     }}
                     className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                   >
                     Export Donations CSV
                   </button>
<button
                     onClick={() => {
                       // Implement CSV export for contributions
                       const csv = [
                         ['Date', 'Amount', 'Member', 'Type'],
                         ...contributions.map(c => [
                           formatDate(c.contribution_date),
                           formatCurrency(Number(c.amount)),
                           c.member_id || '—',
                           c.contribution_type?.charAt(0).toUpperCase() + c.contribution_type?.slice(1) || 'Offering',
                         ]),
                       ]
                         .map(row => row.map(field => `"${field}"`).join(','))
                         .join('\n');
                       const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                       const url = URL.createObjectURL(blob);
                       const link = document.createElement('a');
                       link.setAttribute('href', url);
                       link.setAttribute('download', 'contributions.csv');
                       link.style.visibility = 'hidden';
                       document.body.appendChild(link);
                       link.click();
                       document.body.removeChild(link);
                     }}
                     className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                   >
                     Export Contributions CSV
                   </button>
<button
                     onClick={() => {
                       // Implement CSV export for pending payments
                       const csv = [
                         ['Date', 'Amount', 'Member', 'Jumuiya', 'Status'],
                         ...pendingPayments.map(p => [
                           formatDate(p.created_at),
                           formatCurrency(Number(p.amount)),
                           p.member_id || '—',
                           p.jumuiya_id || '—',
                           p.status,
                         ]),
                       ]
                         .map(row => row.map(field => `"${field}"`).join(','))
                         .join('\n');
                       const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                       const url = URL.createObjectURL(blob);
                       const link = document.createElement('a');
                       link.setAttribute('href', url);
                       link.setAttribute('download', 'pending_payments.csv');
                       link.style.visibility = 'hidden';
                       document.body.appendChild(link);
                       link.click();
                       document.body.removeChild(link);
                     }}
                     className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                   >
                     Export Pending Payments CSV
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DonationMonitor;