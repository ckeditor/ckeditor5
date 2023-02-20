/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, CKEditorInspector */

import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import InlineEditor from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';

import BlockToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

window.editors = {};

function createEditor( EditorConstructor, containerId, extraPlugins = [], afterCreate ) {
	const config = {
		initialData: document.getElementById( 'fixtures' ).innerHTML,
		plugins: [ ArticlePluginSet ],
		extraPlugins,
		toolbar: [
			'|',
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
		blockToolbar: [
			'heading',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		}
	};

	if ( extraPlugins.includes( SourceEditing ) ) {
		config.toolbar.unshift( 'sourceEditing', '|' );
	}

	EditorConstructor
		.create( document.querySelector( containerId ), config )
		.then( editor => {
			window.editors[ containerId ] = editor;

			if ( afterCreate ) {
				afterCreate( editor );
			}

			CKEditorInspector.attach( { [ containerId ]: editor } );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

createEditor( ClassicEditor, '#editor-classic', [ SourceEditing ] );
createEditor( InlineEditor, '#editor-inline' );
createEditor( BalloonEditor, '#editor-balloon' );
createEditor( BalloonEditor, '#editor-balloon-block', [ BlockToolbar ] );
createEditor( DecoupledEditor, '#editor-document', [], editor => {
	const toolbarContainer = document.querySelector( '#editor-document-toolbar' );

	toolbarContainer.appendChild( editor.ui.view.toolbar.element );
} );
