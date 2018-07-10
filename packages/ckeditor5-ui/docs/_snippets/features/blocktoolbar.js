/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import BlockToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar';
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-block-toolbar' ), {
		plugins: ClassicEditor.builtinPlugins.concat( [ BlockToolbar, ParagraphButtonUI, HeadingButtonsUI ] ),
		toolbar: {
			items: [ 'bold', 'italic', 'code', 'link', 'blockQuote', 'undo', 'redo' ],
			viewportTopOffset: 60
		},
		blockToolbar: [ 'paragraph', 'heading1', 'heading2', 'heading3', '|', 'bulletedList', 'numberedList' ],
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editorBasic = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
