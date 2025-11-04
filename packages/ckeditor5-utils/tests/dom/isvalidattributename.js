/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { isValidAttributeName } from '../../src/dom/isvalidattributename.js';

describe( 'isValidAttributeName', () => {
	const validTestCases = [
		'src',
		'data-foo',
		'href',
		'class',
		'style',
		'id',
		'name',
		undefined
		// Uncomment below tests when every major browser (Chrome, Firefox, Safari) will support creating attributes with those values.
		// Details here: https://github.com/whatwg/dom/pull/1079.
		// '200',
		// '<',
		// '"',
		// "'",
		// '`',
		// 200,
		// '🙂'
	];

	for ( const name of validTestCases ) {
		it( `should return true for '${ name }'`, () => {
			expect( isValidAttributeName( name ) ).to.be.true;
		} );
	}

	const invalidTestCases = [
		'',
		'space ',
		'space inside',
		'newline\n',
		'null\0',
		'>',
		'/',
		'='
	];

	for ( const name of invalidTestCases ) {
		it( `should return false for '${ name }'`, () => {
			expect( isValidAttributeName( name ) ).to.be.false;
		} );
	}
} );
