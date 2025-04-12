import '../globals.css';
import Navbar from '../components/Navbar';

export default function Layout({ children }) {
    return (
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500">
            <Navbar />
            {children}
            </div>
    );
}
