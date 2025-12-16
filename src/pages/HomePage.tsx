import { useState, useEffect } from 'react';
import {
  Camera,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Star,
  Check,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { PortfolioImage, Service, Testimonial } from '../lib/types';

const heroImages = [
  'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/2959192/pexels-photo-2959192.jpeg?auto=compress&cs=tinysrgb&w=1920',
];

export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxImage, setLightboxImage] = useState<PortfolioImage | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: '',
    preferred_date: '',
    message: '',
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [portfolioRes, servicesRes, testimonialsRes] = await Promise.all([
        supabase.from('portfolio_images').select('*').order('display_order'),
        supabase.from('services').select('*').eq('is_active', true).order('display_order'),
        supabase.from('testimonials').select('*').eq('is_approved', true).order('display_order'),
      ]);

      if (portfolioRes.data) setPortfolioImages(portfolioRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [testimonials]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const filteredImages =
    activeFilter === 'all'
      ? portfolioImages
      : portfolioImages.filter((img) => img.category_id === activeFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('submitting');

    try {
      const { error } = await supabase.from('inquiries').insert([formData]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        service_type: '',
        preferred_date: '',
        message: '',
      });

      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-orange-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Camera className="w-8 h-8 text-orange-500" />
              <span className="text-xl font-bold text-white">Alex Rivera Photography</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('home')}
                className="text-slate-300 hover:text-orange-500 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('portfolio')}
                className="text-slate-300 hover:text-orange-500 transition-colors"
              >
                Portfolio
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-slate-300 hover:text-orange-500 transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="text-slate-300 hover:text-orange-500 transition-colors"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="text-slate-300 hover:text-orange-500 transition-colors"
              >
                Testimonials
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="px-6 py-2 bg-orange-500 text-black rounded-lg hover:bg-orange-400 transition-colors font-bold shadow-lg shadow-orange-500/50"
              >
                Contact Us
              </button>
            </div>

            <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <button
                onClick={() => scrollToSection('home')}
                className="block w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-orange-500 rounded"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('portfolio')}
                className="block w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-orange-500 rounded"
              >
                Portfolio
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="block w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-orange-500 rounded"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="block w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-orange-500 rounded"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="block w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-orange-500 rounded"
              >
                Testimonials
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left px-4 py-2 bg-orange-500 text-black rounded hover:bg-orange-400 font-bold"
              >
                Contact Us
              </button>
            </div>
          )}
        </div>
      </nav>

      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === heroImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={image} alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/80" />
          </div>
        ))}

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Capturing Moments That Last Forever
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8">
            Professional photography services for weddings, portraits, and special events
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection('contact')}
              className="px-8 py-4 bg-orange-500 text-black rounded-lg hover:bg-orange-400 transition-all text-lg font-bold shadow-lg shadow-orange-500/50 hover:shadow-orange-400/60"
            >
              Get in Touch
            </button>
            <button
              onClick={() => scrollToSection('portfolio')}
              className="px-8 py-4 bg-transparent border-2 border-green-400 text-green-400 rounded-lg hover:bg-green-400 hover:text-black transition-all text-lg font-bold shadow-lg shadow-green-400/30 hover:shadow-green-400/50"
            >
              View Portfolio
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setHeroImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === heroImageIndex ? 'bg-orange-500 w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      <section id="portfolio" className="py-20 px-4 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">Portfolio</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Explore our collection of stunning photography work across various categories
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-2 rounded-full transition-all ${
                activeFilter === 'all'
                  ? 'bg-orange-500 text-black font-bold shadow-lg shadow-orange-500/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('wedding')}
              className={`px-6 py-2 rounded-full transition-all ${
                activeFilter === 'wedding'
                  ? 'bg-orange-500 text-black font-bold shadow-lg shadow-orange-500/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              Wedding
            </button>
            <button
              onClick={() => setActiveFilter('portrait')}
              className={`px-6 py-2 rounded-full transition-all ${
                activeFilter === 'portrait'
                  ? 'bg-orange-500 text-black font-bold shadow-lg shadow-orange-500/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              Portrait
            </button>
            <button
              onClick={() => setActiveFilter('events')}
              className={`px-6 py-2 rounded-full transition-all ${
                activeFilter === 'events'
                  ? 'bg-orange-500 text-black font-bold shadow-lg shadow-orange-500/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              Events
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 text-slate-400">
                No images in this category yet. Check back soon!
              </div>
            )}
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-lg cursor-pointer aspect-square border-2 border-transparent hover:border-orange-500 transition-all duration-300"
                onClick={() => setLightboxImage(image)}
              >
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div>
                    <h3 className="text-white font-bold text-lg">{image.title}</h3>
                    {image.description && (
                      <p className="text-slate-300 text-sm mt-1">{image.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-orange-500 transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxImage.image_url}
            alt={lightboxImage.title}
            className="max-w-full max-h-full object-contain border-2 border-orange-500/30"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <section id="about" className="py-20 px-4 bg-black border-t border-orange-500/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">About Me</h2>
              <p className="text-slate-400 mb-6 leading-relaxed">
                With over 7 years of experience in professional photography, I specialize in capturing
                the essence of life's most precious moments. My passion lies in telling stories through
                images, whether it's the joy of a wedding day, the intimacy of a portrait session, or the
                energy of a special event.
              </p>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Every photograph is crafted with attention to detail, creativity, and a deep understanding
                of light and composition. My goal is to create timeless images that you'll treasure for
                years to come.
              </p>
              <div className="flex justify-center md:justify-start">
                <div className="text-center bg-slate-900 px-8 py-6 rounded-lg border-2 border-orange-500/50 shadow-lg shadow-orange-500/20">
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-400 mb-2">7+</div>
                  <div className="text-slate-300 text-base font-semibold">Years Experience</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-green-400/20 rounded-lg blur-xl"></div>
              <img
                src="/assets/img_0119.jpg"
                alt="Photographer"
                className="rounded-lg shadow-2xl relative border-2 border-orange-500/30"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-20 px-4 bg-slate-900 border-t border-orange-500/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">Services</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Professional photography packages tailored to your needs
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-black border border-orange-500/30 rounded-lg p-6 hover:transform hover:scale-105 hover:border-orange-500 transition-all duration-300 shadow-lg hover:shadow-orange-500/20"
              >
                <h3 className="text-xl font-bold text-white mb-3">{service.name}</h3>
                <p className="text-slate-400 mb-4 text-sm">{service.description}</p>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-400 mb-4">{service.price_range}</div>
                <ul className="space-y-2 mb-6">
                  {service.inclusions.map((item, index) => (
                    <li key={index} className="text-slate-400 text-sm flex items-start">
                      <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="w-full px-4 py-2 bg-orange-500 text-black rounded-lg hover:bg-orange-400 transition-all font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-400/50"
                >
                  Get Quote
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 px-4 bg-black border-t border-orange-500/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12">
            What Clients Say
          </h2>

          {testimonials.length > 0 && (
            <div className="relative">
              <div className="bg-slate-900 border border-orange-500/30 rounded-lg p-8 md:p-12 shadow-lg shadow-orange-500/10">
                <div className="flex items-center mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-orange-500 fill-orange-500" />
                  ))}
                </div>
                <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].testimonial}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-green-400 flex items-center justify-center text-black font-bold mr-4">
                    {testimonials[currentTestimonial].client_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {testimonials[currentTestimonial].client_name}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentTestimonial ? 'bg-orange-500 w-8' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="contact" className="py-20 px-4 bg-slate-900 border-t border-orange-500/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">Get in Touch</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Ready to capture your special moments? Send us a message and we'll get back to you within 24
            hours
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-slate-300 mb-2 font-semibold">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-orange-500/30 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2 font-semibold">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-orange-500/30 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2 font-semibold">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-orange-500/30 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2 font-semibold">Service Type</label>
                  <select
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-orange-500/30 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-2 font-semibold">Preferred Date</label>
                  <input
                    type="date"
                    value={formData.preferred_date}
                    onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-orange-500/30 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2 font-semibold">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-orange-500/30 rounded-lg text-white focus:border-orange-500 focus:outline-none resize-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitStatus === 'submitting'}
                  className="w-full px-6 py-3 bg-orange-500 text-black rounded-lg hover:bg-orange-400 transition-all font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-400/50 disabled:opacity-50"
                >
                  {submitStatus === 'submitting' ? 'Sending...' : 'Send Inquiry'}
                </button>
                {submitStatus === 'success' && (
                  <div className="text-green-400 text-center font-semibold">Message sent successfully!</div>
                )}
                {submitStatus === 'error' && (
                  <div className="text-red-500 text-center font-semibold">
                    Failed to send message. Please try again.
                  </div>
                )}
              </form>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="w-6 h-6 text-orange-500 mr-4 flex-shrink-0" />
                    <div>
                      <div className="text-slate-400">Email</div>
                      <a href="mailto:alex@riveraphoto.com" className="text-white hover:text-orange-500 transition-colors">
                        alex@riveraphoto.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="w-6 h-6 text-orange-500 mr-4 flex-shrink-0" />
                    <div>
                      <div className="text-slate-400">Phone</div>
                      <a href="tel:+919876543210" className="text-white hover:text-orange-500 transition-colors">
                        +91 98765-43210
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-6 h-6 text-orange-500 mr-4 flex-shrink-0" />
                    <div>
                      <div className="text-slate-400">Location</div>
                      <div className="text-white">Pune, Maharashtra, India</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Business Hours</h3>
                <div className="space-y-2 text-slate-400">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="text-white">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="text-white">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-white">By Appointment</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Follow Us</h3>
                <div className="flex space-x-4">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-black border border-orange-500/30 rounded-lg flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-all"
                  >
                    <Instagram className="w-6 h-6 text-white" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-black border border-orange-500/30 rounded-lg flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-all"
                  >
                    <Facebook className="w-6 h-6 text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black border-t border-orange-500/20 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <p>&copy; 2024 Alex Rivera Photography. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
