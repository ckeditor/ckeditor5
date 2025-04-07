/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	Alignment,
	Subscript,
	Superscript,
	CloudServices,
	CodeBlock,
	CKBox,
	CKBoxImageEdit,
	DecoupledEditor,
	FontBackgroundColor,
	FontColor,
	FontFamily,
	FontSize,
	PictureEditing,
	ImageInsert,
	ImageResize,
	ImageUpload,
	IndentBlock,
	PageBreak,
	TableCellProperties,
	TableProperties,
	Minimap
} from 'ckeditor5';
import {
	CS_CONFIG,
	TOKEN_URL,
	ArticlePluginSet,
	attachTourBalloon,
	getViewportTopOffsetConfig
} from '@snippets/index.js';

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
			top: getViewportTopOffsetConfig()
		}
	},
	ckbox: {
		tokeUrl: TOKEN_URL,
		allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
		forceDemoLabel: true
	}
};

DecoupledEditor
	.create( document.querySelector( '#editor' ), config )
	.then( editor => {
		window.editor = editor;

		const toolbarContainer = document.querySelector( '#toolbar-container' );

		toolbarContainer.appendChild( editor.ui.view.toolbar.element );

		attachTourBalloon( {
			target: editor.plugins.get( 'Minimap' )._minimapView.element,
			text: 'Use the minimap for quick navigation',
			editor,
			tippyOptions: {
				placement: 'bottom-end'
			}
		} );
	} );
