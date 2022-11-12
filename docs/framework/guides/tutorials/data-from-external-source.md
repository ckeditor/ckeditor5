---
category: framework-tutorials
order: 10
---

# Data from external source

In this tutorial, you will learn how to implement a widget that fetches data from an external source and updates all own instances in a set interval of time.

You will build an "external data fetch" feature that allows users to insert a predefined widget that will show the current Bitcoin rate and it will be updated with the set time interval fetching data from a predefined external source. You will use widget utilities and conversion in order to define the behavior of this feature. Later on, you will use {@link framework/guides/architecture/ui-library UI library} to create a {@link module:ui/button/buttonview~ButtonView} that will allow for inserting new instances of external source widgets. You will also learn how to update the widget data based on the editor API.

<info-box>
	If you want to see the final product of this tutorial before you plunge in, check out the [demo](#demo).
</info-box>

## Before you start ⚠️

This guide assumes that you are familiar with the widgets concept introduced in the {@link framework/guides/tutorials/implementing-a-block-widget Implementing a block widget} and {@link framework/guides/tutorials/implementing-an-inline-widget implementing an inline widget} tutorials. The tutorial will also reference various concepts from the {@link framework/guides/architecture/intro CKEditor 5 architecture}.

## Bootstrapping the project

The overall project structure will be similar to one described in {@link framework/guides/tutorials/implementing-an-inline-widget#bootstrapping-the-project bootstrapping the project} section of the "Implementing an inline widget" tutorial.

First, install required dependencies:

```bash
npm install --save \
	css-loader@5 \
	postcss-loader@4 \
	raw-loader@4 \
	style-loader@2 \
	webpack@5 \
	webpack-cli@4 \
	@ckeditor/ckeditor5-basic-styles \
	@ckeditor/ckeditor5-core \
	@ckeditor/ckeditor5-dev-utils \
	@ckeditor/ckeditor5-editor-classic \
	@ckeditor/ckeditor5-essentials \
	@ckeditor/ckeditor5-heading \
	@ckeditor/ckeditor5-list \
	@ckeditor/ckeditor5-paragraph \
	@ckeditor/ckeditor5-theme-lark \
	@ckeditor/ckeditor5-ui \
	@ckeditor/ckeditor5-utils \
	@ckeditor/ckeditor5-widget
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

Add an `index.html` page:

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

The application entry point (`app.js`):


```js
// app.js

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import ExternalDataWidget from './external-data-widget/externaldatawidget';

import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, ExternalDataWidget ],
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'undo', 'redo' ]
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );

		CKEditorInspector.attach( 'editor', editor );

		// Expose for playing in the console.
		window.editor = editor;
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```


Before building the project you still need to define the `ExternalDataWidget` plugin. The project will have a structure as below:

```
├── app.js
├── dist
│   ├── bundle.js
│   └── bundle.js.map
├── index.html
├── node_modules
├── package.json
├── external-data-widget
│   ├── externaldatawidget.js
│   ├── externaldatawidgetcommand.js
│   ├── externaldatawidgetediting.js
│   ├── externaldatawidgetui.js
│   └── theme
│       └── externaldatawidget.css
│
│   ... the rest of the plugin files go here as well.
│
└── webpack.config.js
```


You can see that the external widget feature has an established plugin structure: the master (glue) plugin (`external-data-widget/externaldatawidget.js`), the "editing" (`external-data-widget/externaldatawidgetediting.js`) and the "UI" (`external-data-widget/externaldatawidgetui.js`) parts.

The master (glue) plugin:

```js
// external-data-widget/externaldatawidget.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ExternalDataWidgetEditing from './externaldatawidgetediting';
import ExternalDataWidgetUI from './externaldatawidgetui';

