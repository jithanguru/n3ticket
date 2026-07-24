import React from 'react';
import { Film, Bus, Plane, Trophy, Activity, Ticket, MapPin, Calendar, DollarSign, Percent, RefreshCw, Filter, Check } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: Ticket },
  { id: 'Movie', label: 'Movie Tickets', icon: Film },
  { id: 'Bus', label: 'Bus Tickets', icon: Bus },
  { id: 'Flight', label: 'Flight Tickets', icon: Plane },
  { id: 'Cricket', label: 'Cricket Matches', icon: Trophy },
  { id: 'Football', label: 'Football Matches', icon: Activity },
];

const DISCOUNT_OPTIONS = [
  { label: 'Any Discount', value: 0 },
  { label: '10%+ Off', value: 10 },
  { label: '25%+ Off', value: 25 },
  { label: '50%+ Off', value: 50 },
];

export function SidebarFilterPanel() {
  const {
    selectedCategory,
    setSelectedCategory,
    locationQuery,
    setLocationQuery,
    selectedDate,
    setSelectedDate,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    minDiscount,
    setMinDiscount,
    availableOnly,
    setAvailableOnly
  } = useTickets();

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setLocationQuery('');
    setSelectedDate('');
    setMinPrice(0);
    setMaxPrice(500);
    setMinDiscount(0);
    setAvailableOnly(false);
  };

  return (
    <aside className="sidebar-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', margin: 0 }}>Filter Listings</h3>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={resetAllFilters} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
          <RefreshCw size={12} /> Reset
        </button>
      </div>

      {/* 1. Category Panel */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="sidebar-section-title">CATEGORIES</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {CATEGORIES.map((cat) => {
            const IconComp = cat.icon;
            const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`sidebar-cat-item ${isActive ? 'active' : ''}`}
              >
                <IconComp size={16} color={isActive ? '#fff' : 'var(--text-muted)'} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Location Filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="sidebar-section-title">LOCATION / VENUE</div>
        <div className="search-input-group" style={{ padding: '0.5rem 0.75rem' }}>
          <MapPin size={15} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="e.g. London, IMAX, Eden Gardens..."
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            style={{ fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* 3. Price Range Filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span className="sidebar-section-title" style={{ margin: 0 }}>PRICE RANGE</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>${minPrice} - ${maxPrice}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Max Price (${maxPrice})</span>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>
        </div>
      </div>

      {/* 4. Minimum Discount Filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="sidebar-section-title">MINIMUM DISCOUNT</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
          {DISCOUNT_OPTIONS.map((disc) => (
            <button
              key={disc.value}
              onClick={() => setMinDiscount(disc.value)}
              className={`sidebar-discount-btn ${minDiscount === disc.value ? 'active' : ''}`}
            >
              <Percent size={12} />
              <span>{disc.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Date Availability */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="sidebar-section-title">EVENT DATE</div>
        <div className="search-input-group" style={{ padding: '0.5rem 0.75rem' }}>
          <Calendar size={15} color="var(--text-dim)" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* 6. Availability Toggle */}
      <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
        <label style={{ fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            style={{ accentColor: 'var(--accent-emerald)', width: '16px', height: '16px' }}
          />
          Show Available Only
        </label>
      </div>
    </aside>
  );
}
