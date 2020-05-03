/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ColorTileView from '../../src/colorgrid/colortileview';
import ButtonView from '../../src/button/buttonview';
import checkIcon from '../../theme/icons/color-tile-check.svg';

describe( 'ColorTileView', () => {
	it( 'inherits from ButtonView', () => {
		expect( new ColorTileView() ).to.be.instanceOf( ButtonView );
	} );

	it( 'has proper attributes and classes', () => {
		const colorTile = new ColorTileView();
		colorTile.render();

		expect( colorTile.color ).to.be.undefined;
		expect( colorTile.hasBorder ).to.be.undefined;

		colorTile.set( 'color', 'green' );
		expect( colorTile.color ).to.equal( 'green' );
		expect( colorTile.element.style.backgroundColor ).to.equal( 'green' );
		expect( colorTile.element.classList.contains( 'ck-color-grid__tile' ) ).to.be.true;
		expect( colorTile.element.classList.contains( 'ck-color-table__color-tile_bordered' ) ).to.be.false;

		colorTile.set( 'hasBorder', true );
		expect( colorTile.element.classList.contains( 'ck-color-table__color-tile_bordered' ) ).to.be.true;
	} );

	it( 'has a check icon', () => {
		const colorTile = new ColorTileView();
		colorTile.render();

		expect( colorTile.icon ).to.equal( checkIcon );
		expect( colorTile.iconView.fillColor ).to.equal( 'hsl(0, 0%, 100%)' );
	} );
} );
