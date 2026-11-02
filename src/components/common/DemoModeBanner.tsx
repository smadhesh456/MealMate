import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User, Store, RefreshCw } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';

export const DemoModeBanner: React.FC = () => {
  const { role, switchRole, isSupabase } = useAuth();
  const { showToast } = useToast();

  const handleReset = () => {
    if (window.confirm('Reset all sample data, orders, and listings back to original 20-item catalogue?')) {
      StorageService.resetToDefaults();
      showToast('Sample catalog and demo data reset successfully!', 'success');
      window.location.reload();
    }
  };

  return (
    <aside aria-label="Demo Mode and Role Controls" className="bg-brand-charcoal text-cream-100 text-xs py-1.5 px-4 border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400">
            {isSupabase ? 'Supabase Connected' : 'MealMate Demo Mode'}
          </span>
          <span className="text-gray-400 hidden sm:inline">|</span>
          <span className="text-gray-400 hidden md:inline">
            College Project System — Cash on Delivery only
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400 hidden sm:inline">Active Role:</span>
          <div className="inline-flex rounded-lg bg-gray-800 p-0.5 border border-gray-700">
            <button
              onClick={() => switchRole('customer')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                role === 'customer' 
                  ? 'bg-brand-orange text-white shadow-sm' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <User className="w-3 h-3" />
              Customer
            </button>
            <button
              onClick={() => switchRole('seller')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                role === 'seller' 
                  ? 'bg-brand-green text-white shadow-sm' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Store className="w-3 h-3" />
              Seller
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                role === 'admin' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              Admin
            </button>
          </div>

          <button
            onClick={handleReset}
            title="Reset catalog & mock data to defaults"
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors ml-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