export default class ExternalDataWidget extends Plugin {
	static get requires() {
		return [ ExternalDataWidgetEditing, ExternalDataWidgetUI ];
	}
}
```

The UI part (empty for now):

```js
// external-data-widget/externaldatawidgetui.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class ExternalDataWidgetUI extends Plugin {
	init() {
		console.log( 'ExternalDataWidgetUI#init() got called' );
	}
}
```

And the editing part (empty for now):

```js
// external-data-widget/externaldatawidgetediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class ExternalDataWidgetEditing extends Plugin {
	init() {
		console.log( 'ExternalDataWidgetEditing#init() got called' );
	}
}
```

At this stage you can build the project and open it in the browser to verify if it is building correctly.

Use this command `./node_modules/.bin/webpack --mode development` in root folder of the widget to build the project.

After the build is completed, open `index.html` in your browser to check if all is correct at this stage.

## The model and the view layers

The external widget feature will be {@link module:engine/model/schema~SchemaItemDefinition defined as an inline} (text-like) element so it will be inserted into other editor blocks that allow text e.g. `<paragraph>`. The external widget will have a `data-resource-url` attribute. This means that the model containing some text and an external widget will look like this:

```html
<paragraph>
	External value: <externalElement data-resource-url="RESOURCE_URL"></externalElement>.
</paragraph>
```

### Defining the schema

The schema definition of this widget is almost the same as in {@link framework/guides/tutorials/implementing-an-inline-widget#defining-the-schema inline widget tutorial}, the only thing that is different is in `allowAttributes`, in our case we want to allow the `'data-resource-url'` attribute.
Instead of passing all the attributes to the config object we can use {@link framework/guides/deep-dive/schema#generic-items generic items} to inherit already predefined options.

You can also use this opportunity to import the theme file (`theme/externaldatawidget.css`).

```js
// external-data-widget/externaldatawidgetediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import './theme/externaldatawidget.css';                                           // ADDED

export default class ExternalDataWidgetEditing extends Plugin {
	init() {
		console.log( 'ExternalDataWidgetEditing#init() got called' );

		this._defineSchema();                                                  // ADDED
	}

	_defineSchema() {                                                          // ADDED
		const schema = this.editor.model.schema;

		schema.register( 'externalElement', {
			// Inheriting all from the generic item
			inheritAllFrom: '$inlineObject',

			// The external widget can have many attributes
			allowAttributes: [ 'data-resource-url' ]
		} );
	}
}
```

The schema is defined so now you can define the model-view converters.

### Defining converters

The HTML structure (data output) of the converter will be a `<span>` with a `data-resource-url` attribute with the external resource url as a value.

```html
<span data-resource-url="RESOURCE_URL"></span>
```

* {@link framework/guides/deep-dive/conversion/upcast **Upcast conversion**}. This view-to-model converter will look for `<span>`s with the `data-resource-url` attribute and will create model `<externalElement>` elements with the same `data-resource-url` attribute set accordingly.
* {@link framework/guides/deep-dive/conversion/downcast **Downcast conversion**}. The model-to-view conversion will be slightly different for "editing" and "data" pipelines as the "editing downcast" pipeline will use widget utilities to enable widget-specific behavior in the editing view. In both pipelines, the element will be rendered using the same structure.

```js
// external-data-widget/externaldatawidgetediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

// ADDED 2 imports
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import './theme/externaldatawidget.css';

export default class ExternalDataWidgetEditing extends Plugin {
	static get requires() {                                                    // ADDED
		return [ Widget ];
	}

	init() {
		console.log( 'ExternalDataWidgetEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();                                              // ADDED
	}

	_defineSchema() {                                                          // ADDED
		// ...
	}

	_defineConverters() {                                                      // ADDED
		const editor = this.editor;

		editor.conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				attributes: [ 'data-resource-url' ]
			},
			model: ( viewElement, { writer } ) => {
				const externalUrl = viewElement.getAttribute( 'data-resource-url' );

				return writer.createElement( 'externalElement', {
					'data-resource-url': externalUrl
				} );
			}
		} );

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'externalElement',
			view: ( modelElement, { writer } ) => {
				return writer.createEmptyElement( 'span', {
					'data-resource-url': modelElement.getAttribute( 'data-resource-url' )
				} );
			}
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'externalElement',
			view: ( modelElement, { writer } ) => {
				const externalDataPreviewElement = writer.createRawElement( 'span', null, function( domElement ) {
					// For now show some static text
					domElement.textContent = 'Data placeholder';
				} );

				const externalWidgetContainer = writer.createContainerElement( 'span', null, externalDataPreviewElement );

				return toWidget( externalWidgetContainer, writer, {
					label: 'External widget'
				} );
			}
		} );
	}
}
```

### Feature styles

As you might have noticed, the editing part imports the `./theme/externaldatawidget.css` CSS file which describes how the widget will be animated when new value arrives:

```css
/* external-data-widget/theme/externaldatawidget.css */

