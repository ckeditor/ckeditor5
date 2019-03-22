/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ColorGrid from './../../src/ui/colorgrid';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import ColorTile from '../../src/ui/colortile';

describe( 'ColorGrid', () => {
	const colorDefinition = [
		{
			color: '#000',
			label: 'Black',
			options: {
				hasBorder: false
			}
		}, {
			color: 'rgb(255, 255, 255)',
			label: 'White',
			options: {
				hasBorder: true
			}
		}, {
			color: 'red',
			label: 'Red',
			options: {
				hasBorder: false
			}
		}
	];

	let locale, colorGrid;
	beforeEach( () => {
		locale = { t() {} };
		colorGrid = new ColorGrid( locale, colorDefinition );
		colorGrid.render();
	} );

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
			colorDefinition.forEach( ( color, index ) => {
				describe( 'child items has proper attributes', () => {
					it( `for ${ index } child`, () => {
						const colorTile = colorGrid.items.get( index );
						expect( colorTile ).to.be.instanceOf( ColorTile );
						expect( colorTile.color ).to.equal( color.color );
					} );
				} );
			} );
		} );
	} );
} );
