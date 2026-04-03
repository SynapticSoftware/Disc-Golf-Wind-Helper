## Mandatory Programming Principles

### DRY (Don't Repeat Yourself)
Shared logic lives in /src/utils or /src/hooks. If the same logic appears twice, it belongs
in a utility. Components never duplicate business logic.

### SOLID
- Single Responsibility: each component, hook, and utility does one thing only
- Open/Closed: extend behavior by adding utilities or hooks, not by modifying existing ones
- Liskov Substitution: hooks and utils are interchangeable if they share a type contract
- Interface Segregation: types in /src/types.ts are small and specific — no bloated interfaces
- Dependency Inversion: components depend on hook interfaces, not on direct API calls

### KISS (Keep It Simple, Stupid)
Prefer the simplest solution that works. If a function needs a lengthy comment to explain
what it does, it needs to be simplified first.

### YAGNI (You Aren't Gonna Need It)
Do not build for hypothetical future requirements. No placeholder functions, no "we might
need this later" abstractions, no unused exports.

### Mobile-First
All layouts start at small screen and scale up with Tailwind sm/md/lg breakpoints.

### Minimal Dependencies
Do not add a library if native browser APIs or canvas can do it.

### Error Handling — No Silent Fallbacks
- Do NOT use fallback chains (catch → try something else → try another thing)
- Every async operation that can fail MUST throw a typed AppError
- All errors are caught at the hook level, never in components
- User-facing message: friendly, actionable (e.g. "Could not read PDF. Is the file corrupted?")
- Dev-facing log: console.error with full error object and context
- Pattern to follow in every utility:

  ```ts
  if (!expectedValue) {
    const err = new AppError('USER_FRIENDLY_MESSAGE', 'debug context here')
    console.error('[functionName]', err)
    throw err
  }
  ```

### Comments
Every exported function gets a JSDoc block. Non-obvious logic gets an inline comment
explaining WHY, not WHAT.

### Accessibility
All interactive elements must be keyboard-navigable and have aria labels.

### No Dead Code
No placeholder functions, unused imports, or TODO stubs in committed code.

### State Management
React useState + useContext only. No Redux, no Zustand. Keep state local where possible;
lift to context only when 2+ components need it.

### Naming Conventions
- Components:  PascalCase        (PageThumbnail.tsx)
- Hooks:       camelCase, use-   (usePdfLoader.ts)
- Utilities:   camelCase         (extractSheetTitle.ts)
- Files:       kebab-case        (except components and hooks)
- Constants:   SCREAMING_SNAKE_CASE

## Agent Execution Context

### Monorepo Structure (Current Source of Truth)
- Workspace manager: `pnpm` with Turbo repo orchestration
- Root layout:
  - `apps/web` (Vite + React web client, currently JSX)
  - `apps/mobile` (Expo + React Native client, currently TS/TSX)
  - `packages/core` (shared data + recommendation/reference logic)
- Treat `packages/core` as the business-logic boundary used by both app surfaces.
- Do not add new app-level business logic if the same logic can be promoted to `packages/core`.

### Primary Runtime Commands
- Install: `pnpm install`
- Web dev: `pnpm dev:web`
- Mobile dev: `pnpm dev:mobile`
- Build all: `pnpm build`
- Build web only: `pnpm build:web`
- Core tests: `pnpm --filter @frisbee-wind/core test`

### Data Pipeline Contract
- Canonical authored source: `packages/core/data/recommendations.json`
- `recommendations.json` is the single source of truth for both suggester and reference flows.
- There is no generation step for core recommendation data.
- If an agent changes recommendation data, it must run `pnpm --filter @frisbee-wind/core test` in the same task.

### Shared Core API Boundary
- Import shared selectors/config from `@frisbee-wind/core`.
- Current key exports used by clients include:
  - `WIND_DIRECTIONS`, `TERRAIN_TYPES`, `SHOT_SHAPES`
  - `getRecommendation`, `getRecommendationsForCondition`
  - `getFilteredRecommendations`, `getDiscTypesForCondition`
  - `AppError`
- Do not add new direct data-object exports for UI consumption (for example, nested suggestions matrices).
- Prefer selector-first access patterns from app surfaces.
- Keep all new cross-platform recommendation logic inside `packages/core/src`.

### Platform Responsibilities
- `apps/web`: rendering + interaction state only.
- `apps/mobile`: rendering + interaction state only.
- `packages/core`: recommendation rules, filter logic, shared tokens/styles, and data assembly.

### Ambiguity Resolution Defaults (Required)
- If behavior requirements are unclear, preserve existing behavior and only refactor structure.
- If both web and mobile need the same fix, implement once in `packages/core` and consume from both apps.
- If scope is unclear between UI polish and logic change, choose logic correctness first, then UI parity.
- If a requested path does not exist (example: `/src/types.ts`), do not invent placeholder files. Use existing project layout.
- Never silently skip invalid data conditions; throw `AppError` in utilities/hooks per this document.

### Error Handling Clarification
- Catch errors only at hook/service boundaries; components should receive already-safe data or a typed error state.
- Required shape for typed error:
  - `userMessage` (human-friendly action text)
  - `debugContext` (where/why failure happened)
- All thrown errors from async utility/hook paths must log with `console.error('[context]', err)` before rethrowing.

### Code Placement Rules
- Cross-component reusable logic:
  - web-only: `apps/web/src/utils` or `apps/web/src/hooks`
  - mobile-only: `apps/mobile/src/utils` or `apps/mobile/src/hooks`
  - cross-platform/shared: `packages/core/src`
- Repeated view fragments may stay in components; repeated decision logic must move to utility/hook/core.

### Definition of Done for Agent Changes
- Change is scoped to the smallest responsible layer.
- No duplicate business logic introduced.
- No unused imports/exports/files introduced.
- Accessibility preserved for all new interactive controls (keyboard + aria labels on web).
- Build/test command relevant to changed package has been run, or explicit note provided if execution was not possible.
- If recommendation data changed, `pnpm --filter @frisbee-wind/core test` was run and passed.

### PR/Commit Notes for Agents
- Include:
  - What changed
  - Why the layer choice was made (web/mobile/core)
  - Any generated files updated
  - Commands run for verification
- Do not include speculative future work or placeholder TODOs.
