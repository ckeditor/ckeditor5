/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import MiniCKEditorInspector from '@ckeditor/ckeditor5-inspector/build/miniinspector.js';
import { MiniInspectorEditor } from '@snippets/mini-inspector.js';

MiniInspectorEditor
	.create( document.querySelector( '#mini-inspector-paragraph' ) )
	.then( editor => {
		window.editor = editor;

		MiniCKEditorInspector.attach(
			editor,
			document.querySelector( '#mini-inspector-paragraph-container' )
		);
	} )
	.catch( err => {
		console.error( err.stack );
	} );
