# Quick Setup Guide

## Step 1: Create Your First Admin User

You need to create an admin account to access the dashboard at `/admin/login`.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User** button
4. Enter your email and password
5. Click **Create User**

### Option B: Using Sign Up Page (Temporary)

If you want to use the sign-up flow:

1. Temporarily add a sign-up route to `App.tsx`:
```tsx
<Route path="/admin/signup" element={<SignUpPage />} />
```

2. Visit `/admin/signup` and create your account
3. Remove the route after creating your account

## Step 2: Add Sample Portfolio Images (Optional)

If you want to populate your portfolio with sample images for testing, run this SQL in Supabase SQL Editor:

```sql
-- Insert sample portfolio images
INSERT INTO portfolio_images (title, description, image_url, is_featured, display_order) VALUES
  (
    'Golden Hour Bride',
    'Beautiful bridal portrait captured during golden hour at sunset',
    'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=800',
    true,
    1
  ),
  (
    'Romantic Couple Portrait',
    'Intimate moment between newlyweds in natural lighting',
    'https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=800',
    true,
    2
  ),
  (
    'Wedding Ceremony',
    'Candid shot from a beautiful outdoor wedding ceremony',
    'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=800',
    false,
    3
  ),
  (
    'Family Portrait',
    'Joyful family captured in a natural outdoor setting',
    'https://images.pexels.com/photos/1682497/pexels-photo-1682497.jpeg?auto=compress&cs=tinysrgb&w=800',
    false,
    4
  ),
  (
    'Corporate Headshot',
    'Professional business portrait with clean background',
    'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=800',
    false,
    5
  ),
  (
    'Event Photography',
    'Dynamic shot from a corporate event',
    'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800',
    false,
    6
  );
```

## Step 3: Test the Website

1. **Public Site**: Visit `http://localhost:5173`
   - Check hero carousel is working
   - Test portfolio filters
   - Try the contact form
   - Verify testimonials carousel

2. **Admin Dashboard**: Visit `http://localhost:5173/admin/login`
   - Login with your admin credentials
   - Verify all sections load correctly
   - Test inquiry status changes

## Step 4: Customize Content

### Update Photographer Information

Edit `src/pages/HomePage.tsx`:

1. **Hero Text** (around line 210):
```tsx
<h1>Your Custom Headline</h1>
<p>Your custom tagline</p>
```

2. **About Section** (around line 360):
```tsx
<h2>About Me</h2>
<p>Your bio text here...</p>
```

3. **Contact Information** (around line 800):
```tsx
<a href="mailto:your@email.com">your@email.com</a>
<a href="tel:+1234567890">+1 234-567-890</a>
<div>Your Location</div>
```

4. **Social Links** (around line 870):
```tsx
<a href="https://instagram.com/yourusername">
<a href="https://facebook.com/yourpage">
```

### Update Branding

1. **Site Name**: Search for "Alex Rivera Photography" and replace throughout the codebase

2. **Meta Tags**: Edit `index.html` to update SEO information

3. **Logo**: Replace the Camera icon with your logo image if desired

## Step 5: Deploy to Production

### Option A: Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Option B: Netlify

1. Push code to GitHub
2. Connect to Netlify
3. Add environment variables
4. Set build command: `npm run build`
5. Set publish directory: `dist`

### Option C: Other Platforms

Any platform that supports Vite/React apps will work:
- Cloudflare Pages
- Render
- Railway
- etc.

## Common Issues

### "Missing Supabase environment variables"
- Make sure `.env` file exists with correct values
- Restart dev server after adding `.env`

### Portfolio images not showing
- Add some images via admin dashboard or SQL
- Check image URLs are accessible

### Can't login to admin
- Verify user exists in Supabase Auth
- Check email/password are correct
- Clear browser cache and try again

### Contact form not submitting
- Check Supabase connection
- Verify inquiries table has proper RLS policies
- Check browser console for errors

## Next Steps

1. **Replace Sample Images**: Upload your actual photography work
2. **Update Services**: Customize packages and pricing for your market
3. **Add Real Testimonials**: Replace samples with actual client reviews
4. **Set Up Analytics**: Add Google Analytics to track visitors
5. **SEO Optimization**: Submit sitemap to Google Search Console
6. **Social Media**: Connect your Instagram/Facebook accounts

## Need Help?

- Check Supabase documentation: https://supabase.com/docs
- React documentation: https://react.dev
- Tailwind CSS: https://tailwindcss.com

---

Happy photographing! 📸
