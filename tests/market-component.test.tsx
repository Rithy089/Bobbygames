import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { afterEach, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '../src/i18n';
import MarketMatch from '../src/games/khmer-market-match/MarketMatch';
const audio = vi.hoisted(() => ({
  activate: vi.fn(),
  sync: vi.fn(),
  effect: vi.fn(),
  destroy: vi.fn(),
  finish: vi.fn(),
}));
vi.mock('../src/games/shared/audio', () => ({ createAudio: () => audio }));
vi.mock('../src/games/shared/sprites', () => ({
  loadSprites: () => Promise.resolve(),
}));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});
it('keeps hidden answers out of the accessible DOM, waits for a gesture, and cleans timers/audio/listeners', async () => {
  const interval = vi.spyOn(window, 'setInterval'),
    clear = vi.spyOn(window, 'clearInterval'),
    remove = vi.spyOn(document, 'removeEventListener');
  const view = render(
    <MemoryRouter>
      <MarketMatch />
    </MemoryRouter>,
  );
  const start = screen.getByRole('button', { name: 'Let’s play' });
  await waitFor(() => expect(start).toBeEnabled());
  expect(audio.activate).not.toHaveBeenCalled();
  expect(audio.effect).not.toHaveBeenCalled();
  expect(view.container.querySelector('.match-board img')).toBeNull();
  expect(
    screen.getByRole('button', { name: 'Card 1, face down' }),
  ).toHaveAttribute('aria-disabled', 'true');
  fireEvent.click(start);
  expect(audio.activate).toHaveBeenCalledOnce();
  const card = screen.getByRole('button', { name: 'Card 1, face down' });
  fireEvent.click(card);
  expect(view.container.querySelectorAll('.match-board img')).toHaveLength(1);
  const timer = interval.mock.results.at(-1)?.value;
  view.unmount();
  expect(clear).toHaveBeenCalledWith(timer);
  expect(audio.destroy).toHaveBeenCalledOnce();
  expect(remove.mock.calls.some((c) => c[0] === 'visibilitychange')).toBe(true);
});
