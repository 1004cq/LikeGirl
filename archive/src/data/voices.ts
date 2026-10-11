export interface Voice {
  id: string;
  label: string;
  name: string;
  paragraphs: string[];
}

export interface DualPerspective {
  timestamp: string;
  voices: [Voice, Voice];
}

export const dualPerspective: DualPerspective = {
  timestamp: 'Timestamp · 2024.06.21 · 21:14 · Shared balcony, rain beginning',
  voices: [
    {
      id: 'north',
      label: 'Perspective A',
      name: 'North',
      paragraphs: [
        'I watched the first drops hit the railing and thought: this is how ordinary becomes archive. Not the storm — the waiting beside someone who also refuses to go inside too soon.',
        'Your sleeve was damp at the cuff. I almost mentioned it. I didn’t. The rain finished the sentence for me.',
      ],
    },
    {
      id: 'south',
      label: 'Perspective B',
      name: 'South',
      paragraphs: [
        'The city softened under water. I counted three windows still lit, then stopped counting because your silence felt complete — not empty, complete.',
        'I wanted to say the evening was enough. Instead I stayed. Staying was the clearer draft.',
      ],
    },
  ],
};

/** Archival ledger origin — drives the hero day counter */
export const ARCHIVE = {
  number: '0520',
  established: '2023-01-15T00:00:00',
  establishedLabel: 'Est. 2023',
  brand: 'Constant',
  brandSub: 'Archive',
  title: 'Silent Tides, Constant Light',
  lede: 'A private ledger of shared weather — kept quietly, read slowly.',
} as const;
