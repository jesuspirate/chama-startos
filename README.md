<p align="center">
  <img src="icon.png" alt="Chama Logo" width="21%">
</p>

# Chama on StartOS

> Everything not listed in this document should behave the same as upstream
> Chama. If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable — see the Documentation
> section of `instructions.md` for links.

[Chama](https://github.com/jesuspirate/chama) is a Nostr-native marketplace for local commerce: offers, negotiation and reputation travel over Nostr, and trades settle through a Fedimint federation, Lightning, or on-chain Bitcoin with buyer–seller–arbiter escrow. There is no Chama account server and no custodial Chama wallet.

The package's one significant departure from upstream is the wallet. Upstream Chama runs its Fedimint client in the browser as WebAssembly; this package disables that path and runs a native Rust wallet bridge on the server instead, so ecash lives in a StartOS volume that gets backed up rather than in browser storage that does not.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One custom image, built here rather than pulled — upstream publishes none. The application enters as a git submodule pinned to an upstream release tag, and the `Dockerfile` compiles both halves of it: the web client with Vite, and the `chama-fedimint-bridge` binary with cargo. nginx serves the result.

| Property      | Value                                                |
| ------------- | ---------------------------------------------------- |
| Image         | Custom `Dockerfile`, built from the pinned submodule |
| Architectures | x86_64, aarch64                                      |
| Entrypoint    | Custom — a shell supervisor, not nginx's             |

| Subcontainer | Purpose                                  |
| ------------ | ---------------------------------------- |
| `chama-sub`  | The only daemon — the one to `attach` to |

Three processes run inside it: nginx, one `chama-fedimint-bridge` bound to loopback, and the entrypoint supervising both. The daemon is started with `CHAMA_BRIDGE_AUTH_TOKEN` from `store.json`; the entrypoint passes it to the bridge and writes it into the `Authorization` header nginx adds on `/bridge/`.

**The entrypoint deliberately exits when either child dies**, so StartOS restarts the whole service rather than leaving a half-live one. A UI that is up while its wallet bridge is dead is the failure this avoids — it serves a page that looks healthy and fails every wallet call. The supervisor also treats an **unreaped zombie as dead**, because a bridge that aborts natively still satisfies a naive liveness check and would otherwise go unnoticed.

## Volume and Data Layout

One volume holding the native wallet's state and the package's two credentials. Chama itself keeps no configuration or database on disk.

| Volume | Mount Point | Purpose                     |
| ------ | ----------- | --------------------------- |
| `main` | `/data`     | Native Fedimint wallet data |

| Path                     | Holds                                              |
| ------------------------ | -------------------------------------------------- |
| `store.json`             | The UI password and the wallet bridge's token      |
| `client-1/`              | The active wallet's Fedimint state                 |
| `client-2/`, `client-3/` | Retired multi-client wallets, on old installs only |

The retired directories exist only where the install predates the single-interface topology. They are never mounted by a running process and never served, but they are also never deleted, so funds left in them remain recoverable from a backup.

**Nostr identity, contacts, settings, drafts, and the trade cache are not here.** They live in the browser's storage, scoped to the exact address the UI was opened at. This is the single most surprising thing about the package, and [Backups and Restore](#backups-and-restore) covers what it means.

## File Models

One: `store.json` on `main`.

| Key               | Holds                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `uiPassword`      | The password StartOS checks before any request reaches Chama. Unset until **Create UI Password** runs             |
| `bridgeAuthToken` | The bearer token the wallet bridge requires on every route. Generated by init whenever it is missing; never shown |

nginx's configuration and the entrypoint are baked into the image; only the bridge's `Authorization` header line is written at start, from the token.

## Dependencies

None. Chama needs no other service on the server.

The Fedimint federation a user joins is remote and chosen inside the application, so there is no federation to install, mount, or wait on locally.

## Network Access and Interfaces

One interface, plus one loopback port that is deliberately never exported.

| Interface | Id           | Type | Port | Protocol | Purpose                   |
| --------- | ------------ | ---- | ---- | -------- | ------------------------- |
| Chama     | `client-one` | ui   | 8080 | http     | The self-hosted Chama app |

It is bound on its own MultiHost, `client-one-host`, and is not masked. **StartOS's proxy gates it with HTTP Basic authentication** (username `admin`, the password from `store.json`, realm `Chama`) on every address, so neither the web app nor `/bridge/` answers anyone without the password. Until a password exists the gate accepts no credentials at all.

**The interface and host ids are frozen, and renaming them would cost users their data.** They read as artifacts of the retired multi-client topology, which makes them a tempting cleanup; the browser scopes identity, settings and the local trade cache to an origin, so changing either id hands every existing install a new origin and an apparently empty Chama. The port and the `/data/client-1` path are load-bearing for the same reason.

The wallet bridge listens on `127.0.0.1:8787` inside the container and is never exported. It requires `Authorization: Bearer <bridgeAuthToken>` on every route, `/health` included; nginx proxies `/bridge/` to it and supplies that header, so the browser never holds the token.

**One proxy timeout is set to an hour, on purpose.** The invoice path is a long poll held open until a human actually pays, so a read timeout there is a clock on the person, not on the bridge. At nginx's default it hung up during an ordinary scan-the-QR pause and returned its own 504 page, which the client read as a _rejected payment_.

## Installation and First-Run Flow

One step before the service will start: a critical task asks for **Create UI Password**. Running it generates the password and shows it with the username; the browser asks for both when Chama is opened. The bridge's token needs no step — init generates it.

What a fresh install still needs is done inside the application, not through StartOS: the user creates or imports a Nostr identity, then joins a Fedimint federation. **Until a federation is joined the wallet cannot receive or escrow ecash**, and no amount of StartOS-side configuration substitutes — this is the ordering constraint to know about.

Because the browser wallet is disabled in this build, the server's native bridge is the only wallet Chama will use, and it must be up before the service reports healthy.

## Actions

Two actions.

### Create UI Password / Reset UI Password

Generates the password StartOS asks for before it lets a browser reach Chama, stores it in `store.json`, and shows it with the username `admin`. Named **Create UI Password** until a password exists and **Reset UI Password** after.

- **When to run it:** on install (the critical task points here), and whenever the password is lost or should be changed.
- **What it changes:** the stored password. The proxy's gate picks up the new one without a restart; the old one stops working.
- **Cost:** immediate; runs whether or not the service is running.
- **Repeat safety:** each run replaces the password, so the action confirms first once one exists.
- **Outputs:** username (`admin`) and password, masked and copyable.

### Wallet Bridge Status

Reports what the wallet bridge itself says about its federation and its relay discovery, which is the one part of the wallet's condition that neither StartOS nor the web UI can show.

- **When to run it:** Chama loads, but balances, payments, or escrow are unavailable. It separates "the bridge is not answering" from "the bridge is fine but has not joined a federation" from "joined, but relay discovery is degraded" — three causes with one symptom.
- **What it changes:** nothing. It queries the bridge over loopback, with the bridge's token, and returns.
- **Cost:** immediate, with a short timeout on the bridge; the service is not interrupted.
- **Repeat safety:** read-only, safe to run as often as you like.
- **What happens next:** nothing — no restart, nothing to watch.
- **Outputs:** whether a federation is joined, and whether relay discovery is reachable, degraded, still probing, or not configured. A bridge that does not answer is reported as such rather than failing the action. A discovery state this package does not recognize is reported as unknown rather than guessed at, which is how a bridge newer than the package surfaces.

## Tasks

| Task               | Severity | Raised when                      | Cleared by                     |
| ------------------ | -------- | -------------------------------- | ------------------------------ |
| Create UI Password | critical | `store.json` has no `uiPassword` | running **Create UI Password** |

While it is open the service does not start.

## Health Checks

One check gating on both halves of the service.

| Check     | Displayed as | Probes                                | Grace Period |
| --------- | ------------ | ------------------------------------- | ------------ |
| `primary` | "Web App"    | UI port 8080 **and** bridge port 8787 | 30s          |

**Both ports are required, and that is the point.** A page served without a live bridge behind it looks healthy and fails every wallet call, so the UI alone is not evidence the service works. The failure message names which half is missing.

Reading a failure: during the grace period it means the bridge is still opening its wallet database, which is normal and needs no action. Persisting past it means the bridge failed to start or died — and since the supervisor exits when a child dies, a service that keeps restarting is reporting a bridge that cannot come up, not a slow one. Attach to `chama-sub` for the bridge's own output.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. Nothing is dumped or reconstructed, so a restore returns the wallet's files exactly as they were, retired `client-2`/`client-3` directories included, and `store.json` with them: the UI password and the bridge token survive a restore.

**What is excluded is the part users assume is included.** Nostr keys, contacts, settings, drafts and the trade cache live in the browser, not on the server, and no StartOS backup reaches them. A restored instance comes back with its ecash and none of its identity.

So a restore is only half the recovery. The user must re-import their Nostr account key in the browser, and must do it at the same address they used before: reaching the same install over LAN, over Tor, or on a custom domain gives the browser three different origins and therefore three different, separately-stored Chamas. Clearing browser data has the same effect as arriving from a new device.

## Limitations and Differences

1. **The browser wallet is disabled.** Upstream runs its Fedimint client in-browser as WebAssembly; this build forces the native bridge instead, so browser-only wallet behavior, and browser-only wallet bugs, do not apply here.
2. **Nostr identity and application settings are browser-side**, outside StartOS backups entirely, and do not follow a user between devices.
3. **Identity is scoped to the address the UI is opened at.** LAN and Tor are different origins and therefore different Chamas on the same install.
4. **Federations are joined inside the app.** There is no package-level federation setting, and no way to pre-seed one.
5. **Any single process failure restarts everything**, by design, rather than leaving a silently broken half.
6. **No configuration surface** — the only stored settings are the two credentials in `store.json`; there is nothing to tune.
7. **Retired `client-2` and `client-3` wallet directories are retained but never served** on installs old enough to have them.
8. **The UI is behind a StartOS password**, which upstream's web deployment does not have, and the wallet bridge requires its bearer token, which upstream leaves off for a loopback bridge.
9. **Only the web application is packaged.** Upstream's desktop and Android builds are outside this package's scope.

---

## Quick Reference for AI Consumers

```yaml
package_id: chama
image: built from ./Dockerfile against the chama/ submodule
architectures:
  - x86_64
  - aarch64
subcontainers:
  - chama-sub # nginx + native Fedimint bridge + entrypoint supervisor
volumes:
  main: /data # client-1/ active; client-2/, client-3/ retired, unserved
file_models:
  - store.json # main volume: uiPassword, bridgeAuthToken
startos_managed_env_vars:
  - CHAMA_BRIDGE_AUTH_TOKEN # from store.json bridgeAuthToken
dependencies: []
interfaces:
  client-one: { type: ui, port: 8080 } # MultiHost client-one-host; ids frozen; StartOS basic auth, user admin
actions:
  - set-ui-password # Create UI Password / Reset UI Password
  - wallet-status
tasks:
  - set-ui-password # critical, while no uiPassword
health_checks:
  - primary # displayed "Web App"; gates on UI 8080 and bridge 8787
```
