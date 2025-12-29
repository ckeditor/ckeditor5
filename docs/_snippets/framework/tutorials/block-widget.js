/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	ClassicEditor,
	Bold,
	Italic,
	Essentials,
	Heading,
	List,
	Paragraph,
	Command,
	Plugin,
	ButtonView,
	SwitchButtonView,
	Widget,
	toWidget,
	toWidgetEditable,
	WidgetToolbarRepository,
	isWidget
} from 'ckeditor5';

import { getViewportTopOffsetConfig } from '@snippets/index.js';

class SimpleBox extends Plugin {
	static get requires() {
		return [ SimpleBoxEditing, SimpleBoxUI, SimpleBoxToolbar ];
	}
}

class SimpleBoxUI extends Plugin {
	init() {
		console.log( 'SimpleBoxUI#init() got called' );

		const editor = this.editor;
		const t = editor.t;

		// The "simpleBox" button must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add( 'simpleBox', locale => {
			// The state of the button will be bound to the widget command.
			const command = editor.commands.get( 'insertSimpleBox' );

			// The button will be an instance of ButtonView.
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				// The t() function helps localize the editor. All strings enclosed in t() can be
				// translated and change when the language of the editor changes.
				label: t( 'Simple Box' ),
				withText: true,
				tooltip: true
			} );

			// Bind the state of the button to the command.
			buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute the command when the button is clicked (executed).
			this.listenTo( buttonView, 'execute', () => {
				editor.execute( 'insertSimpleBox' );
				editor.editing.view.focus();
			} );

			return buttonView;
		} );

		// Register the "secretSimpleBox" switch button for toggling the secret state.
		editor.ui.componentFactory.add( 'secretSimpleBox', locale => {
			const command = editor.commands.get( 'makeSimpleBoxSecret' );
			const switchButton = new SwitchButtonView( locale );

			switchButton.set( {
				label: t( 'Secret box' ),
				withText: true
			} );

			// Bind the switch's properties to the command.
			switchButton.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute the command when the switch is toggled.
			this.listenTo( switchButton, 'execute', () => {
				editor.execute( 'makeSimpleBoxSecret', { value: !command.value } );
			} );

			return switchButton;
		} );
	}
}

class SimpleBoxEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		console.log( 'SimpleBoxEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'insertSimpleBox', new InsertSimpleBoxCommand( this.editor ) );
		this.editor.commands.add( 'makeSimpleBoxSecret', new MakeSimpleBoxSecretCommand( this.editor ) );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'simpleBox', {
			// Behaves like a self-contained object (e.g. an image).
			isObject: true,

			// Allow in places where other blocks are allowed (e.g. directly in the root).
			allowWhere: '$block',

			// Allow the 'secret' attribute on simpleBox elements.
			allowAttributes: [ 'secret' ]
		} );

		schema.register( 'simpleBoxTitle', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'simpleBox',

			// Allow content which is allowed in blocks (i.e. text with attributes).
			allowContentOf: '$block'
		} );

		schema.register( 'simpleBoxDescription', {
			// Cannot be split or left by the caret.
			isLimit: true,

			allowIn: 'simpleBox',

			// Allow content which is allowed in the root (e.g. paragraphs).
			allowContentOf: '$root'
		} );

		schema.addChildCheck( ( context, childDefinition ) => {
			if ( context.endsWith( 'simpleBoxDescription' ) && childDefinition.name == 'simpleBox' ) {
				return false;
			}
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		// <simpleBox> converters
		conversion.for( 'upcast' ).elementToElement( {
			model: 'simpleBox',
			view: {
				name: 'section',
				classes: 'simple-box'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'simpleBox',
			view: {
				name: 'section',
				classes: 'simple-box'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'simpleBox',
			view: ( modelElement, { writer: viewWriter } ) => {
				const section = viewWriter.createContainerElement( 'section', { class: 'simple-box' } );

				// Set custom property to later check the view element.
				viewWriter.setCustomProperty( 'simpleBox', true, section );

				return toWidget( section, viewWriter, { label: 'simple box widget' } );
			}
		} );

		// Handle the 'secret' attribute conversion between model and view.
		conversion.for( 'upcast' ).attributeToAttribute( {
			view: {
				name: 'section',
				key: 'class',
				value: 'secret'
			},
			model: 'secret'
		} );
		conversion.for( 'downcast' ).attributeToAttribute( {
			model: 'secret',
			view: {
				name: 'section',
				key: 'class',
				value: 'secret'
			}
		} );

		// <simpleBoxTitle> converters
		conversion.for( 'upcast' ).elementToElement( {
			model: 'simpleBoxTitle',
			view: {
				name: 'h1',
				classes: 'simple-box-title'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'simpleBoxTitle',
			view: {
				name: 'h1',
				classes: 'simple-box-title'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'simpleBoxTitle',
			view: ( modelElement, { writer: viewWriter } ) => {
				// Note: You use a more specialized createEditableElement() method here.
				const h1 = viewWriter.createEditableElement( 'h1', { class: 'simple-box-title' } );

				return toWidgetEditable( h1, viewWriter );
			}
		} );

		// <simpleBoxDescription> converters
		conversion.for( 'upcast' ).elementToElement( {
			model: 'simpleBoxDescription',
			view: {
				name: 'div',
				classes: 'simple-box-description'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'simpleBoxDescription',
			view: {
				name: 'div',
				classes: 'simple-box-description'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'simpleBoxDescription',
			view: ( modelElement, { writer: viewWriter } ) => {
				// Note: You use a more specialized createEditableElement() method here.
				const div = viewWriter.createEditableElement( 'div', { class: 'simple-box-description' } );

				return toWidgetEditable( div, viewWriter );
			}
		} );
	}
}

class InsertSimpleBoxCommand extends Command {
	execute() {
		this.editor.model.change( writer => {
			// Insert <simpleBox>*</simpleBox> at the current selection position
			// in a way that will result in creating a valid model structure.
			this.editor.model.insertContent( createSimpleBox( writer ) );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'simpleBox' );

		this.isEnabled = allowedIn !== null;
	}
}

function createSimpleBox( writer ) {
	const simpleBox = writer.createElement( 'simpleBox' );
	const simpleBoxTitle = writer.createElement( 'simpleBoxTitle' );
	const simpleBoxDescription = writer.createElement( 'simpleBoxDescription' );

	writer.append( simpleBoxTitle, simpleBox );
	writer.append( simpleBoxDescription, simpleBox );

	// There must be at least one paragraph for the description to be editable.
	// See https://github.com/ckeditor/ckeditor5/issues/1464.
	writer.appendElement( 'paragraph', simpleBoxDescription );

	return simpleBox;
}

class MakeSimpleBoxSecretCommand extends Command {
	refresh() {
		const editor = this.editor;
		const element = getClosestSelectedSimpleBoxElement( editor.model.document.selection );

		this.isEnabled = !!element;
		this.value = !!( element && element.getAttribute( 'secret' ) );
	}

	execute( { value } ) {
		const editor = this.editor;
		const model = editor.model;
		const simpleBox = getClosestSelectedSimpleBoxElement( model.document.selection );

		if ( simpleBox ) {
			model.change( writer => {
				if ( value ) {
					writer.setAttribute( 'secret', true, simpleBox );
				} else {
					writer.removeAttribute( 'secret', simpleBox );
				}
			} );
		}
	}
}

function getClosestSelectedSimpleBoxElement( selection ) {
	const selectedElement = selection.getSelectedElement();

	if ( !!selectedElement && selectedElement.is( 'element', 'simpleBox' ) ) {
		return selectedElement;
	} else {
		return selection.getFirstPosition().findAncestor( 'simpleBox' );
	}
}

class SimpleBoxToolbar extends Plugin {
	static get requires() {
		return [ WidgetToolbarRepository ];
	}

	afterInit() {
		const editor = this.editor;
		const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );

		widgetToolbarRepository.register( 'simpleBoxToolbar', {
			items: editor.config.get( 'simpleBox.toolbar' ),
			getRelatedElement: getClosestSimpleBoxWidget
		} );
	}
}

function getClosestSimpleBoxWidget( selection ) {
	const selectionPosition = selection.getFirstPosition();

	if ( !selectionPosition ) {
		return null;
	}

	const viewElement = selection.getSelectedElement();

	if ( viewElement && isSimpleBoxWidget( viewElement ) ) {
		return viewElement;
	}

	let parent = selectionPosition.parent;

	while ( parent ) {
		if ( parent.is( 'element' ) && isSimpleBoxWidget( parent ) ) {
			return parent;
		}

		parent = parent.parent;
	}

	return null;
}

function isSimpleBoxWidget( viewElement ) {
	return !!viewElement.getCustomProperty( 'simpleBox' ) && isWidget( viewElement );
}

ClassicEditor
	.create( document.querySelector( '#snippet-block-widget' ), {
		plugins: [ Essentials, Bold, Italic, Heading, List, Paragraph, SimpleBox ],
		toolbar: {
			items: [ 'heading', '|', 'bold', 'italic', 'numberedList', 'bulletedList', 'simpleBox' ]
		},
		simpleBox: {
			toolbar: [ 'secretSimpleBox' ]
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );

		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
