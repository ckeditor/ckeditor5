/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MultiRootEditorUIView } from '../src/multirooteditoruiview.js';
import { EditingView } from '@ckeditor/ckeditor5-engine';
import { ToolbarView, MenuBarView, InlineEditableUIView } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';
import { createViewRoot } from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';

describe( 'MultiRootEditorUIView', () => {
	let locale, view, editingView, fooViewRoot, barViewRoot;

	beforeEach( () => {
		locale = new Locale();
		editingView = new EditingView();
		fooViewRoot = createViewRoot( editingView.document, 'div', 'foo' );
		barViewRoot = createViewRoot( editingView.document, 'div', 'bar' );

		view = new MultiRootEditorUIView( locale, editingView, [ 'foo', 'bar' ] );

		view.editables.foo.name = 'foo';
		view.editables.bar.name = 'bar';
	} );

	describe( 'constructor()', () => {
		it( 'is virtual', () => {
			expect( view.template ).toBeUndefined();
			expect( view.element ).toBeNull();
		} );

		describe( '#toolbar', () => {
			it( 'is created', () => {
				expect( view.toolbar ).toBeInstanceOf( ToolbarView );
			} );

			it( 'is given a locale object', () => {
				expect( view.toolbar.locale ).toBe( locale );
			} );

			it( 'is not rendered', () => {
				expect( view.toolbar.isRendered ).toBe( false );
			} );

			describe( 'automatic items grouping', () => {
				it( 'should be disabled by default', () => {
					expect( view.toolbar.options.shouldGroupWhenFull ).toBeUndefined();
				} );

				it( 'should be controlled via options.shouldToolbarGroupWhenFull', () => {
					const editingView = new EditingView();
					const editingViewRoot = createViewRoot( editingView.document, 'div', 'foo' );
					const view = new MultiRootEditorUIView( locale, editingView, [ 'foo' ], {
						shouldToolbarGroupWhenFull: true
					} );

					view.editable.name = editingViewRoot.rootName;
					view.render();

					expect( view.toolbar.options.shouldGroupWhenFull ).toBe( true );

					return view.destroy();
				} );
			} );
		} );

		describe( '#menuBarView', () => {
			it( 'is created', () => {
				expect( view.menuBarView ).toBeInstanceOf( MenuBarView );
			} );

			it( 'is given a locale object', () => {
				expect( view.menuBarView.locale ).toBe( locale );
			} );

			it( 'is not rendered', () => {
				expect( view.menuBarView.isRendered ).toBe( false );
			} );
		} );

		describe( '#editables', () => {
			it( 'are created', () => {
				expect( view.editables.foo ).toBeInstanceOf( InlineEditableUIView );
				expect( view.editables.bar ).toBeInstanceOf( InlineEditableUIView );
			} );

			it( 'are given a locale object', () => {
				expect( view.editables.foo.locale ).toBe( locale );
				expect( view.editables.bar.locale ).toBe( locale );
			} );

			it( 'are not rendered', () => {
				expect( view.editables.foo.isRendered ).toBe( false );
				expect( view.editables.bar.isRendered ).toBe( false );
			} );

			it( 'can be created out of existing DOM elements', () => {
				const fooEl = document.createElement( 'div' );
				const barEl = document.createElement( 'div' );
				const options = { editableElements: { foo: fooEl, bar: barEl } };
				const testView = new MultiRootEditorUIView( locale, editingView, [ 'foo', 'bar' ], options );
				testView.editables.foo.name = 'foo';
				testView.editables.bar.name = 'bar';

				testView.render();

				expect( testView.editables.foo.element ).toBe( fooEl );
				expect( testView.editables.bar.element ).toBe( barEl );

				testView.destroy();
			} );

			it( 'creates an editing root with the default aria-label', () => {
				view.render();

				expect( fooViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Rich Text Editor. Editing area: foo' );
				expect( barViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Rich Text Editor. Editing area: bar' );

				view.destroy();
			} );

			it( 'creates an editing root with the configured aria-label (string format)', () => {
				const editingView = new EditingView();
				const fooViewRoot = createViewRoot( editingView.document, 'div', 'foo' );
				const barViewRoot = createViewRoot( editingView.document, 'div', 'bar' );
				const view = new MultiRootEditorUIView( locale, editingView, [ 'foo', 'bar' ], {
					label: 'Foo'
				} );

				view.editables.foo.name = 'foo';
				view.editables.bar.name = 'bar';
				view.render();

				expect( fooViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Foo' );
				expect( barViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Foo' );

				view.destroy();
			} );

			it( 'creates an editing root with the configured aria-label (object format)', () => {
				const editingView = new EditingView();
				const fooViewRoot = createViewRoot( editingView.document, 'div', 'foo' );
				const barViewRoot = createViewRoot( editingView.document, 'div', 'bar' );
				const view = new MultiRootEditorUIView( locale, editingView, [ 'foo', 'bar' ], {
					label: {
						foo: 'Foo',
						bar: 'Bar'
					}
				} );

				view.editables.foo.name = 'foo';
				view.editables.bar.name = 'bar';
				view.render();

				expect( fooViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Foo' );
				expect( barViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Bar' );

				view.destroy();
			} );
		} );
	} );

	describe( 'createEditable()', () => {
		it( 'adds editable', () => {
			const editable = view.createEditable( 'new' );

			expect( view.editables.new ).toBe( editable );
		} );

		it( 'uses given HTML element inside editable', () => {
			createViewRoot( editingView.document, 'div', 'new' );

			const domElement = document.createElement( 'div' );
			const editable = view.createEditable( 'new', domElement );
			view.editables.new.name = 'new';

			view.render();

			expect( view.editables.new ).toBe( editable );
			expect( editable.element ).toBe( domElement );

			view.destroy();
		} );

		it( 'passed locale object to editable', () => {
			view.createEditable( 'new' );

			expect( view.editables.new.locale ).toBe( locale );
		} );

		it( 'new editable is not rendered', () => {
			view.createEditable( 'new' );

			expect( view.editables.new.isRendered ).toBe( false );
		} );

		it( 'new editable is given an accessible aria label', () => {
			const newViewRoot = createViewRoot( editingView.document, 'div', 'new' );

			view.createEditable( 'new' );
			view.editables.new.name = 'new';

			view.render();

			expect( newViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Rich Text Editor. Editing area: new' );

			view.destroy();
		} );

		it( 'new editable is given an accessible aria label (custom)', () => {
			const newViewRoot = createViewRoot( editingView.document, 'div', 'new' );

			view.createEditable( 'new', undefined, 'Custom label' );
			view.editables.new.name = 'new';

			view.render();

			expect( newViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Custom label' );

			view.destroy();
		} );
	} );

	describe( 'removeEditable()', () => {
		it( 'removes the editable from the editables list (before view was rendered)', () => {
			view.removeEditable( 'foo' );

			expect( view.editables.foo ).toBeUndefined();
		} );

		it( 'removes the editable from the editables list (after view was rendered)', () => {
			view.render();

			view.removeEditable( 'foo' );

			expect( view.editables.foo ).toBeUndefined();

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
				expect( view.toolbar.isRendered ).toBe( true );
				expect( view.toolbar.element.parentElement ).toBeNull();
			} );

			it( 'gets the CSS classes', () => {
				expect( view.toolbar.element.classList.contains( 'ck-reset_all' ) ).toBe( true );
				expect( view.toolbar.element.classList.contains( 'ck-rounded-corners' ) ).toBe( true );
			} );

			it( 'gets the "dir" attribute corresponding to Locale#uiLanguageDirection', () => {
				expect( view.toolbar.element.getAttribute( 'dir' ) ).toBe( 'ltr' );
			} );
		} );

		describe( '#menuBarView', () => {
			it( 'is rendered but gets no parent', () => {
				expect( view.menuBarView.isRendered ).toBe( true );
				expect( view.menuBarView.element.parentElement ).toBeNull();
			} );

			it( 'gets the CSS classes', () => {
				expect( view.menuBarView.element.classList.contains( 'ck-reset_all' ) ).toBe( true );
				expect( view.menuBarView.element.classList.contains( 'ck-rounded-corners' ) ).toBe( true );
			} );

			it( 'gets the "dir" attribute corresponding to Locale#uiLanguageDirection', () => {
				expect( view.menuBarView.element.getAttribute( 'dir' ) ).toBe( 'ltr' );
			} );
		} );

		describe( '#editables', () => {
			it( 'are rendered but gets no parent', () => {
				expect( view.editables.foo.isRendered ).toBe( true );
				expect( view.editables.bar.isRendered ).toBe( true );
				expect( view.editables.foo.element.parentElement ).toBeNull();
				expect( view.editables.bar.element.parentElement ).toBeNull();
			} );
		} );
	} );

	describe( 'destroy', () => {
		beforeEach( () => {
			view.render();
		} );

		it( 'destroys #toolbar, #menuBarView and #editables', () => {
			const toolbarSpy = vi.spyOn( view.toolbar, 'destroy' );
			const menuBarViewSpy = vi.spyOn( view.menuBarView, 'destroy' );
			const editableFooSpy = vi.spyOn( view.editables.foo, 'destroy' );
			const editableBarSpy = vi.spyOn( view.editables.bar, 'destroy' );

			view.destroy();

			expect( toolbarSpy ).toHaveBeenCalledTimes( 1 );
			expect( menuBarViewSpy ).toHaveBeenCalledTimes( 1 );
			expect( editableFooSpy ).toHaveBeenCalledTimes( 1 );
			expect( editableBarSpy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'does not affect toolbar#element, menuBarView#element and editables #element', () => {
			document.body.appendChild( view.toolbar.element );
			document.body.appendChild( view.menuBarView.element );
			document.body.appendChild( view.editables.foo.element );
			document.body.appendChild( view.editables.bar.element );

			view.destroy();

			expect( view.toolbar.element.parentElement ).toBe( document.body );
			expect( view.menuBarView.element.parentElement ).toBe( document.body );
			expect( view.editables.foo.element.parentElement ).toBe( document.body );
			expect( view.editables.bar.element.parentElement ).toBe( document.body );

			view.toolbar.element.remove();
			view.menuBarView.element.remove();
			view.editables.foo.element.remove();
			view.editables.bar.element.remove();
		} );
	} );
} );
