import { useEffect, useState } from 'react';

export function StreamText({
  text,
  onProgress,
  onDone,
}: {
  text: string;
  onProgress?: () => void;
  onDone?: () => void;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    setN(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      onProgress?.();
      if (i >= text.length) {
        clearInterval(id);
        onDone?.();
      }
    }, 18);
    return () => clearInterval(id);
  }, [text, onProgress, onDone]);

  return (
    <span>
      {text.slice(0, n)}
      {n < text.length && <span className="stream-caret is-streaming" />}
    </span>
  );
}
