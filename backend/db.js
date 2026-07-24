const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

const DATA_FILE = path.join(__dirname, 'data.json');

// Real Data Only Store: Initialized with empty datasets for user-created content
const INITIAL_SEED = {
  users: [],
  tickets: [],
  orders: [],
  bids: [],
  chats: []
};

class LocalDB {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Could not read local data file, initializing clean database:", e.message);
    }
    this.saveData(INITIAL_SEED);
    return INITIAL_SEED;
  }

  saveData(dataToSave) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave || this.data, null, 2));
    } catch (e) {
      console.error("Error saving data file:", e.message);
    }
  }

  getUsers() { return this.data.users; }
  getTickets() { return this.data.tickets; }
  getOrders() { return this.data.orders; }
  getBids() { return this.data.bids; }
  getChats() { return this.data.chats; }

  addUser(user) {
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  addTicket(ticket) {
    this.data.tickets.unshift(ticket);
    this.saveData();
    return ticket;
  }

  updateTicket(id, updates) {
    const idx = this.data.tickets.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.data.tickets[idx] = { ...this.data.tickets[idx], ...updates };
      this.saveData();
      return this.data.tickets[idx];
    }
    return null;
  }

  deleteTicket(id) {
    this.data.tickets = this.data.tickets.filter(t => t.id !== id);
    this.saveData();
    return true;
  }

  addOrder(order) {
    this.data.orders.unshift(order);
    this.saveData();
    return order;
  }

  addBid(bid) {
    this.data.bids.unshift(bid);
    this.saveData();
    return bid;
  }

  addChatMessage(msg) {
    this.data.chats.push(msg);
    this.saveData();
    return msg;
  }
}

const db = new LocalDB();

module.exports = {
  db,
  supabase
};
