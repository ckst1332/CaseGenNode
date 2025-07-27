export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: {
      casesPerMonth: 3,
      modelDownloads: true,
      basicTemplates: true,
      communitySupport: true,
      advancedAnalytics: false,
      prioritySupport: false,
      customScenarios: false
    }
  },
  pro: {
    name: 'Pro',
    price: 29,
    features: {
      casesPerMonth: 50,
      modelDownloads: true,
      basicTemplates: true,
      communitySupport: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customScenarios: true,
      exportOptions: true
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    features: {
      casesPerMonth: 'unlimited',
      modelDownloads: true,
      basicTemplates: true,
      communitySupport: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customScenarios: true,
      exportOptions: true,
      teamCollaboration: true,
      whiteLabel: true
    }
  }
};
