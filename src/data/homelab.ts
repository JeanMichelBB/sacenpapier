// Content for the Documentation tab. Editing this file is the "update the content" step —
// no component/rendering code needs to change when adding or editing an entry.

export type ServiceItem = {
  slug: string;
  name: string;
  detail: string;
  links?: string;
  extLink?: { href: string; label: string };
};

export type Subgroup = { name: string; items: ServiceItem[] };

export type Device = {
  model: string;
  os?: string;
  why: string;
  network?: string;
  subgroups?: Subgroup[];
  items?: ServiceItem[];
};

export type Integration = {
  slug: string;
  name: string;
  detail: string;
  usedIn: { href: string; label: string }[];
};

export const devices: Device[] = [
  {
    model: "HP EliteDesk 800 G2 DM",
    os: "Ubuntu Server 24.04",
    why: "Main server. Single point of failure for most of the homelab at once — does two separate jobs, split below.",
    network:
      "Tailscale-only, plus a LAN fallback address and a WAN SSH fallback. nginx-proxy here routes *.sacenpapier.org. Only Gluetun's VPN tunnel is exposed outbound to the internet — nothing else here is reachable except over Tailscale.",
    subgroups: [
      {
        name: "k3s control-plane",
        items: [
          {
            slug: "k3s-control-plane",
            name: "k3s control-plane",
            detail:
              "Runs k3s's embedded sqlite datastore and schedules every workload onto the two OCI worker VMs over Tailscale. This is the piece most sensitive to Tailscale relay/connectivity issues — if the mesh degrades to a relay, scheduling and pod-to-pod traffic both suffer. A real incident once saw the sqlite datastore bloat to several GB from revision-history churn on high-frequency keys (leases, Longhorn CRDs), pegging elitedesk's CPU near 100% on essentially idle workload — fixed by keeping only the latest revision per key, cutting both the database size and CPU load roughly 15x. A handful of watchdogs now run automatically: one restarts Tailscale/k3s on relay issues, one clears stale Longhorn webhook registrations after a restart, one vacuums the sqlite datastore daily to keep it from bloating again. Day-to-day commands and Longhorn maintenance are documented separately rather than repeated here.",
          },
        ],
      },
      {
        name: "Docker stack + personal",
        items: [
          {
            slug: "homepage",
            name: "Homepage",
            detail:
              "The live dashboard — what you actually open from the Mac shortcut for a quick glance at everything. Services are Docker-label auto-discovered rather than hand-maintained in services.yaml, so a new container with the right labels shows up without an edit. Widgets poll live APIs (Gluetun's VPN status, qBittorrent, the *arr stack, Portainer, Uptime Kuma, OpenRouter usage) directly, so what you see here reflects current state, not a cached snapshot.",
          },
          {
            slug: "gpu-proxy",
            name: "gpu-proxy",
            detail:
              "The LLM gateway: wakes the gaming PC over LAN Wake-on-LAN, reaches it over Tailscale SSH once up, and proxies chat requests to Ollama. Gaming-guarded — it polls the Windows session's lock state over the same SSH connection and refuses inference while a game is actually running, rather than relying on the PC to self-report. Deliberately read-only with respect to Windows' own sleep policy — it used to disable standby/hibernate for the session and run a keep-awake loop, but that subsystem caused two real bugs, so it was removed entirely; Windows' own standby timer is now the sole authority on when it actually sleeps. Ollama itself runs as a real Windows service (via NSSM) rather than a Scheduled Task, after the Scheduled Task approach was confirmed to fail permanently on a cold reboot with nobody logged in interactively.",
          },
          {
            slug: "hermes-bob",
            name: "Hermes / Bob",
            detail:
              "The devops agent (Hermes v0.14.0, bot name Bob). Discord was disabled deliberately and indefinitely — that channel was shared with a gaming friend group, and the goal was fully off it, not just quieter — so Hermes now communicates only over Telegram, the same channel Alertmanager's alerts land in. Two more AI backends sit behind the local Ollama model as fallbacks: OpenAI (cheap auxiliary model) and OpenRouter (used if the local provider fails entirely) — switchable live via a chat command. SSH-backed terminal tool so it operates on the real host rather than an isolated sandbox, cron jobs for recurring checks, and persistent memory/session history. Own web dashboard for config, sessions, and memory.",
          },
          {
            slug: "searxng",
            name: "SearXNG",
            detail:
              "Self-hosted metasearch — aggregates results from other search engines without the tracking, used as a private search backend for other tools in the stack rather than a public-facing service.",
          },
          {
            slug: "nginx-proxy",
            name: "nginx-proxy",
            detail:
              "The reverse proxy in front of this host, routing *.sacenpapier.org subdomains (Jellyfin, Seerr, Homepage) to the right local port, and handling the Let's Encrypt side of TLS. Kept deliberately general here rather than naming exact internals.",
          },
          {
            slug: "cloudflare-ddns",
            name: "Cloudflare DDNS",
            detail:
              "A plain systemd timer (not a container) running every 10 minutes, updating Cloudflare's DNS record for the house's current public IP. This is the thing that makes *.sacenpapier.org keep working on a residential connection with no static IP. Easy to miss when auditing via docker ps alone — it's host-level automation with no container footprint at all.",
          },
          {
            slug: "minecraft-bedrock",
            name: "Minecraft Bedrock",
            detail:
              "Currently paused — stopped for lack of available memory on elitedesk, not decommissioned. Also a systemd service, not Docker. Console/live-logs UI, plus a separate allowlist manager for adding/removing players. Has its own two systemd timers: one backs up the world on a schedule, the other checks for and applies server updates — both separate from this repo's own daily config backup. Provisioned via the repo's own Ansible playbook for standing up a fresh host.",
          },
          {
            slug: "portainer-agent-elitedesk",
            name: "Portainer agent",
            detail:
              "The agent side of Portainer's remote-management model — the actual Portainer UI runs on tspi and manages this host (and others) through this agent, rather than elitedesk running its own standalone instance.",
          },
          {
            slug: "watchtower-elitedesk",
            name: "Watchtower",
            detail:
              "Auto-updates container images on a schedule. Needed an explicit DOCKER_API_VERSION=1.45 env var at one point to stop a Docker API version mismatch error — worth checking first if it starts failing again.",
          },
          {
            slug: "glances-elitedesk",
            name: "Glances",
            detail:
              "System stats exporter, feeds Homepage's CPU/resource widgets for this host. The 'version: 4' field matters in Homepage's widget config — without it the widget shows NaN% instead of real numbers.",
          },
          {
            slug: "cadvisor",
            name: "cAdvisor",
            detail:
              "Per-container resource usage metrics (CPU, memory, network, disk IO per container), scraped by Prometheus on tspi alongside the host-level Glances/node data.",
          },
          {
            slug: "promtail-elitedesk",
            name: "Promtail",
            detail:
              "Ships this host's Docker container logs and syslog to Loki on tspi. Had a real bug once: its tracked read-offset for /var/log/syslog can drift past the file's actual current size after a logrotate truncation with no error logged, silently stalling syslog ingestion for weeks. The NoSyslogLogsElitedesk alert now catches a recurrence within 15 minutes.",
          },
          {
            slug: "nut-exporter",
            name: "NUT exporter + textfile exporter",
            detail:
              "Exposes UPS status (battery charge, load, runtime estimate) from Network UPS Tools as Prometheus metrics, so a power event shows up in the same alerting pipeline as everything else instead of being invisible.",
          },
          {
            slug: "opnsense-metrics-relay",
            name: "opnsense-metrics-relay",
            detail:
              "A socat relay (listens locally, forwards to OPNsense's own metrics port) that exists purely because OPNsense's node_exporter can't be scraped directly from tspi over the network topology in play — this container bridges that gap so OPNsense's metrics still reach Prometheus.",
          },
        ],
      },
    ],
  },
  {
    model: "Beelink ME Pro 2",
    os: "TrueNAS SCALE",
    why: "Highest-impact loss: the single most irreplaceable device in the homelab.",
    network:
      "LAN only, not on Tailscale — reachable only from inside the house network. elitedesk mounts it directly for media + backups.",
    items: [
      {
        slug: "truenas-backups",
        name: "Backups (k3s, elitedesk, Time Machine)",
        detail:
          "ZFS-snapshotted daily — protects against accidental delete/corruption and ransomware-style mass-change, not disk failure (the mirror RAID1 pool already covers that separately). Added after the 2026-10-14 incident where Media/.env went missing with zero backup anywhere and had to be recovered from a single lucky one-off copy. Also the Time Machine target for the Mac.",
      },
    ],
  },
  {
    model: "Protectli Vault V1210",
    os: "OPNsense",
    why: "If it dies, the whole house loses internet/routing immediately.",
    network:
      "LAN only, transparent bridge in front of every other device. Its own Tailscale client is userspace-only on FreeBSD, so its WebUI is exposed via `tailscale serve` instead of a normal Tailscale IP; metrics are relayed through elitedesk (opnsense-metrics-relay) for the same reason.",
    items: [
      {
        slug: "opnsense-firewall",
        name: "Firewall + routing",
        detail:
          "A transparent bridge firewall — every packet on the LAN passes through it, but it isn't acting as a traditional gateway IP for most devices. Its WebUI is reachable over Tailscale via `tailscale serve`, specifically because FreeBSD's Tailscale client is userspace-only and can't get its own mesh IP the normal way. A known upstream bug in its gateway API (opnsense-exporter's current_data_length parse error) is already filtered out of the alert rules so it can't falsely trip them; a weekly Hermes cron job watches for a real fix.",
      },
    ],
  },
  {
    model: "OCI (Oracle Cloud)",
    os: "2x VM.Standard.A1.Flex, Ubuntu 24.04",
    why: "Not a single device — 2 worker VMs plus the Always Free Object Storage bucket, all part of the same Oracle Cloud account. The actual apps running on these VMs are documented separately under Production, not mixed in here.",
    network:
      "Tailscale-only, each worker on its own Tailscale IP. k3s spans elitedesk's control-plane and these two workers entirely over Tailscale — the one piece most sensitive to Tailscale relay/connectivity issues. Traefik ingress routes *.sacenpapier.org to the right pod once it reaches the cluster.",
    items: [
      {
        slug: "longhorn",
        name: "Longhorn",
        detail:
          "Distributed block storage backing the cluster's PVCs, replicated across the control-plane and both worker nodes. Known gap: no off-cluster backup target is configured — it only has in-cluster replicas, so a cluster-wide event (not just one node) could still mean real data loss. Not yet resolved.",
      },
      {
        slug: "mysql",
        name: "MySQL",
        detail:
          "A Longhorn-backed PVC workload with its own daily backup job to TrueNAS, separate from Longhorn's in-cluster replication.",
      },
      {
        slug: "oci-object-storage",
        name: "OCI Object Storage",
        detail:
          "The offsite leg of the homelab's config backup strategy — age-encrypted before anything leaves a host, uploaded via a scoped IAM credential rather than the personal OCI API key, so a leaked server credential can't touch compute/k3s/anything else. Provisioned via its own Terraform project. Always Free tier: 20GB total.",
      },
      {
        slug: "config-backups-bucket",
        name: "homelab-config-backups bucket",
        detail:
          "The actual bucket receiving the daily rclone sync (S3-compatible endpoint, explicit region required or the signature check fails) from both elitedesk and tspi's backup scripts. A stale 5.6GB leftover file once nearly doubled this bucket's size for months before being caught and removed.",
      },
      {
        slug: "oci-quota-check",
        name: "check_oci_backup_quota.sh",
        detail:
          "A daily script (runs right after the sync, so it reflects current size) that fires an alert if the bucket crosses 80% of the 20GB free-tier limit — built directly in response to the 5.6GB near-miss, so the next one gets caught automatically instead of by luck.",
      },
    ],
  },
  {
    model: "Raspberry Pi 4 Model B",
    os: "Debian 13",
    why: "Lower impact: if it dies, you lose visibility into problems — nothing else actually stops.",
    network: "Tailscale only, no LAN fallback documented. Scrapes every other host's metrics over Tailscale.",
    items: [
      {
        slug: "prometheus",
        name: "Prometheus",
        detail:
          "Scrapes metrics from every host (node_exporter-style data, cAdvisor, Glances, the exporters) and evaluates alerting thresholds, handing anything that fires to Alertmanager.",
      },
      {
        slug: "alertmanager",
        name: "Alertmanager",
        detail:
          "This is where the monitoring stack actually lives, so alert routing is centered here: fired alerts go out over Telegram via a plain authenticated webhook into Hermes/Bob's own webhook platform, registered deliver-only — it skips Bob's agent loop entirely, zero LLM calls per alert, just a direct template render straight to Telegram. group_by includes alertname/cluster/node plus disk/container/host specifically — grouping only by the first three once meant multiple alert instances with different per-instance text got bundled into one notification with no text common across the group. Fixed by grouping on the differentiating labels too.",
      },
      {
        slug: "grafana",
        name: "Grafana",
        detail:
          "Dashboards over Prometheus's metrics. Dashboard JSON is exported via Grafana's own API and committed to this repo daily; Grafana's own users/API-keys/alert-rules/datasources live in grafana.db, backed up separately via SQLite's online-backup API (a raw copy risked a torn snapshot on a live database).",
      },
      {
        slug: "loki-ruler",
        name: "Loki + ruler",
        detail:
          "Log aggregation plus Loki's own local rule evaluation engine for log-based alerts. Loads every file in its rules directory as an independently-evaluated rule group — a real bug once came from leftover .bak-timestamp safety copies sitting inside that same directory, meaning 7 historical rule versions were evaluating simultaneously; backups now live outside that directory entirely.",
      },
      {
        slug: "tempo",
        name: "Tempo",
        detail: "Distributed tracing backend, part of the same observability stack as Loki/Prometheus/Grafana.",
      },
      {
        slug: "uptime-kuma",
        name: "Uptime Kuma",
        detail:
          "Simple external up/down checks, independent of the Prometheus/Grafana stack. Its kuma.db (829MB — monitor definitions, Telegram notification config, and all heartbeat history in one file) is backed up via SQLite's online-backup API, same reasoning as Grafana's db.",
      },
      {
        slug: "portainer-tspi",
        name: "Portainer",
        detail:
          "The actual Portainer UI (not just an agent) — manages this host plus elitedesk's containers through its agent there. A setup-timeout issue once required a plain restart and completing setup within 5 minutes.",
      },
      {
        slug: "watchtower-tspi",
        name: "Watchtower",
        detail: "Same auto-update role as elitedesk's Watchtower, scoped to this host's containers.",
      },
      {
        slug: "glances-tspi",
        name: "Glances",
        detail: "System stats for this host, same role as elitedesk's Glances instance.",
      },
      {
        slug: "promtail-tspi",
        name: "Promtail",
        detail:
          "Ships this host's own container logs into its local Loki, same role as elitedesk's Promtail but local — no network hop needed since Loki runs right here.",
      },
      {
        slug: "blackbox-exporter",
        name: "blackbox-exporter",
        detail:
          "Probes endpoints from the outside (HTTP/TCP/ICMP checks) rather than scraping an app's own metrics — used for things like confirming a service's /ping endpoint actually returns 200 without auth.",
      },
      {
        slug: "graphite-exporter",
        name: "graphite_exporter",
        detail:
          "Accepts metrics in Graphite's plaintext protocol and re-exposes them in Prometheus format, for anything in the stack that only speaks Graphite natively.",
      },
      {
        slug: "opnsense-exporter",
        name: "opnsense-exporter",
        detail:
          "Scrapes OPNsense's own stats (via the metrics relay) into Prometheus. Has a known upstream bug where its gateway API returns inconsistent types for dynamic gateways — already filtered out of the alert rules rather than tripping them.",
      },
    ],
  },
  {
    model: "Gaming PC (custom build, RTX 5080)",
    os: "Windows 11",
    why: "Lowest impact: usually asleep already, only affects local LLM + game streaming.",
    network:
      "Tailscale-only, plus a LAN fallback address for Wake-on-LAN. gpu-proxy on elitedesk wakes it over LAN WoL then reaches it over Tailscale SSH — the only device woken by broadcast rather than always-on.",
    items: [
      {
        slug: "ollama",
        name: "Ollama (gemma4)",
        detail:
          "The local model, woken on demand via gpu-proxy rather than running 24/7. Gaming-guarded by a simple SSH lock-state poll (is the Windows session locked?) rather than process-detection — this machine is used almost exclusively for gaming, so 'unlocked' and 'actively gaming' are treated as the same signal.",
      },
      {
        slug: "apollo",
        name: "Apollo",
        detail:
          "Game streaming host, a Sunshine fork swapped in during a Windows update in October 2026 — binaries are still named sunshine.exe/sunshinesvc.exe, which is expected and not a leftover-cleanup issue.",
      },
    ],
  },
  {
    model: "MacBook Air (M2)",
    os: "macOS 26.6.2",
    why: "Doesn't run any live homelab service — but losing it means losing the age private key and SSH access needed to manage/recover everything else.",
    network:
      "On the Tailscale mesh like every other device, plus its own direct SSH config/keys to every host. The only device with the personal OCI API key as well as the scoped backup one.",
    items: [
      {
        slug: "claude-code-session",
        name: "This Claude Code session",
        detail: "SSH reach to every host, used for live queries and deploys.",
      },
      {
        slug: "age-private-key",
        name: "age private key",
        detail: "Decrypts the encrypted offsite backups. Lives only here — the public key is safe to distribute to servers.",
      },
    ],
  },
];

