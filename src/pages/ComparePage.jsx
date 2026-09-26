import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/formatters';
import { 
  SlidersHorizontal, 
  ShoppingBag, 
  Check, 
  X, 
  Star, 
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Battery,
  Wifi,
  Layers
} from 'lucide-react';

export default function ComparePage() {
  const { products, addToCart, currency } = useStore();

  // Pick default initial 2 products
  const [selectedIds, setSelectedIds] = useState(() => [
    products[0]?.id || 'prod-1',
    products[1]?.id || 'prod-2',
    products[2]?.id || 'prod-3'
  ]);

  const selectedProducts = selectedIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  const handleSelectProduct = (colIndex, newId) => {
    setSelectedIds(prev => {
      const copy = [...prev];
      copy[colIndex] = newId;
      return copy;
    });
  };

  const handleRemoveCol = (colIndex) => {
    if (selectedIds.length <= 1) return;
    setSelectedIds(prev => prev.filter((_, idx) => idx !== colIndex));
  };

  const handleAddCol = () => {
    if (selectedIds.length >= 3) return;
    const remaining = products.find(p => !selectedIds.includes(p.id));
    if (remaining) {
      setSelectedIds(prev => [...prev, remaining.id]);
    }
  };

  const specCategories = [
    {
      group: 'Audio & Acoustics',
      icon: Sparkles,
      rows: [
        { label: 'Acoustic Driver', key: 'Driver' },
        { label: 'Frequency Range', key: 'Frequency Response' },
        { label: 'Active Noise Cancellation', key: 'ANC Type' },
        { label: 'Spatial Audio Mode', key: 'Spatial Audio' }
      ]
    },
    {
      group: 'Endurance & Charging',
      icon: Battery,
      rows: [
        { label: 'Battery Runtime', key: 'Battery Life' },
        { label: 'Quick Fast-Charge', key: 'Charging' },
        { label: 'Wireless Qi Charging', key: 'Wireless Charging' }
      ]
    },
    {
      group: 'Connectivity & Tech',
      icon: Wifi,
      rows: [
        { label: 'Wireless Standard', key: 'Connectivity' },
        { label: 'Supported Codecs', key: 'Codecs' },
        { label: 'Microphone Array', key: 'Microphones' }
      ]
    },
    {
      group: 'Build & Protection',
      icon: Layers,
      rows: [
        { label: 'Materials', key: 'Materials' },
        { label: 'Water Resistance', key: 'Water Resistance' },
        { label: 'Weight', key: 'Weight' },
        { label: 'Warranty Plan', key: 'Warranty' }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in pb-20 space-y-6 sm:space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 sm:pb-6">
        <div>
          <Link to="/products" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Hardware Comparison Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compare industrial design, acoustic drivers, battery life, and materials side-by-side.
          </p>
        </div>

        {selectedIds.length < 3 && (
          <button
            onClick={handleAddCol}
            className="hidden md:inline-flex px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 shadow-sm"
          >
            + Add Model to Compare
          </button>
        )}
      </div>

      {/* Mobile Compare Experience (Zero horizontal scrolling, stacked side-by-side) */}
      <div className="md:hidden space-y-5">
        {/* Model Selector Cards (2 columns side-by-side) */}
        <div className="grid grid-cols-2 gap-2.5">
          {selectedProducts.slice(0, 2).map((product, colIdx) => (
            <div key={colIdx} className="p-3 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
              <div>
                <select
                  value={product.id}
                  onChange={(e) => handleSelectProduct(colIdx, e.target.value)}
                  className="w-full text-xs font-bold bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 text-slate-900 dark:text-white mb-2 focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-800 relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.badge && (
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-900/90 text-white">
                      {product.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-2 line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-amber-500 my-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{product.rating}</span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {formatCurrency(product.price, currency)}
                </div>
              </div>

              <button
                onClick={() => addToCart(product, 1, product.colors?.[0]?.name)}
                className="w-full py-2 px-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          ))}
        </div>

        {/* Spec Comparison Accordions */}
        <div className="space-y-3.5">
          {specCategories.map((cat, catIdx) => (
            <div key={catIdx} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 overflow-hidden shadow-xs">
              <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-dark-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <cat.icon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{cat.group}</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
                {cat.rows.map((row, rowIdx) => {
                  const p1 = selectedProducts[0];
                  const p2 = selectedProducts[1];
                  const val1 = p1?.specs?.[row.key] || p1?.specs?.[row.label] || '—';
                  const val2 = p2?.specs?.[row.key] || p2?.specs?.[row.label] || '—';
                  const displayVal1 = val1 === '—' && (row.key === 'Warranty' || row.label === 'Warranty Plan') ? '2-Yr Aura Care' : val1;
                  const displayVal2 = val2 === '—' && (row.key === 'Warranty' || row.label === 'Warranty Plan') ? '2-Yr Aura Care' : val2;

                  return (
                    <div key={rowIdx} className="p-2.5">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                        {row.label}
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-dark-800/50 border border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100 text-center">
                          {displayVal1}
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-dark-800/50 border border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100 text-center">
                          {displayVal2}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Comparison Grid Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          {/* Header Row: Products Selectors & Overview */}
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="w-1/4 p-4 align-top text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Hardware Model
              </th>
              {selectedProducts.map((product, colIdx) => (
                <th key={colIdx} className="p-4 align-top w-1/4">
                  <div className="space-y-3">
                    {/* Dropdown Selector */}
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={product.id}
                        onChange={(e) => handleSelectProduct(colIdx, e.target.value)}
                        className="w-full text-xs font-bold bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>

                      {selectedProducts.length > 2 && (
                        <button
                          onClick={() => handleRemoveCol(colIdx)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Remove column"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Image Card */}
                    <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 relative">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.badge && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-900/90 text-white">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Title & Price */}
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-amber-500 my-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{product.rating}</span>
                        <span className="text-slate-400">({product.reviewsCount})</span>
                      </div>
                      <div className="text-base font-black text-slate-900 dark:text-white">
                        {formatCurrency(product.price, currency)}
                      </div>
                    </div>

                    {/* Add to Bag Button */}
                    <button
                      onClick={() => addToCart(product, 1, product.colors?.[0]?.name)}
                      className="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body Rows */}
          <tbody>
            {specCategories.map((cat, catIdx) => (
              <React.Fragment key={catIdx}>
                {/* Category Divider Bar */}
                <tr className="bg-slate-100/70 dark:bg-dark-800/60">
                  <td colSpan={selectedProducts.length + 1} className="p-3 text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <cat.icon className="w-4 h-4 text-brand-600" />
                    <span>{cat.group}</span>
                  </td>
                </tr>

                {/* Specs rows */}
                {cat.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-dark-800/30 text-xs">
                    <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">
                      {row.label}
                    </td>
                    {selectedProducts.map((product, pIdx) => {
                      const specVal = product.specs?.[row.key] || product.specs?.[row.label] || '—';
                      return (
                        <td key={pIdx} className="p-4 font-bold text-slate-800 dark:text-slate-200">
                          {specVal === '—' && (row.key === 'Warranty' || row.label === 'Warranty Plan') 
                            ? '2-Year Aura Care Global' 
                            : specVal}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
