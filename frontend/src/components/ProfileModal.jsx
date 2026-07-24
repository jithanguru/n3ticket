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
      <div className="modal-card" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">My Account Profile</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Real member details and ticket trading reputation.
            </p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {savedMessage && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(52,211,153,0.15)', border: '1px solid var(--accent-emerald)', color: '#fff', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} color="var(--accent-emerald)" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        {/* User Card Header showing Actual Real User Data */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img src={user.avatar} alt={user.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-active)' }} />

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.35rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                {user.name}
                <ShieldCheck size={20} color="var(--accent-emerald)" />
              </h3>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 size={14} />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
              {user.email}
            </p>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(52,211,153,0.12)', color: 'var(--accent-emerald)', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Award size={12} /> {user.trustScore || 100}% Trust Rating
              </span>
              <span style={{ background: 'rgba(56,189,248,0.12)', color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                Verified Member
              </span>
            </div>
          </div>
        </div>

        {/* Real User Statistics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)' }}>{myListings.length}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Listed Tickets</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{purchasedOrders.length}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Purchased Tickets</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-amber)' }}>{user.trustScore || 100}%</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Seller Score</div>
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
                rows={3}
                placeholder="Tell buyers/sellers about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                <Save size={15} /> Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div className="meta-row" style={{ marginBottom: '0.5rem' }}>
              <Mail size={16} color="var(--primary)" />
              <span><strong>Email:</strong> {user.email}</span>
            </div>
            <div className="meta-row" style={{ marginBottom: '0.75rem' }}>
              <Phone size={16} color="var(--accent-cyan)" />
              <span><strong>Phone:</strong> {formData.phone || <em style={{ color: 'var(--text-dim)' }}>No phone number added yet</em>}</span>
            </div>
            {formData.bio ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                "{formData.bio}"
              </p>
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontStyle: 'italic', margin: 0 }}>
                No bio added yet. Click "Edit Profile" to write a bio.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
