/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';

import operationTransformLogger from '../../src/dev-utils/operationtransformlogger';

window.editor = createEditor( '' );

document.getElementById( 'clear' ).addEventListener( 'click', () => {
	console.clear();
	window.editor.setData( '' );
} );

document.getElementById( 'reset' ).addEventListener( 'click', () => {
	const data = window.editor.getData();

	console.clear();
	window.editor.destroy();
	window.editor = createEditor( data );
} );

function createEditor( initialData ) {
	return ClassicEditor
		.create( document.querySelector( '#editor' ), {
			initialData,
			plugins: [
				Essentials, BlockQuote, Bold, Heading, Image, ImageCaption, Italic, Link, List, Paragraph, Table, TableToolbar,
				LinkImage, ImageUpload
			],
			toolbar: [
				'heading', '|', 'bold', 'italic', 'link', '|', 'bulletedList', 'numberedList', '|',
				'blockQuote', 'imageUpload', 'insertTable', '|', 'undo', 'redo'
			],
			table: {
				contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
			}
		} )
		.then( editor => {
			window.editor = editor;

			operationTransformLogger( editor );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}
