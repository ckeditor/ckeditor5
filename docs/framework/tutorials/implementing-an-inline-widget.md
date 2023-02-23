---
category: framework-tutorials
order: 15
---

# Implementing an inline widget

In this tutorial, you will learn how to implement an inline widget.

You will build a "placeholder" feature that allows the users to insert predefined placeholders, like a date or a surname, into the document. You will use widget utilities and conversion in order to define the behavior of this feature. Later on, you will use dropdown utilities to create a dropdown that will allow for inserting new placeholders. You will also learn how to use the editor configuration to define allowed placeholder names.

<info-box>
	If you want to see the final product of this tutorial before you plunge in, check out the [demo](#demo).
</info-box>

## Before you start ⚠️

This guide assumes that you are familiar with the widgets concept introduced in the {@link framework/tutorials/implementing-a-block-widget Implementing a block widget} tutorial. The tutorial will also reference various concepts from the {@link framework/architecture/intro CKEditor 5 architecture}.

## Bootstrapping the project

The overall project structure will be similar to one described in {@link framework/tutorials/implementing-a-block-widget#lets-start Let's start} and {@link framework/tutorials/implementing-a-block-widget#plugin-structure Plugin structure} sections of the "Implementing a block widget" tutorial.

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
	@ckeditor/ckeditor5-widget \
	@ckeditor/ckeditor5-inspector
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

import Placeholder from './placeholder/placeholder';

import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, Placeholder ],
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList' ]
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

Before building the project you still need to define the `Placeholder` plugin. The project will have a structure as below:

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
│   ... the rest of the plugin files go here as well.
│
└── webpack.config.js
```

You can see that the placeholder feature has an established plugin structure: the master (glue) plugin (`placeholder/placeholder.js`), the "editing" (`placeholder/placeholderediting.js`) and the "UI" (`placeholder/placeholderui.js`) parts.

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

The UI part (empty for now):

```js
// placeholder/placeholderui.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class PlaceholderUI extends Plugin {
	init() {
		console.log( 'PlaceholderUI#init() got called' );
	}
}
```

And the editing part (empty for now):

```js
// placeholder/placeholderediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class PlaceholderEditing extends Plugin {
	init() {
		console.log( 'PlaceholderEditing#init() got called' );
	}
}
```

At this stage you can build the project and open it in the browser to verify if it is building correctly.

## The model and the view layers

The placeholder feature will be {@link module:engine/model/schema~SchemaItemDefinition defined as an inline} (text-like) element so it will be inserted into other editor blocks, like `<paragraph>`, that allow text. The placeholder will have a `name` attribute. This means that the model containing some text and a placeholder will look like this:

```html
<paragraph>
	Hello <placeholder name="name"></placeholder>!
</paragraph>
```

### Defining the schema

The `<placeholder>` element should be treated as an object in `$text` so it must be defined with `inheritAllFrom: '$inlineObject'`. You will also need the `name` attribute.

You will also use this opportunity to import the theme file (`theme/placeholder.css`).

```js
// placeholder/placeholderediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import './theme/placeholder.css';                                              // ADDED

export default class PlaceholderEditing extends Plugin {
	init() {
		console.log( 'PlaceholderEditing#init() got called' );

		this._defineSchema();                                                  // ADDED
	}

	_defineSchema() {                                                          // ADDED
		const schema = this.editor.model.schema;

		schema.register( 'placeholder', {
			// Behaves like a self-contained inline object (e.g. an inline image)
			// allowed in places where $text is allowed (e.g. in paragraphs).
			// The inline widget can have the same attributes as text (for example linkHref, bold).
			inheritAllFrom: '$inlineObject',

			// The placeholder can have many types, like date, name, surname, etc:
			allowAttributes: [ 'name' ]
		} );
	}
}
```

The schema is defined so now you can define the model-view converters.

### Defining converters

The HTML structure (data output) of the converter will be a `<span>` with a `placeholder` class. The text inside the `<span>` will be the placeholder's name.

```html
<span class="placeholder">{name}</span>
```

* {@link framework/deep-dive/conversion/upcast **Upcast conversion**}. This view-to-model converter will look for `<span>`s with the `placeholder` class, read the `<span>`'s text and create model `<placeholder>` elements with the `name` attribute set accordingly.
* {@link framework/deep-dive/conversion/downcast **Downcast conversion**}. The model-to-view conversion will be slightly different for "editing" and "data" pipelines as the "editing downcast" pipeline will use widget utilities to enable widget-specific behavior in the editing view. In both pipelines, the element will be rendered using the same structure.

```js
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

