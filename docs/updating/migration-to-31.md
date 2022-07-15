
---
category: updating
menu-title: Migration to v31.x
order: 93
modified_at: 2021-11-03
---

# Migration to CKEditor 5 v31.x

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Migration to CKEditor 5 v31.1.0

For the entire list of changes introduced in version 31.1.0, see the [changelog for CKEditor 5 v31.1.0](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md#3110-2021-12-03).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v31.1.0.

### Interactive content filtering in the {@link framework/guides/architecture/editing-engine#editing-pipeline editing pipeline}

#### Interactive attributes

Starting from v31.1.0, the editor engine will detect attributes that may interrupt the editing experience and rename them to `data-ck-unsafe-attribute-[original attribute name]`, for instance:

```html
<!-- Before v31.1.0 -->
<p onclick="alert( 'Paragraph clicked!' )">Interactive paragraph</p>

<!-- After v31.1.0 -->
<p data-ck-unsafe-attribute-onclick="alert( 'Paragraph clicked!' )">Interactive paragraph</p>
```

<info-box>
	Please keep in mind, that this new mechanism does not affect the {@link installation/advanced/saving-data data saved by the editor} (e.g. the output of `editor.getData()`). The filtering only applies during the editing when the user interacts with the editor.
</info-box>

If you are the author of a plugin that generates this kind of content in the {@link framework/guides/architecture/editing-engine#editing-pipeline editing pipeline} and you want it to be preserved, you can configure this when creating the element using {@link module:engine/view/downcastwriter~DowncastWriter} during the {@link framework/guides/architecture/editing-engine#conversion model–view conversion}. Methods such as {@link module:engine/view/downcastwriter~DowncastWriter#createContainerElement}, {@link module:engine/view/downcastwriter~DowncastWriter#createAttributeElement}, or {@link module:engine/view/downcastwriter~DowncastWriter#createEmptyElement} accept an option that will disable filtering of specific attributes:

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

Please keep in mind that this mechanism will not change the output of the editor (e.g. the result of `editor.getData()` will include full `<script>...</script>` tags) and there is no way to opt out of it.

### The `table` and `tableCell` attributes' names change

Names of the `table` elements' attributes have changed. A `table` prefix has been added to all the names.

The affected attributes include: `borderStyle`, `borderColor`, `borderWidth`, `backgroundColor`, `alignment`, `width` and `height`.

These are now respectively: `tableBorderStyle`, `tableBorderColor`, `tableBorderWidth`, `tableBackgroundColor`, `tableAlignment`, `tableWidth` and `tableHeight`.

Names of the `tableCell` elements' attributes have changed. A `tableCell` prefix has been added to all the names.

The affected attributes include: `backgroundColor`, `padding`, `width`, `height`, `borderStyle`, `borderColor`, `borderWidth`, `verticalAlignment` and `horizontalAlignment`.

These were changed to `tableCellBackgroundColor`, `tableCellPadding`, `tableCellWidth`, `tableCellHeight`, `tableCellBorderStyle`, `tableCellBorderColor`, `tableCellBorderWidth`, `tableCellVerticalAlignment` and `tableCellHorizontalAlignment` respectively.


## Migration to CKEditor 5 v31.0.0

For the entire list of changes introduced in version 31.0.0, see the [changelog for CKEditor 5 v31.0.0](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md#3100-2021-10-25).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v31.0.0.

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
