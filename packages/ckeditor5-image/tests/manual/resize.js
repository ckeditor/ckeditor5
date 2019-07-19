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
import UndoPlugin from '@ckeditor/ckeditor5-undo/src/undo';
import ClipboardPlugin from '@ckeditor/ckeditor5-clipboard/src/clipboard';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ EnterPlugin, TypingPlugin, ParagraphPlugin, ImagePlugin, UndoPlugin, ClipboardPlugin ],
		toolbar: [ 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
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
}() );
