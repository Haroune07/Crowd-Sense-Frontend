// The 4 heat levels. `value` is the dangerLevel sent to the backend (1 to 4).
export const LEVELS = [
  { value: 1, id: 'calm', label: 'Calm', color: '#3FB68B', text: '#1E7A5A', soft: '#E9F7F1' },
  { value: 2, id: 'tense', label: 'Tense', color: '#F5C542', text: '#8A6400', soft: '#FEF7E0' },
  { value: 3, id: 'heated', label: 'Heated', color: '#F2884B', text: '#B4531A', soft: '#FDEFE6' },
  { value: 4, id: 'danger', label: 'Danger', color: '#E5484D', text: '#C4252B', soft: '#FDECEC' },
];

export function levelOf(value) {
  return LEVELS.find((l) => l.value === value) || LEVELS[0];
}

// Announcement importance
export const SEVERITIES = {
  info: { label: 'Info', text: '#475569', soft: '#EEF2F6' },
  warning: { label: 'Warning', text: '#B4531A', soft: '#FDEFE6' },
  urgent: { label: 'Urgent', text: '#C4252B', soft: '#FDECEC' },
};