export const production = {
  why: "What's actually deployed and publicly reachable, kept separate from the Homelab devices above for clarity — this is the apps running on top of the OCI VMs, not the infrastructure itself.",
  items: [
    {
      slug: "sacenpapier-hub",
      name: "sacenpapier.org (hub)",
      detail:
        "The portfolio + postmortems site itself, a Next.js app. Pushes straight to main, which triggers a GitHub Actions build → Trivy scan → Docker Hub push → ArgoCD Image Updater write-back → cluster rollout, with no staging step in between.",
      links: "https://sacenpapier.org",
    },
    {
      slug: "x-app",
      name: "x",
      detail: "One of the 4 portfolio apps, own GitHub repo and its own Doppler secrets project, frontend + backend deployed separately in the default namespace.",
    },
    {
      slug: "poproom",
      name: "PopRoom",
      detail: "Portfolio app, own repo + Doppler project, same frontend/backend split and deploy pattern as the other three.",
    },
    {
      slug: "botwhy",
      name: "BotWhy",
      detail: "Portfolio app, own repo + Doppler project, same frontend/backend split and deploy pattern as the other three.",
    },
    {
      slug: "apercu",
      name: "Aperçu",
      detail: "Portfolio app, own repo + Doppler project, same frontend/backend split and deploy pattern as the other three.",
    },
    {
      slug: "homelab-dashboard",
      name: "homelab-dashboard",
      detail:
        "A backend + frontend + redis deployment whose backend feeds hub's live homelab data (k3s nodes/pods) directly. Its own subdomain is effectively dead now — traffic falls through to hub's wildcard ingress instead. Not wasted though: hub calls this backend directly (cluster-internal).",
    },
    {
      slug: "argocd",
      name: "ArgoCD",
      detail:
        "GitOps controller — watches each app's repo/image tag and rolls out updates automatically. Server, repo-server, applicationset controller, image-updater, dex (auth), redis, and notifications all run as separate pods in their own namespace.",
    },
  ] as ServiceItem[],
};

