// Layout.js
import '../globals.css';
import { Toaster } from 'react-hot-toast';
import PageNavbar from '../components/PageNavbar';

export default function Layout({ children }) {
    return (
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500">
            <Toaster /> {/* Include Toaster for notifications */}
            <PageNavbar />
            {children}
        </div>
    );
}
