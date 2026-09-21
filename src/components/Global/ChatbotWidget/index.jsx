import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { getChatbotEnabled, askChatbot } from '@/services/chatbot';
import './style.scss';

const WELCOME = 'Olá! Sou o assistente do Acampamento IPBV. Posso ajudar com dúvidas sobre a inscrição e o evento. Como posso ajudar?';

const renderRich = (text) => {
  const escaped = String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const withBullets = escaped
    .split('\n')
    .map((line) => line.replace(/^\s*[*-]\s+/, '• '))
    .join('\n');
  const withBold = withBullets.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return DOMPurify.sanitize(withBold, { ALLOWED_TAGS: ['strong', 'br'], ALLOWED_ATTR: [] });
};

const ChatbotWidget = () => {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    getChatbotEnabled().then(setEnabled);
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  if (!enabled) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const history = messages.filter((m) => m.role === 'user' || m.role === 'assistant');
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setSending(true);
    try {
      const answer = await askChatbot(text, history);
      setMessages([...next, { role: 'assistant', content: answer || 'Desculpe, não consegui responder agora.' }]);
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Desculpe, não consegui responder agora. Tente novamente.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chatbot">
      {open && (
        <div className="chatbot__panel" role="dialog" aria-label="Assistente do Acampamento">
          <div className="chatbot__header">
            <span className="chatbot__title">Assistente do Acampamento</span>
            <button type="button" className="chatbot__close" onClick={() => setOpen(false)} aria-label="Fechar">
              ×
            </button>
          </div>
          <div className="chatbot__messages" ref={listRef}>
            {messages.map((m, i) =>
              m.role === 'assistant' ? (
                <div
                  key={i}
                  className="chatbot__msg chatbot__msg--assistant"
                  dangerouslySetInnerHTML={{ __html: renderRich(m.content) }}
                />
              ) : (
                <div key={i} className={`chatbot__msg chatbot__msg--${m.role}`}>
                  {m.content}
                </div>
              ),
            )}
            {sending && <div className="chatbot__msg chatbot__msg--assistant chatbot__msg--typing">Digitando…</div>}
          </div>
          <form
            className="chatbot__input"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida…"
              maxLength={1000}
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()} aria-label="Enviar">
              Enviar
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        className="chatbot__fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Fechar assistente' : 'Abrir assistente'}
      >
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="currentColor">
          <path d="M12 3C6.98 3 3 6.58 3 11c0 2.06.86 3.94 2.29 5.38-.1 1.2-.5 2.5-1.24 3.62 1.5-.2 2.86-.7 3.98-1.42 1.2.42 2.53.65 3.97.65 5.02 0 9-3.58 9-8s-3.98-8-9-8Zm-4 8a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm4 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm4 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z" />
        </svg>
      </button>
    </div>
  );
};

export default ChatbotWidget;
