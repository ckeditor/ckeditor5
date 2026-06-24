/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EditingView, ViewRootEditableElement } from '@ckeditor/ckeditor5-engine';
import { InlineEditableUIView } from '../../../src/editableui/inline/inlineeditableuiview.js';
import { Locale } from '@ckeditor/ckeditor5-utils';

describe( 'InlineEditableUIView', () => {
	let view, editingView, editingViewRoot, locale;

	beforeEach( () => {
		locale = new Locale();

		editingView = new EditingView();
		editingViewRoot = new ViewRootEditableElement( editingView.document, 'div' );
		editingView.document.roots.add( editingViewRoot );
		view = new InlineEditableUIView( locale, editingView );
		view.name = editingViewRoot.rootName;

		view.render();
	} );

	afterEach( () => {
		view.destroy();
		editingView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'accepts locale', () => {
			expect( view.locale ).toBe( locale );
		} );

		it( 'accepts editableElement', () => {
			const editableElement = document.createElement( 'div' );
			const view = new InlineEditableUIView( locale, editingView, editableElement );
			view.name = editingViewRoot.rootName;

			view.render();

			expect( view._editableElement ).toBe( editableElement );

			view.destroy();
		} );

		it( 'creates view#element from template when no editableElement provided', () => {
			expect( view.template ).toBeTypeOf( 'object' );
		} );
	} );

	describe( 'editableElement', () => {
		it( 'has proper accessibility role', () => {
			expect( view.element.attributes.getNamedItem( 'role' ).value ).toBe( 'textbox' );
		} );

		describe( 'aria-label', () => {
			it( 'should fall back to the default value when no option was provided', () => {
				expect( editingViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Rich Text Editor. Editing area: main' );
			} );

			it( 'should fall back to the default value before the editable element is rendered', () => {
				const view = new InlineEditableUIView( locale, editingView );

				view.name = 'custom-name';

				expect( view.getEditableAriaLabel() ).toBe( 'Rich Text Editor. Editing area: custom-name' );
			} );

			it( 'should fall back to the default value when editable element has no existing aria-label', () => {
				const editingViewRoot = new ViewRootEditableElement( editingView.document, 'div' );
				editingViewRoot.rootName = 'custom-name';
				editingView.document.roots.add( editingViewRoot );
				const editableElement = document.createElement( 'div' );

				const view = new InlineEditableUIView( locale, editingView, editableElement );

				view.name = editingViewRoot.rootName;

				view.render();

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Rich Text Editor. Editing area: custom-name' );

				view.destroy();
			} );

			it( 'should use the existing aria-label value of the editable element (no configured value)', () => {
				const editingViewRoot = new ViewRootEditableElement( editingView.document, 'div' );
				editingViewRoot.rootName = 'custom-name';
				editingView.document.roots.add( editingViewRoot );
				const editableElement = document.createElement( 'div' );

				editableElement.setAttribute( 'aria-label', 'Existing label' );

				const view = new InlineEditableUIView( locale, editingView, editableElement );

				view.name = editingViewRoot.rootName;

				view.render();

				expect( editableElement.getAttribute( 'aria-label' ) ).toBe( 'Existing label' );

				view.destroy();
			} );

			it( 'should be set via options.label passed into constructor (callback)', () => {
				const editingViewRoot = new ViewRootEditableElement( editingView.document, 'div' );
				editingViewRoot.rootName = 'custom-name';
				editingView.document.roots.add( editingViewRoot );

				const view = new InlineEditableUIView( locale, editingView, null, {
					label: view => `Custom label: ${ view.name }`
				} );

				view.name = editingViewRoot.rootName;

				view.render();

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Custom label: custom-name' );

				view.destroy();
			} );

			it( 'should be set via options.label passed into constructor (string)', () => {
				const editingViewRoot = new ViewRootEditableElement( editingView.document, 'div' );
				editingViewRoot.rootName = 'custom-name';
				editingView.document.roots.add( editingViewRoot );

				const view = new InlineEditableUIView( locale, editingView, null, {
					label: 'Custom label'
				} );

				view.name = editingViewRoot.rootName;

				view.render();

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Custom label' );

				view.destroy();
			} );

			it( 'should be set via options.label passed into constructor (object)', () => {
				const editingViewRoot = new ViewRootEditableElement( editingView.document, 'div' );
				editingViewRoot.rootName = 'custom-name';
				editingView.document.roots.add( editingViewRoot );

				const view = new InlineEditableUIView( locale, editingView, null, {
					label: {
						'custom-name': 'Custom label'
					}
				} );

				view.name = editingViewRoot.rootName;

				view.render();

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Custom label' );

				view.destroy();
			} );

			it( 'should be set via options.label passed into constructor (empty string)', () => {
				const editingViewRoot = new ViewRootEditableElement( editingView.document, 'div' );
				editingViewRoot.rootName = 'custom-name';
				editingView.document.roots.add( editingViewRoot );

				const view = new InlineEditableUIView( locale, editingView, null, {
					label: view => `Custom label: ${ view.name }`
				} );

				view.name = editingViewRoot.rootName;

				view.render();

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Custom label: custom-name' );

				view.destroy();
			} );
		} );

		it( 'has proper class name', () => {
			expect( view.element.classList.contains( 'ck-editor__editable' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-editor__editable_inline' ) ).toBe( true );
		} );
	} );
} );
