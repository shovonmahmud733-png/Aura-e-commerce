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
  MessageSquare,
  RefreshCw,
  AlertCircle,
  Eye,
  X,
  ShieldCheck,
  Check,
  Clock
} from 'lucide-react';

export default function AdminReviewsPage() {
  const { products, addToast } = useStore();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [ratingFilter, setRatingFilter] = useState('all'); // 'all' | '5' | '4' | '3' | 'low'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getReviews();
      setReviews(data || []);
    } catch (e) {
      addToast('Sync Notice', 'Using cached customer reviews', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminApi.updateReviewStatus(id, status);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      addToast('Review Moderated', `Review status changed to "${status}".`, 'success');
      if (selectedReview && selectedReview.id === id) {
        setSelectedReview(prev => ({ ...prev, status }));
      }
    } catch (err) {
      addToast('Moderation Failed', err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      addToast('Review Purged', 'Review permanently removed from database.', 'info');
      setConfirmDeleteId(null);
      if (selectedReview && selectedReview.id === id) {
        setSelectedReview(null);
      }
    } catch (err) {
      addToast('Delete Failed', err.message, 'error');
    }
  };

  // Metrics
  const totalReviews = reviews.length;
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((s, r) => s + (Number(r.rating) || 5), 0) / totalReviews).toFixed(1)
    : '0.0';

  const filteredReviews = reviews.filter(r => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      (r.user_name && r.user_name.toLowerCase().includes(s)) ||
      (r.user_email && r.user_email.toLowerCase().includes(s)) ||
      (r.title && r.title.toLowerCase().includes(s)) ||
      (r.comment && r.comment.toLowerCase().includes(s));

    const matchesStatus =
      statusFilter === 'all' ||
      (r.status || 'approved').toLowerCase() === statusFilter.toLowerCase();

    let matchesRating = true;
    if (ratingFilter === '5') matchesRating = Number(r.rating) === 5;
    else if (ratingFilter === '4') matchesRating = Number(r.rating) === 4;
    else if (ratingFilter === '3') matchesRating = Number(r.rating) === 3;
    else if (ratingFilter === 'low') matchesRating = Number(r.rating) <= 2;

    return matchesSearch && matchesStatus && matchesRating;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400">
              Shopper Sentiment & Social Proof
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span className="text-[11px] text-slate-500 font-mono">Verified Customer Feedback</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Review Moderation & Curation
          </h1>
        </div>

        <button
          onClick={loadReviews}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-400' : 'text-slate-400'}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block">Total Reviews</span>
          <span className="text-2xl font-black text-white mt-1 block">{totalReviews}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Storefront testimonials</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-amber-400 font-semibold block flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Average Score</span>
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-white">{avgRating}</span>
            <span className="text-xs text-slate-500">/ 5.0</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Aggregated product ratings</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-amber-400 font-semibold block flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Moderation</span>
          </span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">{pendingCount}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Requires staff verification</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-emerald-400 font-semibold block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Published Live</span>
          </span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{approvedCount}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Displayed on hardware pages</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search reviews by user name, verified email, or review text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['all', 'pending', 'approved', 'rejected'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Stars</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars Only</option>
            <option value="3">3 Stars Only</option>
            <option value="low">≤ 2 Stars (Criticisms)</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      {isLoading ? (
        <div className="py-24 text-center bg-slate-950 border border-slate-800 rounded-3xl">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-medium">Synchronizing customer review submissions...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-slate-950 border border-slate-800 p-8">
          <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No product reviews found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            No testimonials match your filter criteria. Try resetting your search filters.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); setRatingFilter('all'); }}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-white"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/60">
                  <th className="py-3.5 px-4">Hardware Target</th>
                  <th className="py-3.5 px-4">Customer Identity</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Testimonial Content</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredReviews.map((rev) => {
                  const product = products.find(p => p.id === rev.product_id);
                  const isApproved = rev.status === 'approved';
                  const isRejected = rev.status === 'rejected';
                  const isPending = rev.status === 'pending';

                  return (
                    <tr key={rev.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5 max-w-[200px]">
                          {product?.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="w-9 h-9 rounded-xl object-cover border border-slate-800 shrink-0 bg-slate-900" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center shrink-0">
                              <MessageSquare className="w-4 h-4 text-slate-600" />
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-bold text-white block truncate">{product?.name || rev.product_id}</span>
                            <span className="text-[10px] text-slate-500 font-mono">ID: {rev.product_id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-white">{rev.user_name || 'Verified Buyer'}</span>
                          <ShieldCheck className="w-3 h-3 text-brand-400" title="Verified Customer" />
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">{rev.user_email}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < (Number(rev.rating) || 5)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-mono font-bold text-white ml-1">{rev.rating}.0</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        {rev.title && <div className="font-bold text-white truncate mb-0.5">{rev.title}</div>}
                        <p className="text-slate-400 text-[11px] line-clamp-2">{rev.comment}</p>
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap font-mono">
                        {formatDate(rev.created_at || '2026-03-01')}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : isRejected
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {isApproved && <CheckCircle2 className="w-3 h-3" />}
                          {isRejected && <XCircle className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          <span>{rev.status || 'approved'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedReview(rev)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                            title="Inspect Testimonial"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {!isApproved && (
                            <button
                              onClick={() => handleUpdateStatus(rev.id, 'approved')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-900/50 text-[11px] font-bold transition-colors"
                              title="Publish review"
                            >
                              Approve
                            </button>
                          )}

                          {!isRejected && (
                            <button
                              onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                              className="px-2.5 py-1 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-900/50 text-[11px] font-bold transition-colors"
                              title="Reject review"
                            >
                              Reject
                            </button>
                          )}

                          <button
                            onClick={() => setConfirmDeleteId(rev.id)}
                            className="p-1.5 rounded-lg bg-slate-900 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 transition-colors"
                            title="Delete Permanently"
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

      {/* INSPECT MODAL */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedReview(null)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Review Dossier</h3>
                <p className="text-xs text-slate-400">Verified buyer submission</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Submitted By</span>
                  <span className="text-xs font-bold text-white">{selectedReview.user_name || 'Customer'}</span>
                  <span className="text-[11px] font-mono text-slate-400 block">{selectedReview.user_email}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Rating</span>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-mono font-bold text-white">{selectedReview.rating}.0</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Testimonial</span>
                {selectedReview.title && (
                  <h4 className="text-sm font-bold text-white">{selectedReview.title}</h4>
                )}
                <p className="text-xs text-slate-300 leading-relaxed">{selectedReview.comment}</p>
                <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/80">
                  Logged at {formatDate(selectedReview.created_at || '2026-03-01')}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => setConfirmDeleteId(selectedReview.id)}
                className="px-3 py-2 rounded-xl bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-900/40 text-xs font-bold transition-colors"
              >
                Delete Review
              </button>

              <div className="flex items-center gap-2">
                {selectedReview.status !== 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReview.id, 'approved')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
                  >
                    Approve & Publish
                  </button>
                )}
                {selectedReview.status !== 'rejected' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReview.id, 'rejected')}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all"
                  >
                    Reject & Hide
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Delete Review?</h3>
            <p className="text-xs text-slate-400 mb-6">
              This action permanently purges this testimonial from the database. This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
