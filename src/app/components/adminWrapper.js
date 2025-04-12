// AdminWrapper.js
import { useRouter } from 'next/navigation'; // Make sure to use this import for page-based routing
import { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';

const AdminWrapper = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [isAuthorized, setIsAuthorized] = useState(false); // Track if the user is authorized
  const router = useRouter();
  const secretKey = process.env.JWT_SECRET; // Ensure this is set in your environment variables
  const allowedUsername = 'Gaureesh'; // Set your allowed username here

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt.verify(token, secretKey);
        if (decoded.username === allowedUsername) {
          setIsAuthorized(true); // User is authorized
        } else {
          router.replace('/holdings'); // Redirect to a different page if not authorized
        }
      } catch (error) {
        console.error('Invalid or expired token:', error);
        router.replace('/'); // Redirect to home if token is invalid or expired
      }
    } else {
      router.replace('/'); // Redirect to home if no token is found
    }

    setIsLoading(false); // Set loading to false after processing
  }, [router, secretKey]);

  if (isLoading) {
    return <div>Loading...</div>; // Optionally show a loading state
  }

  if (!isAuthorized) {
    return null; // Render nothing if not authorized
  }

  return <>{children}</>;
};

export default AdminWrapper;
