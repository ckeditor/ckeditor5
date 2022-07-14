---
category: framework-plugins
order: 10
---

# Creating a basic plugin - timestamp

This guide will show you how to create a most basic plugin that will let users insert timestamps into their document. This is a beginner friendly tutorial, perfect for your first interactions with CKEditor 5 and its framework.

We’ll create a toolbar button that will insert the current date and time at the caret position in the document. If you want to see the final product of this tutorial before you plunge in, check out the [demo](#demo).

## Let's start

The easiest way to set up your project is to grab the starter files from our Github repository for this tutorial. We gathered all the necessary dependencies, including some CK Editor 5 packages and others needed to build the editor.

The editor is already created in `app.js` with some basic plugins. All you need to do is clone the repository, run `npm install`, and you can start coding right away.

The webpack is configured already, so use `npm run build` to build your application. Whenever you want to check something in the browser, save the changes and run build, then refresh the page in your browser (remember about the cache).

If you want to set up the project yourself, you should follow the steps listed in {@link framework/guides/quick-start the "Quick start" section}. Additionally, you'll need to install the [`@ckeditor/ckeditor5-core`](https://www.npmjs.com/package/@ckeditor/ckeditor5-core) package, which contains the {@link module:core/plugin~Plugin} class, and the [`@ckeditor/ckeditor5-ui`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui) package, which contains the UI library and framework.

We're going to write the whole plugin in your base `app.js` file. It should look like this (maybe with a couple of different imports if you chose to set up the environment yourself):

```js
// app.js

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic ],
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList' ]
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

Your `index.html` should look like this. The editor will load with HTML content you put in the `<div id="editor">`.

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>CKEditor 5 Framework – timestamp plugin</title>
	</head>
	<body>
		<div id="editor">
			<h2>Timestamp plugin</h2>
			<p>Press the timestamp button to insert the current date and time.</p>
		</div>

		<script src="dist/bundle.js"></script>
	</body>
</html>
```
## Creating a plugin

All features in the CKEditor 5 are introduced by plugins. In order to create our custom timestamp plugin, we need to import the {@link module:core/plugin~Plugin base `Plugin` class}.
You can now create a `Timestamp` class that extends `Plugin`. After we define it, we can add it into the editor's {@link module:core/editor/editorconfig~EditorConfig#plugins `config.plugins`} array.

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

class Timestamp extends Plugin {
    init() {
        console.log( 'Timestamp was initialized.' );
    }
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// Add the Timestamp plugin to config.plugins array.
		plugins: [
			Timestamp, Essentials, Paragraph, Heading, List, Bold, Italic
		],
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList' ]
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```
Rebuild and check in your console if the timestamp was initialized. You should see this:
SCREENSHOT

## Registering a toolbar button

CKEditor 5 has a rich UI library, from where we'll grab the {@link module:ui/button/buttonview~ButtonView `ButtonView`} class for our toolbar button.

Once we create a new instance of the `ButtonView`, we'll be able to customize it by setting its properties. We'll create a label, which will be visible on the button thanks to the {@link module:ui/button/buttonview~ButtonView#withText `withText`} property.

We need to register our button in the editor's UI {@link module:ui/componentfactory~ComponentFactory `componentFactory`}, so it can be displayed in the toolbar. We'll pass the name of the button in the {@link module:ui/componentfactory~ComponentFactory#add `componentFactory.add`} method, so we'll be able to add it into the {@link features/toolbar `config.toolbar`} array.

```js
// ...
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

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
		plugins: [
			Timestamp, Essentials, Paragraph, Heading, List, Bold, Italic
		],
		// Add the Timestamp button to the config.toolbar array.
		toolbar: [
			'timestamp', 'heading', 'bold', 'italic', 'numberedList', 'bulletedList'
		]
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );

```
You should be able to see the timestamp button now. It doesn't do anything just yet, so let's change that.

## Inserting a timestamp

We can now define the core functionality of our plugin, the action that should be executed once our button is clicked.

When we want to insert something into the document structure, we need to {@link framework/guides/architecture/editing-engine#changing-the-model change the model} using the model's `change()` method. This way we get access to {@link module:engine/model/writer~Writer the model writer}.

<info-box>
	What is the model? It's a DOM-like structure, that is converted into the view, which is what the user interacts with. If you want to learn more, you can read more about {@link framework/guides/architecture/editing-engine#model the model} and {@link framework/guides/architecture/editing-engine#view the view}.
</info-box>

We'll use the {@link module:engine/model/writer~Writer#insertContent `writer.insertContent()`} method to insert our timestamp into the document. Inside, we just need to create a new text node with {@link module:engine/model/writer~Writer#createText `writer.createText()`}.

```js
class Timestamp extends Plugin {
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'timestamp', locale => {
			//...

			//Execute a callback function when the button is clicked
			button.on( 'execute', () => {
				const now = new Date();

				//Change the model using the model writer
				editor.model.change( writer => {

					//Insert the text at the user's current position
					editor.model.insertContent( writer.createText( now.toString() ) );
				} );
			} );

			return button;
		} );
	}
}
```

Well done! Your timestamp plugin is now ready.

What's next? You can read more about the {@link framework/guides/overview CKEditor 5 framework}, or continue with our next tutorial, where we'll create {@link framework/guides/simple-plugin-tutorial/abbreviation-plugin-level-1 an abbreviation plugin}.

## Demo

{@snippet framework/timestamp-plugin}

## Full code

If you got lost at any point, see the final implementation of the plugin. You can paste the code from `app.js`, or clone and install the whole thing, and it will run out-of-the-box.
