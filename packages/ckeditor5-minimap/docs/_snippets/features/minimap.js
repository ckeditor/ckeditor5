/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals window, document */

import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { Subscript, Superscript } from '@ckeditor/ckeditor5-basic-styles';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled';
import { FontBackgroundColor, FontColor, FontFamily, FontSize } from '@ckeditor/ckeditor5-font';
import { PictureEditing, ImageInsert, ImageResize, ImageUpload } from '@ckeditor/ckeditor5-image';
import { IndentBlock } from '@ckeditor/ckeditor5-indent';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { TableCellProperties, TableProperties } from '@ckeditor/ckeditor5-table';

import { Minimap } from '@ckeditor/ckeditor5-minimap';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

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
		ImageInsert,
		ImageUpload,
		ImageResize,
		TableProperties,
		TableCellProperties,
		Subscript,
		Superscript,
		PageBreak,
		CodeBlock,
		Minimap,
		PictureEditing,
		CKBox,
		CKBoxImageEdit
	],
	toolbar: [
		'undo', 'redo', '|', 'heading',
		'|', 'bold', 'italic',
		'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
		'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
	],
	image: {
		toolbar: [
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:wrapText',
			'|',
			'imageTextAlternative',
			'toggleImageCaption',
			'ckboxImageEdit'
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
	},
	ckbox: {
		tokeUrl: TOKEN_URL,
		allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
		forceDemoLabel: true
	},
	licenseKey: 'GPL'
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
