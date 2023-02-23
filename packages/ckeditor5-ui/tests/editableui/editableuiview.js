/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import EditingView from '@ckeditor/ckeditor5-engine/src/view/view';
import ViewRootEditableElement from '@ckeditor/ckeditor5-engine/src/view/rooteditableelement';
import EditableUIView from '../../src/editableui/editableuiview';
import View from '../../src/view';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'EditableUIView', () => {
	let view, editableElement, editingView, editingViewRoot, locale;

	testUtils.createSinonSandbox();

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

			expect( view.isFocused ).to.be.false;
			expect( view.name ).to.be.null;
			expect( view._externalElement ).to.be.undefined;
			expect( view._editingView ).to.equal( editingView );
			expect( view._hasExternalElement ).to.be.false;
			expect( view.hasExternalElement ).to.be.false;

			view.destroy();
		} );

		it( 'renders element from template when no editableElement', () => {
			expect( view.element ).to.equal( view._editableElement );
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-content' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-editor__editable' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-rounded-corners' ) ).to.be.true;
			expect( view.element.getAttribute( 'lang' ) ).to.equal( 'en' );
			expect( view.element.getAttribute( 'dir' ) ).to.equal( 'ltr' );
			expect( view._externalElement ).to.be.undefined;
			expect( view._hasExternalElement ).to.be.false;
			expect( view.hasExternalElement ).to.be.false;
			expect( view.isRendered ).to.be.true;
		} );

		it( 'accepts editableElement as an argument', () => {
			const view = new EditableUIView( locale, editingView, editableElement );
			view.name = editingViewRoot.rootName;

			view.render();

			expect( view.element ).to.equal( editableElement );
			expect( view.element ).to.equal( view._editableElement );
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-editor__editable' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-rounded-corners' ) ).to.be.true;
			expect( view.element.getAttribute( 'lang' ) ).to.equal( 'en' );
			expect( view.element.getAttribute( 'dir' ) ).to.equal( 'ltr' );
			expect( view._hasExternalElement ).to.be.true;
			expect( view.hasExternalElement ).to.be.true;
			expect( view.isRendered ).to.be.true;

			view.destroy();
		} );

		it( 'sets proper lang and dir attributes (implicit content language)', () => {
			const locale = new Locale( { uiLanguage: 'ar' } );
			const view = new EditableUIView( locale, editingView );
			view.name = editingViewRoot.rootName;

			view.render();

			expect( view.element.getAttribute( 'lang' ) ).to.equal( 'ar' );
			expect( view.element.getAttribute( 'dir' ) ).to.equal( 'rtl' );

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

			expect( view.element.getAttribute( 'lang' ) ).to.equal( 'ar' );
			expect( view.element.getAttribute( 'dir' ) ).to.equal( 'rtl' );

			view.destroy();
		} );
	} );

	describe( 'View bindings', () => {
		describe( 'class', () => {
			it( 'reacts on view#isFocused', () => {
				view.isFocused = true;

				expect( editingViewRoot.hasClass( 'ck-focused' ) ).to.be.true;
				expect( editingViewRoot.hasClass( 'ck-blurred' ) ).to.be.false;

				view.isFocused = false;
				expect( editingViewRoot.hasClass( 'ck-focused' ) ).to.be.false;
				expect( editingViewRoot.hasClass( 'ck-blurred' ) ).to.be.true;
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

				expect( editingViewRoot.hasClass( 'ck-focused' ), 1 ).to.be.true;
				expect( editingViewRoot.hasClass( 'ck-blurred' ), 2 ).to.be.false;
				expect( secondEditingViewRoot.hasClass( 'ck-focused' ), 3 ).to.be.false;
				expect( secondEditingViewRoot.hasClass( 'ck-blurred' ), 4 ).to.be.true;

				editingView.isRenderingInProgress = true;
				view.isFocused = false;
				secondView.isFocused = true;

				expect( editingViewRoot.hasClass( 'ck-focused' ), 5 ).to.be.true;
				expect( editingViewRoot.hasClass( 'ck-blurred' ), 6 ).to.be.false;
				expect( secondEditingViewRoot.hasClass( 'ck-focused' ), 7 ).to.be.false;
				expect( secondEditingViewRoot.hasClass( 'ck-blurred' ), 8 ).to.be.true;

				editingView.isRenderingInProgress = false;

				expect( editingViewRoot.hasClass( 'ck-focused' ), 9 ).to.be.false;
				expect( editingViewRoot.hasClass( 'ck-blurred' ), 10 ).to.be.true;
				expect( secondEditingViewRoot.hasClass( 'ck-focused' ), 11 ).to.be.true;
				expect( secondEditingViewRoot.hasClass( 'ck-blurred' ), 12 ).to.be.false;

				secondEditableElement.remove();
				secondView.destroy();
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'calls super#destroy()', () => {
			const spy = testUtils.sinon.spy( View.prototype, 'destroy' );
			const view = new EditableUIView( locale, editingView );
			view.name = editingViewRoot.rootName;

			view.render();
			view.destroy();

			sinon.assert.calledOnce( spy );
		} );

		it( 'can be called multiple times', () => {
			const view = new EditableUIView( locale, editingView );
			view.name = editingViewRoot.rootName;

			view.render();

			expect( () => {
				view.destroy();
				view.destroy();
			} ).to.not.throw();
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
				expect( view.element.classList.contains( 'ck' ) ).to.be.false;
				expect( view.element.classList.contains( 'foo' ) ).to.be.true;
			} );
		} );
	} );
} );
