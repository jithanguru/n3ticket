import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Zap, DollarSign, Send, MessageSquare, CheckCircle, Tag, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export function TicketDetailModal({ ticket, onClose }) {
  const { buyTicket, submitBid } = useTickets();
  const { user } = useAuth();
  const { chatMessages, joinChatRoom, sendChatMessage } = useSocket();

  const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'bid' or 'chat'
  const [bidAmount, setBidAmount] = useState(ticket ? Math.round(ticket.price * 0.85) : 0);
  const [bidNote, setBidNote] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);

  const roomId = ticket ? `room-${ticket.id}` : 'room-global';

  useEffect(() => {
    if (ticket && user) {
      joinChatRoom(roomId, user.name);
    }
  }, [ticket, user, roomId]);

  if (!ticket) return null;

  const isSold = ticket.status === 'Sold';
  const isOwner = user && user.id === ticket.sellerId;

  const handleBuy = async () => {
    setPurchasing(true);
    const res = await buyTicket(ticket.id);
    setPurchasing(false);

    if (res.success) {
      setPurchaseSuccess(res.order);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    await submitBid(ticket.id, bidAmount, bidNote);
    alert(`Offer of $${bidAmount} sent to seller ${ticket.sellerName}!`);
    setBidNote('');
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;
    sendChatMessage(roomId, user.id, user.name, chatInput);
    setChatInput('');
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <span className="ticket-badge-category" style={{ position: 'static' }}>{ticket.category}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <ShieldCheck size={14} /> Guaranteed Authentic
              </span>
            </div>
            <h2 className="modal-title" style={{ fontSize: '1.15rem' }}>{ticket.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {purchaseSuccess ? (
          <div className="qr-stub">
            <CheckCircle size={40} color="var(--accent-emerald)" style={{ margin: '0 auto 0.5rem auto' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff' }}>Ticket Purchased!</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Your digital transfer pass is ready. Show this QR code at the venue or transfer via {ticket.sourcePlatform}.
            </p>

            <div className="qr-box">
              <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" fill="#fff" />
                <path d="M10 10h30v30H10zM60 10h30v30H60zM10 60h30v30H10z" fill="#000" />
                <path d="M20 20h10v10H20zM70 20h10v10H70zM20 70h10v10H20z" fill="#fff" />
                <rect x="45" y="10" width="10" height="40" fill="#000" />
                <rect x="10" y="45" width="40" height="10" fill="#000" />
                <rect x="50" y="55" width="40" height="35" fill="#000" />
              </svg>
            </div>

            <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
              PASS CODE: {purchaseSuccess.qrCode}
            </div>

            <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }} onClick={onClose}>
              Done & View My Wallet
            </button>
          </div>
        ) : (
          <>
            {/* Top Detail Section (Auto-stacks on mobile) */}
            <div className="modal-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <img
                  src={ticket.proofImage || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80'}
                  alt={ticket.title}
                  style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                <div className="meta-row" style={{ fontSize: '0.82rem' }}>
                  <Calendar size={15} color="var(--primary)" />
                  <span><strong>Date:</strong> {ticket.eventDate} ({ticket.eventTime})</span>
                </div>
                <div className="meta-row" style={{ fontSize: '0.82rem' }}>
                  <MapPin size={15} color="var(--accent-cyan)" />
                  <span><strong>Location:</strong> {ticket.venueOrRoute}</span>
                </div>
                <div className="meta-row" style={{ fontSize: '0.82rem' }}>
                  <Tag size={15} color="var(--accent-emerald)" />
                  <span><strong>Seat / Section:</strong> {ticket.seatDetails}</span>
                </div>
                <div className="meta-row" style={{ fontSize: '0.82rem' }}>
                  <ExternalLink size={15} color="var(--text-muted)" />
                  <span><strong>Source:</strong> {ticket.sourcePlatform}</span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', marginTop: '0.35rem', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Listed by Seller:</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.15rem' }}>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{ticket.sellerName}</span>
                    <span style={{ color: 'var(--accent-amber)', fontSize: '0.8rem', fontWeight: 600 }}>
                      ⭐ {ticket.sellerScore}% Score
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {ticket.notes && (
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Seller Instructions:</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic', margin: 0 }}>
                  "{ticket.notes}"
                </p>
              </div>
            )}

            {/* Action Tabs Bar (Flex wraps cleanly on mobile) */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <button
                className={`btn btn-sm ${activeTab === 'buy' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('buy')}
                style={{ flex: '1 1 auto', justifyContent: 'center' }}
              >
                <Zap size={13} /> Buy (${ticket.price})
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'bid' ? 'btn-accent' : 'btn-secondary'}`}
                onClick={() => setActiveTab('bid')}
                style={{ flex: '1 1 auto', justifyContent: 'center' }}
              >
                <DollarSign size={13} /> Make Offer
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'chat' ? 'btn-emerald' : 'btn-secondary'}`}
                onClick={() => setActiveTab('chat')}
                style={{ flex: '1 1 auto', justifyContent: 'center' }}
              >
                <MessageSquare size={13} /> Seller Chat
              </button>
            </div>

            {/* Tab: Buy */}
            {activeTab === 'buy' && (
              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-active)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Final Price:</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                    ${ticket.price}
                  </div>
                </div>

                {!isSold && !isOwner && (
                  <button className="btn btn-primary" onClick={handleBuy} disabled={purchasing} style={{ padding: '0.65rem 1.25rem' }}>
                    <Zap size={16} />
                    <span>{purchasing ? 'Processing...' : 'Confirm & Purchase'}</span>
                  </button>
                )}

                {isOwner && (
                  <div style={{ color: 'var(--accent-amber)', fontSize: '0.85rem', fontWeight: 600 }}>
                    This is your active listing.
                  </div>
                )}

                {isSold && (
                  <div style={{ color: 'var(--accent-rose)', fontWeight: 700, fontSize: '0.85rem' }}>
                    This ticket has been claimed.
                  </div>
                )}
              </div>
            )}

            {/* Tab: Make Offer */}
            {activeTab === 'bid' && (
              <form onSubmit={handleBidSubmit}>
                <div className="form-group">
                  <label className="form-label">Your Bid Offer Amount ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message to Seller</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Can meet in person or transfer instantly."
                    value={bidNote}
                    onChange={(e) => setBidNote(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-accent" style={{ width: '100%', justifyContent: 'center' }}>
                  Submit Price Offer
                </button>
              </form>
            )}

            {/* Tab: Real-Time Live Chat */}
            {activeTab === 'chat' && (
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Encrypted Live Room with Seller: <strong>{ticket.sellerName}</strong>
                </div>

                <div className="chat-box" style={{ height: '140px' }}>
                  {chatMessages.length === 0 ? (
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem', textAlign: 'center', marginTop: '2.5rem' }}>
                      No messages yet. Ask seller questions about seating or transfer!
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`chat-message ${msg.senderId === user?.id ? 'self' : 'other'}`}
                      >
                        <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{msg.senderName} ({msg.time})</div>
                        <div>{msg.text}</div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send size={15} />
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
