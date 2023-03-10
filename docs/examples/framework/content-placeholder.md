---
category: examples-framework
order: 140
toc: false
classes: main__content--no-toc
modified_at: 2022-12-19
---

# Content placeholder

The editor presented below offers a custom plugin that lets you add predefined placeholders, such as a date or a surname, to the document. The placeholders are inserted as inline widgets.

{@snippet framework/tutorials/inline-widget}

## Detailed guide

If you would like to create such a feature on your own, take a look at the {@link framework/tutorials/implementing-an-inline-widget dedicated tutorial} which shows how to achieve this step by step with the source code provided. 

## Editor example configuration

<details>
<summary>View editor configuration script</summary>

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

			// ... and insert it into the document.
			editor.model.insertContent( placeholder );

			// Put the selection on the inserted element.
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

class Placeholder extends Plugin {
	static get requires() {
		return [ PlaceholderEditing, PlaceholderUI ];
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
			// Allow wherever text is allowed:
			allowWhere: '$text',

			// The placeholder will act as an inline node:
			isInline: true,

			// The inline widget is self-contained so it cannot be split by the caret and it can be selected:
			isObject: true,

			// The inline widget can have the same attributes as text (for example linkHref, bold).
			allowAttributesOf: '$text',

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
	.create( document.querySelector( '#snippet-inline-widget' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, Placeholder ],
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'placeholder',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'uploadImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		placeholderConfig: {
			types: [ 'date', 'color', 'first name', 'surname' ]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
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

</details>

<details>
<summary>View editor content listing</summary>

```
<style>
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
</style>

<div id="snippet-inline-widget">
	<p>Hello <span class="placeholder">{first name}</span> <span class="placeholder">{surname}</span>!</p>
</div>
```

</details>