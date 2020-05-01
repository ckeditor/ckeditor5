/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import DecoupledEditorUIView from '../src/decouplededitoruiview';
import EditingView from '@ckeditor/ckeditor5-engine/src/view/view';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import createRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'DecoupledEditorUIView', () => {
	let locale, view, editingView, editingViewRoot;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = new Locale();
		editingView = new EditingView();
		editingViewRoot = createRoot( editingView.document );
		view = new DecoupledEditorUIView( locale, editingView );
		view.editable.name = editingViewRoot.rootName;
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

			it( 'is given a locale object', () => {
				expect( view.toolbar.locale ).to.equal( locale );
			} );

			it( 'is not rendered', () => {
				expect( view.toolbar.isRendered ).to.be.false;
			} );

			describe( 'automatic items grouping', () => {
				it( 'should be disabled by default', () => {
					expect( view.toolbar.options.shouldGroupWhenFull ).to.be.undefined;
				} );

				it( 'should be controlled via options.shouldToolbarGroupWhenFull', () => {
					const locale = new Locale();
					const editingView = new EditingView();
					const editingViewRoot = createRoot( editingView.document );
					const view = new DecoupledEditorUIView( locale, editingView, {
						shouldToolbarGroupWhenFull: true
					} );

					view.editable.name = editingViewRoot.rootName;
					view.render();

					expect( view.toolbar.options.shouldGroupWhenFull ).to.be.true;

					return view.destroy();
				} );
			} );
		} );

		describe( '#editable', () => {
			it( 'is created', () => {
				expect( view.editable ).to.be.instanceof( InlineEditableUIView );
			} );

			it( 'is given a locale object', () => {
				expect( view.editable.locale ).to.equal( locale );
			} );

			it( 'is not rendered', () => {
				expect( view.editable.isRendered ).to.be.false;
			} );

			it( 'can be created out of an existing DOM element', () => {
				const editableElement = document.createElement( 'div' );
				const testView = new DecoupledEditorUIView( locale, editingView, {
					editableElement
				} );
				testView.editable.name = editingViewRoot.rootName;

				testView.render();

				expect( testView.editable.element ).to.equal( editableElement );

				testView.destroy();
			} );
		} );
	} );

	describe( 'render()', () => {
		beforeEach( () => {
			view.render();
		} );

		afterEach( () => {
			view.destroy();
		} );

		describe( '#toolbar', () => {
			it( 'is rendered but gets no parent', () => {
				expect( view.isRendered ).to.be.true;
				expect( view.toolbar.element.parentElement ).to.be.null;
			} );

			it( 'gets the CSS classes', () => {
				expect( view.toolbar.element.classList.contains( 'ck-reset_all' ) ).to.be.true;
				expect( view.toolbar.element.classList.contains( 'ck-rounded-corners' ) ).to.be.true;
			} );

			it( 'gets the "dir" attribute corresponding to Locale#uiLanguageDirection', () => {
				expect( view.toolbar.element.getAttribute( 'dir' ) ).to.equal( 'ltr' );
			} );
		} );

		describe( '#editable', () => {
			it( 'is rendered but gets no parent', () => {
				expect( view.isRendered ).to.be.true;
				expect( view.editable.element.parentElement ).to.be.null;
			} );
		} );
	} );

	describe( 'destroy', () => {
		beforeEach( () => {
			view.render();
		} );

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
	} );
} );
