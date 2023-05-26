/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { Code } from '@ckeditor/ckeditor5-basic-styles';
import { CKBox } from '@ckeditor/ckeditor5-ckbox';
import { PictureEditing, ImageResize, AutoImage } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { CKEditorInspector } from '@ckeditor/ckeditor5-inspector';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

// Not exactly sure this is not covered in the build, gotta check that later, uh?
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard';

// This bad boy breaks everything down. I can't even.
import Mermaid from '@ckeditor/ckeditor5-mermaid/src/mermaid';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

ClassicEditor
	.create( document.querySelector( '#mermaid' ), {
		plugins: ClassicEditor.builtinPlugins.concat( [
			CodeBlock,
			Code,
			PictureEditing,
			ImageResize,
			AutoImage,
			LinkImage,
			CKBox,
			Typing,
			Enter,
			Clipboard,
			Mermaid
		] ),
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic', 'code',
				'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed', 'codeBlock', 'mermaid',
				'|', 'bulletedList', 'numberedList', 'todolist', 'outdent', 'indent'
			]
		},
		codeBlock: {
			languages: [
				{ language: 'plaintext', label: 'Plain text', class: '' },
				{ language: 'javascript', label: 'JavaScript' },
				{ language: 'python', label: 'Python' },
				{ language: 'mermaid', label: 'Mermaid' }
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;
		CKEditorInspector.attach( editor );
		window.console.log( 'CKEditor 5 is ready.', editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
