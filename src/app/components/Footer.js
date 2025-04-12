import Link from 'next/link';
import { FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <div className="bg-gradient-to-r from-[#001f3f] to-black text-white py-6">
      <div className="container mx-auto text-center">
        <p className="text-sm text-gray-300">&copy; 2024 YourCompany. All rights reserved.</p>
        <div className="flex justify-center mt-4 space-x-6">
          <Link href="https://www.instagram.com" target="_blank" aria-label="Instagram">
            <FaInstagram className="text-[#4ac1ff] text-2xl hover:text-[#39a0e5]" /> {/* Light blue icon */}
          </Link>
          <Link href="https://www.linkedin.com" target="_blank" aria-label="LinkedIn">
            <FaLinkedin className="text-[#4ac1ff] text-2xl hover:text-[#39a0e5]" />
          </Link>
          <Link href="https://www.twitter.com" target="_blank" aria-label="Twitter">
            <FaTwitter className="text-[#4ac1ff] text-2xl hover:text-[#39a0e5]" />
          </Link>
        </div>
        <div className="mt-4">
          <Link href="/faqs" className="text-sm text-gray-300 hover:text-white">
            FAQ's
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
