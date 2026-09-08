import { render, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, it, expect, vi } from 'vitest';
import WebTools from '../src/features/WebTools';
import '../src/i18n';
type Tool = {
  name: string;
  execute: (v: unknown) => unknown;
  inputSchema: object;
};
afterEach(() => {
  cleanup();
  Reflect.deleteProperty(document, 'modelContext');
  vi.unstubAllGlobals();
});
it('registers game tools, rejects unknown games and uses the visible router (emulated provider)', async () => {
  const tools: Tool[] = [];
  const signals: AbortSignal[] = [];
  Reflect.set(document, 'modelContext', {
    registerTool: (tool: Tool, opts: { signal: AbortSignal }) => {
      tools.push(tool);
      signals.push(opts.signal);
    },
  });
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
  let path = '';
  function Location() {
    path = useLocation().pathname;
    return null;
  }
  const result = render(
    <MemoryRouter>
      <WebTools />
      <Location />
    </MemoryRouter>,
  );
  expect(tools.map((t) => t.name)).toEqual([
    'list_bobby_games',
    'open_bobby_game',
  ]);
  expect(tools[0].execute({})).toHaveLength(4);
  await expect(tools[1].execute({ gameId: 'missing' })).rejects.toThrow(
    'Unknown game',
  );
  await tools[1].execute({ gameId: 'mango-catch' });
  await waitFor(() => expect(path).toBe('/play/mango-catch'));
  result.unmount();
  expect(signals.every((s) => s.aborted)).toBe(true);
});
