---
category: widget-tutorials
order: 26
meta-title: Data from an external source tutorial | CKEditor 5 Documentation
modified_at: 2022-11-15
---

# Data from an external source

In this tutorial, you will learn how to implement a widget that fetches data from an external source and updates all own instances in a set interval of time.

You will build an "external data fetch" feature that allows users to insert a predefined widget that will show the current Bitcoin rate and it will be updated with the set time interval fetching data from a predefined external source. You will use widget utilities and conversion to define the behavior of this feature. Later on, you will use {@link framework/architecture/ui-library UI library} to create a {@link module:ui/button/buttonview~ButtonView} that will allow for inserting new instances of external source widgets. You will also learn how to update the widget data based on the editor API.

<info-box>
	If you want to see the final product of this tutorial before you plunge in, check out the [demo](#demo).
</info-box>

## Before you start

This guide assumes that you are familiar with the widgets concept introduced in the {@link tutorials/widgets/implementing-a-block-widget Implementing a block widget} and {@link tutorials/widgets/implementing-an-inline-widget Implementing an inline widget} tutorials. The tutorial also references various concepts concerning the {@link framework/architecture/intro CKEditor&nbsp;5 architecture}.

## Bootstrapping the project

The overall project structure will be similar to one described in the {@link tutorials/widgets/implementing-an-inline-widget#bootstrapping-the-project Bootstrapping the project} section of the "Implementing an inline widget" tutorial.

The easiest way to set up your project is to grab the starter files from the [GitHub repository for this tutorial](https://github.com/ckeditor/ckeditor5-tutorials-examples/tree/main/data-from-external-source). We gathered all the necessary dependencies there, including some CKEditor&nbsp;5 packages and other files needed to start the editor.

The editor has already been created in the `main.js` file with some basic plugins. All you need to do is clone the repository, navigate to the [starter-files directory](https://github.com/ckeditor/ckeditor5-tutorials-examples/tree/main/data-from-external-source/starter-files), run the `npm install` command, and you can start coding right away.

```bash
git clone https://github.com/ckeditor/ckeditor5-tutorials-examples
cd ckeditor5-tutorials-examples/data-from-external-source/starter-files

npm install
npm run dev
```

First, lets define the `ExternalDataWidget` plugin. The project structure should be as follows:

```plain
├── main.js
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
└── ...
```

You can see that the external data widget feature follows an established plugin structure: the master (glue) plugin (`external-data-widget/externaldatawidget.js`), the "editing" (`external-data-widget/externaldatawidgetediting.js`), and the "UI" (`external-data-widget/externaldatawidgetui.js`) parts.

The master (glue) plugin:

```js
// external-data-widget/externaldatawidget.js

import { Plugin } from 'ckeditor5';

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

import { Plugin } from 'ckeditor5';

export default class ExternalDataWidgetUI extends Plugin {
	init() {
		console.log( 'ExternalDataWidgetUI#init() got called' );
	}
}
```

And the editing part (empty for now):

```js
// external-data-widget/externaldatawidgetediting.js

import { Plugin } from 'ckeditor5';

export default class ExternalDataWidgetEditing extends Plugin {
	init() {
		console.log( 'ExternalDataWidgetEditing#init() got called' );
	}
}
```

Finally, you need to load the `ExternalDataWidget` plugin in your `main.js` file:

```js
// main.js

import { ClassicEditor, Bold, Italic, Essentials, Heading, List, Paragraph } from 'ckeditor5';
import ExternalDataWidget from './external-data-widget/externaldatawidget';
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

import 'ckeditor5/ckeditor5.css';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, ExternalDataWidget ],
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'undo', 'redo' ]
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );

		CKEditorInspector.attach( { editor: 'editor' } );

		// Expose for playing in the console.
		window.editor = editor;
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

At this stage you can run the project and open it in the browser to verify if it is loading correctly.

## The model and the view layers

The external data widget feature will be {@link module:engine/model/schema~SchemaItemDefinition defined as an inline} (text-like) element so it will be inserted into other editor blocks that allow text, like `<paragraph>`. The external data widget will also have a `data-resource-url` attribute. This means that the model representation of the external data widget will look like this:

```html
<paragraph>
	External value: <externalElement data-resource-url="RESOURCE_URL"></externalElement>.
</paragraph>
```

<info-box>
	The syntax presented above is used by our debugging tools, such as {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector}, which is particularly helpful when developing new rich-text editor features.
</info-box>

### Defining the schema

The schema definition of this widget is almost the same as in the {@link tutorials/widgets/implementing-an-inline-widget#defining-the-schema inline widget} tutorial, the only thing that is different is the `allowAttributes`. In our case we want to allow the `'data-resource-url'` attribute.
Instead of passing all the attributes to the configuration object we can use {@link framework/deep-dive/schema#generic-items generic items} to inherit already predefined options.

You can also use this opportunity to import the theme file (`theme/externaldatawidget.css`).

```js
// external-data-widget/externaldatawidgetediting.js

import { Plugin } from 'ckeditor5';

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

			// The external data widget can have many attributes
			allowAttributes: [ 'data-resource-url' ]
		} );
	}
}
```

Once the schema is defined, you can now define the model-view converters.

### Defining converters

The HTML structure (data output) of the converter will be a `<span>` with a `data-resource-url` attribute with the external resource URL as its value.

```html
<span data-resource-url="RESOURCE_URL"></span>
```

* {@link framework/deep-dive/conversion/upcast **Upcast conversion**}. This view-to-model converter will look for `<span>`s with the `data-resource-url` attribute and will create model `<externalElement>` elements with the same `data-resource-url` attribute set accordingly.
* {@link framework/deep-dive/conversion/downcast **Downcast conversion**}. The model-to-view conversion will be slightly different for the "editing" and "data" pipelines as the "editing downcast" pipeline will use widget utilities to enable widget-specific behavior in the editing view. In both pipelines, the element will be rendered using the same structure.

```js
// external-data-widget/externaldatawidgetediting.js

