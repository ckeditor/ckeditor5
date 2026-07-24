/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { InlineEditor } from '../../src/inlineeditor.js';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';

declare global {
	interface Window { editors: any }
}

window.editors = {};

function initEditor( element: HTMLElement, placeholder?: string ) {
	InlineEditor
		.create( {
			root: {
				element,
				placeholder
			},
			plugins: [ Enter, Typing, Paragraph, Undo, Heading, Bold, Italic ],
			toolbar: [ 'heading', '|', 'bold', 'italic', 'undo', 'redo' ]
		} )
		.then( newEditor => {
			console.log( 'Editor was initialized', newEditor );

			window.editors[ element.id ] = newEditor;
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

initEditor( document.querySelector( '#editor-1' ) as HTMLElement );
initEditor( document.querySelector( '#editor-2' ) as HTMLElement, 'The placeholder from editor.config.root.placeholder' );
