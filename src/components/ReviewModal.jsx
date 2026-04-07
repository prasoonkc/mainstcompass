import { useMemo, useState } from 'react';
import { X } from 'lucide-react';

export function ReviewModal({ business, onClose, onSubmit }) {
  const verification = useMemo(() => {
    const left = Math.floor(Math.random() * 5) + 1;
    const right = Math.floor(Math.random() * 5) + 2;
    return {
      prompt: `${left} + ${right}`,
      answer: left + right,
    };
  }, []);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [feedback, setFeedback] = useState('');
  const [startedAt] = useState(Date.now());

  function handleSubmit(event) {
    event.preventDefault();
    const result = onSubmit({
      businessId: business.id,
      rating,
      comment,
      verificationAnswer,
      expectedAnswer: verification.answer,
      honeypot,
      startedAt,
    });

    setFeedback(result.message);

    if (result.ok) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink/55 p-4">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Review business</p>
            <h3 className="mt-1 text-2xl font-semibold">{business.name}</h3>
            <p className="mt-1 text-sm text-ink/65">Ratings and comments are stored with your signed-in account.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-mist text-ink"
            aria-label="Close review form"
          >
            <X size={18} />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            <span className="mb-2 block font-medium text-ink">Rating</span>
            <select
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} star{value > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-2 block font-medium text-ink">Comment (optional)</span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              maxLength={280}
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
              placeholder="What should other shoppers know?"
            />
          </label>

          <label className="hidden" aria-hidden="true">
            <span>Leave blank</span>
            <input value={honeypot} onChange={(event) => setHoneypot(event.target.value)} tabIndex="-1" autoComplete="off" />
          </label>

          <label className="block text-sm">
            <span className="mb-2 block font-medium text-ink">Quick verification: solve {verification.prompt}</span>
            <input
              type="number"
              value={verificationAnswer}
              onChange={(event) => setVerificationAnswer(event.target.value)}
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
              placeholder="Enter the answer"
              required
            />
          </label>

          {feedback ? <p className="text-sm text-clay">{feedback}</p> : null}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
              Cancel
            </button>
            <button type="submit" className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white">
              Submit review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
