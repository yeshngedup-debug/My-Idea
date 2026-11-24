# Agent coordination bus

All redesign agents share this directory. It is the single place where findings
are exchanged, so one agent's result becomes another agent's input.

## Rules

1. When you finish, write your full report to `reports/<your-name>.md` in
   addition to replying in your session. Keep the same structure and evidence.
2. Before finalizing, read every existing `reports/*.md` file. If a finding
   overlaps another agent's, do not duplicate it: reference the owning report
   and add only the new evidence you have.
3. Critics (read-only) write reports only; they never edit product source.
4. Fixers read the critic reports first, then edit source, then update their
   own report with what they changed and why.
5. The orchestrator (`reports/orchestrator.md`) reads all reports, ranks work
   by severity, assigns fixes, and runs the verification gates.
6. Never overwrite another agent's report file. Append a dated section if you
   need to revise your own.

## Expected reports

- `visual-critic.md` — rendered visual design findings
- `copy-critic.md` — typography and copy findings
- `accessibility-critic.md` — WCAG/motion findings
- `icon-fix.md` — icon and navy-leftover fixes
- `performance-seo.md` — performance and SEO audit
- `content-integrity.md` — lost facts, prices, links, legal text
- `brand-mark.md` — brand mark rollout (already delivered in chat; write it here)
- `orchestrator.md` — final integrated plan and verification evidence
