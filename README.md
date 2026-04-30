# Asset Management Website with Accounts, Database, and Live Updates

This is a simple asset management website that works from a GitHub repository and can be hosted with GitHub Pages.

It uses:

- GitHub Pages for hosting
- Supabase Auth for account creation and login
- Supabase Database for shared asset data
- Supabase Realtime so changes appear live for everyone

## File Structure

```text
asset-management-supabase/
├── index.html
├── style.css
├── script.js
├── config.js
├── database.sql
└── README.md
```

## What This Version Can Do

- Create accounts
- Login and logout
- Add assets
- Edit assets
- Delete assets
- Search assets
- Track who last updated an asset
- Show live changes to everyone using the site
- Store all asset data in a real shared database

## Step 1: Create a Supabase Project

1. Go to Supabase.
2. Create a new project.
3. Wait for the project to finish setting up.

## Step 2: Run the Database SQL

1. Open your Supabase project.
2. Go to **SQL Editor**.
3. Create a new query.
4. Copy everything from `database.sql`.
5. Run it.

This creates the `assets` table, security policies, and realtime support.

## Step 3: Enable Realtime

1. In Supabase, go to **Database**.
2. Go to **Replication** or **Realtime**.
3. Make sure the `assets` table is enabled for realtime.

The SQL file already tries to add the table to realtime, but it is still worth checking in the dashboard.

## Step 4: Add Your Supabase Keys

Open `config.js` and replace:

```js
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";
```

With your values from:

```text
Supabase Dashboard > Project Settings > API
```

Use:

- Project URL
- anon public key

The anon key is safe to use in frontend websites as long as Row Level Security is enabled.

## Step 5: Upload to GitHub

1. Create a new GitHub repository.
2. Upload all files.
3. Commit them to the `main` branch.

## Step 6: Enable GitHub Pages

1. Go to your GitHub repository.
2. Go to **Settings**.
3. Go to **Pages**.
4. Under **Build and deployment**, select:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Save.

GitHub will give you a live website URL.

## Important Security Note

This simple setup allows every logged-in user to view, add, edit, and delete assets.

That is good for a small trusted team.

For a larger company, you should later add roles such as:

- Admin
- IT staff
- Viewer
- Department manager

## Recommended Supabase Auth Setting

For easier testing, you can disable email confirmation:

```text
Supabase Dashboard > Authentication > Providers > Email
```

Turn off email confirmation if you want accounts to work immediately.

For real company use, keep email confirmation enabled.
