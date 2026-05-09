# My Profile Edit Section — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an inline edit experience to `/profile` so users can update their display name and profile image (stored as base64 in MongoDB).

**Architecture:** A new `POST /api/user/profile` route validates and persists name/image changes via Prisma. Auth callbacks in `src/lib/auth.js` are updated to carry `name` and `image` through the JWT so the session reflects edits without re-login. The profile page gains edit-mode state with a Canvas-based client-side image resize before upload.

**Tech Stack:** Next.js 15 Pages Router · NextAuth v4 · Prisma/MongoDB · Tailwind CSS v4 · `@tabler/icons-react`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/auth.js` | Modify | Persist `name` + `image` in JWT; handle `update()` trigger |
| `src/pages/api/user/profile.js` | Create | POST handler: validate + update name/image via Prisma |
| `src/pages/profile.js` | Modify | Avatar with real image; edit-mode UI; Canvas resize; save handler |
| `src/components/Header.js` | Modify | MiniAvatar component; show profile image or initials |

---

## Task 1 — Update auth callbacks to carry name + image in the JWT

**Files:**
- Modify: `src/lib/auth.js`

The `jwt` callback currently only sets `id` on the token at sign-in. We need to also set `name` and `image`, and handle the `trigger: "update"` event that fires when the client calls NextAuth's `update()` function after a profile save. The `session` callback needs to surface these fields.

- [ ] **Step 1: Replace the `callbacks` block in `src/lib/auth.js`**

Open `src/lib/auth.js`. Find the `callbacks` block (lines 65–89). Replace it entirely with:

```js
callbacks: {
  async jwt({ token, user, account, trigger, session }) {
    // Initial sign in — seed token from the user object
    if (account && user) {
      return {
        ...token,
        id: user.id,
        name: user.name ?? token.name,
        image: user.image ?? null,
      };
    }

    // Client called update({ name, image }) — refresh token fields
    if (trigger === "update" && session) {
      if (session.name !== undefined) token.name = session.name;
      if (session.image !== undefined) token.image = session.image;
      return token;
    }

    return token;
  },
  async session({ session, token }) {
    if (token) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.image = token.image ?? null;
    }
    return session;
  },
},
```

Remove the `refreshAccessToken` function call logic from the old `jwt` callback (the `if (Date.now() < token.accessTokenExpires)` branch and the call to `refreshAccessToken(token)` — keep the `refreshAccessToken` function itself at the bottom of the file since it exists in the codebase, just no longer called from `jwt`).

- [ ] **Step 2: Verify the dev server starts without errors**

```bash
cd /path/to/worktree && npm run dev 2>&1 | head -20
```

Expected: `✓ Ready in` — no TypeScript/import errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.js
git commit -m "feat: carry name and image through NextAuth JWT callbacks"
```

---

## Task 2 — Create `POST /api/user/profile` route

**Files:**
- Create: `src/pages/api/user/profile.js`

This route accepts `{ name, image }` in the JSON body, validates both fields, then calls `prisma.user.update`. The `image` field is a base64 data URI string (already resized client-side) or `null` to clear it.

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p src/pages/api/user
```

Create `src/pages/api/user/profile.js` with the following content:

```js
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { name, image } = req.body ?? {};

  // Validate name
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ message: "Name cannot be empty" });
  }
  if (name.trim().length > 60) {
    return res.status(400).json({ message: "Name must be 60 characters or fewer" });
  }

  // Validate image (if provided)
  if (image !== undefined && image !== null) {
    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      return res.status(400).json({ message: "Invalid image format" });
    }
    // base64 length * 0.75 ≈ bytes — reject anything over 5 MB
    if (image.length * 0.75 > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "Image too large" });
    }
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        ...(image !== undefined ? { image: image ?? null } : {}),
      },
      select: { name: true, image: true },
    });

    return res.status(200).json(updated);
  } catch (e) {
    console.error("Profile update error:", e);
    return res.status(500).json({ message: "Failed to save changes, please try again." });
  }
}
```

- [ ] **Step 2: Smoke-test the route manually**

With the dev server running and a valid session cookie, run:

```bash
curl -s -X POST http://localhost:3000/api/user/profile \
  -H "Content-Type: application/json" \
  -d '{"name":""}' | jq .
