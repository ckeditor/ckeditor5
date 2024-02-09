---
category: installation
order: 10
menu-title: Quick Start (NPM)
meta-title: Quick Start | CKEditor 5 documentation
meta-description: Learn the fastest way to install and use CKEditor 5 - the powerful, rich text WYSIWYG editor in your web application using npm.
modified_at: 2024-02-05
---

# Quick Start (NPM)

CKEditor&nbsp;5 is a powerful, rich text editor you can embed in your web application. This guide will show you the fastest way to start using it.

## Try CKEditor&nbsp;5 builder

Check out our interactive builder to quickly get a taste of CKEditor&nbsp;5. It offers an easy-to-use user interface to help you configure, preview, and download the editor suited to your needs.

## Installing CKEditor&nbsp;5 using npm

First, install the necessary package. The command below will install the main CKEditor&nbsp;5 package containing all open-source plugins.

```bash
npm install ckeditor5
```

Now you can import all the modules from the `ckeditor5` package. Additionally, you have to import CSS styles separately.

**Importing and registering UI translations is optional for the English language.** For any other language, use imported translations, as in the example below.

```js
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
```

Pass the imported plugins inside the configuration to the {@link module:editor-classic/classiceditor~ClassicEditor#create `create()`} method. The first argument in this function is a DOM element for the editor placement, so you need to add it to your HTML page.

```html
<div id="editor">
	<h1>Hello from CKEditor 5!</h1>
</div>
```

That is all the code you need to see a bare-bone editor running in your web browser.

## Adding CKEditor&nbsp;5 premium features

All premium features are available as a separate package. You can install it the same as the open-source one.

```bash
npm install ckeditor5-premium-features
```

Importing and registering these plugins is also analogous to the open-source ones. However, to use premium features, you need to activate them with a proper license key. Refer to the {@link support/license-key-and-activation License key and activation} guide for details.

```js
import { ClassicEditor, Essentials } from 'ckeditor5';
import { FormatPainter, SlashCommand } from 'ckeditor5-premium-features';

import 'ckeditor5/dist/styles.css';

await ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, FormatPainter, SlashCommand ],
		toolbar: [ 'formatPainter' ],
		licenseKey: 'your-license-key'
	} )
	.catch( err => {
		console.error( err );
	} );
```

## Using CKEditor&nbsp;5 from CDN

// Will there be 2 CDN links? Which one we want to promote?

Short description about this method.

// If the premium one, what about the license key?

### Obtain a license key

* Trial?
* Buy?

// Do we want to show steps on how to obtain a license key?
Steps with screenshots how to obtain a license key.

// Do we already know what CDN links will look like?

### CDN setup

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
