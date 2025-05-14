/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import MultiRootEditorUIView from '../src/multirooteditoruiview.js';
import EditingView from '@ckeditor/ckeditor5-engine/src/view/view.js';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview.js';
import MenuBarView from '@ckeditor/ckeditor5-ui/src/menubar/menubarview.js';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview.js';
import Locale from '@ckeditor/ckeditor5-utils/src/locale.js';
import createRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'MultiRootEditorUIView', () => {
	let locale, view, editingView, fooViewRoot, barViewRoot;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = new Locale();
		editingView = new EditingView();
		fooViewRoot = createRoot( editingView.document, 'div', 'foo' );
		barViewRoot = createRoot( editingView.document, 'div', 'bar' );

		view = new MultiRootEditorUIView( locale, editingView, [ 'foo', 'bar' ] );

		view.editables.foo.name = 'foo';
		view.editables.bar.name = 'bar';
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
					const editingView = new EditingView();
					const editingViewRoot = createRoot( editingView.document, 'div', 'foo' );
					const view = new MultiRootEditorUIView( locale, editingView, [ 'foo' ], {
						shouldToolbarGroupWhenFull: true
					} );

					view.editable.name = editingViewRoot.rootName;
					view.render();

					expect( view.toolbar.options.shouldGroupWhenFull ).to.be.true;

					return view.destroy();
				} );
			} );
		} );

		describe( '#menuBarView', () => {
			it( 'is created', () => {
				expect( view.menuBarView ).to.be.instanceof( MenuBarView );
			} );

			it( 'is given a locale object', () => {
				expect( view.menuBarView.locale ).to.equal( locale );
			} );

			it( 'is not rendered', () => {
				expect( view.menuBarView.isRendered ).to.be.false;
			} );
		} );

		describe( '#editables', () => {
			it( 'are created', () => {
				expect( view.editables.foo ).to.be.instanceof( InlineEditableUIView );
				expect( view.editables.bar ).to.be.instanceof( InlineEditableUIView );
			} );

			it( 'are given a locale object', () => {
				expect( view.editables.foo.locale ).to.equal( locale );
				expect( view.editables.bar.locale ).to.equal( locale );
			} );

			it( 'are not rendered', () => {
				expect( view.editables.foo.isRendered ).to.be.false;
				expect( view.editables.bar.isRendered ).to.be.false;
			} );

			it( 'can be created out of existing DOM elements', () => {
				const fooEl = document.createElement( 'div' );
				const barEl = document.createElement( 'div' );
				const options = { editableElements: { foo: fooEl, bar: barEl } };
				const testView = new MultiRootEditorUIView( locale, editingView, [ 'foo', 'bar' ], options );
				testView.editables.foo.name = 'foo';
				testView.editables.bar.name = 'bar';

				testView.render();

				expect( testView.editables.foo.element ).to.equal( fooEl );
				expect( testView.editables.bar.element ).to.equal( barEl );

				testView.destroy();
			} );

			it( 'creates an editing root with the default aria-label', () => {
				view.render();

				expect( fooViewRoot.getAttribute( 'aria-label' ) ).to.equal( 'Rich Text Editor. Editing area: foo' );
				expect( barViewRoot.getAttribute( 'aria-label' ) ).to.equal( 'Rich Text Editor. Editing area: bar' );

				view.destroy();
			} );

			it( 'creates an editing root with the configured aria-label (string format)', () => {
				const editingView = new EditingView();
				const fooViewRoot = createRoot( editingView.document, 'div', 'foo' );
				const barViewRoot = createRoot( editingView.document, 'div', 'bar' );
				const view = new MultiRootEditorUIView( locale, editingView, [ 'foo', 'bar' ], {
					label: 'Foo'
				} );

				view.editables.foo.name = 'foo';
				view.editables.bar.name = 'bar';
				view.render();

				expect( fooViewRoot.getAttribute( 'aria-label' ) ).to.equal( 'Foo' );
				expect( barViewRoot.getAttribute( 'aria-label' ) ).to.equal( 'Foo' );

				view.destroy();
			} );

			it( 'creates an editing root with the configured aria-label (object format)', () => {
				const editingView = new EditingView();
				const fooViewRoot = createRoot( editingView.document, 'div', 'foo' );
				const barViewRoot = createRoot( editingView.document, 'div', 'bar' );
				const view = new MultiRootEditorUIView( locale, editingView, [ 'foo', 'bar' ], {
					label: {
						foo: 'Foo',
						bar: 'Bar'
					}
				} );

				view.editables.foo.name = 'foo';
				view.editables.bar.name = 'bar';
				view.render();

				expect( fooViewRoot.getAttribute( 'aria-label' ) ).to.equal( 'Foo' );
				expect( barViewRoot.getAttribute( 'aria-label' ) ).to.equal( 'Bar' );

				view.destroy();
			} );
		} );
	} );

	describe( 'createEditable()', () => {
		it( 'adds editable', () => {
			const editable = view.createEditable( 'new' );

			expect( view.editables.new ).to.equal( editable );
		} );

		it( 'uses given HTML element inside editable', () => {
			createRoot( editingView.document, 'div', 'new' );

			const domElement = document.createElement( 'div' );
			const editable = view.createEditable( 'new', domElement );
			view.editables.new.name = 'new';

			view.render();

			expect( view.editables.new ).to.equal( editable );
			expect( editable.element ).to.equal( domElement );

			view.destroy();
		} );

		it( 'passed locale object to editable', () => {
			view.createEditable( 'new' );

			expect( view.editables.new.locale ).to.equal( locale );
		} );

		it( 'new editable is not rendered', () => {
			view.createEditable( 'new' );

			expect( view.editables.new.isRendered ).to.be.false;
		} );

		it( 'new editable is given an accessible aria label', () => {
			const newViewRoot = createRoot( editingView.document, 'div', 'new' );

			view.createEditable( 'new' );
			view.editables.new.name = 'new';

			view.render();

			expect( newViewRoot.getAttribute( 'aria-label' ) ).to.equal( 'Rich Text Editor. Editing area: new' );

			view.destroy();
		} );

		it( 'new editable is given an accessible aria label (custom)', () => {
			const newViewRoot = createRoot( editingView.document, 'div', 'new' );

			view.createEditable( 'new', undefined, 'Custom label' );
			view.editables.new.name = 'new';

			view.render();

			expect( newViewRoot.getAttribute( 'aria-label' ) ).to.equal( 'Custom label' );

			view.destroy();
		} );
	} );

	describe( 'removeEditable()', () => {
		it( 'removes the editable from the editables list (before view was rendered)', () => {
			view.removeEditable( 'foo' );

			expect( view.editables.foo ).to.be.undefined;
		} );

		it( 'removes the editable from the editables list (after view was rendered)', () => {
			view.render();

			view.removeEditable( 'foo' );

			expect( view.editables.foo ).to.be.undefined;

			view.destroy();
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
				expect( view.toolbar.isRendered ).to.be.true;
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

		describe( '#menuBarView', () => {
			it( 'is rendered but gets no parent', () => {
				expect( view.menuBarView.isRendered ).to.be.true;
				expect( view.menuBarView.element.parentElement ).to.be.null;
			} );

			it( 'gets the CSS classes', () => {
				expect( view.menuBarView.element.classList.contains( 'ck-reset_all' ) ).to.be.true;
				expect( view.menuBarView.element.classList.contains( 'ck-rounded-corners' ) ).to.be.true;
			} );

			it( 'gets the "dir" attribute corresponding to Locale#uiLanguageDirection', () => {
				expect( view.menuBarView.element.getAttribute( 'dir' ) ).to.equal( 'ltr' );
			} );
		} );

		describe( '#editables', () => {
			it( 'are rendered but gets no parent', () => {
				expect( view.editables.foo.isRendered ).to.be.true;
				expect( view.editables.bar.isRendered ).to.be.true;
				expect( view.editables.foo.element.parentElement ).to.be.null;
				expect( view.editables.bar.element.parentElement ).to.be.null;
			} );
		} );
	} );

	describe( 'destroy', () => {
		beforeEach( () => {
			view.render();
		} );

		it( 'destroys #toolbar, #menuBarView and #editables', () => {
			const toolbarSpy = sinon.spy( view.toolbar, 'destroy' );
			const menuBarViewSpy = sinon.spy( view.menuBarView, 'destroy' );
			const editableFooSpy = sinon.spy( view.editables.foo, 'destroy' );
			const editableBarSpy = sinon.spy( view.editables.bar, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( toolbarSpy );
			sinon.assert.calledOnce( menuBarViewSpy );
			sinon.assert.calledOnce( editableFooSpy );
			sinon.assert.calledOnce( editableBarSpy );
		} );

		it( 'does not affect toolbar#element, menuBarView#element and editables #element', () => {
			document.body.appendChild( view.toolbar.element );
			document.body.appendChild( view.menuBarView.element );
			document.body.appendChild( view.editables.foo.element );
			document.body.appendChild( view.editables.bar.element );

			view.destroy();

			expect( view.toolbar.element.parentElement ).to.equal( document.body );
			expect( view.menuBarView.element.parentElement ).to.equal( document.body );
			expect( view.editables.foo.element.parentElement ).to.equal( document.body );
			expect( view.editables.bar.element.parentElement ).to.equal( document.body );

			view.toolbar.element.remove();
			view.menuBarView.element.remove();
			view.editables.foo.element.remove();
			view.editables.bar.element.remove();
		} );
	} );
} );
