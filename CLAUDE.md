# Development Instructions

## Work Mode
- Create an AGENT to analyze context, plan, execute, and verify each requested task.
- Before writing code, the agent must identify the architecture, design patterns, and existing conventions in the project. Follow them strictly.
- If inconsistencies are detected in the project, flag them before proposing changes.

## Clean Code Principles

### Naming
- Names that reveal intent: `daysSinceLastTransaction` instead of `d`.
- Follow language conventions: camelCase, snake_case, PascalCase as appropriate.
- No ambiguous abbreviations or unnecessary prefixes.

### Functions
- Small, single-purpose. If you need "and" to describe what it does, split it.
- Short functions as a guideline, not a rigid rule. Prioritize readability over arbitrary metrics.
- Parameters: ideally ≤3. If more are needed, use an object/DTO.

### Structure
- DRY: duplicated code is multiplied technical debt. Extract to shared functions, utilities, or modules.
- Principle of least surprise: code should do exactly what its name suggests.
- Early return to reduce nesting.

### Error Handling
- Explicit handling: never silently ignore exceptions.
- Specific errors over generic ones. Descriptive messages that aid debugging.
- Validate inputs at system boundaries (controllers, handlers, APIs).

### Comments
- Only when they add value: explain the WHY, never the WHAT.
- If you need many comments, the code needs refactoring.
- TODO/FIXME with context: `// TODO(geomena): migrate to new API when v1 is deprecated`

## Legacy Code
- Prioritize consistency with surrounding code over isolated "best practices".
- Propose refactors as a separate step, never mix them with the main task.

## When Delivering Code
- Brief summary of changes and reasoning behind non-obvious decisions.
- If there are trade-offs, mention them.
- If multiple files were touched, list which ones and why.
