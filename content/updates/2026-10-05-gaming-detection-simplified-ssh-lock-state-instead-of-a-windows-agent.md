---
title: Gaming Detection, Simplified: SSH Lock-State Instead of a Windows Agent
date: 2026-10-05
tags: [Homelab, Ollama, SSH, Windows, Reliability, Prometheus]
---

## What shipped

`gpu-proxy`'s gaming guard — the thing that stops a local-LLM wake-up (or unloads an already-loaded model) from competing with a game for the one GPU in the house — used to run as a Windows-side agent polling `nvidia-smi` and maintaining an exclusion list of system/vendor processes (`dwm.exe`, `explorer.exe`, `NVIDIA Overlay.exe`, ...) to tell "a game" apart from normal desktop chrome. That agent is gone. In its place: `gpu-proxy` on tselitedesk polls Windows's lock state every 5 seconds over the SSH connection it already holds — `[bool](Get-Process -Name LogonUI -ErrorAction SilentlyContinue)` — and nothing runs on the gaming PC for this anymore.

## Why

The gaming PC is used almost exclusively for gaming; daily-driver computing happens on a separate Mac. On a machine like that, "session unlocked" and "actively gaming" are the same signal, so a process-exclusion list is solving a problem that doesn't exist here. It also meant one more thing installed and running on the Windows box, when the gateway already has an SSH channel open to it for everything else.

The old push-webhook agent is still in git history (`windows-agent/gpu-agent.ps1`, around commit `50702ea`) in case the usage pattern ever changes and the machine becomes a daily driver too — at that point "unlocked" stops meaning "gaming" and the process-based approach is the fallback to revisit.

## How it's set up

`_gaming_poller()` runs as a background task alongside the existing health poller, SSHes in every `GAMING_POLL_INTERVAL` (5s), checks lock state, and sets `_gpu_safe`/`_gpu_reason` directly — no webhook round trip. `ensure_ready()`'s gaming check now runs unconditionally before the healthy-fast-path return, closing a race where a healthy-but-stale flag could skip the check entirely. On an SSH failure, the poller logs a warning and leaves `_gpu_safe` at its last known value rather than guessing, to avoid flapping on a transient network hiccup.

The `/gpu-webhook` endpoint itself stays — `tests/chaos_test.sh` uses it to simulate a game starting without needing physical access to lock the screen, so the two recovery scenarios (Ollama crash recovery, gaming unload) stay testable on demand.

One rollout bug, found and fixed the same day: `_gaming_poller` logging a warning on every single SSH check — once every 5 seconds — whenever Windows was actually asleep (the intended end state), rather than once on the asleep→reachable transition. That tripped a real Prometheus/Loki `HighErrorCountByContainer` alert. Fixed by tracking reachability separately from lock state and only logging on change, not on every poll.

## What's next

A sleep-reenable assertion is the obvious next addition to `chaos_test.sh`, now that a real silent sleep-timer bug (see the companion postmortem) has shown that "did the SSH command return 0" isn't enough to trust that Windows actually went back to sleep.
