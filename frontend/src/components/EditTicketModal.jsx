import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle2, Trash2, Upload } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export function EditTicketModal({ ticket, onClose }) {
  const { editTicket, deleteTicketListing } = useTickets();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Movie',
    eventDate: '',
    eventTime: '19:00',
    venueOrRoute: '',
    seatDetails: '',
    originalPrice: '',
    price: '',
    sourcePlatform: '',
    proofImage: '',
    notes: '',
    status: 'Available'
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title || '',
        category: ticket.category || 'Movie',
        eventDate: ticket.eventDate || '',
        eventTime: ticket.eventTime || '19:00',
        venueOrRoute: ticket.venueOrRoute || '',
        seatDetails: ticket.seatDetails || '',
        originalPrice: ticket.originalPrice || '',
        price: ticket.price || '',
        sourcePlatform: ticket.sourcePlatform || '',
        proofImage: ticket.proofImage || '',
        notes: ticket.notes || '',
        status: ticket.status || 'Available'
      });
      setImagePreview(ticket.proofImage || '');
    }
  }, [ticket]);

  if (!ticket) return null;

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
    setSubmitting(true);
    setMessage(null);

    const res = await editTicket(ticket.id, formData);
    setSubmitting(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'Ticket details updated successfully!' });
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 1000);
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update ticket.' });
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the listing "${ticket.title}"?`)) {
      await deleteTicketListing(ticket.id);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Edit Ticket Listing</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Update ticket information or change listing status.
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
              <label className="form-label">Category</label>
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
              <label className="form-label">Listing Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ fontWeight: 600 }}
              >
                <option value="Available">Available (Ready for Sale)</option>
                <option value="Pending">Pending (In Reservation)</option>
                <option value="Sold">Sold (Completed)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Event or Route Title</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Event Date</label>
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
            <label className="form-label">Venue or Location</label>
            <input
              type="text"
              className="form-input"
              value={formData.venueOrRoute}
              onChange={(e) => setFormData({ ...formData, venueOrRoute: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Seat Details</label>
            <input
              type="text"
              className="form-input"
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
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Selling Price ($)</label>
              <input
                type="number"
                className="form-input"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Image Upload / Change Section */}
          <div className="form-group">
            <label className="form-label">Update Ticket Image (From Local Device)</label>
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
                />
              </div>
            )}

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
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleDelete} style={{ color: 'var(--accent-rose)', borderColor: 'rgba(248,113,113,0.25)' }}>
              <Trash2 size={15} /> Delete Listing
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Save size={15} />
                <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
