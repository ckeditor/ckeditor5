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
import { ContextualBalloon, clickOutsideHandler } from '@ckeditor/ckeditor5-ui';
import FormView from './abbreviationView-level-3';

class AbbreviationUI extends Plugin {
	static get requires() {
		return [ ContextualBalloon ];
	}
	static get pluginName() {
		return 'AbbreviationUI';
	}

	init() {
		const editor = this.editor;
		this._createToolbarAbbreviationButton();
		this._balloon = editor.plugins.get( ContextualBalloon );
		this.formView = this._createFormView();
	}

	_createFormView() {
		const editor = this.editor;

		const formView = new FormView( editor.locale );

		// Execute the command after clicking the "Save" button.
		this.listenTo( formView, 'submit', () => {
			const value = {
				abbr: formView.abbrInputView.fieldView.element.value,
				title: formView.titleInputView.fieldView.element.value
			};
			editor.execute( 'addAbbreviation', value );
			this._hideFormView();
		} );

		// Hide the panel after clicking the "Cancel" button.
		this.listenTo( formView, 'cancel', () => {
			this._hideFormView();
		} );

		clickOutsideHandler( {
			emitter: formView,
			activator: () => this._balloon.visibleView === formView,
			contextElements: [ this._balloon.view.element ],
			callback: () => this._hideFormView()
		} );

		return formView;
	}

	_createToolbarAbbreviationButton() {
		const editor = this.editor;
		const { t } = editor.locale;

		editor.ui.componentFactory.add( 'abbreviation', locale => {
			const button = new ButtonView( locale );

			button.isEnabled = true;
			button.label = t( 'Abbreviation' );
			button.tooltip = true;
			button.withText = true;

			// Show the panel on button click.
			this.listenTo( button, 'execute', () => {
				this._balloon.add( {
					view: this.formView,
					position: this._getBalloonPositionData()
				} );

				this.formView.focus();
			} );

			return button;
		} );
	}

	_hideFormView() {
		this.formView.abbrInputView.fieldView.element.value = '';
		this.formView.titleInputView.fieldView.element.value = '';

		this._balloon.remove( this.formView );
	}

	_getBalloonPositionData() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;
		let target = null;

		target = () => view.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange() );

		return { target };
	}
}

class AbbreviationCommand extends Command {
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

