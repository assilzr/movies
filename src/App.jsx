import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search, Play, Info, X, User, LogOut, Plus, Pencil, Trash2,
  ChevronLeft, ChevronRight, Film, Bookmark, BookmarkCheck,
  LayoutGrid, Home as HomeIcon, Menu
} from "lucide-react";

// Lightweight localStorage-backed shim so this component runs on any static
// host (Vercel, Netlify, GitHub Pages, etc). Mirrors the get/set/delete
// shape used throughout the component; the trailing "shared" arg is ignored.
const storage = {
  async get(key) {
    const raw = localStorage.getItem(key);
    if (raw === null) throw new Error(`key "${key}" not found`);
    return { key, value: raw };
  },
  async set(key, value) {
    localStorage.setItem(key, value);
    return { key, value };
  },
  async delete(key) {
    localStorage.removeItem(key);
    return { key, deleted: true };
  },
};

const GENRES = ["Drama", "Sci-Fi", "Thriller", "Comedy", "Documentary", "Animation", "Horror", "Romance"];

const POSTER_THEMES = [
  { a: "38 70% 42%", b: "5 55% 22%" },
  { a: "195 35% 28%", b: "230 40% 14%" },
  { a: "280 28% 30%", b: "5 55% 20%" },
  { a: "150 24% 24%", b: "38 60% 34%" },
  { a: "230 38% 20%", b: "280 28% 34%" },
  { a: "5 55% 28%", b: "38 70% 38%" },
];

const DEFAULT_MOVIES = [
  { id: 1, title: "Midnight Ledger", genre: "Drama", year: 2021, duration: "2h 8m", rating: 8.1, maturity: "PG-13", synopsis: "A forensic accountant uncovers her firm's darkest secret the night before she's set to retire.", cast: "Elena Voss, Marcus Cole", featured: true, colorIdx: 0 },
  { id: 2, title: "Glass Horizon", genre: "Sci-Fi", year: 2023, duration: "2h 22m", rating: 8.6, maturity: "PG-13", synopsis: "When Earth's last orbital station goes dark, a salvage pilot must decide who's worth saving.", cast: "Priya Anand, Jonah Reyes", featured: true, colorIdx: 1 },
  { id: 3, title: "Static Bloom", genre: "Thriller", year: 2022, duration: "1h 54m", rating: 7.4, maturity: "R", synopsis: "A radio host's late-night callers start describing crimes before they happen.", cast: "Dara Whitfield", featured: false, colorIdx: 2 },
  { id: 4, title: "The Understudy's Kitchen", genre: "Comedy", year: 2020, duration: "1h 42m", rating: 7.0, maturity: "PG-13", synopsis: "A failed actor takes a job as a private chef and cooks his way into a family's chaos.", cast: "Sam Ilori", featured: false, colorIdx: 3 },
  { id: 5, title: "Continental Drift", genre: "Documentary", year: 2023, duration: "1h 38m", rating: 8.3, maturity: "PG", synopsis: "Three geologists spend a decade mapping the fault line under a sleeping city.", cast: "N/A", featured: false, colorIdx: 4 },
  { id: 6, title: "Paper Lanterns", genre: "Animation", year: 2019, duration: "1h 33m", rating: 8.0, maturity: "PG", synopsis: "A lantern maker's daughter journeys through a folded-paper spirit world to save her village.", cast: "Yuna Park, Theo Marsh", featured: false, colorIdx: 5 },
  { id: 7, title: "The Hollow Choir", genre: "Horror", year: 2022, duration: "1h 47m", rating: 7.2, maturity: "R", synopsis: "A church restoration crew wakes something that has been humming in the walls for a century.", cast: "Ines Aguilar", featured: false, colorIdx: 0 },
  { id: 8, title: "Low Tide in Marseille", genre: "Romance", year: 2021, duration: "1h 58m", rating: 7.6, maturity: "PG-13", synopsis: "Two rival boat restorers fall for each other over one long, disputed summer.", cast: "Camille Rocher, Idris Kane", featured: false, colorIdx: 1 },
  { id: 9, title: "Concrete Canaries", genre: "Drama", year: 2018, duration: "2h 4m", rating: 7.8, maturity: "R", synopsis: "Miners' daughters start a union of their own after a collapse the company denies happened.", cast: "Bridget Fallow", featured: true, colorIdx: 2 },
  { id: 10, title: "Vector Zero", genre: "Sci-Fi", year: 2024, duration: "2h 10m", rating: 8.4, maturity: "PG-13", synopsis: "An AI trained to prevent wars starts refusing every order it's given.", cast: "Renata Cho, Alistair Bloom", featured: false, colorIdx: 3 },
  { id: 11, title: "The Ninth Caller", genre: "Thriller", year: 2020, duration: "1h 49m", rating: 7.5, maturity: "R", synopsis: "A crisis-line volunteer realizes her newest caller already knows her address.", cast: "Nadia Ferro", featured: false, colorIdx: 4 },
  { id: 12, title: "Two Left Feet", genre: "Comedy", year: 2022, duration: "1h 36m", rating: 6.9, maturity: "PG", synopsis: "A stiff-limbed dance teacher enters a competition to save his failing studio.", cast: "Owen Bishop", featured: false, colorIdx: 5 },
  { id: 13, title: "Salt and Static", genre: "Documentary", year: 2021, duration: "1h 44m", rating: 8.1, maturity: "PG", synopsis: "Inside the last analog radio station broadcasting to fishing boats in the North Atlantic.", cast: "N/A", featured: false, colorIdx: 0 },
  { id: 14, title: "Tin Fox", genre: "Animation", year: 2023, duration: "1h 29m", rating: 8.2, maturity: "PG", synopsis: "A scrap-metal fox built by a lonely inventor learns to steal back the things winter takes.", cast: "Voice: Mira Okafor", featured: true, colorIdx: 1 },
  { id: 15, title: "Root Cellar", genre: "Horror", year: 2019, duration: "1h 41m", rating: 6.8, maturity: "R", synopsis: "A family inherits a farmhouse with a cellar that keeps getting bigger.", cast: "Colin Aster", featured: false, colorIdx: 2 },
  { id: 16, title: "Letters to Almost", genre: "Romance", year: 2020, duration: "1h 52m", rating: 7.3, maturity: "PG-13", synopsis: "A postal worker starts answering love letters addressed to a man who died a year ago.", cast: "Josefine Lund", featured: false, colorIdx: 3 },
  { id: 17, title: "The Long Recess", genre: "Drama", year: 2023, duration: "2h 16m", rating: 8.5, maturity: "R", synopsis: "A retiring judge revisits the one case that never sat right with her.", cast: "Vivian Okonkwo", featured: true, colorIdx: 4 },
  { id: 18, title: "Orbital Debris", genre: "Sci-Fi", year: 2020, duration: "1h 58m", rating: 7.1, maturity: "PG-13", synopsis: "A junk collector in low orbit finds a black box that isn't supposed to exist.", cast: "Femi Odutola", featured: false, colorIdx: 5 },
  { id: 19, title: "The Alibi Club", genre: "Thriller", year: 2024, duration: "2h 1m", rating: 7.9, maturity: "R", synopsis: "Five strangers who provided each other's alibis start turning up dead.", cast: "Greta Solheim, Marcus Cole", featured: false, colorIdx: 0 },
  { id: 20, title: "Six Wrong Turns", genre: "Comedy", year: 2019, duration: "1h 39m", rating: 6.7, maturity: "PG-13", synopsis: "A GPS malfunction turns a best man's drive to the wedding into a road trip from hell.", cast: "Denny Osei", featured: false, colorIdx: 1 },
  { id: 21, title: "The Weight of Water", genre: "Documentary", year: 2022, duration: "1h 50m", rating: 8.0, maturity: "PG", synopsis: "Free divers off three coastlines describe what they carry to the surface and what they leave behind.", cast: "N/A", featured: false, colorIdx: 2 },
  { id: 22, title: "Moth and Compass", genre: "Animation", year: 2021, duration: "1h 31m", rating: 7.9, maturity: "PG", synopsis: "A moth who can only fly at night guides a lost caravan using constellations only it can see.", cast: "Voice: Priya Anand", featured: false, colorIdx: 3 },
  { id: 23, title: "The Tenant Upstairs", genre: "Horror", year: 2023, duration: "1h 45m", rating: 7.6, maturity: "R", synopsis: "A landlord discovers her top-floor tenant hasn't left the building in forty years.", cast: "Rosalind Kemp", featured: true, colorIdx: 4 },
  { id: 24, title: "Harbor Light Rewind", genre: "Romance", year: 2023, duration: "2h 5m", rating: 7.7, maturity: "PG-13", synopsis: "A lighthouse keeper's granddaughter finds forty years of undelivered letters meant for a stranger.", cast: "Astrid Solberg", featured: false, colorIdx: 5 },
];

