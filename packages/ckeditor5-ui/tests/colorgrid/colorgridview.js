/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ColorGridView from './../../src/colorgrid/colorgridview.js';
import ColorTileView from '../../src/colorgrid/colortileview.js';

import ViewCollection from '../../src/viewcollection.js';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker.js';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'ColorGridView', () => {
	let locale, view;

	const colorDefinitions = [
		{
			color: '#000',
			label: 'Black',
			options: {
				hasBorder: false
			}
		},
		{
			color: 'rgb(255, 255, 255)',
			label: 'White',
			options: {
				hasBorder: true
			}
		},
		{
			color: 'red',
			label: 'Red',
			options: {
				hasBorder: false
			}
		}
	];

	beforeEach( () => {
		locale = { t() {} };
		view = new ColorGridView( locale, { colorDefinitions } );
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	testUtils.createSinonSandbox();

	describe( 'constructor()', () => {
		it( 'creates element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-color-grid' ) ).to.be.true;
		} );

		it( 'uses the options#columns to control the grid', () => {
			const view = new ColorGridView( locale, { columns: 3 } );
			view.render();

			// Note: Different browsers use different value optimization.
			expect( view.element.style.gridTemplateColumns ).to.be.oneOf( [ '1fr 1fr 1fr', 'repeat(3, 1fr)' ] );

			view.destroy();
		} );

		it( 'creates the view without provided color definitions', () => {
			const view = new ColorGridView( locale );
			view.render();

			expect( view.items ).to.have.length( 0 );

			view.destroy();
		} );

		it( 'creates view collection with children', () => {
			expect( view.items ).to.be.instanceOf( ViewCollection );
		} );

		it( 'creates focus tracker', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'creates keystroke handler', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'reacts to changes in #selectedColor by setting the item#isOn', () => {
			expect( view.items.map( item => item ).some( item => item.isOn ) ).to.be.false;

			view.selectedColor = 'red';

			expect( view.items.get( 2 ).isOn ).to.be.true;

			view.selectedColor = 'rgb(255, 255, 255)';

			expect( view.items.get( 1 ).isOn ).to.be.true;
			expect( view.items.get( 2 ).isOn ).to.be.false;
		} );

		it( 'should determine #isOn value when a ColorTileView is added', () => {
			view.selectedColor = 'gold';

			const tile = new ColorTileView();
			tile.set( {
				color: 'gold',
				label: 'Gold',
				options: {
					hasBorder: false
				}
			} );

			view.items.add( tile );

			expect( view.items.get( 3 ).isOn ).to.be.true;
		} );

		describe( 'add colors from definition as child items', () => {
			it( 'has proper number of elements', () => {
				expect( view.items.length ).to.equal( 3 );
			} );

			colorDefinitions.forEach( ( color, index ) => {
				describe( 'child items has proper attributes', () => {
					it( `for (index: ${ index }, color: ${ color.color }) child`, () => {
						const colorTile = view.items.get( index );

						expect( colorTile ).to.be.instanceOf( ColorTileView );
						expect( colorTile.color ).to.equal( color.color );
					} );
				} );
			} );
		} );
	} );

	describe( 'render()', () => {
		describe( 'Focus management across the grid items using arrow keys', () => {
			let view;

			beforeEach( () => {
				view = new ColorGridView( locale, { colorDefinitions, columns: 2 } );

				view.render();
				document.body.appendChild( view.element );
			} );

			afterEach( () => {
				view.element.remove();
				view.destroy();
			} );

			it( '"arrow right" should focus the next focusable grid item', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowright,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the first grid item is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.items.first.element;

				const spy = sinon.spy( view.items.get( 1 ), 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );

			it( '"arrow down" should focus the focusable grid item in the second row', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowdown,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the first grid item is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.items.first.element;

				const spy = sinon.spy( view.items.get( 2 ), 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = sinon.spy( view.focusTracker, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = sinon.spy( view.keystrokes, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );
	} );

	describe( 'execute()', () => {
		it( 'fires event for rendered tiles', () => {
			const spy = sinon.spy();
			const firstTile = view.items.first;

			view.on( 'execute', spy );

			firstTile.isEnabled = true;

			firstTile.element.dispatchEvent( new Event( 'click' ) );
			sinon.assert.callCount( spy, 1 );

			firstTile.isEnabled = false;

			firstTile.element.dispatchEvent( new Event( 'click' ) );
			sinon.assert.callCount( spy, 1 );
		} );
	} );

	describe( 'focus', () => {
		it( 'focuses the tile in DOM', () => {
			const spy = sinon.spy( view.items.first, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );

			view.items.clear();
			view.focus();

			expect( view.items.length ).to.equal( 0 );
			sinon.assert.calledOnce( spy );
		} );

		it( 'focuses last the tile in DOM', () => {
			const spy = sinon.spy( view.items.last, 'focus' );

			view.focusLast();

			sinon.assert.calledOnce( spy );

			view.items.clear();
			view.focusLast();

			expect( view.items.length ).to.equal( 0 );
			sinon.assert.calledOnce( spy );
		} );

		describe( 'update elements in focus tracker', () => {
			it( 'adding new element', () => {
				const spy = sinon.spy( view.focusTracker, 'add' );

				const colorTile = new ColorTileView();
				colorTile.set( {
					color: 'yellow',
					label: 'Yellow',
					tooltip: true,
					options: {
						hasBorder: false
					}
				} );
				view.items.add( colorTile );

				expect( view.items.length ).to.equal( 4 );
				sinon.assert.calledOnce( spy );
			} );

			it( 'removes element', () => {
				const spy = sinon.spy( view.focusTracker, 'remove' );

				view.items.remove( view.items.length - 1 );

				expect( view.items.length ).to.equal( 2 );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );
} );
