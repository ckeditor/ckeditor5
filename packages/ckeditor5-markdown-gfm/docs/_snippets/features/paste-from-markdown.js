/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console, window, document, setTimeout */

import { Code, Strikethrough, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { List, TodoList, AdjacentListsSupport } from '@ckeditor/ckeditor5-list';
import { Markdown, PasteFromMarkdownExperimental } from '@ckeditor/ckeditor5-markdown-gfm';
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import { PictureEditing, ImageInsert, ImageResize, AutoImage } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { Font } from '@ckeditor/ckeditor5-font';

import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

const plugins = ClassicEditor.builtinPlugins
	// Remove the `List` plugin as in a single demo we want to use the Document list feature.
	.filter( pluginConstructor => {
		if ( pluginConstructor.pluginName === 'List' ) {
			return false;
		}

		return true;
	} )
	// Then, add Markdown-specific features.
	.concat( [
		SourceEditing, Code, Strikethrough, Underline, Markdown, CodeBlock, HorizontalLine, List, TodoList,
		AdjacentListsSupport, PasteFromMarkdownExperimental, CKBox, CKBoxImageEdit,
		PictureEditing, ImageInsert, ImageResize, AutoImage, LinkImage, Font
	] );

ClassicEditor
	.create( document.querySelector( '#snippet-paste-from-markdown' ), {
		plugins,
		toolbar: {
			items: [
				'undo', 'redo', '|', 'sourceEditing', '|', 'heading',
				'|', 'bold', 'italic', 'underline', 'strikethrough', 'code',
				'-', 'link', 'insertImage', 'insertTable', 'mediaEmbed', 'blockQuote', 'codeBlock', 'horizontalLine',
				'|', 'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent'
			],
			shouldNotGroupWhenFull: true
		},
		cloudServices: CS_CONFIG,
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:wrapText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative',
				'|',
				'ckboxImageEdit'
			]
		},
		codeBlock: {
			languages: [
				{ language: 'css', label: 'CSS' },
				{ language: 'html', label: 'HTML' },
				{ language: 'javascript', label: 'JavaScript' },
				{ language: 'php', label: 'PHP' }
			]
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		licenseKey: 'GPL'
	} )
	.then( editor => {
		window.editor = editor;

		const outputElement = document.querySelector( '#snippet-paste-from-markdown-output' );

		editor.model.document.on( 'change', () => {
			outputElement.innerText = editor.getData();
		} );

		// Set the initial data with delay so hightlight.js doesn't catch it.
		setTimeout( () => {
			outputElement.innerText = editor.getData();
		}, 500 );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
