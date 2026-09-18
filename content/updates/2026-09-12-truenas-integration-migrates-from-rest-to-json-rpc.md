---
title: TrueNAS Integration Migrates from REST to JSON-RPC
date: 2026-09-12
duration: one day
tags: [TrueNAS, Homelab, TLS]
---

## What shipped

Both integrations that talk to TrueNAS — the homelab dashboard's backend and a separate Prometheus alert-forwarding script — moved off TrueNAS's REST API and onto the official `truenas_api_client` library over `wss://` (JSON-RPC 2.0/WebSocket).

## Why

TrueNAS's REST API is deprecated and slated for removal in v26.04, so this wasn't optional. It surfaced a real, non-obvious finding along the way: TrueNAS auto-revokes API keys the moment they're used over an unverified transport — confirmed via its own alert, "Attempt to use over an insecure transport" — even though Tailscale already encrypts the traffic end-to-end. TrueNAS's own software has no visibility into that and enforces TLS verification unconditionally for this auth mechanism, so the migration had to include a real certificate fix, not just a client library swap.

## How it's set up

Root-caused locally on the TrueNAS box itself via `midclt` (bypassing the network client entirely) with a key already proven valid over REST — that's what confirmed the failure was a transport requirement, not a bad key, before the actual alert gave the real reason. Fix: regenerated TrueNAS's self-signed certificate with a proper SAN and the correct extensions (`CA:FALSE`, `keyUsage`, `extendedKeyUsage: serverAuth`), imported it, then trusted it both on the Pi's system trust store and baked into the dashboard backend's own Docker image at build time — the client library only accepts a boolean `verify_ssl`, not a custom CA path, so the certificate has to be trusted at the OS level either way.

`truenas_api_client.Client` is synchronous, so the dashboard backend calls it via `asyncio.to_thread` to avoid blocking the event loop. Verified end-to-end in production after a real deploy, not just locally.

## What's next

Diagnosing the transport requirement burned three API keys — each failed JSON-RPC auth attempt under the wrong transport silently revoked the key under test — before the actual cause was understood. All dead keys were cleaned up afterward; TrueNAS now runs on exactly one active key, shared by both integrations. Worth remembering before touching TrueNAS auth again: a failed auth attempt there isn't free to retry.
