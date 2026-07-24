# Database (Prisma 7 + Neon Postgres)

Foundrie's relational metadata layer. PostgreSQL stores ownership, relationships, statuses, and generated text records; Vercel Blob stores large binary artifacts.

## Connections

| Variable | Endpoint | Used by |
| --- | --- | --- |
| `DATABASE_URL` | pooled (`-pooler`) | Application runtime (all queries via `db`) |
| `DIRECT_URL` | direct (no pooler) | Prisma CLI only (migrate, db push, studio) |

### First-time setup

```bash
npm install            # also runs `prisma generate` via postinstall
npm run db:migrate     # applies prisma/migrations/** to the database
```

`prisma migrate dev` connects over **direct TCP on port 5432**.

### ISP/Fiber Router Blocking Port 5432 — Full Case Study & Workaround

> **Context:** This issue was encountered and fully resolved on June 15, 2026 on a **Huawei HG8546M** GPON fiber ONT (Parrot Security OS, Safaricom/Zuku fiber line, Nairobi/Juja, Kenya).

#### What happened

The fiber ONT (router) was replaced by the ISP after the original unit failed. Migrations that worked on the old unit started failing with `P1001: Can't reach database server` on the new one.

#### Root cause

The actual blocker is the **ISP's upstream DPI (Deep Packet Inspection) middlebox**, applied via a **TR-069 remote provisioning profile**.

The block operates at the protocol level, not the IP level:
```
Your machine
    ↓  TCP SYN  (allowed — handshake completes)
ISP DPI box
    ↓  Inspects packet payload, identifies Postgres wire protocol
    ✗  RST / session reset  (Postgres never actually responds)
Neon endpoint
```

#### How to confirm it is the ISP (not your code or Neon)

```bash
nc -vz -w 8 ep-xxxx.region.aws.neon.tech 5432
```
If fiber fails and mobile succeeds, the ISP is blocking the port.

#### Immediate workaround — Cloudflare WARP

Since the ISP's upstream provider uses DPI to block Postgres traffic, we tunnel all traffic using Cloudflare WARP. This encrypts the traffic and bypasses the DPI rules.
**This is the exact reason `warp-wizard` was created: to automate this setup on any machine.**
