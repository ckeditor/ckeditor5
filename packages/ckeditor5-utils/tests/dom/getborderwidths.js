/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import global from '../../src/dom/global';
import getBorderWidths from '../../src/dom/getborderwidths';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'getBorderWidths()', () => {
	it( 'returns CSS border widths', () => {
		testUtils.sinon.stub( global.window, 'getComputedStyle' ).returns( {
			borderTopWidth: '10px',
			borderRightWidth: '20px',
			borderBottomWidth: '30px',
			borderLeftWidth: '40px'
		} );

		const elementMock = {};

		expect( getBorderWidths( elementMock ) ).to.deep.equal( {
			top: 10,
			right: 20,
			bottom: 30,
			left: 40
		} );
	} );
} );
