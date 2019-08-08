/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import MathType from '@wiris/mathtype-ckeditor5';

ClassicEditor
	.create( document.querySelector( '#mathtype-editor' ), {
		plugins: [
			Essentials,
			Bold,
			Italic,
			Heading,
			MathType
		],
		toolbar: [ 'heading', '|', 'bold', 'italic', '|', 'undo', 'redo', '|', 'MathType', 'ChemType' ]
	} )
	.catch( err => {
		console.error( err.stack );
	} );
