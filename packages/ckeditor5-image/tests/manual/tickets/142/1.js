/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, console, window, setTimeout */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Link from '@ckeditor/ckeditor5-link/src/link';
import Image from '../../../../src/image';
import ImageCaption from '../../../../src/imagecaption';

import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, Link, Image, ImageCaption ],
		toolbar: [],
	} )
	.then( editor => {
		window.editor = editor;

		const doc = editor.document;

		document.querySelector( '.start' ).addEventListener( 'click', () => {
			wait( 3000 ).then( () => {
				doc.enqueueChanges( () => {
					const image = new Element( 'image', { src: 'https://www.w3schools.com/w3images/fjords.jpg' } );

					doc.batch( 'transparent' ).insert( new Position( doc.getRoot(), [ 0 ] ), image );
				} );
			} );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function wait( delay ) {
	return new Promise( resolve => {
		setTimeout( () => resolve(), delay );
	} );
}
