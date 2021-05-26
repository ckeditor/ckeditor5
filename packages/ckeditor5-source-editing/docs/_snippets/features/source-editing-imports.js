/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import Markdown from '@ckeditor/ckeditor5-markdown-gfm/src/markdown';

ClassicEditor.builtinPlugins.push( SourceEditing );

ClassicEditor.defaultConfig = {
	cloudServices: CS_CONFIG,
	toolbar: {
		items: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'blockQuote',
			'|',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'uploadImage',
			'insertTable',
			'|',
			'sourceEditing',
			'|',
			'undo',
			'redo'
		],
		viewportTopOffset: window.getViewportTopOffsetConfig()
	},
	indentBlock: { offset: 30, unit: 'px' }
};

window.ClassicEditor = ClassicEditor;
window.Markdown = Markdown;
