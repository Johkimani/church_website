import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaTrash, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { useApp } from '../../../context/AppContext';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  addedAt: number;
}

const STORAGE_KEY = 'csa_wishlist';

export const getWishlist = (): WishlistItem[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
};

export const isInWishlist = (id: string): boolean => {
  return getWishlist().some(item => item.id === id);
};

export const toggleWishlist = (item: Omit<WishlistItem, 'addedAt'>): boolean => {
  const list = getWishlist();
  const idx = list.findIndex(i => i.id === item.id);
  if (idx >= 0) {
    list.splice(idx, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return false;
  } else {
    list.unshift({ ...item, addedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  }
};

export const Wishlist = () => {
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useApp();
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => { setItems(getWishlist()); }, []);

  const remove = (id: string) => {
    const list = getWishlist().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setItems(list);
  };

  const addAllToCart = () => {
    items.forEach(item => {
      addToCart({ item: { id: item.id, name: item.name, image_url: item.image, img: item.image }, price: item.price, category: item.category });
    });
    setIsCartOpen(true);
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20 text-slate-800 font-sans">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition py-2 px-3 -ml-3 rounded-xl hover:bg-slate-100 min-h-[44px] mb-4">
          <FaArrowLeft size={12} /> Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <FaHeart size={20} className="text-rose-500" /> My Wishlist
            </h1>
            <p className="text-sm text-slate-500 mt-1">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
          </div>
          {items.length > 0 && (
            <button onClick={addAllToCart} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all">
              <FaShoppingCart size={12} /> Add All to Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHeart size={32} className="text-rose-300" />
            </div>
            <p className="font-bold text-slate-700 text-lg mb-1">Your wishlist is empty</p>
            <p className="text-sm text-slate-400 mb-4">Tap the heart icon on any product to save it here.</p>
            <button onClick={() => navigate('/sacramentals')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group">
                <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-slate-50 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaHeart size={32} className="text-slate-200" />
                    </div>
                  )}
                  <button onClick={() => remove(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all shadow-sm">
                    <FaTrash size={12} />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">{item.category}</p>
                  <h3 className="font-bold text-sm text-slate-800 line-clamp-2 mb-2">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-black text-slate-900">KES {item.price.toLocaleString()}</p>
                    <button onClick={() => {
                      addToCart({ item: { id: item.id, name: item.name, image_url: item.image, img: item.image }, price: item.price, category: item.category });
                      setIsCartOpen(true);
                    }} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1">
                      <FaShoppingCart size={10} /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
