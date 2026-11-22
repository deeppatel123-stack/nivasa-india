import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CompareTray } from '@/components/compare/CompareTray';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { ToastViewport } from '@/components/ui/ToastViewport';
import { AboutPage } from '@/pages/AboutPage';
import { AddPropertyPage } from '@/pages/AddPropertyPage';
import { AssistantPage } from '@/pages/AssistantPage';
import { ComparePage } from '@/pages/ComparePage';
import { ContactPage } from '@/pages/ContactPage';
import { FAQPage } from '@/pages/FAQPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { ManageListingsPage } from '@/pages/ManageListingsPage';
import { MapDiscoveryPage } from '@/pages/MapDiscoveryPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { OwnerDashboardPage } from '@/pages/OwnerDashboardPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { PropertyDetailsPage } from '@/pages/PropertyDetailsPage';
import { RecentlyViewedPage } from '@/pages/RecentlyViewedPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SearchResultsPage } from '@/pages/SearchResultsPage';
import { TermsPage } from '@/pages/TermsPage';
import { WishlistPage } from '@/pages/WishlistPage';
function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [pathname]);
    return null;
}
export default function App() {
    return (<ErrorBoundary>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<HomePage />}/>
            <Route path="/explore" element={<SearchResultsPage />}/>
            <Route path="/search" element={<SearchResultsPage />}/>
            <Route path="/map" element={<MapDiscoveryPage />}/>
            <Route path="/property/:id" element={<PropertyDetailsPage />}/>
            <Route path="/compare" element={<ComparePage />}/>
            <Route path="/assistant" element={<AssistantPage />}/>
            <Route path="/login" element={<LoginPage />}/>
            <Route path="/register" element={<RegisterPage />}/>
            <Route path="/forgot-password" element={<ForgotPasswordPage />}/>
            <Route path="/profile" element={<ProfilePage />}/>
            <Route path="/wishlist" element={<WishlistPage />}/>
            <Route path="/recently-viewed" element={<RecentlyViewedPage />}/>
            <Route path="/owner/dashboard" element={<OwnerDashboardPage />}/>
            <Route path="/owner/add-property" element={<AddPropertyPage />}/>
            <Route path="/owner/listings" element={<ManageListingsPage />}/>
            <Route path="/contact" element={<ContactPage />}/>
            <Route path="/about" element={<AboutPage />}/>
            <Route path="/faq" element={<FAQPage />}/>
            <Route path="/privacy" element={<PrivacyPage />}/>
            <Route path="/terms" element={<TermsPage />}/>
            <Route path="*" element={<NotFoundPage />}/>
          </Routes>
        </main>
        <Footer />
        <CompareTray />
        <ToastViewport />
      </div>
    </ErrorBoundary>);
}
