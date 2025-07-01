/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	convertMapToTags,
	convertMapToStringifiedObject,
	dumpTrees,
	initDocumentDumping,
	logDocument
} from '../../src/dev-utils/utils.js';

describe( 'dev-utils/utils', () => {
	afterEach( () => {
		sinon.restore();
	} );

	describe( 'convertMapToTags()', () => {
		it( 'should convert empty map to empty string', () => {
			const map = new Map();
			const result = convertMapToTags( map );

			expect( result ).to.equal( '' );
		} );

		it( 'should convert map with string values', () => {
			const map = new Map( [
				[ 'foo', 'bar' ],
				[ 'baz', 'qux' ]
			] );
			const result = convertMapToTags( map );

			expect( result ).to.equal( ' foo="bar" baz="qux"' );
		} );

		it( 'should convert map with number values', () => {
			const map = new Map( [
				[ 'count', 42 ],
				[ 'index', 0 ]
			] );
			const result = convertMapToTags( map );

			expect( result ).to.equal( ' count=42 index=0' );
		} );

		it( 'should convert map with boolean values', () => {
			const map = new Map( [
				[ 'enabled', true ],
				[ 'disabled', false ]
			] );
			const result = convertMapToTags( map );

			expect( result ).to.equal( ' enabled=true disabled=false' );
		} );

		it( 'should convert map with object values', () => {
			const map = new Map( [
				[ 'config', { x: 1, y: 2 } ],
				[ 'data', [ 'a', 'b' ] ]
			] );
			const result = convertMapToTags( map );

			expect( result ).to.equal( ' config={"x":1,"y":2} data=["a","b"]' );
		} );

		it( 'should convert map with null and undefined values', () => {
			const map = new Map( [
				[ 'nullValue', null ],
				[ 'undefinedValue', undefined ]
			] );
			const result = convertMapToTags( map );

			expect( result ).to.equal( ' nullValue=null undefinedValue=undefined' );
		} );

		it( 'should work with iterable that is not a Map', () => {
			const iterable = [
				[ 'key1', 'value1' ],
				[ 'key2', 'value2' ]
			];
			const result = convertMapToTags( iterable );

			expect( result ).to.equal( ' key1="value1" key2="value2"' );
		} );
	} );

	describe( 'convertMapToStringifiedObject()', () => {
		it( 'should convert empty map to empty object string', () => {
			const map = new Map();
			const result = convertMapToStringifiedObject( map );

			expect( result ).to.equal( '{}' );
		} );

		it( 'should convert map with string values', () => {
			const map = new Map( [
				[ 'foo', 'bar' ],
				[ 'baz', 'qux' ]
			] );
			const result = convertMapToStringifiedObject( map );
			const parsed = JSON.parse( result );

			expect( parsed ).to.deep.equal( { foo: 'bar', baz: 'qux' } );
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

			expect( parsed ).to.deep.equal( {
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

			expect( parsed ).to.deep.equal( { key1: 'value1', key2: 123 } );
		} );

		it( 'should handle keys that override object properties', () => {
			const map = new Map( [
				[ 'toString', 'custom' ],
				[ 'constructor', 'value' ]
			] );
			const result = convertMapToStringifiedObject( map );
			const parsed = JSON.parse( result );

			expect( parsed ).to.deep.equal( { toString: 'custom', constructor: 'value' } );
		} );
	} );

	describe( 'document dumping functions', () => {
		let mockDocument, mockRoot1, mockRoot2, consoleLogStub;

		beforeEach( () => {
			consoleLogStub = sinon.stub( console, 'log' );

			mockRoot1 = {
				printTree: sinon.stub().returns( 'tree1\ncontent' )
			};

			mockRoot2 = {
				printTree: sinon.stub().returns( 'tree2\ncontent' )
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
				expect( symbols ).to.have.length( 1 );

				const treeDumpSymbol = symbols[ 0 ];
				expect( mockDocument[ treeDumpSymbol ] ).to.be.an( 'array' );
				expect( mockDocument[ treeDumpSymbol ] ).to.be.empty;
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

				sinon.assert.calledWith( consoleLogStub, mockDocument, 1 );
			} );

			it( 'should call printTree on all roots', () => {
				dumpTrees( mockDocument, 1 );

				sinon.assert.calledOnce( mockRoot1.printTree );
				sinon.assert.calledOnce( mockRoot2.printTree );
			} );

			it( 'should store concatenated tree output', () => {
				dumpTrees( mockDocument, 1 );

				expect( mockDocument[ treeDumpSymbol ][ 1 ] ).to.equal( 'tree1\ncontent\ntree2\ncontent' );
			} );

			it( 'should remove trailing newline', () => {
				mockRoot1.printTree.returns( 'tree1' );
				mockRoot2.printTree.returns( 'tree2' );

				dumpTrees( mockDocument, 1 );

				expect( mockDocument[ treeDumpSymbol ][ 1 ] ).to.equal( 'tree1\ntree2' );
			} );

			it( 'should handle single root', () => {
				mockDocument.roots = [ mockRoot1 ];
				dumpTrees( mockDocument, 1 );

				expect( mockDocument[ treeDumpSymbol ][ 1 ] ).to.equal( 'tree1\ncontent' );
			} );

			it( 'should limit tree dump length and remove overflow', () => {
				// Fill beyond maxTreeDumpLength (20)
				for ( let i = 0; i < 25; i++ ) {
					dumpTrees( mockDocument, i );
				}

				expect( mockDocument[ treeDumpSymbol ].length ).to.equal( 25 );
				expect( mockDocument[ treeDumpSymbol ][ 4 ] ).to.be.null; // overflow - 1 = 5 - 1 = 4
			} );

			it( 'should store multiple versions', () => {
				dumpTrees( mockDocument, 0 );
				dumpTrees( mockDocument, 5 );
				dumpTrees( mockDocument, 10 );

				expect( mockDocument[ treeDumpSymbol ][ 0 ] ).to.equal( 'tree1\ncontent\ntree2\ncontent' );
				expect( mockDocument[ treeDumpSymbol ][ 5 ] ).to.equal( 'tree1\ncontent\ntree2\ncontent' );
				expect( mockDocument[ treeDumpSymbol ][ 10 ] ).to.equal( 'tree1\ncontent\ntree2\ncontent' );
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

				sinon.assert.calledWith( consoleLogStub, '--------------------' );
			} );

			it( 'should log tree dump if available', () => {
				mockDocument[ treeDumpSymbol ][ 5 ] = 'stored tree dump';

				logDocument( mockDocument, 5 );

				sinon.assert.calledWith( consoleLogStub, '--------------------' );
				sinon.assert.calledWith( consoleLogStub, 'stored tree dump' );
			} );

			it( 'should log unavailable message if dump not found', () => {
				logDocument( mockDocument, 999 );

				sinon.assert.calledWith( consoleLogStub, '--------------------' );
				sinon.assert.calledWith( consoleLogStub, 'Tree log unavailable for given version: 999' );
			} );

			it( 'should handle undefined version', () => {
				logDocument( mockDocument, undefined );

				sinon.assert.calledWith( consoleLogStub, 'Tree log unavailable for given version: undefined' );
			} );

			it( 'should handle null tree dump entry', () => {
				mockDocument[ treeDumpSymbol ][ 3 ] = null;

				logDocument( mockDocument, 3 );

				sinon.assert.calledWith( consoleLogStub, 'Tree log unavailable for given version: 3' );
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
				sinon.assert.calledWith( consoleLogStub, mockDocument, 0 );
				sinon.assert.calledWith( consoleLogStub, mockDocument, 1 );
				sinon.assert.calledWith( consoleLogStub, '--------------------' );
				sinon.assert.calledWith( consoleLogStub, 'tree1\ncontent\ntree2\ncontent' );
			} );
		} );
	} );
} );
