# ExpenseTracker MVP

A modern, responsive expense tracking web application built with React, TypeScript, Tailwind CSS, and Supabase. Track your expenses, set budgets, and gain insights into your spending habits with a beautiful, intuitive interface.

## Features

### Authentication
- Email/password sign up and login
- Password reset functionality
- Secure session management with Supabase Auth

### Dashboard
- **Prominent Balance Display**: Large, easy-to-read total balance with percentage indicators
- **Colorful Cards**: Gradient cards displaying current month spending and budget limits
- **Quick Add Button**: One-click access to add new expenses
- **Visual Categories Panel**: Grid view of your expense categories with custom icons
- **Activities Chart**: Smooth gradient chart showing weekly spending trends
- **Transaction List**: Clean list view with "Outcome" badges and hover actions

### Transactions
- Manual transaction entry with full validation
- Merchant auto-suggestions based on history
- Smart category suggestions based on merchant
- Payment type selection (Card, UPI, Cash)
- Full transactions page with advanced filters:
  - Search by merchant or note
  - Filter by category
  - Filter by payment type
  - Date range filtering
- Edit and delete with undo functionality

### Categories
- Create custom expense categories
- Icon and color customization
- Visual category management interface
- Default categories included (Food, Transport, Shopping, etc.)

### Budgets
- Set monthly budgets per category
- Real-time budget tracking with visual progress bars
- Budget alerts (warning at 80%, danger at 100%)
- View remaining budget and overspending alerts

### Analytics
- Basic event tracking for user actions
- Sign up, login, and transaction events logged
- Foundation for future analytics dashboard

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Routing**: React Router v6

## Prerequisites

- Node.js 16+ and npm
- A Supabase account and project

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd expense-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

The project includes a `.env` file with Supabase credentials already configured. The database schema has been created automatically.

### 4. Database Setup

The database schema includes:
- **profiles**: User profile information
- **categories**: Expense categories with icons and colors
- **merchants**: Merchant tracking for auto-suggestions
- **transactions**: Core expense records
- **budgets**: Monthly budget limits per category
- **analytics_events**: Event tracking for analytics

All tables have Row Level Security (RLS) enabled to ensure data privacy.

### 5. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 6. Build for production

```bash
npm run build
```

The production build will be created in the `dist` folder.

## Usage Guide

### First Time Setup

1. **Sign Up**: Create an account with your email and password
2. **Default Categories**: The system automatically creates 8 default categories for you
3. **Add First Transaction**: Click the "Add Transaction" button to log your first expense
4. **Set Budget**: Navigate to Budgets and set monthly spending limits for your categories

### Managing Transactions

- **Add**: Click the "Add Expense" button on the dashboard or use the search bar
- **Edit**: Hover over a transaction and click the pencil icon
- **Delete**: Hover over a transaction and click the trash icon (7 seconds to undo)
- **Filter**: Use the transactions page to filter by date, category, or payment type

### Design Highlights

- **Compact Sidebar**: Icon-only navigation with tooltips for clean workspace
- **Top Header Bar**: Global search, notifications, and user profile at a glance
- **Gradient Cards**: Beautiful blue and green gradient cards for key metrics
- **Smooth Charts**: Pink gradient area chart for activity visualization
- **Rounded Corners**: Modern 2xl border radius on all major cards

### Setting Budgets

1. Navigate to the Budgets page
2. Click "Add Budget"
3. Select a category and month
4. Set your spending limit
5. Track progress with visual indicators

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ActivitiesChart.tsx
│   ├── DashboardLayout.tsx
│   ├── PaymentCard.tsx
│   ├── ProtectedRoute.tsx
│   ├── RecentTransactions.tsx
│   ├── SummaryCards.tsx
│   ├── Toast.tsx
│   └── TransactionModal.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── lib/               # Utilities and types
│   ├── analytics.ts
│   ├── supabase.ts
│   └── types.ts
├── pages/             # Page components
│   ├── BudgetsPage.tsx
│   ├── CategoriesPage.tsx
│   ├── DashboardPage.tsx
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── SignUpPage.tsx
│   └── TransactionsPage.tsx
├── App.tsx            # Main app with routing
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Key Design Decisions

### Modern Minimalist Interface
The app features a clean, modern design inspired by contemporary fintech apps with:
- Icon-only compact sidebar (80px width) with tooltip labels
- Prominent balance display at the top
- Gradient cards for visual hierarchy
- Smooth animations and transitions throughout

### Color System
Strategic use of gradients and colors:
- **Blue Gradient**: Primary actions and spending metrics
- **Green Gradient**: Budget and positive indicators
- **Pink/Purple Gradient**: Charts and visual data
- **Red Badges**: Outcome/expense indicators

### Merchant Suggestions
The app learns from your transaction history and suggests merchants and categories as you type, making data entry faster over time.

### Undo Delete
Deleting a transaction shows a toast with an "Undo" option for 7 seconds before permanent deletion, preventing accidental data loss.

### Budget Alerts
Visual indicators show budget status:
- Green: Under 80% of budget
- Yellow: 80-100% of budget
- Red: Over budget

## Security

- All database tables use Row Level Security (RLS)
- Users can only access their own data
- Authentication tokens are securely managed by Supabase
- Password reset uses email verification

## Future Enhancements

Planned for future iterations:
- SMS/Email transaction parsing
- Automated transaction rules
- Receipt uploads and OCR
- Payment method integration
- Recurring transaction detection
- Advanced analytics and reports
- Export to CSV/PDF
- Multi-currency support
- Shared budgets for families

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

For issues or questions, please open an issue on GitHub.
