/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import View from '../../src/view';
import ViewCollection from '../../src/viewcollection';
import FormHeaderView from '../../src/formheader/formheaderview';

describe( 'FormHeaderView', () => {
	let view, locale;

	beforeEach( () => {
		locale = { t: val => val };
		view = new FormHeaderView( locale );
		view.render();
	} );

	afterEach( () => {
		if ( view.element ) {
			view.element.remove();
		}
	} );

	describe( 'constructor()', () => {
		it( 'should set view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'should create view#children collection', () => {
			expect( view.children ).to.be.instanceOf( ViewCollection );
			expect( view.children ).to.have.length( 0 );
		} );

		it( 'should contain label view only when view#label is defined', () => {
			view = new FormHeaderView( locale, {
				label: 'Foo label'
			} );

			view.render();

			expect( view.children ).to.be.instanceOf( ViewCollection );
			expect( view.children ).to.have.length( 1 );

			expect( view.children.first.element.classList.contains( 'ck-form__header__label' ) ).to.be.true;

			view.label = '';

			expect( view.children ).to.have.length( 0 );
		} );

		it( 'should set view#label', () => {
			expect( view.label ).to.equal( '' );
		} );

		it( 'should set view#class', () => {
			expect( view.class ).to.be.null;
		} );

		it( 'should set the template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-form__header' ) ).to.be.true;
		} );

		describe( 'options', () => {
			it( 'should set view#class when class was passed', () => {
				const view = new FormHeaderView( locale, {
					class: 'foo'
				} );

				expect( view.class ).to.equal( 'foo' );

				view.destroy();
			} );

			it( 'should use a label text when passed', () => {
				const view = new FormHeaderView( locale, {
					label: 'foo'
				} );

				view.render();

				expect( view.element.firstChild.classList.contains( 'ck' ) ).to.be.true;
				expect( view.element.firstChild.classList.contains( 'ck-form__header__label' ) ).to.be.true;
				expect( view.element.firstChild.textContent ).to.equal( 'foo' );

				view.destroy();
			} );
		} );

		describe( 'template bindings', () => {
			it( 'should bind #class to the template', () => {
				view.class = 'foo';
				expect( view.element.classList.contains( 'foo' ) ).to.be.true;
			} );

			it( 'should bind #label to the template', () => {
				view.label = 'bar';
				expect( view.element.firstChild.textContent ).to.equal( 'bar' );

				view.label = 'baz';
				expect( view.element.firstChild.textContent ).to.equal( 'baz' );
			} );

			it( 'should bind #children to the template', () => {
				const child = new View();
				child.setTemplate( { tag: 'div' } );

				view.children.add( child );

				expect( view.element.childNodes[ 0 ] ).to.equal( child.element );

				view.destroy();
			} );
		} );
	} );
} );
