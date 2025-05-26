/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Widget from '../../src/widget.js';
import { toWidget } from '../../src/utils.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

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
			toolbar: [ 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
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
