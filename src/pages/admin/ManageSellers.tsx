import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';
import type { UserProfile } from '../../types';
import { Store, ArrowLeft, Search, CheckCircle2, XCircle, ShieldCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManageSellers: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>(() => StorageService.getUsers());
  const [search, setSearch] = useState('');

  const sellers = users.filter(u => u.role === 'seller').filter(s => {
    if (search.trim()) {
      return (
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.businessName && s.businessName.toLowerCase().includes(search.toLowerCase())) ||
        s.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  const handleVerification = (seller: UserProfile, status: 'Verified' | 'Rejected') => {
    const updated: UserProfile = {
      ...seller,
      sellerVerificationStatus: status,
    };
    StorageService.updateUser(updated);
    setUsers(StorageService.getUsers());
    showToast(`${seller.businessName || seller.name} verification status set to "${status}"`, 'success');
  };

  const handleToggleActive = (seller: UserProfile) => {
    const updated = { ...seller, isActive: !seller.isActive };
    StorageService.updateUser(updated);
    setUsers(StorageService.getUsers());
    showToast(`Store ${seller.businessName || seller.name} is now ${updated.isActive ? 'Active' : 'Deactivated'}`, 'info');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <Link
            to="/admin/dashboard"
            className="text-xs font-bold text-gray-500 hover:text-brand-orange flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight flex items-center gap-2">
            <Store className="w-7 h-7 text-brand-green" />
            <span>Manage Sellers & Home Cooks ({sellers.length})</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Approve home cook registrations and audit campus kitchen partner credentials.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search kitchen or chef..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-amber-200 rounded-xl text-xs text-brand-charcoal"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-50 text-gray-500 font-bold uppercase border-y border-gray-100">
              <tr>
                <th className="py-3 px-4">Kitchen Brand</th>
                <th className="py-3 px-4">Chef & Contact</th>
                <th className="py-3 px-4">Campus Vicinity</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sellers.map(s => {
                const isPending = s.sellerVerificationStatus === 'Pending';

                return (
                  <tr key={s.id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                          {s.businessName?.charAt(0) || 'K'}
                        </div>
                        <div>
                          <span className="font-bold text-brand-charcoal block">
                            {s.businessName || 'Home Kitchen'}
                          </span>
                          <span className="text-[10px] text-gray-400">ID: {s.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-brand-charcoal">{s.name}</p>
                      <p className="text-[11px] text-gray-400">{s.phone}</p>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">
                      {s.businessAddress || 'Campus Vicinity'}
                    </td>
                    <td className="py-3.5 px-4">
                      {s.sellerVerificationStatus === 'Verified' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : s.sellerVerificationStatus === 'Pending' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1 w-max animate-pulse">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1 w-max">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {s.isActive ? (
                        <span className="text-[11px] font-semibold text-emerald-700">Active</span>
                      ) : (
                        <span className="text-[11px] font-semibold text-red-600">Paused</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleVerification(s, 'Verified')}
                            className="px-2.5 py-1 bg-brand-green hover:bg-brand-green-hover text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerification(s, 'Rejected')}
                            className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleToggleActive(s)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium"
                      >
                        {s.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
