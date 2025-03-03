/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console, window, document, setTimeout */

import {
	Code,
	Strikethrough,
	Underline,
	CodeBlock,
	HorizontalLine,
	List,
	TodoList,
	AdjacentListsSupport,
	Markdown,
	PasteFromMarkdownExperimental,
	CKBox,
	CKBoxImageEdit,
	PictureEditing,
	ImageInsert,
	ImageResize,
	AutoImage,
	LinkImage,
	Font
} from 'ckeditor5';
import { SourceEditingEnhanced } from 'ckeditor5-premium-features';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
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
		SourceEditingEnhanced, Code, Strikethrough, Underline, Markdown, CodeBlock, HorizontalLine, List, TodoList,
		AdjacentListsSupport, PasteFromMarkdownExperimental, CKBox, CKBoxImageEdit,
		PictureEditing, ImageInsert, ImageResize, AutoImage, LinkImage, Font
	] );

ClassicEditor
	.create( document.querySelector( '#snippet-paste-from-markdown' ), {
		plugins,
		toolbar: {
			items: [
				'undo', 'redo', '|', 'sourceEditingEnhanced', '|', 'heading',
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
		}
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
