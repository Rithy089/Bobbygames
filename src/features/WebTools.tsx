import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { games, isGameId } from '../lib/catalog';
type Tool = {
  name: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
};
type ModelDocument = Document & {
  modelContext?: {
    registerTool: (
      tool: Tool,
      options: { signal: AbortSignal },
    ) => void | Promise<void>;
  };
};
export default function WebTools() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  useEffect(() => {
    const context = (document as ModelDocument).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const list: Tool = {
      name: 'list_bobby_games',
      description: 'List the original playable games and their controls.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: () =>
        games.map((g) => ({
          id: g.id,
          title: t(g.id + '.title'),
          controls: t(g.id + '.instructions'),
        })),
    };
    const open: Tool = {
      name: 'open_bobby_game',
      description:
        'Open a game’s instructions and start screen. The player chooses when to begin.',
      inputSchema: {
        type: 'object',
        properties: {
          gameId: { type: 'string', enum: games.map((g) => g.id) },
        },
        required: ['gameId'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: async (input) => {
        if (
          !input ||
          typeof input !== 'object' ||
          !('gameId' in input) ||
          !isGameId(input.gameId)
        )
          throw Error('Unknown game');
        const path = '/play/' + input.gameId;
        navigate(path);
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        return { route: path, status: 'start_screen' };
      },
    };
    for (const tool of [list, open]) {
      try {
        void Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {
        /* Optional browser capability. */
      }
    }
    return () => lifecycle.abort();
  }, [navigate, t]);
  return null;
}
