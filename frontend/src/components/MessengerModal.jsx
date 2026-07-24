import React, { useState, useEffect } from 'react';
import { X, Send, Search, ShieldCheck, Ticket, Info, ThumbsUp, Image, Paperclip, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export function MessengerModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { chatMessages, sendChatMessage } = useSocket();

  // Dynamic Real Conversations State (Starts empty for real user data)
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileDrawer, setShowProfileDrawer] = useState(true);

  useEffect(() => {
    // Process incoming real chat messages into active conversations
    if (chatMessages && chatMessages.length > 0) {
      const convMap = {};
      chatMessages.forEach(msg => {
        const roomId = msg.roomId || 'global-room';
        if (!convMap[roomId]) {
          convMap[roomId] = {
            id: roomId,
            roomId,
            ticketTitle: 'Live Ticket Enquiry',
            contactName: msg.senderName || 'Trader Contact',
            contactAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(msg.senderName || 'User')}`,
            trustScore: 100,
            online: true,
            role: 'Member',
            joinedDate: 'Verified Member',
            mutualTrades: 1,
            lastMessage: msg.text,
            lastTime: msg.time || 'Just now',
            unread: false,
            messages: []
          };
        }
        convMap[roomId].messages.push(msg);
        convMap[roomId].lastMessage = msg.text;
      });

      const convList = Object.values(convMap);
      setConversations(convList);
      if (convList.length > 0 && !activeConvId) {
        setActiveConvId(convList[0].id);
      }
    }
  }, [chatMessages, activeConvId]);

  if (!isOpen || !user) return null;

  const activeConv = conversations.find(c => c.id === activeConvId);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || !activeConv) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeConvId) {
        return {
          ...c,
          lastMessage: textToSend,
          lastTime: 'Just now',
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    sendChatMessage(activeConv.roomId, user.id, user.name, textToSend);
    setInputText('');
  };

  const sendThumbsUp = () => {
    setInputText('👍');
    handleSendMessage();
  };

  const filteredConvs = conversations.filter(c =>
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ticketTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '980px', height: '82vh', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '18px', background: '#121215' }}>
        
        {/* Messenger Header */}
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #0084FF, #00C6FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={16} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>Messenger</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-Time Buyer & Seller Messages</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Messenger Main View */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Left Column: Chats Sidebar */}
          <div style={{ width: '300px', borderRight: '1px solid var(--border-subtle)', background: '#09090b', display: 'flex', flexDirection: 'column' }}>
            
            {/* Search Messenger */}
            <div style={{ padding: '0.75rem' }}>
              <div style={{ background: '#18181b', borderRadius: '20px', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                <Search size={14} color="var(--text-dim)" />
                <input
                  type="text"
                  placeholder="Search Messenger"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.82rem', width: '100%' }}
                />
              </div>
            </div>

            {/* Conversation List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredConvs.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  <MessageSquare size={32} color="var(--text-dim)" style={{ marginBottom: '0.5rem' }} />
                  <p>No active messages yet.</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                    Messages from buyers or sellers on ticket listings will appear here in real-time.
                  </p>
                </div>
              ) : (
                filteredConvs.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      conv.unread = false;
                    }}
                    style={{
                      padding: '0.75rem 0.85rem',
                      cursor: 'pointer',
                      background: conv.id === activeConvId ? '#18181b' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      borderRadius: '10px',
                      margin: '0.2rem 0.4rem',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img src={conv.contactAvatar} alt={conv.contactName} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                      {conv.online && (
                        <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', borderRadius: '50%', background: '#31A24C', border: '2px solid #09090b' }}></div>
                      )}
                    </div>

                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: conv.unread ? 700 : 600, color: '#fff' }}>{conv.contactName}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{conv.lastTime}</span>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#0084FF', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        🎫 {conv.ticketTitle}
                      </div>

                      <p style={{ fontSize: '0.78rem', color: conv.unread ? '#fff' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Middle Column: Chat Thread Panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#121215' }}>
            
            {activeConv ? (
              <>
                {/* Thread Header */}
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={activeConv.contactAvatar} alt={activeConv.contactName} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                      {activeConv.online && (
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#31A24C', border: '2px solid #18181b' }}></div>
                      )}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {activeConv.contactName}
                        <ShieldCheck size={14} color="#31A24C" />
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#31A24C' }}>Active Now</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: '50%', width: '34px', height: '34px', padding: 0, justifyContent: 'center' }}
                      onClick={() => setShowProfileDrawer(!showProfileDrawer)}
                      title="Toggle Profile Info"
                    >
                      <Info size={16} color="#0084FF" />
                    </button>
                  </div>
                </div>

                {/* Chat Bubble Stream */}
                <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', background: '#09090b' }}>
                  {activeConv.messages.map((msg) => {
                    const isSelf = msg.senderId === user.id;
                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: isSelf ? 'flex-end' : 'flex-start',
                          maxWidth: '68%'
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.15rem', textAlign: isSelf ? 'right' : 'left' }}>
                          {msg.senderName} • {msg.time}
                        </div>

                        <div
                          style={{
                            background: isSelf ? '#0084FF' : '#242526',
                            color: '#fff',
                            fontWeight: 400,
                            padding: '0.6rem 0.9rem',
                            borderRadius: isSelf ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            fontSize: '0.88rem',
                            lineHeight: 1.4
                          }}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendMessage} style={{ padding: '0.75rem 1rem', background: '#18181b', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary btn-sm" style={{ border: 'none', background: 'transparent' }}><Paperclip size={18} color="#0084FF" /></button>
                  <button type="button" className="btn btn-secondary btn-sm" style={{ border: 'none', background: 'transparent' }}><Image size={18} color="#0084FF" /></button>

                  <input
                    type="text"
                    placeholder="Aa"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    style={{
                      flex: 1,
                      background: '#242526',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '0.55rem 1rem',
                      color: '#fff',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />

                  {inputText.trim() ? (
                    <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Send size={20} color="#0084FF" />
                    </button>
                  ) : (
                    <button type="button" onClick={sendThumbsUp} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <ThumbsUp size={20} color="#0084FF" />
                    </button>
                  )}
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '0.5rem', background: '#09090b' }}>
                <MessageSquare size={44} color="var(--text-dim)" />
                <h4>Your Messenger Inbox is Empty</h4>
                <p style={{ fontSize: '0.85rem' }}>Open any ticket listing and click "Live Seller Chat" to start a real chat!</p>
              </div>
            )}
          </div>

          {/* Right Column: Real Contact Profile Drawer Pane */}
          {showProfileDrawer && activeConv && (
            <div style={{ width: '260px', borderLeft: '1px solid var(--border-subtle)', background: '#18181b', padding: '1.25rem 1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <img src={activeConv.contactAvatar} alt={activeConv.contactName} style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.75rem', border: '3px solid #0084FF' }} />

              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {activeConv.contactName}
                <ShieldCheck size={16} color="#31A24C" />
              </h4>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '1rem' }}>
                {activeConv.role}
              </p>

              <div style={{ width: '100%', background: '#242526', padding: '0.85rem', borderRadius: '12px', textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>ACTIVE TICKET:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
                  🎫 {activeConv.ticketTitle}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#31A24C', fontWeight: 600 }}>
                  ⭐ {activeConv.trustScore}% Verified Score
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
