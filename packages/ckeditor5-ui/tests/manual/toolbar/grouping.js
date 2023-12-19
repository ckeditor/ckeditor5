/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { ButtonView, ToolbarView } from '../../../src/index.js';
import { Locale } from '@ckeditor/ckeditor5-utils';

createEditor( '#editor-ltr', 'en', 'en' );
createEditor( '#editor-rtl-mixed', 'ar', 'en' );
createEditor( '#editor-rtl', 'ar', 'ar' );
setupPlayground();

function setupPlayground() {
	const playgroundToolbarView = new ToolbarView( new Locale(), {
		shouldGroupWhenFull: true
	} );

	playgroundToolbarView.render();

	function createButton( label ) {
		const button = new ButtonView();

		button.set( {
			label,
			withText: true
		} );

		return button;
	}

	playgroundToolbarView.items.addMany( new Array( 15 ).fill( 0 ).map( ( i, index ) => createButton( index ) ) );

	document.querySelector( '#add' ).addEventListener( 'click', () => {
		playgroundToolbarView.items.add( createButton( playgroundToolbarView.items.length ) );
	} );

	document.querySelector( '#remove' ).addEventListener( 'click', () => {
		playgroundToolbarView.items.remove( playgroundToolbarView.items.length - 1 );
	} );

	document.querySelector( '#clear' ).addEventListener( 'click', () => {
		playgroundToolbarView.items.clear();
	} );

	document.querySelector( '#playground' ).appendChild( playgroundToolbarView.element );
}

function createEditor( selector, language, uiLanguageCode ) {
	ClassicEditor
		.create( document.querySelector( selector ), {
			plugins: [ ArticlePluginSet ],
			toolbar: [
				'heading',
				'|',
				'bold',
				'italic',
				'link',
				'|',
				'bulletedList',
				'numberedList',
				'blockQuote',
				'insertTable',
				'mediaEmbed',
				'|',
				'undo',
				'redo'
			],
			image: {
				toolbar: [ 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative' ]
			},
			table: {
				contentToolbar: [
					'tableColumn',
					'tableRow',
					'mergeTableCells'
				]
			},
			language: {
				ui: uiLanguageCode,
				content: language
			}
		} )
		.then( editor => {
			window.editor = editor;
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}
