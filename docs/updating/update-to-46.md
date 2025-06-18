---
category: update-guides
meta-title: Update to version 46.x | CKEditor 5 Documentation
menu-title: Update to v46.x
order: 78
modified_at: 2025-06-16
---

# Update to CKEditor&nbsp;5 v46.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	You may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v46.0.0

Released on xxx, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v46.0.0))

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v46.0.0.

### Major breaking changes in this release

#### Content area CSS variables renamed to --ck-content-* prefix

To improve consistency, all CSS variables that affect the styles of the editor content area ("content styles") have been renamed to use the `--ck-content-*` prefix. This change affects variables used for highlights, image captions, mentions, table captions, image style spacing, and todo list checkmarks.

| Old variable name                           | New variable name                                 |
|---------------------------------------------|---------------------------------------------------|
| `--ck-highlight-marker-yellow`                | `--ck-content-highlight-marker-yellow`               |
| `--ck-highlight-marker-green`                 | `--ck-content-highlight-marker-green`                |
| `--ck-highlight-marker-pink`                  | `--ck-content-highlight-marker-pink`                 |
| `--ck-highlight-marker-blue`                  | `--ck-content-highlight-marker-blue`                 |
| `--ck-highlight-pen-red`                      | `--ck-content-highlight-pen-red`                    |
| `--ck-highlight-pen-green`                    | `--ck-content-highlight-pen-green`                  |
| `--ck-color-image-caption-background`         | `--ck-content-color-image-caption-background`        |
| `--ck-color-image-caption-text`               | `--ck-content-color-image-caption-text`              |
| `--ck-color-mention-background`               | `--ck-content-color-mention-background`              |
| `--ck-color-mention-text`                     | `--ck-content-color-mention-text`                    |
| `--ck-color-selector-caption-background`      | `--ck-content-color-selector-caption-background`     |
| `--ck-color-selector-caption-text`            | `--ck-content-color-selector-caption-text`           |
| `--ck-image-style-spacing`                    | `--ck-content-image-style-spacing`                   |
| `--ck-inline-image-style-spacing`             | `--ck-content-inline-image-style-spacing`            |
| `--ck-todo-list-checkmark-size`               | `--ck-content-todo-list-checkmark-size`              |
| `--ck-table-of-contents-padding`               | `--ck-content-table-of-contents-padding`              |
| `--ck-table-of-contents-line-height`           | `--ck-content-table-of-contents-line-height`           |
| `--ck-table-of-contents-items-start-padding`    | `--ck-content-table-of-contents-items-start-padding`    |

**Migration:**
- Update your custom stylesheets, themes, and integrations to use the new variable names.
- The old variable names are no longer supported and will not have any effect.

Example:
```css
:root {
  --ck-content-highlight-marker-yellow: #fdfd77;
  --ck-content-color-image-caption-background: hsl(0, 0%, 97%);
}
```

### Minor breaking changes in this release
