
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  CheckCircle,
  Clock,
  Zap,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { User } from "@/api/entities";

export default function Landing() {
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const navigate = useNavigate();

  const handleStartFree = async () => {
    try {
      const user = await User.me();
      if (user?.subscription_tier) {
        navigate(createPageUrl("Dashboard"));
      } else {
        navigate(createPageUrl("Signup"));
      }
    } catch (e) {
      navigate(createPageUrl("Signup"));
    }
  };

  const handleLogin = async () => {
    try {
      const user = await User.me();
      if (user) {
        navigate(createPageUrl("Dashboard"));
      } else {
        navigate(createPageUrl("Login"));
      }
    } catch (e) {
      navigate(createPageUrl("Login"));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">CaseGen</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 font-medium">Pricing</a>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleLogin}>
                Login
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleStartFree}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Still second-guessing your financial models?
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Practice on real-world cases and check your work in seconds—no tutor, no guesswork.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
                  onClick={handleStartFree}
                >
                  Start Learning Now
                </Button>
              </div>
              
              <p className="text-sm text-slate-500">
                ✓ 1 Free Case • ✓ No Credit Card Required
              </p>
            </div>
            
            <div className="relative">
              <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl">
                <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium mb-4 inline-block">
                  NPV: $2.4M
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="w-full h-20 bg-gradient-to-r from-blue-400 to-blue-600 rounded mb-2"></div>
                    <div className="text-white text-xs">Revenue Growth</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="w-full h-20 bg-gradient-to-r from-green-400 to-green-600 rounded mb-2"></div>
                    <div className="text-white text-xs">Cash Flow</div>
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-sm">Model Accuracy</span>
                    <span className="text-green-400 text-sm font-bold">94%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{width: '94%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-slate-600">
              Comprehensive tools designed for serious financial modeling practice
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">AI-Generated Cases</h3>
                <p className="text-slate-600">
                  Real-like company scenarios with complete financial datasets to build comprehensive models from scratch.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Validation</h3>
                <p className="text-slate-600">
                  Compare your NPV and IRR calculations against AI-generated answer keys with detailed explanations and formulas.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Complete Models</h3>
                <p className="text-slate-600">
                  Download complete financial models for 3 credits to analyze your approach and refine your modeling skills.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600">
              Simple 4-step process to accelerate your learning
            </p>
          </div>
          
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Generate Case</h3>
              <p className="text-slate-600">
                Select an industry and let AI create a real-like company scenario with all financial parameters and assumptions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Build Model</h3>
              <p className="text-slate-600">
                Download pre-formatted Excel template and build your DCF model with provided data and assumptions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Submit Results</h3>
              <p className="text-slate-600">
                Input your calculated NPV and IRR values to test how close your model matches the AI answer.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Learn & Improve</h3>
              <p className="text-slate-600">
                Download the complete AI solution to understand differences and refine your financial modeling approach.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-slate-600">
              Start free, upgrade when you're ready to accelerate
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <Card className="border-2 border-slate-200 shadow-lg relative">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-slate-900">Free</CardTitle>
                <div className="text-4xl font-bold text-slate-900 mt-4">
                  $0<span className="text-lg text-slate-600">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>1 case (1 credit) per month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Complete model download (3 credits)</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Clock className="w-5 h-5" />
                    <span>All industries (coming soon)</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-6"
                  onClick={handleStartFree}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-blue-600 shadow-xl relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1">
                Most Popular
              </Badge>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-slate-900">Basic</CardTitle>
                <div className="text-4xl font-bold text-slate-900 mt-4">
                  $12<span className="text-lg text-slate-600">/month</span>
                </div>
                <p className="text-sm text-slate-600">or $120/year – save 17%</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>15 cases (15 credits) per month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Complete model downloads (3 credits each)</span>
                  </div>
                   <div className="flex items-center gap-3 text-slate-400">
                    <Clock className="w-5 h-5" />
                    <span>All industries (coming soon)</span>
                  </div>
                </div>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                  Start Basic Trial
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-slate-200 shadow-lg bg-slate-50 text-slate-500">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">Pro</CardTitle>
                <div className="text-4xl font-bold mt-4">
                  $29<span className="text-lg">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <span>Unlimited cases (unlimited credits)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <span>All industries</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <span>Priority support</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-6" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <p className="text-slate-600 mb-4">
              <strong>Pro plan</strong> (unlimited cases, all industries) — coming soon.
            </p>
            <div className="flex max-w-md mx-auto gap-2">
              <Input
                placeholder="Enter email for waitlist"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
              />
              <Button variant="outline">
                Join Waitlist
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Master Financial Modeling?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who've improved their DCF skills with CaseGen
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-4"
              onClick={handleStartFree}
            >
              Start Free Today
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">CaseGen</span>
              </div>
              <p className="text-slate-400 text-sm">
                Master financial modeling with AI-powered practice cases and comprehensive feedback.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Case Studies</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex gap-6 text-sm text-slate-400 mb-4 md:mb-0">
              <span>© 2025 CaseGen. All rights reserved.</span>
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
            </div>
            <div className="text-sm text-slate-400">
              <a href="mailto:support@casegen.app" className="hover:text-white">
                support@casegen.app
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
