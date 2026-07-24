import React from 'react';
import { X, Bell, Ticket, Check, MessageSquare, DollarSign, ArrowRight } from 'lucide-react';

export function NotificationModal({ isOpen, onClose, notifications, onMarkAsRead, onOpenTicketChat }) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-notification">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} color="var(--primary)" />
            <h2 className="modal-title">Notifications</h2>
            {unreadCount > 0 && (
              <span style={{ background: 'var(--accent-rose)', color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '10px' }}>
                {unreadCount} New
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={onMarkAsRead}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              >
                <Check size={12} /> Mark Read
              </button>
            )}
            <button className="close-btn" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
              <Bell size={32} color="var(--text-dim)" style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>No Notifications Yet</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                Real-time activity alerts for ticket listings, bids, and buyer messages will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  background: notif.read ? 'rgba(0,0,0,0.2)' : 'rgba(129, 140, 248, 0.08)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${notif.read ? 'var(--border-subtle)' : 'var(--primary-muted)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: notif.type === 'NEW_TICKET' ? 'rgba(56,189,248,0.15)' : notif.type === 'BID' ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {notif.type === 'NEW_TICKET' && <Ticket size={16} color="var(--accent-cyan)" />}
                  {notif.type === 'BID' && <DollarSign size={16} color="var(--accent-amber)" />}
                  {notif.type === 'ENQUIRY' && <MessageSquare size={16} color="var(--accent-emerald)" />}
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', margin: 0 }}>{notif.title}</h4>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{notif.time}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {notif.message}
                  </p>
                </div>

                {notif.ticketId && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      onClose();
                      if (onOpenTicketChat) onOpenTicketChat(notif.ticketId);
                    }}
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem' }}
                  >
                    View <ArrowRight size={12} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