```

Expected: `{ "message": "Name cannot be empty" }` (400).

```bash
curl -s -X POST http://localhost:3000/api/user/profile \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User"}' | jq .
```

Without a valid session cookie this returns `{ "message": "Unauthorized" }` (401) — that is correct. End-to-end testing happens after the UI is wired.

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/user/profile.js
git commit -m "feat: add POST /api/user/profile route for name and image updates"
```

---

## Task 3 — Update `Avatar` to support real images

**Files:**
- Modify: `src/pages/profile.js` (the `Avatar` function only, lines 8–28)

The `Avatar` component currently only renders initials. We add an `image` prop: when set, render an `<img>` tag instead of the gradient circle.

- [ ] **Step 1: Replace the `Avatar` function in `src/pages/profile.js`**

Find the `Avatar` function (starts at line 8, ends at line 28). Replace it entirely:

```jsx
function Avatar({ name, image, size = "lg" }) {
  const sizeClass =
    size === "lg" ? "w-24 h-24 text-3xl" : "w-10 h-10 text-base";

  if (image) {
    return (
      <div
        className={`${sizeClass} rounded-full overflow-hidden ring-4 ring-rose-600/30 flex-shrink-0`}
      >
        <img
          src={image}
          alt={name ?? "Profile photo"}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-rose-600 to-rose-900 flex items-center justify-center font-bold text-white select-none ring-4 ring-rose-600/30 flex-shrink-0`}
    >
      {initials}
    </div>
  );
}
```

- [ ] **Step 2: Update the usage of `Avatar` in the Profile Hero JSX**

In the same file, find the line that renders `<Avatar name={session.user.name} size="lg" />` (around line 178). Update it to pass the image:

```jsx
<Avatar name={session.user.name} image={session.user.image} size="lg" />
```

- [ ] **Step 3: Verify in browser**

Visit `http://localhost:3000/profile` while logged in. The avatar should still show initials (no image stored yet). No visual regressions.

- [ ] **Step 4: Commit**

```bash
git add src/pages/profile.js
git commit -m "feat: update Avatar component to render real profile image when available"
```

---

## Task 4 — Add edit-mode state + Canvas image resize helper

**Files:**
- Modify: `src/pages/profile.js`

Add the state variables, the `resizeImageToDataURL` utility, and all event handlers. No JSX changes yet — those come in Task 5. This task keeps the diff focused and verifiable.

- [ ] **Step 1: Add Tabler icon imports to `src/pages/profile.js`**

At the top of the file, after the existing imports, add:

```js
import {
  IconPencil,
  IconCamera,
  IconCheck,
  IconX,
  IconLoader2,
} from "@tabler/icons-react";
```

- [ ] **Step 2: Add `resizeImageToDataURL` function above the `Profile` component**

Paste this function anywhere above `export default function Profile()`:

```js
function resizeImageToDataURL(file, maxPx = 200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new globalThis.Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = maxPx;
        canvas.height = maxPx;
        const ctx = canvas.getContext("2d");
        // Crop to square from center before scaling
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, maxPx, maxPx);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
```

- [ ] **Step 3: Update the `useSession` destructure to get `update`**

Find the existing line inside `Profile()`:

```js
const { data: session, status } = useSession();
```

Replace with:

```js
const { data: session, status, update } = useSession();
```

- [ ] **Step 4: Add edit-mode state variables inside the `Profile` component**

After the existing `useState` declarations (`watchlist`, `wlLoading`, `wlError`), add:

```js
const [editing, setEditing] = useState(false);
const [editName, setEditName] = useState("");
const [editImage, setEditImage] = useState(null); // base64 data URI or null
const [saving, setSaving] = useState(false);
const [saveError, setSaveError] = useState(null);
```

- [ ] **Step 5: Add the four event handlers inside `Profile`, before the `return`**

```js
const handleEditStart = () => {
  setEditName(session.user.name ?? "");
  setEditImage(null);
  setSaveError(null);
  setEditing(true);
};

const handleEditCancel = () => {
  setEditing(false);
  setEditName("");
  setEditImage(null);
  setSaveError(null);
};

const handleFileChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    setSaveError("Image too large, please choose a smaller file.");
    return;
  }
  setSaveError(null);
  try {
    const dataUrl = await resizeImageToDataURL(file);
    setEditImage(dataUrl);
  } catch {
    setSaveError("Could not process image, please try another file.");
  }
};

const handleSave = async () => {
  const trimmedName = editName.trim();
  if (!trimmedName) {
    setSaveError("Name cannot be empty.");
    return;
  }
  if (trimmedName.length > 60) {
    setSaveError("Name must be 60 characters or fewer.");
    return;
  }
  setSaving(true);
  setSaveError(null);
  try {
    const body = { name: trimmedName };
    if (editImage !== null) body.image = editImage;
    const res = await fetch("/api/user/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message ?? "Failed to save changes");
    }
    const updated = await res.json();
    await update({ name: updated.name, image: updated.image });
    setEditing(false);
    setEditImage(null);
  } catch (e) {
    setSaveError(e.message ?? "Failed to save changes, please try again.");
  } finally {
    setSaving(false);
  }
};
```

