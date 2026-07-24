import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export function SellTicketModal({ isOpen, onClose }) {
  const { postTicket } = useTickets();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Movie',
    eventDate: new Date().toISOString().split('T')[0],
    eventTime: '19:00',
    venueOrRoute: '',
    seatDetails: '',
    originalPrice: '',
    price: '',
    sourcePlatform: 'BookMyShow',
    proofImage: '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  if (!isOpen) return null;

  // Handle local device file selection (Base64 conversion for instant preview & storage)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image file size must be less than 5MB.' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setImagePreview(base64Data);
        setFormData(prev => ({ ...prev, proofImage: base64Data }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, proofImage: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.venueOrRoute) {
      setMessage({ type: 'error', text: 'Please complete all required fields.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const res = await postTicket(formData);
    setSubmitting(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'Ticket successfully listed for sale!' });
      setTimeout(() => {
        onClose();
        setMessage(null);
        setImagePreview('');
      }, 1000);
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to list ticket.' });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Post Ticket for Sale</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              List your movie, bus, flight, or match tickets for peer-to-peer resale.
            </p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {message && (
          <div style={{
            padding: '0.7rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem',
            background: message.type === 'error' ? 'rgba(248,113,113,0.12)' : 'rgba(52,211,153,0.12)',
            border: `1px solid ${message.type === 'error' ? 'var(--accent-rose)' : 'var(--accent-emerald)'}`,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem'
          }}>
            {message.type === 'error' ? <AlertCircle size={16} color="var(--accent-rose)" /> : <CheckCircle2 size={16} color="var(--accent-emerald)" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Movie">Movie</option>
                <option value="Bus">Bus Route</option>
                <option value="Flight">Flight</option>
                <option value="Cricket">Cricket Match</option>
                <option value="Football">Football Match</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Platform Purchased From</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. BookMyShow, Ticketmaster, FlixBus"
                value={formData.sourcePlatform}
                onChange={(e) => setFormData({ ...formData, sourcePlatform: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Event or Route Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Avatar 3 IMAX OR India vs Australia T20"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Event Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Event Time</label>
              <input
                type="time"
                className="form-input"
                value={formData.eventTime}
                onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Venue or Location *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Grand Cinema IMAX or Eden Gardens Stand B"
              value={formData.venueOrRoute}
              onChange={(e) => setFormData({ ...formData, venueOrRoute: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Seat & Section Details</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Row H, Seat 14-15"
              value={formData.seatDetails}
              onChange={(e) => setFormData({ ...formData, seatDetails: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Original Price ($)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 50"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Selling Price ($) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 35"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Local Device Image Upload Section */}
          <div className="form-group">
            <label className="form-label">Upload Ticket Image / Proof (From Local Device)</label>
            
            {imagePreview || formData.proofImage ? (
              <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-active)', marginBottom: '0.5rem' }}>
                <img src={imagePreview || formData.proofImage} alt="Ticket preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={removeImage}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', color: 'var(--accent-rose)', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Remove image"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div style={{ border: '2px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center', background: 'rgba(0,0,0,0.3)', marginBottom: '0.5rem', cursor: 'pointer' }}>
                <Upload size={24} color="var(--primary)" style={{ marginBottom: '0.35rem' }} />
                <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 500 }}>
                  Click to choose an image from your computer / device
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                  Supports PNG, JPG, WEBP (Max 5MB)
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
                />
              </div>
            )}

            {/* Optional Image URL Input Fallback */}
            <input
              type="text"
              className="form-input"
              placeholder="Or paste an image web URL (https://...)"
              value={formData.proofImage}
              onChange={(e) => {
                setFormData({ ...formData, proofImage: e.target.value });
                setImagePreview(e.target.value);
              }}
              style={{ fontSize: '0.8rem' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Instructions for Buyer</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Will transfer barcode right after secure payment."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Publishing...' : 'List Ticket for Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
