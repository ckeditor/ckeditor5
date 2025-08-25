/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Link } from '@ckeditor/ckeditor5-link';
import { BlockToolbar } from '@ckeditor/ckeditor5-ui';
import { Image } from '../../../../src/image.js';
import { ImageCaption } from '../../../../src/imagecaption.js';

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
				image = writer.createElement( 'imageBlock', { src: 'sample-small.jpg' } );
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