- [ ] **Step 6: Verify the page still renders (no runtime errors)**

```bash
# dev server should already be running
```

Open `http://localhost:3000/profile`. Page renders; no console errors. Edit mode not wired to the UI yet — that's Task 5.

- [ ] **Step 7: Commit**

```bash
git add src/pages/profile.js
git commit -m "feat: add profile edit state, resize helper, and save handler"
```

---

## Task 5 — Wire edit-mode UI into the Profile Hero JSX

**Files:**
- Modify: `src/pages/profile.js` (Profile Hero section, ~lines 168–206)

Replace the static avatar + name block with the two-state (view / edit) layout.

- [ ] **Step 1: Replace the inner flex row in the Profile Hero section**

Find this block inside the Profile Hero `<div>` (the `flex flex-col sm:flex-row` div that contains `<Avatar ...>` and the name/email/sign-out):

```jsx
<div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
  <Avatar name={session.user.name} image={session.user.image} size="lg" />

  <div className="flex-1 text-center sm:text-left">
    <p className="text-xs uppercase tracking-widest text-rose-400 font-semibold mb-1">
      Member
    </p>
    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
      {session.user.name}
    </h1>
    <p className="text-gray-400 text-sm mt-1">{session.user.email}</p>
  </div>

  <button
    onClick={() => signOut({ callbackUrl: "/auth/login" })}
    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 text-sm transition-all duration-200 cursor-pointer"
  >
    <SignOutIcon />
    Sign out
  </button>
</div>
```

Replace it with:

```jsx
<div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
  {/* Avatar — clickable overlay in edit mode */}
  <div className="relative group flex-shrink-0">
    <Avatar
      name={editing ? editName : session.user.name}
      image={editing ? (editImage ?? session.user.image) : session.user.image}
      size="lg"
    />
    {editing && (
      <>
        <label
          htmlFor="avatar-upload"
          className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center gap-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="Change profile photo"
        >
          <IconCamera className="w-6 h-6 text-white" />
          <span className="text-xs text-white font-medium">Change</span>
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />
      </>
    )}
  </div>

  {/* Name + email — or edit form */}
  <div className="flex-1 text-center sm:text-left min-w-0">
    <p className="text-xs uppercase tracking-widest text-rose-400 font-semibold mb-1">
      Member
    </p>

    {editing ? (
      <div>
        <label htmlFor="edit-name" className="sr-only">
          Display name
        </label>
        <input
          id="edit-name"
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          maxLength={60}
          autoFocus
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        />
        {saveError && (
          <p className="text-rose-400 text-sm mt-1" role="alert">
            {saveError}
          </p>
        )}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
          >
            {saving ? (
              <IconLoader2 className="w-4 h-4 animate-spin" />
            ) : (
              <IconCheck className="w-4 h-4" />
            )}
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={handleEditCancel}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white text-sm rounded-lg transition-all duration-200 cursor-pointer"
          >
            <IconX className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    ) : (
      <>
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            {session.user.name}
          </h1>
          <button
            onClick={handleEditStart}
            aria-label="Edit profile"
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            <IconPencil className="w-4 h-4" />
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-1">{session.user.email}</p>
      </>
    )}
  </div>

  {/* Sign out — hidden during edit mode */}
  {!editing && (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 text-sm transition-all duration-200 cursor-pointer"
    >
      <SignOutIcon />
      Sign out
    </button>
  )}
</div>
```

- [ ] **Step 2: Test the full edit flow in browser**

1. Open `http://localhost:3000/profile`
2. Click the pencil icon → edit mode opens; name input is auto-focused
3. Clear the name field and click Save → error "Name cannot be empty." appears below input
4. Type a name and click Save → spinner appears; on success the name updates in the hero and edit mode closes
5. Click the pencil icon again → enter edit mode; click the avatar → file picker opens
6. Select an image file → preview appears immediately in the avatar circle
7. Click Save → profile image persists (reload page to confirm)
8. Click Cancel → reverts to previous state with no changes

