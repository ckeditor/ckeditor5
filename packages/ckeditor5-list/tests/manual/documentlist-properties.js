/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, CKEditorInspector */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage.js';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed.js';
import HtmlComment from '@ckeditor/ckeditor5-html-support/src/htmlcomment.js';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage.js';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak.js';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle.js';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar.js';
import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

import List from '../../src/documentlist.js';
import ListProperties from '../../src/documentlistproperties.js';

const config = {
	plugins: [
		Essentials, BlockQuote, Bold, Heading, Image, ImageCaption, ImageStyle, ImageToolbar, Indent, Italic, Link,
		MediaEmbed, Paragraph, Table, TableToolbar, CodeBlock, TableCaption, EasyImage, ImageResize, LinkImage,
		AutoImage, HtmlEmbed, HtmlComment, Alignment, PageBreak, HorizontalLine, ImageUpload,
		CloudServices, SourceEditing, List, ListProperties
	],
	toolbar: [
		'sourceEditing', '|',
		'numberedList', 'bulletedList',
		'outdent', 'indent', '|',
		'heading', '|',
		'bold', 'italic', 'link', '|',
		'blockQuote', 'uploadImage', 'insertTable', 'mediaEmbed', 'codeBlock', '|',
		'htmlEmbed', '|',
		'alignment', '|',
		'pageBreak', 'horizontalLine', '|',
		'undo', 'redo'
	],
	cloudServices: CS_CONFIG,
	table: {
		contentToolbar: [
			'tableColumn', 'tableRow', 'mergeTableCells', 'toggleTableCaption'
		]
	},
	image: {
		styles: [
			'alignCenter',
			'alignLeft',
			'alignRight'
		],
		resizeOptions: [
			{
				name: 'resizeImage:original',
				label: 'Original size',
				value: null
			},
			{
				name: 'resizeImage:50',
				label: '50%',
				value: '50'
			},
			{
				name: 'resizeImage:75',
				label: '75%',
				value: '75'
			}
		],
		toolbar: [
			'imageTextAlternative', 'toggleImageCaption', '|',
			'imageStyle:inline', 'imageStyle:breakText', 'imageStyle:wrapText', '|',
			'resizeImage'
		]
	},
	placeholder: 'Type the content here!',
	htmlEmbed: {
		showPreviews: true,
		sanitizeHtml: html => ( { html, hasChange: false } )
	},
	menuBar: {
		isVisible: true
	}
};

function createEditor( idSuffix, properties ) {
	ClassicEditor
		.create( document.querySelector( '#editor-' + idSuffix ), {
			...config,
			list: {
				properties
			}
		} )
		.then( editor => {
			window[ 'editor_' + idSuffix ] = editor;

			CKEditorInspector.attach( { [ idSuffix ]: editor } );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

createEditor( 'all', {
	styles: true,
	startIndex: true,
	reversed: true
} );

createEditor( 'style-start', {
	styles: true,
	startIndex: true,
	reversed: false
} );

createEditor( 'style-reversed', {
	styles: true,
	startIndex: false,
	reversed: true
} );

createEditor( 'start-reversed', {
	styles: false,
	startIndex: true,
	reversed: true
} );

createEditor( 'start', {
	styles: false,
	startIndex: true,
	reversed: false
} );

createEditor( 'reversed', {
	styles: false,
	startIndex: false,
	reversed: true
} );

createEditor( 'style', {
	styles: true,
	startIndex: false,
	reversed: false
} );

createEditor( 'style-bulleted-only', {
	styles: {
		listTypes: 'bulleted'
	},
	startIndex: true,
	reversed: true
} );

createEditor( 'style-bulleted-only-styles', {
	styles: {
		listTypes: 'bulleted'
	},
	startIndex: false,
	reversed: false
} );

createEditor( 'style-numbered-only', {
	styles: {
		listTypes: 'numbered'
	},
	startIndex: true,
	reversed: true
} );

createEditor( 'style-numbered-only-styles', {
	styles: {
		listTypes: 'numbered'
	},
	startIndex: false,
	reversed: false
} );

createEditor( 'style-attribute', {
	styles: { useAttribute: true },
	startIndex: false,
	reversed: false
} );

createEditor( 'none', {
	styles: false,
	startIndex: false,
	reversed: false
} );
