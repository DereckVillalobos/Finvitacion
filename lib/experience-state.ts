export const STATES = [
  'LOCKED',
  'OPENING',
  'TRANSITIONING',
  'OCEAN',
  'SHARK_DISCOVERED',
  'INVITATION',
  'COMPLETE',
] as const;
export type ExperienceState = (typeof STATES)[number];
export type Action = { type: 'NEXT'; to: ExperienceState } | { type: 'RESET' };
const allowed: Record<ExperienceState, ExperienceState[]> = {
  LOCKED: ['OPENING'],
  OPENING: ['TRANSITIONING'],
  TRANSITIONING: ['OCEAN'],
  OCEAN: ['SHARK_DISCOVERED'],
  SHARK_DISCOVERED: ['INVITATION'],
  INVITATION: ['COMPLETE'],
  COMPLETE: [],
};
export function experienceReducer(
  state: ExperienceState,
  action: Action,
): ExperienceState {
  if (action.type === 'RESET') return 'LOCKED';
  if (!allowed[state].includes(action.to)) return state;
  return action.to;
}
