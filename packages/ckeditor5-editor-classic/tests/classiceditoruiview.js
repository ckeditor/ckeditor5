/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicEditorUIView from '../src/classiceditoruiview';
import StickyToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/sticky/stickytoolbarview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';

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

			it( 'is given the right CSS class', () => {
				expect( view.toolbar.element.classList.contains( 'ck-editor-toolbar' ) ).to.be.true;
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

			view.toolbar.limiterElement = view.element;
			view.init();

			expect( view.editableElement.getAttribute( 'contentEditable' ) ).to.equal( 'true' );

			view.destroy();
		} );
	} );
} );
