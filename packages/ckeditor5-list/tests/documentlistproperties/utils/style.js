/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { getListTypeFromListStyleType } from '../../../src/documentlistproperties/utils/style';

describe( 'DocumentListProperties - utils - style', () => {
	describe( 'getListTypeFromListStyleType()', () => {
		const testData = [
			[ 'decimal', 'numbered' ],
			[ 'decimal-leading-zero', 'numbered' ],
			[ 'lower-roman', 'numbered' ],
			[ 'upper-roman', 'numbered' ],
			[ 'lower-latin', 'numbered' ],
			[ 'upper-latin', 'numbered' ],
			[ 'disc', 'bulleted' ],
			[ 'circle', 'bulleted' ],
			[ 'square', 'bulleted' ],
			[ 'default', null ],
			[ 'style-type-that-is-not-possibly-supported-by-css', null ]
		];

		for ( const [ style, type ] of testData ) {
			it( `shoud return "${ type }" for "${ style }" style`, () => {
				expect( getListTypeFromListStyleType( style ) ).to.equal( type );
			} );
		}
	} );
} );
