/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Bookmark as BookmarkDLL } from '../src/index.js';
import Bookmark from '../src/bookmark.js';

describe( 'Bookmark DLL', () => {
	it( 'exports Bookmark', () => {
		expect( BookmarkDLL ).to.equal( Bookmark );
	} );
} );
