/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { getBorderWidths } from '../../src/dom/getborderwidths.js';

describe( 'getBorderWidths()', () => {
	it( 'returns CSS border widths', () => {
		const elementMock = {
			ownerDocument: {
				defaultView: {
					getComputedStyle: () => {
						return {
							borderTopWidth: '10px',
							borderRightWidth: '20px',
							borderBottomWidth: '30px',
							borderLeftWidth: '40px'
						};
					}
				}
			}
		};

		expect( getBorderWidths( elementMock ) ).toEqual( {
			top: 10,
			right: 20,
			bottom: 30,
			left: 40
		} );
	} );
} );
