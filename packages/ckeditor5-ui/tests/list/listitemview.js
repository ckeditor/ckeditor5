/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals Event */

import ListItemView from '../../src/list/listitemview';

describe( 'ListItemView', () => {
	let view;

	beforeEach( () => {
		view = new ListItemView();
		view.set( {
			style: 'foo',
			label: 'bar'
		} );

		return view.init();
	} );

	describe( 'constructor()', () => {
		it( 'creates element from template', () => {
			expect( view.element.classList.contains( 'ck-list__item' ) ).to.be.true;
		} );
	} );

	describe( 'DOM bindings', () => {
		describe( '"class" attribute', () => {
			it( 'reacts on view#class', () => {
				expect( view.element.classList ).to.have.length( 1 );

				view.set( 'class', 'foo' );

				expect( view.element.classList.contains( 'foo' ) ).to.be.true;
			} );

			it( 'reacts on view#isActive', () => {
				expect( view.element.classList ).to.have.length( 1 );

				view.set( 'isActive', true );

				expect( view.element.classList.contains( 'ck-list__item_active' ) ).to.be.true;
			} );
		} );

		describe( '"style" attribute', () => {
			it( 'reacts on view#style', () => {
				expect( view.element.attributes.getNamedItem( 'style' ).value ).to.equal( 'foo' );

				view.style = 'color: red';

				expect( view.element.attributes.getNamedItem( 'style' ).value ).to.equal( 'color: red' );
			} );
		} );

		describe( 'text content', () => {
			it( 'reacts on view#label', () => {
				expect( view.element.innerHTML ).to.equal( 'bar' );

				view.label = 'baz';

				expect( view.element.innerHTML ).to.equal( 'baz' );
			} );
		} );

		describe( 'tabindex', () => {
			it( 'is initially set ', () => {
				expect( view.element.attributes.tabindex.value ).to.equal( '-1' );
			} );

			it( 'reacts on view#tabindex', () => {
				view.tabindex = 3;

				expect( view.element.attributes.tabindex.value ).to.equal( '3' );
			} );
		} );

		describe( 'view#execute event', () => {
			it( 'triggers view#execute event when "click" is fired in DOM', () => {
				const spy = sinon.spy();

				view.on( 'execute', spy );

				view.element.dispatchEvent( new Event( 'click' ) );
				expect( spy.calledOnce ).to.be.true;
			} );

			// https://github.com/ckeditor/ckeditor5-ui/issues/153
			it( 'triggers view#execute event when Enter or Space key is pressed', () => {
				const spy = sinon.spy();
				const evt = new Event( 'keydown' );

				view.on( 'execute', spy );

				evt.keyCode = 10;
				view.element.dispatchEvent( evt );
				expect( spy.calledOnce ).to.be.false;

				evt.keyCode = 13;
				view.element.dispatchEvent( evt );
				expect( spy.calledOnce ).to.be.true;

				evt.keyCode = 32;
				view.element.dispatchEvent( evt );
				expect( spy.calledTwice ).to.be.true;
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the item in DOM', () => {
			const spy = sinon.spy( view.element, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
