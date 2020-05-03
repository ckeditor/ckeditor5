/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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

		it( 'should set view#infoText', () => {
			expect( view.infoText ).to.be.null;
		} );

		it( 'should create view#inputView', () => {
			expect( view.inputView ).to.instanceOf( InputView );
		} );

		it( 'should create view#labelView', () => {
			expect( view.labelView ).to.instanceOf( LabelView );
		} );

		it( 'should create view#statusView', () => {
			expect( view.statusView ).to.instanceOf( View );

			expect( view.statusView.element.tagName ).to.equal( 'DIV' );
			expect( view.statusView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.statusView.element.classList.contains( 'ck-labeled-input__status' ) ).to.be.true;
		} );

		it( 'should pair #inputView and #labelView by unique id', () => {
			expect( view.labelView.for ).to.equal( view.inputView.id );
		} );

		it( 'should pair #inputView and #statusView by unique id', () => {
			expect( view.inputView.ariaDescribedById ).to.equal( view.statusView.element.id );
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

		it( 'should have the status container', () => {
			expect( view.template.children[ 2 ] ).to.equal( view.statusView );
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

			describe( 'status container', () => {
				it( 'should react on view#errorText', () => {
					const statusElement = view.statusView.element;

					view.errorText = '';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.true;
					expect( statusElement.classList.contains( 'ck-labeled-input__status_error' ) ).to.be.false;
					expect( statusElement.hasAttribute( 'role' ) ).to.be.false;
					expect( statusElement.innerHTML ).to.equal( '' );

					view.errorText = 'foo';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.false;
					expect( statusElement.classList.contains( 'ck-labeled-input__status_error' ) ).to.be.true;
					expect( statusElement.getAttribute( 'role' ) ).to.equal( 'alert' );
					expect( statusElement.innerHTML ).to.equal( 'foo' );
				} );

				it( 'should react on view#infoText', () => {
					const statusElement = view.statusView.element;

					view.infoText = '';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.true;
					expect( statusElement.classList.contains( 'ck-labeled-input__status_error' ) ).to.be.false;
					expect( statusElement.hasAttribute( 'role' ) ).to.be.false;
					expect( statusElement.innerHTML ).to.equal( '' );

					view.infoText = 'foo';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.false;
					expect( statusElement.classList.contains( 'ck-labeled-input__status_error' ) ).to.be.false;
					expect( statusElement.hasAttribute( 'role' ) ).to.be.false;
					expect( statusElement.innerHTML ).to.equal( 'foo' );
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
