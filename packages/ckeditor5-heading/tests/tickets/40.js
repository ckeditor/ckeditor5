/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import HeadingEditing from '../../src/headingediting.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'Bug ckeditor5-heading#40', () => {
	let editor;

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'enter at the end of a heading creates a paragraph, when heading was loaded before enter', () => {
		return VirtualTestEditor
			.create( {
				plugins: [ HeadingEditing, Enter ]
			} )
			.then( newEditor => {
				editor = newEditor;

				setData( editor.model, '<heading1>foo[]</heading1>' );

				editor.execute( 'enter' );

				expect( getData( editor.model ) ).to.equal( '<heading1>foo</heading1><paragraph>[]</paragraph>' );
			} );
	} );

	it( 'enter at the end of a heading creates a paragraph, when enter was loaded before heading', () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Enter, HeadingEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;

				setData( editor.model, '<heading1>foo[]</heading1>' );

				editor.execute( 'enter' );

				expect( getData( editor.model ) ).to.equal( '<heading1>foo</heading1><paragraph>[]</paragraph>' );
			} );
	} );
} );
