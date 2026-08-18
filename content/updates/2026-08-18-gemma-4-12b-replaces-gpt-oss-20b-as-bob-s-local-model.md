---
title: Gemma 4 12B Replaces gpt-oss-20b as Bob's Local Model
date: 2026-08-18
duration: one day
tags: [Local LLM, Ollama, Hermes Agent, Homelab]
---

## What shipped

Swapped the local model behind Bob (the homelab's always-on Hermes Agent) from `gpt-oss-20b` to `gemma4:12b`, served through Ollama with a 65,536-token context and verified real tool-calling — actual terminal commands executed and reported accurately, not just described. Same `gpu-proxy` layer as before (model-alias mapping, gaming-safety integration, Wake-on-LAN), so nothing downstream had to change.

## Why

`gpt-oss-20b` via Ollama had a real, repeated reliability problem: it would invent tool names that don't exist, leak its internal reasoning as if it were the final answer, or describe an action instead of actually taking it. Not a capacity issue — Ollama ran it fine, no VRAM or crash problems — a tool-calling behavior problem. Gemma 4 12B tested cleanly on the same tasks: correct terminal execution, correctly separated "thinking" output from the final answer, and — smaller than gpt-oss-20b to boot, so it leaves more VRAM headroom on the RTX 5080 for the 64K context Hermes Agent requires.

## How it's set up

```
Hermes (tselitedesk, Docker)
    ↓
gpu-proxy — model-alias mapping, gaming-safety integration, Wake-on-LAN
    ↓
Ollama — native Windows, RTX 5080
    ↓
gemma4:12b — 65536 context, tool calling
```

Two things needed fixing to get here cleanly. Ollama's runtime context length defaults to a VRAM-scaled heuristic that ignores what the model itself supports, so `OLLAMA_CONTEXT_LENGTH` has to be set explicitly — and set as a persistent environment variable, not just for whatever shell happens to launch the process, or it silently reverts on the next restart. And Gemma 4's "thinking" mode doesn't reliably self-terminate: an early test generated 39,000+ tokens for a two-word prompt before being killed by hand, so `gpu-proxy` now hard-clamps `max_tokens`/`num_predict` on every request regardless of what the client already sent.

The original plan was vLLM instead of Ollama, for the performance headroom — that path hit an unfixable WSL2/GPU-virtualization bug and got abandoned; full writeup in the postmortem.

## What's next

Bob's weak spot now isn't tool execution — it's synthesis across many results. Asked to compare resource pressure across three hosts checked in parallel, it correctly gathered all the data but attributed one host's memory numbers to a different host when writing the summary. Individual tool calls are reliable; long, multi-result synthesis is the next thing worth stress-testing and, if it holds up as a real pattern, fixing.
