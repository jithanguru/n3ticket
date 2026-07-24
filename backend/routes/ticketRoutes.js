const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Get categories list
router.get('/categories', (req, res) => {
  res.json({
    categories: [
      { id: 'all', label: 'All Tickets', icon: 'Ticket' },
      { id: 'Movie', label: 'Movie Tickets', icon: 'Film' },
      { id: 'Bus', label: 'Bus Tickets', icon: 'Bus' },
      { id: 'Flight', label: 'Flight Tickets', icon: 'Plane' },
      { id: 'Cricket', label: 'Cricket Matches', icon: 'Trophy' },
      { id: 'Football', label: 'Football Matches', icon: 'Activity' }
    ]
  });
});

// Search and filter tickets
router.get('/tickets', (req, res) => {
  let tickets = db.getTickets();
  const { category, search, date, minPrice, maxPrice, availableOnly } = req.query;

  if (category && category !== 'all' && category !== 'All') {
    tickets = tickets.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    tickets = tickets.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.venueOrRoute.toLowerCase().includes(q) || 
      t.seatDetails.toLowerCase().includes(q) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
    );
  }

  if (date) {
    tickets = tickets.filter(t => t.eventDate === date);
  }

  if (minPrice) {
    tickets = tickets.filter(t => t.price >= Number(minPrice));
  }

  if (maxPrice) {
    tickets = tickets.filter(t => t.price <= Number(maxPrice));
  }

  if (availableOnly === 'true') {
    tickets = tickets.filter(t => t.status === 'Available');
  }

  res.json({
    total: tickets.length,
    tickets
  });
});

