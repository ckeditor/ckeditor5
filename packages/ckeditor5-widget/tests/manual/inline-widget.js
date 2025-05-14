/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Widget from '../../src/widget.js';
import { toWidget, viewToModelPositionOutsideModelElement } from '../../src/utils.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';

class InlineWidget extends Plugin {
	constructor( editor ) {
		super( editor );

		editor.model.schema.register( 'placeholder', {
			allowWhere: '$text',
			isObject: true,
			isInline: true,
			allowAttributesOf: '$text',
			allowAttributes: [ 'type' ]
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'placeholder',
			view: ( modelItem, conversionApi ) => {
				const widgetElement = createPlaceholderView( modelItem, conversionApi );

				return toWidget( widgetElement, conversionApi.writer );
			}
		} );

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'placeholder',
			view: createPlaceholderView
		} );

		editor.conversion.for( 'upcast' ).elementToElement( {
			view: 'placeholder',
			model: ( viewElement, { writer } ) => {
				let type = 'general';

				if ( viewElement.childCount ) {
					const text = viewElement.getChild( 0 );

					if ( text.is( '$text' ) ) {
						type = text.data.slice( 1, -1 );
					}
				}

				return writer.createElement( 'placeholder', { type } );
			}
		} );

		editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( editor.model, viewElement => viewElement.name == 'placeholder' )
		);

		this._createToolbarButton();

		function createPlaceholderView( modelItem, { writer } ) {
			const widgetElement = writer.createContainerElement( 'placeholder' );
			const viewText = writer.createText( '{' + modelItem.getAttribute( 'type' ) + '}' );

			writer.insert( writer.createPositionAt( widgetElement, 0 ), viewText );

			return widgetElement;
		}
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
					const attributes = model.document.selection.getAttributes();
					const placeholder = writer.createElement( 'placeholder', {
						...Object.fromEntries( attributes ),
						type: 'placeholder'
					} );

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
		plugins: [ Enter, Typing, Paragraph, Heading, Bold, Undo, Clipboard, Widget, ShiftEnter, InlineWidget, Table, Link ],
		toolbar: [ 'heading', '|', 'bold', 'link', '|', 'placeholder', '|', 'insertTable', '|', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;

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
	return data
		.replace( /<(paragraph|\/tableRow|tableCell|table|heading[0-5])>/g, '\n<$1>' )
		.replace( /(<tableCell>)\n(<paragraph>)/g, '$1$2' )
		.replace( /\n(<tableCell>)/g, '\n\t$1' );
}