.external-data-widget-bounce {
	animation: external-data-widget-bounce-animation 0.7s 1;
}

@keyframes external-data-widget-bounce-animation {
	0% {
		box-shadow: 0px 0px 0px 0px rgba(116, 60, 205, 1);
	}

	100% {
		box-shadow: 0px 0px 0px 7px rgba(116, 60, 205, 0);
	}
}
```

### Command

The {@link framework/guides/architecture/core-editor-architecture#commands command} for the external widget feature will insert an `<externalElement>` element (if allowed by the schema) at the selection and set the selection on the inserted widget.

```js
// external-data-widget/externaldatawidgetcommand.js

import Command from '@ckeditor/ckeditor5-core/src/command';

// example external data source url
const RESOURCE_URL = 'https://api2.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT';

class ExternalDataWidgetCommand extends Command {
	execute() {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		editor.model.change( writer => {
			// Create an <externalElement> element with the "data-resource-url" attribute
			// (and all the selection attributes)...
			const externalWidget = writer.createElement(
				'externalElement', {
					...Object.fromEntries( selection.getAttributes() ),
					'data-resource-url': RESOURCE_URL
				}
			);

			// ... insert it into the document and put the selection on the inserted element.
			editor.model.insertObject( externalWidget, null, null, {
				setSelection: 'on'
			} );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const isAllowed = model.schema.checkChild( selection.focus.parent, 'externalElement' );

		this.isEnabled = isAllowed;
	}
}
```

Import the created command and add it to the editor commands:

```js
// external-data-widget/externaldatawidgetediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import ExternalDataWidgetCommand from './externaldatawidgetcommand';                   // ADDED

import './theme/externaldatawidget.css';

export default class ExternalDataWidgetEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		console.log( 'ExternalDataWidgetEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();

		// ADDED
		this.editor.commands.add( 'external', new ExternalDataWidgetCommand( this.editor ) );
	}

	_defineSchema() {
		// ...
	}

	_defineConverters() {
		// ...
	}
}
```

## Creating the UI

The UI part will provide a {@link module:ui/button/buttonview~ButtonView} that user can click to insert external widget into the editor. As a icon for the button we can use an official logotype from the public domain {@link https://en.bitcoin.it/wiki/Promotional_graphics Bitcoin promotional graphics}. You can import the icon file (`theme/bitcoinLogo.svg`) and use it like it is shown below.

```js
// external-data-widget/externaldatawidgetui.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { ButtonView } from '@ckeditor/ckeditor5-ui/src';

import BitcoinLogoIcon from './theme/bitcoinLogo.svg';

class ExternalDataWidgetUI extends Plugin {
	init() {
		const editor = this.editor;
		const externalWidgetCommand = editor.commands.get( 'external' );

		// The "external" button must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add( 'external', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: 'Bitcoin rate',
				tooltip: true,
				withText: false,
				icon: BitcoinLogoIcon
			} );

			// Disable the external widget button when the command is disabled.
			button.bind( 'isEnabled' ).to( externalWidgetCommand );

			// Execute the command when the button is clicked (executed).
			button.on( 'execute', () => {
				editor.execute( 'external' );
				// Set focus on the editor content
				editor.editing.view.focus();
			} );

			return button;
		} );
	}
}
```

Add the {@link module:ui/button/buttonview~ButtonView} to the toolbar:

```js
// app.js

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import ExternalDataWidgetCommand from './externaldatawidgetcommand';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, ExternalDataWidget ],

		// Insert the "external" button into the editor toolbar.
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'external', '|', 'undo', 'redo' ]
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

