import { useState, useEffect } from 'react';
import { Book, User } from './types';
import { BookCard } from './components/BookCard';
import { MyLibrary } from './components/MyLibrary';
import { LegalPages } from './components/LegalPages';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { BookOpen, ShoppingCart, User as UserIcon, Menu, FileText, Shield, RefreshCw, Phone, Mail } from 'lucide-react';
import { verifyPurchase, getDownloadUrl } from './utils/stripe';

// Real book data with Stripe Price IDs (you'll get these from Stripe Dashboard)
const BOOKS: Book[] = [
  {
    id: 'mastering-price-action',
    title: 'Mastering Price Action',
    subtitle: 'Complete Guide to Chart Patterns',
    description: 'Learn to read market movements like a pro. This comprehensive guide covers candlestick patterns, support & resistance, and advanced price action strategies used by professional traders.',
    price: 49,
    coverImage: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?w=600&h=800&fit=crop',
    pdfUrl: '/books/mastering-price-action.pdf',
    stripePriceId: 'price_1234567890', // Replace with real Stripe Price ID
    features: [
      '200+ pages of content',
      '50+ chart examples',
      'Trading checklists',
      'Risk management strategies'
    ]
  },
  {
    id: 'risk-management-blueprint',
    title: 'Risk Management Blueprint',
    subtitle: 'Protect Your Capital & Grow Consistently',
    description: 'The missing piece in most traders\' success. Learn position sizing, portfolio risk, and psychological discipline to survive and thrive in the markets.',
    price: 39,
    coverImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&h=800&fit=crop',
    pdfUrl: '/books/risk-management-blueprint.pdf',
    stripePriceId: 'price_1234567891', // Replace with real Stripe Price ID
    features: [
      'Position sizing calculators',
      'Portfolio allocation strategies',
      'Trading journal templates',
      'Psychology exercises'
    ]
  },
  {
    id: 'scalping-fibonacci',
    title: 'Scalping with Fibonacci',
    subtitle: 'Precision Entry & Exit Points',
    description: 'Master the art of scalping using Fibonacci retracements and extensions. Learn to identify high-probability setups in any market condition.',
    price: 59,
    coverImage: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=600&h=800&fit=crop',
    pdfUrl: '/books/scalping-fibonacci.pdf',
    stripePriceId: 'price_1234567892', // Replace with real Stripe Price ID
    features: [
      'Fibonacci trading strategies',
      'Time zone analysis',
      'Multiple timeframe approach',
      'Live trade examples'
    ]
  },
  {
    id: 'forex-psychology-mastery',
    title: 'Forex Psychology Mastery',
    subtitle: 'Develop the Winning Trader Mindset',
    description: 'Overcome fear, greed, and emotional trading. Build the mental toughness required for consistent profitability in the forex market.',
    price: 45,
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=800&fit=crop',
    pdfUrl: '/books/forex-psychology-mastery.pdf',
    stripePriceId: 'price_1234567893', // Replace with real Stripe Price ID
    features: [
      'Mindset transformation exercises',
      'Emotional control techniques',
      'Trading routine templates',
      'Performance tracking systems'
    ]
  },
  {
    id: 'advanced-technical-analysis',
    title: 'Advanced Technical Analysis',
    subtitle: 'Professional Chart Reading Skills',
    description: 'Take your technical analysis to the next level. Learn advanced indicators, market structure, and multi-timeframe analysis from institutional traders.',
    price: 69,
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=800&fit=crop',
    pdfUrl: '/books/advanced-technical-analysis.pdf',
    stripePriceId: 'price_1234567894', // Replace with real Stripe Price ID
    features: [
      'Advanced indicator combinations',
      'Market structure analysis',
      'Institutional trading concepts',
      'Algorithmic trading basics'
    ]
  },
  {
    id: 'complete-trading-system',
    title: 'Complete Trading System',
    subtitle: 'From Setup to Execution',
    description: 'A complete, tested trading system you can implement immediately. Includes entry rules, exit strategies, and trade management protocols.',
    price: 89,
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=800&fit=crop',
    pdfUrl: '/books/complete-trading-system.pdf',
    stripePriceId: 'price_1234567895', // Replace with real Stripe Price ID
    features: [
      'Complete trading rules',
      'Backtesting results',
      'Trade management protocols',
      'Performance metrics'
    ]
  }
];

