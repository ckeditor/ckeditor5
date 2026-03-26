/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Widget } from '../../src/widget.js';
import { toWidget } from '../../src/utils.js';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

function MyPlugin( editor ) {
	editor.model.schema.register( 'div', {
		allowIn: [ '$root' ],
		isObject: true
	} );

	editor.conversion.for( 'downcast' ).elementToElement( {
		model: 'div',
		view: ( modelElement, { writer } ) => {
			return toWidget( writer.createContainerElement( 'div', {
				class: 'widget'
			} ),
			writer,
			{ hasSelectionHandle: true } );
		}
	} );

	editor.conversion.for( 'upcast' ).elementToElement( {
		model: 'div',
		view: 'div'
	} );
}

const config = {
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
};

ClassicEditor
	.create( {
		...config,
		attachTo: document.querySelector( '#editor-ltr' )
	} )
	.then( editor => {
		window.editorLtr = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( Object.assign( {}, config, {
		language: 'ar',
		attachTo: document.querySelector( '#editor-rtl' )
	} ) )
	.then( editor => {
		window.editorRtl = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
