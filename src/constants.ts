import { CampusEvent } from "./types";

export const UVA_LOCATIONS = {
  THE_LAWN: [38.0356, -78.5034] as [number, number],
  SCOTT_STADIUM: [38.0311, -78.5137] as [number, number],
  NEWCOMB_HALL: [38.0358, -78.5067] as [number, number],
  ROTUNDA: [38.0364, -78.5027] as [number, number],
  CLEMONS_LIBRARY: [38.0363, -78.5061] as [number, number],
  OHILL_DINING: [38.0348, -78.5148] as [number, number],
};

export const MOCK_EVENTS: CampusEvent[] = [
  {
    id: "1",
    title: "Hack to the Beat Kickoff",
    org: "HooHacks",
    description: "The ultimate coding marathon starts here. Grab your headphones and get in the zone.",
    locationName: "Newcomb Hall Ballroom",
    coordinates: UVA_LOCATIONS.NEWCOMB_HALL,
    startTime: "2026-02-21T21:00:00",
    attendees: 150,
    vibe: {
      trackId: "4cOdK2wG6ZIBnyG9U8vFpA",
      trackName: "Stay",
      artistName: "The Kid LAROI & Justin Bieber",
      albumArt: "https://picsum.photos/seed/music1/200/200",
      energy: 85,
    },
  },
  {
    id: "2",
    title: "Sunset Serenade",
    org: "University Singers",
    description: "A peaceful evening of choral music on the Lawn.",
    locationName: "The Lawn",
    coordinates: UVA_LOCATIONS.THE_LAWN,
    startTime: "2026-02-21T18:30:00",
    attendees: 300,
    vibe: {
      trackId: "37Z36v7ZpU1pZpU1pZpU1p",
      trackName: "Clair de Lune",
      artistName: "Claude Debussy",
      albumArt: "https://picsum.photos/seed/music2/200/200",
      energy: 20,
    },
  },
  {
    id: "3",
    title: "Game Day Hype",
    org: "UVA Athletics",
    description: "Pre-game rally before the big match.",
    locationName: "Scott Stadium",
    coordinates: UVA_LOCATIONS.SCOTT_STADIUM,
    startTime: "2026-02-22T12:00:00",
    attendees: 1200,
    vibe: {
      trackId: "27Z36v7ZpU1pZpU1pZpU1p",
      trackName: "Power",
      artistName: "Kanye West",
      albumArt: "https://picsum.photos/seed/music3/200/200",
      energy: 95,
    },
  },
];