// ADDED 2 imports
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import './theme/placeholder.css';

export default class PlaceholderEditing extends Plugin {
	static get requires() {                                                    // ADDED
		return [ Widget ];
	}

	init() {
		console.log( 'PlaceholderEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();                                              // ADDED
	}

	_defineSchema() {
		// Previously registered schema.
		// ...
	}

	_defineConverters() {                                                      // ADDED
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				classes: [ 'placeholder' ]
			},
			model: ( viewElement, { writer: modelWriter } ) => {
				// Extract the "name" from "{name}".
				const name = viewElement.getChild( 0 ).data.slice( 1, -1 );

				return modelWriter.createElement( 'placeholder', { name } );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'placeholder',
			view: ( modelItem, { writer: viewWriter } ) => {
				const widgetElement = createPlaceholderView( modelItem, viewWriter );

				// Enable widget handling on a placeholder element inside the editing view.
				return toWidget( widgetElement, viewWriter );
			}
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'placeholder',
			view: ( modelItem, { writer: viewWriter } ) => createPlaceholderView( modelItem, viewWriter )
		} );

		// Helper method for both downcast converters.
		function createPlaceholderView( modelItem, viewWriter ) {
			const name = modelItem.getAttribute( 'name' );

			const placeholderView = viewWriter.createContainerElement( 'span', {
				class: 'placeholder'
			} );

			// Insert the placeholder name (as a text).
			const innerText = viewWriter.createText( '{' + name + '}' );
			viewWriter.insert( viewWriter.createPositionAt( placeholderView, 0 ), innerText );

			return placeholderView;
		}
	}
}
```

### Feature styles

As you could notice, the editing part imports the `./theme/placeholder.css` CSS file which describes how the placeholder is displayed in th editing view:

```css
/* placeholder/theme/placeholder.css */

.placeholder {
	background: #ffff00;
	padding: 4px 2px;
	outline-offset: -2px;
	line-height: 1em;
	margin: 0 1px;
}

.placeholder::selection {
	display: none;
}
```

### Command

The {@link framework/architecture/core-editor-architecture#commands command} for the placeholder feature will insert a `<placeholder>` element (if allowed by the schema) at the selection. The command will accept the `options.value` parameter (other CKEditor 5 commands also use this pattern) to set the placeholder name.

```js
// placeholder/placeholdercommand.js

import Command from '@ckeditor/ckeditor5-core/src/command';

