import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';
import type { UserProfile } from '../../types';
import { Users, ArrowLeft, Search, CheckCircle2, XCircle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManageCustomers: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>(() => StorageService.getUsers());
  const [search, setSearch] = useState('');

  const customers = users.filter(u => u.role === 'customer').filter(c => {
    if (search.trim()) {
      return (
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
      );
    }
    return true;
  });

  const handleToggleActive = (user: UserProfile) => {
    const updated = { ...user, isActive: !user.isActive };
    StorageService.updateUser(updated);
    setUsers(StorageService.getUsers());
    showToast(`Account for ${user.name} is now ${updated.isActive ? 'Active' : 'Deactivated'}`, 'info');
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
            <Users className="w-7 h-7 text-purple-700" />
            <span>Manage Customers ({customers.length})</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Oversee registered student and campus customer accounts.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-amber-200 rounded-xl text-xs text-brand-charcoal"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-50 text-gray-500 font-bold uppercase border-y border-gray-100">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-cream-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 font-bold flex items-center justify-center">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-brand-charcoal block">{c.name}</span>
                        <span className="text-[10px] text-gray-400">ID: {c.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-brand-charcoal">{c.email}</p>
                    <p className="text-[11px] text-gray-400">{c.phone}</p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-700 capitalize">{c.role}</td>
                  <td className="py-3.5 px-4 text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    {c.isActive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                        Deactivated
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleActive(c)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        c.isActive
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {c.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
