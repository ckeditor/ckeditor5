/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, setInterval */

import Widget from '../../src/widget';
import { toWidget } from '../../src/utils';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

function MyPlugin( editor ) {
	editor.model.schema.register( 'div', {
		allowIn: [ '$root', 'div' ],
		isObject: true
	} );

	editor.model.schema.extend( '$text', {
		allowIn: 'div'
	} );

	editor.conversion.for( 'downcast' ).elementToElement( {
		model: 'div',
		view: ( modelElement, { writer } ) => {
			return toWidget( writer.createContainerElement( 'div', { class: 'widget' } ), writer );
		}
	} );

	editor.conversion.for( 'upcast' ).elementToElement( {
		model: 'div',
		view: 'div'
	} );
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Widget, MyPlugin ],
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
	} )
	.then( editor => {
		window.editor = editor;

		setInterval( () => {
			console.log( getModelData( editor.model ) );
			console.log( getViewData( editor.editing.view ) );
		}, 3000 );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
