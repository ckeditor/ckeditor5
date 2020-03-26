---
category: framework-tutorials
order: 10
---

# Implementing a block widget

In this tutorial, you will learn how to implement a more complex CKEditor 5 plugin.

You will build a "Simple box" feature which will allow the user to insert a custom box with a title and body fields into the document. You will use the widget utilities and work with the model-view conversion in order to properly set up the behavior of this feature. Later on, you will create a UI which will allow for inserting new simple boxes into the document with the toolbar button.

<info-box>
	If you want to see the final product of this tutorial before you plunge in, check out the [demo](#demo).
</info-box>

<!-- TODO: and allow controlling simple box properties such as alignment and width. -->

## Before you start

While it is not strictly necessary to read the {@link framework/guides/quick-start Quick start} guide before going through this tutorial, it may help you to get more comfortable with CKEditor 5 Framework before you dive into this tutorial.

The tutorial will also reference various parts of the {@link framework/guides/architecture/intro CKEditor 5 architecture} section as you go. While reading them is not necessary to finish this tutorial, it is recommended to read these guides at some point to get a better understanding of the mechanisms used in this tutorial.

## Let's start

This guide assumes that you are familiar with npm and your project uses npm already. If not, see the [npm documentation](https://docs.npmjs.com/getting-started/what-is-npm) or call `npm init` in an empty directory and keep your fingers crossed.

First, install packages needed to build and set up a basic CKEditor 5 instance.

```bash
npm install --save \
	postcss-loader@3 \
	raw-loader@3 \
	style-loader@1 \
	webpack@4 \
	webpack-cli@3 \
	@ckeditor/ckeditor5-dev-utils \
	@ckeditor/ckeditor5-editor-classic \
	@ckeditor/ckeditor5-essentials \
	@ckeditor/ckeditor5-paragraph \
	@ckeditor/ckeditor5-heading \
	@ckeditor/ckeditor5-list \
	@ckeditor/ckeditor5-basic-styles \
	@ckeditor/ckeditor5-theme-lark
```

Create a minimal webpack configuration:

```js
// webpack.config.js

'use strict';

const path = require( 'path' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = {
	entry: './app.js',

	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: 'bundle.js'
	},

	module: {
		rules: [
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
				use: [ 'raw-loader' ]
			},
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
				use: [
					{
						loader: 'style-loader',
						options: {
							injectType: 'singletonStyleTag',
							attributes: {
								'data-cke': true
							}
						}
					},
					{
						loader: 'postcss-loader',
						options: styles.getPostCssConfig( {
							themeImporter: {
								themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
							},
							minify: true
						} )
					},
				]
			}
		]
	},

	// Useful for debugging.
	devtool: 'source-map',

	// By default webpack logs warnings if the bundle is bigger than 200kb.
	performance: { hints: false }
};
```

Create your project's entry point:

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

		// Expose for playing in the console.
		window.editor = editor;
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

And an `index.html` page:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>CKEditor 5 Framework – Implementing a simple widget</title>
	</head>
	<body>
		<div id="editor">
			<p>Editor content goes here.</p>
		</div>

		<script src="dist/bundle.js"></script>
	</body>
</html>
```

Finally, build your project:

```bash
p@m /workspace/creating-a-plugin> ./node_modules/.bin/webpack --mode development
Hash: a4a7cf092b8d69199848
Version: webpack 4.28.4
Time: 5467ms
Built at: 2019-01-15 10:49:01
        Asset      Size  Chunks                    Chunk Names
    bundle.js  3.52 MiB    main  [emitted]  [big]  main
bundle.js.map   3.2 MiB    main  [emitted]         main
Entrypoint main [big] = bundle.js bundle.js.map
[./app.js] 824 bytes {main} [built]
[./node_modules/webpack/buildin/global.js] (webpack)/buildin/global.js 472 bytes {main} [built]
[./node_modules/webpack/buildin/harmony-module.js] (webpack)/buildin/harmony-module.js 573 bytes {main} [built]
    + 904 hidden modules
```

And now see if everything worked well by opening the index page in your browser. You should see a CKEditor 5 instance like this:

{@img assets/img/tutorial-implementing-a-widget-1.png Screenshot of a classic editor initialized from source.}

## Plugin structure

Once the editor is up and running you can start implementing the plugin. The entire plugin code can be kept in a single file, however, it is recommended to split its "editing" and "UI" layers and create a master plugin which loads both. This way, you ensure better separation of concerns and allow for recomposing the features (e.g. picking the editing part of an existing feature but writing your own UI for it). All official CKEditor 5 plugins follow this pattern.

Additionally, you will split the code of commands, buttons and other "self-contained" components to separate files, too. In order not to mix up these files with your project's `app.js` and `webpack.config.js` files, create this directory structure:

```
├── app.js
├── dist
│   ├── bundle.js
│   └── bundle.js.map
├── index.html
├── node_modules
├── package.json
├── simplebox
│   ├── simplebox.js
│   ├── simpleboxediting.js
│   └── simpleboxui.js
│
│   ... the rest of plugin files goes here as well
│
└── webpack.config.js
```

Now define the 3 plugins.

First, the master (glue) plugin. Its role is to simply load the "editing" and "UI" parts.

```js
// simplebox/simplebox.js

import SimpleBoxEditing from './simpleboxediting';
import SimpleBoxUI from './simpleboxui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class SimpleBox extends Plugin {
	static get requires() {
		return [ SimpleBoxEditing, SimpleBoxUI ];
	}
}
```

Now, the remaining two plugins:

```js
// simplebox/simpleboxui.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class SimpleBoxUI extends Plugin {
	init() {
		console.log( 'SimpleBoxUI#init() got called' );
	}
}
```

```js
// simplebox/simpleboxediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class SimpleBoxEditing extends Plugin {
	init() {
		console.log( 'SimpleBoxEditing#init() got called' );
	}
}
```

Finally, you need to load the `SimpleBox` plugin in your `app.js` file:

```js
// app.js

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import SimpleBox from './simplebox/simplebox';                                 // ADDED

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials, Paragraph, Heading, List, Bold, Italic,
			SimpleBox                                                          // ADDED
		],
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList' ]
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );

		// Expose for playing in the console.
		window.editor = editor;
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

