# Alex Rivera Photography Portfolio

A professional photography portfolio website with an admin dashboard for content management. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Public Website
- **Hero Section**: Auto-rotating image carousel with smooth transitions
- **Portfolio Gallery**: Filterable photo gallery with categories (Wedding, Portrait, Events, etc.)
- **Lightbox View**: Full-screen image viewing with smooth animations
- **About Section**: Photographer bio with statistics and achievements
- **Services**: Display photography packages with pricing and inclusions
- **Testimonials**: Auto-rotating client testimonials carousel
- **Contact Form**: Inquiry submission system with Supabase integration
- **Responsive Design**: Mobile-first approach with breakpoints for all devices

### Admin Dashboard
- **Overview**: Dashboard with statistics and recent inquiries
- **Portfolio Management**: Upload, edit, and delete portfolio images
- **Services Management**: Manage photography packages and pricing
- **Inquiries**: View and manage client inquiries with status tracking
- **Testimonials**: Add, edit, and manage client testimonials
- **Blog Posts**: Placeholder for future blog management
- **Authentication**: Secure login with Supabase Auth

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Authentication, Storage)
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Build Tool**: Vite

## Database Schema

The application uses the following Supabase tables:

- `portfolio_images`: Store portfolio photos with categories and metadata
- `services`: Photography service packages with pricing
- `blog_posts`: Blog articles (future feature)
- `inquiries`: Client contact form submissions
- `testimonials`: Client reviews and ratings

All tables have Row Level Security (RLS) enabled:
- Public can read published content
- Authenticated admins can manage all content

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. Supabase account and project

### Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. The database schema is already migrated. Sample data includes:
   - 4 photography services (Wedding, Portrait, Events, Commercial)
   - 3 testimonials

4. Create an admin user:
```bash
# Go to Supabase Dashboard > Authentication > Users > Add User
# Or use SQL:
```

### Development

Run the development server:
```bash
npm run dev
```

Visit `http://localhost:5173` for the public site
Visit `http://localhost:5173/admin/login` for admin dashboard

### Production Build

```bash
npm run build
npm run preview
```

## Usage Guide

### For Photographers (Admins)

1. **Login**: Go to `/admin/login` and sign in with your credentials

2. **Add Portfolio Images**:
   - Navigate to Portfolio section
   - Click "Add Image"
   - Upload image, add title, description, and select category
   - Images appear immediately on the public portfolio

3. **Manage Services**:
   - Go to Services section
   - Add or edit photography packages
   - Update pricing and inclusions
   - Toggle active/inactive status

4. **Handle Inquiries**:
   - Check Inquiries section for new requests
   - Update status as you process them (New → In Progress → Responded → Closed)
   - View client details and preferred dates

5. **Manage Testimonials**:
   - Add client reviews manually
   - Edit or delete existing testimonials
   - Featured testimonials appear on homepage carousel

### For Clients (Public)

1. **Browse Portfolio**: Filter by category to see different types of photography
2. **View Services**: Check pricing and inclusions for various packages
3. **Read Testimonials**: See reviews from past clients
4. **Contact**: Fill out the inquiry form with:
   - Your details (name, email, phone)
   - Service type needed
   - Preferred date
   - Message with your requirements

## Customization

### Colors & Branding

The site uses a dark theme with amber accents. To customize:

1. **Primary Color** (amber): Search for `amber-500` and `amber-600` in components
2. **Background**: Change `slate-900` and `slate-800` classes
3. **Logo**: Replace the Camera icon with your logo in navigation

### Hero Images

Update the `heroImages` array in `src/pages/HomePage.tsx`:
```typescript
const heroImages = [
  'your-image-url-1.jpg',
  'your-image-url-2.jpg',
  'your-image-url-3.jpg',
];
```

### Contact Information

Update contact details in the Contact section of `HomePage.tsx`:
- Email address
- Phone number
- Business hours
- Location
- Social media links

## File Structure

```
src/
├── pages/
│   ├── HomePage.tsx          # Main public website
│   ├── AdminDashboard.tsx    # Admin control panel
│   └── LoginPage.tsx          # Admin authentication
├── components/               # Reusable components (from old app)
├── contexts/
│   └── AuthContext.tsx       # Authentication state
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── types.ts             # TypeScript interfaces
└── App.tsx                   # Route configuration
```

## Future Enhancements

- [ ] Blog post creation and management UI
- [ ] Image upload to Supabase Storage
- [ ] Email notifications for new inquiries
- [ ] Advanced image editing in admin panel
- [ ] Multi-language support
- [ ] Instagram feed integration
- [ ] Client galleries (password-protected)
- [ ] Online booking calendar integration
- [ ] Print shop with payment processing

## Support & Maintenance

- Database backups are handled automatically by Supabase
- Update portfolio regularly to keep content fresh
- Monitor inquiries dashboard for new client requests
- Review analytics in Supabase Dashboard

## License

Private project - All rights reserved

---

**Built with Claude Code** - December 2024
