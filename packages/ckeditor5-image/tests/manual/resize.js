/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EnterPlugin from '@ckeditor/ckeditor5-enter/src/enter';
import TypingPlugin from '@ckeditor/ckeditor5-typing/src/typing';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ImagePlugin from '../../src/image';
import ImageStyle from '../../src/imagestyle';
import ImageToolbar from '../../src/imagetoolbar';
import ImageCaption from '../../src/imagecaption';
import UndoPlugin from '@ckeditor/ckeditor5-undo/src/undo';
import ClipboardPlugin from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import List from '@ckeditor/ckeditor5-list/src/list';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Table from '@ckeditor/ckeditor5-table/src/table';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';

const commonConfig = {
	plugins: [ EnterPlugin, TypingPlugin, ParagraphPlugin, ImagePlugin, ImageStyle, ImageToolbar, ImageCaption,
		UndoPlugin, ClipboardPlugin, List, BlockQuote, Table, Indent, IndentBlock ],
	toolbar: [ 'undo', 'redo', 'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'indent' ],
	image: {
		toolbar: [ 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:side' ],
		styles: [
			'full',
			'alignLeft',
			'side' // Purposely using side image instead right aligned image to make sure it works well with both style types.
		]
	}
};

ClassicEditor
	.create( document.querySelector( '#editor' ), commonConfig )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#fancyEditor' ), commonConfig )
	.then( editor => {
		window.fancyEditor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

( function() {
	const optionsWrapper = document.getElementById( 'resizer-options' );
	const defaultConfig = {
		handler: [ 'top-left', 'top-right', 'bottom-right', 'bottom-left' ]
	};
	const dynamicStylesheet = document.createElement( 'style' );
	const cssRules = {};

	for ( const checkbox of optionsWrapper.querySelectorAll( 'input[name="handler[]"]' ) ) {
		checkbox.addEventListener( 'change', function() {
			const ruleValue = `.ck-widget__resizer.ck-widget__resizer-${ this.value } { display: none; }`;

			if ( this.value in cssRules ) {
				dynamicStylesheet.sheet.deleteRule( cssRules[ this.value ] );
				delete cssRules[ this.value ];
			}

			if ( !this.checked ) {
				cssRules[ this.value ] = dynamicStylesheet.sheet.insertRule( ruleValue );
			}
		} );

		if ( defaultConfig.handler.includes( checkbox.value ) ) {
			checkbox.checked = true;
		}
	}

	document.head.appendChild( dynamicStylesheet );

	// Resize using image
	document.getElementById( 'resize-image' ).addEventListener( 'change', function() {
		window.pocResizeUsingImage = this.checked;
	} );
}() );
