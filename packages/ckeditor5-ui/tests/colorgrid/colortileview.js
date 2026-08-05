/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IconColorTileCheck } from '@ckeditor/ckeditor5-icons';
import { ColorTileView } from '../../src/colorgrid/colortileview.js';
import { ButtonView } from '../../src/button/buttonview.js';
import { env } from '@ckeditor/ckeditor5-utils';

describe( 'ColorTileView', () => {
	let colorTile;

	beforeEach( () => {
		colorTile = new ColorTileView();
	} );

	afterEach( () => {
		colorTile.destroy();
	} );

	it( 'inherits from ButtonView', () => {
		expect( colorTile ).toBeInstanceOf( ButtonView );
	} );

	it( 'has proper attributes and classes', () => {
		colorTile.render();

		expect( colorTile.color ).toBeUndefined();
		expect( colorTile.hasBorder ).toBe( false );

		colorTile.set( 'color', 'green' );
		expect( colorTile.color ).toBe( 'green' );
		expect( colorTile.element.style.backgroundColor ).toBe( 'green' );
		expect( colorTile.element.classList.contains( 'ck-color-grid__tile' ) ).toBe( true );
		expect( colorTile.element.classList.contains( 'ck-color-selector__color-tile_bordered' ) ).toBe( false );

		colorTile.set( 'hasBorder', true );
		expect( colorTile.element.classList.contains( 'ck-color-selector__color-tile_bordered' ) ).toBe( true );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/14907
	it( 'should not set the background-color in the forced-colors mode for a better UX (displaying a label instead)', () => {
		vi.spyOn( env, 'isMediaForcedColors', 'get' ).mockReturnValue( true );

		colorTile.render();

		expect( colorTile.element.style.backgroundColor ).toBe( '' );
	} );

	it( 'has a check icon', () => {
		colorTile.render();

		expect( colorTile.icon ).toBe( IconColorTileCheck );
		expect( colorTile.iconView.fillColor ).toBe( 'hsl(0, 0%, 100%)' );
	} );
} );
