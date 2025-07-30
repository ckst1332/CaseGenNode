import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { BarChart3, Mail, CheckCircle2 } from 'lucide-react';

// DCF Model Mockup Component
const DCFModelMockup = () => {
  return (
    <div className="relative max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
        {/* Header with completion indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            100%
          </div>
        </div>

        {/* Mock spreadsheet rows */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-150 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>

        {/* Central circular progress and grade */}
        <div className="flex items-center justify-center py-8">
          <div className="relative">
            {/* Progress circle */}
            <div className="w-24 h-24 rounded-full border-8 border-gray-200 relative">
              <div className="absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent transform rotate-45"></div>
              <div className="absolute inset-2 bg-blue-50 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">A+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success rate indicator */}
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">95%</div>
            <div className="text-sm text-green-700">Success Rate</div>
          </div>
        </div>

        {/* DCF Model label */}
        <div className="text-center">
          <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
            DCF Model
          </span>
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const [stats, setStats] = useState({
    totalUsers: 1000,
    totalCases: 50,
    successRate: 95,
    aiAccuracy: 99
  });

  useEffect(() => {
    // Fetch real statistics from API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats/landing');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.log('Using default stats'); // Fallback to defaults
      }
    };
    
    fetchStats();
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Head>
        <title>CaseGen - Master DCF Modeling with AI-Powered Practice</title>
        <meta name="description" content="Build confidence for investment banking interviews with realistic DCF modeling scenarios and real-time AI feedback. Join 1000+ students practicing with 50+ scenarios." />
        <meta name="keywords" content="DCF modeling, investment banking, financial modeling, interview prep, AI practice" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="CaseGen - Master DCF Modeling" />
        <meta property="og:description" content="AI-powered DCF modeling practice for investment banking interviews" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://casegen.app" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700">
      {/* Header */}
      <header className="relative z-10">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-white">CaseGen</span>
          </div>
          <div className="hidden lg:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-white/90 hover:text-white transition-colors"
            >
              Features
            </button>
            <Link href="/pricing" className="text-white/90 hover:text-white transition-colors">
              Pricing
            </Link>
            <button 
              onClick={() => scrollToSection('about')}
              className="text-white/90 hover:text-white transition-colors"
            >
              About
            </button>
            <Button 
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              variant="outline"
              className="border-white/20 text-white hover:bg-white hover:text-purple-600 transition-all"
              aria-label="Join Beta Waitlist"
            >
              Join Beta
            </Button>
          </div>
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button 
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              variant="outline"
              className="border-white/20 text-white hover:bg-white hover:text-purple-600 transition-all"
              aria-label="Join Beta Waitlist"
            >
              Join Beta
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 lg:flex lg:items-center lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-6xl xl:text-7xl">
              Master DCF
              <br />
              Modeling
              <br />
              <span className="bg-gradient-to-r from-pink-400 to-pink-300 bg-clip-text text-transparent">
                With AI-Powered
              </span>
              <br />
              Practice
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/90 lg:text-xl">
              Build confidence for investment banking interviews with
              <br />
              realistic scenarios and real-time feedback
            </p>
            <div className="mt-10">
              <Button 
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                size="lg"
                className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all focus:ring-4 focus:ring-pink-300"
                aria-label="Join Beta Waitlist with Google"
              >
                <Mail className="w-5 h-5 mr-2" />
                Join the Beta Wait-list
              </Button>
            </div>
          </div>
          
          {/* DCF Model Mockup */}
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none">
            <DCFModelMockup />
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-white">{stats.totalUsers}+</div>
              <div className="text-white/80 mt-2">Students Ready</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-white">{stats.totalCases}+</div>
              <div className="text-white/80 mt-2">Practice Scenarios</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-white">{stats.successRate}%</div>
              <div className="text-white/80 mt-2">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-white">{stats.aiAccuracy}%</div>
              <div className="text-white/80 mt-2">AI Accuracy</div>
            </div>
          </div>
        </div>

        {/* Hidden sections for navigation */}
        <div id="features" className="h-1"></div>
        <div id="about" className="h-1"></div>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center text-white/60 text-sm">
              Built with Next.js • Powered by Together AI • Secured by Supabase
            </div>
          </div>
        </footer>
      </main>
      </div>
    </>
  );
};

export default Landing;
