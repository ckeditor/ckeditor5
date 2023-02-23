---
category: abbreviation-plugin
menu-title: Defining a model and a view
order: 24
modified_at: 2022-07-15
---

# Defining a model and a view

This guide will show you how to create a simple abbreviation plugin for CKEditor 5.

We will create a toolbar button that lets the users insert abbreviations into their document. These abbreviations will use the [`<abbr>` <abbr title="HyperText Markup Language">HTML</abbr> element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/abbr) with a ‘title’ attribute that will show up in a tooltip when the user hovers over the element. You can check the mechanism hovering over the underlined "HTML" text in the previous sentence.

This first part of the tutorial will only cover the basics. We will just insert one possible abbreviation: "WYSIWYG". We will get user input in the {@link framework/abbreviation-plugin-tutorial/abbreviation-plugin-level-2 next part of this tutorial series}.

If you want to see the final product of this tutorial before you plunge in, check out the [live demo](#demo).

## Let's start!

The easiest way to set up your project is to grab the starter files from our [Github repository for this tutorial](https://github.com/ckeditor/ckeditor5-tutorials-examples/tree/main/abbreviation-plugin/starter-files). We gathered all the necessary dependencies there, including some CKEditor 5 packages and other files needed to build the editor.

The editor has already been created in the `app.js` file with some basic plugins. All you need to do, is clone the repository, run the `npm install` command, and you can start coding right away.

The webpack is also already configured, so you can just use the `npm run build` command to build your application. Whenever you want to check anything in the browser, save the changes and run build again. Then, refresh the page in your browser (remember to turn off caching, so that new changes are displayed instantly).

<info-box>
	Our starter files come with the {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 Inspector} attached to the editor, so you can easily debug and observe what is happening in the model and the view layers. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

If you want to set up the project yourself, you should follow the steps listed in the {@link framework/quick-start the "Quick start" section}. Additionally, you will need to install the [`@ckeditor/ckeditor5-core`](https://www.npmjs.com/package/@ckeditor/ckeditor5-core) package, which contains the `Plugin` class, and the [`@ckeditor/ckeditor5-ui`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui) package, which contains the UI library and the framework.

Your entry point to the plugin is `app.js`:

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
		CKEditorInspector.attach( editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

Now take look at `index.html`. We added the `<abbr>` element - it will not work just yet, but we will fix that in a couple of steps.

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>CKEditor 5 Framework – Abbreviation plugin</title>
	</head>
	<body>
		<div id="editor">
 			<h2>Abbreviation plugin</h2>
			<p>CKEditor5 is a modern, feature-rich, world-class <abbr title="What You See Is What You Get">WYSIWYG</abbr> editor.</p>
		</div>

		<script src="dist/bundle.js"></script>
	</body>
</html>
```

## Plugin structure

Our abbreviation plugin is divided into three components &ndash; `Abbreviation`, `AbbreviationUI`, and `AbbreviationEditing`:

* `AbbreviationEditing` will enable the abbreviation attribute in the model and introduce a proper model ←→ view conversion.
* `AbbreviationUI` will be responsible for the UI &ndash; the toolbar button.
* `Abbreviation` will be the glue that holds the UI and the editing together.

We put them in the `/abbreviation` directory. We will be adding more files the in the next parts of the tutorial. This is our directory structure:

```
├── app.js
├── dist
│   ├── bundle.js
│   └── bundle.js.map
├── index.html
├── node_modules
├── package.json
├── abbreviation
│   ├── abbreviation.js
│   ├── abbreviationediting.js
│   └── abbreviationui.js
└── webpack.config.js
```

Take a look at the 3 components, which have already been defined and imported into `app.js`.

`AbbreviationUI`:

```js
// abbreviation/abbreviationui.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class AbbreviationUI extends Plugin {
	init() {
		console.log( 'AbbreviationUI#init() got called' );
	}
}
```

`AbbreviationEditing`:

```js
// abbreviation/abbreviationediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class AbbreviationEditing extends Plugin {
	init() {
		console.log( 'AbbreviationEditing#init() got called' );
	}
}
```

`Abbreviation`:

```js
// abbreviation/abbreviation.js

import AbbreviationEditing from './abbreviationediting';
import AbbreviationUI from './abbreviationui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class Abbreviation extends Plugin {
	static get requires() {
		return [ AbbreviationEditing, AbbreviationUI ];
	}
}
```

Now we need to load the `Abbreviation` plugin in our `app.js` file. The editor will load the `AbbreviationUI` and the `AbbreviationEditing` components by itself, as they are required by our 'glue' plugin.

```js
// app.js

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

import Abbreviation from './abbreviation/abbreviation';					// ADDED

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials, Paragraph, Heading, List, Bold, Italic,
			Abbreviation												// ADDED
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

Rebuild the project now, refresh the browser and you should see that the `AbbreviationEditing` and `AbbreviationUI` plugins were loaded.

## The model and the view layers

CKEditor 5 implements its own custom data model, which does not map 1:1 to the DOM. The model document is converted into the view, which represents the content that the user is editing.

<info-box>
	Before moving forward, it is important to understand the editor architecture. Read more about the {@link framework/architecture/editing-engine#model model} and the {@link framework/architecture/editing-engine#view view} to get familiar with the basic concepts.
</info-box>

In the view layer, we will have the `<abbr>` HTML element, with a title attribute. See how it will look like in the inspector.
{@img assets/img/abbreviation-part1-1.png Screenshot of a the inspector showing the view layer.}

In the model, inline elements such as `<abbr>`, are represented as attributes not as separate elements. In order for our plugin to work, we will need to make sure that we can add abbreviation attribute to the text node.
{@img assets/img/abbreviation-part1-2.png Screenshot of a the inspector showing the model layer.}

### Defining the schema

We can do it by defining the model's schema. Thanks to a couple lines of code, we will allow all text nodes to receive the model abbreviation attribute.

<info-box>
	Schema defines what is allowed in the model in terms of structures, attributes, and other characteristics. This information is then used by the features and the engine to make decisions on how to process the model, so it is crucial that your custom plugins have a well-defined schema. Read more about it in our {@link framework/architecture/editing-engine#schema introduction to the editing engine architecture}.
</info-box>

We will just extend the text node's schema to accept our abbreviation attribute, using the `schema.extend()` method.

Update the `AbbreviationEditing` plugin with this definition:

```js
// abbreviation/abbreviationediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class AbbreviationEditing extends Plugin {
	init() {
		this._defineSchema();									// ADDED
	}

	_defineSchema() {											// ADDED
		const schema = this.editor.model.schema;

		// Extend the text node's schema to accept the abbreviation attribute.
		schema.extend( '$text', {
			allowAttributes: [ 'abbreviation' ]
		} );
	}
}
```

### Defining converters

Converters tell the editor how to transform the view to the model (e.g. when loading the data to the editor or handling pasted content) and how to render the model to the view (for editing purposes, or when retrieving the editor data).

<info-box>
	Conversion is one of the more complex topics in our editing engine architecture. It is definitely worth reading more about {@link framework/deep-dive/conversion/intro the conversion in the editor} before you move on.
</info-box>

We will need to convert the model abbreviation attribute into a view element (downcast) and vice versa (upcast). We can achieve this by using our {@link framework/deep-dive/conversion/helpers/intro conversion helpers} and defining what the model and the view is supposed to look like for both conversions.

Converting the full title of the abbreviation is a little bit tricky, because we need to make sure that its value is synchronized between the model and the view.

#### Downcast conversion

In the downcast conversion, we will use one of our conversion helpers &ndash; {@link framework/deep-dive/conversion/helpers/downcast#attribute-to-element-conversion-helper `attributeToElement()`} &ndash; to transform the model abbreviation attribute into the view `<abbr>` element.

We will need to use a callback function, in order to get the title stored as a model attribute value and transform it into the title value of the view element. Here, the second parameter of the view callback is the `DowncastConversionApi` object. We will use its `writer` property, which will allow us to manipulate the data during downcast conversion, as it contains an instance of the `DowncastWriter`.

```js
// abbreviation/abbreviationediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class AbbreviationEditing extends Plugin {
	init() {
		this._defineSchema();
		this._defineConverters();							// ADDED
	}

	_defineSchema() {
	// Previously defined schema.
	// ...
	}

	_defineConverters() {									// ADDED
		const conversion = this.editor.conversion;

		// Conversion from a model attribute to a view element.
		conversion.for( 'downcast' ).attributeToElement( {
			model: 'abbreviation',
			// Callback function provides access to the model attribute value
			// and the DowncastWriter.
			view: ( modelAttributeValue, conversionApi ) => {
				const { writer } = conversionApi;

				return writer.createAttributeElement( 'abbr', {
					title: modelAttributeValue
				} );
			}
		} );

	}
}
```

#### Upcast conversion

The upcast conversion tells the editor how the view `<abbr>` element is supposed to look like in the model. We will transform it using another conversion helper &ndash; {@link framework/deep-dive/conversion/helpers/upcast#element-to-attribute-conversion-helper `elementToAttribute()`}.

We also need to grab the title value from the content and use it in the model. We can do that thanks to a callback function, which gives us the access to the view element.

```js
// abbreviation/abbreviationediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class AbbreviationEditing extends Plugin {
	init() {
	// Schema and converters initialization.
	// ...
	}

	_defineSchema() {
	// Previously defined schema.
	// ...
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'downcast' ).attributeToElement(
		// Code responsible for downcast conversion.
		// ...
		);

		// Conversion from a view element to a model attribute.
		conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'abbr',
				attributes: [ 'title' ]
			},
			model: {
				key: 'abbreviation',
				// Callback function provides access to the view element.
				value: viewElement => {
					const title = viewElement.getAttribute( 'title' );

					return title;
				}
			}
		} );
	}
}
```

Thanks to the upcast conversion, our abbreviation added in the `index.html` should work now. Rebuild the editor and check it out yourself.

{@img assets/img/abbreviation-part1-3.png Screenshot of the editor showing working abbreviation.}

## Creating a toolbar button

Now we can create our `Abbreviation` toolbar button using the {@link module:ui/button/buttonview~ButtonView `ButtonView`} class.

We need to register it in the editor's UI `componentFactory`, so it can be displayed in the toolbar.

```js
// abbreviation/abbreviationui.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

class AbbreviationUI extends Plugin {
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'abbreviation', () => {
			const button = new ButtonView();

			button.label = 'Abbreviation';
			button.tooltip = true;
			button.withText = true;

			return button;
		} );
	}
}
```
We passed the name of the button in the `componentFactory.add`, so it is now available to use in the toolbar config. We can now simply add it to the toolbar in `app.js`:

```js
// app.js

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import Abbreviation from './abbreviation/abbreviation';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials, Paragraph, Heading, List, Bold, Italic, Abbreviation
		],
		toolbar: [
			'heading', 'bold', 'italic', 'numberedList', 'bulletedList', '|',
			'abbreviation'												  // ADDED
		]
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

We have the button, so let's define what should happen after the user clicks it.

We will use the `insertContent()` method to insert our abbreviation and its title attribute into the document. Inside, we just need to create a new text node with `writer.createText()`.

```js
// abbreviation/abbreviationui.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

class AbbreviationUI extends Plugin {
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'abbreviation', () => {
			// Previously initialized button view.
			// ...

			this.listenTo( button, 'execute', () => {
				const selection = editor.model.document.selection;
				const title = 'What You See Is What You Get';
				const abbr = 'WYSIWYG';

				// Change the model to insert the abbreviation.
				editor.model.change( writer => {
					editor.model.insertContent(
						// Create a text node with the abbreviation attribute.
						writer.createText( abbr, { abbreviation: title } )
					);
				} );
			} );

			return button;
		} );
	}
}
```

## Demo

{@snippet framework/abbreviation-level-1}

## Final code

If you got lost at any point, this is [the final implementation of the plugin](https://github.com/ckeditor/ckeditor5-tutorials-examples/tree/main/abbreviation-plugin/part-1). You can paste the code from different files into your project, or clone and install the whole thing, and it will run out-of-the-box.

<info-box>
	**What's next?**

	That's it for the first part of this tutorial! Your plugin should now work (at least in its most basic form). Move on to the {@link framework/abbreviation-plugin-tutorial/abbreviation-plugin-level-2 second part}, where you will create a balloon with a form to get user's input, replacing our hard-coded "WYSIWYG" abbreviation.
</info-box>