- [ ] **Step 3: Commit**

```bash
git add src/pages/profile.js
git commit -m "feat: add inline profile edit UI with image upload and name field"
```

---

## Task 6 — Update Header to show MiniAvatar

**Files:**
- Modify: `src/components/Header.js`

Add a `MiniAvatar` component at the top of `Header.js` and swap the plain text name for the avatar circle (linked to `/profile`).

- [ ] **Step 1: Add `MiniAvatar` component to `src/components/Header.js`**

Open `src/components/Header.js`. Below the imports, above `export default function Header()`, add:

```jsx
function MiniAvatar({ name, image }) {
  if (image) {
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-rose-600/30 flex-shrink-0">
        <img
          src={image}
          alt={name ?? "Profile"}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-600 to-rose-900 flex items-center justify-center text-xs font-bold text-white select-none ring-2 ring-rose-600/30 flex-shrink-0">
      {initials}
    </div>
  );
}
```

- [ ] **Step 2: Replace the session name span in the authenticated header state**

Find the authenticated block inside the `<div className="flex items-center space-x-3">`:

```jsx
<div className="flex items-center space-x-3">
  <span className="text-gray-300 text-sm hidden md:block truncate max-w-[120px]">
    {session.user.name}
  </span>
  <button
    onClick={handleSignOut}
    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200 cursor-pointer"
  >
    Sign Out
  </button>
</div>
```

Replace with:

```jsx
<div className="flex items-center space-x-3">
  <Link
    href="/profile"
    className="flex items-center gap-2 group"
    aria-label="My profile"
  >
    <MiniAvatar
      name={session.user.name}
      image={session.user.image}
    />
    <span className="text-gray-300 text-sm hidden md:block truncate max-w-[120px] group-hover:text-white transition-colors duration-200">
      {session.user.name}
    </span>
  </Link>
  <button
    onClick={handleSignOut}
    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200 cursor-pointer"
  >
    Sign Out
  </button>
</div>
```

- [ ] **Step 3: Verify in browser**

1. Visit any page while logged in
2. Header should show the mini avatar circle (initials or image) linked to `/profile`
3. After updating profile image in Task 5, the header should reflect the new image without page reload (session update propagates)

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.js
git commit -m "feat: show mini avatar with profile image in header"
```

---

## Task 7 — End-to-end verification

- [ ] **Step 1: Full flow test**

With the dev server running:

1. Log in at `http://localhost:3000/auth/login`
2. Navigate to `/profile` — pencil icon visible beside name
3. Click pencil → edit mode; name input focused
4. Change name → Save → name updates instantly in hero AND in header (no reload)
5. Click pencil again → click avatar overlay → pick a small JPG/PNG (< 5 MB)
6. Preview shows in avatar immediately
7. Click Save → image persists
8. Hard-reload the page (`Cmd+Shift+R`) → name and image still correct (stored in DB and JWT)
9. Try uploading a file > 5 MB → error "Image too large" shown inline, no API call made
10. Click pencil → change name to empty → error "Name cannot be empty" shown; Save blocked

- [ ] **Step 2: Mobile check (375px)**

Open DevTools, set viewport to 375 × 812. Verify:
- Edit form stacks vertically, Save/Cancel buttons reachable
- Avatar overlay "Change" label visible on tap
- No horizontal scroll

- [ ] **Step 3: Final commit**

```bash
git add -p  # review any outstanding changes
git commit -m "chore: finalize profile edit feature"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Edit name — Task 4+5
- ✅ Upload profile image — Task 4+5
- ✅ Canvas resize ≤ 200×200 JPEG 80% — Task 4
- ✅ POST /api/user/profile with validation — Task 2
- ✅ JWT carries name + image; `update()` refreshes in-place — Task 1+4
- ✅ Avatar with real image + initials fallback — Task 3
- ✅ Header mini avatar — Task 6
- ✅ Error states: empty name, file too large, API failure — Task 4+5
- ✅ Spinner during save, error message inline — Task 5
- ✅ Cancel reverts to previous state — Task 4+5
- ✅ Accessibility: `<label>` on inputs, `aria-label` on icon buttons, `role="alert"` on error — Task 5

**No placeholders present.** All code blocks are complete and directly usable.

**Type consistency:** `editImage` is `string | null` throughout; `session.user.image` is `string | null` from the JWT callback; `Avatar` receives `image?: string | null`; API returns `{ name: string, image: string | null }`.
