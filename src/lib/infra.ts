export type InfraNode = {
  name: string;
  role: string;
  tailscale_ip: string;
  online: boolean;
  cpu_percent: number | null;
  ram_percent: number | null;
  uptime_seconds: number | null;
};

export type K3sNode = {
  name: string;
  status: string;
  role: string;
};

export type K3sData = {
  nodes: K3sNode[];
  pods: { total: number; running: number; pending: number; failed: number };
};

export type PodInfo = {
  hostname: string;
  node: string;
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`/api/infra/${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json();
}

export const infraApi = {
  nodes: () => get<InfraNode[]>("nodes"),
  k3s: () => get<K3sData>("k3s"),
  pod: () => get<PodInfo>("pod"),
};
