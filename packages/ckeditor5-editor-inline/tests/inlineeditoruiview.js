/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import InlineEditorUIView from '../src/inlineeditoruiview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import FloatingPanelView from '@ckeditor/ckeditor5-ui/src/panel/floating/floatingpanelview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';

describe( 'InlineEditorUIView', () => {
	let locale, view;

	beforeEach( () => {
		locale = new Locale( 'en' );
		view = new InlineEditorUIView( locale );
	} );

	describe( 'constructor()', () => {
		describe( '#toolbar', () => {
			it( 'is created', () => {
				expect( view.toolbar ).to.be.instanceof( ToolbarView );
			} );

			it( 'is given a locale object', () => {
				expect( view.toolbar.locale ).to.equal( locale );
			} );
		} );

		describe( '#panel', () => {
			it( 'is created', () => {
				expect( view.panel ).to.be.instanceof( FloatingPanelView );
			} );

			it( 'is given a locale object', () => {
				expect( view.panel.locale ).to.equal( locale );
			} );

			it( 'is given the right CSS class', () => {
				expect( view.panel.element.classList.contains( 'ck-toolbar__container' ) ).to.be.true;
			} );

			it( 'is put into the #body collection', () => {
				expect( view.body.get( 0 ) ).to.equal( view.panel );
			} );
		} );

		describe( '#editable', () => {
			it( 'is created', () => {
				expect( view.editable ).to.be.instanceof( InlineEditableUIView );
			} );

			it( 'is given a locate object', () => {
				expect( view.editable.locale ).to.equal( locale );
			} );

			it( 'is registered as a child', () => {
				const spy = sinon.spy( view.editable, 'destroy' );

				return view.init()
					.then( () => view.destroy() )
					.then( () => {
						sinon.assert.calledOnce( spy );
					} );
			} );
		} );
	} );

	describe( 'init', () => {
		it( 'appends #toolbar to panel#content', () => {
			expect( view.panel.content ).to.have.length( 0 );

			return view.init()
				.then( () => {
					expect( view.panel.content.get( 0 ) ).to.equal( view.toolbar );
				} )
				.then( () => view.destroy() );
		} );
	} );

	describe( 'editableElement', () => {
		it( 'returns editable\'s view element', () => {
			return view.init()
				.then( () => {
					expect( view.editableElement.getAttribute( 'contentEditable' ) ).to.equal( 'true' );
				} )
				.then( () => view.destroy() );
		} );
	} );
} );
