---
name: grill-with-docs
description: Align on major SciSiam architectural decisions and update the existing project docs only when the decision changes durable project rules.
---
# Grill With Docs - Durable Decisions

Use for decisions that affect future agents: lab data architecture, deploy/package strategy, AI backend policy, score/progress storage, or design system changes.

## Workflow

1. Ask 1-3 focused questions to clarify the decision.
2. Check existing docs first: `AGENTS.md`, `DESIGN.md`, and relevant source files.
3. Update existing docs when the decision creates a durable rule.
4. Create a new `CONTEXT.md` only if the user explicitly wants a separate decision log.

## Do Not

- Do not create docs for one-off implementation details.
- Do not duplicate `AGENTS.md` or `DESIGN.md`.
- Do not turn every feature request into a documentation task.
