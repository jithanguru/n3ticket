import React from 'react';
import { Calendar, MapPin, Tag, ShieldCheck, Zap, Film, Bus, Plane, Trophy, Activity, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function TicketCard({ ticket, onSelectTicket, onQuickBuy }) {
  const { user } = useAuth();
  const isOwner = user && user.id === ticket.sellerId;
  const isSold = ticket.status === 'Sold';

  const discountPercent = ticket.originalPrice > ticket.price
    ? Math.round(((ticket.originalPrice - ticket.price) / ticket.originalPrice) * 100)
    : 0;

  const getCategoryIcon = (cat) => {
    switch (cat.toLowerCase()) {
      case 'movie': return Film;
      case 'bus': return Bus;
      case 'flight': return Plane;
      case 'cricket': return Trophy;
      case 'football': return Activity;
      default: return Ticket;
    }
  };

  const IconComp = getCategoryIcon(ticket.category);

  return (
    <div className={`ticket-card ${isSold ? 'sold-out' : ''}`}>
      <div style={{ position: 'relative' }} onClick={() => onSelectTicket(ticket)}>
        <img
          src={ticket.proofImage || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80'}
          alt={ticket.title}
          className="ticket-card-image"
          loading="lazy"
        />
        
        <div className="ticket-badge-category">
          <IconComp size={13} color="var(--text-muted)" />
          <span>{ticket.category}</span>
        </div>

        {discountPercent > 0 && !isSold && (
          <div className="ticket-discount-tag">
            {discountPercent}% OFF
          </div>
        )}

        {isSold && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(9, 9, 11, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1rem',
            color: 'var(--accent-rose)',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            CLAIMED / SOLD
          </div>
        )}
      </div>

      <div className="ticket-body">
        <div>
          <h3 className="ticket-title" onClick={() => onSelectTicket(ticket)} style={{ cursor: 'pointer' }}>
            {ticket.title}
          </h3>

          <div className="ticket-meta">
            <div className="meta-row">
              <Calendar size={14} color="var(--text-dim)" />
              <span>{ticket.eventDate} • {ticket.eventTime}</span>
            </div>

            <div className="meta-row">
              <MapPin size={14} color="var(--text-dim)" />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ticket.venueOrRoute}
              </span>
            </div>

            <div className="meta-row">
              <Tag size={14} color="var(--text-dim)" />
              <span>{ticket.seatDetails}</span>
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={13} color="var(--accent-emerald)" />
              <span>{ticket.sellerName}</span>
              <span style={{ color: 'var(--text-dim)' }}>({ticket.sellerScore}%)</span>
            </div>
            <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.04)', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              {ticket.sourcePlatform}
            </span>
          </div>

          <div className="ticket-footer">
            <div className="price-box">
              {ticket.originalPrice > ticket.price && (
                <span className="original-price">${ticket.originalPrice}</span>
              )}
              <span className="resale-price">${ticket.price}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => onSelectTicket(ticket)}>
                Details
              </button>
              
              {!isSold && !isOwner && (
                <button className="btn btn-primary btn-sm" onClick={() => onQuickBuy(ticket)}>
                  <Zap size={13} />
                  <span>Buy</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
