/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { Code, Strikethrough } from '@ckeditor/ckeditor5-basic-styles';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { List, TodoList, DocumentList, TodoDocumentList, AdjacentListsSupport } from '@ckeditor/ckeditor5-list';
import { Markdown, PasteFromMarkdownExperimental } from '@ckeditor/ckeditor5-markdown-gfm';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

ClassicEditor.builtinPlugins = ClassicEditor.builtinPlugins
	// Remove the `List` plugin as in a single demo we want to use the Document list feature.
	.filter( pluginConstructor => {
		if ( pluginConstructor.pluginName === 'List' ) {
			return false;
		}

		return true;
	} )
	// Then, add Markdown-specific features.
	.concat( [
		SourceEditing,
		Code, Strikethrough,
		Markdown,
		CodeBlock,
		HorizontalLine
	] );

ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'undo', 'redo', '|', 'sourceEditing', '|', 'heading',
			'|', 'bold', 'italic', 'strikethrough', 'code',
			'-', 'link', 'uploadImage', 'insertTable', 'mediaEmbed', 'blockQuote', 'codeBlock', 'horizontalLine',
			'|', 'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent'
		],
		shouldNotGroupWhenFull: true
	},
	cloudServices: CS_CONFIG,
	image: {
		toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative' ]
	},
	codeBlock: {
		languages: [
			{ language: 'css', label: 'CSS' },
			{ language: 'html', label: 'HTML' },
			{ language: 'javascript', label: 'JavaScript' },
			{ language: 'php', label: 'PHP' }
		]
	},
	ui: {
		viewportOffset: {
			top: window.getViewportTopOffsetConfig()
		}
	}
};

window.ClassicEditor = ClassicEditor;
window.CKEditorPlugins = {
	List, TodoList,
	DocumentList, TodoDocumentList, AdjacentListsSupport,
	PasteFromMarkdownExperimental
};
