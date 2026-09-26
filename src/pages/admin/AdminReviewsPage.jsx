import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
import { formatDate } from '../../utils/formatters';
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Filter,
  MessageSquare
} from 'lucide-react';

export default function AdminReviewsPage() {
  const { products, addToast } = useStore();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      try {
        const data = await adminApi.getReviews();
        if (isMounted) setReviews(data || []);
      } catch (e) {
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadReviews();
    return () => { isMounted = false; };
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminApi.updateReviewStatus(id, status);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      addToast('Review Moderated', `Review status set to ${status}.`, 'success');
    } catch (err) {
      addToast('Moderation Failed', err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await adminApi.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      addToast('Review Deleted', 'Review removed from database.', 'info');
    } catch (err) {
      addToast('Delete Failed', err.message, 'error');
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch =
      (r.user_name && r.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.title && r.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.comment && r.comment.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || (r.status || 'approved').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400 block mb-1">
            Shopper Sentiment & Moderation
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Review Moderation ({reviews.length})
          </h1>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search reviews by user name, headline, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['all', 'approved', 'pending', 'rejected'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
          No product reviews match the selected filter.
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/50">
                  <th className="py-3 px-4">Product Target</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Headline & Feedback</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredReviews.map((rev) => {
                  const product = products.find(p => p.id === rev.product_id);
                  const isApproved = rev.status === 'approved';
                  const isRejected = rev.status === 'rejected';

                  return (
                    <tr key={rev.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 max-w-[180px]">
                          {product?.images?.[0] && (
                            <img src={product.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-800 shrink-0" />
                          )}
                          <span className="font-bold text-white truncate">{product?.name || rev.product_id}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-bold text-white">{rev.user_name || 'Customer'}</div>
                        <div className="text-[10px] text-slate-500">{rev.user_email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-bold text-white">{rev.rating}.0</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        {rev.title && <div className="font-bold text-white mb-0.5">{rev.title}</div>}
                        <p className="text-slate-400 text-[11px] line-clamp-2">{rev.comment}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : isRejected
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {rev.status || 'approved'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isApproved && (
                            <button
                              onClick={() => handleUpdateStatus(rev.id, 'approved')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-900/50 text-[11px] font-bold"
                            >
                              Approve
                            </button>
                          )}

                          {!isRejected && (
                            <button
                              onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                              className="px-2.5 py-1 rounded-lg bg-amber-950/40 text-amber-400 hover:bg-amber-900/60 border border-amber-900/50 text-[11px] font-bold"
                            >
                              Reject
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(rev.id)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Delete Review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
