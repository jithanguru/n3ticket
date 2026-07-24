import React, { useState, useRef, useEffect } from 'react';
import { Ticket, PlusCircle, ShieldCheck, LogOut, Lock, Bell, User, ChevronDown, Wallet, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export function Navbar({ onOpenSellModal, onOpenAuthModal, onOpenDashboard, onOpenProfile, onOpenNotifications, onOpenMessenger, unreadCount }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="navbar">
      <div className="brand-logo">
        <div className="brand-icon">
          <Ticket color="#fff" size={20} />
        </div>
        <span>Ticket<span style={{ color: 'var(--primary)' }}>X</span></span>
      </div>

      <div className="nav-actions">
        {/* Messenger Button */}
        {user && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={onOpenMessenger}
            style={{ padding: '0.5rem 0.75rem' }}
            title="Messages"
          >
            <Send size={15} color="var(--text-muted)" />
            <span>Messages</span>
          </button>
        )}

        {/* Notification Bell Icon */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenNotifications}
          style={{ position: 'relative', padding: '0.5rem 0.75rem' }}
          title="Notifications"
        >
          <Bell size={16} color={unreadCount > 0 ? 'var(--primary)' : 'var(--text-muted)'} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              background: 'var(--accent-rose)',
              color: '#fff',
              fontSize: '0.68rem',
              fontWeight: 700,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        <button className="btn btn-primary" onClick={onOpenSellModal}>
          <PlusCircle size={16} />
          <span>Sell Ticket</span>
        </button>

        {user ? (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            {/* Profile Avatar Trigger Button */}
            <button
              className="btn btn-secondary"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ padding: '0.35rem 0.75rem' }}
            >
              <img src={user.avatar} alt={user.name} className="avatar-sm" />
              <span>{user.name.split(' ')[0]}</span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {/* Profile Dropdown Menu */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '210px',
                background: '#18181b',
                border: '1px solid var(--border-active)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                zIndex: 200,
                padding: '0.4rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem'
              }}>
                <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.2rem' }}>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                </div>

                <button
                  className="dropdown-item"
                  onClick={() => { setDropdownOpen(false); onOpenProfile(); }}
                  style={dropdownItemStyle}
                >
                  <User size={15} color="var(--text-muted)" />
                  <span>My Profile</span>
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => { setDropdownOpen(false); onOpenMessenger(); }}
                  style={dropdownItemStyle}
                >
                  <Send size={15} color="var(--text-muted)" />
                  <span>Messages</span>
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => { setDropdownOpen(false); onOpenDashboard(); }}
                  style={dropdownItemStyle}
                >
                  <Wallet size={15} color="var(--text-muted)" />
                  <span>My Tickets & Wallet</span>
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => { setDropdownOpen(false); onOpenNotifications(); }}
                  style={dropdownItemStyle}
                >
                  <MessageSquare size={15} color="var(--text-muted)" />
                  <span>Notifications & Offers</span>
                </button>

                <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.2rem 0' }}></div>

                {/* LOGOUT BUTTON */}
                <button
                  className="dropdown-item"
                  onClick={() => { setDropdownOpen(false); logout(); }}
                  style={{ ...dropdownItemStyle, color: 'var(--accent-rose)' }}
                >
                  <LogOut size={15} color="var(--accent-rose)" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn btn-secondary" onClick={onOpenAuthModal}>
            <Lock size={15} color="var(--text-muted)" />
            <span>Sign In / Sign Up</span>
          </button>
        )}
      </div>
    </header>
  );
}

const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  width: '100%',
  padding: '0.5rem 0.75rem',
  background: 'transparent',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-main)',
  fontSize: '0.85rem',
  fontWeight: 500,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.15s ease'
};
