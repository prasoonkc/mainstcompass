import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Mic, MicOff, Send, Sparkles, X } from 'lucide-react';

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
    // "near me" / "nearby" triggers GPS location switch before applying any filter.
    const wantsNearby = command.includes('near me') || command.includes('nearby');

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

    if (command.includes('add this to my favorites') || command.includes('save first result')) {
      const firstResult = appState.filteredBusinesses[0];
      if (firstResult) {
        appActions.toggleFavorite(firstResult.id);
        return `Saved ${firstResult.name} to favorites.`;
      }
      return 'There is no visible business to save yet.';
    }

    if (command.includes('coffee') || command.includes('cafe')) {
      navigate('/');
      if (wantsNearby) appActions.requestCurrentLocation();
      appActions.updateFilters({ searchText: 'coffee', category: 'food-drink' });
      return wantsNearby
        ? 'Switching to your location and showing coffee shops nearby.'
        : recommendBusinesses((business) => business.category === 'food-drink', 'Coffee and cafe picks nearby');
    }

    if (command.includes('restaurant') || command.includes('food') || command.includes('eat') || command.includes('drink')) {
      navigate('/');
      if (wantsNearby) appActions.requestCurrentLocation();
      appActions.updateFilters({ searchText: '', category: 'food-drink' });
      return wantsNearby
        ? 'Switching to your location and showing food and drink spots nearby.'
        : recommendBusinesses((business) => business.category === 'food-drink', 'Top food and drink spots');
    }

    if (command.includes('retail') || command.includes('shopping') || command.includes('shop')) {
      navigate('/');
      if (wantsNearby) appActions.requestCurrentLocation();
      appActions.updateFilters({ searchText: '', category: 'retail' });
      return wantsNearby
        ? 'Switching to your location and showing shops nearby.'
        : recommendBusinesses((business) => business.category === 'retail', 'Popular retail picks');
    }

    if (command.includes('spa') || command.includes('salon') || command.includes('beauty') || command.includes('wellness')) {
      navigate('/');
      if (wantsNearby) appActions.requestCurrentLocation();
      appActions.updateFilters({ searchText: '', category: 'health-beauty' });
      return wantsNearby
        ? 'Switching to your location and showing health and beauty spots nearby.'
        : recommendBusinesses((business) => business.category === 'health-beauty', 'Health and beauty picks');
    }

    if (command.includes('entertainment') || command.includes('fun') || command.includes('activity')) {
      navigate('/');
      if (wantsNearby) appActions.requestCurrentLocation();
      appActions.updateFilters({ searchText: '', category: 'entertainment' });
      return wantsNearby
        ? 'Switching to your location and showing entertainment nearby.'
        : recommendBusinesses((business) => business.category === 'entertainment', 'Entertainment picks');
    }

    if (wantsNearby) {
      navigate('/');
      appActions.requestCurrentLocation();
      appActions.updateFilters({ searchText: '', category: 'all' });
      return 'Switching to your current location and showing all nearby businesses.';
    }

    if (command.includes('use my location')) {
      navigate('/');
      appActions.requestCurrentLocation();
      return 'Refreshing results near your current location.';
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
      ? 'Try saying "food near me", "coffee nearby", "show deals", or "recommend something".'
      : 'Try: "food near me", "coffee nearby", "show deals", "best restaurants", or "find [business name]".';
  }

  function submitPrompt(rawPrompt, fromVoice = false) {
    const prompt = rawPrompt.trim();
    if (!prompt) return;

    setMessages((current) => [...current, { id: `${Date.now()}-user`, role: 'user', content: prompt }]);
    setInput('');

    const reply = handleCommand(prompt.toLowerCase(), fromVoice);
    pushAssistantMessage(reply, fromVoice);
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
        <button type="submit" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
