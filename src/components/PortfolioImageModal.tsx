import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { PortfolioImage } from '../lib/types';

interface PortfolioImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingImage?: PortfolioImage | null;
}

export function PortfolioImageModal({ isOpen, onClose, onSave, editingImage }: PortfolioImageModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    category_id: 'wedding' as 'wedding' | 'portrait' | 'events',
    display_order: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingImage) {
      setFormData({
        title: editingImage.title,
        description: editingImage.description || '',
        image_url: editingImage.image_url,
        category_id: editingImage.category_id,
        display_order: editingImage.display_order,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        image_url: '',
        category_id: 'wedding',
        display_order: 0,
      });
    }
    setError('');
  }, [editingImage, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingImage) {
        const { error: updateError } = await supabase
          .from('portfolio_images')
          .update(formData)
          .eq('id', editingImage.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('portfolio_images')
          .insert([formData]);

        if (insertError) throw insertError;
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {editingImage ? 'Edit Portfolio Image' : 'Add Portfolio Image'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-300 mb-2 font-semibold">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
              placeholder="e.g., Beach Wedding Ceremony"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-semibold">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors resize-none"
              placeholder="Optional description of the image"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-semibold">Image URL *</label>
            <input
              type="url"
              required
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-slate-400 text-sm mt-1">
              Paste the URL of an image hosted online (e.g., from Pexels, Unsplash, or your own hosting)
            </p>
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-semibold">Category *</label>
            <select
              required
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value as 'wedding' | 'portrait' | 'events' })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
            >
              <option value="wedding">Wedding</option>
              <option value="portrait">Portrait</option>
              <option value="events">Events</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-semibold">Display Order</label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
              placeholder="0"
            />
            <p className="text-slate-400 text-sm mt-1">
              Lower numbers appear first. Use 0 for default ordering.
            </p>
          </div>

          {formData.image_url && (
            <div>
              <label className="block text-slate-300 mb-2 font-semibold">Preview</label>
              <img
                src={formData.image_url}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-slate-600"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex items-center space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingImage ? 'Update Image' : 'Add Image'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
