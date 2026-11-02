import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import type { Address } from '../types';
import { MapPin, Plus, Trash2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SavedAddresses: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>(() => StorageService.getAddresses());
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Chennai');
  const [pincode, setPincode] = useState('600025');
  const [type, setType] = useState<'Home' | 'Work' | 'Other'>('Home');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!line1.trim() || !city.trim() || !pincode.trim()) {
      showToast('Please fill all required fields', 'warning');
      return;
    }

    const created: Address = {
      id: `addr-${Date.now()}`,
      fullName: user?.name || 'Customer',
      phone: user?.phone || '+91 98765 43210',
      addressLine1: line1.trim(),
      addressLine2: line2.trim() || undefined,
      landmark: landmark.trim() || undefined,
      city: city.trim(),
      pincode: pincode.trim(),
      isDefault: addresses.length === 0,
      type,
    };

    StorageService.saveAddress(created);
    setAddresses(StorageService.getAddresses());
    setShowAddForm(false);
    setLine1('');
    setLine2('');
    setLandmark('');
    showToast('New delivery address saved!', 'success');
  };

  const handleSetDefault = (id: string) => {
    const target = addresses.find(a => a.id === id);
    if (target) {
      StorageService.saveAddress({ ...target, isDefault: true });
      setAddresses(StorageService.getAddresses());
      showToast('Default address updated', 'info');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this saved address?')) {
      StorageService.deleteAddress(id);
      setAddresses(StorageService.getAddresses());
      showToast('Address removed', 'info');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <Link
            to="/profile"
            className="text-xs font-bold text-gray-500 hover:text-brand-orange flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight flex items-center gap-2">
            <MapPin className="w-7 h-7 text-brand-green" />
            <span>Saved Delivery Addresses</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your campus hostel, department lab, or home delivery locations.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel' : 'Add New Address'}</span>
        </button>
      </div>

      {/* Add New Address Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-3xl p-6 border border-amber-200 shadow-soft space-y-4 animate-in fade-in">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-charcoal">
            Add New Campus Address
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Address Line 1 (Hostel Room, Block, Building) *
              </label>
              <input
                type="text"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                placeholder="e.g. Block C, Room 304"
                className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Address Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
              >
                <option value="Home">Home / Hostel</option>
                <option value="Work">College Lab / Dept</option>
                <option value="Other">Other Campus Spot</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Street / Area
              </label>
              <input
                type="text"
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                placeholder="e.g. Engineering College Campus"
                className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Landmark
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opp Central Library"
                className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-green text-white text-xs font-bold rounded-xl shadow-sm hover:bg-brand-green-hover"
          >
            Save Address
          </button>
        </form>
      )}

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map(addr => (
          <div
            key={addr.id}
            className={`bg-white rounded-3xl p-6 border-2 transition-all space-y-4 flex flex-col justify-between ${
              addr.isDefault ? 'border-brand-green shadow-soft bg-emerald-50/20' : 'border-amber-100 shadow-sm'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-brand-charcoal flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-orange" />
                  {addr.type}
                </span>
                {addr.isDefault && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Default Address
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                {addr.addressLine1}
                {addr.addressLine2 && <>, {addr.addressLine2}</>}
                {addr.landmark && <span className="block text-gray-400">Landmark: {addr.landmark}</span>}
                <span className="block font-medium text-brand-charcoal mt-1">
                  {addr.city} - {addr.pincode}
                </span>
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              {!addr.isDefault ? (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-xs font-bold text-brand-green hover:underline"
                >
                  Set as Default
                </button>
              ) : (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Primary
                </span>
              )}

              <button
                onClick={() => handleDelete(addr.id)}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                title="Delete address"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
