import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { TicketProvider, useTickets } from './context/TicketContext';
import { SocketProvider, useSocket } from './context/SocketContext';

import { Navbar } from './components/Navbar';
import { SidebarFilterPanel } from './components/SidebarFilterPanel';
import { TicketCard } from './components/TicketCard';
import { SellTicketModal } from './components/SellTicketModal';
import { EditTicketModal } from './components/EditTicketModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { UserDashboard } from './components/UserDashboard';
import { AuthModal } from './components/AuthModal';
import { NotificationModal } from './components/NotificationModal';
import { ProfileModal } from './components/ProfileModal';
import { MessengerModal } from './components/MessengerModal';
import { MobileBottomNav } from './components/MobileBottomNav';

import { Ticket, Film, Bus, Plane, Trophy, Activity, Search } from 'lucide-react';

const CATEGORY_CAROUSEL = [
  { id: 'all', label: 'All', icon: Ticket },
  { id: 'Movie', label: 'Movies', icon: Film },
  { id: 'Bus', label: 'Bus Routes', icon: Bus },
  { id: 'Flight', label: 'Flights', icon: Plane },
  { id: 'Cricket', label: 'Cricket', icon: Trophy },
  { id: 'Football', label: 'Football', icon: Activity }
];

function MarketplaceContent() {
  const {
    tickets,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    activeTicket,
    setActiveTicket,
    editingTicket,
    setEditingTicket
  } = useTickets();

  const { realNotifications, markAllNotificationsRead } = useSocket();

  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const unreadCount = realNotifications.filter(n => !n.read).length;

  const handleOpenTicketChat = (ticketId) => {
    setIsMessengerOpen(true);
  };

  const handleQuickBuy = async (ticket) => {
    setActiveTicket(ticket);
  };

  const handleEditTicketFromDashboard = (ticket) => {
    setEditingTicket(ticket);
  };

  return (
    <div className="app-container">
      <Navbar
        onOpenSellModal={() => setIsSellOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenMessenger={() => setIsMessengerOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">
          Universal Peer-to-Peer <span>Ticket Trading Exchange</span>
        </h1>
        <p className="hero-subtitle">
          Buy & sell unused tickets safely. Escrow verification for Movies, Bus routes, Flight seats, Cricket matches, and Football tournaments.
        </p>

        {/* Minimalist Monochrome Category Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
          <div className="hero-category-badge" onClick={() => setSelectedCategory('Movie')}>
            <Film size={14} color="var(--text-muted)" /> Movie Tickets
          </div>
          <div className="hero-category-badge" onClick={() => setSelectedCategory('Bus')}>
            <Bus size={14} color="var(--text-muted)" /> Bus Routes
          </div>
          <div className="hero-category-badge" onClick={() => setSelectedCategory('Flight')}>
            <Plane size={14} color="var(--text-muted)" /> Flights
          </div>
          <div className="hero-category-badge" onClick={() => setSelectedCategory('Cricket')}>
            <Trophy size={14} color="var(--text-muted)" /> Cricket Matches
          </div>
          <div className="hero-category-badge" onClick={() => setSelectedCategory('Football')}>
            <Activity size={14} color="var(--text-muted)" /> Football Tickets
          </div>
        </div>
      </section>

      {/* Two-Column Marketplace Layout */}
      <div className="marketplace-layout">
        {/* Left Sidebar Filter Panel */}
        <SidebarFilterPanel />

        {/* Right Main Grid Area */}
        <div className="main-grid-content">
          {/* Mobile Quick Category Carousel Bar */}
          <div className="mobile-category-carousel">
            {CATEGORY_CAROUSEL.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`mobile-cat-pill ${isActive ? 'active' : ''}`}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Top Search & Results Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <div className="search-input-group" style={{ flex: 1, padding: '0.5rem 0.85rem' }}>
              <Search size={16} color="var(--text-dim)" />
              <input
                type="text"
                placeholder="Search movie, team, bus route, flight, or stadium..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Showing <strong style={{ color: '#fff' }}>{tickets.length}</strong> available
            </div>
          </div>

          {/* Ticket Cards Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <div className="pulse-dot" style={{ width: '20px', height: '20px', margin: '0 auto 1rem auto' }}></div>
              <p>Loading live ticket listings...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
              <Ticket size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>No matching tickets found</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Try adjusting your categories, location, price, or discount filters.
              </p>
              <button className="btn btn-primary" onClick={() => setIsSellOpen(true)}>
                Be the first to post a ticket
              </button>
            </div>
          ) : (
            <div className="ticket-grid">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onSelectTicket={(t) => setActiveTicket(t)}
                  onQuickBuy={handleQuickBuy}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Native Bottom Navigation Bar */}
      <MobileBottomNav
        onOpenSellModal={() => setIsSellOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenMessenger={() => setIsMessengerOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onToggleFilter={() => setMobileFilterOpen(!mobileFilterOpen)}
        unreadCount={unreadCount}
      />

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '60px' }}>
        <p>© 2026 TicketX Exchange. Verified Peer-to-Peer Ticket Resale Marketplace. All Rights Reserved.</p>
      </footer>

      {/* Modals */}
      <SellTicketModal isOpen={isSellOpen} onClose={() => setIsSellOpen(false)} />
      <EditTicketModal ticket={editingTicket} onClose={() => setEditingTicket(null)} />
      <TicketDetailModal ticket={activeTicket} onClose={() => setActiveTicket(null)} />
      <UserDashboard isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} onEditTicket={handleEditTicketFromDashboard} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={realNotifications}
        onMarkAsRead={markAllNotificationsRead}
        onOpenTicketChat={handleOpenTicketChat}
      />
      <MessengerModal isOpen={isMessengerOpen} onClose={() => setIsMessengerOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TicketProvider>
        <SocketProvider>
          <MarketplaceContent />
        </SocketProvider>
      </TicketProvider>
    </AuthProvider>
  );
}
