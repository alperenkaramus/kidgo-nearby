import { useEffect, useMemo, useState } from 'react';
import { Baby, Compass, ExternalLink, Loader2, MapPin, Navigation, Search, Sparkles, Telescope, TrendingUp, Umbrella } from 'lucide-react';
import { AGE_GROUPS, CATEGORIES, TRENDING_TURKEY_SEARCHES, getDirectionsUrl, getMapUrl, searchPlaces } from './lib/places.js';
import './styles.css';

const radiusOptions = [2, 5, 10, 20];

function App() {
  const [location, setLocation] = useState('Istanbul');
  const [submittedLocation, setSubmittedLocation] = useState('Istanbul');
  const [coords, setCoords] = useState(null);
  const [age, setAge] = useState('4');
  const [category, setCategory] = useState('all');
  const [radiusKm, setRadiusKm] = useState(5);
  const [places, setPlaces] = useState([]);
  const [status, setStatus] = useState('idle');
  const [activeInsight, setActiveInsight] = useState('Turkey mode: Google autocomplete shows strong demand for İstanbul, Ankara, İzmir, Bursa, Antalya and child-friendly venue queries.');
  const [notice, setNotice] = useState('Live OpenStreetMap is tried first; if a city is slow, Turkey-ready fallback picks keep the demo usable.');

  const selectedAge = useMemo(() => AGE_GROUPS.find((item) => item.id === age), [age]);
  const selectedCategory = useMemo(() => CATEGORIES.find((item) => item.id === category), [category]);

  useEffect(() => {
    let cancelled = false;

    async function runSearch() {
      setStatus('loading');
      try {
        const results = await searchPlaces({ location: submittedLocation, coords, age, category, radiusKm });
        if (cancelled) return;
        setPlaces(results);
        setStatus(results.length ? 'success' : 'empty');
        setNotice(results.some((place) => place.source?.includes('fallback'))
          ? 'Showing ranked fallback + open-map ready data. Live OSM may be slow, but the product flow stays usable.'
          : 'Live OpenStreetMap results ranked by kid fit, distance and family-friendly signals.');
      } catch (error) {
        if (cancelled) return;
        setStatus('error');
        setNotice(error instanceof Error ? error.message : 'Search failed. Try a Turkey radar chip.');
      }
    }

    runSearch();
    return () => {
      cancelled = true;
    };
  }, [age, category, coords, radiusKm, submittedLocation]);

  function handleSubmit(event) {
    event.preventDefault();
    setCoords(null);
    setSubmittedLocation(location.trim() || 'Istanbul');
  }

  function applyTrend(item) {
    setLocation(item.location);
    setSubmittedLocation(item.location);
    setCoords(null);
    setCategory(item.category);
    setActiveInsight(item.insight);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setNotice('Browser geolocation is not available, so city search stays active.');
      return;
    }

    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = {
          lat: Number(position.coords.latitude.toFixed(5)),
          lon: Number(position.coords.longitude.toFixed(5)),
        };
        setCoords(nextCoords);
        setSubmittedLocation('Current location');
        setLocation('Current location');
        setActiveInsight('Current-location mode: this is the global product behavior — works beyond Turkey when live OSM responds.');
        setNotice('Using browser location. If live OSM is slow, fallback mode still keeps the interface testable.');
      },
      () => {
        setStatus('error');
        setNotice('Location permission was blocked or unavailable. Try Istanbul, Ankara, Izmir, Bursa or Antalya.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  }

  const isLoading = status === 'loading';
  const featured = places.slice(0, 3);

  return (
    <main className="app-shell">
      <section className="hero-grid">
        <div className="hero-card">
          <div className="eyebrow"><Sparkles size={16} /> Turkey search radar → global family geo app</div>
          <h1>Çocukla yakınında nereye gidilir?</h1>
          <p className="hero-copy">Google’da aranan çocuklu aile gezi niyetlerini canlı geo aramaya çeviren mobil karar motoru. Önce Türkiye’de güçlü aramaları yakala, sonra global “kids near me”e büyüt.</p>

          <form className="search-panel" onSubmit={handleSubmit}>
            <label htmlFor="location">City or current location</label>
            <div className="location-row">
              <div className="input-wrap">
                <Search size={18} />
                <input
                  id="location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Istanbul, Ankara, Izmir, London..."
                />
              </div>
              <button className="primary-button" type="submit">Find places</button>
            </div>
            <button className="ghost-button" type="button" onClick={useCurrentLocation}>
              <Navigation size={17} /> Use current location
            </button>
          </form>
        </div>

        <aside className="map-art-card" aria-label="Product visual map">
          <div className="orbit one">🛝</div>
          <div className="orbit two">☔</div>
          <div className="orbit three">🦁</div>
          <div className="map-path" />
          <div className="pin-card main-pin">
            <span>Best now</span>
            <strong>{featured[0]?.name || 'Family pick'}</strong>
            <small>{featured[0]?.distanceLabel || 'City pick'} · {featured[0]?.score || 0} score</small>
          </div>
          <div className="mini-stack">
            {featured.map((place, index) => (
              <div className="mini-place" key={place.id}>
                <b>#{index + 1}</b>
                <span>{place.name}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="trend-card">
        <div className="section-heading">
          <TrendingUp size={20} />
          <div>
            <h2>Turkey Google demand radar</h2>
            <p>{activeInsight}</p>
          </div>
        </div>
        <div className="trend-chips">
          {TRENDING_TURKEY_SEARCHES.map((item) => (
            <button key={item.label} type="button" onClick={() => applyTrend(item)}>
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="filter-card" aria-label="Search filters">
        <div className="section-heading">
          <Baby size={20} />
          <div>
            <h2>Kid profile</h2>
            <p>{selectedAge?.helper} · {selectedCategory?.label}</p>
          </div>
        </div>
        <div className="segmented-grid age-grid">
          {AGE_GROUPS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === age ? 'segment active' : 'segment'}
              onClick={() => setAge(item.id)}
            >
              <strong>{item.label}</strong>
              <span>{item.helper}</span>
            </button>
          ))}
        </div>

        <div className="chips" aria-label="Categories">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === category ? 'chip active' : 'chip'}
              onClick={() => setCategory(item.id)}
            >
              <span>{item.emoji}</span> {item.label}
            </button>
          ))}
        </div>

        <label className="radius-label" htmlFor="radius">Search radius: <strong>{radiusKm} km</strong></label>
        <input
          id="radius"
          type="range"
          min="2"
          max="20"
          step="1"
          value={radiusKm}
          onChange={(event) => setRadiusKm(Number(event.target.value))}
        />
        <div className="radius-pills">
          {radiusOptions.map((radius) => (
            <button key={radius} type="button" onClick={() => setRadiusKm(radius)} className={radius === radiusKm ? 'tiny active' : 'tiny'}>{radius} km</button>
          ))}
        </div>
      </section>

      <section className="results-section">
        <div className="results-heading">
          <div>
            <p className="kicker">{coords ? `${coords.lat}, ${coords.lon}` : submittedLocation}</p>
            <h2>Ranked family picks</h2>
          </div>
          <span className="result-count">{isLoading ? 'Searching…' : `${places.length} ideas`}</span>
        </div>

        <div className="notice" role={status === 'error' ? 'alert' : 'status'}>
          {status === 'error' ? <Umbrella size={18} /> : <Compass size={18} />}
          <span>{notice}</span>
        </div>

        {isLoading && (
          <div className="state-card">
            <Loader2 className="spin" size={28} />
            <h3>Finding kid-friendly options…</h3>
            <p>Checking city, filters, live OSM and Turkey fallback ranking.</p>
          </div>
        )}

        {status === 'empty' && (
          <div className="state-card">
            <Telescope size={28} />
            <h3>No exact matches yet</h3>
            <p>Try a wider radius, All categories, or a Turkey radar chip.</p>
          </div>
        )}

        {!isLoading && places.length > 0 && (
          <div className="cards-grid">
            {places.map((place, index) => (
              <article className="place-card" key={place.id}>
                <div className="image-panel">
                  <span className="floating-rank">#{index + 1}</span>
                  <span className="floating-score">{place.score}</span>
                  <div className={`category-illustration ${place.category}`}>
                    {CATEGORIES.find((item) => item.id === place.category)?.emoji || '✨'}
                  </div>
                </div>
                <div className="place-body">
                  <div className="card-topline">
                    <span className="category-tag">{place.categoryLabel}</span>
                    {place.rainyDay && <span className="rain-tag">Rainy day</span>}
                  </div>
                  <h3>{place.name}</h3>
                  <p className="summary">{place.summary}</p>
                  <div className="meta-row"><MapPin size={16} /> {place.distanceLabel} · {place.address}</div>
                  <div className="tag-row">
                    {place.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  <div className="card-actions">
                    <a href={getMapUrl(place)} target="_blank" rel="noreferrer">Map <ExternalLink size={15} /></a>
                    <a href={getDirectionsUrl(place)} target="_blank" rel="noreferrer">Directions <Navigation size={15} /></a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
