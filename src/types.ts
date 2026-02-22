export interface Vibe {
  trackId: string;
  trackName: string;
  artistName: string;
  albumArt: string;
  energy: number;
}

export interface CampusEvent {
  id: string;
  title: string;
  org: string;
  description: string;
  locationName: string;
  coordinates: [number, number];
  startTime: string;
  vibe: Vibe;
  attendees: number;
}

export interface UserSession {
  accessToken?: string;
  displayName?: string;
  profileImage?: string;
}
