/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi } from 'vitest';
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

			expect( dt.files ).toEqual( [ 'file1', 'file2' ] );
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

			expect( dt.files ).toEqual( [ 'file1', 'file2' ] );
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

			const spy = vi.spyOn( nativeDataTransfer, 'files', 'get' );

			const dt = new ViewDataTransfer( nativeDataTransfer );

			expect( dt.files ).toEqual( [ 'file1' ] );
			expect( dt.files ).toEqual( [ 'file1' ] );

			expect( spy.mock.calls.length === 1 ).toBe( true );
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

			const spy = vi.spyOn( nativeDataTransfer, 'items', 'get' );

			const dt = new ViewDataTransfer( nativeDataTransfer );

			expect( dt.files ).toEqual( [ 'file1' ] );
			expect( dt.files ).toEqual( [ 'file1' ] );

			expect( spy.mock.calls.length === 1 ).toBe( true );
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

			const spy = vi.spyOn( nativeDataTransfer, 'files', 'get' );

			const dt = new ViewDataTransfer( nativeDataTransfer, { cacheFiles: true } );

			expect( spy.mock.calls.length === 1 ).toBe( true );
			expect( dt._files ).toEqual( [ 'file1' ] );

			// Access getter.
			expect( dt.files ).toEqual( [ 'file1' ] );

			expect( spy.mock.calls.length === 1 ).toBe( true );
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

			const spy = vi.spyOn( nativeDataTransfer, 'files', 'get' );

			const dt = new ViewDataTransfer( nativeDataTransfer );

			expect( spy.mock.calls.length === 1 ).toBe( false );
			expect( dt._files ).toBeNull();

			// Access getter.
			expect( dt.files ).toEqual( [ 'file1' ] );

			expect( spy.mock.calls.length === 1 ).toBe( true );
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

			const spy = vi.spyOn( nativeDataTransfer, 'items', 'get' );

			const dt = new ViewDataTransfer( nativeDataTransfer, { cacheFiles: true } );

			expect( spy.mock.calls.length === 1 ).toBe( true );
			expect( dt._files ).toEqual( [ 'file1' ] );

			// Access getter.
			expect( dt.files ).toEqual( [ 'file1' ] );

			expect( spy.mock.calls.length === 1 ).toBe( true );
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

			const spy = vi.spyOn( nativeDataTransfer, 'items', 'get' );

			const dt = new ViewDataTransfer( nativeDataTransfer );

			expect( spy.mock.calls.length === 1 ).toBe( false );
			expect( dt._files ).toBeNull();

			// Access getter.
			expect( dt.files ).toEqual( [ 'file1' ] );

			expect( spy.mock.calls.length === 1 ).toBe( true );
		} );
	} );

	describe( 'getData()', () => {
		it( 'should return data from the native data transfer', () => {
			const dt = new ViewDataTransfer( {
				getData( type ) {
					return 'foo:' + type;
				}
			} );

			expect( dt.getData( 'x/y' ) ).toBe( 'foo:x/y' );
		} );
	} );

	describe( 'setData()', () => {
		it( 'should set data in the native data transfer', () => {
			const spy = vi.fn();
			const dt = new ViewDataTransfer( {
				setData: spy
			} );

			dt.setData( 'text/html', 'bar' );

			expect( spy ).toHaveBeenCalledWith( 'text/html', 'bar' );
		} );
	} );

	describe( 'types', () => {
		it( 'should return available types', () => {
			const dt = new ViewDataTransfer( {
				types: [ 'text/html', 'text/plain' ]
			} );

			expect( dt.types ).toEqual( [ 'text/html', 'text/plain' ] );
		} );
	} );

	describe( '#effectAllowed', () => {
		it( 'should return value from the native data transfer', () => {
			const dt = new ViewDataTransfer( {
				effectAllowed: 'foo'
			} );

			expect( dt.effectAllowed ).toBe( 'foo' );
		} );

		it( 'should set value in the native data transfer', () => {
			const spy = vi.fn();
			const dt = new ViewDataTransfer( {
				set effectAllowed( value ) {
					spy( value );
				}
			} );

			dt.effectAllowed = 'bar';

			expect( spy ).toHaveBeenCalledWith( 'bar' );
		} );
	} );

	describe( '#dropEffect', () => {
		it( 'should return value from the native data transfer', () => {
			const dt = new ViewDataTransfer( {
				dropEffect: 'foo'
			} );

			expect( dt.dropEffect ).toBe( 'foo' );
		} );

		it( 'should set value in the native data transfer', () => {
			const spy = vi.fn();
			const dt = new ViewDataTransfer( {
				set dropEffect( value ) {
					spy( value );
				}
			} );

			dt.dropEffect = 'bar';

			expect( spy ).toHaveBeenCalledWith( 'bar' );
		} );
	} );

	describe( '#setDragImage()', () => {
		it( 'should call the native data transfer', () => {
			const spy = vi.fn();
			const dt = new ViewDataTransfer( {
				setDragImage( element, x, y ) {
					spy( element, x, y );
				}
			} );

			dt.setDragImage( 'foo', 123, 789 );

			expect( spy ).toHaveBeenCalledWith( 'foo', 123, 789 );
		} );
	} );

	describe( '#isCanceled', () => {
		it( 'should return true if native data transfer dropEffect is equal "none" and mozUserCancelled is not set', () => {
			const dt = new ViewDataTransfer( {
				dropEffect: 'none',
				mozUserCancelled: false
			} );

			expect( dt.isCanceled ).toBe( true );
		} );

		it( 'should return true if native data transfer dropEffect is equal "none" and mozUserCancelled is set', () => {
			const dt = new ViewDataTransfer( {
				dropEffect: 'none',
				mozUserCancelled: true
			} );

			expect( dt.isCanceled ).toBe( true );
		} );

		it( 'should return false if native data transfer dropEffect is equal "move" and mozUserCancelled is not set', () => {
			const dt = new ViewDataTransfer( {
				dropEffect: 'move',
				mozUserCancelled: false
			} );

			expect( dt.isCanceled ).toBe( false );
		} );

		it( 'should return false if native data transfer dropEffect is equal "move" and mozUserCancelled is set', () => {
			const dt = new ViewDataTransfer( {
				dropEffect: 'move',
				mozUserCancelled: true
			} );

			expect( dt.isCanceled ).toBe( true );
		} );
	} );
} );
