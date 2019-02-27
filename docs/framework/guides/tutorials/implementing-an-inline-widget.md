---
category: framework-tutorials
order: 10
menu-title: Implementing an inline widget
---

# Implementing an inline widget

In this tutorial you will learn how to implement an inline widget. We will build a "Placeholder" feature which allow the user to insert a predefined placeholders, like date or surname, into the document. We will use widget utils and conversion in order to define the behavior of this feature. Later on, we will use dropdown utils to create a dropdown for the toolbar which will allow to select a placeholder to insert. We will also learn how to use editor configuration to pass placeholders types for the feature. 

## Before you start

This guide assumes that you're familiar with widgets concept introduced in the {@link framework/guides/tutorials/implementing-a-widget Implementing a simple widget} tutorial. We will also reference various concepts from {@link framework/guides/architecture/intro CKEditor 5 architecture}.

## Bootstrap project

Th overall project structure and concept will be similar as those described in {@link framework/guides/tutorials/implementing-a-widget#lets-start Let's start} and {@link framework/guides/tutorials/implementing-a-widget#plugin-structure Plugin structure} sections.

First, install required dependencies:

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

Before building the project we still need to define `Placeholder` plugin.

### Project structure

The project will have a structure as below:

```
├── app.js
├── dist
│   ├── bundle.js
│   └── bundle.js.map
├── index.html
├── node_modules
├── package.json
├── placeholder
│   ├── placeholder.js
│   ├── placeholdercommand.js
│   ├── placeholderediting.js
│   ├── placeholderui.js
│   └── theme
│       └── placeholder.css
│
│   ... the rest of plugin files go here as well
│
└── webpack.config.js
```

You can see that the `/placeholder` feature has an established plugin structure: the master (glue) plugin (`placeholder/placeholder.js`), the "editing" (`placeholder/placeholderediting.js`) and the "ui" (`placeholder/placeholderui.js`) parts.

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

And the editing part (empty for now):

```js
// placeholder/placeholderediting.js

export default class PlaceholderEditing extends Plugin {
	init() {
		console.log( 'PlaceholderEditing#init() got called' );
	}
}
```

At this stage we can build the project and open it in the browser to verify if it is building correctly.

## The model and the view layers

The placeholder feature will be {@link module:engine/model/schema~SchemaItemDefinition defined as  an inline} (text-like) widget so it will be inserted in other editor blocks, like `<paragraph>`, that allow text. The placeholder will have `type` attribute.

```html
<paragraph>
    Hello <placeholder typte="name"></placeholder>!
</paragraph>
```

### Defining the schema

The inline widget's `<placeholder>` element should be treated as `$text` so it must be defined with `isInline = true`. Also we want to put it wherever the `$text` is allowed so we add `allowWhere = '$text'`. Also the attribute `type` must be allowed for the `placeholder` element.

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

The schema is defined but we mast also add the converters for it.

### Defining converters

The HTML structure of the converter will be a `<span>` with `data-placeholder` attribute:

```html
<span data-placeholder="name">{name}</span>
```

The `data-placeholder` attribute holds the type of the placeholder and holds information of its type. The text inside `<span>` will be ignored during view-to-model conversion and will be generated based on placeholder's type in model-to-view conversion. 

#### The "upcast" conversion

In the view-to-model conversion we define converter that will create a model element. This converter will read the `data-placeholder` attribute value and create a `placeholder` element with a `type` attribute.

```js
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

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

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				attributes: [ 'data-placeholder' ]
			},
			model: ( viewElement, modelWriter ) => {
				const type = viewElement.getAttribute( 'data-placeholder' ) || 'general';
        
				return modelWriter.createElement( 'placeholder', { type } );
			}
		} );
	}

	_defineSchema() {
		// ...
	}
}
```

#### The "downcast" conversion

The view-to-model conversion will be different for "editing" and "data" pipelines as the "editing downcast" pipeline will use widget utilities to enable widget specific behavior in the editing view. In both pipelines the element will be rendered as using the same utility function.

```js
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

// Added theme file.
import './theme/placeholder.css';

export default class PlaceholderEditing extends Plugin {
	constructor( editor ) {
		super( editor );

		this._defineSchema();
		this._defineConverters();
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToElement( {
			// ...
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'placeholder',
			view: ( modelItem, viewWriter ) => {
				const widgetElement = createPlaceholderView( modelItem, viewWriter );

				// Enable widget handling on placeholder element inside editing view.
				return toWidget( widgetElement, viewWriter );
			}
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'placeholder',
			view: createPlaceholderView
		} );

		// Helper method for both downcast converters.
		function createPlaceholderView( modelItem, viewWriter ) {
			const type = modelItem.getAttribute( 'type' );

			const placeholderView = viewWriter.createContainerElement( 'span', {
				'data-placeholder': type
			} );

			// Insert text node with type so the placeholder type will be displayed in the view.
			const innerText = viewWriter.createText( `{ ${ type } }` );
			viewWriter.insert( viewWriter.createPositionAt( placeholderView, 0 ), innerText );

			return placeholderView;
		}
	}

	_defineSchema() {
		// ...
	}
}
```

As you could notice the editing part imports the `./theme/placeholder.css` CSS file which describes how the placeholder is displayed in th editing view:

```css
/* placeholder/theme/placeholder.css */

[data-placeholder] {
	background: #ffff00;
	padding: 4px 2px;
	outline-offset: -2px;
	line-height: 1em;
	margin: 0 1px;
}

[data-placeholder]::selection {
	display: none;
}
```

### Command

A {@link framework/guides/architecture/core-editor-architecture#commands command} for placeholder feature will insert a `<placeholder>` element (if allowed by schema) at the selection. The command will accept `options.value` parameter (other CKEditor 5's'commands also uses this pattern) to set a type of placeholder. 

```js
import Command from '@ckeditor/ckeditor5-core/src/command';

export default class PlaceholderCommand extends Command {
	execute( { value } ) {
		const editor = this.editor;

		editor.model.change( writer => {
			// Create 'placeholder' elment with type attribute...
			const placeholder = writer.createElement( 'placeholder', { type: value } );

			// ... and insert it into the document.
			editor.model.insertContent( placeholder );

			// Put the selection on inserted element.
			writer.setSelection( placeholder, 'on' );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const isAllowed = model.schema.checkChild( selection.focus.parent, 'placeholder' );

		this.isEnabled = isAllowed;
	}
}
```

Import the created command and add it to editor's commands:

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

The command can be executed in the editor:

```js
editor.execute( 'placeholder', { value: 'time' } );
```

This should result in:

@TODO inserted "time" placeholder 

The command should be enebled anywhere a text can be placed. You can check this by logging it value:

```js
console.log( editor.log( editor.commands.get( 'placeholder' ).isEnabled ) );
```

## Adding UI

The UI part will provide a dropdown button from which user can select a placeholder to insert into the editor.

The CKEditor 5 framework features helpers to create different {@link framework/guides/architecture/ui-library#dropdowns dropdowns} like toolbar or list dropdowns.

In this tutorial we will create a dropdown with list of available placeholders.

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

To make this plugin extensible the types of placeholders will be read from editor configuration.

First step is to define placeholder configuration in the editing plugin:

```js
// ... imports

export default class PlaceholderEditing extends Plugin {
	constructor( editor ) {
		super( editor );

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'placeholder', new PlaceholderCommand( this.editor ) );

		this.editor.config.define( 'placeholder', {                                 // ADDED
			types: [ 'date', 'first name', 'surname' ]
		} );
	}

	_defineConverters() {
		// ...
	}

	_defineSchema() {
		// ...
	}
}
```

Now let's modify the UI plugin so it will read placeholder types from the configuration:

```js
export default class PlaceholderUI extends Plugin {
	init() {
		const editor = this.editor;

		const placeholderTypes = editor.config.get( 'placeholder.types' );                  // CHANGED

		editor.ui.componentFactory.add( 'placeholder', locale => {
			// ...
		} );
	}
}
```

Now the plugins is ready to accept configuration. Let's check how this works by adding `placeholder` configuration in editor's create method:

```js
// ... imports

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, Widget, Placeholder ],
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'placeholder' ],
		placeholder: {
			types: [ 'model', 'make', 'color' ]                                             // ADDED
		}
	} )
	// ...
```

Now if you open the dropdown in the toolbar you'll see new list of placeholders to insert.

@todo Screenshoot of the editor with update toolbar.
