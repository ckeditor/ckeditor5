/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Bookmark from '../src/bookmark.js';
import BookmarkUI from '../src/bookmarkui.js';
import BookmarkEditing from '../src/bookmarkediting.js';

import { Widget } from '@ckeditor/ckeditor5-widget';

describe( 'Bookmark', () => {
	it( 'should be correctly named', () => {
		expect( Bookmark.pluginName ).to.equal( 'Bookmark' );
	} );

	it( 'should have proper "requires" value', () => {
		expect( Bookmark.requires ).to.deep.equal( [
			BookmarkEditing,
			BookmarkUI,
			Widget
		] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Bookmark.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Bookmark.isPremiumPlugin ).to.be.false;
	} );
} );
