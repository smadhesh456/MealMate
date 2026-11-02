import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Review } from '../types';
import { 
  Star, 
  Store, 
  Clock, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  Share2, 
  MessageSquare,
  CheckCircle2,
  Utensils
} from 'lucide-react';

export const MealDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const meal = useMemo(() => StorageService.getMealById(id || ''), [id]);
  const { items, addToCart, updateQuantity, isItemInCutoff } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<Review[]>(() => {
    return StorageService.getReviews(id);
  });

  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);

  if (!meal) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-brand-charcoal">Meal Not Found</h2>
        <p className="text-xs text-gray-500">The dish you requested could not be located in our catalogue.</p>
        <Link to="/explore" className="px-5 py-2.5 bg-brand-orange text-white rounded-xl text-xs font-bold inline-block">
          Explore All Meals
        </Link>
      </div>
    );
  }

  const cartItem = items.find(i => i.foodItem.id === meal.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const isCutoff = isItemInCutoff(meal);
  const isSoldOut = !meal.isAvailable || meal.stockQuantity <= 0;
  const isDisabled = isSoldOut || isCutoff;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      showToast('Please enter your review text', 'warning');
      return;
    }

    const createdReview: Review = {
      id: `rev-${Date.now()}`,
      orderId: `MM-SAMPLE-ORD`,
      foodId: meal.id,
      foodName: meal.name,
      customerId: user?.id || 'demo-user',
      customerName: user?.name || 'Verified Student Customer',
      rating: newRating,
      comment: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    StorageService.addReview(createdReview);
    setReviews([createdReview, ...reviews]);
    setNewComment('');
    setShowReviewForm(false);
    showToast('Your review has been submitted successfully!', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-orange transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Meals</span>
        </Link>
      </div>

      {/* Main Meal Header Card */}
      <div className="bg-white rounded-3xl overflow-hidden border border-amber-100 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Food Image */}
          <div className="relative aspect-square md:aspect-auto h-full min-h-[340px] bg-amber-50">
            <img
              src={meal.image}
              alt={meal.name}
              className={`w-full h-full object-cover ${isDisabled ? 'grayscale opacity-70' : ''}`}
            />
            {/* Veg / Non-Veg Tag */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-2 rounded-xl shadow-md flex items-center gap-2">
              <span className={`w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center ${
                meal.isVeg ? 'border-green-600' : 'border-red-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${meal.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
              </span>
              <span className="text-xs font-bold text-brand-charcoal">
                {meal.isVeg ? 'Pure Veg' : 'Non-Veg'}
              </span>
            </div>

            {/* Module badge */}
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-charcoal text-white shadow-md">
                {meal.module}
              </span>
            </div>
          </div>

          {/* Details & Cart Action */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Category: {meal.category}
                </span>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-1 rounded-lg text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{meal.rating.toFixed(1)}</span>
                  <span className="text-gray-400 font-normal">({meal.reviewCount} reviews)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
                {meal.name}
              </h1>

              {/* Cook / Restaurant info */}
              <div className="flex items-center gap-2 text-xs text-gray-600 py-1 border-b border-gray-100">
                <Store className="w-4 h-4 text-brand-green" />
                <span className="font-semibold">{meal.sellerName}</span>
                <span className="text-gray-400">•</span>
                <span>Prep: ~{meal.prepTimeMinutes} mins</span>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
                {meal.description}
              </p>

              {/* Stock and Availability alerts */}
              {isDisabled ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-bold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {isSoldOut ? 'Sold out! Currently out of stock.' : 'SaveMyMeal cutoff time has passed for this dish.'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Available for Order
                  </span>
                  <span className="text-gray-500">
                    Remaining portions: <strong>{meal.stockQuantity}</strong>
                  </span>
                </div>
              )}

              {/* SaveMyMeal Cutoff info */}
              {meal.module === 'SaveMyMeal' && meal.cutoffTime && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Clock className="w-4 h-4 text-rose-600" />
                    <span>Rescue Cutoff: {new Date(meal.cutoffTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] text-rose-600">
                    Orders lock automatically when cutoff expires to guarantee freshly packed rescue portions.
                  </p>
                </div>
              )}
            </div>

            {/* Price & Action Box */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-brand-charcoal">
                    ₹{meal.price}
                  </span>
                  {meal.originalPrice && meal.originalPrice > meal.price && (
                    <span className="text-sm text-gray-400 line-through font-semibold">
                      ₹{meal.originalPrice}
                    </span>
                  )}
                </div>
                {meal.originalPrice && meal.originalPrice > meal.price && (
                  <span className="text-xs text-brand-green font-bold">
                    Save ₹{meal.originalPrice - meal.price} ({meal.discountPercentage}% OFF)
                  </span>
                )}
              </div>

              {/* Add to Cart Controls */}
              <div>
                {qtyInCart > 0 ? (
                  <div className="flex items-center gap-3 bg-brand-orange text-white rounded-2xl px-4 py-2.5 shadow-md">
                    <button
                      onClick={() => updateQuantity(meal.id, qtyInCart - 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-extrabold w-6 text-center">{qtyInCart}</span>
                    <button
                      onClick={() => addToCart(meal, 1)}
                      disabled={qtyInCart >= meal.stockQuantity || isDisabled}
                      className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(meal, 1)}
                    disabled={isDisabled}
                    className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-md transition-all ${
                      isDisabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
                        : 'bg-brand-orange text-white hover:bg-brand-orange-hover hover:scale-102'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>ADD TO CART</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-brand-charcoal flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-orange" />
              <span>Customer Reviews & Ratings</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              *Clearly labeled verified student customer feedback for this dish.
            </p>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-brand-charcoal rounded-xl text-xs font-bold border border-amber-200 transition-colors"
          >
            {showReviewForm ? 'Cancel Review' : '+ Write a Review'}
          </button>
        </div>

        {/* Add Review Form */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="bg-cream-50 p-5 rounded-2xl border border-amber-200 space-y-4 animate-in fade-in">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">
              Submit Your Honest Feedback
            </h3>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Your Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-gray-600 ml-2">
                  {newRating} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Your Comments & Experience
              </label>
              <textarea
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="How was the taste, freshness, and packaging?"
                className="w-full p-3 bg-white border border-amber-200 rounded-xl text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-orange text-white text-xs font-bold rounded-xl shadow-sm hover:bg-brand-orange-hover"
            >
              Post Review
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map(r => (
              <div key={r.id} className="p-4 rounded-2xl bg-cream-50/50 border border-amber-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold text-xs">
                      {r.customerName.charAt(0)}
                    </span>
                    <span className="font-bold text-xs text-brand-charcoal">{r.customerName}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                      Verified Buyer
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed pl-9">
                  "{r.comment}"
                </p>
                <div className="text-[10px] text-gray-400 pl-9">
                  Reviewed on {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 italic">No reviews written yet. Be the first to try this dish!</p>
          )}
        </div>

      </div>

    </div>
  );
};
