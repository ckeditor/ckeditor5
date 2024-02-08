---
category: installation
order: 12
menu-title: Quick Start (CDN)
meta-title: Quick Start (CDN) | CKEditor 5 documentation
meta-description: Learn the fastest way to install and use CKEditor 5 - the powerful, rich text WYSIWYG editor in your web application using npm.
modified_at: 2024-02-05
---

# Quick start (CDN)

Short description about this method.

## Obtain a license key

* Trial
* Buy

Steps with screenshots how to obtain a license key.

## CDN setup

1. Add a link for CSS

```html
<link rel="stylesheet" href="<CDN_LINK>/ckeditor5/dist/styles.css">
```

2. Add scripts with import maps

```html
<script type="importmap">
	{
	"imports": {
		"ckeditor5": "<CDN_LINK>/ckeditor5/dist/index.min.js",
		"ckeditor5/": "<CDN_LINK>/ckeditor5/",
	}
	}
</script>
```

3. Add a script with the editor initialization

```html
<script type="module">
	import { ClassicEditor, Essentials, Paragraph } from 'ckeditor5';
	import translations from 'ckeditor5/dist/translations/pl.js';

	await ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [
		Essentials,
		Paragraph,
	],
	toolbar: {
		items: [ 'undo', 'redo' ]
	},
	translations
	} );
</script>
```

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/getting-and-setting-data Getting and setting data} guide.
* Refer to the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
