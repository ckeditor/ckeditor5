---
category: abbreviation-plugin
order: 25
---

# Abbreviation plugin tutorial - part 3

This guide will show you how to create a simple abbreviation plugin for CKEditor&nbsp;5. We’ll create a toolbar button that lets the users insert abbreviations into their document through a dialog box.  The abbreviations will use the `<abbr>` <abbr title="HyperText Markup Language"> HTML </abbr> element, with a ‘title’ property that will show up in a tooltip when the user hovers over the element.

<info-box>
	If you want to see the final product of this tutorial before you plunge in, check out the [demo](#demo).
</info-box>

## Let's start

This guide assumes that you are familiar with npm. If not, see the [npm documentation](https://docs.npmjs.com/getting-started/what-is-npm) or call `npm init` in an empty directory and keep your fingers crossed.

First, install packages needed to build and set up a basic CKEditor&nbsp;5 instance. On top of that, we will need:

* The [`@ckeditor/ckeditor5-core`](https://www.npmjs.com/package/@ckeditor/ckeditor5-core) package which contains the {@link module:core/plugin~Plugin} and {@link module:core/command~Command} classes.
* The [`@ckeditor/ckeditor5-ui`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui) package which contains the UI library and framework.

```bash
npm install --save \
	css-loader@5 \
	postcss-loader@4 \
	raw-loader@4 \
	style-loader@2 \
	webpack@5 \
	webpack-cli@4 \
	@ckeditor/ckeditor5-editor-classic \
	@ckeditor/ckeditor5-essentials \
	@ckeditor/ckeditor5-paragraph \
	@ckeditor/ckeditor5-heading \
	@ckeditor/ckeditor5-list \
	@ckeditor/ckeditor5-basic-styles \
	@ckeditor/ckeditor5-ui \
	@ckeditor/ckeditor5-core
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
				test: /\.svg$/,
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
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: styles.getPostCssConfig( {
								themeImporter: {
									themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
								},
								minify: true
							} )
						}
					}
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

import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

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

And an `index.html` page. We will add here the `<abbr>` element - it won't work just yet, but we will fix that in a couple of steps.

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

<info-box>
	Running webpack with the `-w` option will start it in the watch mode. This means that webpack will watch your files for changes and rebuild the application every time you save them.
</info-box>

## Plugin structure

We’ll divide our abbreviation plugin into three parts - `Abbreviation`, `AbbreviationUI` and `AbbreviationEditing`.

`AbbreviationEditing` will hold the model and the view layer (read more about them in the intro to our editing engine). `AbbreviationUI` will be responsible for the UI - our dialog box (with two input fields for the abbreviation and the full title, and two buttons to submit or cancel) and the toolbar button. Finally, `Abbreviation` will be the glue that holds the UI and the editing together.

Additionally, you will be adding new files for our command and the dialog box view. In order not to mix up these files with your project's `app.js` and `webpack.config.js` files, create this directory structure:

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
│   ... the rest of plugin files goes here as well
│
└── webpack.config.js
```

Let's define the 3 plugins.

```js
// abbreviation/abbreviation.js

import AbbreviationEditing from './abbreviationediting';
import AbbreviationUI from './abbreviationui';
import { Plugin } from 'ckeditor5';

export default class Abbreviation extends Plugin {
	static get requires() {
		return [ AbbreviationEditing, AbbreviationUI ];
	}
}
```

```js
// abbreviation/abbreviationui.js

import { Plugin } from 'ckeditor5';

export default class AbbreviationUI extends Plugin {
	init() {
		console.log( 'AbbreviationUI#init() got called' );
	}
}
```

```js
// abbreviation/abbreviationediting.js

import { Plugin } from 'ckeditor5';

export default class AbbreviationEditing extends Plugin {
	init() {
		console.log( 'AbbreviationEditing#init() got called' );
	}
}
```

Now you need to load the `Abbreviation` plugin in your `app.js` file:

```js
// app.js

import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import Abbreviation from './simplebox/abbreviation'; // ADDED

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials, Paragraph, Heading, List, Bold, Italic,
			Abbreviation                                                          // ADDED
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

Rebuild your project, refresh the browser and you should see that the the `AbbreviationEditing` and `AbbreviationUI` plugins were loaded.
SCREENSHOT

## The model and the view layers

CKEditor&nbsp;5 implements its custom data model, which does not map to the DOM 1:1. Inline elements, such as `<abbr>`, are represented as attributes in the model, not as separate elements. In order for our plugin to work, we will need to make sure that we can add abbreviation attribute to the text node.

### Defining the schema

We can do it by defining the model's schema. We will just extend the text node's schema to accept our abbreviation attribute.

<info-box>
	Read more about the {@link framework/architecture/editing-engine#schema schema}.
</info-box>

Update the `AbbreviationEditing` plugin with this definition.

```js
// abbreviation/abbreviationediting.js

import { Plugin } from 'ckeditor5';

export default class AbbreviationEditing extends Plugin {
	init() {
		console.log( 'AbbreviationEditing#init() got called' );

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
	Read more about the {@link framework/deep-dive/conversion/downcast conversion in the editor}.
</info-box>

We will need to convert the model abbreviation attribute into an HTML element in the view (downcast) and vice versa (upcast) with the use of our conversion helpers(`attributeToElement()` and `elementToAttribute()`). We just need to define what the model and the view is supposed to look like in both conversions.

Getting the title is a little bit tricky. In upcast conversion, we will need a simple callback function to get the title attribute of the `<abbr>` element. In downcast conversion, we will need to use our `conversionApi` to get the title stored as a model attribute value.

```js
// abbreviation/abbreviationediting.js

import { Plugin } from 'ckeditor5';

export default class AbbreviationEditing extends Plugin {
	init() {
		console.log( 'AbbreviationEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();                                              // ADDED
	}

	_defineSchema() {
		// ...
	}

	_defineConverters() {                                                      // ADDED
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

	}
}
```

```js
// abbreviation/abbreviationediting.js

import { Plugin } from 'ckeditor5';

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

		conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'abbr',
				attributes: {
					title: true
				}
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

## Creating a command

We will create a simple command to insert a text with our abbreviation attribute into the model.

<info-box>
	Read more about {@link framework/architecture/core-editor-architecture#commands commands}.
</info-box>

We will pass an object with the title value and the abbreviation value into the command. We will use the {link module:engine/model/writer~Writer#insertText `writer.insertText()`} method to add the abbreviation to the model, along with the title attribute. We will also need to give it a position of the user's current selection to indicate where to insert our abbreviation. Finally, if the user's selection has a range (so it's a letter, word, or a whole text fragment), we will remove that and replace it with our abbreviation.

Create a new file `abbreviationcommand.js` in the `abbreviation/` directory.

```js
// abbreviation/abbreviationcommand.js

import { Command } from '@ckeditor/ckeditor5-core';

export default class Abbreviationommand extends Command {
	execute( value ) {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const title = value.title;
		const abbr = value.abbr;

		editor.model.change( writer => {
			writer.insertText( abbr, { 'abbreviation': title }, selection.getFirstPosition() );
			for ( const range of selection.getRanges() ) {
				writer.remove( range );
			}
		} );
	}
}

```

Import the command and register it in the `AbbreviationEditing` plugin:

```js
// abbreviation/abbreviationediting.js

import { Plugin } from 'ckeditor5';

import AbbreviationCommand from './abbreviationcommand';                 // ADDED

export default class Abbreviation extends Plugin {

	init() {
		console.log( 'AbbreviationEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();

		// ADDED
		this.editor.commands.add( 'addAbbreviation', new AbbreviationCommand( this.editor ) );
	}

	_defineSchema() {
		// ...
	}

	_defineConverters() {
		// ...
	}
}
```

You can now execute this command in order to insert an abbreviation. Try this out in the console:

```js
const value = {
	abbr: 'HTML',
	title: 'HyperText Markup Language'
};
editor.execute( 'addAbbreviation', value );
```

## Creating the UI

The UI for this plugin will consist of a dialog box with a form, which will use `ContextualBalloon`, and a toolbar button, which will execute our command. Let's start with our form.

### Creating a form view

We now need to create a dialog box with a form, which will include two input fields (for the abbreviation and the title), and the 'submit' and 'cancel' buttons. We will do it in a separate view. Create a new file `abbreviationview.js` in the `abbreviation/` directory.

We need to import a couple of things from our UI library, most importantly the {@link framework/architecture/ui-library#view view} class. We will also get the `ButtonView` and `LabeledInputView`, as well as useful helper functions - `createLabeledInputText()` and `submitHandler()`.
We will use 'check' and 'cancel' icons for our buttons.

Let's create our `FromView` class, where we will set a template for our abbreviation form.

In the `constructor` we will pass `locale` that will allow us to access `t()` function, which helps localize the editor. All strings enclosed in t() can be translated and change when the language of the editor changes.

In the `render` function, let's add our `submitHandler()`, which intercepts a native DOM submit event, prevents the default web browser behavior (navigation and page reload) and fires the submit event on a view instead.

```js
// abbreviation/abbreviationview.js

import {
	View,
	LabeledFieldView,
	createLabeledInputText,
	ButtonView,
	submitHandler
} from '@ckeditor/ckeditor5-ui';
import { icons } from '@ckeditor/ckeditor5-core';

export default class FormView extends View {
	constructor( locale ) {
		super( locale );
		const t = locale.t;

		const classList = [ 'ck', 'ck-responsive-form' ];

		this.setTemplate( {
			tag: 'form',
			attributes: {
				classList,
				tabindex: '-1',
				style: { 'padding': '2px' }
			}
		} );
	}

	render() {
		super.render();

		submitHandler( {
			view: this
		} );
	}

}
```

Now let's write two functions to create our buttons and inputs.

We will pass the names of our inputs (so 'abbreviation' and 'title') into the `_createInput()` function, so we can set their labels accordingly.

```js
// abbreviation/abbreviationview.js

//imports
export default class FormView extends View {
	constructor( locale ) {
		//...
	}

	render() {
		//...
	}

	_createInput( inputName ) {
		const t = this.locale.t;

		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.label = t( `Add ${ inputName }` );

		labeledInput.extendTemplate( {
			attributes: {
				style: {
					'padding': '2px',
					'padding-top': '6px'
				}
			}
		} );
		return labeledInput;
	}

	_createButton( label, icon, className, eventName ) {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			icon,
			tooltip: true
		} );

		button.extendTemplate( {
			attributes: {
				class: className
			}
		} );

		if ( eventName ) {
			button.delegate( 'execute' ).to( this, eventName );
		}

		return button;
	}
}
```

Using these new functions, we can create finish our `FormView` constructor.

### Adding the Contextual Balloon

### Showing and hiding the form view

### Creating a toolbar button

## Wrapping up

## Demo

{@snippet framework/abbreviation-level-3}

