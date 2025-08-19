---
category: update-guides
meta-title: Update to version 46.x | CKEditor 5 Documentation
menu-title: Update to v46.x
order: 78
modified_at: 2025-07-04
---

# Update to CKEditor&nbsp;5 v46.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	You may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v46.0.2

Released on 19 August, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v46.0.2))

This hotfix release resolves an issue where archived comment threads could incorrectly appear in the sidebar, ensuring they remain properly contained in the comments archive.

## Update to CKEditor&nbsp;5 v46.0.1

Released on 11 August, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v46.0.1))

#### Complete documentation redesign is here

We have prepared a new theme for our documentation to enhance its quality. The new look improves readability and addresses several accessibility issues for a better experience. The redesigned navigation bar gives more useful access to various sections of the documentation, making it easier to reference guides for all our products. Improved table of contents makes browsing and finding guides easier, paired with updated search functionality. Check out the new experience yourself!

#### The pagination plugin just got better

This release introduces a significant pagination update, along with numerous fixes. Page breaks are now calculated taking into account the content styles, bookmark markers, and with better tolerance calculation. Pagination now also finds the correct breakpoint for large tables of contents and images taller than the page.

#### Table handling with pagination and export to PDF

The pagination and export to PDF features now better support tables containing one or more paragraphs. Cell margins are now correctly applied in exported tables, which improves the precision of pagination rendering.

## Update to CKEditor&nbsp;5 v46.0.0

Released on 9 July, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v46.0.0))

CKEditor 5 v46.0.0 brings several major improvements and changes that enhance both the developer and end-user experience. This release includes significant API refinements, new features, and improvements to existing functionality. Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v46.0.0.

