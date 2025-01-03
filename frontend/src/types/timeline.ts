export type Track =
  | {
      id: string;
      type: 'video' | 'audio' | 'image' | 'text';
      start: number;
      end: number;
      name: string;
      lane: number;
    }
  | { src: string; text?: never }
  | { text: string; src?: never };
