/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import FontColor from '../../src/fontcolor';
import FontBackgroundColor from '../../src/fontbackgroundcolor';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet,
			FontColor,
			FontBackgroundColor
		],
		toolbar: [
			'heading',
			'|',
			'fontColor',
			'fontBackgroundColor',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'undo',
			'redo'
		],
		fontColor: {
			columns: 3
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function updateText( styleName ) {
	return evt => {
		const el = document.querySelector( '#color-box > p > span' );
		if ( el ) {
			el.style[ styleName ] = evt.target.value;
		}
	};
}

document.getElementById( 'color' ).addEventListener( 'change', updateText( 'color' ) );
document.getElementById( 'bgcolor' ).addEventListener( 'change', updateText( 'backgroundColor' ) );