export default function App() {
  const [purchasedBookIds, setPurchasedBookIds] = useState<string[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [legalPage, setLegalPage] = useState<'terms' | 'privacy' | 'refund' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user and purchases on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Check for existing user session (you'd use a real auth system here)
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      
      if (userId && userEmail) {
        setUser({ id: userId, email: userEmail });
        
        // Load purchased books from backend
        const purchases = await loadPurchases(userId);
        setPurchasedBookIds(purchases);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPurchases = async (userId: string): Promise<string[]> => {
    // In production, this would call your backend API
    // For now, we'll use localStorage as fallback
    try {
      const response = await fetch(`/api/purchases?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        return data.purchases || [];
      }
    } catch (error) {
      console.error('Error loading purchases:', error);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('purchases');
    return stored ? JSON.parse(stored) : [];
  };

  const handleDownload = async (bookId: string) => {
    if (!user) {
      alert('Please sign in to download your purchased books.');
      return;
    }

    try {
      const downloadUrl = await getDownloadUrl(bookId, user.id);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download. Please try again or contact support.');
    }
  };

  const handleSignIn = () => {
    // In production, redirect to your auth page
    const email = prompt('Enter your email to sign in:');
    if (email) {
      const userId = 'user_' + Date.now();
      localStorage.setItem('userId', userId);
      localStorage.setItem('userEmail', email);
      setUser({ id: userId, email });
      loadUserData();
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    setUser(null);
    setPurchasedBookIds([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  const ownedBooks = BOOKS.filter(book => purchasedBookIds.includes(book.id));

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-amber-400" />
              <span className="text-xl font-bold text-slate-100">TradeLearn</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                className="flex items-center gap-2 text-slate-300 hover:text-amber-400 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                My Library
                {ownedBooks.length > 0 && (
                  <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">
                    {ownedBooks.length}
                  </Badge>
                )}
              </button>
            </nav>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400 hidden sm:block">{user.email}</span>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-slate-100"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleSignIn}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
            Master Forex Trading with
            <span className="text-amber-400"> Professional E-Books</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-4">
            Comprehensive guides written by professional traders. Learn price action, 
            risk management, and trading psychology.
          </p>
          {/* Added Name Here */}
          <p className="text-lg text-amber-400 font-semibold mb-8">
            Created by Akwasi_forex
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Secure Payments
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Instant Download
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="w-4 h-4" />
              Lifetime Access
            </span>
          </div>
        </div>

        {/* My Library Section */}
        {ownedBooks.length > 0 && (
          <MyLibrary
            books={ownedBooks}
            isOpen={isLibraryOpen}
            onToggle={() => setIsLibraryOpen(!isLibraryOpen)}
            onClose={() => setIsLibraryOpen(false)}
            onDownload={handleDownload}
          />
        )}

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BOOKS.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isPurchased={purchasedBookIds.includes(book.id)}
              userId={user?.id || null}
              onPurchase={() => {}}
              onDownload={handleDownload}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800/50 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6 text-amber-400" />
                <span className="text-lg font-bold text-slate-100">TradeLearn</span>
              </div>
              <p className="text-slate-400 text-sm">
                Professional forex trading education for serious traders. 
                Learn from the experts and take your trading to the next level.
              </p>
            </div>
            
            <div>
              <h3 className="text-slate-100 font-semibold mb-4">Legal</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setLegalPage('terms')}
                  className="block text-sm text-slate-400 hover:text-amber-400 transition-colors"
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => setLegalPage('privacy')}
                  className="block text-sm text-slate-400 hover:text-amber-400 transition-colors"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setLegalPage('refund')}
                  className="block text-sm text-slate-400 hover:text-amber-400 transition-colors"
                >
                  Refund Policy
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-slate-100 font-semibold mb-4">Contact</h3>
              <div className="space-y-3">
                <a 
                  href="mailto:ebenezerakwasi111@gmail.com"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  ebenezerakwasi111@gmail.com
                </a>
                <a 
                  href="tel:0031649025957"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +31 649 025 957
                </a>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Trading involves risk. Past performance does not guarantee future results.
              </p>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-500">
            © 2024 TradeLearn by Akwasi_forex. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Legal Pages Modal */}
      <LegalPages />
    </div>
  );
}