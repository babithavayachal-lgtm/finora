import { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Testimonial } from '../lib/types';

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingTestimonial?: Testimonial | null;
}

export function TestimonialModal({ isOpen, onClose, onSave, editingTestimonial }: TestimonialModalProps) {
  const [formData, setFormData] = useState({
    client_name: '',
    testimonial: '',
    rating: 5,
    display_order: 0,
    is_approved: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTestimonial) {
      setFormData({
        client_name: editingTestimonial.client_name,
        testimonial: editingTestimonial.testimonial,
        rating: editingTestimonial.rating,
        display_order: editingTestimonial.display_order,
        is_approved: editingTestimonial.is_approved,
      });
    } else {
      setFormData({
        client_name: '',
        testimonial: '',
        rating: 5,
        display_order: 0,
        is_approved: true,
      });
    }
    setError('');
  }, [editingTestimonial, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingTestimonial) {
        const { error: updateError } = await supabase
          .from('testimonials')
          .update(formData)
          .eq('id', editingTestimonial.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('testimonials')
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
            {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
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
            <label className="block text-slate-300 mb-2 font-semibold">Client Name *</label>
            <input
              type="text"
              required
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
              placeholder="e.g., John Smith"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-semibold">Testimonial *</label>
            <textarea
              rows={5}
              required
              value={formData.testimonial}
              onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors resize-none"
              placeholder="What did the client say about your service?"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-semibold">Rating *</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-white ml-4">{formData.rating} / 5</span>
            </div>
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

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_approved"
              checked={formData.is_approved}
              onChange={(e) => setFormData({ ...formData, is_approved: e.target.checked })}
              className="w-4 h-4 text-amber-500 bg-slate-900 border-slate-600 rounded focus:ring-amber-500"
            />
            <label htmlFor="is_approved" className="text-slate-300 font-semibold">
              Approved (visible on website)
            </label>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
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
