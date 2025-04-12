
import '../globals.css';
import AdminNavbar from '../components/adminNavbar';

export default function Layout({ children }) {
    return (
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500">
            <AdminNavbar />
            {children}
            </div>
    );
}
