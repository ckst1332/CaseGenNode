import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Signup() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/Dashboard');
  }, [router]);

  return null;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/Dashboard',
      permanent: false,
    },
  };
}
