/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';

import Minimap from '../../src/minimap';
import { shortData, mediumData, longData } from '../fixtures';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

const config = {
	plugins: [
		Alignment,
		ArticlePluginSet,
		CloudServices,
		FontSize,
		FontFamily,
		FontColor,
		FontBackgroundColor,
		IndentBlock,
		ImageUpload,
		ImageResize,
		TableProperties,
		TableCellProperties,
		Subscript,
		Superscript,
		PageBreak,
		CodeBlock,
		Minimap,
		EasyImage
	],
	toolbar: [
		'pageBreak', '|',
		'heading', '|',
		'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor', '|',
		'bold', 'italic', 'blockQuote', '|',
		'codeBlock',
		'alignment', '|',
		'indent', 'outdent', '|',
		'subscript', 'superscript', '|',
		'insertTable', 'imageUpload', '|',
		'undo', 'redo'
	],
	image: {
		toolbar: [
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:side',
			'|',
			'imageTextAlternative',
			'toggleImageCaption'
		],
		styles: [
			'inline',
			'block',
			'side',
			'alignLeft',
			'alignRight',
			{ name: 'margin', title: 'Reset margins', icon: '', className: 'reset-margin' }
		],
		resizeUnit: 'px'
	},
	table: {
		contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ],
		tableToolbar: [ 'bold', 'italic' ]
	},
	heading: {
		options: [
			{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
			{ model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
			{ model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
			{ model: 'heading3', view: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' },
			{ model: 'heading4', view: 'h5', title: 'Heading 4', class: 'ck-heading_heading4' }
		]
	},
	minimap: {
		container: document.querySelector( '.minimap-container' )
	},
	cloudServices: CS_CONFIG
};

DecoupledEditor
	.create( document.querySelector( '#editor-content' ), config )
	.then( editor => {
		window.editorInstance = editor;

		const toolbarContainer = document.querySelector( '#toolbar-container' );

		toolbarContainer.innerHTML = '';
		toolbarContainer.appendChild( editor.ui.view.toolbar.element );

		editor.setData( shortData );
	} );

document.getElementById( 'long' ).addEventListener( 'click', () => {
	window.editorInstance.setData( longData );
} );

document.getElementById( 'medium' ).addEventListener( 'click', () => {
	window.editorInstance.setData( mediumData );
} );

document.getElementById( 'short' ).addEventListener( 'click', () => {
	window.editorInstance.setData( shortData );
} );
