/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console */

import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

class InlineWidget extends Plugin {
	constructor( editor ) {
		super( editor );

		editor.model.schema.register( 'placeholder', {
			allowWhere: '$text',
			isObject: true,
			allowAttributes: [ 'type' ]
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'placeholder',
			view: ( modelItem, viewWriter ) => {
				const widgetElement = createPlaceholderView( viewWriter, modelItem );

				return toWidget( widgetElement, viewWriter );
			}
		} );

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'placeholder',
			view: createPlaceholderView
		} );

		editor.conversion.for( 'upcast' ).elementToElement( {
			view: 'placeholder',
			model: ( viewElement, modelWriter ) => {
				let type = 'general';

				if ( viewElement.childCount ) {
					const text = viewElement.getChild( 0 );

					if ( text.is( 'text' ) ) {
						type = text.data;
					}
				}

				return modelWriter.createElement( 'placeholder', { type } );
			}
		} );

		function createPlaceholderView( viewWriter, modelItem ) {
			const widgetElement = viewWriter.createContainerElement( 'placeholder' );

			viewWriter.insert( viewWriter.createPositionAt( widgetElement, 0 ), viewWriter.createText( modelItem.getAttribute( 'type' ) ) );
			return widgetElement;
		}

		this._createToolbarButton();
	}

	_createToolbarButton() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'placeholder', locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Insert placeholder' ),
				tooltip: true,
				withText: true
			} );

			this.listenTo( buttonView, 'execute', () => {
				const model = editor.model;

				model.change( writer => {
					const placeholder = writer.createElement( 'placeholder', { type: 'placeholder' } );

					model.insertContent( placeholder );

					writer.setSelection( placeholder, 'on' );
				} );
			} );

			return buttonView;
		} );
	}
}

ClassicEditor
	.create( global.document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, Heading, Bold, Undo, Widget, InlineWidget ],
		toolbar: [ 'heading', '|', 'bold', '|', 'placeholder', '|', 'undo', 'redo' ]
	} )
	.then( editor => {
		editor.model.document.on( 'change', () => {
			printModelContents( editor );
		} );

		printModelContents( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const modelDiv = global.document.querySelector( '#model' );

function printModelContents( editor ) {
	modelDiv.innerText = formatData( getData( editor.model ) );
}

function formatData( data ) {
	return data.replace( /<(paragraph)>/g, '\n<$1>' );
}
