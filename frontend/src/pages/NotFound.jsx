import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <Sprout className="mx-auto text-leaf/40" size={40} strokeWidth={1.5} />
      <h1 className="text-3xl font-semibold mt-4 text-ink">Page not found</h1>
      <p className="text-inkSoft mt-3">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary inline-flex mt-6">Back home</Link>
    </div>
  );
}
