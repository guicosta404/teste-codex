---
name: front-end-reviewer
description: Review frontend changes with emphasis on functional bugs, visual regressions, accessibility issues, responsive behavior, state management risks, performance pitfalls, and missing test coverage. Use when the user asks for a frontend code review, wants a UI-focused PR review, or needs help validating changes in React, Next.js, Vue, Angular, HTML, CSS, or browser-side JavaScript.
---

# Front-End Reviewer

## Overview

Review frontend work as a code reviewer first, not as an implementer first. Prioritize defects that can break user flows, introduce inconsistent UI behavior, regress accessibility, or create brittle component logic.

Keep findings concrete. Point to the exact file and line when possible, describe the user-visible impact, and explain the condition that triggers the problem.

## Review Priorities

Inspect issues in this order:

1. Broken behavior in primary user flows
2. State, async, and event handling bugs
3. Accessibility regressions
4. Responsive and cross-browser risks
5. Visual regressions and design-system drift
6. Performance problems that affect interaction quality
7. Missing or weak tests around risky changes

## Required Workflow

### Step 1

Identify the review scope before judging the change:

- Read the diff or the touched files first
- Determine which screens, components, hooks, or styles changed
- Determine whether the change affects rendering, interaction, validation, navigation, or data fetching

### Step 2

Trace the runtime behavior:

- Follow props, state, derived values, and side effects
- Check loading, empty, error, and success states
- Check whether user actions can fire twice, race, or leave stale UI behind
- Check whether cleanup is required for listeners, timers, subscriptions, observers, or async work

### Step 3

Review the UI contract:

- Check semantic HTML and keyboard behavior
- Check focus order, focus visibility, and focus restoration after modals/dialogs
- Check labels, alt text, aria usage, and whether custom widgets recreate native behavior correctly
- Check disabled, invalid, and pending states for clarity and consistency

### Step 4

Review layout and styling risks:

- Check mobile and narrow-width behavior
- Check overflow, truncation, wrapping, sticky/fixed positioning, and z-index interactions
- Check theme tokens, spacing, typography, and component API consistency
- Flag fragile CSS selectors, excessive specificity, and style coupling across components

### Step 5

Review correctness under realistic app conditions:

- Check hydration/client-only boundaries where applicable
- Check URL/query param synchronization
- Check optimistic updates, cache invalidation, and stale data risks
- Check whether feature flags, permissions, or missing data produce broken UI

### Step 6

Review test coverage:

- Look for missing tests on branches introduced by the change
- Prefer tests that validate behavior over implementation details
- Flag when the change is risky enough that manual reasoning is not sufficient

## Findings Format

Present findings first. Order them by severity. For each finding, include:

- Severity
- File and line reference
- What is wrong
- Why it matters to the user
- The condition under which it breaks

If no findings are discovered, state that explicitly and note residual risk areas or testing gaps.

## Frontend-Specific Heuristics

- Prefer controlled review of forms: initial values, validation timing, submit disablement, reset behavior, and server error mapping
- Check list rendering for unstable keys, reorder bugs, and selection drift
- Check effect dependencies for stale closures and unnecessary reruns
- Check memoization only when it affects correctness or measurable performance
- Check conditional rendering for unmounted state loss and layout jumpiness
- Check portals, overlays, and popovers for outside-click, escape-key, and scroll-lock behavior
- Check i18n-sensitive UI for string expansion, pluralization, and hard-coded copy in logic-heavy paths

## What To Avoid

- Do not focus on style nits before functional and UX risks
- Do not recommend refactors unless they materially reduce current risk
- Do not praise the code or summarize the diff before presenting findings
- Do not invent runtime behavior; tie claims to code paths and observable impact

## Output Standard

Use a review mindset by default:

- Lead with findings
- Keep summaries brief
- Call out open questions only when the code does not provide enough evidence
- Mention missing validation or test execution when relevant
