'use client';

import messages from '@/messages/fr.json';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <h1>{messages.common.error}</h1>
      <button type="button" onClick={reset}>
        {messages.common.retry}
      </button>
    </main>
  );
}
