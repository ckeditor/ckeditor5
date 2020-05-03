/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import BalloonEditor from '@ckeditor/ckeditor5-build-balloon/src/ckeditor';
import BlockToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar';
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

BalloonEditor
	.create( document.querySelector( '#snippet-block-toolbar' ), {
		plugins: BalloonEditor.builtinPlugins.concat( [ BlockToolbar, ParagraphButtonUI, HeadingButtonsUI ] ),
		toolbar: {
			items: [ 'bold', 'italic', 'link', 'undo', 'redo' ],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		blockToolbar: [
			'paragraph', 'heading1', 'heading2', 'heading3',
			'|',
			'bulletedList', 'numberedList',
			'|',
			'outdent', 'indent',
			'|',
			'blockQuote', 'imageUpload'
		],
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editorBasic = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
