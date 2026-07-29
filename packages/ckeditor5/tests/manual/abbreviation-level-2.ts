/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { List } from '@ckeditor/ckeditor5-list';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

import { Plugin } from '@ckeditor/ckeditor5-core';

import { ButtonView, ContextualBalloon, clickOutsideHandler } from '@ckeditor/ckeditor5-ui';
import { FormView } from '../_utils/abbreviationView-level-2.js';

declare global {
	interface Window { editor: any }
}

class AbbreviationUI extends Plugin {
	declare private _balloon: ContextualBalloon;
	declare public formView: any;

	public static get requires() {
		return [ ContextualBalloon ];
	}
	public static get pluginName() {
		return 'AbbreviationUI' as const;
	}

	public init() {
		const editor = this.editor;
		const { t } = editor.locale;

		this._balloon = this.editor.plugins.get( ContextualBalloon );
		this.formView = this._createFormView();

		editor.ui.componentFactory.add( 'abbreviation', locale => {
			const button = new ButtonView( locale );

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

	public _createFormView() {
		const editor = this.editor;
		const formView = new FormView( editor.locale );

		// Execute the command after clicking the "Save" button.
		this.listenTo( formView, 'submit', () => {
			const title = formView.titleInputView.fieldView.element!.value;
			const abbr = formView.abbrInputView.fieldView.element!.value;

			editor.model.change( writer => {
				editor.model.insertContent( writer.createText( abbr, { abbreviation: title } ) );
			} );

			this._hideUI();
		} );

		// Hide the panel after clicking the "Cancel" button.
		this.listenTo( formView, 'cancel', () => {
			this._hideUI();
		} );

		clickOutsideHandler( {
			emitter: formView,
			activator: () => this._balloon.visibleView === formView,
			contextElements: [ this._balloon.view.element! ],
			callback: () => this._hideUI()
		} );

		return formView;
	}

	public _hideUI() {
		this.formView.abbrInputView.fieldView.value = '';
		this.formView.titleInputView.fieldView.value = '';
		this.formView.element.reset();

		this._balloon.remove( this.formView );

		// Focus the editing view after closing the form view.
		this.editor.editing.view.focus();
	}

	public _getBalloonPositionData() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;
		const target = () => view.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange()! );

		return {
			target
		};
	}
}

class AbbreviationEditing extends Plugin {
	public init() {
		this._defineSchema();
		this._defineConverters();
	}
	public _defineSchema() {
		const schema = this.editor.model.schema;
		schema.extend( '$text', {
			allowAttributes: [ 'abbreviation' ]
		} );
	}
	public _defineConverters() {
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
				value: ( viewElement: any ) => {
					const title = viewElement.getAttribute( 'title' );
					return title;
				}
			}
		} );
	}
}

class Abbreviation extends Plugin {
	public static get requires() {
		return [ AbbreviationEditing, AbbreviationUI ];
	}
}

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#snippet-abbreviation-plugin' ) as HTMLElement,
		cloudServices: CS_CONFIG,
		plugins: [ Essentials, Bold, Italic, Heading, List, Paragraph, Abbreviation ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'abbreviation' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
