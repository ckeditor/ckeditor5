/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import DecoupledEditorUIView from '../src/decouplededitoruiview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';

describe( 'DecoupledEditorUIView', () => {
	let locale, view;

	beforeEach( () => {
		locale = new Locale( 'en' );
		view = new DecoupledEditorUIView( locale );
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'is virtual', () => {
			expect( view.template ).to.be.undefined;
			expect( view.element ).to.be.null;
		} );

		describe( '#toolbar', () => {
			it( 'is created', () => {
				expect( view.toolbar ).to.be.instanceof( ToolbarView );
			} );

			it( 'is given a locate object', () => {
				expect( view.toolbar.locale ).to.equal( locale );
			} );

			it( 'is rendered but gets no parent', () => {
				expect( view.isRendered ).to.be.true;
				expect( view.toolbar.element.parentElement ).to.be.null;
			} );

			it( 'gets the .ck-reset_all class', () => {
				expect( view.toolbar.element.classList.contains( 'ck-reset_all' ) ).to.be.true;
			} );
		} );

		describe( '#editable', () => {
			it( 'is created', () => {
				expect( view.editable ).to.be.instanceof( InlineEditableUIView );
			} );

			it( 'is given a locate object', () => {
				expect( view.editable.locale ).to.equal( locale );
			} );

			it( 'is rendered but gets no parent', () => {
				expect( view.isRendered ).to.be.true;
				expect( view.editable.element.parentElement ).to.be.null;
			} );
		} );
	} );

	describe( 'destroy', () => {
		it( 'destroys #toolbar and #editable', () => {
			const toolbarSpy = sinon.spy( view.toolbar, 'destroy' );
			const editableSpy = sinon.spy( view.editable, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( toolbarSpy );
			sinon.assert.calledOnce( editableSpy );
		} );

		it( 'does not touch the toolbar#element and editable#element by default', () => {
			document.body.appendChild( view.toolbar.element );
			document.body.appendChild( view.editable.element );

			view.destroy();

			expect( view.toolbar.element.parentElement ).to.equal( document.body );
			expect( view.editable.element.parentElement ).to.equal( document.body );

			view.toolbar.element.remove();
			view.editable.element.remove();
		} );

		it( 'removes toolbar#element on demand', () => {
			document.body.appendChild( view.toolbar.element );
			document.body.appendChild( view.editable.element );

			view.destroy( true );

			expect( view.toolbar.element.parentElement ).to.be.null;
			expect( view.editable.element.parentElement ).to.equal( document.body );

			view.editable.element.remove();
		} );

		it( 'removes editable#element on demand', () => {
			document.body.appendChild( view.toolbar.element );
			document.body.appendChild( view.editable.element );

			view.destroy( false, true );

			expect( view.toolbar.element.parentElement ).to.equal( document.body );
			expect( view.editable.element.parentElement ).to.be.null;

			view.toolbar.element.remove();
		} );
	} );

	describe( 'editableElement', () => {
		it( 'returns editable\'s view element', () => {
			expect( view.editableElement.getAttribute( 'contentEditable' ) ).to.equal( 'true' );
			view.destroy();
		} );
	} );
} );
