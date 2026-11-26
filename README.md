# SplitAm

Run ajo (esusu, adashi) with people you trust. SplitAm keeps the rotation, payments and payouts in one place the whole group can see, adds members by phone number even if they don’t have the app, and sends WhatsApp reminders so nobody has to chase anyone.

This repository is the web frontend. The API is a separate, private service.

## Features

- **Public landing page** explaining how ajo works on SplitAm, with sign up and sign in
- **Dashboard** with what you pay each round across every active ajo, and when you collect next
- **Groups** with invite codes, join approvals, members added by email or by phone (ghost members)
- **Ajo setup**: amount per hand, total rounds, frequency; members request hands, the admin approves, assigns and orders the rotation
- **Running an ajo**: round progress, who has paid, “I’ve paid”, mark paid for others, send the pot, WhatsApp reminders (manual or daily), shareable round summary
- **Activity log** of every action, visible to the whole group
- **Offline queue**: changes made without a connection sync when you’re back online
- Mobile-first layout with bottom tabs, bottom sheets and accessible confirm dialogs

## Tech

React 19 · Vite · Tailwind CSS v4 · React Router · Axios · Lucide icons

## Getting started

```bash
npm install
npm run dev
```

Set the API address in a `.env` file:

```
VITE_API_URL=https://your-api.example.com/api
```

## Project structure

```
src/
  components/
    ui/          Shared building blocks: Button, Field, Sheet, Avatar, Badge, ProgressRing, ...
    layout/      App navigation and offline banner
    landing/     Public landing page sections
    auth/        Sign in / sign up layout and rotation diagram
    dashboard/   Money card, group rows, join by code
    group/       Group header, members, join requests, activity, add people, start ajo
    ajo/         Ajo summary, your hands, requests, rotation, payments, share update
  hooks/         useAjoActions: every ajo mutation in one place
  lib/           Pure helpers: ajo calculations, formatting, session
  services/      API client, toast, confirm dialog, offline sync, auth
  pages/         Route-level screens
  styles/        Design tokens and global styles
```

Design decisions (colour, type, voice) are in [BRAND.md](BRAND.md).
