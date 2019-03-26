/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals Event */

import ColorGrid from './../../src/ui/colorgrid';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import ColorTile from '../../src/ui/colortile';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'ColorGrid', () => {
	let locale, colorGrid;

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
		colorGrid = new ColorGrid( locale, { colorDefinitions } );
		colorGrid.render();
	} );

	testUtils.createSinonSandbox();

	describe( 'constructor()', () => {
		it( 'creates view collection with children', () => {
			expect( colorGrid.items ).to.be.instanceOf( ViewCollection );
		} );

		it( 'creates focus tracker', () => {
			expect( colorGrid.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'creates keystroke handler', () => {
			expect( colorGrid.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'creates focus cycler', () => {
			expect( colorGrid._focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		describe( 'add colors from definition as child items', () => {
			it( 'has proper number of elements', () => {
				expect( colorGrid.items.length ).to.equal( 3 );
			} );
			colorDefinitions.forEach( ( color, index ) => {
				describe( 'child items has proper attributes', () => {
					it( `for (index: ${ index }, color: ${ color.color }) child`, () => {
						const colorTile = colorGrid.items.get( index );
						expect( colorTile ).to.be.instanceOf( ColorTile );
						expect( colorTile.color ).to.equal( color.color );
					} );
				} );
			} );
		} );
	} );

	describe( 'execute()', () => {
		it( 'fires event for rendered tiles', () => {
			const spy = sinon.spy();
			const firstTile = colorGrid.items.first;

			colorGrid.on( 'execute', spy );

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
			const spy = sinon.spy( colorGrid.items.first, 'focus' );

			colorGrid.focus();

			sinon.assert.calledOnce( spy );

			colorGrid.items.clear();
			colorGrid.focus();

			expect( colorGrid.items.length ).to.equal( 0 );
			sinon.assert.calledOnce( spy );
		} );

		it( 'focuses last the tile in DOM', () => {
			const spy = sinon.spy( colorGrid.items.last, 'focus' );

			colorGrid.focusLast();

			sinon.assert.calledOnce( spy );

			colorGrid.items.clear();
			colorGrid.focusLast();

			expect( colorGrid.items.length ).to.equal( 0 );
			sinon.assert.calledOnce( spy );
		} );

		describe( 'update elements in focus tracker', () => {
			it( 'adding new element', () => {
				const spy = sinon.spy( colorGrid.focusTracker, 'add' );

				const colorTile = new ColorTile();
				colorTile.set( {
					color: 'yellow',
					label: 'Yellow',
					tooltip: true,
					options: {
						hasBorder: false
					}
				} );
				colorGrid.items.add( colorTile );

				expect( colorGrid.items.length ).to.equal( 4 );
				sinon.assert.calledOnce( spy );
			} );

			it( 'removes element', () => {
				const spy = sinon.spy( colorGrid.focusTracker, 'remove' );

				colorGrid.items.remove( colorGrid.items.length - 1 );

				expect( colorGrid.items.length ).to.equal( 2 );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );
} );
