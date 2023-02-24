---
category: abbreviation-plugin
order: 25
---

# Abbreviation plugin tutorial - part 1

This guide will show you how to create a simple abbreviation plugin for CKEditor 5.

<info-box>
	Before you get to work, you should check out the {@link framework/quick-start Quick start} guide first to set up the framework and building tools. Be sure to check out the {@link framework/using-package-generatorpackage generator guide} as well.
</info-box>

We’ll create a toolbar button that lets the users insert abbreviations into their document.  The abbreviations will use [the `<abbr>` <abbr title="HyperText Markup Language"> HTML </abbr> element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/abbr), with a ‘title’ attribute that will show up in a tooltip when the user hovers over the element.

This first part will cover only the basics, and we will just insert one possible abbreviation: "WYSIWYG". We will get user input in the next part of this tutorial series.

If you want to see the final product of this tutorial before you plunge in, check out the [demo](#demo).

## Let's start

Start by installing all the necessary dependencies:

* The [`@ckeditor/ckeditor5-core`](https://www.npmjs.com/package/@ckeditor/ckeditor5-core) package which contains the {@link module:core/plugin~Plugin} class.
* The [`@ckeditor/ckeditor5-ui`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui) package which contains the UI library and framework.

```
npm install --save @ckeditor/ckeditor5-core \
	@ckeditor/ckeditor5-ui
```

Your entry point to the plugin is `app.js` and it should look like this (maybe with a couple of different imports):

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

Now look at `index.html`. We will add here the `<abbr>` element - it won't work just yet, but we will fix that in a couple of steps.

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>CKEditor 5 Framework – abbreviation plugin</title>
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

We’ll divide our abbreviation plugin into three components - `Abbreviation`, `AbbreviationUI`, and `AbbreviationEditing`:

* `AbbreviationEditing` will enable the abbreviation attribute in the model and introduce a proper model ←→ view conversion.
* `AbbreviationUI` will be responsible for the UI - the toolbar button.
* `Abbreviation` will be the glue that holds the UI and the editing together.

You could keep them all in one file, since this part of the tutorial won't have too much code. If you're planning to go through all parts of the tutorial, it's best to separate the components. We suggest creating this directory structure:

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
│
└── webpack.config.js
```

Let's define the 3 components.

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

```js
// abbreviation/abbreviationui.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class AbbreviationUI extends Plugin {
	init() {
		console.log( 'AbbreviationUI#init() got called' );
	}
}
```

```js
// abbreviation/abbreviationediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class AbbreviationEditing extends Plugin {
	init() {
		console.log( 'AbbreviationEditing#init() got called' );
	}
}
```

Now you need to load the `Abbreviation` plugin in your `app.js` file. The editor will load the `AbbreviationUI` and the `AbbreviationEditing` by itself, as they are required by our 'glue' plugin.

```js
// app.js

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import Abbreviation from './abbreviation/abbreviation';							// ADDED

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials, Paragraph, Heading, List, Bold, Italic,
			Abbreviation														// ADDED
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

Rebuild your project, refresh the browser and you should see that the `AbbreviationEditing` and `AbbreviationUI` plugins were loaded.

## The model and the view layers

CKEditor 5 implements its own custom data model, which does not map to the DOM 1:1. The model document is converted into the view, which represents the content that the user is editing - the DOM structure you see in the browser.

