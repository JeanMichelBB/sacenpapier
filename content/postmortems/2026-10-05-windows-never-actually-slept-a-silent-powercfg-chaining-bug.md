---
title: Windows Never Actually Slept: a Silent powercfg Chaining Bug
date: 2026-10-05
duration: unknown — silent, found by a casual question
tags: [Homelab, Ollama, SSH, Windows, Reliability, Prometheus]
---

## What happened

`gpu-proxy` (a FastAPI gateway on tselitedesk that wakes/sleeps a gaming PC on demand so its GPU can run Ollama for Hermes) stops Ollama and re-enables Windows sleep after a `SESSION_IDLE_TIMEOUT` of inactivity. A plain "is it idle?" question — "it should sleep sooner?" — led to checking whether that was actually happening. It wasn't: Windows had been sitting fully awake for far longer than the idle timeout, every time, with no error anywhere.

## Root cause

`_ssh_stop_ollama()` ran its cleanup as one chained PowerShell `-Command` string over a single SSH call:

```powershell
Stop-Process -Name ollama -Force -ErrorAction SilentlyContinue;
Get-WmiObject Win32_Process | Where-Object {$_.CommandLine -like '*SetThreadExecutionState*'} | ForEach-Object { $_.Terminate() | Out-Null };
powercfg /change standby-timeout-ac 20; powercfg /change hibernate-timeout-ac 20
```

The `Get-WmiObject ... .Terminate()` step — killing the keep-awake loop — silently broke everything chained after it in the same command string. The `powercfg` calls never ran, but the whole thing still exited 0. The code only ever logged "Ollama stopped, keep-awake killed, sleep re-enabled" unconditionally after the SSH call returned — it never checked whether the exit code or stderr actually confirmed that.

Reproduced directly: ran the exact chained command on the Windows box and watched `powercfg` have no effect. Ran the WMI-kill and the `powercfg` calls as two separate commands, and both worked correctly. The chaining itself — not WMI, not powercfg individually — was the failure mode.

## Fix

Split `_ssh_stop_ollama()` into two separate SSH calls: one to kill `ollama`/`llama-server`/the keep-awake WMI process, a second purely for the two `powercfg` commands. Captured the second call's actual exit code and stderr, and log success/failure based on that instead of assuming success once the SSH round trip returns.

While investigating, also found an orphaned keep-awake process that had survived an earlier, unrelated removal of a different Windows-side agent (deleting its Scheduled Task and files didn't touch the process it had already spawned) — killed manually, confirmed not reintroduced by the fix above.

## Prevention

- Never chain an unrelated cleanup step ahead of the command you actually care about in one PowerShell `-Command` string over SSH — split them, so one failing can't silently swallow the other.
- Never log success based on "the SSH call returned" — check the actual exit code.
- `tests/chaos_test.sh` (added the same day, see the companion update) now exercises Ollama crash recovery and the gaming-unload path live; a sleep-reenable assertion is the natural next addition there.
