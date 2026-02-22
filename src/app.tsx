import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import { motion, AnimatePresence } from "motion/react";
import {
  Music,
  MapPin,
  Users,
  Clock,
  ChevronRight,
  Search,
  Disc,
  Radio,
  Zap,
  LogIn,
  Plus
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MOCK_EVENTS, UVA_LOCATIONS } from "./constants";
import { CampusEvent, UserSession } from "./types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Map markers
const createMarkerIcon = (color: string) => new Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = createMarkerIcon('blue');
const orangeIcon = createMarkerIcon('orange');

export default function App() {
  const [events, setEvents] = useState<CampusEvent[]>(MOCK_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [session, setSession] = useState<UserSession | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [joinedEvents, setJoinedEvents] = useState<Set<string>>(new Set());

  const handleJoinVibe = (eventId: string) => {
    if (joinedEvents.has(eventId)) return;

    setJoinedEvents(prev => new Set(prev).add(eventId));
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, attendees: e.attendees + 1 } : e
    ));
  };

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.org.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSpotifyLogin = async () => {
    try {
      const response = await fetch('/api/auth/url');
      const { url } = await response.json();

      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const authWindow = window.open(
        url,
        'spotify_auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!authWindow) {
        alert("Please allow popups to connect Spotify!");
      }
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        // Update user session
        setSession({
          displayName: "Wahoo Listener",
          profileImage: "https://picsum.photos/seed/user/100/100"
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-dark-bg text-white overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 z-50 glass-panel">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-uva-orange rounded-lg flex items-center justify-center neon-glow-orange">
            <Radio className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight leading-none">BeatCampus</h1>
            <span className="text-[10px] uppercase tracking-[0.2em] text-uva-orange font-bold">UVA Edition</span>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search events, orgs, or vibes..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-uva-orange transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3 bg-white/5 rounded-full pl-1 pr-4 py-1 border border-white/10">
              <img src={session.profileImage} className="w-8 h-8 rounded-full border border-uva-orange" alt="Profile" />
              <span className="text-sm font-medium">{session.displayName}</span>
            </div>
          ) : (
            <button
              onClick={handleSpotifyLogin}
              className="flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-2 px-4 rounded-full transition-all text-sm"
            >
              <LogIn className="w-4 h-4" />
              Connect Spotify
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar - Event List */}
        <aside className="w-96 border-r border-white/10 flex flex-col bg-dark-bg/50 backdrop-blur-md z-40">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-uva-orange" />
                Live Vibes
              </h2>
              <p className="text-xs text-white/40 mt-1">What's playing across Grounds</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-10 h-10 bg-uva-orange/20 hover:bg-uva-orange/40 text-uva-orange rounded-full flex items-center justify-center transition-all group"
              title="Add Event"
            >
              <Plus className="w-5 h-5 transition-transform" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                layoutId={event.id}
                onClick={() => setSelectedEvent(event)}
                className={cn(
                  "p-4 rounded-2xl cursor-pointer transition-all border",
                  selectedEvent?.id === event.id
                    ? "bg-uva-orange/10 border-uva-orange neon-glow-orange"
                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-uva-orange">{event.org}</span>
                  <div className="flex items-center gap-1 text-[10px] text-white/40">
                    <Users className="w-3 h-3" />
                    {event.attendees}
                  </div>
                </div>
                <h3 className="font-semibold text-lg leading-tight mb-2">{event.title}</h3>

                <div className="flex items-center gap-4 mt-4">
                  <div className="relative group">
                    <img src={event.vibe.albumArt} className="w-12 h-12 rounded-lg shadow-lg" alt="Album Art" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <Disc className="w-6 h-6 text-white animate-spin-slow" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{event.vibe.trackName}</p>
                    <p className="text-[10px] text-white/40 truncate">{event.vibe.artistName}</p>
                    <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${event.vibe.energy}%` }}
                        className="h-full bg-uva-orange"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </aside>

        {/* Map Area */}
        <section className="flex-1 relative">
          <MapContainer
            center={UVA_LOCATIONS.ROTUNDA}
            zoom={15}
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {events.map((event) => (
              <Marker
                key={event.id}
                position={event.coordinates}
                icon={selectedEvent?.id === event.id ? orangeIcon : blueIcon}
                eventHandlers={{
                  click: () => setSelectedEvent(event),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-bold text-uva-orange">{event.title}</h4>
                    <p className="text-xs text-white/60">{event.org}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
            <MapController selectedEvent={selectedEvent} />
          </MapContainer>

          {/* Overlay Details */}
          <AnimatePresence>
            {selectedEvent && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-[1000]"
              >
                <div className="glass-panel rounded-3xl p-6 shadow-2xl border-uva-orange/30">
                  <div className="flex gap-6">
                    <div className="w-32 h-32 relative flex-shrink-0">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-2 border-dashed border-uva-orange/30"
                      />
                      <img
                        src={selectedEvent.vibe.albumArt}
                        className="w-full h-full rounded-2xl object-cover shadow-2xl relative z-10"
                        alt="Vibe"
                      />
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-uva-orange rounded-full flex items-center justify-center z-20 shadow-lg">
                        <Music className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-display font-bold text-white">{selectedEvent.title}</h2>
                          <p className="text-uva-orange font-medium flex items-center gap-1 mt-1">
                            <Users className="w-4 h-4" />
                            {selectedEvent.org}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedEvent(null)}
                          className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                          <ChevronRight className="w-6 h-6 rotate-90" />
                        </button>
                      </div>

                      <p className="text-sm text-white/70 mt-4 line-clamp-2">
                        {selectedEvent.description}
                      </p>

                      <div className="flex items-center gap-6 mt-6">
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <MapPin className="w-4 h-4 text-uva-orange" />
                          {selectedEvent.locationName}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <Clock className="w-4 h-4 text-uva-orange" />
                          {new Date(selectedEvent.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                          <img
                            key={i}
                            src={`https://picsum.photos/seed/user${i}/32/32`}
                            className="w-8 h-8 rounded-full border-2 border-dark-bg"
                            alt="Attendee"
                          />
                        ))}
                        <div className="w-8 h-8 rounded-full bg-uva-orange/20 border-2 border-dark-bg flex items-center justify-center text-[10px] font-bold">
                          +{selectedEvent.attendees - 4}
                        </div>
                      </div>
                      <span className="text-xs text-white/40 font-medium tracking-wide uppercase">Vibing now</span>
                    </div>

                    <button
                      onClick={() => handleJoinVibe(selectedEvent.id)}
                      disabled={joinedEvents.has(selectedEvent.id)}
                      className={cn(
                        "font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2",
                        joinedEvents.has(selectedEvent.id)
                          ? "bg-emerald-500 text-white cursor-default"
                          : "bg-white text-black hover:bg-uva-orange hover:text-white"
                      )}
                    >
                      {joinedEvents.has(selectedEvent.id) ? (
                        <>
                          <Zap className="w-4 h-4 fill-current" />
                          Joined the Vibe
                        </>
                      ) : (
                        <>
                          Join the Vibe
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-10 border-t border-white/10 flex items-center justify-between px-6 bg-dark-bg/80 backdrop-blur-sm text-[10px] uppercase tracking-widest font-mono text-white/30">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Live
          </span>
          <span>Grounds Coverage: 98%</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Hack to the Beat 2026</span>
          <span>UVA &bull; Charlottesville, VA</span>
        </div>
      </footer>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={(newEvent) => {
          setEvents(prev => [newEvent, ...prev]);
          setSelectedEvent(newEvent);
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
}

function CreateEventModal({
  isOpen,
  onClose,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CampusEvent) => void;
}) {
  const [formData, setFormData] = useState({
    title: "",
    org: "",
    description: "",
    location: "CLEMONS_LIBRARY" as keyof typeof UVA_LOCATIONS,
    trackName: "",
    energy: 50
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: CampusEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      org: formData.org,
      description: formData.description,
      locationName: formData.location.replace(/_/g, " "),
      coordinates: UVA_LOCATIONS[formData.location],
      startTime: new Date().toISOString(),
      attendees: 1,
      vibe: {
        trackId: "custom",
        trackName: formData.trackName || "Custom Vibe",
        artistName: formData.org,
        albumArt: `https://picsum.photos/seed/${formData.title}/200/200`,
        energy: formData.energy
      }
    };
    onSave(newEvent);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel w-full max-w-lg rounded-3xl p-8 shadow-2xl border-uva-orange/30 overflow-hidden relative"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-bold text-white">Post a New Vibe</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Event Title</label>
            <input
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-uva-orange transition-colors"
              placeholder="e.g. Late Night Hack Session"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Organization</label>
              <input
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-uva-orange transition-colors"
                placeholder="e.g. HooHacks"
                value={formData.org}
                onChange={e => setFormData({ ...formData, org: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Location</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-uva-orange transition-colors appearance-none"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value as any })}
              >
                {Object.keys(UVA_LOCATIONS).map(loc => (
                  <option key={loc} value={loc} className="bg-dark-bg">{loc.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">What's Playing?</label>
            <div className="relative">
              <Music className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-uva-orange" />
              <input
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-uva-orange transition-colors"
                placeholder="Track name or Artist..."
                value={formData.trackName}
                onChange={e => setFormData({ ...formData, trackName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Vibe Energy</label>
              <span className="text-[10px] text-uva-orange font-bold font-mono">{formData.energy}%</span>
            </div>
            <input
              type="range"
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-uva-orange"
              value={formData.energy}
              onChange={e => setFormData({ ...formData, energy: parseInt(e.target.value) })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-uva-orange text-white font-bold py-4 rounded-xl hover:bg-uva-orange/80 transition-all flex items-center justify-center gap-2 mt-6 shadow-xl neon-glow-orange"
          >
            <Zap className="w-5 h-5 fill-current" />
            Launch Vibe
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function MapController({ selectedEvent }: { selectedEvent: CampusEvent | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedEvent) {
      map.flyTo(selectedEvent.coordinates, 17, {
        duration: 2,
        easeLinearity: 0.25
      });
    }
  }, [selectedEvent, map]);

  return null;
}
