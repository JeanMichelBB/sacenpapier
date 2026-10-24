# Phase 2 — Security + Privacy Cross-Critique

Reviewing as security/privacy (own Phase 1: `01-security.md`). Read all eight `01-*.md` reports.

## Agree

- **Hiring-manager F1/F2/F3** reinforce my S1/notes: missing security headers, the unaddressed critical `npm audit` vuln, and the `next start`/`output: standalone` mismatch are exactly the kind of self-inflicted ops gaps that undercut the operational-rigor story the content is trying to tell — F1 independently arrives at the same header gap as S1 from a pure "would a hiring manager `curl -I` this" angle.
- **A11y A1/A6 + Recruiter R6 + Content-editor C1** all independently document that FR is cosmetic/client-only (lang never varies server-side, `CookieBanner` hardcoded English). This corroborates S9: a banner that can't even honor the site's own language toggle is further evidence it's low-value theater, not a considered consent mechanism — strengthens the case to just remove it rather than fix it.
- **Architecture A1 / Content-editor C8 / Hiring-manager F7** on the duplicate `" 2"` files: agree these should go, and I'd add the security angle they missed — any stray editor-artifact file is also a place secrets could accidentally be duplicated and committed; worth a quick diff-for-secrets pass before deleting, not just deleting.

## Disagree

The hiring-manager's F9 and "top 5" list treat `src/data/homelab.ts`'s depth (SPOFs, exact remote-access topology, no-staging CI/CD path) as unambiguously a strength, and F9 explicitly recommends *adding a consolidated topology diagram* to tie it together. I disagree with implementing F9 as written — it's the wrong fix for the right instinct. A single diagram turns scattered prose (which a recon-minded reader has to manually assemble) into a ready-made attack-surface map: nodes, trust boundaries, and SPOFs in one glance. That's a net new exposure, not a presentation improvement.

The line I'd draw: **keep** anything that is retrospective and demonstrates skill — root-cause chains, the exact commands used to verify a fix (`kubectl auth can-i`), metrics, links to upstream bug trackers, "what I learned." **Redact or generalize** anything that is a live, current-state blueprint an attacker would want: exact SPOF enumeration framed as SPOFs ("the Mac's SSH config is the map of who can reach whom"), the explicit "no staging step in between" admission, and — especially — any single diagram or table that aggregates topology across entries. Content should read as "here's a problem I solved and how," never as "here's the current shape of my network." Fixing S7 and implementing F9 are incompatible; I'd prioritize S7's redaction over F9's diagram.

## Missed

Nobody examined whether the "rotate-pod control" on the live `/infrastructure` dashboard (cited approvingly by the hiring manager as evidence of real operation, "which node is currently serving traffic, a rotate-pod control") is authenticated. If that control calls a real mutating API against the homelab and is reachable by any anonymous visitor, it's a public, unauthenticated write action against live infrastructure — a materially worse issue than the read-only rate-limiting gap I flagged in S4 (DoS/abuse via a state-changing control, not just load amplification). This needs verifying against the actual route handler before shipping that dashboard as a public-facing feature; if unauthenticated, gate it immediately.
