import React from 'react';
import type { OrderStatus } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  ShoppingBag, 
  Bike, 
  Home, 
  XCircle 
} from 'lucide-react';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  statusTimestamps?: Record<string, string>;
  cancellationReason?: string;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ 
  currentStatus, 
  statusTimestamps = {},
  cancellationReason 
}) => {
  const steps: { status: OrderStatus; label: string; icon: React.FC<{ className?: string }> }[] = [
    { status: 'Order Placed', label: 'Order Placed', icon: Clock },
    { status: 'Order Confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { status: 'Preparing', label: 'In Kitchen', icon: ChefHat },
    { status: 'Ready for Pickup', label: 'Packed & Ready', icon: ShoppingBag },
    { status: 'Out for Delivery', label: 'Out for Delivery', icon: Bike },
    { status: 'Delivered', label: 'Delivered', icon: Home },
  ];

  if (currentStatus === 'Cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-left">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-xl text-red-600 mt-0.5">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-red-700 text-sm">Order Cancelled</h4>
            <p className="text-xs text-red-600 mt-1">
              Reason: {cancellationReason || 'Cancelled by seller or administrator.'}
            </p>
            {statusTimestamps['Cancelled'] && (
              <span className="text-[11px] text-gray-500 mt-1 block">
                Time: {new Date(statusTimestamps['Cancelled']).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex(s => s.status === currentStatus);

  return (
    <div className="py-2">
      <div className="relative">
        
        {/* Background track */}
        <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 -z-0 hidden md:block" />
        
        {/* Active progress bar */}
        <div 
          className="absolute top-5 left-5 h-1 bg-brand-green -z-0 hidden md:block transition-all duration-500" 
          style={{ width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 90)}%` }}
        />

        {/* Steps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative z-10">
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const Icon = step.icon;
            const timestamp = statusTimestamps[step.status];

            return (
              <div 
                key={step.status} 
                className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                  isCurrent ? 'bg-cream-100/90 border border-amber-200' : ''
                }`}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                    isCompleted
                      ? 'bg-brand-green text-white shadow-md'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <span className={`text-xs font-bold leading-tight ${
                  isCurrent ? 'text-brand-green' : isCompleted ? 'text-brand-charcoal' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>

                {timestamp ? (
                  <span className="text-[10px] text-gray-400 mt-1">
                    {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                ) : isCurrent ? (
                  <span className="text-[10px] text-brand-orange font-semibold mt-1">
                    In Progress
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-300 mt-1">Pending</span>
                )}
              </div>
            );
          })}
        </div>

      </div>

      <div className="mt-4 p-3 bg-cream-50 rounded-xl border border-amber-100 text-xs text-gray-600 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand-green animate-ping" />
        <span>
          <strong>Manual Verification:</strong> Status is updated directly by home cooks and campus dispatchers without GPS tracking.
        </span>
      </div>
    </div>
  );
};
