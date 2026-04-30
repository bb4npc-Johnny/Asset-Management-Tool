# Asset Management Website

A simple static asset management dashboard for tracking company devices, users, departments, status, condition, and return dates.

## Features

- Asset register table
- Add, edit, and delete assets
- Search assets
- Dashboard counters
- Local browser storage
- Works on GitHub Pages
- No backend required

## File Structure

```text
asset-management-website/
├── index.html
├── style.css
├── script.js
└── README.md
```

## How to Use with GitHub

1. Create a new repository on GitHub.
2. Upload these files to the repository.
3. Go to **Settings**.
4. Go to **Pages**.
5. Under **Build and deployment**, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
6. Save.
7. GitHub will give you a live website link.

## Important Note

This version stores data in the browser using `localStorage`.

That means:

- It is simple and works without a server.
- Data is saved only on the device/browser where it was entered.
- It is good for a small personal or internal tracker.
- It is not yet a multi-user company database.

For a larger company version, you would later add a backend such as Firebase, Supabase, or a custom database.
