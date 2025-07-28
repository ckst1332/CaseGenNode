# LLM API Implementation Guide for CaseGenNode

## 🚀 Quick Start (Free Tier)

### Step 1: Get Together AI API Key (FREE)
1. Visit [Together AI](https://api.together.xyz/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Add to your `.env.local`:

```bash
TOGETHER_API_KEY=your-together-ai-api-key-here
```

### Step 2: Test the Implementation
The system automatically detects if `TOGETHER_API_KEY` is present:
- **With API key**: Uses real Llama 3.3 70B model
- **Without API key**: Falls back to enhanced mock responses

## 🏗️ Implementation Framework

### Tier 1: Free Development (CURRENT IMPLEMENTATION)

#### Together AI - Llama 3.3 70B (FREE) ⭐ RECOMMENDED
```javascript
// Already implemented in pages/api/integrations/invoke-llm.js
- Model: meta-llama/Llama-3.3-70B-Instruct-Turbo-Free
- Context: 8K tokens
- Rate Limits: None mentioned
- Cost: FREE
```

**Why Together AI for Free Tier:**
- ✅ 70B parameter model (institutional-grade reasoning)
- ✅ Excellent for complex financial modeling
- ✅ JSON schema compliance
- ✅ No rate limits in free tier
- ✅ Fast inference (<2s response time)

### Tier 2: Production Scale

#### Option A: Anthropic Claude 3.5 Sonnet (PREMIUM)
```javascript
// For production financial modeling
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': ANTHROPIC_API_KEY,
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }]
  })
});
```

**Cost:** ~$3 per 1M input tokens, $15 per 1M output tokens
**Best for:** Complex financial reasoning, regulatory compliance

#### Option B: ShuttleAI (BUDGET)
```javascript
const SHUTTLE_API_KEY = process.env.SHUTTLEAI_API_KEY;

const response = await fetch('https://api.shuttleai.app/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SHUTTLE_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: "shuttle-3",
    messages: [{ role: "user", content: prompt }]
  })
});
```

**Cost:** ~$2-5/month for unlimited usage
**Best for:** High-volume development, cost optimization

## 🔧 Environment Configuration

Add these to your `.env.local` file:

```bash
# Primary LLM (Free Tier)
TOGETHER_API_KEY=your-together-ai-key

# Production LLM (Optional)
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
SHUTTLEAI_API_KEY=your-shuttleai-key

# LLM Selection (Optional)
PRIMARY_LLM_PROVIDER=together
FALLBACK_LLM_PROVIDER=anthropic
```

## 📊 Model Comparison for Case Studies

| Provider | Model | Free Tier | Cost | Financial Reasoning | JSON Compliance | Recommended Use |
|----------|-------|-----------|------|-------------------|-----------------|----------------|
| **Together AI** | Llama 3.3 70B | ✅ Yes | Free | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **Development & Testing** |
| **Anthropic** | Claude 3.5 Sonnet | ❌ No | $3-15/1M tokens | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Production** |
| **ShuttleAI** | Multiple Models | ✅ Credits | ~$5/month | ⭐⭐⭐⭐ | ⭐⭐⭐ | **Budget Production** |
| **OpenAI** | GPT-4 Turbo | ❌ No | $10-30/1M tokens | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **Fallback** |

## 🎯 Implementation Roadmap

### Phase 1: Free Tier Setup (Week 1) ✅ COMPLETE
- [x] Together AI integration implemented
- [x] Automatic fallback to mock responses
- [x] Enhanced error handling
- [x] JSON schema validation

### Phase 2: Multi-Provider Support (Week 2)
```javascript
// lib/llm/provider-manager.js
export class LLMProviderManager {
  constructor() {
    this.providers = {
      together: new TogetherProvider(),
      anthropic: new AnthropicProvider(),
      shuttleai: new ShuttleProvider()
    };
  }
  
  async invoke({ prompt, schema, provider = 'together' }) {
    try {
      return await this.providers[provider].generate({ prompt, schema });
    } catch (error) {
      // Automatic fallback to secondary provider
      const fallback = this.getFallbackProvider(provider);
      return await this.providers[fallback].generate({ prompt, schema });
    }
  }
}
```

### Phase 3: Advanced Features (Week 3-4)
- [ ] Model performance analytics
- [ ] Cost tracking per generation
- [ ] A/B testing different models
- [ ] Caching for common scenarios
- [ ] Rate limiting and queuing

## 🧪 Testing Framework

### Test Case Generation Quality
```javascript
// tests/llm-quality.test.js
describe('LLM Case Generation Quality', () => {
  test('should generate realistic SaaS metrics', async () => {
    const response = await InvokeLLM({
      prompt: getCasePrompt("Technology (SaaS)"),
      response_json_schema: caseSchema
    });
    
    expect(response.starting_point.current_arr).toBeGreaterThan(1000000);
    expect(response.assumptions.financial_assumptions.wacc).toBeBetween(0.08, 0.20);
    expect(response.assumptions.operational_drivers.annual_churn_rate).toBeLessThan(0.30);
  });
});
```

### Financial Model Validation
```javascript
test('should generate mathematically consistent models', async () => {
  const model = await generateFinancialModel(caseData);
  
  // Test formula consistency
  model.income_statement.forEach((year, i) => {
    expect(year.gross_profit).toEqual(year.revenue - year.cogs);
    expect(year.ebitda).toEqual(year.gross_profit - year.opex);
  });
});
```

## 💰 Cost Analysis

### Development Phase (0-1000 cases)
- **Together AI Free**: $0
- **Total Monthly Cost**: $0

### Production Phase (1000-10000 cases/month)
- **Together AI Paid**: ~$50-100/month
- **Or Anthropic**: ~$200-400/month
- **Or ShuttleAI**: ~$15/month

### Enterprise Phase (10000+ cases/month)
- **Dedicated Together AI**: ~$500-1000/month
- **Multi-provider setup**: ~$300-800/month
- **Custom fine-tuning**: ~$1000-3000/month

## 🔒 Security Best Practices

### API Key Management
```javascript
// Use environment variables, never hardcode
const API_KEY = process.env.TOGETHER_API_KEY;

// Validate keys exist before making calls
if (!API_KEY) {
  throw new Error('LLM API key not configured');
}

// Log usage without exposing keys
console.log(`LLM call for user ${userId} using provider ${provider}`);
```

### Rate Limiting
```javascript
// lib/rate-limiter.js
export const rateLimiter = {
  async checkLimit(userId, provider) {
    const key = `llm:${provider}:${userId}`;
    const count = await redis.incr(key);
    
    if (count === 1) {
      await redis.expire(key, 3600); // 1 hour window
    }
    
    return count <= 100; // 100 requests per hour
  }
};
```

## 🚨 Monitoring & Alerts

### Key Metrics to Track
- Response time per provider
- Success/failure rates
- Cost per case generated
- Model output quality scores

### Alert Conditions
- API response time > 10 seconds
- Error rate > 5%
- Daily cost exceeds budget
- Model output validation failures

## 🎓 Best Practices for Case Study Quality

### Prompt Engineering Tips
1. **Be Specific**: Include exact financial constraints
2. **Use Examples**: Provide sample outputs in prompts
3. **Validate Early**: Check critical metrics before full generation
4. **Iterate**: Test different prompt variations

### Schema Design
1. **Required Fields**: Mark essential fields as required
2. **Descriptions**: Include detailed field descriptions
3. **Constraints**: Use min/max values for realistic ranges
4. **Types**: Specify exact data types (number, string, array)

## 📈 Success Metrics

### Technical KPIs
- ✅ Response time < 5 seconds
- ✅ JSON compliance > 95%
- ✅ Financial realism score > 8/10
- ✅ User satisfaction > 4.5/5

### Business KPIs
- ✅ Case generation cost < $0.50 per case
- ✅ User retention > 80%
- ✅ Revenue per case > $2.00
- ✅ Educational value rating > 4.0/5

## 🔄 Next Steps

1. **Immediate**: Test Together AI integration
2. **This Week**: Monitor generation quality
3. **Next Week**: Implement cost tracking
4. **This Month**: Add fallback providers
5. **Next Quarter**: Develop custom fine-tuning

---

**Ready to implement?** Start with Together AI free tier and gradually scale up based on usage patterns and quality requirements. 