"use client"

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');

      if (!token) {
        // Redirect to login if there's no token
        router.push('/login');
      }
    }, [router]);

    // Render the wrapped component if authenticated
    return <Component {...props} />;
  };
}
