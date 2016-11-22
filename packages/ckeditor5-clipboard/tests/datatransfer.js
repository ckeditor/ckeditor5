/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DataTransfer from 'ckeditor5/clipboard/datatransfer.js';

describe( 'DataTransfer', () => {
	describe( 'getData', () => {
		it( 'should return data from the native data transfer', () => {
			const dt = new DataTransfer( {
				getData( type ) {
					return 'foo:' + type;
				}
			} );

			expect( dt.getData( 'x/y' ) ).to.equal( 'foo:x/y' );
		} );
	} );

	describe( 'setData', () => {
		it( 'should return set data in the native data transfer', () => {
			const spy = sinon.spy();
			const dt = new DataTransfer( {
				setData: spy
			} );

			dt.setData( 'text/html', 'bar' );

			expect( spy.calledWithExactly( 'text/html', 'bar' ) ).to.be.true;
		} );
	} );
} );