Rebuild your project, refresh the browser and you should see that the the `SimpleBoxEditing` and `SmpleBoxUI` plugins were loaded:

{@img assets/img/tutorial-implementing-a-widget-2.png Screenshot of a classic editor initialized from source with the "SimpleBoxEditing#init() got called" and "SimpleBoxUI#init() got called" messages on the console.}

## The model and the view layers

CKEditor 5 implements an MVC architecture and its custom data model, while still being a tree structure, does not map to the DOM 1:1. You can think about the model as about an even more semantical representation of the editor content, while the DOM is one of its possible representations.

<info-box>
	Read more about the {@link framework/guides/architecture/editing-engine#overview editing engine architecture}.
</info-box>

Since your simple box feature is meant to be a box with a title and description fields, define its model representation like this:

```html
<simpleBox>
	<simpleBoxTitle></simpleBoxTitle>
	<simpleBoxDescription></simpleBoxDescription>
</simpleBox>
```

### Defining the schema

You need to start with defining the model's schema. You need to define 3 elements and their types as well as allowed parent/children.

<info-box>
	Read more about the {@link framework/guides/architecture/editing-engine#schema schema}.
</info-box>

Update the `SimpleBoxEditing` plugin with this definition.

```js
// simplebox/simpleboxediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class SimpleBoxEditing extends Plugin {
	init() {
		console.log( 'SimpleBoxEditing#init() got called' );

		this._defineSchema();                                                  // ADDED
	}

	_defineSchema() {                                                          // ADDED
		const schema = this.editor.model.schema;

		schema.register( 'simpleBox', {
			// Behaves like a self-contained object (e.g. an image).
			isObject: true,

			// Allow in places where other blocks are allowed (e.g. directly in the root).
			allowWhere: '$block'
		} );

		schema.register( 'simpleBoxTitle', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'simpleBox',

			// Allow content which is allowed in blocks (i.e. text with attributes).
			allowContentOf: '$block'
		} );

		schema.register( 'simpleBoxDescription', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'simpleBox',

			// Allow content which is allowed in the root (e.g. paragraphs).
			allowContentOf: '$root'
		} );
	}
}
```

Defining the schema will not have any effect on the editor just yet. It is information which can be used by plugins and the editor engine to understand how actions like pressing the <kbd>Enter</kbd> key, clicking on an element, typing text, inserting an image, etc. should behave.

For the simple box plugin to start doing anything you need to define model-view converters. Do that now!

### Defining converters

Converters tell the editor how to convert the view to the model (e.g. when loading the data to the editor or handling pasted content) and how to render the model to the view (for editing purposes, or when retrieving the editor data).

<info-box>
	Read more about the {@link framework/guides/architecture/editing-engine#conversion model-view conversion}.
</info-box>

This is the moment when you need to think about how you want to render the `<simpleBox>` element and its children to the DOM (what the user will see) and to the data. CKEditor 5 allows converting the model to a different structure for editing purposes and a different one to be stored as "data" or exchanged with other applications when copy-pasting the content. However, for simplicity, use the same representation in both pipelines for now.

The structure in the view that you want to achieve:

```html
<section class="simple-box">
	<h1 class="simple-box-title"></h1>
	<div class="simple-box-description"></div>
</section>
```

Use the {@link module:engine/conversion/conversion~Conversion#elementToElement `conversion.elementToElement()`} method to define all the converters.

<info-box>
	You can use this high-level two-way converters definition because you define the same converters for the {@link framework/guides/architecture/editing-engine#data-pipeline data} and {@link framework/guides/architecture/editing-engine#editing-pipeline editing} pipelines.

	Later on you will switch to more fine-grained converters to get more control over the conversion.
</info-box>

You need to define converters for 3 model elements. Update the `SimpleBoxEditing` plugin with this code:

```js
// simplebox/simpleboxediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class SimpleBoxEditing extends Plugin {
	init() {
		console.log( 'SimpleBoxEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();                                              // ADDED
	}

	_defineSchema() {
		// ...
	}

	_defineConverters() {                                                      // ADDED
		const conversion = this.editor.conversion;

		conversion.elementToElement( {
			model: 'simpleBox',
			view: {
				name: 'section',
				classes: 'simple-box'
			}
		} );

		conversion.elementToElement( {
			model: 'simpleBoxTitle',
			view: {
				name: 'h1',
				classes: 'simple-box-title'
			}
		} );

		conversion.elementToElement( {
			model: 'simpleBoxDescription',
			view: {
				name: 'div',
				classes: 'simple-box-description'
			}
		} );
	}
}
```

Once you have converters, you can try to see the simple box in action. You have not defined a way to insert a new simple box into the document yet, so load it via the editor data. In order to do that, you need to modify the `index.html` file:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>CKEditor 5 Framework – Implementing a simple widget</title>

		<style>
			.simple-box {
				padding: 10px;
				margin: 1em 0;

				background: rgba( 0, 0, 0, 0.1 );
				border: solid 1px hsl(0, 0%, 77%);
				border-radius: 2px;
			}

			.simple-box-title, .simple-box-description {
				padding: 10px;
				margin: 0;

				background: #FFF;
				border: solid 1px hsl(0, 0%, 77%);
			}

			.simple-box-title {
				margin-bottom: 10px;
			}
		</style>
	</head>
	<body>
		<div id="editor">
			<p>This is a simple box:</p>

			<section class="simple-box">
				<h1 class="simple-box-title">Box title</h1>
				<div class="simple-box-description">
					<p>The description goes here.</p>
					<ul>
						<li>It can contain lists,</li>
						<li>and other block elements like headings.</li>
					</ul>
				</div>
			</section>
		</div>

		<script src="dist/bundle.js"></script>
	</body>
</html>
```

Rebuild your project and voila &mdash; that's your first simple box instance:

{@img assets/img/tutorial-implementing-a-widget-3.png Screenshot of a classic editor with an instance of a simple box inside.}

### What's in the model?

The HTML that you added to the `index.html` file is your editor's data. This is what `editor.getData()` would return. Also, for now, this also the DOM structure which is rendered by the CKEditor 5 engine in the editable region:

{@img assets/img/tutorial-implementing-a-widget-4.png Screenshot of a DOM structure of the simple box instance – it looks exactly like the data loaded into the editor.}

However, what's in the model?

To learn that, use the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector}. Once {@link framework/guides/development-tools#ckeditor-5-inspector#installing-the-inspector installed}, you need to load it in the `app.js` file:

```js
// app.js

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import SimpleBox from './simplebox/simplebox';

import CKEditorInspector from '@ckeditor/ckeditor5-inspector';                 // ADDED

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials, Paragraph, Heading, List, Bold, Italic,
			SimpleBox
		],
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList' ]
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );

		CKEditorInspector.attach( 'editor', editor );

		window.editor = editor;
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

After rebuilding your project and refreshing the page you will see the inspector:

{@img assets/img/tutorial-implementing-a-widget-4b.png Screenshot of a the simple box widget's structure displayed by CKEditor 5 inspector.}

You will see the following HTML-like string:

```html
<paragraph>[]This is a simple box:</paragraph>
<simpleBox>
	<simpleBoxTitle>Box title</simpleBoxTitle>
	<simpleBoxDescription>
		<paragraph>The description goes here.</paragraph>
		<listItem listIndent="0" listType="bulleted">It can contain lists,</listItem>
		<listItem listIndent="0" listType="bulleted">and other block elements like headings.</listItem>
	</simpleBoxDescription>
</simpleBox>
```

As you can see, this structure is quite different than the HTML input/output. If you look closely, you will also notice the `[]` characters in the first paragraph &mdash; this is the selection position.

Play a bit with the editor features (bold, italic, headings, lists, selection) to see how the model structure changes.

<info-box>
	You can also use some {@link framework/guides/development-tools#testing-helpers useful helpers like `getData()` and `setData()`} to learn more about the state of the editor model or write assertions in tests.
</info-box>

### Behavior before "widgetizing" simple box

It is time to check if the simple box behaves like you would like it to. You can observe the following:

* You can type text in the title, but pressing <kbd>Enter</kbd> will not split it and <kbd>Backspace</kbd> will not delete it entirely. This is because it was marked as an `isLimit` element in the schema.
* You cannot apply a list in the title and cannot turn it into a heading (other than `<h1 class="simple-box-title">` which it is already). This is because it allows only the content that is allowed in other block elements (like paragraphs). You can, however, apply italic inside the title (because italic is allowed in other blocks).
* The description behaves like the title, but it allows more content inside &mdash; lists and other headings.
* If you try to select the entire simple box instance and press <kbd>Delete</kbd>, it will be deleted as a whole. The same when you copy and paste it. This is because it was marked as an `isObject` element in the schema.
* You cannot easily select the entire simple box instance by clicking on it. Also, the cursor pointer does not change when you hover it. In other words, it seems a bit "dead". This is because you have not defined the view behavior yet.

Pretty cool so far, right? With a very little code, you were able to define the behavior of your simple box plugin which maintains the integrity of these elements. The engine ensures that the user does not break these instances.

See what else you can improve.

### Making simple box a widget

<info-box>
	If you are familiar with the {@link @ckeditor4 guide/dev/deep_dive/widgets/README Widget System of CKEditor 4} you will notice significant differences in how widgets are implemented in CKEditor 5.

	CKEditor 4 implementation exposes a declarative API that controls the entire behavior of a widget (from its schema and internal model to the styles, clicking behavior, context menu and the dialog).

	In CKEditor 5 the widget system was redesigned. Most of its responsibilities were taken over by the engine, some were extracted to a separate package ({@link api/widget `@ckeditor/ckeditor5-widget`}) and some have to be handled by other utilities provided by CKEditor 5 Framework.

	CKEditor 5 implementation is, therefore, open for extensions and recomposition. You can choose the behaviors that you want (just like you did so far in this tutorial by defining a schema) and skip others or implement them by yourself.
</info-box>

The converters that you defined convert the model `<simpleBox*>` elements to plain {@link module:engine/view/containerelement~ContainerElement `ContainerElement`}s in the view (and back during upcasting).

You want to change this behavior a bit so the structure created in the editing view is enhanced with the {@link module:widget/utils~toWidget `toWidget()`} and {@link module:widget/utils~toWidgetEditable `toWidgetEditable()`} utilities. You do not want to affect the data view, though. Therefore, you will need to define converters for the editing and data downcasting separately.

If you find the concept of downcasting and upcasting confusing, read the {@link framework/guides/architecture/editing-engine#conversion introduction to conversion}.

Before you start coding, you need to install the {@link api/widget `@ckeditor/ckeditor5-widget`} package:

```bash
npm install --save @ckeditor/ckeditor5-widget
```

Now it is time to revisit the `_defineConverters()` method that you defined earlier. You will use the {@link module:engine/conversion/upcasthelpers~UpcastHelpers#elementToElement `elementToElement()` upcast helper} and the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement `elementToElement()` downcast helper} instead of the two-way `elementToElement()` converter helper.

Additionally, you need to ensure that the {@link module:widget/widget~Widget `Widget`} plugin is loaded. If you omit it, the elements in the view will have all the classes (e.g. `ck-widget`) but there will be no "behaviors" loaded (e.g. clicking a widget will not select it).

```js
// simplebox/simpleboxediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

// ADDED 2 imports
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

export default class SimpleBoxEditing extends Plugin {
	static get requires() {                                                    // ADDED
		return [ Widget ];
	}

	init() {
		console.log( 'SimpleBoxEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();
	}

	_defineSchema() {
		// ...
	}

	_defineConverters() {                                                      // MODIFIED
		const conversion = this.editor.conversion;

		// <simpleBox> converters
		conversion.for( 'upcast' ).elementToElement( {
			model: 'simpleBox',
			view: {
				name: 'section',
				classes: 'simple-box'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'simpleBox',
			view: {
				name: 'section',
				classes: 'simple-box'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'simpleBox',
			view: ( modelElement, viewWriter ) => {
				const section = viewWriter.createContainerElement( 'section', { class: 'simple-box' } );

				return toWidget( section, viewWriter, { label: 'simple box widget' } );
			}
		} );

		// <simpleBoxTitle> converters
		conversion.for( 'upcast' ).elementToElement( {
			model: 'simpleBoxTitle',
			view: {
				name: 'h1',
				classes: 'simple-box-title'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'simpleBoxTitle',
			view: {
				name: 'h1',
				classes: 'simple-box-title'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'simpleBoxTitle',
			view: ( modelElement, viewWriter ) => {
				// Note: You use a more specialized createEditableElement() method here.
				const h1 = viewWriter.createEditableElement( 'h1', { class: 'simple-box-title' } );

				return toWidgetEditable( h1, viewWriter );
			}
		} );

		// <simpleBoxDescription> converters
		conversion.for( 'upcast' ).elementToElement( {
			model: 'simpleBoxDescription',
			view: {
				name: 'div',
				classes: 'simple-box-description'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'simpleBoxDescription',
			view: {
				name: 'div',
				classes: 'simple-box-description'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'simpleBoxDescription',
			view: ( modelElement, viewWriter ) => {
				// Note: You use a more specialized createEditableElement() method here.
				const div = viewWriter.createEditableElement( 'div', { class: 'simple-box-description' } );

				return toWidgetEditable( div, viewWriter );
			}
		} );
	}
}
```

<info-box>
	As you can see, the code became much more verbose and far longer. This is because you used lower-level converters. We plan to provide more handy widget conversion utilities in the future. Read more (and 👍) in [this ticket](https://github.com/ckeditor/ckeditor5/issues/1228).
</info-box>

### Behavior after "widgetizing" simple box

You can rebuild your project now and see how your simple box plugin has changed.

{@img assets/img/tutorial-implementing-a-widget-5.png Screenshot of the widget's focus outline.}

You should observe that:

* The `<section>`, `<h1>`, and `<div>` elements have the `contentEditable` attribute on them (plus some classes). This attribute tells the browser whether an element is considered "editable". Passing the element through `toWidget()` will make its content non-editable. Conversely, passing it through `toWidgetEditable()` will make its content editable again.
* You can now click the widget (the gray area) to select it. Once it is selected, it is easier to copy-paste it.
* The widget and its nested editable regions react to hovering, selection, and focus (outline).

In other words, the simple box instance became much more responsive.

Additionally, if you call `editor.getData()` you will get the same HTML as before "widgetizing" the simple box. This is thanks to using `toWidget()` and `toNestedEditable()` only in the `editingDowncast` pipeline.

This is all that you need from the model and the view layers for now. In terms of "editability" and data input/output it is fully functional. Now find a way to insert new simple boxes into the document!

## Creating a command

A {@link framework/guides/architecture/core-editor-architecture#commands command} is a combination of an action and a state. You can interact with most of the editor features by commands that they expose. This allows not only executing these features (e.g. bolding a fragment of text) but also checking if this action can be executed in the selection's current location as well as observing other state properties (such as whether the currently selected text is bolded).

In case of the simple box the situation is simple:

* you need an "insert a new simple box" action,
* and "can you insert a new simple box here (at the current selection position)".

Create a new file `insertsimpleboxcommand.js` in the `simplebox/` directory. You will use the {@link module:engine/model/model~Model#insertContent `model.insertContent()`} method which will be able to, for example, split a paragraph if you try to insert a simple box in the middle of it (which is not allowed by the schema).

```js
// simplebox/insertsimpleboxcommand.js

import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertSimpleBoxCommand extends Command {
	execute() {
		this.editor.model.change( writer => {
			// Insert <simpleBox>*</simpleBox> at the current selection position
			// in a way that will result in creating a valid model structure.
			this.editor.model.insertContent( createSimpleBox( writer ) );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'simpleBox' );

		this.isEnabled = allowedIn !== null;
	}
}

function createSimpleBox( writer ) {
	const simpleBox = writer.createElement( 'simpleBox' );
	const simpleBoxTitle = writer.createElement( 'simpleBoxTitle' );
	const simpleBoxDescription = writer.createElement( 'simpleBoxDescription' );

	writer.append( simpleBoxTitle, simpleBox );
	writer.append( simpleBoxDescription, simpleBox );

	// There must be at least one paragraph for the description to be editable.
	// See https://github.com/ckeditor/ckeditor5/issues/1464.
	writer.appendElement( 'paragraph', simpleBoxDescription );

	return simpleBox;
}
```

Import the command and register it in the `SimpleBoxEditing` plugin:

```js
// simplebox/simpleboxediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import InsertSimpleBoxCommand from './insertsimpleboxcommand';                 // ADDED

export default class SimpleBoxEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		console.log( 'SimpleBoxEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();

		// ADDED
		this.editor.commands.add( 'insertSimpleBox', new InsertSimpleBoxCommand( this.editor ) );
	}

	_defineSchema() {
		// ...
	}

	_defineConverters() {
		// ...
	}
}
```

You can now execute this command in order to insert a new simple box. Calling:

```js
editor.execute( 'insertSimpleBox' );
```

Should result in:

{@img assets/img/tutorial-implementing-a-widget-6.png Screenshot of a simple box instance inserted at the beginning of the editor content.}

You can also try inspecting the `isEnabled` property value (or just checking it in CKEditor 5 inspector):

```js
console.log( editor.commands.get( 'insertSimpleBox' ).isEnabled );
```

It is always `true` except when the selection is in one place &mdash; in other simple box's title. You can also observe that executing the command when the selection is in that place takes no effect.

Change one more thing before you move forward &mdash; disallow `simpleBox` inside `simpleBoxDescription`, too. This can be done by {@link module:engine/model/schema~Schema#addChildCheck defining a custom child check}:

```js
// simplebox/simpleboxediting.js

// ... imports

export default class SimpleBoxEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		console.log( 'SimpleBoxEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'insertSimpleBox', new InsertSimpleBoxCommand( this.editor ) );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'simpleBox', {
			// Behaves like a self-contained object (e.g. an image).
			isObject: true,

			// Allow in places where other blocks are allowed (e.g. directly in the root).
			allowWhere: '$block'
		} );

		schema.register( 'simpleBoxTitle', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'simpleBox',

			// Allow content which is allowed in blocks (i.e. text with attributes).
			allowContentOf: '$block'
		} );

		schema.register( 'simpleBoxDescription', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'simpleBox',

			// Allow content which is allowed in the root (e.g. paragraphs).
			allowContentOf: '$root'
		} );

		// ADDED
		schema.addChildCheck( ( context, childDefinition ) => {
			if ( context.endsWith( 'simpleBoxDescription' ) && childDefinition.name == 'simpleBox' ) {
				return false;
			}
		} );
	}

	_defineConverters() {
		// ...
	}
}
```

Now the command should be disabled also when the selection is inside the description of another simple box instance.

## Creating a button

It is time to allow the editor users to insert the widget into the content. The best way to do that is through a UI button in the toolbar. You can quickly create one using the {@link module:ui/button/buttonview~ButtonView `ButtonView`} class brought by the {@link framework/guides/architecture/ui-library UI framework} of CKEditor 5.

The button should execute the [command](#creating-a-command) when clicked and become inactive if the widget cannot be inserted into some particular position of the selection ([as defined in the schema](#defining-the-schema)).

See what it looks like in practice and extend the `SimpleBoxUI` plugin [created earlier](#plugin-structure):

```js
// simplebox/simpleboxui.js

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class SimpleBoxUI extends Plugin {
	init() {
		console.log( 'SimpleBoxUI#init() got called' );

		const editor = this.editor;
		const t = editor.t;

		// The "simpleBox" button must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add( 'simpleBox', locale => {
			// The state of the button will be bound to the widget command.
			const command = editor.commands.get( 'insertSimpleBox' );

			// The button will be an instance of ButtonView.
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				// The t() function helps localize the editor. All strings enclosed in t() can be
				// translated and change when the language of the editor changes.
				label: t( 'Simple Box' ),
				withText: true,
				tooltip: true
			} );

			// Bind the state of the button to the command.
			buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute the command when the button is clicked (executed).
			this.listenTo( buttonView, 'execute', () => editor.execute( 'insertSimpleBox' ) );

			return buttonView;
		} );
	}
}
```

The last thing you need to do is tell the editor to display the button in the toolbar. To do that, you will need to slightly modify the code that runs the editor instance and include the button in the {@link module:core/editor/editorconfig~EditorConfig#toolbar toolbar configuration}:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, SimpleBox ],
		// Insert the "simpleBox" button into the editor toolbar.
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList', 'simpleBox' ]
	} )
	.then( editor => {
		// ...
	} )
	.catch( error => {
		// ...
	} );
```

Refresh the web page and try it yourself:

{@img assets/img/tutorial-implementing-a-widget-7.png Screenshot of the simple box widget being inserted using the toolbar button.}


## Demo

You can see the block widget implementation in action in the editor below. You can also check out the full [source code](#full-source-code) of this tutorial if you want to develop your own block widgets.

{@snippet framework/tutorials/block-widget}

## Full source code

The following code contains a complete implementation of the `SimpleBox` plugin (and all its dependencies) and the code to run the editor. You can paste it into the [`app.js`](#plugin-structure) file and it will run out–of–the–box:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Command from '@ckeditor/ckeditor5-core/src/command';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

class SimpleBox extends Plugin {
	static get requires() {
		return [ SimpleBoxEditing, SimpleBoxUI ];
	}
}

class SimpleBoxUI extends Plugin {
	init() {
		console.log( 'SimpleBoxUI#init() got called' );

		const editor = this.editor;
		const t = editor.t;

		// The "simpleBox" button must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add( 'simpleBox', locale => {
			// The state of the button will be bound to the widget command.
			const command = editor.commands.get( 'insertSimpleBox' );

			// The button will be an instance of ButtonView.
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				// The t() function helps localize the editor. All strings enclosed in t() can be
				// translated and change when the language of the editor changes.
				label: t( 'Simple Box' ),
				withText: true,
				tooltip: true
			} );

			// Bind the state of the button to the command.
			buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute the command when the button is clicked (executed).
			this.listenTo( buttonView, 'execute', () => editor.execute( 'insertSimpleBox' ) );

			return buttonView;
		} );
	}
}

class SimpleBoxEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		console.log( 'SimpleBoxEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'insertSimpleBox', new InsertSimpleBoxCommand( this.editor ) );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'simpleBox', {
			// Behaves like a self-contained object (e.g. an image).
			isObject: true,

			// Allow in places where other blocks are allowed (e.g. directly in the root).
			allowWhere: '$block'
		} );

		schema.register( 'simpleBoxTitle', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'simpleBox',

			// Allow content which is allowed in blocks (i.e. text with attributes).
			allowContentOf: '$block'
		} );

		schema.register( 'simpleBoxDescription', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'simpleBox',

			// Allow content which is allowed in the root (e.g. paragraphs).
			allowContentOf: '$root'
		} );

		schema.addChildCheck( ( context, childDefinition ) => {
			if ( context.endsWith( 'simpleBoxDescription' ) && childDefinition.name == 'simpleBox' ) {
				return false;
			}
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		// <simpleBox> converters
		conversion.for( 'upcast' ).elementToElement( {
			model: 'simpleBox',
			view: {
				name: 'section',
				classes: 'simple-box'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'simpleBox',
			view: {
				name: 'section',
				classes: 'simple-box'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'simpleBox',
			view: ( modelElement, viewWriter ) => {
				const section = viewWriter.createContainerElement( 'section', { class: 'simple-box' } );

				return toWidget( section, viewWriter, { label: 'simple box widget' } );
			}
		} );

		// <simpleBoxTitle> converters
		conversion.for( 'upcast' ).elementToElement( {
			model: 'simpleBoxTitle',
			view: {
				name: 'h1',
				classes: 'simple-box-title'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'simpleBoxTitle',
			view: {
				name: 'h1',
				classes: 'simple-box-title'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'simpleBoxTitle',
			view: ( modelElement, viewWriter ) => {
				// Note: You use a more specialized createEditableElement() method here.
				const h1 = viewWriter.createEditableElement( 'h1', { class: 'simple-box-title' } );

				return toWidgetEditable( h1, viewWriter );
			}
		} );

		// <simpleBoxDescription> converters
		conversion.for( 'upcast' ).elementToElement( {
			model: 'simpleBoxDescription',
			view: {
				name: 'div',
				classes: 'simple-box-description'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'simpleBoxDescription',
			view: {
				name: 'div',
				classes: 'simple-box-description'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'simpleBoxDescription',
			view: ( modelElement, viewWriter ) => {
				// Note: You use a more specialized createEditableElement() method here.
				const div = viewWriter.createEditableElement( 'div', { class: 'simple-box-description' } );

				return toWidgetEditable( div, viewWriter );
			}
		} );
	}
}

class InsertSimpleBoxCommand extends Command {
	execute() {
		this.editor.model.change( writer => {
			// Insert <simpleBox>*</simpleBox> at the current selection position
			// in a way that will result in creating a valid model structure.
			this.editor.model.insertContent( createSimpleBox( writer ) );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'simpleBox' );

		this.isEnabled = allowedIn !== null;
	}
}

function createSimpleBox( writer ) {
	const simpleBox = writer.createElement( 'simpleBox' );
	const simpleBoxTitle = writer.createElement( 'simpleBoxTitle' );
	const simpleBoxDescription = writer.createElement( 'simpleBoxDescription' );

	writer.append( simpleBoxTitle, simpleBox );
	writer.append( simpleBoxDescription, simpleBox );

	// There must be at least one paragraph for the description to be editable.
	// See https://github.com/ckeditor/ckeditor5/issues/1464.
	writer.appendElement( 'paragraph', simpleBoxDescription );

	return simpleBox;
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Bold, Italic, Heading, List, Paragraph, SimpleBox ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'numberedList', 'bulletedList', 'simpleBox' ],
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );

		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```
