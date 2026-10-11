export interface ChapterExif {
  focal: string;
  aperture: string;
  timestamp: string;
  geo: string;
}

export interface Chapter {
  id: string;
  label: string;
  title: string;
  body: string;
  pull: string;
  image: string;
  alt: string;
  reverse: boolean;
  exif: ChapterExif;
}

export const chapters: Chapter[] = [
  {
    id: '01',
    label: 'Chapter 01 — First Light',
    title: 'The morning we stopped measuring distance',
    body: 'Mist held the ridge like a held breath. We walked without itinerary, counting nothing but the sound of gravel underfoot. Somewhere between the second bend and the first coffee, the map became optional.',
    pull: '“Not arrival — only weather we agreed to share.”',
    image: '/images/chapter-01.jpg',
    alt: 'Alpine ridgeline under soft morning haze',
    reverse: false,
    exif: {
      focal: '35mm',
      aperture: 'f/2.8',
      timestamp: '2023.03.14 · 07:42',
      geo: '46.5197° N, 6.6323° E',
    },
  },
  {
    id: '02',
    label: 'Chapter 02 — Canopy',
    title: 'Green silence, spoken softly',
    body: 'The forest edited our sentences. What remained were short clauses and longer looks — a grammar of shade. We learned that presence can be quieter than any vow written for an audience.',
    pull: '“The trees kept time; we only listened.”',
    image: '/images/chapter-02.jpg',
    alt: 'Sunlit forest path with tall trunks',
    reverse: true,
    exif: {
      focal: '50mm',
      aperture: 'f/1.8',
      timestamp: '2023.08.02 · 16:18',
      geo: '47.6062° N, 122.3321° W',
    },
  },
  {
    id: '03',
    label: 'Chapter 03 — Horizon Line',
    title: 'A year folded into one ridge',
    body: 'On the overlook, the valley opened like a page turned too carefully. We named nothing. The light did the indexing — gold into charcoal, then charcoal into the long blue of evening.',
    pull: '“Constancy is not stillness; it is return.”',
    image: '/images/chapter-03.jpg',
    alt: 'Sun breaking over a mountain valley',
    reverse: false,
    exif: {
      focal: '28mm',
      aperture: 'f/8',
      timestamp: '2024.01.19 · 06:05',
      geo: '36.1069° N, 112.1129° W',
    },
  },
  {
    id: '04',
    label: 'Chapter 04 — Late Weather',
    title: 'Dusk as a mutual language',
    body: 'Fog erased the far shore and left us the near one. We stood until the cold asked us indoors. Later, the photograph would remember what we could not — the precise silver of that hour.',
    pull: '“We keep what the light keeps.”',
    image: '/images/chapter-04.jpg',
    alt: 'Misty hills at dusk in cool monochrome light',
    reverse: true,
    exif: {
      focal: '85mm',
      aperture: 'f/4',
      timestamp: '2025.11.03 · 17:51',
      geo: '55.9533° N, 3.1883° W',
    },
  },
];
