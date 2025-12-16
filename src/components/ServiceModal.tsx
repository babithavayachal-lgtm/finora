import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Service } from '../lib/types';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingService?: Service | null;
}

export function ServiceModal({ isOpen, onClose, onSave, editingService }: ServiceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_range: '',
    inclusions: [''],
    display_order: 0,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name,
        description: editingService.description,
        price_range: editingService.price_range,
        inclusions: editingService.inclusions.length > 0 ? editingService.inclusions : [''],
        display_order: editingService.display_order,
        is_active: editingService.is_active,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price_range: '',
        inclusions: [''],
        display_order: 0,
        is_active: true,
      });
    }
    setError('');
  }, [editingService, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const filteredInclusions = formData.inclusions.filter(item => item.trim() !== '');

    if (filteredInclusions.length === 0) {
      setError('Please add at least one inclusion');
      setLoading(false);
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        inclusions: filteredInclusions,
      };

      if (editingService) {
        const { error: updateError } = await supabase
          .from('services')
          .update(dataToSave)
          .eq('id', editingService.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('services')
          .insert([dataToSave]);

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

  const addInclusion = () => {
    setFormData({ ...formData, inclusions: [...formData.inclusions, ''] });
  };

  const removeInclusion = (index: number) => {
    const newInclusions = formData.inclusions.filter((_, i) => i !== index);
    setFormData({ ...formData, inclusions: newInclusions.length > 0 ? newInclusions : [''] });
  };

  const updateInclusion = (index: number, value: string) => {
    const newInclusions = [...formData.inclusions];
    newInclusions[index] = value;
    setFormData({ ...formData, inclusions: newInclusions });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {editingService ? 'Edit Service' : 'Add Service'}
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
            <label className="block text-slate-300 mb-2 font-semibold">Service Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
              placeholder="e.g., Wedding Photography"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-semibold">Description *</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors resize-none"
              placeholder="Describe what this service includes"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-semibold">Price Range *</label>
            <input
              type="text"
              required
              value={formData.price_range}
              onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
              placeholder="e.g., ₹25,000 - ₹50,000"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-semibold">Inclusions *</label>
            <div className="space-y-2">
              {formData.inclusions.map((inclusion, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inclusion}
                    onChange={(e) => updateInclusion(index, e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder={`Inclusion ${index + 1}`}
                  />
                  {formData.inclusions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInclusion(index)}
                      className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addInclusion}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Inclusion</span>
              </button>
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
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-amber-500 bg-slate-900 border-slate-600 rounded focus:ring-amber-500"
            />
            <label htmlFor="is_active" className="text-slate-300 font-semibold">
              Active (visible on website)
            </label>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
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
