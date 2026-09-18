---
title: Distributed Tracing with OpenTelemetry and Tempo
date: 2026-09-13
duration: one day
tags: [OpenTelemetry, Tracing, Tempo, Observability]
---

## What shipped

All 5 FastAPI backends now push OpenTelemetry traces to a Grafana Tempo instance on `tspi`, completing the observability trifecta alongside the metrics (Prometheus) and logs (Loki) that already existed. Every traced request also generates RED metrics and service-graph edges in Prometheus automatically, with zero extra instrumentation.

## Why

Tracing is the piece platform-engineering conversations keep coming back to, and the fleet already had the other two legs of the stool. Jaeger+Elasticsearch was ruled out up front as too heavy for a homelab's scale; Tempo's monolithic single-binary mode fit the same pattern already used for Prometheus and Blackbox — run outside the resource-constrained app nodes, on `tspi`.

## How it's set up

`grafana/tempo:latest` turned out to resolve to v3.0.0, whose new Kafka-backed architecture doesn't support the old single-binary config at all — pinned to `2.7.1` instead, which still runs fully local-disk, no Kafka required. Tracing is push-based (OTLP grpc/http), so unlike the metrics rollout, no NodePort was needed on the app side — each backend pushes spans straight to `tspi` over the same Tailscale mesh it already talks to internal services over.

Instrumentation follows one pattern across all 5 apps: `opentelemetry-instrumentation-fastapi` auto-instruments every request, plus `-sqlalchemy` for the four MySQL-backed apps or `-redis` for homelab-backend. A small per-app `tracing.py` builds the OTLP endpoint from a `TAILSCALE_IP_TSPI` env var and no-ops if it's unset, so local dev is unaffected. That value flows in through each app's existing Doppler-synced secret — new key added to each Doppler project, `secrets.doppler.com/reload` picked it up on its own, no manifest changes or manual rollout needed anywhere.

Tempo's metrics-generator remote-writes span metrics into the existing Prometheus instance, and a Grafana datasource wires trace-to-log and trace-to-service-map correlation using the real, already-live Loki/Prometheus datasource UIDs — pulled from the Grafana API rather than reassigned via file-provisioning, which would have silently broken every panel query in the pre-existing logs dashboard.

Noted honestly rather than glossed over: PopRoom is the weakest fit of the five. It's WebSocket-heavy, and while the HTTP surface and SQLAlchemy persistence path are traced, individual in-socket game events aren't.

## What's next

Every app was verified end-to-end for real — CI build through to a live pod hit directly, confirmed searchable in Tempo by service name, span metrics queryable in Prometheus. Verifying `x` hit a genuine rollout-timing trap: a bare label selector during a mid-rollout `kubectl exec` landed on a 102-day-old leftover pod with no tracing code, briefly looking like a real bug before checking which ReplicaSet actually had `DESIRED: 1`.
