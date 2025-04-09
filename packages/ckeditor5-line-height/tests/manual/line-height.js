/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console:false, window, document */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
// import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Image, ImageUpload, ImageInsert, ImageStyle, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table } from '@ckeditor/ckeditor5-table';

import { LineHeight } from '../../src/index.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

const config = {
	plugins: [
		Essentials, Link, List, LinkImage, Paragraph, Table, Image, ImageUpload, ImageStyle, ImageToolbar,
		CodeBlock, BlockQuote, EasyImage, CloudServices, ImageInsert, Heading, Bold, Italic, LineHeight
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