// Get single ticket details
router.get('/tickets/:id', (req, res) => {
  const ticket = db.getTickets().find(t => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const bids = db.getBids().filter(b => b.ticketId === req.params.id);
  res.json({ ticket, bids });
});

// Post a new ticket listing
router.post('/tickets', authenticateToken, (req, res) => {
  try {
    const {
      title,
      category,
      eventDate,
      eventTime,
      venueOrRoute,
      seatDetails,
      originalPrice,
      price,
      sourcePlatform,
      proofImage,
      notes,
      tags
    } = req.body;

    if (!title || !category || !eventDate || !price) {
      return res.status(400).json({ error: 'Title, category, event date, and price are required.' });
    }

    const newTicket = {
      id: `t-${uuidv4().slice(0, 6)}`,
      title,
      category,
      eventDate,
      eventTime: eventTime || '18:00',
      venueOrRoute: venueOrRoute || 'General Location',
      seatDetails: seatDetails || 'General Admission',
      originalPrice: Number(originalPrice) || Number(price) * 1.2,
      price: Number(price),
      sellerId: req.user.id,
      sellerName: req.user.name,
      sellerScore: 98,
      verifiedSeller: true,
      status: 'Available',
      sourcePlatform: sourcePlatform || 'Verified Reseller',
      proofImage: proofImage || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
      notes: notes || 'Verified authentic ticket.',
      tags: Array.isArray(tags) ? tags : [category, 'Verified Posting'],
      createdAt: new Date().toISOString()
    };

    db.addTicket(newTicket);

    const io = req.app.get('io');
    if (io) {
      io.emit('NEW_TICKET_POSTED', newTicket);
    }

    res.status(201).json({
      message: 'Ticket posted successfully to global exchange',
      ticket: newTicket
    });
  } catch (err) {
    console.error("Post ticket error:", err);
    res.status(500).json({ error: 'Failed to post ticket' });
  }
});

// Edit ticket listing (PUT /api/tickets/:id)
router.put('/tickets/:id', authenticateToken, (req, res) => {
  const ticket = db.getTickets().find(t => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  if (ticket.sellerId !== req.user.id) {
    return res.status(403).json({ error: 'Only the ticket owner can edit this listing' });
  }

  const {
    title,
    category,
    eventDate,
    eventTime,
    venueOrRoute,
    seatDetails,
    originalPrice,
    price,
    sourcePlatform,
    proofImage,
    notes,
    status
  } = req.body;

  const updates = {};
  if (title) updates.title = title;
  if (category) updates.category = category;
  if (eventDate) updates.eventDate = eventDate;
  if (eventTime) updates.eventTime = eventTime;
  if (venueOrRoute) updates.venueOrRoute = venueOrRoute;
  if (seatDetails) updates.seatDetails = seatDetails;
  if (originalPrice !== undefined) updates.originalPrice = Number(originalPrice);
  if (price !== undefined) updates.price = Number(price);
  if (sourcePlatform) updates.sourcePlatform = sourcePlatform;
  if (proofImage) updates.proofImage = proofImage;
  if (notes !== undefined) updates.notes = notes;
  if (status && ['Available', 'Pending', 'Sold'].includes(status)) updates.status = status;

  const updatedTicket = db.updateTicket(req.params.id, updates);

  const io = req.app.get('io');
  if (io) {
    io.emit('TICKET_UPDATED', updatedTicket);
  }

  res.json({
    message: 'Ticket updated successfully',
    ticket: updatedTicket
  });
});

// Update listing status (PATCH /api/tickets/:id/status)
router.patch('/tickets/:id/status', authenticateToken, (req, res) => {
  const ticket = db.getTickets().find(t => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  if (ticket.sellerId !== req.user.id) {
    return res.status(403).json({ error: 'Only the ticket owner can update status' });
  }

  const { status } = req.body;
  if (!status || !['Available', 'Pending', 'Sold'].includes(status)) {
    return res.status(400).json({ error: 'Valid status required (Available, Pending, Sold)' });
  }

  const updatedTicket = db.updateTicket(req.params.id, { status });

  const io = req.app.get('io');
  if (io) {
    io.emit('TICKET_UPDATED', updatedTicket);
  }

  res.json({
    message: `Ticket status updated to ${status}`,
    ticket: updatedTicket
  });
});

// Buy ticket endpoint
router.post('/tickets/:id/buy', authenticateToken, (req, res) => {
  const ticket = db.getTickets().find(t => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  if (ticket.status !== 'Available') {
    return res.status(400).json({ error: 'Ticket is no longer available' });
  }

  const updatedTicket = db.updateTicket(req.params.id, {
    status: 'Sold',
    buyerId: req.user.id,
    buyerName: req.user.name,
    purchasedAt: new Date().toISOString()
  });

  const newOrder = {
    id: `ord-${uuidv4().slice(0, 6)}`,
    ticketId: ticket.id,
    ticketTitle: ticket.title,
    category: ticket.category,
    price: ticket.price,
    sellerId: ticket.sellerId,
    sellerName: ticket.sellerName,
    buyerId: req.user.id,
    buyerName: req.user.name,
    qrCode: `TICKETX-${ticket.id}-${Date.now()}`,
    status: 'Completed',
    createdAt: new Date().toISOString()
  };

  db.addOrder(newOrder);

  const io = req.app.get('io');
  if (io) {
    io.emit('TICKET_SOLD', { ticketId: ticket.id, order: newOrder });
  }

  res.json({
    message: 'Ticket purchased successfully!',
    ticket: updatedTicket,
    order: newOrder
  });
});

// Submit a bid offer
router.post('/tickets/:id/bids', authenticateToken, (req, res) => {
  const { amount, message } = req.body;
  const ticket = db.getTickets().find(t => t.id === req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Valid bid amount required' });
  }

  const newBid = {
    id: `bid-${uuidv4().slice(0, 6)}`,
    ticketId: ticket.id,
    amount: Number(amount),
    bidderId: req.user.id,
    bidderName: req.user.name,
    message: message || 'Interested in buying this ticket',
    createdAt: new Date().toISOString()
  };

  db.addBid(newBid);

  const io = req.app.get('io');
  if (io) {
    io.emit('NEW_BID', newBid);
  }

  res.status(201).json({
    message: 'Offer submitted to seller',
    bid: newBid
  });
});

// Delete ticket listing
router.delete('/tickets/:id', authenticateToken, (req, res) => {
  const ticket = db.getTickets().find(t => t.id === req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  if (ticket.sellerId !== req.user.id) {
    return res.status(403).json({ error: 'Only the seller can delete this listing' });
  }

  db.deleteTicket(req.params.id);

  const io = req.app.get('io');
  if (io) {
    io.emit('TICKET_DELETED', { ticketId: req.params.id });
  }

  res.json({ message: 'Ticket listing removed successfully' });
});

module.exports = router;
