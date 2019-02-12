---
category: framework-tutorials
order: 10
menu-title: Implementing an inline widget
---

# Implementing an inline widget

In this tutorial you will learn how to implement an inline widget. We will build a "Placeholder" feature which allow the user to insert predefined placeholders into the document.

## Before you start

This guide assumes that you're familiar with {@link framework/tutorials/implementing-a-widget Implementing a simple widget} tutorial.

## Bootstrap project

Th overall project structure and concept will be similar as those described in {@link framework/guides/tutorials/implementing-a-widget#lets-start Let's start} & and {@link framework/guides/tutorials/implementing-a-widget#plugin-structure Plugin structure} sections. 

Install required dependencies:

```bash
npm install --save \
    postcss-loader \
    raw-loader \
    style-loader \
    webpack@4 \
    webpack-cli@3 \
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

Create minimal webpack configuration:

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
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            singleton: true
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

Add and `index.html` page:

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

### Project structure

The project will have a structure as below:

```
├── app.js
├── dist
│   ├── bundle.js
│   └── bundle.js.map
├── index.html
├── node_modules
├── package.json
├── placeholder
│   ├── placeholder.js
│   ├── placeholdercommand.js
│   ├── placeholderediting.js
│   ├── placeholderui.js
│   └── theme
│       └── placeholder.css
│
│   ... the rest of plugin files go here as well
│
└── webpack.config.js
``` 

The application entry point (`app.js`):

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import Placeholder from './placeholder/placeholder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, Widget, Placeholder ],
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

The master (glue) plugin:

```js
// placeholder/placeholder.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import PlaceholderEditing from './placeholderediting';
import PlaceholderUI from './placeholderui';

export default class Placeholder extends Plugin {
	static get requires() {
		return [ PlaceholderEditing, PlaceholderUI ];
	}
}
```

The ui (empty for now):

```js
// placeholder/placeholderui.js

export default class PlaceholderUI extends Plugin {
	init() {
		console.log( 'PlaceholderUI#init() got called' );
	}
}
```

The plugin is not ready yet - we will create an editing part in next step. 

## The model and the view layers

The placeholder feature will be represented as an inline (text-like) widget so it will be inserted in other editor blocks like `<paragraph>`:

```html
<paragraph>
    Hello <placeholder typte="name"></placeholder>!
</paragraph>
```

### Defining the schema

```js
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import './theme/placeholder.css';

export default class PlaceholderEditing extends Plugin {
	constructor( editor ) {
		super( editor );

		this._defineSchema();
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'placeholder', {
			// We want that our placeholder feature be allowed anywhere user can type:
			allowWhere: '$text',
			
			// The placeholder will acts as text (single character):
			isInline: true,
			
			// The inline-widget is self-contained so cannot be split by the caret and can be selected:
			isObject: true,
			
			// The placeholder can have many types, like date, name, surname, etc:
			allowAttributes: [ 'type' ]
		} );
	}
}
```

### Defining converters

The structure:

```html
<p>Hello <div data-placeholder="name">name</div>!</p>
```

```js
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

// Added imports:
import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

// Added theme file.
import './theme/placeholder.css';

export default class PlaceholderEditing extends Plugin {
	constructor( editor ) {
		super( editor );

		this._defineSchema();
		this._defineConverters();                                                   // ADDED
	}

	_defineConverters() {                                                           // ADDED
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).add( upcastElementToElement( {
			view: {
				name: 'span',
				attributes: [ 'data-placeholder' ]
			},
			model: ( viewElement, modelWriter ) => {
				const type = viewElement.getAttribute( 'data-placeholder' ) || 'general';

				return modelWriter.createElement( 'placeholder', { type } );
			}
		} ) );

		conversion.for( 'editingDowncast' ).add( downcastElementToElement( {
			model: 'placeholder',
			view: ( modelItem, viewWriter ) => {
				const widgetElement = createPlaceholderView( modelItem, viewWriter );

				// Enable widget handling on placeholder element inside editing view.
				return toWidget( widgetElement, viewWriter );
			}
		} ) );

		conversion.for( 'dataDowncast' ).add( downcastElementToElement( {
			model: 'placeholder',
			view: createPlaceholderView
		} ) );

		// Helper method for both downcast converters.
		function createPlaceholderView( modelItem, viewWriter ) {
			const type = modelItem.getAttribute( 'type' );

			const widgetElement = viewWriter.createContainerElement( 'span', { 'data-placeholder': type } );

			// Insert text node with type so the placeholder type will be displayed in the view.
			const innerText = viewWriter.createText( type );
			viewWriter.insert( viewWriter.createPositionAt( widgetElement, 0 ), innerText );

			return widgetElement;
		}
	}

	_defineSchema() {
		// ...
	}
}
```

As you could notice the editing part imports the `./theme/placeholder.css` CSS file which describes how the placeholder is displayed in th editing view. 

### Command
```js
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

import PlaceholderCommand from './placeholdercommand';                              // ADDED

import './theme/placeholder.css';

export default class PlaceholderEditing extends Plugin {
	init() {
		this._defineSchema();
		this._defineConverters();

		// ADDED
		this.editor.commands.add( 'placeholder', new PlaceholderCommand( this.editor ) );
	}

	_defineConverters() {
		// ...
	}

	_defineSchema() {
		// ...
	}
}

```

## Adding UI

The UI part will provide a dropdown button with placeholders selection

```js
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';

export default class PlaceholderUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		const placeholderTypes = [ 'date', 'first name', 'surname' ];

		editor.ui.componentFactory.add( 'placeholder', locale => {
			const dropdownView = createDropdown( locale );

			addListToDropdown( dropdownView, _prepareDropdownOptions( placeholderTypes ) );

			dropdownView.buttonView.set( {
				label: t( 'Placeholder' ),
				tooltip: true,
				withText: true
			} );

			this.listenTo( dropdownView, 'execute', evt => {
				editor.execute( 'placeholder', { value: evt.source.commandParam } );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}
}

function _prepareDropdownOptions( placeholderTypes ) {
	const itemDefinitions = new Collection();

	for ( const option of placeholderTypes ) {
		const def = {
			type: 'button',
			model: new Model( {
				commandParam: option,
				label: option,
				class: 'ck-fontsize-option',
				withText: true
			} )
		};

		// Add the option to the collection.
		itemDefinitions.add( def );
	}

	return itemDefinitions;
}
```

Add the dropdown to the toolbar: 

```js

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import Placeholder from './placeholder/placeholder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, Widget, Placeholder ],
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'placeholder' ]            // MODIFIED
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
