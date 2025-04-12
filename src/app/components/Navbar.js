import Link from 'next/link';

const Navbar = () => {

  return (
    <div className="bg-gradient-to-r from-[#001f3f] to-black p-6"> {/* Blue-to-black gradient */}
      <div className="flex justify-between items-center">
        <Link href="/" className="text-[#4ac1ff] font-bold text-xl"> {/* Light blue text */}
          StockSavvy
        </Link>
        <div>
          <Link href="/register" className="text-white font-bold px-4 hover:text-[#4ac1ff]"> {/* Hover effect */}
            Sign Up
          </Link>
          <Link href="/login" className="font-bold text-white px-4 hover:text-[#4ac1ff]"> {/* Hover effect */}
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
