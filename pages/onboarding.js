import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';

function WelcomeStep({ onNext }) {
  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold">Welcome to CaseGen</h2>
      <p className="text-gray-600">Answer a few quick questions to personalize your first case study.</p>
      <button className="bg-blue-600 text-white px-6 py-3 rounded" onClick={onNext}>Get Started</button>
    </div>
  );
}

function GoalsStep({ userData, setUserData, onNext }) {
  const goals = [
    { id: 'job_prep', title: 'Land a Finance Job' },
    { id: 'skill_building', title: 'Build DCF Skills' },
    { id: 'work_projects', title: 'Analyze Real Deals' }
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">What brings you here?</h2>
      {goals.map(goal => (
        <button
          key={goal.id}
          className="w-full p-4 border rounded hover:bg-blue-50 text-left"
          onClick={() => { setUserData({ ...userData, goal: goal.id }); onNext(); }}
        >
          {goal.title}
        </button>
      ))}
    </div>
  );
}

function ExperienceStep({ userData, setUserData, onNext }) {
  const levels = [
    { id: 'beginner', title: 'New to Finance' },
    { id: 'intermediate', title: 'Some Experience' },
    { id: 'advanced', title: 'Finance Professional' }
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Your experience level?</h2>
      {levels.map(level => (
        <button
          key={level.id}
          className="w-full p-4 border rounded hover:bg-blue-50 text-left"
          onClick={() => { setUserData({ ...userData, experience: level.id }); onNext(); }}
        >
          {level.title}
        </button>
      ))}
    </div>
  );
}

function FirstCaseStep({ userData }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsGenerating(true);
    const t = setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  if (isGenerating) {
    return (
      <div className="text-center">
        <p className="text-lg">Generating your personalized case...</p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold">Your Case Study is Ready!</h2>
      <p className="text-gray-600">Goal: {userData.goal || '-'}, Level: {userData.experience || '-'}</p>
      <button className="bg-blue-600 text-white px-6 py-3 rounded" onClick={() => router.push('/dashboard')}>
        Go to Dashboard
      </button>
    </div>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    if (!session) {
      signIn('google', { callbackUrl: '/onboarding' });
    }
  }, [session]);

  const steps = [
    { id: 1, component: WelcomeStep },
    { id: 2, component: GoalsStep },
    { id: 3, component: ExperienceStep },
    { id: 4, component: FirstCaseStep }
  ];

  const StepComponent = steps[step - 1].component;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-lg shadow">
        <div className="text-right text-sm text-gray-500">Step {step} of {steps.length}</div>
        <StepComponent userData={userData} setUserData={setUserData} onNext={() => setStep(step + 1)} />
      </div>
    </div>
  );
}
