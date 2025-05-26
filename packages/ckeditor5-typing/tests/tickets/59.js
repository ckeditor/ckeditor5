/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Typing from '../../src/typing.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'Bug ckeditor5-typing#59', () => {
	let editor;
	let container;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		return ClassicEditor
			.create( container, {
				plugins: [ Typing, Paragraph, Bold ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		container.remove();

		return editor.destroy();
	} );

	it( 'editor does not blow up when deleting last styled character', () => {
		editor.model.change( () => {
			editor.editing.view.getDomRoot().focus();
			setData( editor.model, '<paragraph><$text bold="true">foo</$text> x <$text bold="true">bar</$text>.[]</paragraph>' );
		} );

		while ( editor.model.document.selection.anchor.offset > 0 ) {
			editor.execute( 'delete' );
		}

		expect( editor.getData( { trim: 'none' } ) ).to.equal( '<p>&nbsp;</p>' );
	} );

	// This is something that came to my mind after I worked on ckeditor/ckeditor5-engine#659.
	// Toggling bold at the end creates a lot of weird cases so it's interesting to see if it works... and it didn't back then.
	it( 'editor does not blow up when deleting last styled character, forcing bold switch', () => {
		editor.model.change( () => {
			editor.editing.view.getDomRoot().focus();
			setData( editor.model, '<paragraph><$text bold="true">foo</$text> x <$text bold="true">bar</$text>.[]</paragraph>' );
		} );

		while ( editor.model.document.selection.anchor.offset > 0 ) {
			editor.execute( 'delete' );
			editor.execute( 'bold' );
		}

		expect( editor.getData( { trim: 'none' } ) ).to.equal( '<p>&nbsp;</p>' );
	} );
} );
