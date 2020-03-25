/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import View from '../../src/view';
import LabeledFieldView from '../../src/labeledfield/labeledfieldview';
import LabelView from '../../src/label/labelview';

describe( 'LabeledFieldView', () => {
	const locale = {};

	let labeledInput, view;

	beforeEach( () => {
		labeledInput = new LabeledFieldView( locale, ( labeledInput, viewUid, statusUid ) => {
			view = new View( locale );
			view.setTemplate( { tag: 'div' } );
			view.focus = () => {};
			view.viewUid = viewUid;
			view.statusUid = statusUid;

			return view;
		} );

		labeledInput.render();
	} );

	afterEach( () => {
		labeledInput.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should set labeledInput#locale', () => {
			expect( labeledInput.locale ).to.deep.equal( locale );
		} );

		it( 'should set labeledInput#fieldView', () => {
			expect( labeledInput.fieldView ).to.equal( view );
		} );

		it( 'should set labeledInput#label', () => {
			expect( labeledInput.label ).to.be.undefined;
		} );

		it( 'should set labeledInput#isEnabled', () => {
			expect( labeledInput.isEnabled ).to.be.true;
		} );

		it( 'should set labeledInput#errorText', () => {
			expect( labeledInput.errorText ).to.be.null;
		} );

		it( 'should set labeledInput#infoText', () => {
			expect( labeledInput.infoText ).to.be.null;
		} );

		it( 'should set labeledInput#class', () => {
			expect( labeledInput.class ).to.be.undefined;
		} );

		it( 'should create labeledInput#labelView', () => {
			expect( labeledInput.labelView ).to.instanceOf( LabelView );
		} );

		it( 'should create labeledInput#statusView', () => {
			expect( labeledInput.statusView ).to.instanceOf( View );

			expect( labeledInput.statusView.element.tagName ).to.equal( 'DIV' );
			expect( labeledInput.statusView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( labeledInput.statusView.element.classList.contains( 'ck-labeled-view__status' ) ).to.be.true;
		} );

		it( 'should allow pairing #view and #labelView by unique id', () => {
			expect( labeledInput.labelView.for ).to.equal( view.viewUid );
		} );

		it( 'should allow pairing #view and #statusView by unique id', () => {
			expect( view.statusUid ).to.equal( labeledInput.statusView.element.id );
		} );
	} );

	describe( 'template', () => {
		it( 'should have the CSS class', () => {
			expect( labeledInput.element.classList.contains( 'ck' ) ).to.be.true;
			expect( labeledInput.element.classList.contains( 'ck-labeled-view' ) ).to.be.true;
		} );

		it( 'should have #labeledInput', () => {
			expect( labeledInput.template.children[ 0 ] ).to.equal( labeledInput.labelView );
		} );

		it( 'should have #view', () => {
			expect( labeledInput.template.children[ 1 ] ).to.equal( view );
		} );

		it( 'should have the #statusView container', () => {
			expect( labeledInput.template.children[ 2 ] ).to.equal( labeledInput.statusView );
		} );

		describe( 'DOM bindings', () => {
			describe( 'class', () => {
				it( 'should react on labeledInput#class', () => {
					labeledInput.class = 'foo';
					expect( labeledInput.element.classList.contains( 'foo' ) ).to.be.true;

					labeledInput.class = 'bar';
					expect( labeledInput.element.classList.contains( 'foo' ) ).to.be.false;
					expect( labeledInput.element.classList.contains( 'bar' ) ).to.be.true;
				} );
			} );

			describe( 'status container', () => {
				it( 'should react on labeledInput#errorText', () => {
					const statusElement = labeledInput.statusView.element;

					labeledInput.errorText = '';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.true;
					expect( statusElement.classList.contains( 'ck-labeled-view__status_error' ) ).to.be.false;
					expect( statusElement.hasAttribute( 'role' ) ).to.be.false;
					expect( statusElement.innerHTML ).to.equal( '' );

					labeledInput.errorText = 'foo';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.false;
					expect( statusElement.classList.contains( 'ck-labeled-view__status_error' ) ).to.be.true;
					expect( statusElement.getAttribute( 'role' ) ).to.equal( 'alert' );
					expect( statusElement.innerHTML ).to.equal( 'foo' );
				} );

				it( 'should react on labeledInput#infoText', () => {
					const statusElement = labeledInput.statusView.element;

					labeledInput.infoText = '';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.true;
					expect( statusElement.classList.contains( 'ck-labeled-view__status_error' ) ).to.be.false;
					expect( statusElement.hasAttribute( 'role' ) ).to.be.false;
					expect( statusElement.innerHTML ).to.equal( '' );

					labeledInput.infoText = 'foo';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.false;
					expect( statusElement.classList.contains( 'ck-labeled-view__status_error' ) ).to.be.false;
					expect( statusElement.hasAttribute( 'role' ) ).to.be.false;
					expect( statusElement.innerHTML ).to.equal( 'foo' );
				} );
			} );
		} );
	} );

	describe( 'binding', () => {
		it( 'should bind labeledInput#label to labeledInput.labelView#label', () => {
			labeledInput.label = 'Foo bar';

			expect( labeledInput.labelView.text ).to.equal( 'Foo bar' );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the #view in DOM', () => {
			const spy = sinon.spy( view, 'focus' );

			labeledInput.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
