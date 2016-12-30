/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicEditorUIView from 'ckeditor5-editor-classic/src/classiceditoruiview';
import StickyToolbarView from 'ckeditor5-ui/src/toolbar/sticky/stickytoolbarview';
import InlineEditableUIView from 'ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import Locale from 'ckeditor5-utils/src/locale';

describe( 'ClassicEditorUIView', () => {
	let locale, view;

	beforeEach( () => {
		locale = new Locale( 'en' );
		view = new ClassicEditorUIView( locale );
	} );

	describe( 'constructor()', () => {
		describe( '#toolbar', () => {
			it( 'is created', () => {
				expect( view.toolbar ).to.be.instanceof( StickyToolbarView );
			} );

			it( 'is given a locate object', () => {
				expect( view.toolbar.locale ).to.equal( locale );
			} );

			it( 'is put into the "top" collection', () => {
				expect( view.top.get( 0 ) ).to.equal( view.toolbar );
			} );
		} );

		describe( '#editable', () => {
			it( 'is created', () => {
				expect( view.editable ).to.be.instanceof( InlineEditableUIView );
			} );

			it( 'is given a locate object', () => {
				expect( view.editable.locale ).to.equal( locale );
			} );

			it( 'is put into the "main" collection', () => {
				expect( view.main.get( 0 ) ).to.equal( view.editable );
			} );
		} );
	} );

	describe( 'editableElement', () => {
		it( 'returns editable\'s view element', () => {
			document.body.appendChild( view.element );

			return view.init()
				.then( () => {
					expect( view.editableElement.getAttribute( 'contentEditable' ) ).to.equal( 'true' );
				} )
				.then( () => view.destroy() );
		} );
	} );
} );
