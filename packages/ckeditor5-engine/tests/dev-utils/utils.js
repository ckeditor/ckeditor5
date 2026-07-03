/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	convertMapToTags,
	convertMapToStringifiedObject,
	dumpTrees,
	initDocumentDumping,
	logDocument
} from '../../src/dev-utils/utils.js';

describe( 'dev-utils/utils', () => {
	describe( 'convertMapToTags()', () => {
		it( 'should convert empty map to empty string', () => {
			const map = new Map();
			const result = convertMapToTags( map );

			expect( result ).toBe( '' );
		} );

		it( 'should convert map with string values', () => {
			const map = new Map( [
				[ 'foo', 'bar' ],
				[ 'baz', 'qux' ]
			] );
			const result = convertMapToTags( map );

			expect( result ).toBe( ' foo="bar" baz="qux"' );
		} );

		it( 'should convert map with number values', () => {
			const map = new Map( [
				[ 'count', 42 ],
				[ 'index', 0 ]
			] );
			const result = convertMapToTags( map );

			expect( result ).toBe( ' count=42 index=0' );
		} );

		it( 'should convert map with boolean values', () => {
			const map = new Map( [
				[ 'enabled', true ],
				[ 'disabled', false ]
			] );
			const result = convertMapToTags( map );

			expect( result ).toBe( ' enabled=true disabled=false' );
		} );

		it( 'should convert map with object values', () => {
			const map = new Map( [
				[ 'config', { x: 1, y: 2 } ],
				[ 'data', [ 'a', 'b' ] ]
			] );
			const result = convertMapToTags( map );

			expect( result ).toBe( ' config={"x":1,"y":2} data=["a","b"]' );
		} );

		it( 'should convert map with null and undefined values', () => {
			const map = new Map( [
				[ 'nullValue', null ],
				[ 'undefinedValue', undefined ]
			] );
			const result = convertMapToTags( map );

			expect( result ).toBe( ' nullValue=null undefinedValue=undefined' );
		} );

		it( 'should work with iterable that is not a Map', () => {
			const iterable = [
				[ 'key1', 'value1' ],
				[ 'key2', 'value2' ]
			];
			const result = convertMapToTags( iterable );

			expect( result ).toBe( ' key1="value1" key2="value2"' );
		} );
	} );

	describe( 'convertMapToStringifiedObject()', () => {
		it( 'should convert empty map to empty object string', () => {
			const map = new Map();
			const result = convertMapToStringifiedObject( map );

			expect( result ).toBe( '{}' );
		} );

		it( 'should convert map with string values', () => {
			const map = new Map( [
				[ 'foo', 'bar' ],
				[ 'baz', 'qux' ]
			] );
			const result = convertMapToStringifiedObject( map );
			const parsed = JSON.parse( result );

			expect( parsed ).toEqual( { foo: 'bar', baz: 'qux' } );
		} );

		it( 'should convert map with mixed value types', () => {
			const map = new Map( [
				[ 'string', 'value' ],
				[ 'number', 42 ],
				[ 'boolean', true ],
				[ 'object', { nested: 'value' } ],
				[ 'array', [ 1, 2, 3 ] ],
				[ 'null', null ]
			] );
			const result = convertMapToStringifiedObject( map );
			const parsed = JSON.parse( result );

			expect( parsed ).toEqual( {
				string: 'value',
				number: 42,
				boolean: true,
				object: { nested: 'value' },
				array: [ 1, 2, 3 ],
				null: null
			} );
		} );

		it( 'should work with iterable that is not a Map', () => {
			const iterable = [
				[ 'key1', 'value1' ],
				[ 'key2', 123 ]
			];
			const result = convertMapToStringifiedObject( iterable );
			const parsed = JSON.parse( result );

			expect( parsed ).toEqual( { key1: 'value1', key2: 123 } );
		} );

		it( 'should handle keys that override object properties', () => {
			const map = new Map( [
				[ 'toString', 'custom' ],
				[ 'constructor', 'value' ]
			] );
			const result = convertMapToStringifiedObject( map );
			const parsed = JSON.parse( result );

			expect( parsed ).toEqual( { toString: 'custom', constructor: 'value' } );
		} );
	} );

	describe( 'document dumping functions', () => {
		let mockDocument, mockRoot1, mockRoot2, consoleLogStub;

		beforeEach( () => {
			consoleLogStub = vi.spyOn( console, 'log' ).mockImplementation( () => {} );

			mockRoot1 = {
				printTree: vi.fn().mockReturnValue( 'tree1\ncontent' )
			};

			mockRoot2 = {
				printTree: vi.fn().mockReturnValue( 'tree2\ncontent' )
			};

			mockDocument = {
				roots: [ mockRoot1, mockRoot2 ]
			};
		} );

		describe( 'initDocumentDumping()', () => {
			it( 'should initialize empty tree dump array', () => {
				initDocumentDumping( mockDocument );

				// The function uses a Symbol, so we check if any Symbol property was added
				const symbols = Object.getOwnPropertySymbols( mockDocument );
				expect( symbols ).toHaveLength( 1 );

				const treeDumpSymbol = symbols[ 0 ];
				expect( mockDocument[ treeDumpSymbol ] ).toBeInstanceOf( Array );
				expect( mockDocument[ treeDumpSymbol ] ).toHaveLength( 0 );
			} );
		} );

		describe( 'dumpTrees()', () => {
			let treeDumpSymbol;

			beforeEach( () => {
				initDocumentDumping( mockDocument );
				treeDumpSymbol = Object.getOwnPropertySymbols( mockDocument )[ 0 ];
			} );

			it( 'should log document and version', () => {
				dumpTrees( mockDocument, 1 );

				expect( consoleLogStub ).toHaveBeenCalledWith( mockDocument, 1 );
			} );

			it( 'should call printTree on all roots', () => {
				dumpTrees( mockDocument, 1 );

				expect( mockRoot1.printTree ).toHaveBeenCalledOnce();
				expect( mockRoot2.printTree ).toHaveBeenCalledOnce();
			} );

			it( 'should store concatenated tree output', () => {
				dumpTrees( mockDocument, 1 );

				expect( mockDocument[ treeDumpSymbol ][ 1 ] ).toBe( 'tree1\ncontent\ntree2\ncontent' );
			} );

			it( 'should remove trailing newline', () => {
				mockRoot1.printTree.mockReturnValue( 'tree1' );
				mockRoot2.printTree.mockReturnValue( 'tree2' );

				dumpTrees( mockDocument, 1 );

				expect( mockDocument[ treeDumpSymbol ][ 1 ] ).toBe( 'tree1\ntree2' );
			} );

			it( 'should handle single root', () => {
				mockDocument.roots = [ mockRoot1 ];
				dumpTrees( mockDocument, 1 );

				expect( mockDocument[ treeDumpSymbol ][ 1 ] ).toBe( 'tree1\ncontent' );
			} );

			it( 'should limit tree dump length and remove overflow', () => {
				// Fill beyond maxTreeDumpLength (20)
				for ( let i = 0; i < 25; i++ ) {
					dumpTrees( mockDocument, i );
				}

				expect( mockDocument[ treeDumpSymbol ].length ).toBe( 25 );
				expect( mockDocument[ treeDumpSymbol ][ 4 ] ).toBeNull(); // overflow - 1 = 5 - 1 = 4
			} );

			it( 'should store multiple versions', () => {
				dumpTrees( mockDocument, 0 );
				dumpTrees( mockDocument, 5 );
				dumpTrees( mockDocument, 10 );

				expect( mockDocument[ treeDumpSymbol ][ 0 ] ).toBe( 'tree1\ncontent\ntree2\ncontent' );
				expect( mockDocument[ treeDumpSymbol ][ 5 ] ).toBe( 'tree1\ncontent\ntree2\ncontent' );
				expect( mockDocument[ treeDumpSymbol ][ 10 ] ).toBe( 'tree1\ncontent\ntree2\ncontent' );
			} );
		} );

		describe( 'logDocument()', () => {
			let treeDumpSymbol;

			beforeEach( () => {
				initDocumentDumping( mockDocument );
				treeDumpSymbol = Object.getOwnPropertySymbols( mockDocument )[ 0 ];
			} );

			it( 'should log separator', () => {
				logDocument( mockDocument, 1 );

				expect( consoleLogStub ).toHaveBeenCalledWith( '--------------------' );
			} );

			it( 'should log tree dump if available', () => {
				mockDocument[ treeDumpSymbol ][ 5 ] = 'stored tree dump';

				logDocument( mockDocument, 5 );

				expect( consoleLogStub ).toHaveBeenCalledWith( '--------------------' );
				expect( consoleLogStub ).toHaveBeenCalledWith( 'stored tree dump' );
			} );

			it( 'should log unavailable message if dump not found', () => {
				logDocument( mockDocument, 999 );

				expect( consoleLogStub ).toHaveBeenCalledWith( '--------------------' );
				expect( consoleLogStub ).toHaveBeenCalledWith( 'Tree log unavailable for given version: 999' );
			} );

			it( 'should handle undefined version', () => {
				logDocument( mockDocument, undefined );

				expect( consoleLogStub ).toHaveBeenCalledWith( 'Tree log unavailable for given version: undefined' );
			} );

			it( 'should handle null tree dump entry', () => {
				mockDocument[ treeDumpSymbol ][ 3 ] = null;

				logDocument( mockDocument, 3 );

				expect( consoleLogStub ).toHaveBeenCalledWith( 'Tree log unavailable for given version: 3' );
			} );
		} );

		describe( 'integration test', () => {
			it( 'should work together - init, dump, and log', () => {
				// Initialize
				initDocumentDumping( mockDocument );

				// Dump some versions
				dumpTrees( mockDocument, 0 );
				dumpTrees( mockDocument, 1 );

				// Log existing version
				logDocument( mockDocument, 0 );

				// Verify calls
				expect( consoleLogStub ).toHaveBeenCalledWith( mockDocument, 0 );
				expect( consoleLogStub ).toHaveBeenCalledWith( mockDocument, 1 );
				expect( consoleLogStub ).toHaveBeenCalledWith( '--------------------' );
				expect( consoleLogStub ).toHaveBeenCalledWith( 'tree1\ncontent\ntree2\ncontent' );
			} );
		} );
	} );
} );
