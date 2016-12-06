/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import HeadingEngine from 'ckeditor5/heading/headingengine.js';
import VirtualTestEditor from 'tests/core/_utils/virtualtesteditor.js';
import Enter from 'ckeditor5/enter/enter.js';
import { getData, setData } from 'ckeditor5/engine/dev-utils/model.js';

describe( 'Bug ckeditor5-heading#40', () => {
	let editor;

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'enter at the end of a heading creates a paragraph, when heading was loaded before enter', () => {
		return VirtualTestEditor.create( {
			plugins: [ HeadingEngine, Enter ]
		} )
		.then( newEditor => {
			editor = newEditor;

			setData( editor.document, '<heading1>foo[]</heading1>' );

			editor.execute( 'enter' );

			expect( getData( editor.document ) ).to.equal( '<heading1>foo</heading1><paragraph>[]</paragraph>' );
		} );
	} );

	it( 'enter at the end of a heading creates a paragraph, when enter was loaded before heading', () => {
		return VirtualTestEditor.create( {
			plugins: [ Enter, HeadingEngine ]
		} )
		.then( newEditor => {
			editor = newEditor;

			setData( editor.document, '<heading1>foo[]</heading1>' );

			editor.execute( 'enter' );

			expect( getData( editor.document ) ).to.equal( '<heading1>foo</heading1><paragraph>[]</paragraph>' );
		} );
	} );
} );
