/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewCollection, ButtonView } from '@ckeditor/ckeditor5-ui';
import InsertTableView from '../../src/ui/inserttableview.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils';

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
		view.destroy();
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

		describe( 'view#items collection', () => {
			it( 'should be created', () => {
				expect( view.items ).to.be.instanceOf( ViewCollection );
				expect( view.items ).to.have.length( 100 );
			} );

			it( 'should create items from template', () => {
				expect( Array.from( view.items ).every(
					item => item.element.classList.contains( 'ck' )
				), 'ck class' ).to.be.true;

				expect( Array.from( view.items ).every(
					item => item.element.classList.contains( 'ck-insert-table-dropdown-grid-box' )
				), 'grid box class' ).to.be.true;

				expect( Array.from( view.items ).every(
					item => item.element.getAttribute( 'tabindex' ) === '-1'
				), 'tabindex' ).to.be.true;

				expect( Array.from( view.items ).every(
					item => 'row' in item.element.dataset
				), 'row data attribute' ).to.be.true;

				expect( Array.from( view.items ).every(
					item => 'column' in item.element.dataset
				), 'column data attribute' ).to.be.true;
			} );

			it( 'every item should be the #ButtonView instance', () => {
				expect( Array.from( view.items ).every(
					item => item instanceof ButtonView
				), '#ButtonView instance' ).to.be.true;

				expect( Array.from( view.items ).every(
					item => item.withText === false
				), '#ButtonView withText' ).to.be.true;

				expect( Array.from( view.items ).every(
					( item, index ) => {
						const row = Math.ceil( ( index + 1 ) / 10 );
						const col = ( index % 10 ) + 1;
						const labelToCompare = `${ row } × ${ col }`;

						return item.label === labelToCompare;
					}
				), '#ButtonView correct label' ).to.be.true;
			} );
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

			describe( 'focus', () => {
				it( 'should not update #columns and #rows when the focus is moved out of view', () => {
					view.focusTracker.focusedElement = view.items.first.element;

					expect( view.columns ).to.equal( 1 );
					expect( view.rows ).to.equal( 1 );

					view.focusTracker.focusedElement = null;

					expect( view.columns ).to.equal( 1 );
					expect( view.rows ).to.equal( 1 );
				} );

				it( 'should update #columns and #rows (focus the first tile) when the focus is moved to the view', () => {
					view.focusTracker.focusedElement = null;

					view.focusTracker.focusedElement = view.items.first.element;

					expect( view.columns ).to.equal( 1 );
					expect( view.rows ).to.equal( 1 );

					view.focusTracker.focusedElement = view.items.get( 24 ).element;

					expect( view.columns ).to.equal( 5 );
					expect( view.rows ).to.equal( 3 );
				} );
			} );
		} );
	} );

	describe( 'render()', () => {
		describe( 'keyboard navigation in the insert table grid', () => {
			it( '"arrow right" should focus the next focusable tile', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowright,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				view.focusTracker.focusedElement = view.items.first.element;

				const spy = sinon.spy( view.items.get( 1 ), 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );

			it( '"arrow down" should focus the focusable tile in the second row', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowdown,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				view.focusTracker.focusedElement = view.items.first.element;

				const spy = sinon.spy( view.items.get( 10 ), 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'reset()', () => {
		it( 'should set rows and columns properties to 1', () => {
			view.focusTracker.focusedElement = view.items.get( 24 ).element;

			expect( view.columns ).to.equal( 5 );
			expect( view.rows ).to.equal( 3 );

			view.reset();

			expect( view.columns ).to.equal( 1 );
			expect( view.rows ).to.equal( 1 );
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
