import '../globals.css';
import PageNavbar from '../components/PageNavbar';

export default function Layout({ children }) {
    return (
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500">
            <PageNavbar />
            {children}
            
            </div>
    );
}
