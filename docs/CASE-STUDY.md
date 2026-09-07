# BobbyGames — portfolio case study

## Problem and approach
Build an immediately playable browser arcade with a Cambodian identity, without copying another portal or proprietary games. BobbyGames connects three short experiences to Cambodia through fruit-market/countryside imagery, Khmer-inspired fantasy stonework and a Phnom Penh-inspired street.

## Design
A midnight navy interface, warm mango-gold controls, original low-poly covers and restrained textile geometry support discovery. Mobile layouts preserve large controls and keep guest play available. A light theme uses the same semantic colors. Khmer text uses Noto Sans Khmer with editable resources and an explicit review note.

## Engineering
React, TypeScript, Vite and React Router provide the portal. Each native Canvas scene is separately imported, with a shared pause/input/audio/cleanup contract. Zustand stores device progress and preferences. Optional Supabase Auth and TanStack Query connect account data and rankings. Database functions own session creation, score checks and achievement awards; RLS prevents cross-player writes.

## Tradeoffs
Native Canvas provides a small engine footprint for these simple 2D games. Account services remain optional and require external project configuration. Global score checks reject impossible claims but cannot establish fair play against a modified client. Generated avatars avoid user-upload security/moderation scope. Guest data remains local and cannot be promoted into a global score.

## Validation
Unit tests exercise scoring/progression/game-over and cleanup. React component tests cover favorites and guest access. PostgreSQL tests execute permissions and RPC paths. Desktop/mobile Playwright tests exercise real gameplay controls, persistence, navigation, language and themes. Exact final counts are recorded in VERIFICATION.md, without presenting mocked auth as a live integration.

## Attribution
Created by Say Rithy (Bobby), Junior–Mid Web Developer, Phnom Penh, Cambodia. Focus: full-stack web development. No claims of professional employment history or third-party technology ownership are implied. Portfolio: https://sayrithy-portfolio.vercel.app/

