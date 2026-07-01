/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';

import { Bookmark } from '../src/bookmark.js';
import { BookmarkUI } from '../src/bookmarkui.js';
import { BookmarkEditing } from '../src/bookmarkediting.js';

import { Widget } from '@ckeditor/ckeditor5-widget';

describe( 'Bookmark', () => {
	it( 'should be correctly named', () => {
		expect( Bookmark.pluginName ).toEqual( 'Bookmark' );
	} );

	it( 'should have proper "requires" value', () => {
		expect( Bookmark.requires ).toEqual( [
			BookmarkEditing,
			BookmarkUI,
			Widget
		] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Bookmark.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Bookmark.isPremiumPlugin ).toBe( false );
	} );
} );
