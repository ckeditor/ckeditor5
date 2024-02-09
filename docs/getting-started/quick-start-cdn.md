---
category: installation
order: 12
menu-title: Quick Start (CDN)
meta-title: Quick Start (CDN) | CKEditor 5 documentation
meta-description: Learn the fastest way to install and use CKEditor 5 - the powerful, rich text WYSIWYG editor in your web application using npm.
modified_at: 2024-02-05
---

# Quick start (CDN)

// Will there be 2 CDN links? Which one we want to promote?

Short description about this method.

// If the premium one, what about the license key?

## Obtain a license key

* Trial?
* Buy?

// Do we want to show steps on how to obtain a license key?
Steps with screenshots how to obtain a license key.

// Do we already know what CDN links will look like?

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
	import { ClassicEditor, Essentials, Bold, Italic, Heading, Paragraph } from 'ckeditor5';
	// import translations from 'ckeditor5/dist/translations/es.js';

	import 'ckeditor5/dist/styles.css';

	await ClassicEditor
		.create( document.querySelector( '#editor' ), {
			plugins: [ Essentials, Bold, Italic, Heading, Paragraph ],
			toolbar: {
				items: [ 'undo', 'redo', '|', 'heading', '|', 'bold', 'italic' ]
			},
			// translations
		} )
		.catch( err => {
			console.error( err );
		} );
</script>
```

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/getting-and-setting-data Getting and setting data} guide.
* Refer to the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
