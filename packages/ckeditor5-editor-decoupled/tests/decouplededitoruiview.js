/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DecoupledEditorUIView } from '../src/decouplededitoruiview.js';
import { EditingView } from '@ckeditor/ckeditor5-engine';
import { ToolbarView, MenuBarView, InlineEditableUIView } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';
import { createViewRoot } from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';

describe( 'DecoupledEditorUIView', () => {
	let locale, view, editingView, editingViewRoot;

	beforeEach( () => {
		locale = new Locale();
		editingView = new EditingView();
		editingViewRoot = createViewRoot( editingView.document );
		view = new DecoupledEditorUIView( locale, editingView );
		view.editable.name = editingViewRoot.rootName;
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
					const locale = new Locale();
					const editingView = new EditingView();
					const editingViewRoot = createViewRoot( editingView.document );
					const view = new DecoupledEditorUIView( locale, editingView, {
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

		describe( '#editable', () => {
			it( 'is created', () => {
				expect( view.editable ).toBeInstanceOf( InlineEditableUIView );
			} );

			it( 'is given a locale object', () => {
				expect( view.editable.locale ).toBe( locale );
			} );

			it( 'is not rendered', () => {
				expect( view.editable.isRendered ).toBe( false );
			} );

			it( 'can be created out of an existing DOM element', () => {
				const editableElement = document.createElement( 'div' );
				const testView = new DecoupledEditorUIView( locale, editingView, {
					editableElement
				} );
				testView.editable.name = editingViewRoot.rootName;

				testView.render();

				expect( testView.editable.element ).toBe( editableElement );

				testView.destroy();
			} );

			it( 'creates an editing root with the default aria-label', () => {
				view.render();

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Rich Text Editor. Editing area: main' );

				view.destroy();
			} );

			it( 'creates an editing root with the configured aria-label (string format)', () => {
				const editingView = new EditingView();
				const editingViewRoot = createViewRoot( editingView.document );
				const view = new DecoupledEditorUIView( locale, editingView, {
					label: 'Foo'
				} );
				view.editable.name = editingViewRoot.rootName;
				view.render();

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Foo' );

				view.destroy();
			} );

			it( 'creates an editing root with the configured aria-label (object format)', () => {
				const editingView = new EditingView();
				const editingViewRoot = createViewRoot( editingView.document );
				const view = new DecoupledEditorUIView( locale, editingView, {
					label: {
						main: 'Foo'
					}
				} );
				view.editable.name = editingViewRoot.rootName;
				view.render();

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Foo' );

				view.destroy();
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
				expect( view.isRendered ).toBe( true );
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

		describe( '#editable', () => {
			it( 'is rendered but gets no parent', () => {
				expect( view.isRendered ).toBe( true );
				expect( view.editable.element.parentElement ).toBeNull();
			} );
		} );
	} );

	describe( 'destroy', () => {
		beforeEach( () => {
			view.render();
		} );

		it( 'destroys #toolbar and #editable', () => {
			const toolbarSpy = vi.spyOn( view.toolbar, 'destroy' );
			const editableSpy = vi.spyOn( view.editable, 'destroy' );

			view.destroy();

			expect( toolbarSpy ).toHaveBeenCalledTimes( 1 );
			expect( editableSpy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'does not touch the toolbar#element and editable#element by default', () => {
			document.body.appendChild( view.toolbar.element );
			document.body.appendChild( view.editable.element );

			view.destroy();

			expect( view.toolbar.element.parentElement ).toBe( document.body );
			expect( view.editable.element.parentElement ).toBe( document.body );

			view.toolbar.element.remove();
			view.editable.element.remove();
		} );
	} );
} );
