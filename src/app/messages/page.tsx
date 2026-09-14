'use client';

import { useEffect, useState } from 'react';
import { Container, Card } from '@/components/ui';

export default function Messages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/messages');
        if (!res.ok) throw new Error('Failed to load messages');
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, []);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessage) return;

    setSending(true);
    try {
      const active = messages.find((m) => m.id === selectedMessage);
      if (!active) throw new Error('Conversation not found');

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: active.senderId,
          content: replyText,
          jobId: active.jobId,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to send message');
      }

      const newMessage = await response.json();
      setMessages((prev) => [newMessage, ...prev]);
      setReplyText('');
      alert('✅ Reply sent successfully!');
    } catch (err) {
      alert(`❌ Message error: ${(err as Error).message}`);
    } finally {
      setSending(false);
    }
  };

  const selectedMessageData = messages.find(m => m.id === selectedMessage);

  return (
    <Container className="py-12 h-[calc(100vh-200px)]">
      <div className="grid lg:grid-cols-4 gap-6 h-full">
        {/* Sidebar - Messages List */}
        <Card className="lg:col-span-1 p-4 flex flex-col overflow-hidden">
          <div className="pb-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">💬 Inbox</h2>
            <p className="text-xs text-neutral-500">{messages.length} conversations</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 py-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-neutral-600">Loading...</p>
              </div>
            ) : error ? (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                Error: {error}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-600 text-sm">No messages yet</p>
              </div>
            ) : (
              messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedMessage === msg.id
                      ? 'bg-primary-100 border border-primary-200'
                      : 'hover:bg-neutral-100'
                  } ${msg.unread ? 'font-semibold' : ''}`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="text-sm font-medium text-neutral-900 truncate">
                      {msg.sender?.name || 'Unknown'}
                    </span>
                    <span className="text-xs text-neutral-500 flex-shrink-0">
                      {msg.time || ''}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 line-clamp-2">
                    {msg.content}
                  </p>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Main Chat Area */}
        <Card className="lg:col-span-3 p-6 flex flex-col overflow-hidden">
          {selectedMessageData ? (
            <>
              {/* Chat Header */}
              <div className="pb-4 border-b border-neutral-200 mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">
                  👤 {selectedMessageData.sender?.name || 'Contact'}
                </h3>
                <p className="text-xs text-neutral-500">Active conversation</p>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {/* Received Message */}
                <div className="flex justify-start">
                  <div className="max-w-xs px-4 py-2 rounded-lg bg-neutral-100 text-neutral-900">
                    <p className="text-sm">{selectedMessageData.content}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(selectedMessageData.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleReply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-6 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? '...' : 'Send'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <div className="text-5xl">💬</div>
                <p className="text-neutral-600">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Container>
  );
}
