---
category: installation
order: 10
menu-title: Quick Start
meta-title: Quick Start | CKEditor 5 documentation
meta-description: Learn the fastest way to install a powerful, rich text WYSIWYG editor - CKEditor 5 - in your web application using npm.
---

# Quick Start

CKEditor&nbsp;5 is a powerful, rich text editor you can embed in your web app. This guide will show you the fastest way to start using it.

## Try CKEditor&nbsp;5 builder

Check out the builder to quickly get a taste of CKEditor&nbsp;5. It offers an easy-to-use user interface to help you configure and download the editor suited to your needs.

## Installing CKEditor&nbsp;5 using npm

<info-box>

**Prerequisites:**

* [Node.js](https://nodejs.org/) in version 18 or above.
* An initialized Node.js project.
* Basic familiarity with a terminal.

</info-box>

Before running any command, make sure that your Node.js version is up-to-date. Check if you are in the proper working directory with the initialized Node.js project. Then, run the following command:

```bash
npm install ckeditor5
```

The command will install the main CKEditor&nbsp;5 open-source package alongside essential plugins. You can import all the modules from the `ckeditor5` package. Additionally, you need to import UI translations and CSS styles separately.

```js
import { ClassicEditor, Essentials, Bold, Italic, Heading, Paragraph } from 'ckeditor5';
import translations from 'ckeditor5/dist/translations/en.js';

import 'ckeditor5/dist/styles.css';

await ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Bold, Italic, Heading, Paragraph ],
		toolbar: {
			items: [ 'undo', 'redo', '|', 'heading', '|', 'bold', 'italic' ]
		},
		translations
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

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/getting-and-setting-data following guide}.
* Refer to the {@link getting-started/setup/configuration detup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