## Handling the external source

In this tutorial we will use an external API that provides a current Bitcoin rate (in USD). Endpoint that we will use do not need any API keys and it's free to use but it has some [limitations](https://binance-docs.github.io/apidocs/spot/en/#limits).

```js
'https://api2.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'
```

Data will be fetched every 15 seconds. Every instance of the widget will be updated at the same time. To achieve that, we need to modify our `ExternalDataWidgetEditing` class.

```js

class ExternalDataWidgetEditing extends Plugin {
	//
	constructor( editor ) {
		// The default constructor calls the parent constructor
		super( editor );
		// Property that keep the interval id
		this.intervalId = this._intervalFetch();
		// Last fetched value
		this.externalDataValue = '';
	}

	static get requires() {
		return [ Widget ];
	}

	// This method will help us to clear the interval
	destroy() {
		clearInterval( this.intervalId );
	}

	init() {
		this._defineSchema();
		this._defineConverters();
		// Initial execute function to fetch and update the data
		this._updateWidgetData();

		this.editor.commands.add( 'external', new ExternalDataWidgetCommand( this.editor ) );
	}

	// Interval function
	_intervalFetch() {
		return setInterval( () => this._updateWidgetData(), 15000 ); // set time interval to 15s
	}

	// Fetch data and update all widget instances
	async _updateWidgetData( externalUrl = RESOURCE_URL ) {
		try {
			const response = await fetch( externalUrl );
			const data = await response.json();
			const updateTime = new Date( data.closeTime );

			// Example parsed data: $17098.35 - 09/11/2022, 18:04:18
			const parsedData = '$' + Number( data.lastPrice ).toFixed( 2 ) + ' - ' + updateTime.toLocaleString();

			// Update property with last fetched and parsed data
			this.externalDataValue = parsedData;

			const rootElement = this.editor.model.document.getRoot();

			// Iterate over whole editor content, search for external widget instances
			// and trigger `recovertItem` function
			for ( const { item } of this.editor.model.createRangeIn( rootElement ) ) {
				if ( item.is( 'element', 'externalElement' ) ) {
					this.editor.editing.reconvertItem( item );
				}
			}
		} catch ( error ) {
			console.error( error );
		}
	}

	_defineSchema() {
		// ...
	}

	_defineConverters() {
		// ...

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'externalElement',
			view: ( modelElement, { writer } ) => {
				const externalValueToShow = this.externalDataValue;

				const externalDataPreviewElement = writer.createRawElement( 'span', null, function( domElement ) {
					// When the value is not present (initial run) show a placeholder
					domElement.textContent = externalValueToShow || 'Fetching data...';

					// If a new value arrives, add a CSS animation effect to show that data were updated
					if ( externalValueToShow ) {
						domElement.classList.add( 'external-data-widget-bounce' );
						// Remove the animation class when it ends
						setTimeout( () => domElement.classList.remove( 'external-data-widget-bounce' ), 1100 );
					}
				} );

				const externalWidgetContainer = writer.createContainerElement( 'span', null, externalDataPreviewElement );

				return toWidget( externalWidgetContainer, writer, {
					label: 'External widget'
				} );
			}
		} );
	}
}

```

Editor content traversal can be a challenging process. The presented method is sufficient when there is relatively little content. Otherwise, a `WeakMap` will be a better option.


## Demo

You can see the external widget implementation in action in the editor below.

{@snippet framework/tutorials/external-data-widget}

## Final solution

The following code snippet contains a complete implementation of the `ExternalDataWidget` plugin (and all its dependencies) and the code to run the editor. You can paste it into the `app.js` file and it will run out–of–the–box (excluded the Bitcoin logo):

