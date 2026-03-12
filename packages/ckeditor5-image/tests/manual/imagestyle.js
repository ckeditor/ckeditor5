/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { ImageUpload } from '../../src/imageupload.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

const TOOLBAR_CONFIG = [
	'heading',
	'|',
	'bold',
	'italic',
	'link',
	'bulletedList',
	'numberedList',
	'blockQuote',
	'uploadImage',
	'insertTable',
	'mediaEmbed',
	'undo',
	'redo'
];

const PLUGINS_CONFIG = [
	ArticlePluginSet,
	CloudServices,
	ImageUpload,
	EasyImage
];

startEditors();

async function startEditors() {
	window.editorSemantic = await ClassicEditor.create( document.querySelector( '#editor-semantic' ), {
		cloudServices: CS_CONFIG,
		plugins: PLUGINS_CONFIG,
		toolbar: TOOLBAR_CONFIG,
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:wrapText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		}
	} );

	window.editorFormatting = await ClassicEditor.create( document.querySelector( '#editor-formatting' ), {
		cloudServices: CS_CONFIG,
		plugins: PLUGINS_CONFIG,
		toolbar: TOOLBAR_CONFIG,
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		}
	} );

	window.editorWithDropdown = await ClassicEditor.create( document.querySelector( '#editor-with-dropdown' ), {
		cloudServices: CS_CONFIG,
		plugins: PLUGINS_CONFIG,
		toolbar: TOOLBAR_CONFIG,
		image: {
			toolbar: [
				{
					name: 'imageStyle:inlineImages',
					title: 'Inline image',
					defaultItem: 'imageStyle:inline',
					items: [ 'imageStyle:inline', 'imageStyle:alignLeft', 'imageStyle:alignRight' ]
				}, {
					name: 'imageStyle:blockImages',
					title: 'Block image',
					defaultItem: 'imageStyle:block',
					items: [ 'imageStyle:alignBlockLeft', 'imageStyle:block', 'imageStyle:alignBlockRight' ]
				},
				'|',
				'toggleImageCaption'
			]
		}
	} );

	CKEditorInspector.attach( {
		semantic: window.editorSemantic,
		formatting: window.editorFormatting,
		withDropdown: window.editorWithDropdown
	} );

	bindPreview( window.editorSemantic, 'preview-semantic' );
	bindPreview( window.editorFormatting, 'preview-formatting' );
	bindPreview( window.editorWithDropdown, 'preview-with-dropdown' );
}

function bindPreview( editor, previewId ) {
	const preview = document.querySelector( '#' + previewId );

	editor.model.document.on( 'change:data', () => {
		preview.innerHTML = editor.getData();
	} );

	preview.innerHTML = editor.getData();
}

