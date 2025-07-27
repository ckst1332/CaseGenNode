import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Signup() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/dashboard',
      permanent: false,
    },
  };
}