<info-box>
	Before moving forward, it is important to understand the editor architecture. Read more about the {@link framework/architecture/editing-engine#model model} and the {@link framework/architecture/editing-engine#view view} to get familiar with the basic concepts.
</info-box>

In the view layer, we will have the `<abbr>` HTML element, with a title attribute.

In the model, inline elements, such as `<abbr>`, are represented as attributes, not as separate elements. In order for our plugin to work, we will need to make sure that we can add abbreviation attribute to the text node.

### Defining the schema

We can do it by defining the model's schema. Thanks to a couple lines of code, we will allow all text nodes to receive the model abbreviation attribute.

<info-box>
	Schema defines what is allowed in the model in terms of structures, attributes, and other characteristics. This information is then used by the features and the engine to make decisions on how to process the model, so it is crucial that your custom plugins have a well-defined schema. Read more about it in our{@link framework/architecture/editing-engine#schema introduction to the editing engine architecture}.
</info-box>

So, we will just extend the text node's schema to accept our abbreviation attribute, using the {@link module:engine/model/schema~Schema#extend `Schema#extend()`} method.

Update the `AbbreviationEditing` plugin with this definition:

```js
// abbreviation/abbreviationediting.js)

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class AbbreviationEditing extends Plugin {
	init() {
		this._defineSchema();                                                  // ADDED
	}

	_defineSchema() {                                                          // ADDED
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
	Conversion is one of the more complex topics in our editing engine architecture. It's definitely worth to read up on it before you move on. more about the {@link framework/deep-dive/conversion/downcast conversion in the editor}.
</info-box>

We will need to convert the model abbreviation attribute into an HTML element in the view (downcast) and vice versa (upcast). We will do that by using our {@link framework/deep-dive/conversion/helpers/intro conversion helpers} and defining what the model and the view is supposed to look like for both conversions.

Converting the full title of the abbreviation is a little bit tricky, because we need to make sure that its value is synchronized between the model and the view.

#### Downcast conversion

In the downcast conversion, we will use one of our conversion helpers - {@link framework/deep-dive/conversion/helpers/downcast#attribute-to-element-conversion-helper `attributeToElement()`} - to transform the model abbreviation attribute into the view `<abbr>` element.

We will need to use a callback function, in order to get the title stored as a model attribute value and transform it into the title value of the view element. Here, the second parameter of the view callback is the {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi `DowncastConversionApi`} object. We will use its `writer` property, which will allow us to manipulate the data during downcast conversion, as it contains an instance of the {@link module:engine/view/downcastwriter~DowncastWriter `DowncastWriter`}.

```js
// abbreviation/abbreviationediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class AbbreviationEditing extends Plugin {
	init() {
		this._defineSchema();
		this._defineConverters();                                              // ADDED
	}

	_defineSchema() {
		// ...
	}

	_defineConverters() {                                                      // ADDED
		const conversion = this.editor.conversion;

		// Conversion from a model attribute to a view element
		conversion.for( 'downcast' ).attributeToElement( {
			model: 'abbreviation',

			// Callback function provides access to the model attribute value
			// and the DowncastWriter
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

In the upcast conversion, we're telling the editor how the view `<abbr>` element is supposed to look like in the model. We will transform it using another conversion helper - {@link framework/deep-dive/conversion/helpers/upcast#element-to-attribute-conversion-helper `elementToAttribute()`}.

We also need to grab the title value from content and use it in the model. We can do that thanks to a callback function, which gives us the access to the {@link module:engine/view/element~Element view element}.

```js
// abbreviation/abbreviationediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class AbbreviationEditing extends Plugin {
	init() {
		// ...
	}

	_defineSchema() {
		// ...
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'downcast' ).attributeToElement(
			// ...
		 );

		// Conversion from a view element to a model attribute
		conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'abbr',
				attributes: [ "title" ]
			},
			model: {
				key: 'abbreviation',

				// Callback function provides access to the view element
				value: viewElement => {
					const title = viewElement.getAttribute( 'title' );

					return title;
				}
			}
		} );
	}
}
```

Thanks to the upcast conversion, our abbreviation added in the `index.html` should work now. Rebuild and check it out yourself.

## Creating a toolbar button

Now we can create our `Abbreviation` toolbar button using the {@link module:ui/button/buttonview~ButtonView `ButtonView`} class.

We need to register it in the editor's UI {@link module:ui/componentfactory~ComponentFactory `componentFactory`}, so it can be displayed in the toolbar. We can localize the button by using the editor's {@link module:utils/locale~Locale} instance, and the translation {@link module:utils/locale~Locale#t `t()` function}.

```js
// abbreviation/abbreviationui.js

class AbbreviationUI extends Plugin {
	init() {
		const editor = this.editor;

		// The translation function.
		const { t } = editor.locale;

		editor.ui.componentFactory.add( 'abbreviation', locale => {
			const button = new ButtonView( locale );

			// The localized label.
			button.label = t( 'Abbreviation' );
			button.tooltip = true;
			button.withText = true;

			return button;
		} );
	}
}
```
We passed the name of the button in the `componentFactory.add`, so it's now available to use in the toolbar config.
You can now simply add it to the toolbar in `app.js`:

```js
// app.js

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import Abbreviation from './simplebox/abbreviation';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials, Paragraph, Heading, List, Bold, Italic, Abbreviation
		],
		toolbar: [
			'heading', 'bold', 'italic', 'numberedList', 'bulletedList', '|',
			'abbreviation'														  // ADDED
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

We will use the {@link module:engine/model/model~Model#insertContent `writer.insertContent()`} method to insert our abbreviation and its title attribute into the document. Inside, we just need to create a new text node with {@link module:engine/model/writer~Writer#createText `writer.createText()`}.

```js
// abbreviation/abbreviationui.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

class AbbreviationUI extends Plugin {
	init() {
		const editor = this.editor;
		const { t } = editor.locale;

		editor.ui.componentFactory.add( 'abbreviation', locale => {
			//...

			this.listenTo( button, 'execute', () => {
				const selection = editor.model.document.selection;
				const title = 'What You See Is What You Get';
				const abbr = 'WYSIWYG';

				editor.model.change( writer => {
					editor.model.insertContent( writer.createText( abbr, { abbreviation: title } ) );
				} );
			} );

			return button;
		} );
	}
}
```

That's it for the first part of this tutorial! Your plugin should now work (in its most basic form). Go on to {@link framework/abbreviation-plugin-tutorial/abbreviation-plugin-level-2 the second part}, where you will create a balloon with a form to get user's input, replacing our hard-coded "WYSIWYG" abbreviation.

## Demo

{@snippet framework/abbreviation-level-1}

## Final code

If you got lost at any point, this is the final implementation of the plugin. You can paste it into the `app.js` and it will run out-of-the-box:

```js

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

class AbbreviationUI extends Plugin {
	init() {
		const editor = this.editor;
		const { t } = editor.locale;

		editor.ui.componentFactory.add( 'abbreviation', locale => {
			const button = new ButtonView( locale );

			button.label = t( 'Abbreviation' );
			button.tooltip = true;
			button.withText = true;

			this.listenTo( button, 'execute', () => {
				const selection = editor.model.document.selection;
				const title = 'What You See Is What You Get';
				const abbr = 'WYSIWYG';

				editor.model.change( writer => {
					editor.model.insertContent( writer.createText( abbr, { abbreviation: title } ) );
				} );
			} );

			return button;
		} );
	}
}

class AbbreviationEditing extends Plugin {
	init() {
		this._defineSchema();
		this._defineConverters();
	}
	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.extend( '$text', {
			allowAttributes: [ 'abbreviation' ]
		} );
	}
	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'downcast' ).attributeToElement( {
			model: 'abbreviation',
			view: ( modelAttributeValue, conversionApi ) => {
				const { writer } = conversionApi;

				return writer.createAttributeElement( 'abbr', {
					title: modelAttributeValue
				} );
			}
		} );

		conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'abbr',
				attributes: [ 'title' ]
			},
			model: {
				key: 'abbreviation',
				value: viewElement => {
					const title = viewElement.getAttribute( 'title' );

					return title;
				}
			}
		} );
	}
}

class Abbreviation extends Plugin {
	static get requires() {
		return [ AbbreviationEditing, AbbreviationUI ];
	}
}

ClassicEditor
	.create( document.querySelector( '#snippet-abbreviation-plugin' ), {
		plugins: [ Essentials, Bold, Italic, Heading, List, Paragraph, Abbreviation ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'abbreviation' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );

```
