/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import FontColor from '../../../../src/fontcolor.js';
import FontBackgroundColor from '../../../../src/fontbackgroundcolor.js';
import { BalloonToolbar } from '@ckeditor/ckeditor5-ui';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [
			ArticlePluginSet,
			FontColor,
			FontBackgroundColor,
			BalloonToolbar
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
		},
		balloonToolbar: [ 'bold', 'italic', 'fontColor' ]
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
