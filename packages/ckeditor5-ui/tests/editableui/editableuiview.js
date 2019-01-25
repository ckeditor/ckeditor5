/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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
		locale = new Locale( 'en' );
		editableElement = document.createElement( 'div' );

		editingView = new EditingView();
		editingViewRoot = new ViewRootEditableElement( 'div' );
		editingViewRoot._document = editingView.document;
		editingView.document.roots.add( editingViewRoot );
		view = new EditableUIView( locale, editingView );
		view.name = editingViewRoot.rootName;

		view.render();
	} );

	describe( 'constructor()', () => {
		it( 'sets initial values of attributes', () => {
			view = new EditableUIView( locale, editingView );

			expect( view.isFocused ).to.be.false;
			expect( view.name ).to.be.null;
			expect( view._externalElement ).to.be.undefined;
			expect( view._editingView ).to.equal( editingView );
		} );

		it( 'renders element from template when no editableElement', () => {
			expect( view.element ).to.equal( view._editableElement );
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-content' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-editor__editable' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-rounded-corners' ) ).to.be.true;
			expect( view._externalElement ).to.be.undefined;
			expect( view.isRendered ).to.be.true;
		} );

		it( 'accepts editableElement as an argument', () => {
			view = new EditableUIView( locale, editingView, editableElement );
			view.name = editingViewRoot.rootName;

			view.render();
			expect( view.element ).to.equal( editableElement );
			expect( view.element ).to.equal( view._editableElement );
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-editor__editable' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-rounded-corners' ) ).to.be.true;
			expect( view._hasExternalElement ).to.be.true;
			expect( view.isRendered ).to.be.true;
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
		} );
	} );

	describe( 'destroy()', () => {
		it( 'calls super#destroy()', () => {
			const spy = testUtils.sinon.spy( View.prototype, 'destroy' );

			view.destroy();
			sinon.assert.calledOnce( spy );
		} );

		it( 'can be called multiple times', () => {
			expect( () => {
				view.destroy();
				view.destroy();
			} ).to.not.throw();
		} );

		describe( 'when #editableElement as an argument', () => {
			it( 'reverts the template of editableElement', () => {
				editableElement = document.createElement( 'div' );
				editableElement.classList.add( 'foo' );
				editableElement.contentEditable = false;

				view = new EditableUIView( locale, editingView, editableElement );
				view.name = editingViewRoot.rootName;

				view.render();
				view.destroy();
				expect( view.element.classList.contains( 'ck' ) ).to.be.false;
				expect( view.element.classList.contains( 'foo' ) ).to.be.true;
			} );
		} );
	} );
} );
