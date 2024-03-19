/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import sanitizeHtml from '../src/sanitizeHtml.js';

describe( 'sanitizeHtml', () => {
	it( 'should escape HTML string tags', () => {
		const src = '<img src=x onerror="alert(\'Attack\')">';
		const dest = '&lt;img src=x onerror="alert(\'Attack\')"&gt;';

		expect( sanitizeHtml( src ) ).to.equal( dest );
	} );
} );
