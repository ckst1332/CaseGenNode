import React from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { BarChart3, Target, TrendingUp, CheckCircle } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Target,
      title: 'Realistic Cases',
      description: 'AI-generated DCF cases with plausible financial metrics and growth assumptions'
    },
    {
      icon: TrendingUp,
      title: 'Progressive Difficulty',
      description: 'Start with guided templates and advance to complex modeling scenarios'
    },
    {
      icon: BarChart3,
      title: 'Complete Models',
      description: 'Download full Excel models with solutions and step-by-step explanations'
    }
  ];

  const benefits = [
    'Practice DCF modeling with realistic SaaS companies',
    'Get instant feedback on your financial projections',
    'Download complete Excel models for offline practice',
    'Track your progress across multiple case studies',
    'Access to growing library of case variations'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="relative z-10">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">CaseGen</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                Sign In
              </Button>
            </Link>
            <Button 
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Master Financial
              <span className="text-blue-600"> Modeling</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Practice DCF modeling with AI-generated case studies. Get realistic SaaS companies 
              with complete financial models, answer keys, and downloadable Excel templates.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Button 
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-base"
              >
                Start Learning Free
              </Button>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="px-8 py-3 text-base">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="relative">
                <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">TechFlow SaaS DCF Analysis</h3>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Completed</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Industry:</span>
                        <div className="font-medium">Technology (SaaS)</div>
                      </div>
                      <div>
                        <span className="text-slate-500">ARR:</span>
                        <div className="font-medium">$2.4M</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Growth Rate:</span>
                        <div className="font-medium">45% YoY</div>
                      </div>
                      <div>
                        <span className="text-slate-500">IRR:</span>
                        <div className="font-medium text-green-600">22.3%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Learn by Doing</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to master DCF modeling
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
              {features.map((feature, index) => (
                <div key={index} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-slate-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.title}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-slate-600">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Why Choose CaseGen?
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Designed specifically for finance professionals and students who want to 
                improve their modeling skills with realistic scenarios.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl">
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-slate-900 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Start practicing today
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Join finance professionals who are improving their DCF modeling skills 
                with our AI-generated case studies.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button 
                  onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-base"
                >
                  Get Started Free
                </Button>
                <Link href="/pricing">
                  <Button variant="outline" size="lg" className="px-8 py-3 text-base border-slate-600 text-slate-300 hover:bg-slate-800">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
