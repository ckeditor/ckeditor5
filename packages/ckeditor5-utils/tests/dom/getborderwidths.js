/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import getBorderWidths from '../../src/dom/getborderwidths.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'getBorderWidths()', () => {
	testUtils.createSinonSandbox();

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

		expect( getBorderWidths( elementMock ) ).to.deep.equal( {
			top: 10,
			right: 20,
			bottom: 30,
			left: 40
		} );
	} );
} );
