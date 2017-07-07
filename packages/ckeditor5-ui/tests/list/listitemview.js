/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global Event */

import ListItemView from '../../src/list/listitemview';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

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

		it( 'should create #keystrokes instance', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );
	} );

	describe( 'init()', () => {
		it( 'starts listening for #keystrokes coming from #element', () => {
			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.init();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );
		} );

		// https://github.com/ckeditor/ckeditor5-ui/issues/153
		it( 'triggers view#execute event when Enter or Space key is pressed', () => {
			const spy = sinon.spy();
			const evtData = {
				keyCode: 10,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			view.on( 'execute', spy );
			view.keystrokes.press( evtData );

			sinon.assert.notCalled( spy );
			sinon.assert.notCalled( evtData.preventDefault );

			evtData.keyCode = 13;
			view.keystrokes.press( evtData );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledOnce( evtData.preventDefault );

			evtData.keyCode = 32;
			view.keystrokes.press( evtData );

			sinon.assert.calledTwice( spy );
			sinon.assert.calledTwice( evtData.preventDefault );
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