const AVATARS = ["🎬", "🎞️", "🍿", "🎟️", "📽️", "🌙", "⭐", "🦊"];
const SAMPLE_VIDEO = "https://www.w3schools.com/html/mov_bbb.mp4";

function posterStyle(colorIdx) {
  const t = POSTER_THEMES[colorIdx % POSTER_THEMES.length];
  return { backgroundImage: `linear-gradient(155deg, hsl(${t.a}) 0%, hsl(${t.b}) 100%)` };
}

function Sprockets({ vertical, count = 14 }) {
  const dots = Array.from({ length: count });
  return (
    <div className={`lm-sprockets ${vertical ? "lm-sprockets-v" : "lm-sprockets-h"}`}>
      {dots.map((_, i) => <span key={i} className="lm-sprocket-dot" />)}
    </div>
  );
}

function TicketBadge({ children, tone = "ember" }) {
  return <span className={`lm-ticket lm-ticket-${tone}`}>{children}</span>;
}

function MovieCard({ movie, onOpen, inList }) {
  return (
    <button className="lm-card" onClick={() => onOpen(movie)}>
      <div className="lm-card-poster" style={posterStyle(movie.colorIdx)}>
        <div className="lm-card-grain" />
        {inList && <span className="lm-card-listed"><BookmarkCheck size={14} /></span>}
        <div className="lm-card-bottom">
          <span className="lm-card-title">{movie.title}</span>
          <span className="lm-card-meta">{movie.year} · {movie.genre}</span>
        </div>
        <div className="lm-card-hover">
          <Play size={22} />
        </div>
      </div>
    </button>
  );
}

