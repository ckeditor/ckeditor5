/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import EditingView from '@ckeditor/ckeditor5-engine/src/view/view.js';
import ViewRootEditableElement from '@ckeditor/ckeditor5-engine/src/view/rooteditableelement.js';
import InlineEditableUIView from '../../../src/editableui/inline/inlineeditableuiview.js';
import Locale from '@ckeditor/ckeditor5-utils/src/locale.js';

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
			expect( view.locale ).to.equal( locale );
		} );

		it( 'accepts editableElement', () => {
			const editableElement = document.createElement( 'div' );
			const view = new InlineEditableUIView( locale, editingView, editableElement );
			view.name = editingViewRoot.rootName;

			view.render();

			expect( view._editableElement ).to.equal( editableElement );

			view.destroy();
		} );

		it( 'creates view#element from template when no editableElement provided', () => {
			expect( view.template ).to.be.an( 'object' );
		} );
	} );

	describe( 'editableElement', () => {
		it( 'has proper accessibility role', () => {
			expect( view.element.attributes.getNamedItem( 'role' ).value ).to.equal( 'textbox' );
		} );

		describe( 'aria-label', () => {
			it( 'should fall back to the default value when no option was provided', () => {
				expect( editingViewRoot.getAttribute( 'aria-label' ) ).to.equal( 'Rich Text Editor. Editing area: main' );
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

				expect( editableElement.getAttribute( 'aria-label' ) ).to.equal( 'Existing label' );

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

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).to.equal( 'Custom label: custom-name' );

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

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).to.equal( 'Custom label' );

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

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).to.equal( 'Custom label' );

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

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).to.equal( 'Custom label: custom-name' );

				view.destroy();
			} );
		} );

		it( 'has proper class name', () => {
			expect( view.element.classList.contains( 'ck-editor__editable' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-editor__editable_inline' ) ).to.be.true;
		} );
	} );
} );
