/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { _getModelData } from '@ckeditor/ckeditor5-engine';
import { global } from '@ckeditor/ckeditor5-utils';

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { Enter, ShiftEnter } from '@ckeditor/ckeditor5-enter';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Widget } from '../../src/widget.js';
import { toWidget, viewToModelPositionOutsideModelElement } from '../../src/utils.js';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard';
import { Table } from '@ckeditor/ckeditor5-table';
import { Link } from '@ckeditor/ckeditor5-link';

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
	modelDiv.innerText = formatData( _getModelData( editor.model ) );
}

function formatData( data ) {
	return data
		.replace( /<(paragraph|\/tableRow|tableCell|table|heading[0-5])>/g, '\n<$1>' )
		.replace( /(<tableCell>)\n(<paragraph>)/g, '$1$2' )
		.replace( /\n(<tableCell>)/g, '\n\t$1' );
}
