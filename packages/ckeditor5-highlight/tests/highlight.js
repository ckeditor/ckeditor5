/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import Highlight from './../src/highlight.js';
import HighlightEditing from './../src/highlightediting.js';
import HighlightUI from './../src/highlightui.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

describe( 'Highlight', () => {
	let editor, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Highlight ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'requires HighlightEditing and HighlightUI', () => {
		expect( Highlight.requires ).to.deep.equal( [ HighlightEditing, HighlightUI ] );
	} );
} );
