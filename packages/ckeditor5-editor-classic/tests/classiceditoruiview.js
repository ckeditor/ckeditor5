/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicEditorUIView from '../src/classiceditoruiview.js';
import EditingView from '@ckeditor/ckeditor5-engine/src/view/view.js';
import StickyPanelView from '@ckeditor/ckeditor5-ui/src/panel/sticky/stickypanelview.js';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview.js';
import MenuBarView from '@ckeditor/ckeditor5-ui/src/menubar/menubarview.js';
import Locale from '@ckeditor/ckeditor5-utils/src/locale.js';
import createRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'ClassicEditorUIView', () => {
	let locale, view, editingView, editingViewRoot;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = new Locale();
		editingView = new EditingView();
		editingViewRoot = createRoot( editingView.document );
		view = new ClassicEditorUIView( locale, editingView );
		view.editable.name = editingViewRoot.rootName;
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		describe( '#stickyPanel', () => {
			it( 'is created', () => {
				expect( view.stickyPanel ).to.be.instanceof( StickyPanelView );
			} );

			it( 'is given a locale object', () => {
				expect( view.stickyPanel.locale ).to.equal( locale );
			} );

			it( 'is put into the "top" collection', () => {
				expect( view.top.get( 0 ) ).to.equal( view.stickyPanel );
			} );
		} );

		describe( '#toolbar', () => {
			it( 'is created', () => {
				expect( view.toolbar ).to.be.instanceof( ToolbarView );
			} );

			it( 'is given a locale object', () => {
				expect( view.toolbar.locale ).to.equal( locale );
			} );

			it( 'is put into the "stickyPanel.content" collection', () => {
				expect( view.stickyPanel.content.get( 0 ) ).to.equal( view.toolbar );
			} );

			describe( 'automatic items grouping', () => {
				it( 'should be disabled by default', () => {
					expect( view.toolbar.options.shouldGroupWhenFull ).to.be.undefined;
				} );

				it( 'should be controlled via options.shouldToolbarGroupWhenFull', () => {
					const locale = new Locale();
					const editingView = new EditingView();
					const editingViewRoot = createRoot( editingView.document );
					const view = new ClassicEditorUIView( locale, editingView, {
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
			it( 'creates an editing root with the default aria-label', () => {
				expect( editingViewRoot.getAttribute( 'aria-label' ) ).to.equal( 'Rich Text Editor. Editing area: main' );
			} );

			it( 'creates an editing root with the configured aria-label (string format)', () => {
				const editingView = new EditingView();
				const editingViewRoot = createRoot( editingView.document );
				const view = new ClassicEditorUIView( locale, editingView, {
					label: 'Foo'
				} );
				view.editable.name = editingViewRoot.rootName;
				view.render();

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).to.equal( 'Foo' );

				view.destroy();
			} );

			it( 'creates an editing root with the configured aria-label (object format)', () => {
				const editingView = new EditingView();
				const editingViewRoot = createRoot( editingView.document );
				const view = new ClassicEditorUIView( locale, editingView, {
					label: {
						main: 'Foo'
					}
				} );
				view.editable.name = editingViewRoot.rootName;
				view.render();

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).to.equal( 'Foo' );

				view.destroy();
			} );
		} );

		describe( '#menuBarView', () => {
			it( 'is not created', () => {
				expect( view.menuBarView ).to.be.undefined;
			} );
		} );
	} );

	describe( 'with menu bar', () => {
		let locale, view, editingView, editingViewRoot;

		testUtils.createSinonSandbox();

		beforeEach( () => {
			locale = new Locale();
			editingView = new EditingView();
			editingViewRoot = createRoot( editingView.document );
			view = new ClassicEditorUIView( locale, editingView, { useMenuBar: true } );
			view.editable.name = editingViewRoot.rootName;
			view.render();
		} );

		afterEach( () => {
			view.destroy();
		} );

		describe( '#menuBarView', () => {
			it( 'is created', () => {
				expect( view.menuBarView ).to.be.instanceof( MenuBarView );
			} );

			it( 'is given a locale object', () => {
				expect( view.menuBarView.locale ).to.equal( locale );
			} );

			it( 'is put into the "stickyPanel.content" collection', () => {
				expect( view.stickyPanel.content.get( 0 ) ).to.equal( view.menuBarView );
				expect( view.stickyPanel.content.get( 1 ) ).to.equal( view.toolbar );
			} );
		} );
	} );
} );
