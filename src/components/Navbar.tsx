'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { User } from 'next-auth';
import { Button } from './ui/button';
import { FiMenu, FiX } from 'react-icons/fi'; // Icons for menu open/close

const Navbar = () => {
  const { data: session } = useSession();
  const user: User = session?.user as User;
  
  // State to manage menu visibility on mobile
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="p-4 md:p-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <a className="text-xl font-bold" href="#">Whisper Wave</a>
        <button className="md:hidden" onClick={toggleMenu}>
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Links for larger screens */}
        <div className="hidden md:flex items-center space-x-4">
          {session ? (
            <>
              <span>Welcome, {user?.username || user?.email}</span>
              <Button className="w-full md:w-auto" onClick={() => signOut()}>Logout</Button>
            </>
          ) : (
            <Link href="/sign-in">
              <Button className="w-full md:w-auto">Login</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-4">
          {session ? (
            <>
              <span>Welcome, {user?.username || user?.email}</span>
              <Button className="w-full" onClick={() => signOut()}>Logout</Button>
            </>
          ) : (
            <Link href="/sign-in">
              <Button className="w-full">Login</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

