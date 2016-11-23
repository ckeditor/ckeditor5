/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicEditor from 'ckeditor5/editor-classic/classic.js';
import Typing from 'ckeditor5/typing/typing.js';
import Paragraph from 'ckeditor5/paragraph/paragraph.js';
import Bold from 'ckeditor5/basic-styles/bold.js';
import { setData } from 'ckeditor5/engine/dev-utils/model.js';

describe( 'Bug #59', () => {
	let editor;
	let container;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		return ClassicEditor.create( container, {
			plugins: [ Typing, Paragraph, Bold ]
		} )
		.then( newEditor => {
			editor = newEditor;
		} );
	} );

	it( 'editor does not blow up when deleting last styled character', () => {
		editor.document.enqueueChanges( () => {
			editor.editing.view.getDomRoot().focus();
			setData( editor.document, '<paragraph><$text bold="true">foo</$text> x <$text bold="true">bar</$text>.[]</paragraph>' );
		} );

		while ( editor.document.selection.anchor.offset > 0 ) {
			editor.execute( 'delete' );
		}

		expect( editor.getData() ).to.equal( '<p>&nbsp;</p>' );
	} );

	// This is something that came to my mind after I worked on ckeditor/ckeditor5-engine#659.
	// Toggling bold at the end creates a lot of weird cases so it's interesting to see if it works... and it didn't back then.
	it( 'editor does not blow up when deleting last styled character, forcing bold switch', () => {
		editor.document.enqueueChanges( () => {
			editor.editing.view.getDomRoot().focus();
			setData( editor.document, '<paragraph><$text bold="true">foo</$text> x <$text bold="true">bar</$text>.[]</paragraph>' );
		} );

		while ( editor.document.selection.anchor.offset > 0 ) {
			editor.execute( 'delete' );
			editor.execute( 'bold' );
		}

		expect( editor.getData() ).to.equal( '<p>&nbsp;</p>' );
	} );
} );
