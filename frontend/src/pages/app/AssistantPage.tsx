import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ChatConversation, ChatMessage } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import {
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Bot,
  User,
  Loader2,
  HelpCircle
} from 'lucide-react';

export const AssistantPage: React.FC = () => {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConv, setActiveConv] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const list = await api.chat.listConversations();
      setConversations(list);
      if (list.length > 0 && !activeConv) {
        loadConversation(list[0].id);
      } else if (list.length === 0) {
        handleNewConversation();
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const conv = await api.chat.getConversation(id);
      setActiveConv(conv);
      setMessages(conv.messages || []);
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleNewConversation = async () => {
    try {
      const created = await api.chat.createConversation('Placement Preparation Chat');
      setConversations((prev) => [created, ...prev]);
      setActiveConv(created);
      setMessages(created.messages || []);
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;
    try {
      await api.chat.deleteConversation(id);
      const remaining = conversations.filter((c) => c.id !== id);
      setConversations(remaining);
      if (activeConv?.id === id) {
        if (remaining.length > 0) {
          loadConversation(remaining[0].id);
        } else {
          handleNewConversation();
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !activeConv || sending) return;

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInputText('');
    setSending(true);

    try {
      const reply = await api.chat.sendMessage(activeConv.id, text);
      setMessages((prev) => [...prev, reply]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'Could not communicate with AI assistant. Please try again.'}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptStarters = [
    'How should I structure my answer for system design questions?',
    'What are the core differences between B-Tree and Hash indexing?',
    'Review the STAR method for behavioral questions in tech rounds.',
    'What should I prioritize in my first week of roadmap preparation?'
  ];

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <LoadingSkeleton className="h-20 w-full" />
        <LoadingSkeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4">
      {/* Sidebar / Conversation List */}
      <div className="w-full md:w-64 bg-surface rounded-lg border border-border flex flex-col justify-between shrink-0 overflow-hidden">
        <div>
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-bold text-text uppercase tracking-wider">Conversations</span>
            <Button size="sm" variant="ghost" onClick={handleNewConversation} title="New chat">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            {conversations.map((conv) => {
              const isSelected = activeConv?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`flex items-center justify-between p-2.5 rounded-md text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary-50 text-primary font-semibold'
                      : 'text-text-muted hover:bg-surface-muted hover:text-text'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{conv.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="p-1 hover:text-danger rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-3 border-t border-border bg-surface-muted/30 text-[10px] text-text-muted leading-tight">
          <span>Target Context: {profile?.target_role || 'Software Engineering'}</span>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-surface rounded-lg border border-border flex flex-col justify-between overflow-hidden">
        {/* Chat Header */}
        <div className="p-3 px-5 border-b border-border flex items-center justify-between bg-surface-muted/20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-100 text-primary flex items-center justify-center font-bold text-[10px]">
              AI
            </div>
            <div>
              <span className="text-xs font-semibold text-text block">CareerSaathi Career Mentor</span>
              <span className="text-[10px] text-text-muted">Context-aware placement advisor</span>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px]">Strict Safety Guardrails</Badge>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                    isUser
                      ? 'bg-text text-surface'
                      : 'bg-primary-100 text-primary'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-lg p-3 text-xs leading-relaxed relative group ${
                    isUser
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-surface-muted/70 text-text border border-border/60 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>

                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(m.id, m.content)}
                      className="absolute top-2 right-2 p-1 text-text-muted hover:text-text rounded opacity-0 group-hover:opacity-100 transition-opacity bg-surface/80"
                      title="Copy response"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3 h-3 text-success-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-primary-100 text-primary flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-surface-muted/50 rounded-lg text-xs text-text-muted flex items-center gap-2 border border-border/50">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Formulating response with student context...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Starters if conversation is short */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <span className="text-[10px] text-text-muted uppercase font-semibold block mb-1.5">
              Suggested Prompt Starters:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {promptStarters.map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(starter)}
                  className="text-[11px] bg-surface-muted hover:bg-border/60 text-text px-2.5 py-1 rounded-full border border-border text-left transition-colors"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 border-t border-border bg-surface">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about technical topics, mock questions, or preparation advice..."
              className="text-xs"
              disabled={sending}
            />
            <Button
              type="submit"
              size="md"
              disabled={!inputText.trim() || sending}
              isLoading={sending}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
