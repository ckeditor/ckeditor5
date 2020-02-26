/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console, window, setTimeout */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Link from '@ckeditor/ckeditor5-link/src/link';
import BlockToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar';
import Image from '../../../../src/image';
import ImageCaption from '../../../../src/imagecaption';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, Link, Image, ImageCaption, BlockToolbar ],
		toolbar: [],
		blockToolbar: [ 'Link' ]
	} )
	.then( editor => {
		window.editor = editor;

		const doc = editor.model.document;

		document.querySelector( '.start' ).addEventListener( 'click', () => {
			let image;

			editor.model.change( writer => {
				image = writer.createElement( 'image', { src: 'sample-small.jpg' } );
				writer.insert( image, doc.getRoot().getChild( 0 ), 'after' );
			} );

			setTimeout( () => {
				editor.ui.view.element.querySelector( 'img' ).src = '../../sample.jpg';
			}, 3000 );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
