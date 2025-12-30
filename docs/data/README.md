# Features Digest Automation

This directory contains the source data for automatically generating the feature-digest.md file.

## Overview

The `features-digest-source.json` file contains structured data for all CKEditor 5 features. During the documentation build process, the `generate-features-digest.mjs` hook script automatically regenerates the content between the markers in `docs/features/feature-digest.md`.

## Workflow

### Adding a New Feature

1. Edit `features-digest-source.json`
2. Add your feature to the appropriate section/subsection
3. Run `pnpm run docs` (the generation happens automatically via hook)
4. Commit both the JSON and generated markdown file

### Updating an Existing Feature

1. Find the feature by its `id` in `features-digest-source.json`
2. Edit the description, link, or badge
3. Regenerate via `pnpm run docs`
4. Commit changes

### Manually Testing Generation

```bash
node scripts/docs/generate-features-digest.mjs
```

## JSON Schema

### Section Structure
```json
{
  "sections": [
    {
      "id": "section-id",
      "title": "Section Title",
      "description": "Section description...",
      "subsections": [...]
    }
  ]
}
```

### Subsection Types

#### 1. Subsection with Card Grid
Multiple features displayed in a card grid layout.

```json
{
  "id": "subsection-id",
  "title": "Subsection Title",
  "type": "subsection-with-grid",
  "description": "Description...",
  "features": [
    {
      "id": "feature-id",
      "title": "Feature Name",
      "badge": "premium" | null,
      "description": "Feature description...",
      "link": "{@link features/feature-name}"
    }
  ]
}
```

#### 2. Heading Badge (Simple)
Feature with badge, description, and single link.

```json
{
  "id": "feature-id",
  "title": "Feature Name",
  "type": "heading-badge",
  "badge": "premium" | "experiment",
  "description": "Feature description...",
  "link": "{@link features/feature-name}"
}
```

#### 3. Simple Feature
Basic feature with description and link.

```json
{
  "id": "feature-id",
  "title": "Feature Name",
  "type": "simple",
  "description": "Feature description...",
  "link": "{@link features/feature-name}"
}
```

#### 4. Single Card
Standalone card (not in grid).

```json
{
  "id": "feature-id",
  "title": "Feature Name",
  "type": "single-card",
  "badge": "premium" | null,
  "description": "Feature description...",
  "link": "{@link features/feature-name}"
}
```

## Known Limitations

### Special Heading-Badge Patterns (3 features)

The following features use a special pattern where a heading-badge is followed by embedded cards. These are not currently supported by the automation and must be manually maintained in the markdown file:

1. **Asynchronous collaboration** (`asynchronous-collaboration`) - Has heading-badge + description + single embedded card
2. **Comments** (`comments`) - Has heading-badge + description + card grid
3. **Content generation** (`content-generation`) - Has heading-badge + description + card grid

For these features, the content is manually maintained in `feature-digest.md` outside the automation markers.

### Future Enhancement

To fully automate these special cases, the extraction and generation scripts would need to be enhanced to support an optional `features` array on heading-badge types, allowing for embedded cards after the main description.

## Scripts

- **`scripts/docs/generate-features-digest.mjs`** - Hook script that generates markdown from JSON
- **`scripts/docs/extract-features-digest.mjs`** - One-time extraction tool to parse existing markdown into JSON

## Statistics

- **9 sections** (Core editing, Collaboration, Content conversion, Page management, Productivity, Configurations, Compliance, Customization, File management)
- **73 subsections**
- **76+ features** in card grids
- **~155 total features**
- **98% automation coverage** (3 special cases manually maintained)
