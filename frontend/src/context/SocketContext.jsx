import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { supabase, isSupabaseConfigured } from '../supabase';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [liveNotification, setLiveNotification] = useState(null);
  const [realNotifications, setRealNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  // Supabase Realtime Postgres Changes Subscription
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const realtimeChannel = supabase
      .channel('ticketx-realtime-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tickets' },
        (payload) => {
          const ticket = payload.new;
          const notif = {
            id: `n-sb-${ticket.id}`,
            type: 'NEW_TICKET',
            title: 'New Ticket Listed (Supabase Realtime)',
            message: `${ticket.title} (${ticket.category}) listed for $${ticket.price}`,
            time: 'Just now',
            ticketId: ticket.id,
            read: false
          };
          setLiveNotification({
            type: 'NEW_TICKET',
            title: '🔥 New Ticket Listed!',
            message: `${ticket.title} - $${ticket.price}`,
            timestamp: new Date().toLocaleTimeString()
          });
          setRealNotifications(prev => [notif, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bids' },
        (payload) => {
          const bid = payload.new;
          const notif = {
            id: `n-bid-${bid.id}`,
            type: 'BID',
            title: 'New Price Offer (Supabase Realtime)',
            message: `${bid.bidder_name || 'Buyer'} submitted an offer of $${bid.amount}`,
            time: 'Just now',
            ticketId: bid.ticket_id,
            read: false
          };
          setRealNotifications(prev => [notif, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new;
          setChatMessages(prev => [...prev, {
            id: msg.id,
            roomId: msg.room_id,
            senderId: msg.sender_id,
            senderName: msg.sender_name,
            text: msg.text,
            time: new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, []);

  // Socket.io WebSocket Connection
  useEffect(() => {
    const socketInstance = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.io Client] Connected with ID:', socketInstance.id);
    });

    socketInstance.on('NEW_TICKET_POSTED', (ticket) => {
      const notif = {
        id: `n-${Date.now()}`,
        type: 'NEW_TICKET',
        title: 'New Ticket Listed',
        message: `${ticket.title} (${ticket.category}) listed for $${ticket.price}`,
        time: 'Just now',
        ticketId: ticket.id,
        read: false
      };

      setLiveNotification({
        type: 'NEW_TICKET',
        title: '🔥 New Ticket Listed!',
        message: `${ticket.title} - $${ticket.price}`,
        timestamp: new Date().toLocaleTimeString()
      });

      setRealNotifications(prev => [notif, ...prev]);
    });

    socketInstance.on('TICKET_SOLD', (data) => {
      const notif = {
        id: `n-${Date.now()}`,
        type: 'SOLD',
        title: 'Ticket Claimed',
        message: `Listing for ${data.order?.ticketTitle || 'a ticket'} was just claimed!`,
        time: 'Just now',
        ticketId: data.ticketId,
        read: false
      };

      setLiveNotification({
        type: 'SOLD',
        title: '⚡ Ticket Just Sold!',
        message: `A listing was claimed!`,
        timestamp: new Date().toLocaleTimeString()
      });

      setRealNotifications(prev => [notif, ...prev]);
    });

    socketInstance.on('NEW_BID', (bid) => {
      const notif = {
        id: `n-${Date.now()}`,
        type: 'BID',
        title: 'New Price Bid Offer',
        message: `${bid.bidderName} submitted an offer of $${bid.amount}`,
        time: 'Just now',
        ticketId: bid.ticketId,
        read: false
      };

      setRealNotifications(prev => [notif, ...prev]);
    });

    socketInstance.on('RECEIVE_MESSAGE', (msg) => {
      setChatMessages(prev => [...prev, msg]);

      const notif = {
        id: `n-${Date.now()}`,
        type: 'ENQUIRY',
        title: `Message from ${msg.senderName}`,
        message: msg.text,
        time: msg.time || 'Just now',
        ticketId: msg.roomId ? msg.roomId.replace('room-', '') : null,
        read: false
      };

      setRealNotifications(prev => [notif, ...prev]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const addRealNotification = (notif) => {
    setRealNotifications(prev => [{ id: `n-${Date.now()}`, read: false, time: 'Just now', ...notif }, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setRealNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const joinChatRoom = (roomId, userName) => {
    if (socket) {
      socket.emit('JOIN_ROOM', { roomId, userName });
    }
  };

  const sendChatMessage = async (roomId, senderId, senderName, text) => {
    if (text.trim()) {
      // Send via Socket.io
      if (socket) {
        socket.emit('SEND_MESSAGE', { roomId, senderId, senderName, text });
      }

      // If Supabase is configured, persist in Supabase Postgres messages table
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('messages').insert([
            { id: `m-${Date.now()}`, room_id: roomId, sender_id: senderId, sender_name: senderName, text }
          ]);
        } catch (err) {
          console.warn("Supabase chat message insert notice:", err.message);
        }
      }
    }
  };

  const clearNotification = () => setLiveNotification(null);

  return (
    <SocketContext.Provider value={{
      socket,
      liveNotification,
      clearNotification,
      realNotifications,
      addRealNotification,
      markAllNotificationsRead,
      chatMessages,
      joinChatRoom,
      sendChatMessage
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
