import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { StorageService } from '../services/storage';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';

export const ContactUs: React.FC = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill all required fields', 'warning');
      return;
    }

    StorageService.addComplaint({
      id: `inq-${Date.now()}`,
      orderId: 'GENERAL-INQUIRY',
      customerId: 'guest',
      customerName: name.trim(),
      customerEmail: email.trim(),
      subject: subject.trim() || 'General Inquiry',
      description: message.trim(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
    });

    setIsSent(true);
    showToast('Your message has been sent to the MealMate team!', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-charcoal tracking-tight">
          Help & Contact Support
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          Have questions about your meal subscription, food deliveries, or joining as a home cook? We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Contact Cards */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-soft space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-charcoal">
              Campus Support Office
            </h2>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
                <span>Student Activity Center, Level 2, Room 204, College Campus, Chennai - 600025</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span>support@mealmate.in</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>+91 98765 43210 (Campus Helpline)</span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Mon – Sun: 7:00 AM – 10:30 PM</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 text-xs text-emerald-900 space-y-2">
            <h3 className="font-bold">Home Cook & Seller Inquiries</h3>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Want to register your home kitchen for HomePlate? Call our seller onboarding team or register online through our partner portal.
            </p>
          </div>

        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-card space-y-5">
          <h2 className="text-base font-extrabold text-brand-charcoal flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-orange" />
            <span>Send Us a Message</span>
          </h2>

          {isSent ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <span className="text-3xl">✉️</span>
              <h3 className="font-bold text-emerald-900 text-sm">Message Received!</h3>
              <p className="text-xs text-emerald-700">
                Thank you for contacting MealMate. Our campus student response team will reply to {email} shortly.
              </p>
              <button
                onClick={() => setIsSent(false)}
                className="mt-3 px-4 py-2 bg-brand-green text-white rounded-xl text-xs font-bold"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@college.edu"
                    className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Question about 30-Day Lunch Pass"
                  className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Message *</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you today?"
                  className="w-full p-2.5 bg-cream-50 border border-amber-200 rounded-xl text-xs text-brand-charcoal"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Message</span>
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
