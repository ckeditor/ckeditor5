/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import Widget from '../../src/widget';
import { toWidget, viewToModelPositionOutsideModelElement } from '../../src/utils';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

function BlockWidget( editor ) {
	editor.model.schema.register( 'div', {
		allowIn: [ '$root' ],
		isObject: true
	} );

	editor.conversion.for( 'downcast' ).elementToElement( {
		model: 'div',
		view: ( modelElement, writer ) => {
			return toWidget(
				writer.createContainerElement( 'div', {
					class: 'widget'
				} ),
				writer,
				{ hasSelectionHandle: true }
			);
		}
	} );

	editor.conversion.for( 'upcast' ).elementToElement( {
		model: 'div',
		view: 'div'
	} );
}

class InlineWidget extends Plugin {
	constructor( editor ) {
		super( editor );

		editor.model.schema.register( 'placeholder', {
			allowWhere: '$text',
			isObject: true,
			isInline: true
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'placeholder',
			view: ( modelItem, viewWriter ) => {
				const widgetElement = createPlaceholderView( modelItem, viewWriter );

				return toWidget( widgetElement, viewWriter );
			}
		} );

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'placeholder',
			view: createPlaceholderView
		} );

		editor.conversion.for( 'upcast' ).elementToElement( {
			view: 'placeholder',
			model: 'placeholder'
		} );

		editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( editor.model, viewElement => viewElement.name == 'placeholder' )
		);

		function createPlaceholderView( modelItem, viewWriter ) {
			const widgetElement = viewWriter.createContainerElement( 'placeholder' );
			const viewText = viewWriter.createText( '{placeholder}' );

			viewWriter.insert( viewWriter.createPositionAt( widgetElement, 0 ), viewText );

			return widgetElement;
		}
	}
}

const config = {
	plugins: [ ArticlePluginSet, Widget, InlineWidget, BlockWidget ],
	toolbar: [
		'heading',
		'|',
		'bold',
		'italic',
		'link',
		'bulletedList',
		'numberedList',
		'blockQuote',
		'insertTable',
		'mediaEmbed',
		'undo',
		'redo'
	],
	image: {
		toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		]
	}
};

ClassicEditor
	.create( document.querySelector( '#editor-ltr' ), config )
	.then( editor => {
		window.editorLtr = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-rtl' ), Object.assign( {}, config, {
		language: 'ar'
	} ) )
	.then( editor => {
		window.editorRtl = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
