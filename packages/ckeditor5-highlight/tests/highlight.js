/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import Highlight from './../src/highlight';
import HighlightEditing from './../src/highlightediting';
import HighlightUI from './../src/highlightui';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

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
