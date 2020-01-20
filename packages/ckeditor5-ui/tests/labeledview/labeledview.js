/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import View from '../../src/view';
import LabeledView from '../../src/labeledview/labeledview';
import LabelView from '../../src/label/labelview';

describe( 'LabeledView', () => {
	const locale = {};

	let labeledView, view;

	beforeEach( () => {
		labeledView = new LabeledView( locale, ( labeledView, viewUid, statusUid ) => {
			view = new View( locale );
			view.setTemplate( { tag: 'div' } );
			view.focus = () => {};
			view.viewUid = viewUid;
			view.statusUid = statusUid;

			return view;
		} );

		labeledView.render();
	} );

	describe( 'constructor()', () => {
		it( 'should set labeledView#locale', () => {
			expect( labeledView.locale ).to.deep.equal( locale );
		} );

		it( 'should set labeledView#view', () => {
			expect( labeledView.view ).to.equal( view );
		} );

		it( 'should set labeledView#label', () => {
			expect( labeledView.label ).to.be.undefined;
		} );

		it( 'should set labeledView#isEnabled', () => {
			expect( labeledView.isEnabled ).to.be.true;
		} );

		it( 'should set labeledView#errorText', () => {
			expect( labeledView.errorText ).to.be.null;
		} );

		it( 'should set labeledView#infoText', () => {
			expect( labeledView.infoText ).to.be.null;
		} );

		it( 'should set labeledView#class', () => {
			expect( labeledView.class ).to.be.undefined;
		} );

		it( 'should create labeledView#labelView', () => {
			expect( labeledView.labelView ).to.instanceOf( LabelView );
		} );

		it( 'should create labeledView#statusView', () => {
			expect( labeledView.statusView ).to.instanceOf( View );

			expect( labeledView.statusView.element.tagName ).to.equal( 'DIV' );
			expect( labeledView.statusView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( labeledView.statusView.element.classList.contains( 'ck-labeled-view__status' ) ).to.be.true;
		} );

		it( 'should allow pairing #view and #labelView by unique id', () => {
			expect( labeledView.labelView.for ).to.equal( view.viewUid );
		} );

		it( 'should allow pairing #view and #statusView by unique id', () => {
			expect( view.statusUid ).to.equal( labeledView.statusView.element.id );
		} );
	} );

	describe( 'template', () => {
		it( 'should have the CSS class', () => {
			expect( labeledView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( labeledView.element.classList.contains( 'ck-labeled-view' ) ).to.be.true;
		} );

		it( 'should have #labeledView', () => {
			expect( labeledView.template.children[ 0 ] ).to.equal( labeledView.labelView );
		} );

		it( 'should have #view', () => {
			expect( labeledView.template.children[ 1 ] ).to.equal( view );
		} );

		it( 'should have the #statusView container', () => {
			expect( labeledView.template.children[ 2 ] ).to.equal( labeledView.statusView );
		} );

		describe( 'DOM bindings', () => {
			describe( 'class', () => {
				it( 'should react on labeledView#class', () => {
					labeledView.class = 'foo';
					expect( labeledView.element.classList.contains( 'foo' ) ).to.be.true;

					labeledView.class = 'bar';
					expect( labeledView.element.classList.contains( 'foo' ) ).to.be.false;
					expect( labeledView.element.classList.contains( 'bar' ) ).to.be.true;
				} );
			} );

			describe( 'status container', () => {
				it( 'should react on labeledView#errorText', () => {
					const statusElement = labeledView.statusView.element;

					labeledView.errorText = '';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.true;
					expect( statusElement.classList.contains( 'ck-labeled-view__status_error' ) ).to.be.false;
					expect( statusElement.hasAttribute( 'role' ) ).to.be.false;
					expect( statusElement.innerHTML ).to.equal( '' );

					labeledView.errorText = 'foo';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.false;
					expect( statusElement.classList.contains( 'ck-labeled-view__status_error' ) ).to.be.true;
					expect( statusElement.getAttribute( 'role' ) ).to.equal( 'alert' );
					expect( statusElement.innerHTML ).to.equal( 'foo' );
				} );

				it( 'should react on labeledView#infoText', () => {
					const statusElement = labeledView.statusView.element;

					labeledView.infoText = '';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.true;
					expect( statusElement.classList.contains( 'ck-labeled-view__status_error' ) ).to.be.false;
					expect( statusElement.hasAttribute( 'role' ) ).to.be.false;
					expect( statusElement.innerHTML ).to.equal( '' );

					labeledView.infoText = 'foo';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).to.be.false;
					expect( statusElement.classList.contains( 'ck-labeled-view__status_error' ) ).to.be.false;
					expect( statusElement.hasAttribute( 'role' ) ).to.be.false;
					expect( statusElement.innerHTML ).to.equal( 'foo' );
				} );
			} );
		} );
	} );

	describe( 'binding', () => {
		it( 'should bind labeledView#label to labeledView.labelView#label', () => {
			labeledView.label = 'Foo bar';

			expect( labeledView.labelView.text ).to.equal( 'Foo bar' );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the #view in DOM', () => {
			const spy = sinon.spy( view, 'focus' );

			labeledView.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
