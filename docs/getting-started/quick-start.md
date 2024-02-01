---
category: installation
order: 10
menu-title: Quick Start
meta-title: Quick Start | CKEditor 5 documentation
meta-description: Learn the fastest way to install a powerful, rich text WYSIWYG editor - CKEditor 5 - in your web application using npm.
---

# Quick Start

CKEditor&nbsp;5 is a powerful, rich text editor you can embed in your web application. This guide will show you the fastest way to start using it.

## Try CKEditor&nbsp;5 builder

Check out our interactive builder to quickly get a taste of CKEditor&nbsp;5. It offers an easy-to-use user interface to help you configure, preview, and download the editor suited to your needs.

## Installing CKEditor&nbsp;5 using npm

First, install the necessary package. The below command will install the main CKEditor&nbsp;5 package containing all open-source plugins.

```bash
npm install ckeditor5
```

After that, you can import all the modules from the `ckeditor5` package. Additionally, you have to import CSS styles separately. **Importing and registering UI translations is optional for the English language.** For any other language, use imported translations, as in the example below.

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

That is all the code you need to see a bare-bone editor running in a web browser.

## Adding CKEditor&nbsp;5 premium features

All premium features are available in a separate package. You can install it similarly to the open-source one.

```bash
npm install ckeditor5-premium-features
```

Importing and registering these plugins is also analogous to the open-source ones. However, to use premium features, you need to activate them with a proper license key. Refer to the {@link support/license-key-and-activation License key and activation} guide for details.

```js
import { ClassicEditor, Essentials } from 'ckeditor5';
import { FormatPainter, SlashCommand } from 'ckeditor5-premium-features';

import 'ckeditor5/dist/styles.css';

ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [ Essentials, FormatPainter, SlashCommand ],
        toolbar: [ 'formatPainter' ],
        licenseKey: 'your-license-key'
    } )
    .catch( err => {
        console.error( err );
    } );
```

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/getting-and-setting-data following guide}.
* Refer to the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
