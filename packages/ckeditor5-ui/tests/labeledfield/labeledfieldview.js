/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import View from '../../src/view.js';
import LabeledFieldView from '../../src/labeledfield/labeledfieldview.js';
import LabelView from '../../src/label/labelview.js';
import ViewCollection from '../../src/viewcollection.js';

describe( 'LabeledFieldView', () => {
	const locale = {};

	let labeledField, fieldView;

	beforeEach( () => {
		labeledField = new LabeledFieldView( locale, ( labeledField, viewUid, statusUid ) => {
			fieldView = new View( locale );
			fieldView.setTemplate( { tag: 'div' } );
			fieldView.focus = () => {};
			fieldView.viewUid = viewUid;
			fieldView.statusUid = statusUid;

			return fieldView;
		} );

		labeledField.render();
	} );

	afterEach( () => {
		labeledField.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should set labeledField#locale', () => {
			expect( labeledField.locale ).to.deep.equal( locale );
		} );

		it( 'should set labeledField#fieldView', () => {
			expect( labeledField.fieldView ).to.equal( fieldView );
		} );

		it( 'should set labeledField#label', () => {
			expect( labeledField.label ).to.be.undefined;
		} );

		it( 'should set labeledField#isEnabled', () => {
			expect( labeledField.isEnabled ).to.be.true;
		} );

		it( 'should set labeledField#errorText', () => {
			expect( labeledField.errorText ).to.be.null;
		} );

		it( 'should set labeledField#infoText', () => {
			expect( labeledField.infoText ).to.be.null;
		} );

		it( 'should set labeledField#class', () => {
			expect( labeledField.class ).to.be.undefined;
		} );

		it( 'should set labeledField#isEmpty', () => {
			expect( labeledField.isEmpty ).to.be.true;
		} );

		it( 'should set labeledField#isFocused', () => {
			expect( labeledField.isFocused ).to.be.false;
		} );

		it( 'should create labeledField#labelView', () => {
			expect( labeledField.labelView ).to.instanceOf( LabelView );
		} );

		it( 'should create labeledField#statusView', () => {
			expect( labeledField.statusView ).to.instanceOf( View );

			expect( labeledField.statusView.element.tagName ).to.equal( 'DIV' );
			expect( labeledField.statusView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( labeledField.statusView.element.classList.contains( 'ck-labeled-field-view__status' ) ).to.be.true;
		} );

		it( 'should create a #fieldWrapperChildren collection with #fieldView and #labelView', () => {
			expect( labeledField.fieldWrapperChildren ).to.be.instanceOf( ViewCollection );
			expect( Array.from( labeledField.fieldWrapperChildren ) ).to.have.ordered.members( [
				labeledField.fieldView, labeledField.labelView
			] );
		} );

		it( 'should allow pairing #view and #labelView by unique id', () => {
			expect( labeledField.labelView.for ).to.equal( fieldView.viewUid );
		} );

		it( 'should allow pairing #view and #statusView by unique id', () => {
			expect( fieldView.statusUid ).to.equal( labeledField.statusView.element.id );
		} );
	} );

	describe( 'template', () => {
		it( 'should have the CSS class', () => {
			expect( labeledField.element.classList.contains( 'ck' ) ).to.be.true;
			expect( labeledField.element.classList.contains( 'ck-labeled-field-view' ) ).to.be.true;
		} );

		it( 'should have a wrapper for internals', () => {
			expect( labeledField.element.firstChild.classList.contains( 'ck' ) ).to.be.true;
			expect( labeledField.element.firstChild.classList.contains( 'ck-labeled-field-view__input-wrapper' ) ).to.be.true;
		} );

		it( 'should use the #fieldWrapperChildren collection', () => {
			expect( labeledField.template.children[ 0 ].children[ 0 ] ).to.equal( labeledField.fieldWrapperChildren );
		} );

		it( 'should have the #statusView container', () => {
			expect( labeledField.template.children[ 1 ] ).to.equal( labeledField.statusView );
		} );

		describe( 'DOM bindings', () => {
			describe( 'class', () => {
				it( 'should react on labeledField#class', () => {
					labeledField.class = 'foo';
					expect( labeledField.element.classList.contains( 'foo' ) ).to.be.true;

					labeledField.class = 'bar';
					expect( labeledField.element.classList.contains( 'foo' ) ).to.be.false;
					expect( labeledField.element.classList.contains( 'bar' ) ).to.be.true;
				} );

				it( 'should react on labeledField#isEnabled', () => {
					labeledField.isEnabled = true;
					expect( labeledField.element.classList.contains( 'ck-disabled' ) ).to.be.false;

					labeledField.isEnabled = false;
					expect( labeledField.element.classList.contains( 'ck-disabled' ) ).to.be.true;
				} );

				it( 'should react on labeledField#isEmpty', () => {
					labeledField.isEmpty = true;
					expect( labeledField.element.classList.contains( 'ck-labeled-field-view_empty' ) ).to.be.true;

					labeledField.isEmpty = false;
					expect( labeledField.element.classList.contains( 'ck-labeled-field-view_empty' ) ).to.be.false;
				} );

				it( 'should react on labeledField#isFocused', () => {
					labeledField.isFocused = true;
					expect( labeledField.element.classList.contains( 'ck-labeled-field-view_focused' ) ).to.be.true;

					labeledField.isFocused = false;
					expect( labeledField.element.classList.contains( 'ck-labeled-field-view_focused' ) ).to.be.false;
				} );

				it( 'should react on labeledField#placeholder', () => {
					labeledField.placeholder = 'asd';
					expect( labeledField.element.classList.contains( 'ck-labeled-field-view_placeholder' ) ).to.be.true;

					labeledField.placeholder = null;
					expect( labeledField.element.classList.contains( 'ck-labeled-field-view_placeholder' ) ).to.be.false;
				} );
			} );

			describe( 'status container', () => {
				it( 'should react on labeledField#errorText', () => {
					const statusElement = labeledField.statusView.element;

					labeledField.errorText = '';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.true;
					expect( statusElement.classList.contains( 'ck-labeled-field-view__status_error' ) ).to.be.false;
					expect( statusElement.hasAttribute( 'role' ) ).to.be.false;
					expect( statusElement.innerHTML ).to.equal( '' );

					labeledField.errorText = 'foo';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.false;
					expect( statusElement.classList.contains( 'ck-labeled-field-view__status_error' ) ).to.be.true;
					expect( statusElement.getAttribute( 'role' ) ).to.equal( 'alert' );
					expect( statusElement.innerHTML ).to.equal( 'foo' );
				} );

				it( 'should react on labeledField#infoText', () => {
					const statusElement = labeledField.statusView.element;

					labeledField.infoText = '';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.true;
					expect( statusElement.classList.contains( 'ck-labeled-field-view__status_error' ) ).to.be.false;
					expect( statusElement.hasAttribute( 'role' ) ).to.be.false;
					expect( statusElement.innerHTML ).to.equal( '' );

					labeledField.infoText = 'foo';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.false;
					expect( statusElement.classList.contains( 'ck-labeled-field-view__status_error' ) ).to.be.false;
					expect( statusElement.hasAttribute( 'role' ) ).to.be.false;
					expect( statusElement.innerHTML ).to.equal( 'foo' );
				} );
			} );
		} );
	} );

	describe( 'binding', () => {
		it( 'should bind labeledField#label to labeledField.labelView#label', () => {
			labeledField.label = 'Foo bar';

			expect( labeledField.labelView.text ).to.equal( 'Foo bar' );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the #view in DOM', () => {
			const spy = sinon.spy( fieldView, 'focus' );

			labeledField.focus();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should pass down the focus direction parameter', () => {
			const spy = sinon.spy( fieldView, 'focus' );

			labeledField.focus( -1 );

			sinon.assert.calledOnceWithExactly( spy, -1 );
		} );
	} );
} );
