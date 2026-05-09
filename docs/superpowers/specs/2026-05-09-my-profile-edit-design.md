# My Profile Edit Section — Design Spec

**Date:** 2026-05-09  
**Stack:** Next.js Pages Router · Tailwind CSS · NextAuth JWT · MongoDB/Prisma  
**Design System:** Dark Mode OLED · Rose accent #e11d48 · Inter font

---

## Goal

Add an inline "Edit Profile" experience to `/profile` so users can update their **display name** and **profile image** without leaving the page.

---

## Architecture

### API: `POST /api/user/profile`

New API route that handles profile updates (name and/or image). Authenticated via `getServerSession`. Calls `prisma.user.update` directly.

- Accepts JSON body: `{ name?: string, image?: string }`
- `image` is a base64 data URI (resized client-side to ≤ 200×200px before upload)
- Returns updated user fields: `{ name, image }`
- Validates: name must be non-empty string (max 60 chars); image must be valid data URI or null

### Auth Callbacks Update (`src/lib/auth.js`)

- `jwt` callback: persist `name` and `image` on the token so they survive session reads
- `session` callback: surface `session.user.image` and `session.user.name` from the JWT token
- After a profile update, the client calls NextAuth's `update()` to refresh the session in-place (no re-login required)

---

## Components

### `Avatar` (updated in `profile.js`)

- If `session.user.image` is set → render `<img>` with that src, same rounded shape
- If no image → keep initials fallback (current behaviour)
- Sizes: `lg` (96×96px), `sm` (40×40px for Header)

### Profile Hero (inline edit mode, in `profile.js`)

Two states toggled by a pencil-icon button next to the name:

**View mode** (default):
- Avatar → Name → Email → Sign-out button (unchanged layout)
- Pencil icon button beside the name to enter edit mode

**Edit mode:**
- Clickable avatar overlay (camera icon + "Change photo" label on hover) triggers hidden `<input type="file">`
- Name field: text input, dark glass style (`bg-white/5 border border-white/10`), auto-focused
- Two action buttons: **Save** (rose-600) and **Cancel** (ghost border)
- Client-side image resize via Canvas API before upload (≤ 200×200, JPEG 80%)

### Image Upload Flow (client-side, no cloud storage)

1. User clicks avatar → file picker opens (accept="image/*")
2. Selected file → drawn onto an offscreen 200×200 Canvas → `toDataURL('image/jpeg', 0.8)`
3. Preview shown immediately in the avatar circle
4. On **Save**: POST `{ name, image }` to `/api/user/profile`
5. On success: call `update({ name, image })` from `next-auth/react` to refresh JWT
6. On error: show inline error, revert preview

### Header (`src/components/Header.js`) — minor update

- Replace the text name display with a small avatar circle (40×40):
  - If `session.user.image` → show image
  - Else → initials circle (same rose gradient, smaller)
- Keep Sign Out button

---

## Design Tokens (matching existing page)

| Token | Value |
|---|---|
| Background | `#0a0a0a` / `#0d0d1a` |
| Card surface | `bg-white/5` |
| Border | `border-white/10` |
| Accent | `#e11d48` (rose-600) |
| Text primary | `text-white` |
| Text muted | `text-gray-400` |
| Transition | `duration-200` |
| Input focus | `focus:ring-2 focus:ring-rose-500 focus:border-transparent` |

---

## UX Rules Applied

- **Submit feedback**: button shows spinner during save; shows success checkmark briefly
- **Form labels**: `<label>` elements for all inputs (accessibility)
- **Image optimization**: client-side resize prevents sending huge payloads
- **Error feedback**: inline error message near the save button
- **Touch targets**: all buttons ≥ 44×44px
- **`prefers-reduced-motion`**: avatar overlay transition skips animation when reduced motion set
- **No layout shift**: edit mode expands in-place, stats pills stay below

---

## Error States

| Scenario | Behaviour |
|---|---|
| Name empty | Show "Name cannot be empty" below input; block save |
| Image too large (>5MB raw) | Show "Image too large, please choose a smaller file" |
| API failure | Show "Failed to save changes, please try again" toast |
| Unauthenticated | 401 from API; client redirects to /auth/login |

---

## Out of Scope

- Password change
- Email change (requires re-verification)
- Cloud image storage (Cloudinary/S3) — base64 in MongoDB is sufficient for avatar-sized images
- Social auth providers (OAuth)
