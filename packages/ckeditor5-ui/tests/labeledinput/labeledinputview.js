/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '../../src/view';
import LabeledInputView from '../../src/labeledinput/labeledinputview';
import InputView from '../../src/inputtext/inputtextview';
import LabelView from '../../src/label/labelview';

describe( 'LabeledInputView', () => {
	const locale = {};

	let view;

	beforeEach( () => {
		view = new LabeledInputView( locale, InputView );

		view.render();
	} );

	describe( 'constructor()', () => {
		it( 'should set view#locale', () => {
			expect( view.locale ).to.deep.equal( locale );
		} );

		it( 'should set view#errorText', () => {
			expect( view.errorText ).to.be.null;
		} );

		it( 'should create view#inputView', () => {
			expect( view.inputView ).to.instanceOf( InputView );
		} );

		it( 'should create view#labelView', () => {
			expect( view.labelView ).to.instanceOf( LabelView );
		} );

		it( 'should create view#errorView', () => {
			expect( view.errorView ).to.instanceOf( View );

			expect( view.errorView.element.tagName ).to.equal( 'DIV' );
			expect( view.errorView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.errorView.element.classList.contains( 'ck-labeled-input__error' ) ).to.be.true;
		} );

		it( 'should pair #inputView and #labelView by unique id', () => {
			expect( view.labelView.for ).to.equal( view.inputView.id );
		} );

		it( 'should pair #inputView and #errorView by unique id', () => {
			expect( view.inputView.ariaDesribedById ).to.equal( view.errorView.element.id );
		} );
	} );

	describe( 'template', () => {
		it( 'should have the CSS class', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-labeled-input' ) ).to.be.true;
		} );

		it( 'should have label view', () => {
			expect( view.template.children[ 0 ] ).to.equal( view.labelView );
		} );

		it( 'should have input view', () => {
			expect( view.template.children[ 1 ] ).to.equal( view.inputView );
		} );

		it( 'should have the error container', () => {
			expect( view.template.children[ 2 ] ).to.equal( view.errorView );
		} );

		describe( 'DOM bindings', () => {
			describe( 'class', () => {
				it( 'should react on view#isReadOnly', () => {
					view.isReadOnly = false;
					expect( view.element.classList.contains( 'ck-disabled' ) ).to.be.false;

					view.isReadOnly = true;
					expect( view.element.classList.contains( 'ck-disabled' ) ).to.be.true;
				} );
			} );

			describe( 'error container', () => {
				it( 'should react on view#errorText', () => {
					const errorContainer = view.element.lastChild;

					view.errorText = '';
					expect( errorContainer.classList.contains( 'ck-hidden' ) ).to.be.true;
					expect( errorContainer.innerHTML ).to.equal( '' );

					view.errorText = 'foo';
					expect( errorContainer.classList.contains( 'ck-hidden' ) ).to.be.false;
					expect( errorContainer.innerHTML ).to.equal( 'foo' );
				} );
			} );
		} );
	} );

	describe( 'binding', () => {
		it( 'should bind view#text to view.labelView#label', () => {
			view.label = 'Foo bar';

			expect( view.labelView.text ).to.equal( 'Foo bar' );
		} );

		it( 'should bind view#value to view.inputView#value', () => {
			view.value = 'Lorem ipsum';

			expect( view.inputView.value ).to.equal( 'Lorem ipsum' );
		} );

		it( 'should bind view#isreadOnly to view.inputView#isReadOnly', () => {
			view.isReadOnly = false;

			expect( view.inputView.isReadOnly ).to.be.false;

			view.isReadOnly = true;

			expect( view.inputView.isReadOnly ).to.be.true;
		} );

		it( 'should bind view#errorText to view.inputView#hasError', () => {
			view.errorText = '';
			expect( view.inputView.hasError ).to.be.false;

			view.errorText = 'foo';
			expect( view.inputView.hasError ).to.be.true;
		} );

		it( 'should clear view#errorText upon view.inputView#input', () => {
			view.errorText = 'foo';

			view.inputView.fire( 'input' );
			expect( view.errorText ).to.be.null;
		} );
	} );

	describe( 'select()', () => {
		it( 'should select input value', () => {
			const spy = sinon.spy( view.inputView, 'select' );

			view.select();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the input in DOM', () => {
			const spy = sinon.spy( view.inputView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
