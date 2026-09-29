import React, { useEffect, useMemo, useState } from 'react';
import { Search, Sprout } from 'lucide-react';
import { browseMarketplace, searchMarketplace } from '../services/api';
import ProduceCard from '../components/ProduceCard.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useOffline } from '../offline/OfflineContext.jsx';
import { cachePutAll, cacheGetAll } from '../offline/db.js';

const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

function SkeletonCard() {
  return (
    <div className="card !p-0 overflow-hidden">
      <div className="skeleton h-32 !rounded-none" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-full" />
      </div>
    </div>
  );
}

export default function Marketplace() {
  const { t } = useLanguage();
  const { isOnline, markSynced } = useOffline();
  const [listings, setListings] = useState([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recommended');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fromCache, setFromCache] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    setFromCache(false);

    // Offline: skip the network call entirely and read the last cached
    // marketplace snapshot from IndexedDB instead of showing an error.
    if (!isOnline) {
      try {
        const cached = await cacheGetAll('produceCache');
        setListings(cached);
        setFromCache(true);
        if (cached.length === 0) {
          setError('No cached listings are available offline yet. Connect once to load the marketplace.');
        }
      } catch {
        setError('Could not read cached listings.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const data = query ? await searchMarketplace(query) : await browseMarketplace({});
      setListings(data.listings);
      // Cache the freshest results for offline browsing later. Search
      // results are cached too since they're still valid listings.
      cachePutAll('produceCache', data.listings).then(markSynced).catch(() => {});
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the marketplace. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    load();
  }

  const sortedListings = useMemo(() => {
    const items = [...listings];
    if (sort === 'price-asc') return items.sort((a, b) => a.askingPrice - b.askingPrice);
    if (sort === 'price-desc') return items.sort((a, b) => b.askingPrice - a.askingPrice);
    if (sort === 'newest') {
      return items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return items;
  }, [listings, sort]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <h1 className="text-3xl font-semibold text-ink">{t('marketplace.title')}</h1>
      <p className="text-inkSoft mt-2 max-w-xl">
        Browse fresh produce listed directly by farmers, with AI-backed price and demand signals.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-xl">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-inkSoft" />
          <input
            className="input !pl-10"
            placeholder={t('marketplace.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
        <div className="flex gap-3">
          <button onClick={handleSearch} type="button" className="btn-primary whitespace-nowrap">Search</button>
          <select
            className="input !w-auto"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort listings"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {error && !loading && (
        <div className="card mt-8 text-sm text-danger">{error}</div>
      )}

      {!loading && !error && sortedListings.length === 0 && (
        <div className="card mt-8 text-center py-14">
          <Sprout className="mx-auto text-leaf/40" size={40} strokeWidth={1.5} />
          <p className="font-display text-lg font-semibold text-ink mt-4">No listings yet</p>
          <p className="text-sm text-inkSoft mt-1">
            Run the seed script in <code>backend/</code> to populate demo data.
          </p>
        </div>
      )}

      {!loading && !error && sortedListings.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {sortedListings.map((p) => (
            <ProduceCard key={p._id} produce={p} />
          ))}
        </div>
      )}
    </div>
  );
}
