import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Mail, Phone, Edit2, Save, Award, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';

export function ProfileModal({ isOpen, onClose }) {
  const { user, updateUserProfile } = useAuth();
  const { tickets, purchasedOrders } = useTickets();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatar: ''
  });

  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const myListings = tickets.filter(t => t.sellerId === user.id);

  const handleSave = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
    setIsEditing(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-profile">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">My Account Profile</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Real member details and ticket trading reputation.
            </p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {savedMessage && (
          <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'rgba(52,211,153,0.15)', border: '1px solid var(--accent-emerald)', color: '#fff', fontSize: '0.8rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="var(--accent-emerald)" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        {/* User Card Header */}
        <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <img src={user.avatar} alt={user.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-active)', flexShrink: 0 }} />

          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                {user.name}
                <ShieldCheck size={16} color="var(--accent-emerald)" />
              </h3>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditing(!isEditing)}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              >
                <Edit2 size={12} />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem', marginBottom: '0.4rem', wordBreak: 'break-all' }}>
              {user.email}
            </p>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(52,211,153,0.12)', color: 'var(--accent-emerald)', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                <Award size={11} style={{ display: 'inline', marginRight: '3px' }} /> {user.trustScore || 100}% Trust
              </span>
              <span style={{ background: 'rgba(56,189,248,0.12)', color: 'var(--accent-cyan)', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Real User Statistics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 0.4rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)' }}>{myListings.length}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Listed</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 0.4rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{purchasedOrders.length}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Purchased</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 0.4rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-amber)' }}>{user.trustScore || 100}%</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score</div>
          </div>
        </div>

        {/* Profile Content / Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Avatar Image URL</label>
              <input
                type="text"
                className="form-input"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your phone number..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio & Member Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Tell buyers/sellers about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm">
                <Save size={13} /> Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
            <div className="meta-row" style={{ marginBottom: '0.4rem' }}>
              <Mail size={14} color="var(--primary)" />
              <span style={{ wordBreak: 'break-all' }}><strong>Email:</strong> {user.email}</span>
            </div>
            <div className="meta-row" style={{ marginBottom: '0.5rem' }}>
              <Phone size={14} color="var(--accent-cyan)" />
              <span><strong>Phone:</strong> {formData.phone || <em style={{ color: 'var(--text-dim)' }}>No phone number added yet</em>}</span>
            </div>
            {formData.bio ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                "{formData.bio}"
              </p>
            ) : (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontStyle: 'italic', margin: 0 }}>
                No bio added yet. Click "Edit Profile" to write a bio.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
