/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Command from '@ckeditor/ckeditor5-core/src/command';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { ContextualBalloon, View } from '@ckeditor/ckeditor5-ui';
import FormView from './abbreviationView';

class AbbreviationUI extends Plugin {
	static get requires() {
		return [ ContextualBalloon ];
	}
	static get pluginName() {
		return 'AbbreviationUI';
	}

	init() {
		const editor = this.editor;
		const t = editor.t;
		this.formView = this._createFormView();
		this._createToolbarAbbreviationButton();
		this._balloon = editor.plugins.get( ContextualBalloon );

		// editor.ui.componentFactory.add( 'abbreviation', locale => {
		// 	const button = new ButtonView( locale );
		// 	// const balloon = new ContextualBalloon( locale );
		// 	const command = editor.commands.get( 'addAbbreviation' );

		// 	const formView = new FormView( locale, command );
		// 	// formView.abbrInputView.fieldView.bind( 'value' ).to( Command, 'value' );
		// 	console.log( formView );
		// 	// balloon.add( formView );

		// 	button.set( {
		// 		label: 'Abbreviation',
		// 		withText: true
		// 	} );
		// 	button.bind( 'isEnabled' ).to( command );
		// 	// button.on( 'execute', () => {
		// 	// 	editor.execute( 'addAbbreviation' );
		// 	// } );
		// 	this.listenTo( button, 'execute', () => this._addFormView() );
		// 	return button;
		// } );
	}

	_createFormView() {
		const editor = this.editor;
		const command = editor.commands.get( 'addAbreviation' );

		const formView = new FormView( editor.locale );

		// formView.abbrInputView.fieldView.bind( 'value' ).to( command, 'value' );

		// formView.saveButtonView.bind( 'isEnabled' ).to( command );

		// // Execute link command after clicking the "Save" button.
		// this.listenTo( formView, 'submit', () => {
		// 	const { value } = formView.abbrInputView.fieldView.element;
		// 	editor.execute( 'addAbbreviation', value );
		// 	this._balloon.remove( this.formView );
		// } );

		// // Hide the panel after clicking the "Cancel" button.
		// this.listenTo( formView, 'cancel', () => {
		// 	this._balloon.remove( this.formView );
		// } );

		return formView;
	}

	/**
	 * Creates a toolbar Link button. Clicking this button will show
	 * a {@link #_balloon} attached to the selection.
	 *
	 * @private
	 */
	_createToolbarAbbreviationButton() {
		const editor = this.editor;
		const command = editor.commands.get( 'addAbreviation' );
		const t = editor.t;

		editor.ui.componentFactory.add( 'abbreviation', locale => {
			const button = new ButtonView( locale );

			button.isEnabled = true;
			button.label = t( 'Abbreviation' );
			button.tooltip = true;
			button.isToggleable = true;
			button.withText = true;

			// Bind button to the command.
			// button.bind( 'isEnabled' ).to( command, 'isEnabled' );
			// button.bind( 'isOn' ).to( command, 'value', value => !!value );
			// Show the panel on button click.
			this.listenTo( button, 'execute', () => {
				console.log( this._balloon.hasView() );
				console.log( this.formView );
				console.log( this._balloon );
				this._balloon.add( {
					view: this.formView,
					position: this._getBalloonPositionData()
				} );
			} );

			return button;
		} );
	}

	_getBalloonPositionData() {
		const view = this.editor.editing.view;
		const model = this.editor.model;
		const viewDocument = view.document;
		let target = null;

		// Make sure the target is calculated on demand at the last moment because a cached DOM range
		// (which is very fragile) can desynchronize with the state of the editing view if there was
		// any rendering done in the meantime. This can happen, for instance, when an inline widget
		// gets unlinked.
		target = () => {
			view.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange() );
		};

		return { target };
	}
}

class AbbreviationCommand extends Command {
	execute() {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const title = prompt( 'Title' );
		const abbr = prompt( 'Abbreviation' );

		editor.model.change( writer => {
			writer.insertText( abbr, { 'abbreviation': title }, selection.getFirstPosition() );
			for ( const range of selection.getRanges() ) {
				writer.remove( range );
			}
		} );
	}
}

class AbbreviationEditing extends Plugin {
	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'addAbbreviation', new AbbreviationCommand( this.editor ) );
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

class Abbreviation extends Plugin {
	static get requires() {
		return [ AbbreviationEditing, AbbreviationUI ];
	}
}

ClassicEditor
	.create( document.querySelector( '#snippet-abbreviation-plugin' ), {
		cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		plugins: [ Essentials, Bold, Italic, Heading, List, Paragraph, Abbreviation ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'abbreviation' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );

