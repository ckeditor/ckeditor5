/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, input */

import LabeledInputView from 'ckeditor5-ui/src/labeledinput/labeledinputview';
import InputView from 'ckeditor5-ui/src/inputtext/inputtextview';
import LabelView from 'ckeditor5-ui/src/label/labelview';

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
	} );

	describe( 'select', () => {
		it( 'should select input value', () => {
			const spy = sinon.spy( view.inputView, 'select' );

			view.select();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
