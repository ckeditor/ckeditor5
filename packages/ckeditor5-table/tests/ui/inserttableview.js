/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';

import InsertTableView from '../../src/ui/inserttableview';

describe( 'InsertTableView', () => {
	let view, locale;

	beforeEach( () => {
		locale = { t() {} };

		view = new InsertTableView( locale );
		view.render();

		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'sets view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'sets view#rows to 0', () => {
			expect( view.rows ).to.equal( 0 );
		} );

		it( 'sets view#columns to 0', () => {
			expect( view.columns ).to.equal( 0 );
		} );

		it( 'sets #label to default rows & columns', () => {
			expect( view.label ).to.equal( '0 × 0' );
		} );

		it( 'creates #element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.children ).to.have.length( 2 );
			expect( view.element.children[ 0 ].classList.contains( 'ck-insert-table-dropdown__grid' ) ).to.be.true;
			expect( view.element.children[ 1 ].classList.contains( 'ck-insert-table-dropdown__label' ) ).to.be.true;
		} );

		it( 'creates view#items collection', () => {
			expect( view.items ).to.be.instanceOf( ViewCollection );
			expect( view.items ).to.have.length( 100 );
		} );

		it( 'should not throw error for DropdownPanelFocusable interface methods', () => {
			expect( () => view.focus() ).to.not.throw();
			expect( () => view.focusLast() ).to.not.throw();
		} );

		describe( 'view#items bindings', () => {
			it( 'updates view#height & view#width on DOM "mouseover" event', () => {
				const boxView = view.items.get( 0 );

				expect( boxView.isOn ).to.be.false;

				boxView.element.dispatchEvent( new Event( 'mouseover', { bubbles: true } ) );

				expect( boxView.isOn ).to.be.true;

				expect( view.rows ).to.equal( 1 );
				expect( view.columns ).to.equal( 1 );

				const boxViewB = view.items.get( 22 );

				boxViewB.element.dispatchEvent( new Event( 'mouseover', { bubbles: true } ) );

				expect( view.rows ).to.equal( 3 );
				expect( view.columns ).to.equal( 3 );
			} );
		} );

		describe( 'bindings', () => {
			it( 'binds #label to rows & columns', () => {
				view.rows = 3;

				expect( view.label ).to.equal( '3 × 0' );

				view.columns = 7;

				expect( view.label ).to.equal( '3 × 7' );
			} );

			it( 'mousedown event should be prevented', () => {
				const ret = view.element.dispatchEvent( new Event( 'mousedown', { cancelable: true } ) );

				expect( ret ).to.false;
			} );

			describe( 'DOM', () => {
				it( 'fires execute on "click" event', () => {
					const spy = sinon.spy();

					view.on( 'execute', spy );

					dispatchEvent( view.element, 'click' );

					sinon.assert.calledOnce( spy );
				} );
			} );
		} );
	} );
} );

function dispatchEvent( el, domEvtName ) {
	if ( !el.parentNode ) {
		throw new Error( 'To dispatch an event, element must be in DOM. Otherwise #target is null.' );
	}

	el.dispatchEvent( new Event( domEvtName, {
		bubbles: true
	} ) );
}
