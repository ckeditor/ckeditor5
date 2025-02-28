/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console, window, document */

import MiniCKEditorInspector from '@ckeditor/ckeditor5-inspector/build/miniinspector.js';

// This file will be available when the documentation is built.
import { MiniInspectorEditor } from '../mini-inspector.js';

MiniInspectorEditor
	.create( document.querySelector( '#mini-inspector-basic-styles' ) )
	.then( editor => {
		window.editor = editor;

		MiniCKEditorInspector.attach(
			editor,
			document.querySelector( '#mini-inspector-basic-styles-container' )
		);
	} )
	.catch( err => {
		console.error( err.stack );
	} );
