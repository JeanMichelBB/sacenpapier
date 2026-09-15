"use client";

import { useEffect, useRef, useState } from "react";
import { strings, type Lang } from "@/lib/strings";
import { infraApi, type InfraNode, type K3sData, type PodInfo } from "@/lib/infra";

const PHYSICAL_NODES = [
  { key: "tselitedesk", hw: "HP EliteDesk 800 G2", os: "Ubuntu", services: ["Media stack", "gpu-proxy", "k3s control plane"] },
  { key: "tswindows11", hw: "Gaming PC — RTX 5070", os: "Windows 11", services: ["Ollama (RTX 5070)", "GPU inference"] },
  { key: "tstruenas", hw: "Beelink ME Pro 2 · N95", os: "TrueNAS Scale", services: ["ZFS mirror RAID1", "4 TB storage", "NFS for k3s"] },
];

const REMOTE_NODES = [
  { key: "tspi", hw: "Raspberry Pi 4", os: "Raspberry Pi OS", role: "Monitoring", services: ["Prometheus", "Grafana", "Alertmanager"] },
  { key: "oci-node-1", hw: "OCI VM.Standard.A1 (ARM)", os: "Ubuntu", role: "k3s worker 1", services: ["k3s agent"] },
  { key: "oci-node-2", hw: "OCI VM.Standard.A1 (ARM)", os: "Ubuntu", role: "k3s worker 2", services: ["k3s agent"] },
];

const CLUSTER_NODES = [
  { key: "tselitedesk", hw: "HP EliteDesk 800 G2", role: "control-plane", nodeName: "elitedesk" },
  { key: "oci-node-1", hw: "OCI VM.Standard.A1 (ARM)", role: "worker 1", nodeName: "oci-node-1" },
  { key: "oci-node-2", hw: "OCI VM.Standard.A1 (ARM)", role: "worker 2", nodeName: "oci-node-2" },
];

export function InfrastructureContent({ lang }: { lang: Lang }) {
  const [nodes, setNodes] = useState<InfraNode[]>([]);
  const [k3s, setK3s] = useState<K3sData | null>(null);
  const [pod, setPod] = useState<PodInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const initialized = useRef(false);

  const refresh = () => {
    infraApi.nodes().then(setNodes).catch(console.error);
    infraApi.k3s().then(setK3s).catch(console.error);
    if (!initialized.current) infraApi.pod().then(setPod).catch(console.error);
  };

  useEffect(() => {
    infraApi.nodes().then(setNodes).catch(console.error);
    infraApi.k3s().then(setK3s).catch(console.error);
    infraApi.pod().then((p) => {
      setPod(p);
      initialized.current = true;
    }).catch(console.error).finally(() => setLoading(false));
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, []);

  function rotatePod() {
    setSpinning(true);
    infraApi.pod().then(setPod).catch(console.error).finally(() => setSpinning(false));
  }

  const t = strings[lang];
  const byName = Object.fromEntries(nodes.map((n) => [n.name, n]));
  const onlineCount = nodes.filter((n) => n.online).length;

  return (
    <div>
      {/* Stat strip */}
      <div className="mb-12 grid grid-cols-2 gap-4 rounded-xl border border-zinc-200 bg-white p-6 sm:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Stat value={loading ? null : `${onlineCount}/${nodes.length || 6}`} label={t.infraStatNodes} />
        <Stat value={loading ? null : (k3s?.pods.running ?? "—")} label={t.infraStatPods} highlight />
        <Stat value={loading ? null : (k3s?.nodes.length ?? "—")} label={t.infraStatK3sNodes} />
        <Stat value="4" label={t.infraStatProjects} />
      </div>

      {/* Physical Network */}
      <section className="mb-12">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">{t.infraNetworkTitle}</h2>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t.infraNetworkDesc}</p>

        <div className="mb-3 rounded-xl border border-zinc-200 bg-white p-5 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center gap-0">
            <FlowNode label="Internet" sub="WAN" dim />
            <Arrow />
            <FlowNode label="ISP Router" sub="DHCP / gateway" />
            <Arrow />
            <FlowNode label="OPNsense" sub="firewall" online={byName["tsopnsense"]?.online} />
            <Arrow />
            <FlowNode label="LAN" sub="physical nodes" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PHYSICAL_NODES.map((n) => (
            <NodeCard key={n.key} hw={n.hw} os={n.os} services={n.services} online={byName[n.key]?.online} loading={loading} />
          ))}
        </div>
      </section>

      {/* Tailscale Overlay */}
      <section className="mb-12">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">{t.infraTailscaleTitle}</h2>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t.infraTailscaleDesc}</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {REMOTE_NODES.map((n) => (
            <NodeCard key={n.key} hw={n.hw} os={n.os} role={n.role} services={n.services} online={byName[n.key]?.online} loading={loading} />
          ))}
        </div>
      </section>

      {/* k3s Cluster */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">{t.infraK3sTitle}</h2>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t.infraK3sDesc}</p>

        <div className="mb-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="hidden text-xs text-zinc-400 dark:text-zinc-600 sm:block">{t.infraRerouteHint}</span>
            <button
              onClick={rotatePod}
              disabled={spinning}
              title="Re-route to a different pod"
              className="rounded-full border border-zinc-200 p-1.5 text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-40 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
            >
              <svg className={`h-3 w-3 ${spinning ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 3v5h-5" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {CLUSTER_NODES.map((n) => (
              <ClusterNode
                key={n.key}
                hw={n.hw}
                role={n.role}
                online={byName[n.key]?.online}
                serving={pod?.node === n.nodeName}
                loading={loading}
                servingLabel={t.infraServing}
              />
            ))}
          </div>
        </div>

        {k3s && (
          <div className="flex flex-wrap gap-8 rounded-xl border border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
            <PodStat label={t.infraTotal} value={k3s.pods.total} />
            <PodStat label={t.infraRunning} value={k3s.pods.running} highlight />
            <PodStat label={t.infraPending} value={k3s.pods.pending} />
            <PodStat label={t.infraFailed} value={k3s.pods.failed} danger={k3s.pods.failed > 0} />
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ value, label, highlight }: { value: string | number | null; label: string; highlight?: boolean }) {
  return (
    <div>
      <div className={`text-2xl font-bold font-mono tabular-nums ${highlight ? "text-green-600 dark:text-green-400" : "text-zinc-900 dark:text-white"}`}>
        {value === null ? <span className="inline-block h-7 w-8 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" /> : value}
      </div>
      <div className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-600">{label}</div>
    </div>
  );
}

function FlowNode({ label, sub, dim, online }: { label: string; sub?: string; dim?: boolean; online?: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${dim ? "border-transparent bg-transparent" : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/60"}`}>
      <div>
        <div className={`text-xs font-semibold ${dim ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-700 dark:text-zinc-200"}`}>{label}</div>
        {sub && <div className="text-xs text-zinc-400 dark:text-zinc-600">{sub}</div>}
      </div>
      {online !== undefined && <LiveDot online={online} />}
    </div>
  );
}

