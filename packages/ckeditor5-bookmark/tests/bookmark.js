/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Bookmark from '../src/bookmark.js';
import BookmarkUI from '../src/bookmarkui.js';
import BookmarkEditing from '../src/bookmarkediting.js';

describe( 'Bookmark', () => {
	it( 'should be correctly named', () => {
		expect( Bookmark.pluginName ).to.equal( 'Bookmark' );
	} );

	it( 'should have proper "requires" value', () => {
		expect( Bookmark.requires ).to.deep.equal( [
			BookmarkEditing,
			BookmarkUI
		] );
	} );
} );
