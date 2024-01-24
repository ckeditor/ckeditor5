---
category: installation
order: 10
menu-title: Quick Start
meta-title: Quick Start | CKEditor 5 documentation
meta-description: Learn how to install, integrate, configure, and develop CKEditor 5. Browse through the API documentation and online samples.
---

# Quick Start

This guide will show you the fastest way to start using CKEditor&nbsp;5.

## Try CKEditor&nbsp;5 builder

Check out the builder to quickly get a taste of CKEditor. It offers an easy-to-use UI to help you configure and download the editor suited to your needs.

## Installing CKEditor&nbsp;5 using npm

<info-box>

**Prerequisites**

* [Node.js](https://nodejs.org/) in version 18 or above
* An initialized Node.js project
* Basic familiarity with a terminal

</info-box>

Before running any command, make sure that your Node.js version is up-to-date. Also, check if you're in the proper working directory with the initialized Node.js project. Then, run the following command:

```bash
npm install ckeditor5
```

The command will install the CKEditor main open-source package alongside essential plugins. You can import all modules from the `ckeditor5` package. Additionally, you have to import UI translations and CSS styles separately.

```js
// ckeditor.js

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

Pass the imported plugins inside the configuration to the {@link module:editor-classic/classiceditor~ClassicEditor#create `create()`} method. The first argument in this function is a DOM element for the editor placement, so you need to add it to your HTML file.

```html
<!-- index.html -->

<div id="editor">
    <h1>Hello from CKEditor 5!</h1>
</div>
```

## Next steps

* After installing the editor, you can learn more about configuration in the {@link getting-started/setup/configuration setup} section.
* Check the {@link features/index Features} category of the documentation to learn more about individual features.