export default class PlaceholderCommand extends Command {
	execute( { value } ) {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		editor.model.change( writer => {
			// Create a <placeholder> element with the "name" attribute (and all the selection attributes)...
			const placeholder = writer.createElement( 'placeholder', {
				...Object.fromEntries( selection.getAttributes() ),
                name: value
			} );

			// ... and insert it into the document. Put the selection on the inserted element.
			editor.model.insertObject( placeholder, null, null, { setSelection: 'on' } );
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

Import the created command and add it to the editor commands:

```js
// placeholder/placeholderediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import PlaceholderCommand from './placeholdercommand';                         // ADDED
import './theme/placeholder.css';

export default class PlaceholderEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		console.log( 'PlaceholderEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();

		// ADDED
		this.editor.commands.add( 'placeholder', new PlaceholderCommand( this.editor ) );
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

### Let's see it!

You can rebuild the project now. You should be able to execute the `placeholder` command to insert a new placeholder:

```js
editor.execute( 'placeholder', { value: 'time' } );
```

This should result in:

{@img assets/img/tutorial-implementing-an-inline-widget-1.png Screenshot of a placeholder widget in action in CKEditor 5 WYSIWYG editor.}

### Fixing position mapping

If you play more with the widget (e.g. try to select it by dragging the mouse from its right to the left edge) you will see the following error logged to the console:

```
Uncaught CKEditorError: model-nodelist-offset-out-of-bounds: Given offset cannot be found in the node list.
```

This error is thrown because there is a difference in text node mapping between the model and the view due to the different structures:

```html
model:

foo<placeholder name="time"></placeholder>bar

view:

foo<span class="placeholder">{name}</span>bar
```

You could say that in the view there is "more" text than in the model. This means that some positions in the view cannot automatically map to positions in the model. Namely &mdash; those are positions inside the `<span>` element.

Fortunately, CKEditor 5 {@link module:engine/conversion/mapper~Mapper#event:viewToModelPosition allows customizing the mapping logic}. Also, since mapping to an empty model element is a pretty common scenario, there is a ready-to-use utility {@link module:widget/utils~viewToModelPositionOutsideModelElement `viewToModelPositionOutsideModelElement()`} that you can use here like that:

```js
// placeholder/placeholderediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

// MODIFIED
import {
	toWidget,
	viewToModelPositionOutsideModelElement
} from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import PlaceholderCommand from './placeholdercommand';

import './theme/placeholder.css';

export default class PlaceholderEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		console.log( 'PlaceholderEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'placeholder', new PlaceholderCommand( this.editor ) );

		// ADDED
		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'placeholder' ) )
		);
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

After adding the custom mapping, the mapping will work perfectly. Every position inside the view `<span>` element will be mapped to a position outside the `<placeholder>` in the model.

## Creating the UI

The UI part will provide a dropdown button from which the user can select a placeholder to insert into the editor.

CKEditor 5 Framework includes helpers to create different {@link framework/architecture/ui-library#dropdowns dropdowns} like toolbar or list dropdowns.

In this tutorial, you will create a dropdown with a list of available placeholders.

```js
// placeholder/placeholderui.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';

export default class PlaceholderUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;
		const placeholderNames = [ 'date', 'first name', 'surname' ];

		// The "placeholder" dropdown must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add( 'placeholder', locale => {
			const dropdownView = createDropdown( locale );

			// Populate the list in the dropdown with items.
			addListToDropdown( dropdownView, getDropdownItemsDefinitions( placeholderNames ) );

			dropdownView.buttonView.set( {
				// The t() function helps localize the editor. All strings enclosed in t() can be
				// translated and change when the language of the editor changes.
				label: t( 'Placeholder' ),
				tooltip: true,
				withText: true
			} );

			// Disable the placeholder button when the command is disabled.
			const command = editor.commands.get( 'placeholder' );
			dropdownView.bind( 'isEnabled' ).to( command );

			// Execute the command when the dropdown item is clicked (executed).
			this.listenTo( dropdownView, 'execute', evt => {
				editor.execute( 'placeholder', { value: evt.source.commandParam } );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}
}

function getDropdownItemsDefinitions( placeholderNames ) {
	const itemDefinitions = new Collection();

	for ( const name of placeholderNames ) {
		const definition = {
			type: 'button',
			model: new Model( {
				commandParam: name,
				label: name,
				withText: true
			} )
		};

		// Add the item definition to the collection.
		itemDefinitions.add( definition );
	}

	return itemDefinitions;
}
```

Add the dropdown to the toolbar:

```js
// app.js

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import Placeholder from './placeholder/placeholder';

import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, Placeholder ],

		// Insert the "placeholder" dropdown into the editor toolbar.
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'placeholder' ]
	} )
	.then( editor => {
		// This code runs after the editor initialization.
		// ...
	} )
	.catch( error => {
		// Error handling if something goes wrong during initialization.
		// ...
	} );
```

To make this plugin extensible, placeholder types will be read from the editor configuration.

The first step is to define the placeholder configuration in the editing plugin:

```js
// Previously imported packages.
// ...

export default class PlaceholderEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		console.log( 'PlaceholderEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'placeholder', new PlaceholderCommand( this.editor ) );

		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'placeholder' ) )
		);

		this.editor.config.define( 'placeholderConfig', {                           // ADDED
			types: [ 'date', 'first name', 'surname' ]
		} );
	}

	_defineConverters() {
		// Previously defined converters.
		// ...
	}

	_defineSchema() {
		// Previously registered schema.
		// ...
	}
}
```

Now modify the UI plugin so it will read placeholder types from the configuration:

```js
// placeholder/placeholderui.js

export default class PlaceholderUI extends Plugin {
	init() {
		const editor = this.editor;

		const placeholderNames = editor.config.get( 'placeholderConfig.types' );            // CHANGED

		editor.ui.componentFactory.add( 'placeholder', locale => {
			// Previously registered dropdown among UI components.
			// ...
		} );
	}
}
```

The plugin is now ready to accept the configuration. Check how this works by adding the `placeholderConfig` configuration in the editor's `create()` method:

```js
// Previously imported packages.
// ...

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, Widget, Placeholder ],
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'placeholder' ],
		placeholderConfig: {
			types: [ 'date', 'color', 'first name', 'surname' ]                             // ADDED
		}
	} )
	// Promise handling.
	// ...
```

If you open the dropdown in the toolbar, you will see a new list of placeholders to insert.

{@img assets/img/tutorial-implementing-an-inline-widget-2.png Screenshot of the placeholder widgets being inserted using the dropdown in CKEditor 5 WYSIWYG editor.}

## Demo

You can see the placeholder widget implementation in action in the editor below. You can also check out the full [source code](#final-solution) of this tutorial if you want to develop your own inline widgets.

{@snippet framework/tutorials/inline-widget}

## Final solution

The following code snippet contains a complete implementation of the `Placeholder` plugin (and all its dependencies) and the code to run the editor. You can paste it into the `app.js` file and it will run out–of–the–box:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Command from '@ckeditor/ckeditor5-core/src/command';

import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';

class Placeholder extends Plugin {
	static get requires() {
		return [ PlaceholderEditing, PlaceholderUI ];
	}
}

class PlaceholderCommand extends Command {
	execute( { value } ) {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		editor.model.change( writer => {
			// Create a <placeholder> element with the "name" attribute (and all the selection attributes)...
			const placeholder = writer.createElement( 'placeholder', {
				...Object.fromEntries( selection.getAttributes() ),
				name: value
			} );

			// ... and insert it into the document. Put the selection on the inserted element.
			editor.model.insertObject( placeholder, null, null, { setSelection: 'on' } );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const isAllowed = model.schema.checkChild( selection.focus.parent, 'placeholder' );

		this.isEnabled = isAllowed;
	}
}

class PlaceholderUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;
		const placeholderNames = editor.config.get( 'placeholderConfig.types' );

		// The "placeholder" dropdown must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add( 'placeholder', locale => {
			const dropdownView = createDropdown( locale );

			// Populate the list in the dropdown with items.
			addListToDropdown( dropdownView, getDropdownItemsDefinitions( placeholderNames ) );

			dropdownView.buttonView.set( {
				// The t() function helps localize the editor. All strings enclosed in t() can be
				// translated and change when the language of the editor changes.
				label: t( 'Placeholder' ),
				tooltip: true,
				withText: true
			} );

			// Disable the placeholder button when the command is disabled.
			const command = editor.commands.get( 'placeholder' );
			dropdownView.bind( 'isEnabled' ).to( command );

			// Execute the command when the dropdown item is clicked (executed).
			this.listenTo( dropdownView, 'execute', evt => {
				editor.execute( 'placeholder', { value: evt.source.commandParam } );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}
}

function getDropdownItemsDefinitions( placeholderNames ) {
	const itemDefinitions = new Collection();

	for ( const name of placeholderNames ) {
		const definition = {
			type: 'button',
			model: new Model( {
				commandParam: name,
				label: name,
				withText: true
			} )
		};

		// Add the item definition to the collection.
		itemDefinitions.add( definition );
	}

	return itemDefinitions;
}

class PlaceholderEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		console.log( 'PlaceholderEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'placeholder', new PlaceholderCommand( this.editor ) );

		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'placeholder' ) )
		);
		this.editor.config.define( 'placeholderConfig', {
			types: [ 'date', 'first name', 'surname' ]
		} );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'placeholder', {
			// Behaves like a self-contained inline object (e.g. an inline image)
			// allowed in places where $text is allowed (e.g. in paragraphs).
			// The inline widget can have the same attributes as text (for example linkHref, bold).
			inheritAllFrom: '$inlineObject',

			// The placeholder can have many types, like date, name, surname, etc:
			allowAttributes: [ 'name' ]
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				classes: [ 'placeholder' ]
			},
			model: ( viewElement, { writer: modelWriter } ) => {
				// Extract the "name" from "{name}".
				const name = viewElement.getChild( 0 ).data.slice( 1, -1 );

				return modelWriter.createElement( 'placeholder', { name } );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'placeholder',
			view: ( modelItem, { writer: viewWriter } ) => {
				const widgetElement = createPlaceholderView( modelItem, viewWriter );

				// Enable widget handling on a placeholder element inside the editing view.
				return toWidget( widgetElement, viewWriter );
			}
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'placeholder',
			view: ( modelItem, { writer: viewWriter } ) => createPlaceholderView( modelItem, viewWriter )
		} );

		// Helper method for both downcast converters.
		function createPlaceholderView( modelItem, viewWriter ) {
			const name = modelItem.getAttribute( 'name' );

			const placeholderView = viewWriter.createContainerElement( 'span', {
				class: 'placeholder'
			} );

			// Insert the placeholder name (as a text).
			const innerText = viewWriter.createText( '{' + name + '}' );
			viewWriter.insert( viewWriter.createPositionAt( placeholderView, 0 ), innerText );

			return placeholderView;
		}
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, Placeholder ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'placeholder' ],
		placeholderConfig: {
			types: [ 'date', 'color', 'first name', 'surname' ]
		}
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
