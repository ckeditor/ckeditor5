/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import { Strikethrough, Code } from '@ckeditor/ckeditor5-basic-styles';
import { TodoList } from '@ckeditor/ckeditor5-list';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

ClassicEditor
	.create( document.querySelector( '#snippet-autoformat' ), {
		plugins: ClassicEditor.builtinPlugins.concat( [
			Code,
			CodeBlock,
			HorizontalLine,
			Strikethrough,
			TodoList
		] ),
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic', 'underline', 'strikethrough', 'code',
				'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed', 'codeBlock', 'horizontalLine',
				'|', 'bulletedList', 'numberedList', 'todolist', 'outdent', 'indent'
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
		window.editorBasic = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
