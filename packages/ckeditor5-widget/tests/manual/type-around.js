/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { toWidget, viewToModelPositionOutsideModelElement } from '../../src/utils';

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

		this._createToolbarButton();

		function createPlaceholderView( modelItem, viewWriter ) {
			const widgetElement = viewWriter.createContainerElement( 'placeholder' );
			const viewText = viewWriter.createText( '{inline-widget}' );

			viewWriter.insert( viewWriter.createPositionAt( widgetElement, 0 ), viewText );

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
					const placeholder = writer.createElement( 'placeholder' );

					model.insertContent( placeholder );

					writer.setSelection( placeholder, 'on' );
				} );
			} );

			return buttonView;
		} );
	}
}

document.querySelector( '#toggleReadOnly' ).addEventListener( 'click', () => {
	window.editor.isReadOnly = !window.editor.isReadOnly;
} );

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet,
			HorizontalLine,
			InlineWidget,
			MediaEmbed,
			TableProperties,
			TableCellProperties,
			ImageResize
		],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'blockQuote',
			'horizontalLine',
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
				'mergeTableCells',
				'tableProperties',
				'tableCellProperties'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

