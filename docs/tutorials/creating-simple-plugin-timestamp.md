---
category: tutorials
order: 10
meta-title: Creating a basic plugin tutorial | CKEditor 5 Documentation
modified_at: 2022-07-15
---

# Creating a basic plugin

This guide will show you how to create a simple, basic plugin that will let the users insert timestamps into their content. This is a beginner-friendly tutorial, perfect for your first interaction with the CKEditor 5 framework. While it is not necessary to be familiar with the {@link tutorials/crash-course/editor CKEditor 5 Crash course} to follow it, you should consider reading that one, too.

We will create a toolbar button that will insert the current date and time at the caret position into the document. If you want to see the final product of this tutorial before you plunge in, check out the [live demo](#demo) below.

<info-box>
	If you want to use this tutorial with CDN, follow the steps in the [Adapt this tutorial to CDN](#adapt-this-tutorial-to-cdn) section.
</info-box>

## Let's start!

The easiest way to get started is to grab the starter project using the commands below.

```bash
npx -y degit ckeditor/ckeditor5-tutorials-examples/timestamp-plugin/starter-files timestamp-plugin
cd timestamp-plugin

npm install
npm run dev
```

This will create a new directory called `timestamp-plugin` with the necessary files. The `npm install` command will install all the dependencies, and `npm run dev` will start the development server.

The editor with some basic plugins is created in the `main.js` file.

## Creating a plugin

All features in the CKEditor 5 are powered by plugins. To create our custom timestamp plugin, we need to import the base `Plugin` class from the `ckeditor5`. Be careful not to remove the other imports from this package.

```js
import {
	// Other imports
	Plugin
} from 'ckeditor5';
```

We can now create a `Timestamp` class that extends the basic `Plugin` class. After we define it, we can add it to the editor's plugins array.

```js
class Timestamp extends Plugin {
	init() {
		console.log( 'Timestamp was initialized.' );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: 'GPL', // Or '<YOUR_LICENSE_KEY>'.
		// Add the Timestamp plugin to config.plugins array.
		plugins: [
			Essentials, Paragraph, Heading, List, Bold, Italic, Timestamp
		]
	} );
```

The development server will refresh. The initialization of the timestamp plugin should be visible. You should see this in the browser (on the left) and the browser's development console (on the right):

{@img assets/img/timestamp-1.png Screenshot of the editor and the console showing 'Editor was initialized".}

## Registering a toolbar button

CKEditor 5 has a rich UI library. We will grab the `ButtonView` class for our toolbar button from there.

Once we create a new instance of `ButtonView`, we will be able to customize it by setting its properties. We will create a label, which will be visible on the button thanks to the `withText` property.

We also need to register our button in the editor's UI `componentFactory`, so it can be displayed in the toolbar. To do it, we will pass the name of the button in the `componentFactory.add` method, to be able to add it into the {@link getting-started/setup/toolbar toolbar} array.

```js
import { 
	// Other imports
	ButtonView
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

class Timestamp extends Plugin {
	init() {
		const editor = this.editor;
		// The button must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add( 'timestamp', () => {
			// The button will be an instance of ButtonView.
			const button = new ButtonView();

			button.set( {
				label: 'Timestamp',
				withText: true
			} );

			return button;
		} );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: 'GPL', // Or '<YOUR_LICENSE_KEY>'.
		plugins: [
			Essentials, Paragraph, Heading, List, Bold, Italic, Timestamp
		],
		// Add the Timestamp button to the config.toolbar array.
		toolbar: [
			'heading', 'bold', 'italic', 'numberedList', 'bulletedList', 'timestamp'
		]
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );

```

Now, you should be able to see the <kbd>Timestamp</kbd> button. It does not do anything just yet, so let's change that.

## Inserting a timestamp

We can now define the core functionality of our plugin &ndash; the action that should be executed once our button is clicked.

To insert anything into the document structure, we need to {@link framework/architecture/editing-engine#changing-the-model change the model} using the model's `change()` method. This way we get access to the model writer.

<info-box>
	What is the model? It is a DOM-like structure, that is converted into the view, which is the layer that the user interacts with. You can read more about {@link framework/architecture/editing-engine#model the model} and {@link framework/architecture/editing-engine#view the view} in dedicated guides.
</info-box>

We will use the `insertContent()` method to insert our timestamp into the document. Inside, we just need to create a new text node with the `writer.createText()` method.

```js
class Timestamp extends Plugin {
	init() {
		const editor = this.editor;
		// The button must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add( 'timestamp', () => {
			// The button will be an instance of ButtonView.
			const button = new ButtonView();

			button.set( {
				label: 'Timestamp',
				withText: true
			} );

			// Execute a callback function when the button is clicked.
			button.on( 'execute', () => {
				const now = new Date();

				// Change the model using the model writer.
				editor.model.change( writer => {

					// Insert the text at the user's current position.
					editor.model.insertContent( writer.createText( now.toString() ) );
				} );
			} );

			return button;
		} );
	}
}
```

Well done! You implemented a CKEditor 5 plugin. You should be able to click and see that it works.

## Demo

See the result in action.

{@snippet tutorials/timestamp-plugin}

## Full code

If you got lost at any point, see [the final implementation of the plugin](https://github.com/ckeditor/ckeditor5-tutorials-examples/tree/main/timestamp-plugin/final-project). You can paste the code from `main.js`, or clone and install the whole thing, and it will run out of the box.

## Adapt this tutorial to CDN

If you want to use the editor from CDN, you can adapt this tutorial by following these steps.

First, clone the repository the same way as before. But do not install the dependencies. Instead, open the `index.html` file and add the following tags:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>CKEditor 5 Framework – tutorial CDN</title>
		<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
	</head>
	<body>
		<div id="editor">
			<p>Hello world!</p>
		</div>
		<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.umd.js"></script>

		<script type="module" src="/main.js"></script>
	</body>
</html>
```

The CSS file contains the editor and content styles. Therefore, you do not need to import styles into your JavaScript file.

```js
// Before:
import 'ckeditor5/ckeditor5.css';

// After:
// No need to import the styles.
```

The script tag loads the editor from the CDN. It exposes the global variable `CKEDITOR`. You can it in your project to access the editor class and plugins. That is why you must change the import statements to destructuring in the JavaScript files:

```js
// Before:
import { ClassicEditor, Essentials, Bold, Italic, Paragraph } from 'ckeditor5';

// After:
const { ClassicEditor, Essentials, Bold, Italic, Paragraph } = CKEDITOR;
```

After following these steps and running the `npm run dev` command, you should be able to open the editor in browser.

<info-box>
	**What's next**

	If you want to continue learning, move on to our more advanced tutorials, where we will create {@link tutorials/abbreviation-plugin-tutorial/abbreviation-plugin-level-1 an abbreviation plugin} or read more about the {@link framework/index CKEditor 5 framework}.
</info-box>
