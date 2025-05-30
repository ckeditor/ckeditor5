/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';

import TwoStepCaretMovement from '../../../src/twostepcaretmovement.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Bold, Italic, TwoStepCaretMovement ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ]
	} )
	.then( editor => {
		const twoStepCaretMovement = editor.plugins.get( TwoStepCaretMovement );

		twoStepCaretMovement.registerAttribute( 'bold' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
