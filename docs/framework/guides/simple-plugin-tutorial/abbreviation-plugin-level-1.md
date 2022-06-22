---
category: simple-plugin
order: 25
---

# Abbreviation plugin tutorial - part 1

This guide will show you how to create a simple abbreviation plugin for CKEditor 5. 

<info-box>
	Before you get to work, you should check out the {@link framework/guides/quick-start Quick start} guide first to set up the framework and building tools. Be sure to check out the {@link framework/guides/package-generator package generator guide} as well.
</info-box>

We’ll create a toolbar button that lets the users insert abbreviations into their document.  The abbreviations will use the `<abbr>` <abbr title="HyperText Markup Language"> HTML </abbr> element, with a ‘title’ property that will show up in a tooltip when the user hovers over the element.  

This first part will cover only the basics, and we'll just insert one possible abbreviation: "WYSIWYG". We'll get user input in the next part of this tutorial series.

<info-box>
	If you want to see the final product of this tutorial before you plunge in, check out the [demo](#demo).
</info-box>

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

Now look at `index.html`. We'll add here the `<abbr>` element - it won't work just yet, but we'll fix that in a couple of steps. 

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

We’ll divide our abbreviation plugin into four components - `Abbreviation`, `AbbreviationUI`, and `AbbreviationEditing`:

* `AbbreviationEditing` will hold the model and the view layers. 
* `AbbreviationUI` will be responsible for the UI - the toolbar button. 
* `Abbreviation` will be the glue that holds the UI and the editing together. 

You could keep them all in one file, since this part of the tutorial won't have too much code. If you're planning to go through all parts of the tutorial, it's best to seperate the components. We suggest creating this directory structure:

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

Now you need to load the `Abbreviation` plugin in your `app.js` file:

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
			Essentials, Paragraph, Heading, List, Bold, Italic,	Abbreviation	// ADDED
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
	Read more about the {@link framework/guides/architecture/editing-engine#model model} and the {@link framework/guides/architecture/editing-engine#view view}.
</info-box>

In the view layer, we'll have the `<abbr>` HTML element, with a title property.

In the model, inline elements, such as `<abbr>`, are represented as attributes, not as seperate elements. In order for our plugin to work, we'll need to make sure that we can add abbreviation attribute to the text node. 

### Defining the schema

We can do it by defining the model's schema. We'll just extend the text node's schema to accept our abbreviation attribute.

<info-box>
	Read more about the {@link framework/guides/architecture/editing-engine#schema schema}.
</info-box>

Update the `AbbreviationEditing` plugin with this definition.

```js
// abbreviation/abbreviationediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class AbbreviationEditing extends Plugin {
	init() {
		this._defineSchema();                                                  // ADDED
	}

	_defineSchema() {                                                          // ADDED
		const schema = this.editor.model.schema;
		schema.extend( '$text', {
			allowAttributes: [ 'abbreviation' ]
		} );
	}
}
```

### Defining converters

Converters tell the editor how to convert the view to the model (e.g. when loading the data to the editor or handling pasted content) and how to render the model to the view (for editing purposes, or when retrieving the editor data).

<info-box>
	Read more about the {@link framework/guides/deep-dive/conversion/downcast conversion in the editor}.
</info-box>

We'll need to convert the model abbreviation attribute into an HTML element in the view (downcast) and vice versa (upcast). 

We'll use our conversion helpers - `attributeToElement()` and `elementToAttribute()`. We just need to define what the model and the view is supposed to look like for both conversions. 

Converting the full title of the abbreviation between the model and the view is a little bit tricky. In the upcast conversion, we'll need a simple callback function to get the title attribute of the `<abbr>` element. 

We'll also need a callback function in the downcast conversion, in order to get the title stored as a model attribute value. Here, the second parameter of the view callback is the [DowncastConversionApi](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_downcastdispatcher-DowncastConversionApi.html) object. We'll use its `writer` property, which will allow us to manipulate the data during downcast conversion.

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

		// conversion from a model attribute to a view element
		conversion.for( 'downcast' ).attributeToElement( {
			model: 'abbreviation',
			view: ( modelAttributeValue, conversionApi ) => {
				const { writer } = conversionApi;

				return writer.createAttributeElement( 'abbr', {
					title: modelAttributeValue
				} );
			}
		} );

		// conversion from a view element to a model attribute
		conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'abbr',
				attributes: [ "title" ]
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
```

Thanks to the upcast conversion, our abbreviation added in the `index.html` should work now. Rebuild and check it out yourself.

## Creating a toolbar button

Now we can create our `Abbreviation` toolbar button using the {@link module:ui/button/buttonview~ButtonView `ButtonView`} class. 

We need to register it in the editor's UI componentFactory, so it can be displayed in the toolbar. We can localize the button by using the editor's {@link module:utils/locale~Locale} instance, and the translation {@link module:utils/locale~Locale#t `t()` function}.

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
Let's add it to the toolbar: 

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
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'abbreviation' ]	// ADDED
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

We have the button, so let's add a simple click listener. 

We'll use the [`model.insertText()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_writer-Writer.html#function-insertText) method to add the abbreviation to the model, along with the title attribute. We'll also need to give it a position of the user's current selection to indicate where to insert our abbreviation. 

Finally, if the user's selection has a range (so it's a letter, word, or a whole text fragment), we'll remove that and replace it with our abbreviation.

```js

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
					writer.insertText( abbr, { 'abbreviation': title }, selection.getFirstPosition() );
					
					for ( const range of selection.getRanges() ) {
						writer.remove( range );
					}
				} );
			} );

			return button;
		} );
	}
}
```

That's it for the first part of this tutorial! Your plugin should now work (in its most basic form). Go on to the second part, where you will create a balloon with a form to get user's input, replacing our hard-coded abbreviation. 

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
					writer.insertText( abbr, { 'abbreviation': title }, selection.getFirstPosition() );
					
					for ( const range of selection.getRanges() ) {
						writer.remove( range );
					}
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