export const integrations: Integration[] = [
  {
    slug: "ssh",
    name: "SSH",
    detail:
      "Key-based access between every host in the homelab — the Mac's own SSH config is effectively the map of who can reach whom. Used for live queries, deploys, and as the transport gpu-proxy uses to both wake and talk to the gaming PC.",
    usedIn: [
      { href: "#svc-gpu-proxy", label: "gpu-proxy" },
      { href: "#svc-claude-code-session", label: "This Claude Code session" },
      { href: "#svc-ollama", label: "Ollama (gaming-guard poll)" },
    ],
  },
  {
    slug: "tailscale",
    name: "Tailscale",
    detail:
      "The mesh network every host communicates over — no service assumes plain LAN reachability except gpu-proxy's Wake-on-LAN broadcast. Also has its own control-plane service coordinating the mesh, separate from the devices themselves.",
    usedIn: [
      { href: "#dev-3", label: "OCI (Oracle Cloud)" },
      { href: "#dev-4", label: "Raspberry Pi" },
      { href: "#dev-5", label: "Gaming PC" },
      { href: "#dev-2", label: "OPNsense (tailscale serve exception)" },
    ],
  },
  {
    slug: "github",
    name: "GitHub",
    detail:
      "Source control for every repo in this homelab: this config/backup repo itself, sacenpapier, oci-terraform-backup, homelab-sacenpapier, and each portfolio app's own repo. Pushes to main trigger GitHub Actions for the production apps.",
    usedIn: [
      { href: "#svc-sacenpapier-hub", label: "sacenpapier.org (hub)" },
      { href: "#svc-argocd", label: "ArgoCD" },
    ],
  },
  {
    slug: "docker-hub",
    name: "Docker Hub",
    detail: "Image registry — GitHub Actions pushes built images here, and both Watchtower and ArgoCD's Image Updater pull from here to roll out updates.",
    usedIn: [
      { href: "#svc-sacenpapier-hub", label: "sacenpapier.org (hub)" },
      { href: "#svc-argocd", label: "ArgoCD" },
    ],
  },
  {
    slug: "cloudflare",
    name: "Cloudflare",
    detail: "DNS provider for sacenpapier.org and all its subdomains. The DDNS timer calls Cloudflare's API directly to keep records pointed at the house's current IP.",
    usedIn: [
      { href: "#svc-cloudflare-ddns", label: "Cloudflare DDNS" },
      { href: "#svc-sacenpapier-hub", label: "sacenpapier.org (hub)" },
    ],
  },
  {
    slug: "doppler",
    name: "Doppler",
    detail: "Secrets management for the k3s portfolio apps only — deliberately kept out of the home Docker stack's critical path so the house doesn't depend on an external SaaS just to start up.",
    usedIn: [
      { href: "#svc-x-app", label: "x" },
      { href: "#svc-poproom", label: "PopRoom" },
      { href: "#svc-botwhy", label: "BotWhy" },
      { href: "#svc-apercu", label: "Aperçu" },
    ],
  },
  {
    slug: "telegram",
    name: "Telegram",
    detail: "Where every alert actually lands, and also Hermes/Bob's current chat interface now that Discord has been disabled.",
    usedIn: [
      { href: "#svc-alertmanager", label: "Alertmanager (Raspberry Pi)" },
      { href: "#svc-hermes-bob", label: "Hermes / Bob (EliteDesk)" },
    ],
  },
  {
    slug: "openrouter",
    name: "OpenRouter",
    detail: "Cloud LLM API used as a fallback when local Ollama inference isn't enough or the gaming PC is asleep. Usage/cost tracked directly on Homepage.",
    usedIn: [{ href: "#svc-homepage", label: "Homepage" }],
  },
  {
    slug: "reverse-proxy",
    name: "Reverse proxy + Let's Encrypt",
    detail:
      "The reverse proxy (nginx-proxy / nginx-proxy-manager — treated as one general entry rather than claiming specifics on internals not fully confirmed) routes *.sacenpapier.org subdomains to the right local service. TLS certs come from Let's Encrypt via certbot, confirmed running on its own systemd timer for automatic renewal.",
    usedIn: [{ href: "#svc-nginx-proxy", label: "nginx-proxy" }],
  },
  {
    slug: "age",
    name: "age",
    detail: "Asymmetric encryption tool used to encrypt every backup before it leaves a host. The private key lives only on the Mac; the public key is safe to distribute to servers.",
    usedIn: [
      { href: "#svc-age-private-key", label: "age private key (Mac)" },
      { href: "#svc-oci-object-storage", label: "OCI Object Storage" },
    ],
  },
  {
    slug: "rclone",
    name: "rclone",
    detail: "Sync tool moving encrypted backups from elitedesk and tspi to OCI Object Storage's S3-compatible endpoint.",
    usedIn: [{ href: "#svc-config-backups-bucket", label: "homelab-config-backups bucket" }],
  },
  {
    slug: "terraform",
    name: "Terraform",
    detail: "Infrastructure-as-code for Oracle Cloud — two separate projects: the original k3s/OCI compute, and a dedicated one for the Object Storage backup bucket with its own scoped IAM credential.",
    usedIn: [{ href: "#svc-oci-object-storage", label: "OCI Object Storage" }],
  },
  {
    slug: "provisioning",
    name: "Provisioning (Ansible + cloud-init)",
    detail: "How a fresh host gets set up: an Ansible playbook provisions a Minecraft Bedrock server on a new box, and cloud-init user-data automates fresh Ubuntu VM provisioning. Different tools, same job — kept as one section rather than fragmenting it.",
    usedIn: [{ href: "#svc-minecraft-bedrock", label: "Minecraft Bedrock" }],
  },
];
