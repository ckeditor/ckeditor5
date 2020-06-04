/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Link from '../../src/link';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Link, Typing, Paragraph, Undo, Enter, Superscript ],
		toolbar: [ 'link', 'undo', 'redo' ],
		link: {
			addTargetToExternalLinks: true,
			defaultProtocol: 'http://'
		}
	} )
	.then( editor => {
		window.editor = editor;

		const LinkUIPlugin = editor.plugins.get( 'LinkUI' );
		const formView = LinkUIPlugin.formView;
		const defaultProtocol = editor.config.get( 'link.defaultProtocol' );

		document.getElementById( 'default-protocol' ).innerText = defaultProtocol;

		document.querySelectorAll( '#protocol-settings input[type="radio"]' ).forEach( radio => {
			radio.checked = radio.value === defaultProtocol;

			radio.addEventListener( 'click', ( {
				target: { value: protocol }
			} ) => {
				editor.config.set( 'link.defaultProtocol', protocol === 'none' ? undefined : protocol );

				// Change input placeholder just for manual test's case to provide more dynamic behavior.
				formView.urlInputView.fieldView.placeholder = protocol === 'none' ? 'https://example.com' : protocol + 'example.com';
			} );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