```js

import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui/src';
import Command from '@ckeditor/ckeditor5-core/src/command';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

const RESOURCE_URL = 'https://api2.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT';

class ExternalDataWidgetCommand extends Command {
	execute() {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		editor.model.change( writer => {
			const externalWidget = writer.createElement(
				'externalElement', {
					...Object.fromEntries( selection.getAttributes() ),
					'data-resource-url': RESOURCE_URL
				}
			);

			editor.model.insertObject( externalWidget, null, null, {
				setSelection: 'on'
			} );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const isAllowed = model.schema.checkChild( selection.focus.parent, 'externalElement' );

		this.isEnabled = isAllowed;
	}
}

class ExternalDataWidget extends Plugin {
	static get requires() {
		return [ ExternalDataWidgetEditing, ExternalDataWidgetUI ];
	}
}

class ExternalDataWidgetUI extends Plugin {
	init() {
		const editor = this.editor;
		const externalWidgetCommand = editor.commands.get( 'external' );

		editor.ui.componentFactory.add( 'external', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: 'Bitcoin rate',
				tooltip: true,
				withText: true
			} );

			button.bind( 'isEnabled' ).to( externalWidgetCommand );

			button.on( 'execute', () => {
				editor.execute( 'external' );
				editor.editing.view.focus();
			} );

			return button;
		} );
	}
}

class ExternalDataWidgetEditing extends Plugin {
	constructor( editor ) {
		super( editor );

		this.intervalId = this._intervalFetch();

		this.externalDataValue = '';
	}

	static get requires() {
		return [ Widget ];
	}

	destroy() {
		clearInterval( this.intervalId );
	}

	init() {
		this._defineSchema();
		this._defineConverters();
		this._updateWidgetData();

		this.editor.commands.add( 'external', new ExternalDataWidgetCommand( this.editor ) );
	}

	_intervalFetch() {
		return setInterval( () => this._updateWidgetData(), 15000 ); // set time interval to 15s
	}

	async _updateWidgetData( externalUrl = RESOURCE_URL ) {
		try {
			const response = await fetch( externalUrl );
			const data = await response.json();
			const updateTime = new Date( data.closeTime );
			const parsedData = '$' + Number( data.lastPrice ).toFixed( 2 ) + ' - ' + updateTime.toLocaleString();

			this.externalDataValue = parsedData;

			const rootElement = this.editor.model.document.getRoot();

			for ( const { item } of this.editor.model.createRangeIn( rootElement ) ) {
				if ( item.is( 'element', 'externalElement' ) ) {
					this.editor.editing.reconvertItem( item );
				}
			}
		} catch ( error ) {
			console.error( error );
		}
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'externalElement', {
			inheritAllFrom: '$inlineObject',
			allowAttributes: [ 'data-resource-url' ]
		} );
	}

	_defineConverters() {
		const editor = this.editor;

		editor.conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				attributes: [ 'data-resource-url' ]
			},
			model: ( viewElement, { writer } ) => {
				const externalUrl = viewElement.getAttribute( 'data-resource-url' );

				return writer.createElement( 'externalElement', {
					'data-resource-url': externalUrl
				} );
			}
		} );

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'externalElement',
			view: ( modelElement, { writer } ) => {
				return writer.createEmptyElement( 'span', {
					'data-resource-url': modelElement.getAttribute( 'data-resource-url' )
				} );
			}
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'externalElement',
			view: ( modelElement, { writer } ) => {
				const externalValueToShow = this.externalDataValue;

				const externalDataPreviewElement = writer.createRawElement( 'span', null, function( domElement ) {
					domElement.textContent = externalValueToShow || 'Fetching data...';

					if ( externalValueToShow ) {
						domElement.classList.add( 'external-data-widget-bounce' );
						setTimeout( () => domElement.classList.remove( 'external-data-widget-bounce' ), 1100 );
					}
				} );

				const externalWidgetContainer = writer.createContainerElement( 'span', null, externalDataPreviewElement );

				return toWidget( externalWidgetContainer, writer, {
					label: 'External widget'
				} );
			}
		} );
	}
}

ClassicEditor
	.create( document.querySelector( '#snippet-external-data-widget' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, ExternalDataWidget ],
		toolbar: [ 'external', '|', 'heading', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'undo', 'redo' ]
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
