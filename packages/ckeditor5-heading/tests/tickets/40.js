/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import HeadingEngine from '../../src/headingengine';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'Bug ckeditor5-heading#40', () => {
	let editor;

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'enter at the end of a heading creates a paragraph, when heading was loaded before enter', () => {
		return VirtualTestEditor
			.create( {
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
		return VirtualTestEditor
			.create( {
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
