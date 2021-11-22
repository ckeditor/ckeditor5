
---
category: builds-migration
menu-title: Migration to v32.x
order: 93
modified_at: 2021-10-25
---

# Migration to CKEditor 5 v32.0.0

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

For the entire list of changes introduced in version 32.0.0, see the [changelog for CKEditor 5 v32.0.0](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md#3200-2021-10-25).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v32.0.0.

### Interactive content filtering in the {@link framework/guides/architecture/editing-engine#editing-pipeline editing pipeline}

#### Interactive attributes

Starting from v32.0.0, the editor engine will detect attributes that may interrupt the editing experience and rename them to `data-ck-unsafe-attribute-[original attribute name]`, for instance:

```html
<!-- Before v32 -->
<p onclick="alert( 'Paragraph clicked!' )">Interactive paragraph</p>

<!-- After v32 -->
<p data-ck-unsafe-attribute-onclick="alert( 'Paragraph clicked!' )">Interactive paragraph</p>
```

<info-box>
	Please keep in mind this new mechanism does not affect the {@link builds/guides/integration/saving-data data saved by the editor} (e.g. the output of `editor.getData()`). The filtering only applies during the editing when the user interacts with the editor.
</info-box>

If you are the author of a plugin that generates this kind of content in the {@link framework/guides/architecture/editing-engine#editing-pipeline editing pipeline} and you want it to be preserved, you can configure this when creating the element using {@link module:engine/view/downcastwriter~DowncastWriter} during the {@link framework/guides/architecture/editing-engine#conversion model–view conversion}. Methods such as {@link module:engine/view/downcastwriter~DowncastWriter#createContainerElement}, {@link module:engine/view/downcastwriter~DowncastWriter#createAttributeElement}, or {@link module:engine/view/downcastwriter~DowncastWriter#createEmptyElement} accept an option that will disable filtering of specific attributes:

```js
/* Before v32.0.0. */
const paragraph = writer.createContainerElement( 'p',
	{
		class: 'clickable-paragraph',
		onclick: 'alert( "Paragraph clicked!" )'
	}
);

/* After v32.0.0. */
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

Also, starting from v32.0.0, any `<script>` element that would find its way to the editing layer of the editor (and the user interacting with it) will be filtered out (renamed to `<span data-ck-unsafe-element="script"></span>`).

Please keep in mind that this mechanism will not change the output of the editor (e.g. the result of `editor.getData()` will include full `<script>...</script>` tags) and there is no way to opt out of it.
