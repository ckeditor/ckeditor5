/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, CKEditorInspector */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed';
import HtmlComment from '@ckeditor/ckeditor5-html-support/src/htmlcomment';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

import DocumentList from '../../src/documentlist';
import DocumentListProperties from '../../src/documentlistproperties';

const config = {
	plugins: [
		Essentials, BlockQuote, Bold, Heading, Image, ImageCaption, ImageStyle, ImageToolbar, Indent, Italic, Link,
		MediaEmbed, Paragraph, Table, TableToolbar, CodeBlock, TableCaption, EasyImage, ImageResize, LinkImage,
		AutoImage, HtmlEmbed, HtmlComment, Alignment, PageBreak, HorizontalLine, ImageUpload,
		CloudServices, SourceEditing, DocumentList, DocumentListProperties
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
			'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', 'imageStyle:side', '|',
			'resizeImage'
		]
	},
	placeholder: 'Type the content here!',
	htmlEmbed: {
		showPreviews: true,
		sanitizeHtml: html => ( { html, hasChange: false } )
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

createEditor( 'none', {
	styles: false,
	startIndex: false,
	reversed: false
} );
