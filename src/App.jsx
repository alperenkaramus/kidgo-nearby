import { useEffect, useMemo, useState } from 'react';
import { Baby, Compass, ExternalLink, Loader2, MapPin, Navigation, Search, Sparkles, Umbrella } from 'lucide-react';
import { AGE_GROUPS, CATEGORIES, getDirectionsUrl, getMapUrl, searchPlaces } from './lib/places.js';
import './styles.css';

const radiusOptions = [2, 5, 10, 20];

function App() {
  const [location, setLocation] = useState('Istanbul');
  const [submittedLocation, setSubmittedLocation] = useState('Istanbul');
  const [coords, setCoords] = useState(null);
  const [age, setAge] = useState('3-5');
  const [category, setCategory] = useState('all');
  const [radiusKm, setRadiusKm] = useState(5);
  const [places, setPlaces] = useState([]);
  const [status, setStatus] = useState('idle');
  const [notice, setNotice] = useState('Demo fallback covers Istanbul, London and New York while live geo APIs are wired.');

  const selectedAge = useMemo(() => AGE_GROUPS.find((item) => item.id === age), [age]);

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
          ? 'Showing resilient fallback ideas; live Overpass/Nominatim can plug into the same interface.'
          : 'Ranked by kid fit, category match, distance and family-friendly signals.');
      } catch (error) {
        if (cancelled) return;
        setStatus('error');
        setNotice(error instanceof Error ? error.message : 'Search failed. Showing no results.');
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
        setNotice('Using browser location. If live API is offline, ranked demo places still appear.');
      },
      () => {
        setStatus('error');
        setNotice('Location permission was blocked or unavailable. Try a city name instead.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  }

  const isLoading = status === 'loading';

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="eyebrow"><Sparkles size={16} /> Global family finder MVP</div>
        <h1>What can we do nearby with the kids?</h1>
        <p className="hero-copy">Find playgrounds, parks, museums, zoos and low-stress family stops ranked for age fit, distance and parent practicality.</p>

        <form className="search-panel" onSubmit={handleSubmit}>
          <label htmlFor="location">Location</label>
          <div className="location-row">
            <div className="input-wrap">
              <Search size={18} />
              <input
                id="location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Try Istanbul, London or New York"
              />
            </div>
            <button className="primary-button" type="submit">Search</button>
          </div>
          <button className="ghost-button" type="button" onClick={useCurrentLocation}>
            <Navigation size={17} /> Use current location
          </button>
        </form>
      </section>

      <section className="filter-card" aria-label="Search filters">
        <div className="section-heading">
          <Baby size={20} />
          <div>
            <h2>Kid profile</h2>
            <p>{selectedAge?.helper}</p>
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
            <h2>Best family picks nearby</h2>
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
            <p>Checking location, filters and fallback data.</p>
          </div>
        )}

        {status === 'empty' && (
          <div className="state-card">
            <h3>No exact matches yet</h3>
            <p>Try a wider radius or switch to All categories. The fallback seed keeps the MVP usable while live POI search is connected.</p>
          </div>
        )}

        {!isLoading && places.length > 0 && (
          <div className="cards-grid">
            {places.map((place, index) => (
              <article className="place-card" key={place.id}>
                <div className="card-topline">
                  <span className="rank">#{index + 1}</span>
                  <span className="score">{place.score} family score</span>
                </div>
                <h3>{place.name}</h3>
                <p className="summary">{place.summary}</p>
                <div className="meta-row"><MapPin size={16} /> {place.distanceKm} km · {place.address}</div>
                <div className="tag-row">
                  <span className="category-tag">{place.categoryLabel}</span>
                  {place.rainyDay && <span className="rain-tag">Rainy day</span>}
                  {place.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <div className="card-actions">
                  <a href={getMapUrl(place)} target="_blank" rel="noreferrer">Map <ExternalLink size={15} /></a>
                  <a href={getDirectionsUrl(place)} target="_blank" rel="noreferrer">Directions <Navigation size={15} /></a>
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
