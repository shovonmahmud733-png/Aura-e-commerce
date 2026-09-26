import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Sliders
} from 'lucide-react';

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useStore();

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'audio',
    serialNumber: 'AUR-HW-9900-AUD',
    price: 299,
    originalPrice: 349,
    stock: 25,
    badge: 'Flagship Edition',
    tagline: '',
    description: '',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'],
    colors: [
      { name: 'Space Black', hex: '#18181b', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Platinum Silver', hex: '#e2e8f0', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80' }
    ],
    specs: [
      { key: 'Connectivity', value: 'Bluetooth 5.4 / USB-C Lossless' },
      { key: 'Battery Life', value: '45 Hours ANC' },
      { key: 'Chassis Finish', value: 'Aerospace Grade Titanium' }
    ],
    features: [
      'Active Noise Cancellation with Transparency Mode',
      'Ultra-low latency lossless audio stream',
      'Custom acoustic tuning via companion application'
    ]
  });

  useEffect(() => {
    if (!isEdit) return;
    let isMounted = true;
    async function loadProduct() {
      try {
        const prod = await adminApi.getProduct(id);
        if (isMounted && prod) {
          // Convert specs object to array if needed
          let specArr = [];
          if (prod.specs && typeof prod.specs === 'object') {
            specArr = Object.entries(prod.specs).map(([key, value]) => ({ key, value }));
          }

          setFormData({
            name: prod.name || '',
            category: prod.category || 'audio',
            serialNumber: prod.serialNumber || `AUR-HW-${Math.floor(1000 + Math.random() * 9000)}-PRD`,
            price: prod.price || 0,
            originalPrice: prod.originalPrice || 0,
            stock: prod.stock !== undefined ? prod.stock : 20,
            badge: prod.badge || '',
            tagline: prod.tagline || '',
            description: prod.description || '',
            images: prod.images && prod.images.length > 0 ? prod.images : [''],
            colors: prod.colors && prod.colors.length > 0 ? prod.colors : [],
            specs: specArr.length > 0 ? specArr : [{ key: 'Battery', value: '24 Hours' }],
            features: prod.features && prod.features.length > 0 ? prod.features : ['Precision engineering']
          });
        }
      } catch (e) {
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProduct();
    return () => { isMounted = false; };
  }, [id, isEdit]);

  // Handlers for Specs
  const addSpec = () => {
    setFormData(prev => ({ ...prev, specs: [...prev.specs, { key: '', value: '' }] }));
  };
  const removeSpec = (idx) => {
    setFormData(prev => ({ ...prev, specs: prev.specs.filter((_, i) => i !== idx) }));
  };
  const updateSpec = (idx, field, val) => {
    setFormData(prev => {
      const copy = [...prev.specs];
      copy[idx][field] = val;
      return { ...prev, specs: copy };
    });
  };

  // Handlers for Features
  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };
  const removeFeature = (idx) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
  };
  const updateFeature = (idx, val) => {
    setFormData(prev => {
      const copy = [...prev.features];
      copy[idx] = val;
      return { ...prev, features: copy };
    });
  };

  // Handlers for Image URLs
  const addImage = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };
  const removeImage = (idx) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };
  const updateImage = (idx, val) => {
    setFormData(prev => {
      const copy = [...prev.images];
      copy[idx] = val;
      return { ...prev, images: copy };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price === undefined) {
      addToast('Validation Error', 'Product Name and Price are mandatory.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Re-map specs array to key-value object
      const specsObj = {};
      formData.specs.forEach(s => {
        if (s.key.trim()) specsObj[s.key.trim()] = s.value.trim();
      });

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        serialNumber: formData.serialNumber.trim(),
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock, 10) || 0,
        badge: formData.badge.trim(),
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        images: formData.images.filter(img => img.trim().length > 0),
        colors: formData.colors,
        specs: specsObj,
        features: formData.features.filter(f => f.trim().length > 0)
      };

      if (isEdit) {
        await adminApi.updateProduct(id, payload);
        addToast('Product Updated', `"${payload.name}" updated successfully.`, 'success');
      } else {
        await adminApi.createProduct(payload);
        addToast('Product Created', `"${payload.name}" added to hardware catalog.`, 'success');
      }

      navigate('/admin/products');
    } catch (err) {
      addToast('Save Failed', err.message || 'Error saving product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading product configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400 block mb-0.5">
              {isEdit ? 'Modify Specifications' : 'New Hardware Entry'}
            </span>
            <h1 className="text-2xl font-black text-white">
              {isEdit ? `Edit: ${formData.name}` : 'Create New Product'}
            </h1>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : 'Save Product'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Details */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
            Primary Identification & Pricing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">
                Product Title / Model Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                placeholder="e.g. Aura Precision Studio Monitor"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
              >
                <option value="audio">Studio Wireless Audio</option>
                <option value="wearables">Smart Wearables</option>
                <option value="smart-home">Smart Living & Ambience</option>
                <option value="accessories">Workspace Gadgets</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Hardware Serial Prefix
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-brand-500 uppercase"
                placeholder="AUR-HW-XXXX"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Retail Price ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Compare-at / Original Price ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Current Units in Stock
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Product Badge
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                placeholder="e.g. Best Seller, Flagship, New"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">
                Marketing Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                placeholder="e.g. Immersive spatial audio with adaptive titanium drivers"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">
                Comprehensive Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500 resize-none"
                placeholder="Engineering specs, materials, and luxury industrial design overview..."
              />
            </div>
          </div>
        </div>

        {/* Image URLs */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-400" />
              <span>Catalog Gallery Images</span>
            </h3>
            <button
              type="button"
              onClick={addImage}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add URL</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.images.map((img, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={img}
                  onChange={(e) => updateImage(idx, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                />
                {img && (
                  <img src={img} alt="" className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0" />
                )}
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="p-2 text-rose-400 hover:bg-slate-900 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Technical Specifications (Key / Value)</span>
            </h3>
            <button
              type="button"
              onClick={addSpec}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Spec</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.specs.map((sp, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Spec Key (e.g. Battery Life)"
                  value={sp.key}
                  onChange={(e) => updateSpec(idx, 'key', e.target.value)}
                  className="w-1/3 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 45 Hours)"
                  value={sp.value}
                  onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(idx)}
                  className="p-2 text-rose-400 hover:bg-slate-900 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Key Highlights & Bullet Features</span>
            </h3>
            <button
              type="button"
              onClick={addFeature}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Highlight</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="e.g. Active Noise Cancellation with Transparency Mode"
                  value={feat}
                  onChange={(e) => updateFeature(idx, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="p-2 text-rose-400 hover:bg-slate-900 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bottom Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
