import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Mic, MicOff, Send, Sparkles, X, Loader } from 'lucide-react';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;

async function askGemini(userMessage, businesses, location) {
  const topBusinesses = businesses.slice(0, 15).map((b) => ({
    name: b.name,
    category: b.category,
    rating: b.rating,
    address: b.address,
    deal: b.deal ? b.deal.code : null,
    description: b.description,
  }));

  const systemPrompt = `You are a friendly local business assistant for MainStreet Compass, a neighborhood discovery app.
The user is currently browsing near: ${location?.label || 'their area'}.
Nearby businesses: ${JSON.stringify(topBusinesses)}.
Keep replies short (2-3 sentences max). Be helpful, specific, and mention business names when relevant.
Do not make up businesses — only reference ones from the list provided.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userMessage }] }],
        generationConfig: { maxOutputTokens: 150, temperature: 0.7 },
      }),
    },
  );

  if (!res.ok) throw new Error('Gemini request failed');
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not get a response right now.';
}

function speak(message) {
  if (!('speechSynthesis' in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function VoiceAssistant({ appState, appActions }) {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const [isOpen, setIsOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi, I can help you find businesses, compare deals, save favorites, or navigate the app by typing or voice.',
    },
  ]);

  const visibleBusinesses = useMemo(() => appState.filteredBusinesses.slice(0, 5), [appState.filteredBusinesses]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript;
      setInput(command);
      submitPrompt(command, true);
    };

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, [appState.filteredBusinesses]);

  function pushAssistantMessage(content, shouldSpeak = false) {
    setMessages((current) => [...current, { id: `${Date.now()}-${current.length}`, role: 'assistant', content }]);
    if (shouldSpeak) {
      speak(content);
    }
  }

  function recommendBusinesses(filterFn, title) {
    const picks = appState.businesses.filter(filterFn).sort((left, right) => right.rating - left.rating).slice(0, 3);
    if (!picks.length) {
      return `I could not find ${title.toLowerCase()} near your current search. Try widening your location or filters.`;
    }

    return `${title}: ${picks.map((business) => `${business.name} (${business.rating} stars)`).join(', ')}.`;
  }

  function handleCommand(command, fromVoice = false) {
    if (command.includes('show deals')) {
      navigate('/deals');
      return 'Opening active deals for nearby businesses.';
    }

    if (command.includes('show favorites')) {
      navigate('/favorites');
      return 'Opening your saved favorites.';
    }

    if (command.includes('show analytics')) {
      navigate('/analytics');
      return 'Opening your local insights dashboard.';
    }

    if (command.includes('show reviews')) {
      navigate('/reviews');
      return 'Opening your reviews.';
    }

    if (command.includes('use my location') || command.includes('near me')) {
      navigate('/');
      appActions.requestCurrentLocation();
      return 'Refreshing results near your current location.';
    }

    if (command.includes('add this to my favorites') || command.includes('save first result')) {
      const firstResult = appState.filteredBusinesses[0];
      if (firstResult) {
        appActions.toggleFavorite(firstResult.id);
        return `Saved ${firstResult.name} to favorites.`;
      }
      return 'There is no visible business to save yet.';
    }

    if (command.includes('coffee')) {
      navigate('/');
      appActions.updateFilters({ searchText: 'coffee', category: 'food-drink' });
      return recommendBusinesses((business) => business.category === 'food-drink', 'Coffee and cafe picks nearby');
    }

    if (command.includes('restaurant') || command.includes('food')) {
      navigate('/');
      appActions.updateFilters({ searchText: '', category: 'food-drink' });
      return recommendBusinesses((business) => business.category === 'food-drink', 'Top food and drink spots');
    }

    if (command.includes('retail') || command.includes('shopping')) {
      navigate('/');
      appActions.updateFilters({ searchText: '', category: 'retail' });
      return recommendBusinesses((business) => business.category === 'retail', 'Popular retail picks');
    }

    if (command.includes('deal') || command.includes('coupon')) {
      const deals = appState.businesses.filter((business) => business.deal).slice(0, 3);
      if (!deals.length) {
        return 'I do not see any active deals right now.';
      }
      return `Here are a few deals to check first: ${deals.map((business) => `${business.name} with code ${business.deal.code}`).join(', ')}.`;
    }

    if (command.includes('recommend') || command.includes('best')) {
      const picks = visibleBusinesses.length ? visibleBusinesses : appState.businesses.slice(0, 3);
      if (!picks.length) {
        return 'I need a location or search first so I can make a better recommendation.';
      }
      return `My top picks right now are ${picks.slice(0, 3).map((business) => `${business.name} (${business.rating} stars)`).join(', ')}.`;
    }

    if (command.startsWith('find ') || command.startsWith('search ')) {
      const term = command.replace(/^find |^search /, '').trim();
      navigate('/');
      appActions.updateFilters({ searchText: term, category: 'all' });
      return `Searching for ${term}.`;
    }

    return fromVoice
      ? 'Try asking me to find coffee shops, show deals, recommend something nearby, or use your location.'
      : 'Try asking for coffee shops, deals, favorites, reviews, analytics, or a recommendation nearby.';
  }

  async function submitPrompt(rawPrompt, fromVoice = false) {
    const prompt = rawPrompt.trim();
    if (!prompt) return;

    setMessages((current) => [...current, { id: `${Date.now()}-user`, role: 'user', content: prompt }]);
    setInput('');

    if (GEMINI_KEY) {
      setIsThinking(true);
      try {
        const reply = await askGemini(prompt, appState.businesses, appState.location);
        pushAssistantMessage(reply, fromVoice);
      } catch {
        pushAssistantMessage('Having trouble connecting right now. Try again in a moment.', fromVoice);
      } finally {
        setIsThinking(false);
      }
    } else {
      const reply = handleCommand(prompt.toLowerCase(), fromVoice);
      pushAssistantMessage(reply, fromVoice);
    }
  }

  function toggleListening() {
    const recognition = recognitionRef.current;
    if (!recognition) {
      appActions.clearError();
      pushAssistantMessage('Voice input is not available in this browser. You can still type your request here.');
      return;
    }

    if (isListening) {
      recognition.stop();
      return;
    }

    recognition.start();
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[999] inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white shadow-card"
      >
        <MessageSquare size={16} />
        Ask MainStreet Compass
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[999] w-[min(94vw,24rem)] rounded-[1.75rem] border border-white/70 bg-white/95 px-4 py-4 text-ink shadow-card backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-clay">
            <Sparkles size={14} />
            AI Assistant
          </p>
          <p className="mt-1 text-sm text-ink/65">Ask for recommendations, say what you are looking for, or use voice to search hands-free.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleListening}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition ${
              isListening ? 'bg-clay text-white' : 'bg-mist text-ink'
            }`}
            aria-pressed={isListening}
            aria-label={isListening ? 'Stop voice assistant' : 'Start voice assistant'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button type="button" onClick={() => setIsOpen(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-mist text-ink">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="mt-4 max-h-80 space-y-3 overflow-y-auto rounded-[1.25rem] bg-mist/80 p-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.role === 'user' ? 'bg-ink text-white' : 'bg-white text-ink/80'}`}>
              {message.content}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl bg-white px-3 py-2 text-sm text-ink/50">
              <Loader size={13} className="animate-spin" /> Thinking…
            </div>
          </div>
        )}
      </div>

      <form
        className="mt-3 flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          submitPrompt(input, false);
        }}
      >
        <label className="flex-1 rounded-[1.25rem] border border-ink/10 bg-mist px-3 py-2">
          <span className="sr-only">Ask the assistant</span>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={2}
            className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-ink/40"
            placeholder="Ask for recommendations, directions, deals, or help"
          />
        </label>
        <button type="submit" disabled={isThinking} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white disabled:opacity-50">
          {isThinking ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
