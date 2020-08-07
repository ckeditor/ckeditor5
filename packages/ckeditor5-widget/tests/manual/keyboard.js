/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import Widget from '../../src/widget';
import { toWidget, toWidgetEditable, viewToModelPositionOutsideModelElement } from '../../src/utils';
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
		view: ( modelElement, { writer } ) => {
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

function BlockWidgetWithNestedEditable( editor ) {
	const model = editor.model;

	model.schema.register( 'widget', {
		inheritAllFrom: '$block',
		isObject: true
	} );

	model.schema.register( 'nested', {
		allowIn: 'widget',
		isLimit: true
	} );

	model.schema.extend( '$block', {
		allowIn: 'nested'
	} );

	editor.conversion.for( 'dataDowncast' )
		.elementToElement( {
			model: 'widget',
			view: ( modelItem, writer ) => {
				return writer.createContainerElement( 'figure' );
			}
		} )
		.elementToElement( {
			model: 'nested',
			view: ( modelItem, writer ) => {
				return writer.createContainerElement( 'figcaption' );
			}
		} );

	editor.conversion.for( 'editingDowncast' )
		.elementToElement( {
			model: 'widget',
			view: ( modelItem, writer ) => {
				const div = writer.createContainerElement( 'figure' );

				return toWidget( div, writer, { label: 'widget label' } );
			}
		} )
		.elementToElement( {
			model: 'nested',
			view: ( modelItem, writer ) => {
				const nested = writer.createEditableElement( 'figcaption' );

				return toWidgetEditable( nested, writer );
			}
		} );

	editor.conversion.for( 'upcast' )
		.elementToElement( {
			view: 'figure',
			model: 'widget'
		} )
		.elementToElement( {
			view: 'figcaption',
			model: 'nested'
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
			model: 'placeholder'
		} );

		editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( editor.model, viewElement => viewElement.name == 'placeholder' )
		);

		function createPlaceholderView( modelItem, { writer } ) {
			const widgetElement = writer.createContainerElement( 'placeholder' );
			const viewText = writer.createText( '{placeholder}' );

			writer.insert( writer.createPositionAt( widgetElement, 0 ), viewText );

			return widgetElement;
		}
	}
}

const config = {
	plugins: [ ArticlePluginSet, Widget, InlineWidget, BlockWidget, BlockWidgetWithNestedEditable ],
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

		bindButtons( editor );
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

		bindButtons( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function bindButtons( editor ) {
	document.getElementById( 'wta-disable' ).addEventListener( 'click', () => {
		editor.plugins.get( 'WidgetTypeAround' ).forceDisabled();
	} );

	document.getElementById( 'wta-enable' ).addEventListener( 'click', () => {
		editor.plugins.get( 'WidgetTypeAround' ).clearForceDisabled();
	} );
}
