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
      <div className="modal-card" style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="ticket-badge-category" style={{ position: 'static' }}>{ticket.category}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <ShieldCheck size={14} /> Guaranteed Authentic
              </span>
            </div>
            <h2 className="modal-title">{ticket.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}><X size={22} /></button>
        </div>

        {purchaseSuccess ? (
          <div className="qr-stub">
            <CheckCircle size={44} color="var(--accent-emerald)" style={{ margin: '0 auto 0.5rem auto' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#fff' }}>Ticket Purchased!</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Your digital transfer pass is ready. Show this QR code at the venue or transfer via {ticket.sourcePlatform}.
            </p>

            <div className="qr-box">
              {/* SVG QR Code Simulation */}
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" fill="#fff" />
                <path d="M10 10h30v30H10zM60 10h30v30H60zM10 60h30v30H10z" fill="#000" />
                <path d="M20 20h10v10H20zM70 20h10v10H70zM20 70h10v10H20z" fill="#fff" />
                <rect x="45" y="10" width="10" height="40" fill="#000" />
                <rect x="10" y="45" width="40" height="10" fill="#000" />
                <rect x="50" y="55" width="40" height="35" fill="#000" />
              </svg>
            </div>

            <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
              PASS CODE: {purchaseSuccess.qrCode}
            </div>

            <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={onClose}>
              Done & View My Wallet
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <img
                  src={ticket.proofImage}
                  alt={ticket.title}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}
                />
              </div>

              <div style={{ display: 'flex', flexContent: 'space-between', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="meta-row">
                  <Calendar size={16} color="var(--primary)" />
                  <span><strong>Date:</strong> {ticket.eventDate} ({ticket.eventTime})</span>
                </div>
                <div className="meta-row">
                  <MapPin size={16} color="var(--accent-cyan)" />
                  <span><strong>Location:</strong> {ticket.venueOrRoute}</span>
                </div>
                <div className="meta-row">
                  <Tag size={16} color="var(--accent-emerald)" />
                  <span><strong>Seat / Section:</strong> {ticket.seatDetails}</span>
                </div>
                <div className="meta-row">
                  <ExternalLink size={16} color="var(--text-muted)" />
                  <span><strong>Source:</strong> {ticket.sourcePlatform}</span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Listed by Seller:</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{ticket.sellerName}</span>
                    <span style={{ color: 'var(--accent-amber)', fontSize: '0.85rem', fontWeight: 700 }}>
                      ⭐ {ticket.sellerScore}% Trust Rating
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Seller Notes:</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                "{ticket.notes || 'Verified authentic ticket listing on TicketX.'}"
              </p>
            </div>

            {/* Action Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
              <button
                className={`btn btn-sm ${activeTab === 'buy' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('buy')}
              >
                <Zap size={14} /> Instant Buy (${ticket.price})
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'bid' ? 'btn-accent' : 'btn-secondary'}`}
                onClick={() => setActiveTab('bid')}
              >
                <DollarSign size={14} /> Make Offer / Bid
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'chat' ? 'btn-emerald' : 'btn-secondary'}`}
                onClick={() => setActiveTab('chat')}
              >
                <MessageSquare size={14} /> Live Seller Chat
              </button>
            </div>

            {/* Tab: Buy */}
            {activeTab === 'buy' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(99, 102, 241, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-glow)' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Final Total Price:</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                    ${ticket.price}
                  </div>
                </div>

                {!isSold && !isOwner && (
                  <button className="btn btn-primary" onClick={handleBuy} disabled={purchasing}>
                    <Zap size={18} />
                    <span>{purchasing ? 'Processing Escrow...' : 'Confirm & Purchase Now'}</span>
                  </button>
                )}

                {isOwner && (
                  <div style={{ color: 'var(--accent-amber)', fontSize: '0.9rem', fontWeight: 600 }}>
                    This is your active ticket listing.
                  </div>
                )}

                {isSold && (
                  <div style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>
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
                    placeholder="e.g. Can meet in person or transfer instantly via app."
                    value={bidNote}
                    onChange={(e) => setBidNote(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>
                  Submit Price Offer
                </button>
              </form>
            )}

            {/* Tab: Real-Time Live Chat */}
            {activeTab === 'chat' && (
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Socket.io Encrypted Chat Room with Seller: <strong>{ticket.sellerName}</strong>
                </div>

                <div className="chat-box">
                  {chatMessages.length === 0 ? (
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center', marginTop: '3rem' }}>
                      No messages yet. Ask the seller questions about seat view or barcode transfer!
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`chat-message ${msg.senderId === user?.id ? 'self' : 'other'}`}
                      >
                        <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>{msg.senderName} ({msg.time})</div>
                        <div>{msg.text}</div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type a message to the seller..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send size={16} />
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
