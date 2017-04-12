/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DataTransfer from '../src/datatransfer';

describe( 'DataTransfer', () => {
	describe( 'constructor', () => {
		it( 'should create files from the native files', () => {
			const dt = new DataTransfer( {
				files: {
					0: 'file1',
					1: 'file2',
					length: 2
				}
			} );

			expect( dt.files ).to.deep.equal( [ 'file1', 'file2' ] );
		} );

		it( 'should create files from the native items', () => {
			const dt = new DataTransfer( {
				items: {
					0: { kind: 'file', getAsFile: () => 'file1' },
					1: { kind: 'file', getAsFile: () => 'file2' },
					2: { kind: 'someOtherKind' },
					length: 3
				},
				files: []
			} );

			expect( dt.files ).to.deep.equal( [ 'file1', 'file2' ] );
		} );
	} );
	describe( 'getData()', () => {
		it( 'should return data from the native data transfer', () => {
			const dt = new DataTransfer( {
				getData( type ) {
					return 'foo:' + type;
				}
			} );

			expect( dt.getData( 'x/y' ) ).to.equal( 'foo:x/y' );
		} );
	} );

	describe( 'setData()', () => {
		it( 'should return set data in the native data transfer', () => {
			const spy = sinon.spy();
			const dt = new DataTransfer( {
				setData: spy
			} );

			dt.setData( 'text/html', 'bar' );

			expect( spy.calledWithExactly( 'text/html', 'bar' ) ).to.be.true;
		} );
	} );

	describe( 'types', () => {
		it( 'should return available types', () => {
			const dt = new DataTransfer( {
				types: [ 'text/html', 'text/plain' ]
			} );

			expect( dt.types ).to.deep.equal( [ 'text/html', 'text/plain' ] );
		} );
	} );
} );
