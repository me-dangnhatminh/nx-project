'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function PageContainer() {
  const router = useRouter();

  useEffect(() => {
    router.push('/signin');
  }, [router]);

  return <section>Redirecting to Sign In...</section>;
}