<info-box warning>
	This is a **major release** with significant amount of changes that may affect your CKEditor&nbsp;5 integration. We strongly encourage you to read the entire update guide to understand all the changes.

	Pay special attention to:
	* [Unified exports and renames in the editor API](#unified-exports-and-renames-in-the-editor-api): Many import/export names have changed
	* [Introduction of the default content styles](#introduction-of-the-default-content-styles): New default styling that may affect your content appearance

	These changes are designed to improve the long-term stability and maintainability of CKEditor&nbsp;5, but they require careful attention during the upgrade process.
</info-box>


### Line height feature (⭐)

The new {@link features/line-height line height} feature allows you to adjust the vertical spacing between lines of text, improving readability and visual harmony in your documents. This premium feature lets you set consistent line spacing across paragraphs and text blocks to enhance document accessibility and maintain visual hierarchy in your content.

### Remove Format improvements

Unneeded styles on block elements, such as tables and images, and General HTML Support nodes and attributes are finally eliminated when you hit the {@link features/remove-format remove format} button. The feature now cleans what it should, leaving the document structure untouched.

### List markers styling

Working with {@link features/lists#list-styles styled lists} becomes more intuitive as list markers (bullets and numbers) now automatically inherit text styling properties. When you apply formatting to list text, the markers will match:

* Font size adjustments,
* Text color changes,
* Font weight modifications (bold, italic).

This improvement makes it easier to create visually consistent and professional-looking lists without additional configuration. This improvement also supports {@link features/multi-level-lists multi-level lists}.

**Important!** This behavior is enabled by default, which means you may experience content change when you load the content to the editor’s new version (for the better in our opinion). But if this is not something you expect, {@link features/lists#disabling-marker-formatting you can opt out}.

### Markdown processor dependency refresh

The {@link features/markdown Markdown} feature dependencies have been modernized with a switch to the `unified` ecosystem, replacing the previous `marked` / `turndown` implementation. This change brings more consistent and symmetrical HTML ↔ Markdown conversion. By adopting `remark` and `rehype` from the same family of tools, we have created a more reliable and maintainable implementation that will better serve your document processing needs.

### Manual token refreshing

We have added the `config.cloudServices.autoRefresh` configuration property to disable the automatic token refresh mechanism. When it is set to `false`, the token must be refreshed manually.

This property opens up the ability to implement custom token handling if a certain use case requires this.

### Unified exports and renames in the editor API

This release is also about tidying up the rough edges that showed up after the big New Installation Method release (v42.0.0+). In cases where many helpers or methods from the framework’s APIs were used, some developers upgrading from v41.x to v42.x were greeted by the `does not provide an export named …` error. We addressed issues immediately as they were reported, but we knew it required a deeper are more comprehensive approach long-term.

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

If your build throws errors after the update, search and replace the old names with the new ones from the {@link updating/nim-migration/migrating-imports update guide}. **We have not changed the behavior of these APIs, just the names**.

<info-box info>
	Manually updating all these numerous imports could be time-consuming and error-prone. We recommend using the [tables with the changed import/export names](https://raw.githubusercontent.com/ckeditor/ckeditor5/refs/heads/master/docs/updating/nim-migration/migrating-imports.md) as context for tools such as Copilot, ChatGPT, or other LLM-based services that can automatically update all imports in your project.
</info-box>

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

### Multi-level list markup change

Due to work on fixing the [list markers formatting](https://github.com/ckeditor/ckeditor5/issues/5752), we changed the markup of the Multi-level list feature. This has no visual affect, but may trigger some automated tests issues. **There is no need to migrate content during the update.**

**Before:**
```html
<ol class="multi-level-list legal-list" style="list-style-type:none;">
	<li>
		<span class="multi-level-list__marker">1. </span>Foo bar
	</li>
</ol>
```

**After:**

```html
<ol class="multi-level-list legal-list" style="list-style-type:none;">
	<li>
		<span class="multi-level-list__marker"><span>1.</span>&nbsp;</span>Foo bar
	</li>
</ol>
```

### List item identification in editor data

The `data-list-item-id` attribute is now added to the `<li>` elements in the editor data to improve integration between the list feature and other editor features. This attribute provides a stable identifier for list items that remains consistent across data loads and saves, resolving issues with data stability and improving compatibility with external systems and diffing algorithms.

**Before:**
```html
<ul>
		<li>
				<p>First item</p>
				<p>Second paragraph</p>
		</li>
		<li>Another item</li>
</ul>
```

**After:**
```html
<ul>
		<li data-list-item-id="abc123">
				<p>First item</p>
				<p>Second paragraph</p>
		</li>
		<li data-list-item-id="def456">Another item</li>
</ul>
```

This change ensures that list items maintain consistent identifiers across editor sessions, improving the reliability of features that depend on list structure tracking. The attribute is automatically generated and maintained by the editor, requiring no action from developers.

If you need to export clean HTML without these IDs (for presentation purposes only), you can use the `skipListItemIds` option when calling `editor.getData()`:

```js
// Get data without list item IDs (for presentation only)
const cleanHtml = editor.getData({ skipListItemIds: true });
```

For more technical details, see [GitHub issue #18407](https://github.com/ckeditor/ckeditor5/issues/18407).

### Comments annotation styles standardization

The default styles for comments annotations have changed significantly. Previously, the defaults were set only on part of the comments UI, and the comments UI was affected by the main editor content styles. Now, we have introduced a standardized set of CSS variables that are applied to both the comments content and input field.

**New CSS variables introduced:**
- `--ck-comment-content-font-family`
- `--ck-comment-content-font-size`
- `--ck-comment-content-font-color`

These variables have default values based on the editor's UI styles, which may be different from styles you currently have set. Most notably, the default font color has changed from black `hsl(0, 0%, 0%)` to dark gray `hsl(0, 0%, 20%)` to match the rest of the editor UI.

**Migration:**
1. Review the comments appearance after updating the editor
2. If the new default styles do not match your design requirements, set custom values using the new CSS variables:

```css
:root {
	--ck-comment-content-font-family: "Your preferred font family";
	--ck-comment-content-font-size: 14px;
	--ck-comment-content-font-color: hsl(0, 0%, 0%); /* or your preferred color */
}
```

This change ensures consistent styling across all comments-related UI elements and provides better integration with the overall editor design system.

### Improved vertical spacing for paragraphs in lists and tables  

During the work on Line Height, we changed the behavior how paragraphs behave in lists and table cells. It was [a long-reported bug](https://github.com/ckeditor/ckeditor5/issues/11347) which caused a confusion for writers. We decided to solve it with opinionated content styles, and it may result in a **visual change** of your content after the update. If you are not satisfied with the result, you can revert the change in the CSS:

```css
.ck-content li > p:first-of-type {
		margin-top: revert;
	}


.ck-content li > p:only-of-type {
	margin-top: revert;
	margin-bottom: revert;
}

.ck-content table.table:not(.layout-table),
.ck-content figure.table:not(.layout-table) > table {
	> thead,
	> tbody {
		> tr {
			> td,
			> th {
				> p:first-of-type {
					margin-top: revert;
				}

				> p:last-of-type {
					margin-bottom: revert;
				}
			}
		}
	}
}
```

### Comment threads improvements

#### New thread command changes

We have introduced improvements to the `addCommandThread` command, which now supports creating comment threads on specified ranges. Additionally, it allows for creating a comment thread with an initial comment with the provided comment content.

##### Minor breaking change

The `AddCommandThreadCommand#isEnabled` property is no longer `false` when the current document selection is empty, as the command now allows for creating comment threads on custom ranges. If you previously used this property (for example, to provide a custom UI element), you should now use the observable `AddCommentThreadCommand#hasContent` property instead.

#### Comments and suggestions annotations

We have introduced dedicated methods for an easier way to get specific annotations related to a comment or a suggestion and vice versa.

### Major breaking changes in this release

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Assistant now uses the more advanced `gpt-4o` model by default, replacing the previous `gpt-3.5-turbo`. This update improves response quality and overall capabilities. Additionally, the default limit set by `max_tokens` parameter has been removed, allowing for better and more detailed responses. If you relied on the previous default settings and wish to continue using them, be sure to explicitly define the editor configuration entry `ai.openAi.requestParameters` to `{ model: 'gpt-3.5-turbo', max_tokens: 2000, stream: true }`.
* **[document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline)**: Content area CSS variables have been renamed to use the --ck-content-* prefix for better consistency in the Table of Contents feature. This requires action if you have overridden the variables. See the update guide for details.
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Removed vertical spacing in list items by resetting margins for `<p>` elements that are the child of a `<li>` element.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Removed vertical spacing in table cells by collapsing margins of <p> elements that are the only child of a `<td>` or `<th>` element.
* The editor now enforces default browser styles for text content in both the editing view and rendered output. This change may affect existing styling and layout, so any custom CSS overrides should be reviewed. See [#18710](https://github.com/ckeditor/ckeditor5/issues/18710) for details. The following CSS variables and their default values are now applied:
	* `--ck-content-font-family`: `Helvetica, Arial, Tahoma, Verdana, sans-serif`
	* `--ck-content-font-size`: `medium`
	* `--ck-content-font-color`: `#000` (_HEX instead of `hsl()` to ensure compatibility with email clients_)
	* `--ck-content-line-height`: `1.5`
	* `--ck-content-word-break`: `break-word`
* The default styles for comment annotations have changed to provide better consistency with the editor UI. A new set of CSS variables is now used to control the appearance of the comment content and input fields. These changes may affect the current appearance of comments in your integration, so please review them after updating. The following CSS variables are now applied:
	* `--ck-comment-content-font-family`
	* `--ck-comment-content-font-size`
	* `--ck-comment-content-font-color` (default changed from `hsl(0, 0%, 0%)` to `hsl(0, 0%, 20%)`)

	These variables default to values derived from the editor 's UI styles, and they may differ from your current settings. Customize these variables as needed to match your desired appearance.
* Content area CSS variables have been renamed to use the `--ck-content-*` prefix for better consistency in the Highlight, Image, List, and Table features. This requires action if you have overridden the variables. See the update guide for details.
* Table-related CSS variables with improper `*-selector-*` naming have been renamed to use `*-table-*` for better clarity. This requires action if you have overridden the variables. See the update guide for details.

### Minor breaking changes in this release

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The `AddCommandThreadCommand#isEnabled` property is no longer `false` when the current document selection is empty, as the command now allows for creating comment threads on custom ranges. If you previously used this property (for example, to provide a custom UI element), you should now use the observable `AddCommentThreadCommand#hasContent` property instead.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Removed the deprecated `DataApiMixin` function and `DataApi` interface. Their functionality is the part of the Editor class.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Removed `Batch#type` deprecated property.
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Removed `DocumentList`, `DocumentListProperties` and `TodoDocumentList` plugins. They were aliases for plugins `List`, `ListProperties` and `DocumentList` respectively.
* **[markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm)**: Migrated from `marked` and `turndown` to `remark` and `rehype` for improved extensibility and alignment with the modern Markdown ecosystem.
* **[markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm)**: Enabled the autolinking feature in Markdown when loading Markdown content into the editor.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Removed the deprecated `buttonView` property from buttons created with `FileDialogViewMixin`. Use the button object itself.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Removed the deprecated `mix` function.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Removed the deprecated `Locale#language` property. Use `Locale#uiLanguage` instead.ase
