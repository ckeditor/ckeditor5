/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EditingView, ViewRootEditableElement } from '@ckeditor/ckeditor5-engine';
import { EditableUIView } from '../../src/editableui/editableuiview.js';
import { View } from '../../src/view.js';
import { Locale } from '@ckeditor/ckeditor5-utils';

describe( 'EditableUIView', () => {
	let view, editableElement, editingView, editingViewRoot, locale;

	beforeEach( () => {
		locale = new Locale();
		editableElement = document.createElement( 'div' );

		editingView = new EditingView();
		editingViewRoot = new ViewRootEditableElement( editingView.document, 'div' );
		editingView.document.roots.add( editingViewRoot );
		view = new EditableUIView( locale, editingView );
		view.name = editingViewRoot.rootName;

		view.render();
	} );

	afterEach( () => {
		view.destroy();
		editableElement.remove();
	} );

	describe( 'constructor()', () => {
		it( 'sets initial values of attributes', () => {
			const view = new EditableUIView( locale, editingView );

			expect( view.isFocused ).toBe( false );
			expect( view.isInlineRoot ).toBe( false );
			expect( view.name ).toBeNull();
			expect( view._externalElement ).toBeUndefined();
			expect( view._editingView ).toBe( editingView );
			expect( view._hasExternalElement ).toBe( false );
			expect( view.hasExternalElement ).toBe( false );

			view.destroy();
		} );

		it( 'renders element from template when no editableElement', () => {
			expect( view.element ).toBe( view._editableElement );
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-content' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-editor__editable' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-rounded-corners' ) ).toBe( true );
			expect( view.element.getAttribute( 'lang' ) ).toBe( 'en' );
			expect( view.element.getAttribute( 'dir' ) ).toBe( 'ltr' );
			expect( view._externalElement ).toBeUndefined();
			expect( view._hasExternalElement ).toBe( false );
			expect( view.hasExternalElement ).toBe( false );
			expect( view.isRendered ).toBe( true );
		} );

		it( 'accepts editableElement as an argument', () => {
			const view = new EditableUIView( locale, editingView, editableElement );
			view.name = editingViewRoot.rootName;

			view.render();

			expect( view.element ).toBe( editableElement );
			expect( view.element ).toBe( view._editableElement );
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-editor__editable' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-rounded-corners' ) ).toBe( true );
			expect( view.element.getAttribute( 'lang' ) ).toBe( 'en' );
			expect( view.element.getAttribute( 'dir' ) ).toBe( 'ltr' );
			expect( view._hasExternalElement ).toBe( true );
			expect( view.hasExternalElement ).toBe( true );
			expect( view.isRendered ).toBe( true );

			view.destroy();
		} );

		it( 'sets proper lang and dir attributes (implicit content language)', () => {
			const locale = new Locale( { uiLanguage: 'ar' } );
			const view = new EditableUIView( locale, editingView );
			view.name = editingViewRoot.rootName;

			view.render();

			expect( view.element.getAttribute( 'lang' ) ).toBe( 'ar' );
			expect( view.element.getAttribute( 'dir' ) ).toBe( 'rtl' );

			view.destroy();
		} );

		it( 'sets proper lang and dir attributes (explicit content language)', () => {
			const locale = new Locale( {
				uiLanguage: 'pl',
				contentLanguage: 'ar'
			} );
			const view = new EditableUIView( locale, editingView );
			view.name = editingViewRoot.rootName;

			view.render();

			expect( view.element.getAttribute( 'lang' ) ).toBe( 'ar' );
			expect( view.element.getAttribute( 'dir' ) ).toBe( 'rtl' );

			view.destroy();
		} );

		describe( 'when editableElement is a ViewRootElementDefinition', () => {
			it( 'should render a fresh element with the given tag name', () => {
				const view = new EditableUIView( locale, editingView, { name: 'h1' } );
				view.name = editingViewRoot.rootName;

				view.render();

				expect( view.element.tagName ).toBe( 'H1' );
				expect( view._hasExternalElement ).toBe( false );
				expect( view.hasExternalElement ).toBe( false );

				view.destroy();
			} );

			it( 'should default to a `<div>` when no name is provided in the definition', () => {
				const view = new EditableUIView( locale, editingView, {} );
				view.name = editingViewRoot.rootName;

				view.render();

				expect( view.element.tagName ).toBe( 'DIV' );

				view.destroy();
			} );

			it( 'should keep the editor classes on top of the definition\'s classes', () => {
				const view = new EditableUIView( locale, editingView, {
					name: 'section',
					classes: [ 'foo', 'bar' ]
				} );
				view.name = editingViewRoot.rootName;

				view.render();

				expect( view.element.classList.contains( 'ck' ) ).toBe( true );
				expect( view.element.classList.contains( 'ck-content' ) ).toBe( true );
				expect( view.element.classList.contains( 'ck-editor__editable' ) ).toBe( true );
				expect( view.element.classList.contains( 'ck-rounded-corners' ) ).toBe( true );
				expect( view.element.classList.contains( 'foo' ) ).toBe( true );
				expect( view.element.classList.contains( 'bar' ) ).toBe( true );

				view.destroy();
			} );

			it( 'should accept `classes` as a single string', () => {
				const view = new EditableUIView( locale, editingView, {
					name: 'section',
					classes: 'foo bar'
				} );
				view.name = editingViewRoot.rootName;

				view.render();

				expect( view.element.classList.contains( 'foo' ) ).toBe( true );
				expect( view.element.classList.contains( 'bar' ) ).toBe( true );

				view.destroy();
			} );

			it( 'should apply the `styles` object', () => {
				const view = new EditableUIView( locale, editingView, {
					name: 'section',
					styles: { color: 'rgb(255, 0, 0)', 'font-weight': 'bold' }
				} );
				view.name = editingViewRoot.rootName;

				view.render();

				expect( view.element.style.color ).toBe( 'rgb(255, 0, 0)' );
				expect( view.element.style.fontWeight ).toBe( 'bold' );

				view.destroy();
			} );

			it( 'should apply arbitrary attributes', () => {
				const view = new EditableUIView( locale, editingView, {
					name: 'section',
					attributes: { 'data-id': '123', 'data-role': 'editor' }
				} );
				view.name = editingViewRoot.rootName;

				view.render();

				expect( view.element.getAttribute( 'data-id' ) ).toBe( '123' );
				expect( view.element.getAttribute( 'data-role' ) ).toBe( 'editor' );

				view.destroy();
			} );

			it( 'should keep locale `lang` and `dir` attributes', () => {
				const view = new EditableUIView( locale, editingView, { name: 'section' } );
				view.name = editingViewRoot.rootName;

				view.render();

				expect( view.element.getAttribute( 'lang' ) ).toBe( 'en' );
				expect( view.element.getAttribute( 'dir' ) ).toBe( 'ltr' );

				view.destroy();
			} );

			it( 'should leave _editableElement set to the freshly created element', () => {
				const view = new EditableUIView( locale, editingView, { name: 'h1' } );
				view.name = editingViewRoot.rootName;

				view.render();

				expect( view._editableElement ).toBe( view.element );

				view.destroy();
			} );
		} );
	} );

	describe( 'View bindings', () => {
		describe( 'class', () => {
			it( 'reacts on view#isFocused', () => {
				view.isFocused = true;

				expect( editingViewRoot.hasClass( 'ck-focused' ) ).toBe( true );
				expect( editingViewRoot.hasClass( 'ck-blurred' ) ).toBe( false );

				view.isFocused = false;
				expect( editingViewRoot.hasClass( 'ck-focused' ) ).toBe( false );
				expect( editingViewRoot.hasClass( 'ck-blurred' ) ).toBe( true );
			} );

			// https://github.com/ckeditor/ckeditor5/issues/1530.
			// https://github.com/ckeditor/ckeditor5/issues/1676.
			it( 'should work when update is handled during the rendering phase', () => {
				const secondEditingViewRoot = new ViewRootEditableElement( editingView.document, 'div' );
				const secondView = new EditableUIView( locale, editingView );
				const secondEditableElement = document.createElement( 'div' );

				document.body.appendChild( secondEditableElement );

				secondEditingViewRoot.rootName = 'second';
				editingView.document.roots.add( secondEditingViewRoot );

				secondView.name = 'second';
				secondView.render();

				editingView.attachDomRoot( editableElement, 'main' );
				editingView.attachDomRoot( secondEditableElement, 'second' );

				view.isFocused = true;
				secondView.isFocused = false;

				expect( editingViewRoot.hasClass( 'ck-focused' ), 1 ).toBe( true );
				expect( editingViewRoot.hasClass( 'ck-blurred' ), 2 ).toBe( false );
				expect( secondEditingViewRoot.hasClass( 'ck-focused' ), 3 ).toBe( false );
				expect( secondEditingViewRoot.hasClass( 'ck-blurred' ), 4 ).toBe( true );

				editingView.isRenderingInProgress = true;
				view.isFocused = false;
				secondView.isFocused = true;

				expect( editingViewRoot.hasClass( 'ck-focused' ), 5 ).toBe( true );
				expect( editingViewRoot.hasClass( 'ck-blurred' ), 6 ).toBe( false );
				expect( secondEditingViewRoot.hasClass( 'ck-focused' ), 7 ).toBe( false );
				expect( secondEditingViewRoot.hasClass( 'ck-blurred' ), 8 ).toBe( true );

				editingView.isRenderingInProgress = false;

				expect( editingViewRoot.hasClass( 'ck-focused' ), 9 ).toBe( false );
				expect( editingViewRoot.hasClass( 'ck-blurred' ), 10 ).toBe( true );
				expect( secondEditingViewRoot.hasClass( 'ck-focused' ), 11 ).toBe( true );
				expect( secondEditingViewRoot.hasClass( 'ck-blurred' ), 12 ).toBe( false );

				secondEditableElement.remove();
				secondView.destroy();
			} );

			it( 'adds the inline-root class when view#isInlineRoot becomes true', () => {
				expect( view.element.classList.contains( 'ck-editor__editable_inline-root' ) ).toBe( false );

				view.isInlineRoot = true;

				expect( view.element.classList.contains( 'ck-editor__editable_inline-root' ) ).toBe( true );
			} );

			it( 'removes the inline-root class when view#isInlineRoot becomes false', () => {
				view.isInlineRoot = true;
				expect( view.element.classList.contains( 'ck-editor__editable_inline-root' ) ).toBe( true );

				view.isInlineRoot = false;
				expect( view.element.classList.contains( 'ck-editor__editable_inline-root' ) ).toBe( false );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'calls super#destroy()', () => {
			const spy = vi.spyOn( View.prototype, 'destroy' );
			const view = new EditableUIView( locale, editingView );
			view.name = editingViewRoot.rootName;

			view.render();
			view.destroy();

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'can be called multiple times', () => {
			const view = new EditableUIView( locale, editingView );
			view.name = editingViewRoot.rootName;

			view.render();

			expect( () => {
				view.destroy();
				view.destroy();
			} ).not.toThrow();
		} );

		describe( 'when #editableElement as an argument', () => {
			it( 'reverts the template of editableElement', () => {
				const editableElement = document.createElement( 'div' );
				editableElement.classList.add( 'foo' );
				editableElement.contentEditable = false;

				const view = new EditableUIView( locale, editingView, editableElement );
				view.name = editingViewRoot.rootName;

				view.render();
				view.destroy();
				expect( view.element.classList.contains( 'ck' ) ).toBe( false );
				expect( view.element.classList.contains( 'foo' ) ).toBe( true );
			} );
		} );
	} );
} );
