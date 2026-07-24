import React from 'react';
import { Search, Calendar, Film, Bus, Plane, Trophy, Activity, Ticket, Filter, RefreshCw } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: Ticket },
  { id: 'Movie', label: 'Movie Tickets', icon: Film },
  { id: 'Bus', label: 'Bus Tickets', icon: Bus },
  { id: 'Flight', label: 'Flight Tickets', icon: Plane },
  { id: 'Cricket', label: 'Cricket Matches', icon: Trophy },
  { id: 'Football', label: 'Football Matches', icon: Activity },
];

export function CategoryFilterBar() {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedDate,
    setSelectedDate,
    maxPrice,
    setMaxPrice,
    availableOnly,
    setAvailableOnly,
    fetchTickets
  } = useTickets();

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedDate('');
    setMaxPrice(500);
    setAvailableOnly(false);
  };

  return (
    <div className="filter-container">
      <div className="search-box">
        {/* Search input */}
        <div className="search-input-group">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search movie, team, bus route, flight, or stadium..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Date Availability Picker */}
        <div className="search-input-group">
          <Calendar size={18} color="var(--text-muted)" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            title="Filter by event date availability"
          />
        </div>

        {/* Price Slider */}
        <div className="search-input-group" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '0.4rem 0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Max Price:</span>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>${maxPrice}</span>
          </div>
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

        {/* Availability Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              style={{ accentColor: 'var(--accent-emerald)', width: '16px', height: '16px' }}
            />
            Available Only
          </label>
        </div>

        {/* Reset button */}
        <button className="btn btn-secondary btn-sm" onClick={resetFilters} title="Reset Filters">
          <RefreshCw size={14} />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="category-pills">
        {CATEGORIES.map((cat) => {
          const IconComp = cat.icon;
          const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
          return (
            <button
              key={cat.id}
              className={`pill-btn ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <IconComp size={16} color={isActive ? '#fff' : 'var(--primary)'} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
