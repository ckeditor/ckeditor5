/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { ImageResize } from '@ckeditor/ckeditor5-image';

const licenseKey = window.prompt( 'Enter valid key' ); // eslint-disable-line no-alert

window.editors = {};

function createEditor( selector ) {
	ClassicEditor
		.create( document.querySelector( selector ), {
			plugins: [ ArticlePluginSet, ImageResize ],
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
				'insertTable',
				'mediaEmbed',
				'undo',
				'redo'
			],
			image: {
				toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
			},
			...( licenseKey && { licenseKey } ),
			table: {
				contentToolbar: [
					'tableColumn',
					'tableRow',
					'mergeTableCells'
				]
			},
			ui: {
				poweredBy: {
					forceVisible: true
				}
			}
		} )
		.then( editor => {
			window.editors[ selector ] = editor;

			CKEditorInspector.attach( { [ selector ]: editor } );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

createEditor( '#force-visible' );
