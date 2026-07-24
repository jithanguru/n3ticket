import React, { useState } from 'react';
import { X, Bell, MessageSquare, DollarSign, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export function NotificationModal({ isOpen, onClose, notifications, onMarkAsRead, onOpenTicketChat }) {
  const [activeTab, setActiveTab] = useState('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'enquiry') return n.type === 'ENQUIRY' || n.type === 'CHAT';
    if (activeTab === 'bid') return n.type === 'BID';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'ENQUIRY':
      case 'CHAT':
        return <MessageSquare size={18} color="var(--accent-cyan)" />;
      case 'BID':
        return <DollarSign size={18} color="var(--accent-amber)" />;
      default:
        return <Bell size={18} color="var(--primary)" />;
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bell size={22} color="var(--primary)" />
            <div>
              <h2 className="modal-title">Notifications & Enquiries</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Buyer messages, price offers, and ticket trade alerts.
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('all')}
            >
              All ({notifications.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'enquiry' ? 'btn-accent' : 'btn-secondary'}`}
              onClick={() => setActiveTab('enquiry')}
            >
              Enquiries & Messages
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'bid' ? 'btn-emerald' : 'btn-secondary'}`}
              onClick={() => setActiveTab('bid')}
            >
              Price Bids
            </button>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onMarkAsRead}
            style={{ fontSize: '0.78rem' }}
          >
            Mark all read
          </button>
        </div>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
          {filteredNotifications.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
              <Bell size={36} color="var(--text-dim)" style={{ marginBottom: '0.5rem' }} />
              <h4>No notifications yet</h4>
              <p style={{ fontSize: '0.85rem' }}>You're all caught up! Buyer enquiries and price bids will appear here.</p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                style={{
                  background: item.read ? 'var(--bg-card)' : 'rgba(99, 102, 241, 0.1)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: item.read ? '1px solid var(--border-glass)' : '1px solid var(--primary-glow)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  position: 'relative'
                }}
              >
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.6rem', borderRadius: '50%' }}>
                  {getIcon(item.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>{item.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{item.time}</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    {item.message}
                  </p>

                  {item.ticketId && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        onClose();
                        if (onOpenTicketChat) onOpenTicketChat(item.ticketId);
                      }}
                      style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
                    >
                      <span>Open Live Chat / Reply</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
