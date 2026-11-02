import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Store, ShieldCheck, MapPin, Phone, Mail, User, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SellerProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [businessName, setBusinessName] = useState(user?.businessName || 'Annapoorna Home Kitchen');
  const [businessAddress, setBusinessAddress] = useState(user?.businessAddress || '14, Gandhi Nagar, Near College Gate 2');
  const [name, setName] = useState(user?.name || 'Annapoorna Devi');
  const [phone, setPhone] = useState(user?.phone || '+91 98401 23456');
  const [email, setEmail] = useState(user?.email || 'annapoorna@mealmate.in');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      businessName: businessName.trim(),
      businessAddress: businessAddress.trim(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
    });
    showToast('Kitchen profile details updated successfully!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <Link
          to="/seller/dashboard"
          className="text-xs font-bold text-gray-500 hover:text-brand-orange flex items-center gap-1 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight flex items-center gap-2">
          <Store className="w-7 h-7 text-brand-green" />
          <span>Kitchen Business Profile</span>
        </h1>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-2xl">
            {businessName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-charcoal">{businessName}</h2>
            <p className="text-xs text-gray-500">{businessAddress}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Campus Verified Seller</span>
          </span>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-soft space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-charcoal">
          Update Kitchen & Contact Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Kitchen Brand Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Chef / Contact Person Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Kitchen Physical Location & Landmark
          </label>
          <input
            type="text"
            value={businessAddress}
            onChange={(e) => setBusinessAddress(e.target.value)}
            className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
            required
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Kitchen Profile</span>
        </button>
      </form>

    </div>
  );
};
