/** ponytail: stub — glimm shader optional; PromptBar still mounts without it. */

export const ACCENTS = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  cyan: '#06b6d4',
  blue: '#3b82f6',
  purple: '#a855f7',
} as const;

export function accentChain(colors: string[]): string[] {
  return colors;
}

type Shader = { destroy: () => void };

export function createShader(_opts: Record<string, unknown>): Shader {
  return { destroy() {} };
}

export function playSweep(
  _shader: Shader,
  _opts?: Record<string, unknown>,
): { cancel: () => void; done: Promise<void> } {
  return {
    cancel() {},
    done: Promise.resolve(),
  };
}
