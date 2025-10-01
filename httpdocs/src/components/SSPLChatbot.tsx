import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  X,
  Minimize2,
  Maximize2,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type {
  ChatMessage,
  ChatbotQuery,
  ChatbotResponse,
  SSPLTeam,
  SSPLPlayer,
  SSPLMatch,
  SSPLNews
} from '@/types/sspl';

interface SSPLChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

const SSPLChatbot: React.FC<SSPLChatbotProps> = ({ isOpen, onToggle, className = '' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, userRole } = useAuth();

  // State for real data from database
  const [realData, setRealData] = useState({
    teams: [] as SSPLTeam[],
    players: [] as SSPLPlayer[],
    matches: [] as SSPLMatch[],
    news: [] as SSPLNews[],
    loading: true
  });

  // Fetch real data from database
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setRealData(prev => ({ ...prev, loading: true }));

        // For now, use sample data since database tables may not be created yet
        // TODO: Replace with actual database queries once tables are available
        const teamsData: SSPLTeam[] = [
          { id: '1', name: 'Chennai Champions', city: 'Chennai', captain: 'Rahul Sharma', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '2', name: 'Bangalore Blasters', city: 'Bangalore', captain: 'Vikram Singh', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '3', name: 'Mumbai Mavericks', city: 'Mumbai', captain: 'Arjun Patel', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];

        const playersData: SSPLPlayer[] = [
          { id: '1', name: 'Rahul Sharma', position: 'batsman', team_id: '1', is_active: true, stats: { matches: 15, runs: 450, wickets: 0, centuries: 1, fifties: 2, highest_score: 120, best_bowling: '', average: 30.0, strike_rate: 125.5 }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '2', name: 'Vikram Singh', position: 'bowler', team_id: '2', is_active: true, stats: { matches: 12, runs: 80, wickets: 18, centuries: 0, fifties: 0, highest_score: 25, best_bowling: '3/15', average: 22.5, strike_rate: 85.0 }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];

        const matchesData: SSPLMatch[] = [
          { id: '1', match_number: 1, season: '2024', date: '2024-09-15', time: '19:00:00', venue: 'Chennai Cricket Ground', team_a_id: '1', team_b_id: '2', result: 'upcoming', match_type: 'league', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];

        const newsData: SSPLNews[] = [
          { id: '1', title: 'SSPL T10 Season 2024 Begins!', content: 'The much-awaited SSPL T10 season is set to begin with exciting matches and talented players from across the region.', excerpt: 'Season 2024 kicks off with high expectations', author: 'SSPL Admin', category: 'league', tags: ['season', '2024', 'tournament'], published_date: '2024-08-30T10:00:00Z', is_featured: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];

        // No errors to handle with sample data

        setRealData({
          teams: teamsData || [],
          players: playersData || [],
          matches: matchesData || [],
          news: newsData || [],
          loading: false
        });

      } catch (error) {
        console.error('Error fetching real data:', error);
        setRealData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchRealData();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: `Hello${user ? ` ${user.email?.split('@')[0]}` : ''}! 👋 I'm your SSPL assistant. I can help you with:

• Team information and standings
• Player statistics and profiles
• Match schedules and results
• Latest news and updates
• Tournament details

What would you like to know about SSPL?`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, [user, messages.length]);

  // Simple NLP-like keyword matching
  const analyzeQuery = (text: string): ChatbotQuery => {
    const lowerText = text.toLowerCase();
    let intent = 'general';
    const entities: Record<string, any> = {};

    // Team-related queries
    if (lowerText.includes('team') || lowerText.includes('teams')) {
      intent = 'teams';
      if (lowerText.includes('chennai')) entities.team = 'Chennai Champions';
      if (lowerText.includes('bangalore')) entities.team = 'Bangalore Blasters';
      if (lowerText.includes('mumbai')) entities.team = 'Mumbai Mavericks';
    }

    // Player-related queries
    else if (lowerText.includes('player') || lowerText.includes('players') ||
             lowerText.includes('captain') || lowerText.includes('batsman') ||
             lowerText.includes('bowler')) {
      intent = 'players';
      if (lowerText.includes('rahul')) entities.player = 'Rahul Sharma';
      if (lowerText.includes('vikram')) entities.player = 'Vikram Singh';
    }

    // Match-related queries
    else if (lowerText.includes('match') || lowerText.includes('matches') ||
             lowerText.includes('schedule') || lowerText.includes('fixture')) {
      intent = 'matches';
    }

    // News-related queries
    else if (lowerText.includes('news') || lowerText.includes('latest') ||
             lowerText.includes('update')) {
      intent = 'news';
    }

    // Standings queries
    else if (lowerText.includes('standing') || lowerText.includes('table') ||
             lowerText.includes('rank')) {
      intent = 'standings';
    }

    return {
      text,
      intent,
      entities,
      confidence: 0.8 // Simple implementation
    };
  };

  // Generate response based on query analysis
  const generateResponse = (query: ChatbotQuery): ChatbotResponse => {
    const { intent, entities } = query;

    switch (intent) {
      case 'teams':
        if (entities.team) {
          const team = realData.teams.find(t => t.name === entities.team);
          if (team) {
            return {
              text: `📍 **${team.name}**\n\n🏙️ **City:** ${team.city}\n👨‍⚽ **Captain:** ${team.captain}\n\nWould you like to know more about their players or recent matches?`,
              type: 'text',
              data: team
            };
          }
        }
        return {
          text: `🏆 Here are the SSPL teams:\n\n${realData.teams.map(team => `• ${team.name} (${team.city})`).join('\n')}\n\nWhich team would you like to know more about?`,
          type: 'text',
          data: realData.teams
        };

      case 'players':
        if (entities.player) {
          const player = realData.players.find(p => p.name === entities.player);
          if (player) {
            return {
              text: `🏏 **${player.name}**\n\n📊 **Position:** ${player.position}\n⚽ **Team:** ${realData.teams.find(t => t.id === player.team_id)?.name}\n\nWould you like to see their statistics or other players?`,
              type: 'text',
              data: player
            };
          }
        }
        return {
          text: `👥 Here are some key players:\n\n${realData.players.map(player => `• ${player.name} (${player.position})`).join('\n')}\n\nAsk me about a specific player for more details!`,
          type: 'text',
          data: realData.players
        };

      case 'matches':
        return {
          text: `📅 **Upcoming Matches:**\n\n${realData.matches.map(match => {
            const teamA = realData.teams.find(t => t.id === match.team_a_id);
            const teamB = realData.teams.find(t => t.id === match.team_b_id);
            return `• ${teamA?.name} vs ${teamB?.name} (${match.date})`;
          }).join('\n')}\n\nWould you like match details or results?`,
          type: 'text',
          data: realData.matches
        };

      case 'news':
        return {
          text: `📰 **Latest News:**\n\n${realData.news.map(article => `• ${article.title} (${new Date(article.published_date).toLocaleDateString()})`).join('\n')}\n\nWould you like to read the full article?`,
          type: 'text',
          data: realData.news
        };

      case 'standings':
        return {
          text: `📊 **Current Standings:**\n\n1. Chennai Champions (12 pts)\n2. Bangalore Blasters (10 pts)\n3. Mumbai Mavericks (8 pts)\n\n*Note: This is sample data for demonstration*`,
          type: 'text'
        };

      default:
        // Fallback responses for unrecognized queries
        const fallbacks = [
          "I'm here to help with SSPL information! Try asking about teams, players, matches, or news.",
          "I can tell you about SSPL teams, players, match schedules, and latest news. What interests you?",
          "Ask me about your favorite SSPL team or player! I'm here to help with all things cricket.",
          "Need SSPL info? I can help with teams, players, matches, standings, and news updates."
        ];
        return {
          text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
          type: 'text',
          suggestions: ['Show me teams', 'Latest news', 'Match schedule', 'Player stats']
        };
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Analyze the query
      const query = analyzeQuery(inputMessage);

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      // Generate response
      const response = generateResponse(query);

      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        content: response.text,
        sender: 'bot',
        timestamp: new Date(),
        type: response.type,
        metadata: {
          query_type: query.intent,
          confidence: query.confidence
        }
      };

      setMessages(prev => [...prev, botMessage]);

      // Show suggestions if available
      if (response.suggestions && response.suggestions.length > 0) {
        setTimeout(() => {
          const suggestionMessage: ChatMessage = {
            id: `suggestions_${Date.now()}`,
            content: `💡 **Quick suggestions:** ${response.suggestions.join(' • ')}`,
            sender: 'bot',
            timestamp: new Date(),
            type: 'text'
          };
          setMessages(prev => [...prev, suggestionMessage]);
        }, 500);
      }

    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      content: 'Chat cleared! How can I help you with SSPL information?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }]);
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
        <Button
          onClick={onToggle}
          className="rounded-full w-14 h-14 bg-cricket-blue hover:bg-cricket-dark-blue shadow-lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      <Card className={`w-96 ${isMinimized ? 'h-14' : 'h-[500px]'} shadow-2xl border-cricket-blue/20`}>
        {/* Header */}
        <CardHeader className="bg-gradient-primary text-white p-3 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <CardTitle className="text-sm font-medium">SSPL Assistant</CardTitle>
              {userRole === 'admin' && (
                <Badge variant="secondary" className="text-xs">
                  Admin
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-80 p-3">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-cricket-blue text-white'
                            : message.type === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender === 'user' ? (
                            <User className="w-3 h-3" />
                          ) : (
                            <Bot className="w-3 h-3" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                        {message.metadata?.confidence && (
                          <div className="text-xs opacity-50 mt-1">
                            Confidence: {Math.round(message.metadata.confidence * 100)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                        <div className="flex items-center gap-2">
                          <Bot className="w-3 h-3" />
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about SSPL teams, players, matches..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-cricket-blue hover:bg-cricket-dark-blue"
                >
                  <Send className="w-4 h-4" />
                </Button>
                <Button
                  onClick={clearChat}
                  variant="outline"
                  size="sm"
                  title="Clear chat"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <span>Press Enter to send</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => toast({
                    title: "SSPL Chatbot Help",
                    description: "Ask me about teams, players, matches, news, or standings!",
                  })}
                >
                  <HelpCircle className="w-3 h-3 mr-1" />
                  Help
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default SSPLChatbot;