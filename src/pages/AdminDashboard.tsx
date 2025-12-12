import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Image,
  Briefcase,
  FileText,
  MessageSquare,
  Star,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { PortfolioImage, Service, BlogPost, Inquiry, Testimonial } from '../lib/types';

type Tab = 'overview' | 'portfolio' | 'services' | 'blog' | 'inquiries' | 'testimonials';

export function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    } else {
      loadData();
    }
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [portfolioRes, servicesRes, blogRes, inquiriesRes, testimonialsRes] = await Promise.all([
        supabase.from('portfolio_images').select('*').order('display_order'),
        supabase.from('services').select('*').order('display_order'),
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
        supabase.from('testimonials').select('*').order('display_order'),
      ]);

      if (portfolioRes.data) setPortfolioImages(portfolioRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (blogRes.data) setBlogPosts(blogRes.data);
      if (inquiriesRes.data) setInquiries(inquiriesRes.data);
      if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const deletePortfolioImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    await supabase.from('portfolio_images').delete().eq('id', id);
    loadData();
  };

  const deleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    await supabase.from('services').delete().eq('id', id);
    loadData();
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    loadData();
  };

  const updateInquiryStatus = async (id: string, status: string) => {
    await supabase.from('inquiries').update({ status }).eq('id', id);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'portfolio'
                ? 'bg-amber-500 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Image className="w-5 h-5" />
            <span>Portfolio</span>
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'services'
                ? 'bg-amber-500 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span>Services</span>
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'blog' ? 'bg-amber-500 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Blog Posts</span>
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'inquiries'
                ? 'bg-amber-500 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Inquiries</span>
            {inquiries.filter((i) => i.status === 'new').length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {inquiries.filter((i) => i.status === 'new').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'testimonials'
                ? 'bg-amber-500 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Star className="w-5 h-5" />
            <span>Testimonials</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Portfolio Images</span>
                    <Image className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-3xl font-bold text-white">{portfolioImages.length}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Services</span>
                    <Briefcase className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-3xl font-bold text-white">{services.length}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Inquiries</span>
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-3xl font-bold text-white">{inquiries.length}</div>
                  <div className="text-sm text-slate-400 mt-1">
                    {inquiries.filter((i) => i.status === 'new').length} new
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Testimonials</span>
                    <Star className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-3xl font-bold text-white">{testimonials.length}</div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Recent Inquiries</h3>
                <div className="space-y-4">
                  {inquiries.slice(0, 5).map((inquiry) => (
                    <div key={inquiry.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{inquiry.name}</div>
                        <div className="text-slate-400 text-sm">{inquiry.email}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            inquiry.status === 'new'
                              ? 'bg-red-500/20 text-red-400'
                              : inquiry.status === 'in_progress'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {inquiry.status}
                        </span>
                        <button
                          onClick={() => setActiveTab('inquiries')}
                          className="text-amber-500 hover:text-amber-400"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">Portfolio Management</h2>
                <button className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Add Image</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioImages.map((image) => (
                  <div key={image.id} className="bg-slate-800 rounded-lg overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={image.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-1">{image.title}</h3>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{image.description}</p>
                      <div className="flex items-center space-x-2">
                        <button className="flex-1 px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors flex items-center justify-center space-x-1">
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => deletePortfolioImage(image.id)}
                          className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {portfolioImages.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  No portfolio images yet. Click "Add Image" to get started.
                </div>
              )}
            </div>
          )}

          {activeTab === 'services' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">Services Management</h2>
                <button className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <div key={service.id} className="bg-slate-800 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                        <div className="text-2xl font-bold text-amber-500">{service.price_range}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteService(service.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-400 mb-4">{service.description}</p>
                    <div className="space-y-1">
                      {service.inclusions.map((item, index) => (
                        <div key={index} className="text-slate-300 text-sm flex items-start">
                          <span className="text-amber-500 mr-2">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Inquiries</h2>

              <div className="bg-slate-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {inquiries.map((inquiry) => (
                        <tr key={inquiry.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-white font-medium">{inquiry.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-slate-300 text-sm">{inquiry.email}</div>
                            <div className="text-slate-400 text-sm">{inquiry.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-slate-300 text-sm">{inquiry.service_type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-slate-300 text-sm">
                              {new Date(inquiry.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={inquiry.status}
                              onChange={(e) => updateInquiryStatus(inquiry.id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-xs ${
                                inquiry.status === 'new'
                                  ? 'bg-red-500/20 text-red-400'
                                  : inquiry.status === 'in_progress'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : inquiry.status === 'responded'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-slate-500/20 text-slate-400'
                              }`}
                            >
                              <option value="new">New</option>
                              <option value="in_progress">In Progress</option>
                              <option value="responded">Responded</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="text-amber-500 hover:text-amber-400">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {inquiries.length === 0 && (
                <div className="text-center py-12 text-slate-400">No inquiries yet.</div>
              )}
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">Testimonials Management</h2>
                <button className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Add Testimonial</span>
                </button>
              </div>

              <div className="space-y-4">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="bg-slate-800 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                          {testimonial.client_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{testimonial.client_name}</div>
                          <div className="flex items-center">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTestimonial(testimonial.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-300">{testimonial.testimonial}</p>
                  </div>
                ))}
              </div>

              {testimonials.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  No testimonials yet. Click "Add Testimonial" to get started.
                </div>
              )}
            </div>
          )}

          {activeTab === 'blog' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">Blog Posts</h2>
                <button className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>New Post</span>
                </button>
              </div>

              <div className="text-center py-12 text-slate-400">
                Blog management coming soon. You can add blog posts manually through the database.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
