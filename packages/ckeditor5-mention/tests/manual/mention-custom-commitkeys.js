/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Mention from '../../src/mention.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';

import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';

import { keyCodes } from 'ckeditor5/src/utils.js';

class InlineWidget extends Plugin {
	constructor( editor ) {
		super( editor );

		editor.model.schema.register( 'placeholder', {
			allowWhere: '$text',
			isObject: true,
			isInline: true,
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
		plugins: [ ArticlePluginSet, Underline, Mention, InlineWidget ],
		toolbar: [
			'heading',
			'|', 'bulletedList', 'numberedList', 'blockQuote',
			'|', 'bold', 'italic', 'underline', 'link',
			'|', 'insertTable', 'placeholder',
			'|', 'undo', 'redo'
		],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
			tableToolbar: [ 'bold', 'italic' ]
		},
		mention: {
			commitKeys: [ keyCodes.a, keyCodes.space ],
			feeds: [
				{
					marker: '@',
					feed: [ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ]
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
