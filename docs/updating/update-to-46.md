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

### Introduction of the default content styles

To improve the out-of-the-box experience and accessibility, we are introducing opinionated defaults for content styling. From this version, we ship a small defaults layer applied to `.ck-content`:

```css

:root {
  --ck-content-font-family: Helvetica, Arial, Tahoma, Verdana, Sans-Serif;
  --ck-content-font-size: medium;
  --ck-content-font-color: #000;
  --ck-content-line-height: 1.5;
  --ck-content-word-break: break-word;
}

.ck-content {
  font-family: var(--ck-content-font-family);
  font-size: var(--ck-content-font-size);
  color: var(--ck-content-font-color);
  line-height: var(--ck-content-line-height);
  word-break: var(--ck-content-word-break);
}
```

Those content styles are easily replaceable via CSS variable override. It is possible that you already style those things with more specific selectors but we recommend to use the variables from now on.
You can read more about the reasons in our [GitHub issue](https://github.com/ckeditor/ckeditor5/issues/18710).

**Migration:**
* If you notice that the new editor's content styling affected your content appearance, make sure to update your custom style sheet, and use the new variable names.

### Content area CSS variables renamed to `--ck-content-*` prefix

To improve consistency, all CSS variables that affect the styles of the editor content area ("content styles") have been renamed to use the `--ck-content-*` prefix. This change affects variables used for highlights, image captions, mentions, table captions, image style spacing, and to-do list checkmarks.

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
| `--ck-color-selector-caption-background`      | ⚠️ NEW NAME `--ck-content-color-table-caption-background`     |
| `--ck-color-selector-caption-text`            | ⚠️ NEW NAME `--ck-content-color-table-caption-text`           |
| `--ck-image-style-spacing`                    | `--ck-content-image-style-spacing`                   |
| `--ck-inline-image-style-spacing`             | `--ck-content-inline-image-style-spacing`            |
| `--ck-todo-list-checkmark-size`               | `--ck-content-todo-list-checkmark-size`              |
| `--ck-table-of-contents-padding`               | `--ck-content-table-of-contents-padding`              |
| `--ck-table-of-contents-line-height`           | `--ck-content-table-of-contents-line-height`           |
| `--ck-table-of-contents-items-start-padding`    | `--ck-content-table-of-contents-items-start-padding`    |

**Migration:**
* Update your custom style sheets, themes, and integrations to use the new variable names.
* The old variable names are no longer supported and will not have any effect.

Example:
```css
:root {
  --ck-content-highlight-marker-yellow: #fdfd77;
  --ck-content-color-image-caption-background: hsl(0, 0%, 97%);
}
```

### Table-related CSS variables renamed for better clarity

Some table-related CSS variables had improper naming with `-selector-` in their names, which was confusing and inconsistent. These variables have been renamed to use `-table-` for better clarity and consistency.

| Old variable name                           | New variable name                                 |
|---------------------------------------------|---------------------------------------------------|
| `--ck-color-selector-caption-highlighted-background` | `--ck-color-table-caption-highlighted-background` |
| `--ck-color-selector-column-resizer-hover`  | `--ck-color-table-column-resizer-hover`           |
| `--ck-color-selector-focused-cell-background` | `--ck-color-table-focused-cell-background`       |

**Migration:**
* Update your custom style sheets and themes to use the new variable names.
* The old variable names are no longer supported and will not have any effect.

Example:

```css
:root {
  --ck-color-table-caption-highlighted-background: hsl(52deg 100% 50%);
  --ck-color-table-column-resizer-hover: var(--ck-color-base-active);
  --ck-color-table-focused-cell-background: hsla(212, 90%, 80%, .3);
}
```

### Major breaking changes in this release

### Minor breaking changes in this release
