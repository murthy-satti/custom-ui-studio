import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import Home from './pages/Home';
import Components from './pages/Components';
import Customize from './pages/Customize';
import ContactPage from './pages/Contact';

function AppContent() {
  const location = useLocation();
  const showFooter = location.pathname === '/';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-800 flex flex-col overflow-x-hidden max-w-full">
      <Navbar />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/components" element={<Components />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/contact" element={<ContactPage/>} />
        </Routes>
        {showFooter && <Footer />}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Toaster
        position="top-center"
        toastOptions={{
          success: {
            style: {
              background: '#d1fae5', // Light green (Tailwind green-100)
              color: '#065f46',      // Dark green text (Tailwind green-900)
              border: '1px solid #6ee7b7',
              fontWeight: 500,
            },
            iconTheme: {
              primary: '#10b981', // Tailwind green-500
              secondary: '#d1fae5',
            },
          },
          error: {
            style: {
              background: '#fee2e2', // Light red (Tailwind red-100)
              color: '#991b1b',      // Dark red text (Tailwind red-900)
              border: '1px solid #fca5a5',
              fontWeight: 500,
            },
            iconTheme: {
              primary: '#ef4444', // Tailwind red-500
              secondary: '#fee2e2',
            },
          },
        }}
      />
      <AppContent />
    </Router>
  );
}

export default App;
