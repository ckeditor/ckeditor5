/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconColorTileCheck } from '@ckeditor/ckeditor5-icons';
import ColorTileView from '../../src/colorgrid/colortileview.js';
import ButtonView from '../../src/button/buttonview.js';
import { env } from '@ckeditor/ckeditor5-utils';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'ColorTileView', () => {
	let colorTile;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		colorTile = new ColorTileView();
	} );

	afterEach( () => {
		colorTile.destroy();
	} );

	it( 'inherits from ButtonView', () => {
		expect( colorTile ).to.be.instanceOf( ButtonView );
	} );

	it( 'has proper attributes and classes', () => {
		colorTile.render();

		expect( colorTile.color ).to.be.undefined;
		expect( colorTile.hasBorder ).to.be.false;

		colorTile.set( 'color', 'green' );
		expect( colorTile.color ).to.equal( 'green' );
		expect( colorTile.element.style.backgroundColor ).to.equal( 'green' );
		expect( colorTile.element.classList.contains( 'ck-color-grid__tile' ) ).to.be.true;
		expect( colorTile.element.classList.contains( 'ck-color-selector__color-tile_bordered' ) ).to.be.false;

		colorTile.set( 'hasBorder', true );
		expect( colorTile.element.classList.contains( 'ck-color-selector__color-tile_bordered' ) ).to.be.true;
	} );

	// https://github.com/ckeditor/ckeditor5/issues/14907
	it( 'should not set the background-color in the forced-colors mode for a better UX (displaying a label instead)', () => {
		testUtils.sinon.stub( env, 'isMediaForcedColors' ).value( true );

		colorTile.render();

		expect( colorTile.element.style.backgroundColor ).to.equal( '' );
	} );

	it( 'has a check icon', () => {
		colorTile.render();

		expect( colorTile.icon ).to.equal( IconColorTileCheck );
		expect( colorTile.iconView.fillColor ).to.equal( 'hsl(0, 0%, 100%)' );
	} );
} );
