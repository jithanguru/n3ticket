import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../supabase';

const TicketContext = createContext();

export function TicketProvider({ children }) {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasedOrders, setPurchasedOrders] = useState([]);

  // Active Filter state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [minDiscount, setMinDiscount] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(false);

  // Selected ticket for modal viewing
  const [activeTicket, setActiveTicket] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);

    // If Supabase is configured, fetch directly from Supabase Postgres Database
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('tickets').select('*');
        if (selectedCategory && selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }
        if (availableOnly) {
          query = query.eq('status', 'Available');
        }

        const { data, error } = await query;
        if (!error && data) {
          let result = data.map(t => ({
            id: t.id,
            title: t.title,
            category: t.category,
            eventDate: t.event_date,
            eventTime: t.event_time,
            venueOrRoute: t.venue_or_route,
            seatDetails: t.seat_details,
            originalPrice: t.original_price,
            price: t.price,
            sellerId: t.seller_id,
            sellerName: t.seller_name,
            sellerScore: t.seller_score,
            verifiedSeller: t.verified_seller,
            status: t.status,
            sourcePlatform: t.source_platform,
            proofImage: t.proof_image,
            notes: t.notes
          }));

          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t => t.title.toLowerCase().includes(q) || t.venueOrRoute.toLowerCase().includes(q));
          }
          if (locationQuery) {
            const loc = locationQuery.toLowerCase();
            result = result.filter(t => t.venueOrRoute.toLowerCase().includes(loc));
          }
          if (minDiscount > 0) {
            result = result.filter(t => {
              if (!t.originalPrice || t.originalPrice <= t.price) return false;
              const disc = Math.round(((t.originalPrice - t.price) / t.originalPrice) * 100);
              return disc >= minDiscount;
            });
          }
          if (maxPrice < 500) {
            result = result.filter(t => t.price <= maxPrice);
          }

          setTickets(result);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Supabase fetch notice, falling back to Express API:", err.message);
      }
    }

    // Express API Fallback
    try {
      const queryParams = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') queryParams.append('category', selectedCategory);
      if (searchQuery) queryParams.append('search', searchQuery);
      if (selectedDate) queryParams.append('date', selectedDate);
      if (availableOnly) queryParams.append('availableOnly', 'true');
      if (maxPrice < 500) queryParams.append('maxPrice', maxPrice);

      const res = await fetch(`/api/tickets?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        let result = data.tickets || [];

        if (locationQuery) {
          const loc = locationQuery.toLowerCase();
          result = result.filter(t => t.venueOrRoute.toLowerCase().includes(loc));
        }

        if (minDiscount > 0) {
          result = result.filter(t => {
            if (!t.originalPrice || t.originalPrice <= t.price) return false;
            const disc = Math.round(((t.originalPrice - t.price) / t.originalPrice) * 100);
            return disc >= minDiscount;
          });
        }

        if (minPrice > 0) {
          result = result.filter(t => t.price >= minPrice);
        }

        setTickets(result);
      }
    } catch (err) {
      console.warn("Could not fetch tickets from backend:", err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, locationQuery, selectedDate, availableOnly, minPrice, maxPrice, minDiscount]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const postTicket = async (ticketData) => {
    const newId = `t-${Date.now().toString().slice(-6)}`;
    const formattedTicket = {
      id: newId,
      ...ticketData,
      sellerId: user ? user.id : 'u-101',
      sellerName: user ? user.name : 'Verified Member',
      sellerScore: 100,
      verifiedSeller: true,
      status: 'Available',
      createdAt: new Date().toISOString()
    };

    // If Supabase is configured, insert into Supabase Postgres Table
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('tickets').insert([
          {
            id: formattedTicket.id,
            title: formattedTicket.title,
            category: formattedTicket.category,
            event_date: formattedTicket.eventDate,
            event_time: formattedTicket.eventTime,
            venue_or_route: formattedTicket.venueOrRoute,
            seat_details: formattedTicket.seatDetails,
            original_price: Number(formattedTicket.originalPrice || 0),
            price: Number(formattedTicket.price),
            seller_id: formattedTicket.sellerId,
            seller_name: formattedTicket.sellerName,
            seller_score: 100,
            verified_seller: true,
            status: 'Available',
            source_platform: formattedTicket.sourcePlatform,
            proof_image: formattedTicket.proofImage,
            notes: formattedTicket.notes
          }
        ]);
      } catch (sbErr) {
        console.warn("Supabase ticket insert notice:", sbErr.message);
      }
    }

    // Express API sync
    try {
      await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ticketData)
      });
    } catch (err) {}

    setTickets(prev => [formattedTicket, ...prev]);
    return { success: true, ticket: formattedTicket };
  };

  const editTicket = async (ticketId, updatedFields) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('tickets').update({
          title: updatedFields.title,
          category: updatedFields.category,
          event_date: updatedFields.eventDate,
          event_time: updatedFields.eventTime,
          venue_or_route: updatedFields.venueOrRoute,
          seat_details: updatedFields.seatDetails,
          original_price: Number(updatedFields.originalPrice || 0),
          price: Number(updatedFields.price),
          status: updatedFields.status,
          notes: updatedFields.notes
        }).eq('id', ticketId);
      } catch (err) {}
    }

    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });
    } catch (err) {}

    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...updatedFields } : t));
    return { success: true };
  };

  const changeTicketStatus = async (ticketId, newStatus) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('tickets').update({ status: newStatus }).eq('id', ticketId);
      } catch (err) {}
    }

    try {
      await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {}

    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    return { success: true };
  };

  const deleteTicketListing = async (ticketId) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('tickets').delete().eq('id', ticketId);
      } catch (err) {}
    }

    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {}

    setTickets(prev => prev.filter(t => t.id !== ticketId));
    if (activeTicket && activeTicket.id === ticketId) setActiveTicket(null);
    return { success: true };
  };

  const buyTicket = async (ticketId) => {
    const targetTicket = tickets.find(t => t.id === ticketId);
    if (!targetTicket) return { success: false, error: 'Ticket not found' };

    const mockOrder = {
      id: `ord-${Date.now().toString().slice(-5)}`,
      ticketId: targetTicket.id,
      ticketTitle: targetTicket.title,
      category: targetTicket.category,
      price: targetTicket.price,
      sellerName: targetTicket.sellerName,
      buyerName: user ? user.name : 'Buyer',
      qrCode: `TICKETX-${targetTicket.id}-PASS`,
      status: 'Completed',
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').insert([
          {
            id: mockOrder.id,
            ticket_id: targetTicket.id,
            ticket_title: targetTicket.title,
            category: targetTicket.category,
            price: targetTicket.price,
            seller_id: targetTicket.sellerId,
            seller_name: targetTicket.sellerName,
            buyer_id: user ? user.id : 'u-buyer',
            buyer_name: mockOrder.buyerName,
            qr_code: mockOrder.qrCode,
            status: 'Completed'
          }
        ]);
        await supabase.from('tickets').update({ status: 'Sold' }).eq('id', ticketId);
      } catch (err) {}
    }

    try {
      await fetch(`/api/tickets/${ticketId}/buy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {}

    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'Sold' } : t));
    setPurchasedOrders(prev => [mockOrder, ...prev]);
    return { success: true, order: mockOrder };
  };

  const submitBid = async (ticketId, amount, message) => {
    const bidObj = {
      id: `bid-${Date.now()}`,
      ticketId,
      amount,
      bidderId: user ? user.id : 'u-bidder',
      bidderName: user ? user.name : 'Buyer',
      message
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('bids').insert([
          {
            id: bidObj.id,
            ticket_id: ticketId,
            amount: Number(amount),
            bidder_id: bidObj.bidderId,
            bidder_name: bidObj.bidderName,
            message
          }
        ]);
      } catch (err) {}
    }

    try {
      await fetch(`/api/tickets/${ticketId}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, message })
      });
    } catch (err) {}

    return { success: true, bid: bidObj };
  };

  return (
    <TicketContext.Provider value={{
      tickets,
      loading,
      selectedCategory,
      setSelectedCategory,
      searchQuery,
      setSearchQuery,
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
      setAvailableOnly,
      activeTicket,
      setActiveTicket,
      editingTicket,
      setEditingTicket,
      purchasedOrders,
      postTicket,
      editTicket,
      changeTicketStatus,
      deleteTicketListing,
      buyTicket,
      submitBid,
      fetchTickets
    }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  return useContext(TicketContext);
}
