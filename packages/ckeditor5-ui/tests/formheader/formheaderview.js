/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconCheck } from '@ckeditor/ckeditor5-icons';
import View from '../../src/view.js';
import ViewCollection from '../../src/viewcollection.js';
import FormHeaderView from '../../src/formheader/formheaderview.js';
import { IconView } from '../../src/index.js';

describe( 'FormHeaderView', () => {
	let view, locale;

	beforeEach( () => {
		locale = { t: val => val };
		view = new FormHeaderView( locale );
		view.render();
	} );

	afterEach( () => {
		view.element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'should set view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'should create view#children collection', () => {
			expect( view.children ).to.be.instanceOf( ViewCollection );
			expect( view.children ).to.have.length( 1 );
		} );

		it( 'should set view#label', () => {
			expect( view.label ).to.equal( '' );
		} );

		it( 'should set view#class', () => {
			expect( view.class ).to.be.null;
		} );

		it( 'should set the template', () => {
			expect( view.template.attributes.class ).to.include( 'ck' );
			expect( view.template.attributes.class ).to.include( 'ck-form__header' );
		} );

		it( 'should set view#tag', () => {
			expect( view.children.first.template.tag ).to.equal( 'h2' );
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
				expect( view.element.firstChild.role ).to.equal( 'presentation' );
				expect( view.element.firstChild.textContent ).to.equal( 'foo' );

				view.destroy();
			} );

			it( 'should allow passing an icon', () => {
				const view = new FormHeaderView( locale, {
					label: 'foo',
					icon: IconCheck
				} );

				view.render();

				expect( view.element.lastChild.classList.contains( 'ck' ) ).to.be.true;
				expect( view.element.lastChild.classList.contains( 'ck-form__header__label' ) ).to.be.true;
				expect( view.element.lastChild.textContent ).to.equal( 'foo' );

				expect( view.element.firstChild.classList.contains( 'ck' ) ).to.be.true;
				expect( view.element.firstChild.classList.contains( 'ck-icon' ) ).to.be.true;

				expect( view.iconView ).to.be.instanceOf( IconView );
				expect( view.iconView.content ).to.equal( IconCheck );
				expect( view.iconView.element ).to.equal( view.element.firstChild );

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

				expect( view.element.childNodes[ 1 ] ).to.equal( child.element );

				view.destroy();
			} );
		} );
	} );
} );
