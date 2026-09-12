export type WorldClock = { time: number; reveal: number; speed: number };
export type OceanProps = {
  discovered: boolean;
  reduced: boolean;
  onDiscover: () => void;
  onReady: () => void;
};
