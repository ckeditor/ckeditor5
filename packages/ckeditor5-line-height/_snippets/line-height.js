/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console:false, window, document */

import {
	Essentials, BlockQuote, Bold, Italic, CloudServices, CodeBlock, Heading,
	Image, ImageUpload, ImageInsert, ImageStyle, ImageToolbar, Link, LinkImage,
	List, Paragraph, Table, LineHeight
} from 'ckeditor5';

import { ClassicEditor } from '@snippets/index.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

const config = {
	plugins: [
		Essentials, Link, List, LinkImage, Paragraph, Table, Image, ImageUpload, ImageStyle, ImageToolbar,
		CodeBlock, BlockQuote, CloudServices, ImageInsert, Heading, Bold, Italic, LineHeight
	],
	toolbar: [
		'lineHeight', '|',
		'undo', 'redo', '|',
		'heading', '|',
		'bold', 'italic', '|',
		'link', 'insertImage', 'insertTable', 'codeBlock', 'blockQuote', '|',
		'bulletedList', 'numberedList'
	],
	cloudServices: CS_CONFIG,
	menuBar: {
		isVisible: true
	},
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
};

// const { plugins, ...configWithoutPlugins } = config;

ClassicEditor
	.create( document.querySelector( '#editor' ), config )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
