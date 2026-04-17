# Property Maintenance Dashboard v2

A modern, keyboard-first dashboard for managing property maintenance tickets with SLA tracking.

## Features

### Phase 1 - Core Dashboard ✅
- **Smart Inbox View** - List of all tickets with status badges, color-coded by urgency, and SLA countdown timers
- **Command Palette (Cmd+K)** - Quick actions: create ticket, assign vendor, change status, search tickets
- **Unit-Centric View** - Click any unit number to see all tickets for that property
- **Ticket Detail Panel** - Slide-over sidebar with full ticket details and one-click updates
- **Mobile-Optimized Technician View** - Simplified mobile interface with one-tap status updates

### Phase 2 - Polish & Deploy
- ✅ Dark mode support
- ⏳ Drag-and-drop ticket reordering (using @dnd-kit)
- ⏳ Railway deployment

## Tech Stack

- React + Vite
- Supabase for backend
- Tailwind CSS v4 for styling
- cmdk for command palette
- sonner for toast notifications
- date-fns for SLA calculations

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=https://jmkwrxtxfkvydjmlrmya.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Deploy to Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`

Or manually on the [Railway Dashboard](https://railway.app)

## Ticket Schema

- `id`: uuid (primary key)
- `unit`: text (e.g., "101", "2B")
- `issue_raw`: text (description of the issue)
- `status`: text (incoming, triaged, dispatched, completed, closed)
- `urgency`: text (LOW, MEDIUM, HIGH, EMERGENCY)
- `trade_type`: text (HVAC, Plumbing, Electrical, General, Other)
- `tenant_phone`: text
- `created_at`: timestamp

## SLA Rules

| Urgency | Response Time |
|---------|---------------|
| EMERGENCY | 1 hour |
| HIGH | 4 hours |
| MEDIUM | 24 hours |
| LOW | 72 hours |

## Keyboard Shortcuts

- `Cmd+K` / `Ctrl+K` - Open command palette
- Use arrow keys to navigate in command palette
- Enter to select action

## Quick Tour

1. **Smart Inbox** - Main dashboard showing all tickets with urgency colors and SLA timers
2. **Filter & Sort** - Filter by status, sort by SLA deadline/urgency/date
3. **Click a ticket** - Opens detail panel for editing
4. **Cmd+K** - Quick actions without navigating menus
5. **Toggle technician view** - Mobile-optimized view for field workers
