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
	Minimap,
	_MinimapIframeView
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

patchMinimapView();
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

/**
 * The CKEditor minimap renders a preview in an iframe, copying styles from external CSS files.
 * If fonts are defined in CSS using relative paths (e.g., `url('../fonts/MyFont.woff2')`),
 * the iframe incorrectly interprets these paths because they are relative to the CSS file, not the HTML document.
 * This results in missing fonts in the minimap preview.
 *
 * This patch rewrites font URLs in CSS styles so that they are resolved correctly relative to the CSS file location,
 * ensuring fonts load properly in the minimap.
 *
 * See more: https://github.com/ckeditor/ckeditor5/issues/18896
 */
function patchMinimapView() {
	const originalRender = _MinimapIframeView.prototype.render;

	_MinimapIframeView.prototype.render = function( ...args ) {
		this._options.pageStyles = this._options.pageStyles.map( style => {
			if ( typeof style !== 'string' ) {
				return style;
			}

			const assetsCSSElement = document.querySelector( `link[href$="assets/${ window.umberto.version }/gloria/css/styles.css"]` );
			const realAssetsPrefix = assetsCSSElement.href.replace( /\/css\/styles\.css$/, '' );

			return style.replaceAll( 'url("../fonts/', `url("${ realAssetsPrefix }/fonts/` );
		} );

		return originalRender.call( this, ...args );
	};
}
