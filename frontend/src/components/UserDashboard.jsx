import React from 'react';
import { ShieldCheck, Ticket, QrCode, Edit, Trash2, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';

export function UserDashboard({ isOpen, onClose, onEditTicket }) {
  const { user } = useAuth();
  const { tickets, purchasedOrders, changeTicketStatus, deleteTicketListing } = useTickets();
  const [activeTab, setActiveTab] = React.useState('wallet');

  if (!isOpen || !user) return null;

  const myListings = tickets.filter(t => t.sellerId === user.id);

  const handleStatusChange = async (ticketId, newStatus) => {
    await changeTicketStatus(ticketId, newStatus);
  };

  const handleDelete = async (ticketId, title) => {
    if (window.confirm(`Are you sure you want to delete the listing "${title}"?`)) {
      await deleteTicketListing(ticketId);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src={user.avatar} alt={user.name} style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid var(--border-subtle)' }} />
            <div>
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                {user.name}
                <ShieldCheck size={18} color="var(--accent-emerald)" />
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {user.email} • Verified Member ({user.trustScore || 100}% Rating)
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Dashboard Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
          <button
            className={`btn btn-sm ${activeTab === 'wallet' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('wallet')}
          >
            <Ticket size={15} /> My Ticket Wallet ({purchasedOrders.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'my_listings' ? 'btn-accent' : 'btn-secondary'}`}
            onClick={() => setActiveTab('my_listings')}
          >
            <QrCode size={15} /> My Listed Tickets ({myListings.length})
          </button>
        </div>

        {/* Tab: Wallet */}
        {activeTab === 'wallet' && (
          <div>
            {purchasedOrders.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                <Ticket size={36} color="var(--text-dim)" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ fontWeight: 600 }}>Your Ticket Wallet is Empty</h4>
                <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>Tickets you purchase will be stored here with digital QR stubs.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {purchasedOrders.map((ord) => (
                  <div key={ord.id} style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-active)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="ticket-badge-category" style={{ position: 'static', display: 'inline-flex', marginBottom: '0.4rem' }}>{ord.category}</div>
                      <h4 style={{ color: '#fff', fontSize: '0.98rem', fontWeight: 600 }}>{ord.ticketTitle}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Seller: {ord.sellerName} • Price: ${ord.price}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#fff', background: 'rgba(0,0,0,0.4)', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                        {ord.qrCode}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>Pass Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: My Listed Tickets */}
        {activeTab === 'my_listings' && (
          <div>
            {myListings.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                <QrCode size={36} color="var(--text-dim)" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ fontWeight: 600 }}>No Active Ticket Listings</h4>
                <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>Click "Sell a Ticket" in the navbar to list movie, bus, flight, or match tickets!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myListings.map((t) => (
                  <div key={t.id} style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-main)', fontWeight: 600, background: '#18181b', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                            {t.category}
                          </span>
                          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: 0 }}>{t.title}</h4>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                          Date: <strong>{t.eventDate}</strong> • Price: <strong style={{ color: '#fff' }}>${t.price}</strong> • Venue: {t.venueOrRoute}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => onEditTicket(t)} title="Edit Listing Details">
                          <Edit size={13} /> Edit
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(t.id, t.title)} style={{ color: 'var(--accent-rose)', borderColor: 'rgba(248,113,113,0.25)' }} title="Delete Listing">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Status Management Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Status: <strong style={{
                          color: t.status === 'Available' ? 'var(--accent-emerald)' : t.status === 'Pending' ? 'var(--accent-amber)' : 'var(--accent-rose)'
                        }}>{t.status}</strong>
                      </div>

                      {/* Quick Status Buttons */}
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          className={`btn btn-sm ${t.status === 'Available' ? 'btn-emerald' : 'btn-secondary'}`}
                          onClick={() => handleStatusChange(t.id, 'Available')}
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                        >
                          <CheckCircle2 size={12} /> Available
                        </button>
                        <button
                          className={`btn btn-sm ${t.status === 'Pending' ? 'btn-accent' : 'btn-secondary'}`}
                          onClick={() => handleStatusChange(t.id, 'Pending')}
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                        >
                          <Clock size={12} /> Pending
                        </button>
                        <button
                          className={`btn btn-sm ${t.status === 'Sold' ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => handleStatusChange(t.id, 'Sold')}
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                        >
                          <XCircle size={12} /> Sold
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