// ADDED 2 imports
import { Plugin, Widget, toWidget } from 'ckeditor5';

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
		// Previously registered schema.
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

As you might have noticed, the editing part imports the `./theme/externaldatawidget.css` CSS file which describes how the widget will look like and how it will be animated when a new value arrives:

```css
/* external-data-widget/theme/externaldatawidget.css */

.external-data-widget {
	border: 2px solid rgb(242, 169, 0);
}

.external-data-widget-bounce {
	animation: external-data-widget-bounce-animation 1.5s 1;
}

@keyframes external-data-widget-bounce-animation {
	0% {
		box-shadow: 0px 0px 0px 0px rgba(242, 169, 0, 1);
	}

	100% {
		box-shadow: 0px 0px 0px 10px rgba(242, 169, 0, 0);
	}
}
```

### The command

The {@link framework/architecture/core-editor-architecture#commands command} for the external data widget feature will insert an `<externalElement>` element (if allowed by the schema) at the selection and set the selection on the inserted widget.

```js
// external-data-widget/externaldatawidgetcommand.js

import { Command } from 'ckeditor5';

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

Import the newly created command and add it to the editor commands:

```js
// external-data-widget/externaldatawidgetediting.js

import { Plugin, Widget, toWidget } from 'ckeditor5';

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
		// Previously registered schema.
		// ...
	}

	_defineConverters() {
		// Previously defined converters.
		// ...
	}
}
```

## Creating the UI

The UI part provides a {@link module:ui/button/buttonview~ButtonView} that users can click to insert the external data widget into the editor.

Register and configure the toolbar button as shown below. The icon of the button can be found among official [Bitcoin promotional graphics](https://en.bitcoin.it/wiki/Promotional_graphics). Put the SVG file in the `./theme` directory and import it next to the UI plugin so it can be used by the button.

```js
// external-data-widget/externaldatawidgetui.js

import { Plugin, ButtonView } from 'ckeditor5';

import BitcoinLogoIcon from './theme/bitcoin-logo.svg';

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

			// Disable the external data widget button when the command is disabled.
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
// main.js

import {
	ClassicEditor,
	Bold,
	Italic,
	Essentials,
	Heading,
	List,
	Paragraph
} from 'ckeditor5';

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

In this tutorial we will use an external API that provides a current Bitcoin rate (in USD). This endpoint does not need any API keys and it is free to use but it has some [limitations](https://binance-docs.github.io/apidocs/spot/en/#limits).

```js
'https://api2.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'
```

The data will be fetched every 10 seconds. Each instance of the widget will be updated at the same time. To achieve that, we need to modify the `ExternalDataWidgetEditing` class.

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
		return setInterval( () => this._updateWidgetData(), 10000 ); // set time interval to 10s
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

			// Iterate over whole editor content, search for external data widget instances
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
		// Previously registered schema.
		// ...
	}

	_defineConverters() {
		// Previously defined upcast and data downcast converters.
		// ...

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'externalElement',
			view: ( modelElement, { writer } ) => {
				const externalValueToShow = this.externalDataValue;

				const externalDataPreviewElement = writer.createRawElement( 'span', null, function( domElement ) {
					// CSS class responsible for the appearance of the widget
					domElement.classList.add( 'external-data-widget' );
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

The editor content traversal can be a challenging process. The presented method is sufficient when there is relatively little content. Otherwise, a `WeakMap` will be a better option.

## Demo

You can see the external data widget implementation in action in the editor below.

{@snippet framework/tutorials/external-data-widget}

## Final solution

If you got lost at any point in the tutorial or want to go straight to the solution, there is a repository with the [final project](https://github.com/ckeditor/ckeditor5-tutorials-examples/tree/main/data-from-external-source/final-project) available.

```bash
git clone https://github.com/ckeditor/ckeditor5-tutorials-examples
cd ckeditor5-tutorials-examples/data-from-external-source/final-project

npm install
npm run dev
```
