---
category: update-guides
meta-title: Update to version 46.x | CKEditor 5 Documentation
menu-title: Update to v46.x
order: 78
modified_at: 2025-06-24
---

# Update to CKEditor&nbsp;5 v46.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	You may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v46.0.0

Released on xxx, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v46.0.0))

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v46.0.0.


## Release highlights

CKEditor 5 v46.0.0 brings several major improvements and changes that enhance both the developer and end-user experience. This release includes significant API refinements, new features, and improvements to existing functionality.

### Line Height (⭐)

The new Line Height feature allows you to adjust the vertical spacing between lines of text, improving readability and visual harmony in your documents. This premium feature lets you set consistent line spacing across paragraphs and text blocks to enhance document accessibility and maintain visual hierarchy in your content.

### Remove Format improvements

Unneeded styles on block elements, such as tables and images, and General HTML Support nodes and attributes are finally eliminated when you hit the remove format button. The feature now cleans what it should, leaving the document structure untouched.

### List markers styling

Working with styled lists becomes more intuitive as list markers (bullets and numbers) now automatically inherit text styling properties. When you apply formatting to list text, the markers will match:

* Font size adjustments,
* Text color changes,
* Font weight modifications (bold, italic).

This improvement makes it easier to create visually consistent and professional-looking lists without additional configuration. This improvement also supports Multi-level lists.

**Important!** This behavior is enabled by default, which means you may experience content change when you load the content to the editor’s new version (for the better in our opinion). But if this is not something you expect, you can opt out.

### Markdown processor dependency refresh

The Markdown feature dependencies have been modernized with a switch to the `unified` ecosystem, replacing the previous `marked` / `turndown` implementation. This change brings more consistent and symmetrical HTML ↔ Markdown conversion. By adopting `remark` and `rehype` from the same family of tools, we have created a more reliable and maintainable implementation that will better serve your document processing needs.

### Unified exports & renames

This release is also about tidying up the rough edges that showed up after the big New Installation Method release (v42.0.0+). In cases where many helpers or methods from the framework’s APIs were used, some developers upgrading from v41-x to v42-x were greeted by the `does not provide an export named …` error. We addressed issues immediately as they were reported, but we knew it required a deeper are more comprehensive approach long-term.

We spent the last several months discussing how to prepare the CKEditor 5 API layer for the years to come. This release is the result of the rules we are introducing from now on:

* Every public API must be exported via the package’s `index.ts`.
* Every internal API must be marked as such explicitly with `@internal`.
* Exported names should follow a descriptive and unique naming pattern aligned with their purpose and context.
* There should be no `export default` or `export * from` statements in source files.

This resulted in:

* Adding re-exports if they were missing.
* Changing the names of items to be more descriptive and avoid collisions.
* If there were internal methods that were already exported but not tagged, we decided to keep them exported but with the addition of the `_` prefix. This way we keep them available, but we would love to know how you are using them.
* Also, we decided to use this occasion to clean up the code from `@deprecated` code that was stale for several years.

At the same time, we have developed an internal tooling to make sure guardrails are set for the future.

If your build throws errors after the update, search and replace the old names with the new ones from the update guide. **We have not changed the behavior of these APIs, just the names**.

<info-box info>
	Manually updating all these numerous imports could be time-consuming and error-prone. We recommend using the [tables with the changed import/export names](https://raw.githubusercontent.com/ckeditor/ckeditor5/refs/heads/master/docs/updating/nim-migration/migrating-exports.md) as context for tools such as Copilot, ChatGPT, or other LLM-based services that can automatically update all imports in your project.
</info-box>

Last but not least, this release put us on the clean and straight path towards the [deprecation of old installation methods](https://github.com/ckeditor/ckeditor5/issues/17779). Please let us know if you have any questions on GitHub or support channels.

### Opinionated default content styles and CSS renames

To improve the out-of-the-box experience and accessibility, we are introducing opinionated defaults for content styling. From this version, we ship a small defaults layer applied to `.ck-content`:

```css

:root {
--ck-content-font-family: Helvetica, Arial, Tahoma, Verdana, Sans-Serif;
--ck-content-font-size: medium;
--ck-content-font-color: #000;
--ck-content-line-height: 1.5;
}

.ck-content {
  font-family: var(--ck-content-font-family);
  font-size: var(--ck-content-font-size);
  color: var(--ck-content-font-color);
  line-height: var(--ck-content-line-height);
}
```

Those content styles are easily replaceable via CSS variable override. It is possible that you already style those things with more specific selectors. 

While working on this initiative, we decided to standardize the CSS naming, too. All older variables that applied to the content styles now share the consistent `--ck-content-*` prefix.

#### Content area CSS variables renamed to `--ck-content-*` prefix

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

#### Table-related CSS variables renamed for better clarity

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

### Comment threads improvements

We have introduced improvements to the `addCommandThread` command, which now supports creating comment threads on specified ranges. Additionally, it allows for creating a comment thread with an initial comment with the provided comment content.

#### Minor breaking change

The `AddCommandThreadCommand#isEnabled` property is no longer `false` when the current document selection is empty, as the command now allows for creating comment threads on custom ranges. If you previously used this property (for example, to provide a custom UI element), you should now use the observable `AddCommentThreadCommand#hasContent` property instead.

### Comments and suggestions annotations

We have introduced dedicated methods for an easier way to get specific annotations related to a comment or a suggestion and vice versa.


### Major breaking changes in this release

### Minor breaking changes in this release
