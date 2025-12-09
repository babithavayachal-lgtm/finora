import { supabase } from './supabase';
import { AlertSetting, GeneratedAlert, Category, Budget } from './types';
import { formatCurrency } from './currency';

export async function generateAlerts(
  userId: string,
  currency: string
): Promise<GeneratedAlert[]> {
  const alerts: GeneratedAlert[] = [];
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

  // Fetch alert settings
  const { data: alertSettings, error: settingsError } = await supabase
    .from('alert_settings')
    .select('*')
    .eq('user_id', userId)
    .eq('is_enabled', true);

  // If table doesn't exist yet, return empty alerts
  if (settingsError && (settingsError.code === 'PGRST204' || settingsError.message?.includes('alert_settings'))) {
    return alerts;
  }

  if (!alertSettings || alertSettings.length === 0) {
    return alerts;
  }

  // Fetch current month budgets and spending
  const [budgetsRes, transactionsRes, categoriesRes] = await Promise.all([
    supabase
      .from('budgets')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .eq('month', currentMonth),
    supabase
      .from('transactions')
      .select('category_id, amount')
      .eq('user_id', userId)
      .gte('date', `${currentMonth}-01`)
      .lte('date', `${currentMonth}-31`),
    supabase.from('categories').select('*').eq('user_id', userId),
  ]);

  const budgets = (budgetsRes.data || []) as (Budget & { category: Category })[];
  const transactions = transactionsRes.data || [];
  const categories = categoriesRes.data || [];

  // Calculate spending per category
  const categorySpending = new Map<string, number>();
  transactions.forEach((t) => {
    const current = categorySpending.get(t.category_id) || 0;
    categorySpending.set(t.category_id, current + parseFloat(t.amount.toString()));
  });

  // Calculate total budget and spending
  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount.toString()), 0);
  const totalSpending = Array.from(categorySpending.values()).reduce((sum, val) => sum + val, 0);

  // Process each alert setting
  for (const setting of alertSettings as AlertSetting[]) {
    if (setting.alert_type === 'category_threshold' && setting.category_id) {
      const budget = budgets.find((b) => b.category_id === setting.category_id);
      if (!budget) continue;

      const spending = categorySpending.get(setting.category_id) || 0;
      const budgetAmount = parseFloat(budget.amount.toString());
      const percentage = budgetAmount > 0 ? (spending / budgetAmount) * 100 : 0;

      if (percentage >= setting.threshold_percentage) {
        const category = categories.find((c) => c.id === setting.category_id);
        alerts.push({
          id: `category-${setting.id}-${Date.now()}`,
          type: percentage >= 100 ? 'error' : 'warning',
          title: 'Budget Alert',
          message: `You have exceeded ${setting.threshold_percentage}% of your ${category?.name || 'category'} budget (${percentage.toFixed(1)}% used - ${formatCurrency(spending, currency)} / ${formatCurrency(budgetAmount, currency)})`,
          timestamp: new Date(),
          alert_setting_id: setting.id,
        });
      }
    } else if (setting.alert_type === 'total_budget_threshold') {
      const percentage = totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0;

      if (percentage >= setting.threshold_percentage) {
        alerts.push({
          id: `total-${setting.id}-${Date.now()}`,
          type: percentage >= 100 ? 'error' : 'warning',
          title: 'Total Budget Alert',
          message: `You have exceeded ${setting.threshold_percentage}% of your total monthly budget (${percentage.toFixed(1)}% used - ${formatCurrency(totalSpending, currency)} / ${formatCurrency(totalBudget, currency)})`,
          timestamp: new Date(),
          alert_setting_id: setting.id,
        });
      }
    } else if (setting.alert_type === 'monthly_completion') {
      // Check monthly completion - show alert if we're at the end of month or start of next month
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const daysInMonth = lastDayOfMonth.getDate();
      const currentDay = now.getDate();
      
      // Show completion alert if we're in the last 3 days of the month or first day of next month
      const isNearMonthEnd = currentDay >= daysInMonth - 2 || (now.getMonth() !== new Date().getMonth());
      
      if (isNearMonthEnd && totalBudget > 0) {
        const percentage = (totalSpending / totalBudget) * 100;
        const isWithinBudget = percentage <= 100;

        if (isWithinBudget) {
          alerts.push({
            id: `completion-${setting.id}-${currentMonth}`,
            type: 'success',
            title: 'Monthly Goal Achieved! 🎉',
            message: `Congratulations! You completed the month within your budget. You spent ${formatCurrency(totalSpending, currency)} out of ${formatCurrency(totalBudget, currency)} (${percentage.toFixed(1)}%)`,
            timestamp: new Date(),
            alert_setting_id: setting.id,
          });
        } else {
          alerts.push({
            id: `completion-over-${setting.id}-${currentMonth}`,
            type: 'error',
            title: 'Monthly Budget Exceeded',
            message: `You exceeded your monthly budget by ${formatCurrency(totalSpending - totalBudget, currency)}. Total spending: ${formatCurrency(totalSpending, currency)} / ${formatCurrency(totalBudget, currency)} (${percentage.toFixed(1)}%)`,
            timestamp: new Date(),
            alert_setting_id: setting.id,
          });
        }
      }
    }
  }

  // Deduplicate alerts by alert_setting_id + title to avoid repeated alerts flooding
  const unique = new Map<string, GeneratedAlert>();
  alerts.forEach((a) => {
    const key = `${a.alert_setting_id || a.id}-${a.title}`;
    if (!unique.has(key)) {
      unique.set(key, a);
    }
  });

  return Array.from(unique.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

