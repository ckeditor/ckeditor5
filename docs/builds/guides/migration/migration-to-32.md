
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

### Unsafe attribute filtering in the {@link framework/guides/architecture/editing-engine#editing-pipeline editing pipeline}

Starting from v32.0.0, the editor engine will detect attributes that may pose a risk to the users and rename them to `data-ck-unsafe-attribute-[original attribute name]`, for instance:

```html
<!-- Before v32 -->
<p onclick="alert( 'Paragraph clicked!' )">Interactive paragraph</p>

<!-- After v32 -->
<p data-ck-unsafe-attribute-onclick="alert( 'Paragraph clicked!' )">Interactive paragraph</p>
```

If you are the author of a plugin that generates this kind of content in the {@link framework/guides/architecture/editing-engine#editing-pipeline editing pipeline} and you want it to be preserved (e.g. because you know it is safe), you can configure this when creating the element
using {@link module:engine/view/downcastwriter~DowncastWriter} during the {@link framework/guides/architecture/editing-engine#conversion model–view conversion}. Methods such as {@link module:engine/view/downcastwriter~DowncastWriter#createContainerElement}, {@link module:engine/view/downcastwriter~DowncastWriter#createAttributeElement}, or {@link module:engine/view/downcastwriter~DowncastWriter#createEmptyElement} accept an option that will disable filtering of specific attributes:

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
