/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import { parse as parseModel, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import List from '../../src/list';
import { stringifyList } from './../documentlist/_utils/utils';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Heading, Paragraph, Undo, List, Clipboard ],
		toolbar: [ 'heading', '|', 'bulletedList', 'numberedList', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const copyAscii = () => {
	const ascii = document.getElementById( 'ascii-art' ).innerText;
	window.navigator.clipboard.writeText( ascii );
};

const asciifyModelData = () => {
	let modelDataString = document.getElementById( 'model-data' ).value;

	modelDataString = modelDataString.replace( /[+|'|\t|\r|\n|;]/g, '' );
	modelDataString = modelDataString.replace( /> </g, '><' );

	const parsedModel = parseModel( modelDataString, window.editor.model.schema );
	const listArray = stringifyList( parsedModel ).split( '\n' );

	const test = listArray.map( ( element, index ) => {
		if ( index === listArray.length - 1 ) {
			return `'${ element }'`;
		}

		return `'${ element }',`;
	} );

	document.getElementById( 'ascii-art' ).innerText = 'modelList( [\n\t' +
														test.join( '\n\t' ) +
														'\n] );';
	setModelData( window.editor.model, modelDataString );
	copyAscii();
};

const onPaste = () => {
	window.setTimeout( () => {
		asciifyModelData();
	}, 0 );
};

document.getElementById( 'asciify' ).addEventListener( 'click', asciifyModelData );
document.getElementById( 'btn-copy-ascii' ).addEventListener( 'click', copyAscii );
document.getElementById( 'model-data' ).addEventListener( 'paste', onPaste );
