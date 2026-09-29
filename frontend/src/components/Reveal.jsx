import React, { useEffect, useRef, useState } from 'react';

/**
 * Reveal
 * Wraps a section and fades/translates it up the first time it scrolls
 * into view. Kept deliberately tiny (one IntersectionObserver, no deps)
 * so it's easy to explain in a viva: "we observe the wrapper, and once
 * it's ~15% visible we add a class that CSS transitions in."
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  );
}
