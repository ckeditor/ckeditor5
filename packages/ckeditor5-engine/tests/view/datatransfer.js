/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewDataTransfer } from '../../src/view/datatransfer.js';

describe( 'DataTransfer', () => {
	describe( 'constructor', () => {
		it( 'should create files from the native files', () => {
			const dt = new ViewDataTransfer( {
				files: {
					0: 'file1',
					1: 'file2',
					length: 2
				}
			} );

			expect( dt.files ).to.deep.equal( [ 'file1', 'file2' ] );
		} );

		it( 'should create files from the native items', () => {
			const dt = new ViewDataTransfer( {
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

		it( 'should evaluate files property exactly once', () => {
			const nativeDataTransfer = {
				get files() {
					return {
						0: 'file1',
						length: 1
					};
				}
			};

			const spy = sinon.spy( nativeDataTransfer, 'files', [ 'get' ] );

			const dt = new ViewDataTransfer( nativeDataTransfer );

			expect( dt.files ).to.deep.equal( [ 'file1' ] );
			expect( dt.files ).to.deep.equal( [ 'file1' ] );

			expect( spy.get.calledOnce ).to.be.true;
		} );

		it( 'should evaluate items property exactly once', () => {
			const nativeDataTransfer = {
				get items() {
					return {
						0: { kind: 'file', getAsFile: () => 'file1' },
						length: 1
					};
				}
			};

			const spy = sinon.spy( nativeDataTransfer, 'items', [ 'get' ] );

			const dt = new ViewDataTransfer( nativeDataTransfer );

			expect( dt.files ).to.deep.equal( [ 'file1' ] );
			expect( dt.files ).to.deep.equal( [ 'file1' ] );

			expect( spy.get.calledOnce ).to.be.true;
		} );

		it( 'should cache files if cacheFiles option is set', () => {
			const nativeDataTransfer = {
				get files() {
					return {
						0: 'file1',
						length: 1
					};
				}
			};

			const spy = sinon.spy( nativeDataTransfer, 'files', [ 'get' ] );

			const dt = new ViewDataTransfer( nativeDataTransfer, { cacheFiles: true } );

			expect( spy.get.calledOnce ).to.be.true;
			expect( dt._files ).to.deep.equal( [ 'file1' ] );

			// Access getter.
			expect( dt.files ).to.deep.equal( [ 'file1' ] );

			expect( spy.get.calledOnce ).to.be.true;
		} );

		it( 'should not cache files if cacheFiles option is not set', () => {
			const nativeDataTransfer = {
				get files() {
					return {
						0: 'file1',
						length: 1
					};
				}
			};

			const spy = sinon.spy( nativeDataTransfer, 'files', [ 'get' ] );

			const dt = new ViewDataTransfer( nativeDataTransfer );

			expect( spy.get.calledOnce ).to.be.false;
			expect( dt._files ).to.be.null;

			// Access getter.
			expect( dt.files ).to.deep.equal( [ 'file1' ] );

			expect( spy.get.calledOnce ).to.be.true;
		} );

		it( 'should cache files (from items) if cacheFiles option is set', () => {
			const nativeDataTransfer = {
				get items() {
					return {
						0: { kind: 'file', getAsFile: () => 'file1' },
						length: 1
					};
				}
			};

			const spy = sinon.spy( nativeDataTransfer, 'items', [ 'get' ] );

			const dt = new ViewDataTransfer( nativeDataTransfer, { cacheFiles: true } );

			expect( spy.get.calledOnce ).to.be.true;
			expect( dt._files ).to.deep.equal( [ 'file1' ] );

			// Access getter.
			expect( dt.files ).to.deep.equal( [ 'file1' ] );

			expect( spy.get.calledOnce ).to.be.true;
		} );

		it( 'should not cache files (from items) if cacheFiles option is not set', () => {
			const nativeDataTransfer = {
				get items() {
					return {
						0: { kind: 'file', getAsFile: () => 'file1' },
						length: 1
					};
				}
			};

			const spy = sinon.spy( nativeDataTransfer, 'items', [ 'get' ] );

			const dt = new ViewDataTransfer( nativeDataTransfer );

			expect( spy.get.calledOnce ).to.be.false;
			expect( dt._files ).to.be.null;

			// Access getter.
			expect( dt.files ).to.deep.equal( [ 'file1' ] );

			expect( spy.get.calledOnce ).to.be.true;
		} );
	} );

	describe( 'getData()', () => {
		it( 'should return data from the native data transfer', () => {
			const dt = new ViewDataTransfer( {
				getData( type ) {
					return 'foo:' + type;
				}
			} );

			expect( dt.getData( 'x/y' ) ).to.equal( 'foo:x/y' );
		} );
	} );

	describe( 'setData()', () => {
		it( 'should set data in the native data transfer', () => {
			const spy = sinon.spy();
			const dt = new ViewDataTransfer( {
				setData: spy
			} );

			dt.setData( 'text/html', 'bar' );

			expect( spy.calledWithExactly( 'text/html', 'bar' ) ).to.be.true;
		} );
	} );

	describe( 'types', () => {
		it( 'should return available types', () => {
			const dt = new ViewDataTransfer( {
				types: [ 'text/html', 'text/plain' ]
			} );

			expect( dt.types ).to.deep.equal( [ 'text/html', 'text/plain' ] );
		} );
	} );

	describe( '#effectAllowed', () => {
		it( 'should return value from the native data transfer', () => {
			const dt = new ViewDataTransfer( {
				effectAllowed: 'foo'
			} );

			expect( dt.effectAllowed ).to.equal( 'foo' );
		} );

		it( 'should set value in the native data transfer', () => {
			const spy = sinon.spy();
			const dt = new ViewDataTransfer( {
				set effectAllowed( value ) {
					spy( value );
				}
			} );

			dt.effectAllowed = 'bar';

			expect( spy.calledWithExactly( 'bar' ) ).to.be.true;
		} );
	} );

	describe( '#dropEffect', () => {
		it( 'should return value from the native data transfer', () => {
			const dt = new ViewDataTransfer( {
				dropEffect: 'foo'
			} );

			expect( dt.dropEffect ).to.equal( 'foo' );
		} );

		it( 'should set value in the native data transfer', () => {
			const spy = sinon.spy();
			const dt = new ViewDataTransfer( {
				set dropEffect( value ) {
					spy( value );
				}
			} );

			dt.dropEffect = 'bar';

			expect( spy.calledWithExactly( 'bar' ) ).to.be.true;
		} );
	} );

	describe( '#setDragImage()', () => {
		it( 'should call the native data transfer', () => {
			const spy = sinon.spy();
			const dt = new ViewDataTransfer( {
				setDragImage( element, x, y ) {
					spy( element, x, y );
				}
			} );

			dt.setDragImage( 'foo', 123, 789 );

			expect( spy.calledWithExactly( 'foo', 123, 789 ) ).to.be.true;
		} );
	} );

	describe( '#isCanceled', () => {
		it( 'should return true if native data transfer dropEffect is equal "none" and mozUserCancelled is not set', () => {
			const dt = new ViewDataTransfer( {
				dropEffect: 'none',
				mozUserCancelled: false
			} );

			expect( dt.isCanceled ).to.be.true;
		} );

		it( 'should return true if native data transfer dropEffect is equal "none" and mozUserCancelled is set', () => {
			const dt = new ViewDataTransfer( {
				dropEffect: 'none',
				mozUserCancelled: true
			} );

			expect( dt.isCanceled ).to.be.true;
		} );

		it( 'should return false if native data transfer dropEffect is equal "move" and mozUserCancelled is not set', () => {
			const dt = new ViewDataTransfer( {
				dropEffect: 'move',
				mozUserCancelled: false
			} );

			expect( dt.isCanceled ).to.be.false;
		} );

		it( 'should return false if native data transfer dropEffect is equal "move" and mozUserCancelled is set', () => {
			const dt = new ViewDataTransfer( {
				dropEffect: 'move',
				mozUserCancelled: true
			} );

			expect( dt.isCanceled ).to.be.true;
		} );
	} );
} );
