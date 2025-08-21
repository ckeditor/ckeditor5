/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Underline, Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';

import { TwoStepCaretMovement } from '../../src/twostepcaretmovement.js';

ClassicEditor
	.create( document.querySelector( '#editor-ltr' ), {
		plugins: [ Essentials, Paragraph, Underline, Bold, Italic, TwoStepCaretMovement ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'underline', 'italic' ]
	} )
	.then( editor => {
		const twoStepCaretMovement = editor.plugins.get( TwoStepCaretMovement );

		twoStepCaretMovement.registerAttribute( 'italic' );
		twoStepCaretMovement.registerAttribute( 'underline' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-rtl' ), {
		language: {
			content: 'he'
		},
		plugins: [ Essentials, Paragraph, Underline, Bold, Italic, TwoStepCaretMovement ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'underline', 'italic' ]
	} )
	.then( editor => {
		const twoStepCaretMovement = editor.plugins.get( TwoStepCaretMovement );

		twoStepCaretMovement.registerAttribute( 'italic' );
		twoStepCaretMovement.registerAttribute( 'underline' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
