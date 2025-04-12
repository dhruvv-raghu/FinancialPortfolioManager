"use client"

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PageNavbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in by verifying if there's a token in local storage
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from local storage
    alert('You have been logged out.');
    setIsLoggedIn(false); // Update login state
    router.push('/login'); // Redirect to login page
  };

  const NavLink = ({ href, children }) => (
    <Link
      href={href || "/"}
      className="text-white font-bold hover:text-[#4ac1ff] transition-colors duration-200"
    >
      {children}
    </Link>
  );

  return (
    <div className="bg-gradient-to-r from-[#001f3f] to-black p-6">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-[#4ac1ff] font-bold text-xl">
          StockSavvy
        </Link>
        <div className="flex items-center space-x-4">
          <NavLink href="/watchlist">Watchlist</NavLink>
          <NavLink href="/orders">Orders</NavLink>
          <NavLink href="/holdings">Holdings</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-white font-bold hover:text-[#4ac1ff] transition-colors duration-200"
            >
              Logout
            </button>
          ) : (
            <NavLink href="/login">Login</NavLink>
          )}
        </div>
      </div>
    </div>
  );
}
