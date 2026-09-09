/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { BlockToolbar, BalloonToolbar } from '@ckeditor/ckeditor5-ui';
import { FontColor, FontBackgroundColor } from '@ckeditor/ckeditor5-font';
import { ImageResize } from '@ckeditor/ckeditor5-image';
import { TableProperties, TableCellProperties } from '@ckeditor/ckeditor5-table';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';

import { createEditorDomRoot, getOverlayConfig } from './_utils/shadow.js';

declare global {
	interface Window {
		editor: any;
	}
}

const editorDomRoot = createEditorDomRoot( document.getElementById( 'mount' )!, {
	template: document.getElementById( 'editor-template' ) as HTMLTemplateElement
} );

ClassicEditor
	.create( {
		attachTo: editorDomRoot.querySelector( '#editor' ) as HTMLElement,
		plugins: [
			ArticlePluginSet,
			BlockToolbar, BalloonToolbar,
			FontColor, FontBackgroundColor,
			ImageResize, TableProperties, TableCellProperties,
			FindAndReplace
		],
		toolbar: [
			'heading',
			'|',
			'bold', 'italic', 'link', 'fontColor', 'fontBackgroundColor',
			'|',
			'bulletedList', 'numberedList', 'blockQuote', 'insertTable',
			'|',
			'undo', 'redo', 'findAndReplace'
		],
		blockToolbar: [ 'heading', '|', 'bulletedList', 'numberedList', '|', 'blockQuote', 'insertTable' ],
		balloonToolbar: [ 'bold', 'italic', 'link' ],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ]
		},
		image: {
			toolbar: [ 'imageTextAlternative', 'toggleImageCaption', '|', 'resizeImage' ]
		},
		menuBar: {
			isVisible: true
		},
		...getOverlayConfig()
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