function Shelf({ title, movies, onOpen, watchlist }) {
  const trackRef = useRef(null);
  if (!movies.length) return null;
  const scroll = (dir) => {
    if (trackRef.current) trackRef.current.scrollBy({ left: dir * 480, behavior: "smooth" });
  };
  return (
    <section className="lm-shelf">
      <div className="lm-shelf-head">
        <h2 className="lm-shelf-title">{title}</h2>
        <div className="lm-shelf-arrows">
          <button className="lm-arrow" onClick={() => scroll(-1)} aria-label="Scroll left"><ChevronLeft size={18} /></button>
          <button className="lm-arrow" onClick={() => scroll(1)} aria-label="Scroll right"><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="lm-shelf-track" ref={trackRef}>
        {movies.map((m) => (
          <div className="lm-shelf-item" key={m.id}>
            <MovieCard movie={m} onOpen={onOpen} inList={watchlist.includes(m.id)} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [users, setUsers] = useState([]);
  const [session, setSession] = useState(null);
  const [movies, setMovies] = useState(DEFAULT_MOVIES);
  const [watchlist, setWatchlist] = useState([]);
  const [view, setView] = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [genreFilter, setGenreFilter] = useState(null);
  const [query, setQuery] = useState("");
  const [activeMovie, setActiveMovie] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const [toast, setToast] = useState("");
  const [editingMovie, setEditingMovie] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const featured = useMemo(() => movies.filter((m) => m.featured), [movies]);

  useEffect(() => {
    (async () => {
      try {
        const u = await storage.get("lumen_users", false);
        setUsers(u ? JSON.parse(u.value) : []);
      } catch { setUsers([]); }
      try {
        const m = await storage.get("lumen_movies", false);
        setMovies(m ? JSON.parse(m.value) : DEFAULT_MOVIES);
      } catch {
        setMovies(DEFAULT_MOVIES);
        try { await storage.set("lumen_movies", JSON.stringify(DEFAULT_MOVIES), false); } catch {}
      }
      try {
        const s = await storage.get("lumen_session", false);
        if (s) setSession(JSON.parse(s.value));
      } catch { setSession(null); }
      setBooting(false);
    })();
  }, []);

  useEffect(() => {
    if (!session) { setWatchlist([]); return; }
    (async () => {
      try {
        const w = await storage.get(`lumen_watchlist_${session.email}`, false);
        setWatchlist(w ? JSON.parse(w.value) : []);
      } catch { setWatchlist([]); }
    })();
  }, [session]);

  useEffect(() => {
    if (!featured.length) return;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % featured.length), 6500);
    return () => clearInterval(t);
  }, [featured.length]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  async function persistUsers(list) {
    setUsers(list);
    try { await storage.set("lumen_users", JSON.stringify(list), false); } catch {}
  }
  async function persistMovies(list) {
    setMovies(list);
    try { await storage.set("lumen_movies", JSON.stringify(list), false); } catch {}
  }
  async function persistWatchlist(list, email) {
    setWatchlist(list);
    try { await storage.set(`lumen_watchlist_${email}`, JSON.stringify(list), false); } catch {}
  }

  function handleRegister(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get("name").trim();
    const email = fd.get("email").trim().toLowerCase();
    const password = fd.get("password");
    const confirm = fd.get("confirm");
    if (!name || !email || !password) return setAuthError("Fill in every field.");
    if (password.length < 4) return setAuthError("Password needs at least 4 characters.");
    if (password !== confirm) return setAuthError("Passwords don't match.");
    if (users.some((u) => u.email === email)) return setAuthError("An account with that email already exists.");
    const newUser = { name, email, password, avatar: AVATARS[users.length % AVATARS.length] };
    const list = [...users, newUser];
    persistUsers(list);
    setSession({ name, email, avatar: newUser.avatar });
    storage.set("lumen_session", JSON.stringify({ name, email, avatar: newUser.avatar }), false).catch(() => {});
    setAuthError("");
    setView("home");
  }

  function handleLogin(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = fd.get("email").trim().toLowerCase();
    const password = fd.get("password");
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return setAuthError("No account matches that email and password.");
    setSession({ name: found.name, email: found.email, avatar: found.avatar });
    storage.set("lumen_session", JSON.stringify({ name: found.name, email: found.email, avatar: found.avatar }), false).catch(() => {});
    setAuthError("");
    setView("home");
  }

  function handleLogout() {
    setSession(null);
    storage.delete("lumen_session", false).catch(() => {});
    setView("home");
    setMenuOpen(false);
  }

  function toggleWatchlist(movie) {
    const has = watchlist.includes(movie.id);
    const list = has ? watchlist.filter((id) => id !== movie.id) : [...watchlist, movie.id];
    persistWatchlist(list, session.email);
    setToast(has ? `Removed "${movie.title}" from your list` : `Added "${movie.title}" to your list`);
  }

  function saveMovieForm(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      title: fd.get("title").trim(),
      genre: fd.get("genre"),
      year: Number(fd.get("year")) || new Date().getFullYear(),
      duration: fd.get("duration").trim() || "1h 30m",
      rating: Number(fd.get("rating")) || 0,
      maturity: fd.get("maturity"),
      synopsis: fd.get("synopsis").trim(),
      cast: fd.get("cast").trim() || "N/A",
      featured: fd.get("featured") === "on",
      colorIdx: editingMovie ? editingMovie.colorIdx : Math.floor(Math.random() * POSTER_THEMES.length),
    };
    if (!payload.title || !payload.synopsis) return;
    let list;
    if (editingMovie) {
      list = movies.map((m) => (m.id === editingMovie.id ? { ...m, ...payload } : m));
      setToast(`Saved changes to "${payload.title}"`);
    } else {
      const id = Math.max(0, ...movies.map((m) => m.id)) + 1;
      list = [...movies, { id, ...payload }];
      setToast(`Added "${payload.title}" to the catalog`);
    }
    persistMovies(list);
    setShowForm(false);
    setEditingMovie(null);
  }

  function deleteMovie(id) {
    const target = movies.find((m) => m.id === id);
    persistMovies(movies.filter((m) => m.id !== id));
    setToast(`Removed "${target?.title}" from the catalog`);
  }

  const searched = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return movies.filter((m) =>
      m.title.toLowerCase().includes(q) ||
      m.genre.toLowerCase().includes(q) ||
      m.cast.toLowerCase().includes(q)
    );
  }, [query, movies]);

  const browseResults = useMemo(() => {
    if (!genreFilter) return movies;
    return movies.filter((m) => m.genre === genreFilter);
  }, [genreFilter, movies]);

  const trending = useMemo(() => [...movies].sort((a, b) => b.rating - a.rating).slice(0, 10), [movies]);
  const myListMovies = useMemo(() => movies.filter((m) => watchlist.includes(m.id)), [movies, watchlist]);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
    .lm-root { --void:#0B0B0F; --charcoal:#17161D; --charcoal2:#1F1E27; --ember:#E8A33D; --crimson:#C4342B; --teal:#5B8791; --bone:#F2EFE9; --smoke:#9391A0; --hair:rgba(242,239,233,0.1);
      background:var(--void); color:var(--bone); font-family:'Manrope',sans-serif; min-height:100vh; position:relative; }
    .lm-root * { box-sizing:border-box; }
    .lm-serif { font-family:'Fraunces',serif; }
    .lm-mono { font-family:'IBM Plex Mono',monospace; }
    .lm-sprockets { display:flex; gap:10px; z-index:2; pointer-events:none; }
    .lm-sprockets-h { flex-direction:row; padding:0 20px; }
    .lm-sprockets-v { flex-direction:column; position:absolute; top:0; bottom:0; }
    .lm-sprocket-dot { width:6px; height:6px; border-radius:50%; background:rgba(242,239,233,0.28); flex-shrink:0; }
    .lm-ticket { font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.03em; padding:3px 10px; position:relative; display:inline-flex; align-items:center; }
    .lm-ticket-ember { background:var(--ember); color:#3A2405; }
    .lm-ticket-crimson { background:var(--crimson); color:#3A0E0A; }
    .lm-ticket-teal { background:var(--teal); color:#08171A; }
    .lm-ticket::before, .lm-ticket::after { content:''; position:absolute; top:50%; width:8px; height:8px; background:var(--void); border-radius:50%; transform:translateY(-50%); }
    .lm-ticket::before { left:-4px; } .lm-ticket::after { right:-4px; }

    .lm-navbar { position:sticky; top:0; z-index:40; display:flex; align-items:center; justify-content:space-between; padding:16px 28px; background:linear-gradient(to bottom, rgba(11,11,15,0.95), rgba(11,11,15,0.4)); backdrop-filter:blur(6px); }
    .lm-logo { display:flex; align-items:center; gap:8px; font-family:'Fraunces',serif; font-weight:600; font-size:22px; letter-spacing:0.02em; color:var(--ember); cursor:pointer; background:none; border:none; }
    .lm-navlinks { display:flex; gap:22px; align-items:center; }
    .lm-navlink { background:none; border:none; color:var(--smoke); font-family:'Manrope',sans-serif; font-size:14px; font-weight:600; cursor:pointer; padding:6px 2px; border-bottom:2px solid transparent; }
    .lm-navlink.active, .lm-navlink:hover { color:var(--bone); border-bottom-color:var(--ember); }
    .lm-navright { display:flex; align-items:center; gap:14px; }
    .lm-search-box { display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.06); border:1px solid var(--hair); border-radius:4px; padding:6px 10px; }
    .lm-search-box input { background:none; border:none; outline:none; color:var(--bone); font-family:'Manrope',sans-serif; font-size:13px; width:140px; }
    .lm-avatar-btn { width:34px; height:34px; border-radius:50%; background:var(--charcoal2); border:1px solid var(--hair); font-size:16px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .lm-icon-btn { background:none; border:none; color:var(--bone); cursor:pointer; display:flex; align-items:center; padding:4px; }
    .lm-mobile-menu { display:none; }

    .lm-hero { position:relative; height:64vh; min-height:420px; overflow:hidden; }
    .lm-hero-bg { position:absolute; inset:0; transition:opacity 0.8s ease; }
    .lm-hero-grain { position:absolute; inset:0; background:repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px); mix-blend-mode:overlay; }
    .lm-hero-fade { position:absolute; inset:0; background:linear-gradient(to top, var(--void) 4%, rgba(11,11,15,0.2) 55%, transparent 100%), linear-gradient(to right, rgba(11,11,15,0.75) 0%, transparent 55%); }
    .lm-hero-content { position:relative; z-index:3; height:100%; display:flex; flex-direction:column; justify-content:flex-end; padding:0 40px 56px; max-width:640px; }
    .lm-hero-eyebrow { font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--ember); letter-spacing:0.08em; margin-bottom:10px; }
    .lm-hero-title { font-family:'Fraunces',serif; font-weight:600; font-size:52px; line-height:1.02; margin:0 0 14px; }
    .lm-hero-meta { display:flex; gap:10px; align-items:center; margin-bottom:14px; }
    .lm-hero-syn { color:var(--smoke); font-size:15px; line-height:1.6; margin:0 0 22px; max-width:520px; }
    .lm-hero-actions { display:flex; gap:12px; }
    .lm-btn { display:inline-flex; align-items:center; gap:8px; padding:12px 22px; border-radius:3px; font-family:'Manrope',sans-serif; font-weight:700; font-size:14px; cursor:pointer; border:none; }
    .lm-btn-primary { background:var(--ember); color:#241500; }
    .lm-btn-primary:hover { background:#f0b25c; }
    .lm-btn-ghost { background:rgba(255,255,255,0.1); color:var(--bone); border:1px solid var(--hair); }
    .lm-btn-ghost:hover { background:rgba(255,255,255,0.18); }
    .lm-hero-dots { position:absolute; bottom:20px; right:32px; z-index:3; display:flex; gap:8px; }
    .lm-hero-dot { width:22px; height:3px; background:rgba(242,239,233,0.25); border:none; cursor:pointer; }
    .lm-hero-dot.active { background:var(--ember); }

    .lm-divider { padding:10px 0; opacity:0.6; }

    .lm-shelf { padding:8px 0 26px; }
    .lm-shelf-head { display:flex; align-items:center; justify-content:space-between; padding:0 40px; margin-bottom:12px; }
    .lm-shelf-title { font-family:'Fraunces',serif; font-weight:600; font-size:20px; margin:0; }
    .lm-shelf-arrows { display:flex; gap:6px; }
    .lm-arrow { background:var(--charcoal2); border:1px solid var(--hair); color:var(--bone); width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .lm-arrow:hover { background:var(--ember); color:#241500; }
    .lm-shelf-track { display:flex; gap:14px; overflow-x:auto; padding:4px 40px 10px; scroll-snap-type:x proximity; scrollbar-width:none; }
    .lm-shelf-track::-webkit-scrollbar { display:none; }
    .lm-shelf-item { flex:0 0 auto; scroll-snap-align:start; }

    .lm-card { background:none; border:none; padding:0; cursor:pointer; width:200px; display:block; }
    .lm-card-poster { position:relative; width:200px; height:288px; border-radius:4px; overflow:hidden; transition:transform 0.25s ease; }
    .lm-card:hover .lm-card-poster { transform:scale(1.045); }
    .lm-card-grain { position:absolute; inset:0; background:repeating-linear-gradient(115deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 4px); }
    .lm-card-listed { position:absolute; top:8px; right:8px; background:rgba(11,11,15,0.7); color:var(--ember); border-radius:50%; width:26px; height:26px; display:flex; align-items:center; justify-content:center; }
    .lm-card-bottom { position:absolute; left:0; right:0; bottom:0; padding:12px 12px 14px; background:linear-gradient(to top, rgba(0,0,0,0.75), transparent); text-align:left; }
    .lm-card-title { display:block; font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:15px; line-height:1.2; }
    .lm-card-meta { display:block; font-family:'IBM Plex Mono',monospace; font-size:10px; color:var(--smoke); margin-top:4px; }
    .lm-card-hover { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0); opacity:0; transition:opacity 0.2s ease; color:var(--bone); }
    .lm-card:hover .lm-card-hover { opacity:1; background:rgba(0,0,0,0.28); }

    .lm-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:18px; padding:0 40px 40px; }
    .lm-grid .lm-card, .lm-grid .lm-card-poster { width:100%; height:auto; aspect-ratio:2/3; }

    .lm-page-head { padding:110px 40px 24px; }
    .lm-page-title { font-family:'Fraunces',serif; font-weight:600; font-size:32px; margin:0 0 6px; }
    .lm-page-sub { color:var(--smoke); font-size:14px; margin:0; }
    .lm-chip-row { display:flex; gap:10px; flex-wrap:wrap; padding:0 40px 26px; }
    .lm-chip { background:var(--charcoal2); border:1px solid var(--hair); color:var(--bone); font-family:'Manrope',sans-serif; font-size:13px; font-weight:600; padding:8px 16px; border-radius:20px; cursor:pointer; }
    .lm-chip.active { background:var(--ember); color:#241500; border-color:var(--ember); }

    .lm-searchpage { padding:110px 40px 40px; }
    .lm-search-hero { max-width:520px; margin:0 auto 30px; }
    .lm-search-hero .lm-search-box { width:100%; padding:14px 16px; }
    .lm-search-hero input { width:100%; font-size:15px; }
    .lm-empty { text-align:center; color:var(--smoke); padding:60px 20px; font-size:14px; }

    .lm-modal-overlay { position:fixed; inset:0; background:rgba(6,6,9,0.85); z-index:100; display:flex; align-items:center; justify-content:center; padding:24px; }
    .lm-modal { background:var(--charcoal); width:100%; max-width:640px; max-height:88vh; overflow-y:auto; border-radius:8px; border:1px solid var(--hair); }
    .lm-modal-hero { height:260px; position:relative; }
    .lm-modal-fade { position:absolute; inset:0; background:linear-gradient(to top, var(--charcoal), transparent 60%); }
    .lm-modal-close { position:absolute; top:14px; right:14px; background:rgba(11,11,15,0.7); border:none; color:var(--bone); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:2; }
    .lm-modal-body { padding:0 30px 30px; margin-top:-40px; position:relative; z-index:2; }
    .lm-modal-title { font-family:'Fraunces',serif; font-weight:600; font-size:28px; margin:0 0 10px; }
    .lm-modal-meta { display:flex; gap:10px; align-items:center; margin-bottom:16px; flex-wrap:wrap; }
    .lm-modal-meta span.lm-mono { color:var(--smoke); font-size:12px; }
    .lm-modal-syn { color:var(--bone); opacity:0.85; line-height:1.65; font-size:14.5px; margin:0 0 10px; }
    .lm-modal-cast { color:var(--smoke); font-size:13px; margin:0 0 24px; }
    .lm-modal-actions { display:flex; gap:12px; }

    .lm-player { position:fixed; inset:0; background:#000; z-index:200; display:flex; flex-direction:column; }
    .lm-player-top { display:flex; align-items:center; gap:14px; padding:16px 22px; background:linear-gradient(to bottom, rgba(0,0,0,0.85), transparent); position:absolute; top:0; left:0; right:0; z-index:2; }
    .lm-player-back { background:rgba(255,255,255,0.12); border:none; color:var(--bone); width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .lm-player video { width:100%; height:100%; object-fit:contain; flex:1; background:#000; }
    .lm-player-label { font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--smoke); background:rgba(0,0,0,0.5); padding:3px 10px; border-radius:3px; position:absolute; bottom:14px; left:22px; z-index:2; }

    .lm-auth-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; position:relative; overflow:hidden; }
    .lm-auth-bg { position:absolute; inset:0; background:linear-gradient(155deg, hsl(38 70% 12%) 0%, hsl(5 55% 8%) 45%, hsl(230 40% 6%) 100%); }
    .lm-auth-card { position:relative; z-index:2; width:100%; max-width:380px; background:rgba(23,22,29,0.9); border:1px solid var(--hair); border-radius:8px; padding:34px 30px; backdrop-filter:blur(4px); }
    .lm-auth-logo { display:flex; align-items:center; gap:8px; justify-content:center; font-family:'Fraunces',serif; font-weight:600; font-size:26px; color:var(--ember); margin-bottom:6px; }
    .lm-auth-tag { text-align:center; color:var(--smoke); font-size:13px; margin:0 0 26px; }
    .lm-field { margin-bottom:14px; }
    .lm-field label { display:block; font-size:12px; color:var(--smoke); margin-bottom:6px; font-weight:600; }
    .lm-field input, .lm-field select, .lm-field textarea { width:100%; background:rgba(255,255,255,0.06); border:1px solid var(--hair); border-radius:4px; padding:10px 12px; color:var(--bone); font-family:'Manrope',sans-serif; font-size:14px; outline:none; }
    .lm-field input:focus, .lm-field select:focus, .lm-field textarea:focus { border-color:var(--ember); }
    .lm-field textarea { resize:vertical; min-height:70px; }
    .lm-auth-error { background:rgba(196,52,43,0.15); border:1px solid rgba(196,52,43,0.4); color:#f2a49e; font-size:12.5px; padding:8px 12px; border-radius:4px; margin-bottom:14px; }
    .lm-auth-switch { text-align:center; margin-top:16px; font-size:13px; color:var(--smoke); }
    .lm-auth-switch button { background:none; border:none; color:var(--ember); cursor:pointer; font-weight:700; font-size:13px; }
    .lm-auth-disclaimer { text-align:center; font-size:11px; color:var(--smoke); opacity:0.7; margin-top:18px; line-height:1.5; }

    .lm-profile { padding:110px 40px 50px; max-width:760px; }
    .lm-profile-head { display:flex; align-items:center; gap:20px; margin-bottom:30px; }
    .lm-profile-avatar { width:76px; height:76px; border-radius:50%; background:var(--charcoal2); border:1px solid var(--hair); display:flex; align-items:center; justify-content:center; font-size:34px; }
    .lm-avatar-grid { display:flex; gap:10px; flex-wrap:wrap; margin:14px 0 26px; }
    .lm-avatar-opt { width:44px; height:44px; border-radius:50%; background:var(--charcoal2); border:2px solid transparent; font-size:20px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .lm-avatar-opt.active { border-color:var(--ember); }

    .lm-dash { padding:110px 40px 50px; }
    .lm-dash-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
    .lm-table-wrap { overflow-x:auto; border:1px solid var(--hair); border-radius:6px; }
    .lm-table { width:100%; border-collapse:collapse; min-width:640px; }
    .lm-table th { text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; color:var(--smoke); padding:12px 16px; border-bottom:1px solid var(--hair); font-family:'IBM Plex Mono',monospace; }
    .lm-table td { padding:12px 16px; border-bottom:1px solid var(--hair); font-size:13.5px; }
    .lm-table tr:last-child td { border-bottom:none; }
    .lm-table-actions { display:flex; gap:8px; }
    .lm-icon-action { background:var(--charcoal2); border:1px solid var(--hair); color:var(--bone); width:28px; height:28px; border-radius:4px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .lm-icon-action:hover { border-color:var(--ember); color:var(--ember); }

    .lm-toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--charcoal2); border:1px solid var(--hair); padding:12px 20px; border-radius:6px; font-size:13px; z-index:300; }

    .lm-boot { min-height:100vh; display:flex; align-items:center; justify-content:center; color:var(--smoke); font-family:'IBM Plex Mono',monospace; font-size:13px; }

    @media (max-width: 860px) {
      .lm-navlinks { display:none; }
      .lm-mobile-menu { display:flex; }
      .lm-hero-title { font-size:36px; }
      .lm-hero { height:56vh; }
      .lm-page-head, .lm-shelf-head, .lm-chip-row, .lm-grid, .lm-searchpage, .lm-profile, .lm-dash { padding-left:18px; padding-right:18px; }
      .lm-shelf-track { padding-left:18px; padding-right:18px; }
      .lm-search-box input { width:90px; }
    }
  `;

  if (booting) {
    return (
      <div className="lm-root">
        <style>{styles}</style>
        <div className="lm-boot">loading catalog…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="lm-root">
        <style>{styles}</style>
        <div className="lm-auth-wrap">
          <div className="lm-auth-bg" />
          <div className="lm-auth-card">
            <div className="lm-auth-logo"><Film size={24} /> LUMEN</div>
            <p className="lm-auth-tag">Films after dark.</p>
            {authError && <div className="lm-auth-error">{authError}</div>}
            {authMode === "login" ? (
              <form onSubmit={handleLogin}>
                <div className="lm-field">
                  <label>Email</label>
                  <input name="email" type="email" placeholder="name@example.com" required />
                </div>
                <div className="lm-field">
                  <label>Password</label>
                  <input name="password" type="password" placeholder="Your password" required />
                </div>
                <button type="submit" className="lm-btn lm-btn-primary" style={{ width: "100%", justifyContent: "center" }}>Sign in</button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="lm-field">
                  <label>Name</label>
                  <input name="name" placeholder="Your name" required />
                </div>
                <div className="lm-field">
                  <label>Email</label>
                  <input name="email" type="email" placeholder="name@example.com" required />
                </div>
                <div className="lm-field">
                  <label>Password</label>
                  <input name="password" type="password" placeholder="At least 4 characters" required />
                </div>
                <div className="lm-field">
                  <label>Confirm password</label>
                  <input name="confirm" type="password" placeholder="Repeat password" required />
                </div>
                <button type="submit" className="lm-btn lm-btn-primary" style={{ width: "100%", justifyContent: "center" }}>Create account</button>
              </form>
            )}
            <div className="lm-auth-switch">
              {authMode === "login" ? (
                <>New to LUMEN? <button onClick={() => { setAuthMode("register"); setAuthError(""); }}>Create an account</button></>
              ) : (
                <>Already have an account? <button onClick={() => { setAuthMode("login"); setAuthError(""); }}>Sign in</button></>
              )}
            </div>
            <p className="lm-auth-disclaimer">Demo only — accounts are stored for this app and aren't secure. Use a password you don't rely on elsewhere.</p>
          </div>
        </div>
      </div>
    );
  }

  const heroMovie = featured[heroIdx] || movies[0];

  return (
    <div className="lm-root">
      <style>{styles}</style>

      <nav className="lm-navbar">
        <button className="lm-logo" onClick={() => { setView("home"); setQuery(""); }}>
          <Film size={20} /> LUMEN
        </button>
        <div className="lm-navlinks">
          <button className={`lm-navlink ${view === "home" ? "active" : ""}`} onClick={() => setView("home")}>Home</button>
          <button className={`lm-navlink ${view === "browse" ? "active" : ""}`} onClick={() => { setView("browse"); setGenreFilter(null); }}>Browse</button>
          <button className={`lm-navlink ${view === "profile" ? "active" : ""}`} onClick={() => setView("profile")}>My list</button>
          <button className={`lm-navlink ${view === "dashboard" ? "active" : ""}`} onClick={() => setView("dashboard")}>Manage content</button>
        </div>
        <div className="lm-navright">
          <div className="lm-search-box">
            <Search size={14} color="#9391A0" />
            <input
              placeholder="Titles, genres, cast"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setView("search"); }}
              onFocus={() => setView("search")}
            />
          </div>
          <button className="lm-icon-btn lm-mobile-menu" onClick={() => setMenuOpen((m) => !m)} aria-label="Menu"><Menu size={20} /></button>
          <button className="lm-avatar-btn" onClick={() => setView("profile")} title={session.name}>{session.avatar}</button>
          <button className="lm-icon-btn" onClick={handleLogout} title="Sign out"><LogOut size={18} /></button>
        </div>
      </nav>

      {menuOpen && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 20px 14px", position: "relative", zIndex: 39 }}>
          {[["home", "Home"], ["browse", "Browse"], ["profile", "My list"], ["dashboard", "Manage content"]].map(([v, label]) => (
            <button key={v} className="lm-navlink" style={{ textAlign: "left", padding: "10px 0" }} onClick={() => { setView(v); setMenuOpen(false); }}>{label}</button>
          ))}
        </div>
      )}

      {view === "home" && (
        <>
          <div className="lm-hero">
            <div className="lm-hero-bg" style={posterStyle(heroMovie.colorIdx)} />
            <div className="lm-hero-grain" />
            <div className="lm-hero-fade" />
            <div className="lm-hero-content">
              <div className="lm-hero-eyebrow">FEATURED TONIGHT</div>
              <h1 className="lm-hero-title">{heroMovie.title}</h1>
              <div className="lm-hero-meta">
                <TicketBadge tone="ember">{heroMovie.maturity}</TicketBadge>
                <span className="lm-mono" style={{ color: "#9391A0", fontSize: 12 }}>{heroMovie.year} · {heroMovie.duration} · ★ {heroMovie.rating}</span>
              </div>
              <p className="lm-hero-syn">{heroMovie.synopsis}</p>
              <div className="lm-hero-actions">
                <button className="lm-btn lm-btn-primary" onClick={() => setPlaying(heroMovie)}><Play size={16} /> Play</button>
                <button className="lm-btn lm-btn-ghost" onClick={() => setActiveMovie(heroMovie)}><Info size={16} /> More info</button>
              </div>
            </div>
            {featured.length > 1 && (
              <div className="lm-hero-dots">
                {featured.map((_, i) => (
                  <button key={i} className={`lm-hero-dot ${i === heroIdx ? "active" : ""}`} onClick={() => setHeroIdx(i)} aria-label={`Slide ${i + 1}`} />
                ))}
              </div>
            )}
          </div>

          <div className="lm-divider"><Sprockets count={40} /></div>

          <Shelf title="Trending now" movies={trending} onOpen={setActiveMovie} watchlist={watchlist} />
          {GENRES.map((g) => (
            <Shelf key={g} title={g} movies={movies.filter((m) => m.genre === g)} onOpen={setActiveMovie} watchlist={watchlist} />
          ))}
        </>
      )}

      {view === "browse" && (
        <>
          <div className="lm-page-head">
            <h1 className="lm-page-title">Browse</h1>
            <p className="lm-page-sub">{genreFilter ? `${browseResults.length} titles in ${genreFilter}` : `${movies.length} titles in the catalog`}</p>
          </div>
          <div className="lm-chip-row">
            <button className={`lm-chip ${!genreFilter ? "active" : ""}`} onClick={() => setGenreFilter(null)}>All</button>
            {GENRES.map((g) => (
              <button key={g} className={`lm-chip ${genreFilter === g ? "active" : ""}`} onClick={() => setGenreFilter(g)}>{g}</button>
            ))}
          </div>
          <div className="lm-grid">
            {browseResults.map((m) => (
              <MovieCard key={m.id} movie={m} onOpen={setActiveMovie} inList={watchlist.includes(m.id)} />
            ))}
          </div>
        </>
      )}

      {view === "search" && (
        <div className="lm-searchpage">
          <div className="lm-search-hero">
            <div className="lm-search-box">
              <Search size={16} color="#9391A0" />
              <input autoFocus placeholder="Search titles, genres, or cast" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          {query.trim() === "" ? (
            <p className="lm-empty">Start typing to search the catalog.</p>
          ) : searched.length === 0 ? (
            <p className="lm-empty">Nothing matches "{query}". Try a different title, genre, or actor.</p>
          ) : (
            <div className="lm-grid" style={{ padding: 0 }}>
              {searched.map((m) => (
                <MovieCard key={m.id} movie={m} onOpen={setActiveMovie} inList={watchlist.includes(m.id)} />
              ))}
            </div>
          )}
        </div>
      )}

      {view === "profile" && (
        <div className="lm-profile">
          <div className="lm-profile-head">
            <div className="lm-profile-avatar">{session.avatar}</div>
            <div>
              <h1 className="lm-page-title" style={{ marginBottom: 2 }}>{session.name}</h1>
              <p className="lm-page-sub">{session.email}</p>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "#9391A0", marginBottom: 8, fontWeight: 600 }}>Choose an avatar</p>
          <div className="lm-avatar-grid">
            {AVATARS.map((a) => (
              <button
                key={a}
                className={`lm-avatar-opt ${session.avatar === a ? "active" : ""}`}
                onClick={() => {
                  const updated = { ...session, avatar: a };
                  setSession(updated);
                  storage.set("lumen_session", JSON.stringify(updated), false).catch(() => {});
                  const list = users.map((u) => (u.email === session.email ? { ...u, avatar: a } : u));
                  persistUsers(list);
                }}
              >{a}</button>
            ))}
          </div>
          <h2 className="lm-shelf-title" style={{ marginBottom: 14 }}>My list</h2>
          {myListMovies.length === 0 ? (
            <p className="lm-empty" style={{ padding: "20px 0" }}>Nothing saved yet. Add titles from any movie's details.</p>
          ) : (
            <div className="lm-grid" style={{ padding: 0 }}>
              {myListMovies.map((m) => (
                <MovieCard key={m.id} movie={m} onOpen={setActiveMovie} inList />
              ))}
            </div>
          )}
        </div>
      )}

      {view === "dashboard" && (
        <div className="lm-dash">
          <div className="lm-dash-head">
            <div>
              <h1 className="lm-page-title" style={{ marginBottom: 2 }}>Manage content</h1>
              <p className="lm-page-sub">{movies.length} titles in the catalog</p>
            </div>
            <button className="lm-btn lm-btn-primary" onClick={() => { setEditingMovie(null); setShowForm(true); }}><Plus size={16} /> Add title</button>
          </div>
          <div className="lm-table-wrap">
            <table className="lm-table">
              <thead>
                <tr><th>Title</th><th>Genre</th><th>Year</th><th>Rating</th><th>Featured</th><th></th></tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m.id}>
                    <td>{m.title}</td>
                    <td>{m.genre}</td>
                    <td>{m.year}</td>
                    <td className="lm-mono">★ {m.rating}</td>
                    <td>{m.featured ? "Yes" : "—"}</td>
                    <td>
                      <div className="lm-table-actions">
                        <button className="lm-icon-action" onClick={() => { setEditingMovie(m); setShowForm(true); }} aria-label="Edit"><Pencil size={14} /></button>
                        <button className="lm-icon-action" onClick={() => deleteMovie(m.id)} aria-label="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="lm-modal-overlay" onClick={() => { setShowForm(false); setEditingMovie(null); }}>
          <div className="lm-auth-card" style={{ maxWidth: 460, maxHeight: "86vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h2 className="lm-page-title" style={{ fontSize: 22, marginBottom: 18 }}>{editingMovie ? "Edit title" : "Add title"}</h2>
            <form onSubmit={saveMovieForm}>
              <div className="lm-field"><label>Title</label><input name="title" defaultValue={editingMovie?.title} required /></div>
              <div className="lm-field"><label>Genre</label>
                <select name="genre" defaultValue={editingMovie?.genre || GENRES[0]}>
                  {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div className="lm-field" style={{ flex: 1 }}><label>Year</label><input name="year" type="number" defaultValue={editingMovie?.year || 2024} /></div>
                <div className="lm-field" style={{ flex: 1 }}><label>Duration</label><input name="duration" defaultValue={editingMovie?.duration} placeholder="1h 45m" /></div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div className="lm-field" style={{ flex: 1 }}><label>Rating</label><input name="rating" type="number" step="0.1" min="0" max="10" defaultValue={editingMovie?.rating || 7.5} /></div>
                <div className="lm-field" style={{ flex: 1 }}><label>Maturity</label>
                  <select name="maturity" defaultValue={editingMovie?.maturity || "PG-13"}>
                    {["G", "PG", "PG-13", "R"].map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="lm-field"><label>Synopsis</label><textarea name="synopsis" defaultValue={editingMovie?.synopsis} required /></div>
              <div className="lm-field"><label>Cast</label><input name="cast" defaultValue={editingMovie?.cast} placeholder="Comma-separated names" /></div>
              <div className="lm-field" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" name="featured" defaultChecked={editingMovie?.featured} style={{ width: "auto" }} id="featchk" />
                <label htmlFor="featchk" style={{ margin: 0 }}>Show in featured rotation</label>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="submit" className="lm-btn lm-btn-primary" style={{ flex: 1, justifyContent: "center" }}>{editingMovie ? "Save changes" : "Add title"}</button>
                <button type="button" className="lm-btn lm-btn-ghost" onClick={() => { setShowForm(false); setEditingMovie(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeMovie && !playing && (
        <div className="lm-modal-overlay" onClick={() => setActiveMovie(null)}>
          <div className="lm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lm-modal-hero" style={posterStyle(activeMovie.colorIdx)}>
              <div className="lm-modal-fade" />
              <button className="lm-modal-close" onClick={() => setActiveMovie(null)} aria-label="Close"><X size={16} /></button>
            </div>
            <div className="lm-modal-body">
              <h2 className="lm-modal-title">{activeMovie.title}</h2>
              <div className="lm-modal-meta">
                <TicketBadge tone="ember">{activeMovie.maturity}</TicketBadge>
                <span className="lm-mono">{activeMovie.year} · {activeMovie.duration} · ★ {activeMovie.rating}</span>
              </div>
              <p className="lm-modal-syn">{activeMovie.synopsis}</p>
              <p className="lm-modal-cast">Cast: {activeMovie.cast}</p>
              <div className="lm-modal-actions">
                <button className="lm-btn lm-btn-primary" onClick={() => setPlaying(activeMovie)}><Play size={16} /> Play</button>
                <button className="lm-btn lm-btn-ghost" onClick={() => toggleWatchlist(activeMovie)}>
                  {watchlist.includes(activeMovie.id) ? <><BookmarkCheck size={16} /> In my list</> : <><Bookmark size={16} /> Add to my list</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {playing && (
        <div className="lm-player">
          <div className="lm-player-top">
            <button className="lm-player-back" onClick={() => setPlaying(null)} aria-label="Back"><ChevronLeft size={18} /></button>
            <span className="lm-serif" style={{ fontStyle: "italic" }}>{playing.title}</span>
          </div>
          <video src={SAMPLE_VIDEO} controls autoPlay />
          <span className="lm-player-label">Demo playback — sample clip, not the full feature</span>
        </div>
      )}

      {toast && <div className="lm-toast">{toast}</div>}
    </div>
  );
}
