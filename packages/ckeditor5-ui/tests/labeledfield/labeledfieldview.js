/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import View from '../../src/view';
import LabeledFieldView from '../../src/labeledfield/labeledfieldview';
import LabelView from '../../src/label/labelview';

describe( 'LabeledFieldView', () => {
	const locale = {};

	let labeledFieldView, view;

	beforeEach( () => {
		labeledFieldView = new LabeledFieldView( locale, ( labeledFieldView, viewUid, statusUid ) => {
			view = new View( locale );
			view.setTemplate( { tag: 'div' } );
			view.focus = () => {};
			view.viewUid = viewUid;
			view.statusUid = statusUid;

			return view;
		} );

		labeledFieldView.render();
	} );

	afterEach( () => {
		labeledFieldView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should set labeledFieldView#locale', () => {
			expect( labeledFieldView.locale ).to.deep.equal( locale );
		} );

		it( 'should set labeledFieldView#field', () => {
			expect( labeledFieldView.field ).to.equal( view );
		} );

		it( 'should set labeledFieldView#label', () => {
			expect( labeledFieldView.label ).to.be.undefined;
		} );

		it( 'should set labeledFieldView#isEnabled', () => {
			expect( labeledFieldView.isEnabled ).to.be.true;
		} );

		it( 'should set labeledFieldView#errorText', () => {
			expect( labeledFieldView.errorText ).to.be.null;
		} );

		it( 'should set labeledFieldView#infoText', () => {
			expect( labeledFieldView.infoText ).to.be.null;
		} );

		it( 'should set labeledFieldView#class', () => {
			expect( labeledFieldView.class ).to.be.undefined;
		} );

		it( 'should create labeledFieldView#labelView', () => {
			expect( labeledFieldView.labelView ).to.instanceOf( LabelView );
		} );

		it( 'should create labeledFieldView#statusView', () => {
			expect( labeledFieldView.statusView ).to.instanceOf( View );

			expect( labeledFieldView.statusView.element.tagName ).to.equal( 'DIV' );
			expect( labeledFieldView.statusView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( labeledFieldView.statusView.element.classList.contains( 'ck-labeled-view__status' ) ).to.be.true;
		} );

		it( 'should allow pairing #view and #labelView by unique id', () => {
			expect( labeledFieldView.labelView.for ).to.equal( view.viewUid );
		} );

		it( 'should allow pairing #view and #statusView by unique id', () => {
			expect( view.statusUid ).to.equal( labeledFieldView.statusView.element.id );
		} );
	} );

	describe( 'template', () => {
		it( 'should have the CSS class', () => {
			expect( labeledFieldView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( labeledFieldView.element.classList.contains( 'ck-labeled-view' ) ).to.be.true;
		} );

		it( 'should have #labeledFieldView', () => {
			expect( labeledFieldView.template.children[ 0 ] ).to.equal( labeledFieldView.labelView );
		} );

		it( 'should have #view', () => {
			expect( labeledFieldView.template.children[ 1 ] ).to.equal( view );
		} );

		it( 'should have the #statusView container', () => {
			expect( labeledFieldView.template.children[ 2 ] ).to.equal( labeledFieldView.statusView );
		} );

		describe( 'DOM bindings', () => {
			describe( 'class', () => {
				it( 'should react on labeledFieldView#class', () => {
					labeledFieldView.class = 'foo';
					expect( labeledFieldView.element.classList.contains( 'foo' ) ).to.be.true;

					labeledFieldView.class = 'bar';
					expect( labeledFieldView.element.classList.contains( 'foo' ) ).to.be.false;
					expect( labeledFieldView.element.classList.contains( 'bar' ) ).to.be.true;
				} );
			} );

			describe( 'status container', () => {
				it( 'should react on labeledFieldView#errorText', () => {
					const statusElement = labeledFieldView.statusView.element;

					labeledFieldView.errorText = '';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.true;
					expect( statusElement.classList.contains( 'ck-labeled-view__status_error' ) ).to.be.false;
					expect( statusElement.hasAttribute( 'role' ) ).to.be.false;
					expect( statusElement.innerHTML ).to.equal( '' );

					labeledFieldView.errorText = 'foo';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.false;
					expect( statusElement.classList.contains( 'ck-labeled-view__status_error' ) ).to.be.true;
					expect( statusElement.getAttribute( 'role' ) ).to.equal( 'alert' );
					expect( statusElement.innerHTML ).to.equal( 'foo' );
				} );

				it( 'should react on labeledFieldView#infoText', () => {
					const statusElement = labeledFieldView.statusView.element;

					labeledFieldView.infoText = '';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.true;
					expect( statusElement.classList.contains( 'ck-labeled-view__status_error' ) ).to.be.false;
					expect( statusElement.hasAttribute( 'role' ) ).to.be.false;
					expect( statusElement.innerHTML ).to.equal( '' );

					labeledFieldView.infoText = 'foo';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.false;
					expect( statusElement.classList.contains( 'ck-labeled-view__status_error' ) ).to.be.false;
					expect( statusElement.hasAttribute( 'role' ) ).to.be.false;
					expect( statusElement.innerHTML ).to.equal( 'foo' );
				} );
			} );
		} );
	} );

	describe( 'binding', () => {
		it( 'should bind labeledFieldView#label to labeledFieldView.labelView#label', () => {
			labeledFieldView.label = 'Foo bar';

			expect( labeledFieldView.labelView.text ).to.equal( 'Foo bar' );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the #view in DOM', () => {
			const spy = sinon.spy( view, 'focus' );

			labeledFieldView.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
