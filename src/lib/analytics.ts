import { supabase } from './supabase';

export type AnalyticsEventName =
  | 'sign_up'
  | 'login'
  | 'add_transaction'
  | 'edit_transaction'
  | 'delete_transaction'
  | 'add_category'
  | 'add_budget'
  | 'complete_onboarding';

export async function trackEvent(
  eventName: AnalyticsEventName,
  metadata?: Record<string, any>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('analytics_events').insert({
      user_id: user?.id || null,
      event_name: eventName,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}
