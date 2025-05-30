/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';

import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import Autosave from '../../src/autosave.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Autosave, SourceEditing ],
		toolbar: [
			'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo', '|', 'sourceEditing'
		],
		image: {
			toolbar: [ 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
		},
		autosave: {
			save( editor ) {
				const data = editor.getData();

				return wait( 1000 )
					.then( () => console.log( `${ getTime() } Saved content: ${ data }` ) );
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		const destroyButton = document.getElementById( 'destroy-editor-button' );
		destroyButton.addEventListener( 'click', () => editor.destroy() );

		const autosave = editor.plugins.get( Autosave );

		autosave.listenTo( autosave, 'change:state',
			( evt, propName, newValue, oldValue ) => console.log( `${ getTime() } Changed state: ${ oldValue } -> ${ newValue }` ) );
	} );

function wait( time ) {
	return new Promise( res => {
		window.setTimeout( res, time );
	} );
}

function getTime() {
	const date = new Date();

	return '[' +
		date.getHours() + ':' +
		setDigitSize( date.getMinutes(), 2 ) + ':' +
		setDigitSize( date.getSeconds(), 2 ) + '.' +
		setDigitSize( date.getMilliseconds(), 2 ) +
		']';
}

function setDigitSize( number, size ) {
	const string = String( number );

	if ( string.length >= size ) {
		return string.slice( 0, size );
	}

	return '0'.repeat( size - string.length ) + string;
}
