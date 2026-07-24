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
      <div className="modal-card modal-dashboard">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src={user.avatar} alt={user.name} style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid var(--border-subtle)', flexShrink: 0 }} />
            <div style={{ overflow: 'hidden' }}>
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0, fontSize: '0.98rem' }}>
                {user.name}
                <ShieldCheck size={16} color="var(--accent-emerald)" />
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email} • ({user.trustScore || 100}% Trust)
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Dashboard Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${activeTab === 'wallet' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('wallet')}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
          >
            <Ticket size={14} /> My Wallet ({purchasedOrders.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'my_listings' ? 'btn-accent' : 'btn-secondary'}`}
            onClick={() => setActiveTab('my_listings')}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
          >
            <QrCode size={14} /> My Listings ({myListings.length})
          </button>
        </div>

        {/* Tab: Wallet */}
        {activeTab === 'wallet' && (
          <div>
            {purchasedOrders.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                <Ticket size={32} color="var(--text-dim)" style={{ marginBottom: '0.4rem' }} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Your Ticket Wallet is Empty</h4>
                <p style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>Purchased tickets will appear here with QR transfer stubs.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {purchasedOrders.map((ord) => (
                  <div key={ord.id} style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-active)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <div className="ticket-badge-category" style={{ position: 'static', display: 'inline-flex', marginBottom: '0.25rem' }}>{ord.category}</div>
                      <h4 style={{ color: '#fff', fontSize: '0.92rem', fontWeight: 600, margin: 0 }}>{ord.ticketTitle}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>Seller: {ord.sellerName} • ${ord.price}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#fff', background: 'rgba(0,0,0,0.4)', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                        {ord.qrCode}
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>Verified</span>
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
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                <QrCode size={32} color="var(--text-dim)" style={{ marginBottom: '0.4rem' }} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>No Active Listings</h4>
                <p style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>Click "Sell Ticket" in the navigation bar to post a listing!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {myListings.map((t) => (
                  <div key={t.id} style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-main)', fontWeight: 600, background: '#18181b', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                            {t.category}
                          </span>
                          <h4 style={{ color: '#fff', fontSize: '0.92rem', fontWeight: 600, margin: 0 }}>{t.title}</h4>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Date: <strong>{t.eventDate}</strong> • Price: <strong style={{ color: '#fff' }}>${t.price}</strong>
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => onEditTicket(t)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}>
                          <Edit size={12} /> Edit
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(t.id, t.title)} style={{ color: 'var(--accent-rose)', borderColor: 'rgba(248,113,113,0.25)', padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Status Management Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Status: <strong style={{
                          color: t.status === 'Available' ? 'var(--accent-emerald)' : t.status === 'Pending' ? 'var(--accent-amber)' : 'var(--accent-rose)'
                        }}>{t.status}</strong>
                      </div>

                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button
                          className={`btn btn-sm ${t.status === 'Available' ? 'btn-emerald' : 'btn-secondary'}`}
                          onClick={() => handleStatusChange(t.id, 'Available')}
                          style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}
                        >
                          <CheckCircle2 size={11} /> Avail
                        </button>
                        <button
                          className={`btn btn-sm ${t.status === 'Pending' ? 'btn-accent' : 'btn-secondary'}`}
                          onClick={() => handleStatusChange(t.id, 'Pending')}
                          style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}
                        >
                          <Clock size={11} /> Pend
                        </button>
                        <button
                          className={`btn btn-sm ${t.status === 'Sold' ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => handleStatusChange(t.id, 'Sold')}
                          style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}
                        >
                          <XCircle size={11} /> Sold
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
