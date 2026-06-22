/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClassicEditorUIView } from '../src/classiceditoruiview.js';
import { EditingView } from '@ckeditor/ckeditor5-engine';
import { StickyPanelView, ToolbarView, MenuBarView } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';
import { createViewRoot } from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';

describe( 'ClassicEditorUIView', () => {
	let locale, view, editingView, editingViewRoot;

	beforeEach( () => {
		locale = new Locale();
		editingView = new EditingView();
		editingViewRoot = createViewRoot( editingView.document );
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
				expect( view.stickyPanel ).toBeInstanceOf( StickyPanelView );
			} );

			it( 'is given a locale object', () => {
				expect( view.stickyPanel.locale ).toBe( locale );
			} );

			it( 'is put into the "top" collection', () => {
				expect( view.top.get( 0 ) ).toBe( view.stickyPanel );
			} );
		} );

		describe( '#toolbar', () => {
			it( 'is created', () => {
				expect( view.toolbar ).toBeInstanceOf( ToolbarView );
			} );

			it( 'is given a locale object', () => {
				expect( view.toolbar.locale ).toBe( locale );
			} );

			it( 'is put into the "stickyPanel.content" collection', () => {
				expect( view.stickyPanel.content.get( 0 ) ).toBe( view.toolbar );
			} );

			describe( 'automatic items grouping', () => {
				it( 'should be disabled by default', () => {
					expect( view.toolbar.options.shouldGroupWhenFull ).toBeUndefined();
				} );

				it( 'should be controlled via options.shouldToolbarGroupWhenFull', () => {
					const locale = new Locale();
					const editingView = new EditingView();
					const editingViewRoot = createViewRoot( editingView.document );
					const view = new ClassicEditorUIView( locale, editingView, {
						shouldToolbarGroupWhenFull: true
					} );

					view.editable.name = editingViewRoot.rootName;
					view.render();

					expect( view.toolbar.options.shouldGroupWhenFull ).toBe( true );

					return view.destroy();
				} );
			} );
		} );

		describe( '#editable', () => {
			it( 'creates an editing root with the default aria-label', () => {
				expect( editingViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Rich Text Editor. Editing area: main' );
			} );

			it( 'creates an editing root with the configured aria-label (string format)', () => {
				const editingView = new EditingView();
				const editingViewRoot = createViewRoot( editingView.document );
				const view = new ClassicEditorUIView( locale, editingView, {
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
				const view = new ClassicEditorUIView( locale, editingView, {
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

		describe( '#menuBarView', () => {
			it( 'is not created', () => {
				expect( view.menuBarView ).toBeUndefined();
			} );
		} );
	} );

	describe( 'with menu bar', () => {
		let locale, view, editingView, editingViewRoot;

		beforeEach( () => {
			locale = new Locale();
			editingView = new EditingView();
			editingViewRoot = createViewRoot( editingView.document );
			view = new ClassicEditorUIView( locale, editingView, { useMenuBar: true } );
			view.editable.name = editingViewRoot.rootName;
			view.render();
		} );

		afterEach( () => {
			view.destroy();
		} );

		describe( '#menuBarView', () => {
			it( 'is created', () => {
				expect( view.menuBarView ).toBeInstanceOf( MenuBarView );
			} );

			it( 'is given a locale object', () => {
				expect( view.menuBarView.locale ).toBe( locale );
			} );

			it( 'is put into the "stickyPanel.content" collection', () => {
				expect( view.stickyPanel.content.get( 0 ) ).toBe( view.menuBarView );
				expect( view.stickyPanel.content.get( 1 ) ).toBe( view.toolbar );
			} );
		} );
	} );
} );
