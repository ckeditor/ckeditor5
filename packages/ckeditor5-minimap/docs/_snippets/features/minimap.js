/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
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

import Minimap from '@ckeditor/ckeditor5-minimap/src/minimap';

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
		'undo', 'redo', '|', 'heading',
		'|', 'bold', 'italic',
		'|', 'link', 'uploadImage', 'insertTable', 'mediaEmbed',
		'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
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
		container: document.querySelector( '.minimap-container' ),
		extraClasses: 'live-snippet formatted'
	},
	cloudServices: CS_CONFIG,
	ui: {
		viewportOffset: {
			top: window.getViewportTopOffsetConfig()
		}
	}
};

DecoupledEditor
	.create( document.querySelector( '#editor' ), config )
	.then( editor => {
		window.editor = editor;

		const toolbarContainer = document.querySelector( '#toolbar-container' );

		toolbarContainer.appendChild( editor.ui.view.toolbar.element );

		window.attachTourBalloon( {
			target: editor.plugins.get( 'Minimap' )._minimapView.element,
			text: 'Use the minimap for quick navigation',
			editor,
			tippyOptions: {
				placement: 'bottom-end'
			}
		} );
	} );
