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
