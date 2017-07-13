/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import LabeledInputView from '../../src/labeledinput/labeledinputview';
import InputView from '../../src/inputtext/inputtextview';
import LabelView from '../../src/label/labelview';

describe( 'LabeledInputView', () => {
	const locale = {};

	let view;

	beforeEach( () => {
		view = new LabeledInputView( locale, InputView );

		view.init();
	} );

	describe( 'constructor()', () => {
		it( 'should set view#locale', () => {
			expect( view.locale ).to.deep.equal( locale );
		} );

		it( 'should create view#inputView', () => {
			expect( view.inputView ).to.instanceOf( InputView );
		} );

		it( 'should create view#labelView', () => {
			expect( view.labelView ).to.instanceOf( LabelView );
		} );

		it( 'should pair inputView and labelView by unique id', () => {
			expect( view.labelView.for ).to.equal( view.inputView.id ).to.ok;
		} );
	} );

	describe( 'template', () => {
		it( 'should have label view', () => {
			expect( view.template.children.get( 0 ) ).to.equal( view.labelView );
		} );

		it( 'should have input view', () => {
			expect( view.template.children.get( 1 ) ).to.equal( view.inputView );
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

			expect( view.inputView.isReadOnly ).to.false;

			view.isReadOnly = true;

			expect( view.inputView.isReadOnly ).to.true;
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
