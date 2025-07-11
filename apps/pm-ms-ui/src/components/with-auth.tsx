// // components/withAuth.tsx
// import { useRouter } from 'next/router';
// import { useEffect } from 'react';
// import { useAuthStore } from '@/stores/authStore';

// export const withAuth = (Component: React.FC) => {
//   return function ProtectedRoute(props: any) {
//     const router = useRouter();
//     const token = useAuthStore((s) => s.token);

//     useEffect(() => {
//       if (!token) {
//         router.replace('/login');
//       }
//     }, [token]);

//     return token ? <Component {...props} /> : null;
//   };
// };
