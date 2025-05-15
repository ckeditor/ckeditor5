---
category: update-guides
meta-title: Update to version 31.x | CKEditor 5 Documentation
menu-title: Update to v31.x
order: 93
modified_at: 2021-11-03
---

# Update to CKEditor&nbsp;5 v31.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v31.1.0

_Released on December 7, 2021._

For the entire list of changes introduced in version 31.1.0, see the [release notes for CKEditor&nbsp;5 v31.1.0](https://github.com/ckeditor/ckeditor5/releases/tag/v31.1.0).

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v31.1.0.

### Interactive content filtering in the {@link framework/architecture/editing-engine#editing-pipeline editing pipeline}

#### Interactive attributes

Starting from v31.1.0, the editor engine will detect attributes that may interrupt the editing experience and rename them to `data-ck-unsafe-attribute-[original attribute name]`, for instance:

```html
<!-- Before v31.1.0 -->
<p onclick="alert( 'Paragraph clicked!' )">Interactive paragraph</p>

<!-- After v31.1.0 -->
<p data-ck-unsafe-attribute-onclick="alert( 'Paragraph clicked!' )">Interactive paragraph</p>
```

<info-box>
	This new mechanism does not affect the {@link getting-started/setup/getting-and-setting-data data saved by the editor} (for example, the output of `editor.getData()`). The filtering only applies during the editing when the user interacts with the editor.
</info-box>

If you are the author of a plugin that generates this kind of content in the {@link framework/architecture/editing-engine#editing-pipeline editing pipeline} and you want it to be preserved, you can configure this when creating the element using {@link module:engine/view/downcastwriter~DowncastWriter} during the {@link framework/architecture/editing-engine#conversion model–view conversion}. Methods such as {@link module:engine/view/downcastwriter~DowncastWriter#createContainerElement}, {@link module:engine/view/downcastwriter~DowncastWriter#createAttributeElement}, or {@link module:engine/view/downcastwriter~DowncastWriter#createEmptyElement} accept an option that will turn off filtering of specific attributes:

```js
/* Before v31.1.0. */
const paragraph = writer.createContainerElement( 'p',
	{
		class: 'clickable-paragraph',
		onclick: 'alert( "Paragraph clicked!" )'
	}
);

/* After v31.1.0. */
const paragraph = writer.createContainerElement( 'p',
	{
		class: 'clickable-paragraph',
		onclick: 'alert( "Paragraph clicked!" )'
	},
	{
		// Make sure the "onclick" attribute will pass through.
		renderUnsafeAttributes: [ 'onclick' ]
	}
);
```

#### Blocking script elements

Also starting from v31.1.0, any `<script>` element that would find its way to the editing layer of the editor (and the user interacting with it) will be filtered out (renamed to `<span data-ck-unsafe-element="script"></span>`).

This mechanism will not change the output of the editor. For example, the result of `editor.getData()` will include full `<script>...</script>` tags. There is no way to opt out of it.

### The `table` and `tableCell` attributes' names change

Names of the `table` elements' attributes have changed. A `table` prefix has been added to all the names.

The affected attributes include: `borderStyle`, `borderColor`, `borderWidth`, `backgroundColor`, `alignment`, `width`, and `height`.

These are now: `tableBorderStyle`, `tableBorderColor`, `tableBorderWidth`, `tableBackgroundColor`, `tableAlignment`, `tableWidth`, and `tableHeight`.

Names of the `tableCell` elements' attributes have changed. A `tableCell` prefix has been added to all the names.

The affected attributes include: `backgroundColor`, `padding`, `width`, `height`, `borderStyle`, `borderColor`, `borderWidth`, `verticalAlignment`, and `horizontalAlignment`.

These were changed to `tableCellBackgroundColor`, `tableCellPadding`, `tableCellWidth`, `tableCellHeight`, `tableCellBorderStyle`, `tableCellBorderColor`, `tableCellBorderWidth`, `tableCellVerticalAlignment`, and `tableCellHorizontalAlignment`.


## Update to CKEditor&nbsp;5 v31.0.0

_Released on October 26, 2021._

For the entire list of changes introduced in version 31.0.0, see the [release notes for CKEditor&nbsp;5 v31.1.0](https://github.com/ckeditor/ckeditor5/releases/tag/v31.1.0).

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v31.0.0.

### HTML embed commands

Starting from v31.0.0, the `'insertHtmlEmbed'` and `'updateHtmlEmbed'` commands are no longer available. They have been replaced with a new, unified command: `'htmlEmbed'`.

```js
/* Before v31.0.0. */

// Inserts an empty HTML embed.
editor.execute( 'insertHtmlEmbed' );

// Updates the content of a selected HTML embed.
editor.execute( 'updateHtmlEmbed', '<p>HTML string</p>' );

/* After v31.0.0. */

// Inserts an empty HTML embed.
editor.execute( 'htmlEmbed' );

// Inserts an HTML embed with some initial content.
editor.execute( 'htmlEmbed', '<b>Initial content</b>.' );

// Updates the content of a selected HTML embed.
editor.execute( 'htmlEmbed', '<b>New content.</b>' );
```

The `InsertHtmlEmbedCommand` and `UpdateHtmlEmbedCommand` classes have been removed, too. Use the `HtmlEmbedCommand` class for integration with the HTML embed feature.
