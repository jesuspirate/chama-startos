# Chama

## Documentation

- [Chama documentation](https://github.com/jesuspirate/chama#readme) — how trades, escrow, arbitration, and relays work.

## What you get on StartOS

One Chama web interface, and a Fedimint wallet that lives on your server rather than in your browser.

That wallet is the difference worth knowing about. Run Chama anywhere else and your ecash sits in browser storage, which vanishes if you clear your data or switch devices. Here it sits in a volume StartOS backs up.

## Getting set up

1. Run **Create UI Password** from the Actions tab and save the username and password it shows. Chama does not start until you have.
2. Open **Chama** from the Interfaces tab and sign in with that username and password when your browser asks.
3. Create a new Chama identity, or import your existing Nostr account key.
4. Choose your home community and join its Fedimint federation from inside Chama.
5. Save your Nostr account key somewhere safe.

Until you have joined a federation you can browse Chama, but your wallet cannot receive or escrow ecash.

While the wallet is starting up, Chama keeps you signed in and shows **Connecting**. If it fails, use **Reconnect**. On an account with a long trade history you may see **Checking your complete trade history…** for a while — reminders and attention counts appear once that finishes.

## Using Chama

### Web interface

Chama opens on your own marketplace: post offers, negotiate directly with the other trader, and settle through your federation, Lightning, or on-chain Bitcoin. A community arbiter is part of the escrow but only steps in when a trade needs help — the [technical overview](https://github.com/jesuspirate/chama/blob/main/chama-technical-overview.pdf) covers how that escrow is built if you want the detail.

**Open Chama at one address and stay on it.** Your identity, contacts, drafts, and settings are stored by your browser and tied to the exact address you used. Reaching the same server over LAN, over Tor, or through a custom domain gives you three separate, empty Chamas — the wallet on the server is shared, but nothing else is.

### Reset UI Password

Generates a new password for signing in to Chama and shows it, replacing the old one. Run it if you lose the password or want to change it; every browser then asks for the new one.

### Wallet Bridge Status

Run this when Chama loads but balances, payments, or escrow are unavailable. It reports whether your wallet is answering, whether it has joined a federation, and whether relay discovery is working — which tells you whether the problem is the wallet, the federation, or your relays.

It only reads. Nothing changes, and you can run it as often as you like.

## Limitations

**Your backup covers your money, not your identity.** StartOS backs up the ecash wallet on your server. Your Nostr account key, contacts, drafts, and settings are in your browser and are not included. Back up your Nostr key yourself, and store any exported ecash notes safely — the key restores who you are and what you traded, not the ecash itself.

**If your install once ran three Chama clients**, the second and third wallets are still on the server and in your backups, but are no longer shown anywhere. If you knowingly left ecash in one of them, export it before upgrading.
