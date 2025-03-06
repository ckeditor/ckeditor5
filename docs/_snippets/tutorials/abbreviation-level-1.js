/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor, Bold, Italic, Essentials, Heading, List, Paragraph, Plugin, ButtonView } from 'ckeditor5';
import {
	CS_CONFIG,
	getViewportTopOffsetConfig,
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';

class AbbreviationUI extends Plugin {
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'abbreviation', () => {
			const button = new ButtonView();

			button.label = 'Abbreviation';
			button.tooltip = true;
			button.withText = true;

			this.listenTo( button, 'execute', () => {
				const title = 'What You See Is What You Get';
				const abbr = 'WYSIWYG';

				editor.model.change( writer => {
					editor.model.insertContent( writer.createText( abbr, { abbreviation: title } ) );
				} );
			} );

			return button;
		} );
	}
}

class AbbreviationEditing extends Plugin {
	init() {
		this._defineSchema();
		this._defineConverters();
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
				top: getViewportTopOffsetConfig()
			}
		},
		plugins: [ Essentials, Bold, Italic, Heading, List, Paragraph, Abbreviation ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'abbreviation' ]
	} )
	.then( editor => {
		window.editor = editor;

		attachTourBalloon( {
			target: findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Abbreviation' ),
			text: 'Click here to insert the "WYSIWYG" abbreviation',
			editor
		} );
	} )
	.catch( err => {
		console.error( err );
	} );

