export const ONBOARDING_EVENTS = {
  landing_page_view: { page: 'landing' },
  signup_started: { method: 'google' },
  signup_completed: { user_id: null },
  onboarding_started: { step: 1 },
  goal_selected: { goal: null },
  experience_selected: { level: null },
  first_case_generated: { case_id: null },
  onboarding_completed: { time_to_complete: null },
  upgrade_prompt_shown: { trigger: null },
  upgrade_clicked: { plan: null },
  subscription_started: { plan: null, trial: false }
};

export const trackOnboardingEvent = (eventName, properties = {}) => {
  if (typeof window === 'undefined') return;
  const payload = {
    ...ONBOARDING_EVENTS[eventName],
    ...properties,
    event: eventName,
    timestamp: new Date().toISOString()
  };
  // Placeholder: send to analytics provider
  console.log('analytics', payload);
};
