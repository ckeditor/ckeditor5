/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, CKEditorInspector */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import { ImageResize } from '@ckeditor/ckeditor5-image';

window.editors = {};

function createEditor( selector, poweredByConfig ) {
	const config = {
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
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		}
	};

	if ( poweredByConfig ) {
		config.ui = { poweredBy: poweredByConfig };
	}

	ClassicEditor
		.create( document.querySelector( selector ), config )
		.then( editor => {
			window.editors[ selector ] = editor;

			CKEditorInspector.attach( { [ selector ]: editor } );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

createEditor( '#normal' );
createEditor( '#single-line' );
createEditor( '#dark-bg' );
createEditor( '#medium-bg' );
createEditor( '#narrow' );
createEditor( '#narrow-dark-bg' );
createEditor( '#padding-less' );
createEditor( '#overflow-parent' );
createEditor( '#position-border', {
	position: 'border'
} );
createEditor( '#custom-offset-default', {
	verticalOffset: 20,
	horizontalOffset: 75
} );
createEditor( '#custom-offset-on-border', {
	position: 'border',
	verticalOffset: -5,
	horizontalOffset: 0
} );
createEditor( '#custom-side-default', {
	side: 'left'
} );
createEditor( '#custom-side-on-border', {
	position: 'border',
	side: 'left'
} );
