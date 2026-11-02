import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';
import type { Review, Complaint } from '../../types';
import { MessageSquare, ArrowLeft, Star, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReviewsComplaints: React.FC = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>(() => StorageService.getReviews());
  const [complaints, setComplaints] = useState<Complaint[]>(() => StorageService.getComplaints());
  const [activeTab, setActiveTab] = useState<'complaints' | 'reviews'>('complaints');

  const handleResolveComplaint = (id: string) => {
    const notes = prompt('Enter resolution notes for customer (e.g. Apologized & issued promo code):');
    if (notes) {
      StorageService.updateComplaintStatus(id, 'Resolved', notes);
      setComplaints(StorageService.getComplaints());
      showToast('Complaint resolved and marked in audit records', 'success');
    }
  };

  const handleInvestigateComplaint = (id: string) => {
    StorageService.updateComplaintStatus(id, 'Investigating');
    setComplaints(StorageService.getComplaints());
    showToast('Complaint set to Investigating', 'info');
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
            <MessageSquare className="w-7 h-7 text-purple-700" />
            <span>Customer Complaints & Review Moderation</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Resolve student order disputes and audit verified food reviews.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-cream-100 p-1 rounded-2xl border border-amber-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'complaints'
                ? 'bg-brand-charcoal text-white shadow-sm'
                : 'text-gray-600 hover:text-brand-charcoal'
            }`}
          >
            Complaints ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'reviews'
                ? 'bg-brand-charcoal text-white shadow-sm'
                : 'text-gray-600 hover:text-brand-charcoal'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>
      </div>

      {/* Complaints View */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {complaints.length > 0 ? (
            complaints.map(comp => (
              <div
                key={comp.id}
                className="bg-white rounded-3xl p-6 border border-amber-100 shadow-soft space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm text-brand-charcoal">
                      Order #{comp.orderId} — {comp.subject}
                    </span>
                    <p className="text-xs text-gray-400">
                      Filed by {comp.customerName} ({comp.customerEmail}) on {new Date(comp.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold self-start sm:self-auto ${
                    comp.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : comp.status === 'Investigating'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {comp.status}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed bg-cream-50 p-3 rounded-xl border border-amber-100">
                  "{comp.description}"
                </p>

                {comp.resolutionNotes && (
                  <div className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <strong>Admin Resolution Notes:</strong> {comp.resolutionNotes}
                  </div>
                )}

                {comp.status !== 'Resolved' && (
                  <div className="pt-2 flex justify-end gap-2">
                    {comp.status === 'Pending' && (
                      <button
                        onClick={() => handleInvestigateComplaint(comp.id)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold"
                      >
                        Start Investigation
                      </button>
                    )}
                    <button
                      onClick={() => handleResolveComplaint(comp.id)}
                      className="px-4 py-1.5 bg-brand-green hover:bg-brand-green-hover text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      Resolve & Add Notes
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 text-center py-8">No open complaints reported.</p>
          )}
        </div>
      )}

      {/* Reviews View */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map(rev => (
            <div key={rev.id} className="bg-white rounded-3xl p-5 border border-amber-100 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-brand-charcoal">{rev.foodName}</h4>
                  <span className="text-[10px] text-gray-400">Order #{rev.orderId}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-600 italic">
                "{rev.comment}"
              </p>

              <div className="pt-2 border-t border-gray-100 text-[10px] text-gray-400 flex justify-between">
                <span>By {rev.customerName}</span>
                <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
