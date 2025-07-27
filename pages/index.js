import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function IndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
}