function Arrow() {
  return <div className="hidden select-none px-1 text-xs text-zinc-300 dark:text-zinc-700 sm:block">──▶</div>;
}

function NodeCard({ hw, os, role, services, online, loading }: {
  hw: string; os: string; role?: string; services: string[]; online?: boolean; loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3.5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600">
      <div className="mb-0.5 flex items-center gap-2">
        <LiveDot online={online} loading={loading} />
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{hw}</span>
      </div>
      <div className="mb-1 ml-4 font-mono text-xs text-zinc-400 dark:text-zinc-500">{os}</div>
      {role && <div className="mb-2 ml-4 text-xs font-medium text-zinc-500 dark:text-zinc-500">{role}</div>}
      <ul className="space-y-1 text-xs text-zinc-500 dark:text-zinc-500">
        {services.map((s) => (
          <li key={s} className="flex gap-1.5">
            <span className="select-none text-zinc-300 dark:text-zinc-700">·</span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ClusterNode({ hw, role, online, serving, loading, servingLabel }: {
  hw: string; role: string; online?: boolean; serving?: boolean; loading?: boolean; servingLabel: string;
}) {
  return (
    <div className={`rounded-xl border px-4 py-3.5 transition-colors ${serving ? "border-green-300 bg-green-50 dark:border-green-900/60 dark:bg-green-950/20" : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"}`}>
      <div className="mb-0.5 flex items-center gap-2">
        <LiveDot online={online} loading={loading} />
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{hw}</span>
      </div>
      <div className={`mt-2 ml-4 inline-block rounded-md px-1.5 py-0.5 font-mono text-xs ${serving ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"}`}>
        {role}
      </div>
      {serving && <div className="mt-1.5 ml-4 font-mono text-xs text-green-600 dark:text-green-400">{servingLabel}</div>}
    </div>
  );
}

function PodStat({ label, value, highlight, danger }: { label: string; value: number; highlight?: boolean; danger?: boolean }) {
  const color = danger ? "text-red-500 dark:text-red-400" : highlight ? "text-green-600 dark:text-green-400" : "text-zinc-900 dark:text-white";
  return (
    <div>
      <div className={`text-2xl font-bold font-mono tabular-nums ${color}`}>{value}</div>
      <div className="mt-0.5 font-mono text-xs text-zinc-400 dark:text-zinc-600">{label}</div>
    </div>
  );
}

function LiveDot({ online, loading }: { online?: boolean; loading?: boolean }) {
  if (loading) return <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />;
  return (
    <span className={`h-2 w-2 rounded-full ${online ? "bg-green-400" : "bg-zinc-300 dark:bg-zinc-700"}`} />
  );
}
