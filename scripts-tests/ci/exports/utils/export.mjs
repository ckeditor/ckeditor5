/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { Export } from '../../../../scripts/ci/exports/utils/export.mjs';

function createNode( { line = 1, leadingComments, declaration, source, exportKind } = {} ) {
	return {
		loc: { start: { line } },
		leadingComments,
		declaration,
		source,
		exportKind
	};
}

describe( 'scripts/ci/exports/utils/export', () => {
	describe( 'create()', () => {
		it( 'should create an export of a class declaration', () => {
			const exportItem = Export.create( {
				name: 'Foo',
				localName: 'Foo',
				node: createNode( { line: 7, declaration: { type: 'ClassDeclaration' } } ),
				fileName: '/repo/packages/ckeditor5-example/src/foo.ts'
			} );

			expect( exportItem.name ).toBe( 'Foo' );
			expect( exportItem.localName ).toBe( 'Foo' );
			expect( exportItem.type ).toBe( 'class' );
			expect( exportItem.fileName ).toBe( '/repo/packages/ckeditor5-example/src/foo.ts' );
			expect( exportItem.lineNumber ).toBe( 7 );
			expect( exportItem.reExported ).toEqual( [] );
		} );

		it( 'should map known AST declaration types to simplified type names', () => {
			const typeMap = {
				VariableDeclaration: 'variable',
				FunctionDeclaration: 'function',
				ClassDeclaration: 'class',
				ObjectExpression: 'object',
				Identifier: 'identifier',
				TSTypeAliasDeclaration: 'type',
				TSInterfaceDeclaration: 'interface',
				TSEnumDeclaration: 'enum'
			};

			for ( const [ astType, simplifiedType ] of Object.entries( typeMap ) ) {
				const exportItem = Export.create( {
					name: 'Foo',
					localName: 'Foo',
					node: createNode( { declaration: { type: astType } } ),
					fileName: 'foo.ts'
				} );

				expect( exportItem.type, astType ).toBe( simplifiedType );
			}
		} );

		it( 'should detect an event export from the `@eventName` comment', () => {
			const exportItem = Export.create( {
				name: 'ExampleEvent',
				localName: 'ExampleEvent',
				node: createNode( {
					leadingComments: [ { value: '*\n * @eventName ~Example#example\n ' } ],
					declaration: { type: 'TSTypeAliasDeclaration' }
				} ),
				fileName: 'foo.ts'
			} );

			expect( exportItem.type ).toBe( 'event' );
		} );

		it( 'should detect a re-export (`export ... from ...`)', () => {
			const exportItem = Export.create( {
				name: 'Foo',
				localName: 'Foo',
				importFrom: './foo.js',
				node: createNode( { source: { value: './foo.js' } } ),
				fileName: 'index.ts'
			} );

			expect( exportItem.type ).toBe( 're-export' );
			expect( exportItem.importFrom ).toBe( './foo.js' );
		} );

		it( 'should use the passed type when the node has no declaration and no source', () => {
			const exportItem = Export.create( {
				name: 'Foo',
				localName: 'Foo',
				type: 'identifier',
				node: createNode(),
				fileName: 'foo.ts'
			} );

			expect( exportItem.type ).toBe( 'identifier' );
		} );

		it( 'should throw on an unknown export declaration type', () => {
			expect( () => {
				Export.create( {
					name: 'Foo',
					localName: 'Foo',
					node: createNode( { declaration: { type: 'TSModuleDeclaration' } } ),
					fileName: 'foo.ts'
				} );
			} ).toThrow( 'Unknown export declaration type' );
		} );

		it( 'should throw when the export type cannot be determined', () => {
			expect( () => {
				Export.create( {
					name: 'Foo',
					localName: 'Foo',
					node: createNode(),
					fileName: 'foo.ts'
				} );
			} ).toThrow( 'Unknown export type' );
		} );

		it( 'should prefer the explicitly passed export kind over the node export kind', () => {
			const exportItem = Export.create( {
				name: 'Foo',
				localName: 'Foo',
				exportKind: 'type',
				node: createNode( { declaration: { type: 'ClassDeclaration' }, exportKind: 'value' } ),
				fileName: 'foo.ts'
			} );

			expect( exportItem.exportKind ).toBe( 'type' );
		} );

		it( 'should fall back to the node export kind', () => {
			const exportItem = Export.create( {
				name: 'Foo',
				localName: 'Foo',
				node: createNode( { declaration: { type: 'ClassDeclaration' }, exportKind: 'value' } ),
				fileName: 'foo.ts'
			} );

			expect( exportItem.exportKind ).toBe( 'value' );
		} );

		it( 'should mark an export with the `@internal` comment as internal', () => {
			const exportItem = Export.create( {
				name: 'Foo',
				localName: 'Foo',
				node: createNode( {
					leadingComments: [ { value: '*\n * @internal\n ' } ],
					declaration: { type: 'ClassDeclaration' }
				} ),
				fileName: 'foo.ts'
			} );

			expect( exportItem.internal ).toBe( true );
			expect( exportItem.explicitInternal ).toBe( true );
		} );

		it( 'should not mark an export without the `@internal` comment as internal', () => {
			const exportItem = Export.create( {
				name: 'Foo',
				localName: 'Foo',
				node: createNode( { declaration: { type: 'ClassDeclaration' } } ),
				fileName: 'foo.ts'
			} );

			expect( exportItem.internal ).toBe( false );
			expect( exportItem.explicitInternal ).toBe( false );
		} );
	} );

	describe( 'resolveImport()', () => {
		it( 'should store the resolved module and return itself for a named export', () => {
			const exportItem = new Export( {
				name: 'Foo',
				localName: 'Foo',
				fileName: 'index.ts',
				importFrom: './foo.js'
			} );

			const otherModule = { fileName: '/repo/packages/ckeditor5-example/src/foo.ts', exports: [] };
			const result = exportItem.resolveImport( otherModule );

			expect( result ).toEqual( [ exportItem ] );
			expect( exportItem.importFrom ).toBe( otherModule );
		} );

		it( 'should expand the `export * from ...` export to all exports of the resolved module', () => {
			const exportItem = new Export( {
				name: '*',
				localName: '',
				fileName: 'index.ts',
				lineNumber: 3,
				importFrom: './foo.js'
			} );

			const otherModule = {
				exports: [
					new Export( { name: 'Foo', localName: 'Foo', exportKind: 'value', fileName: 'foo.ts', lineNumber: 10 } ),
					new Export( { name: 'Bar', localName: 'Bar', exportKind: 'type', internal: true, fileName: 'foo.ts', lineNumber: 20 } )
				]
			};

			const result = exportItem.resolveImport( otherModule );

			expect( result ).toHaveLength( 2 );

			expect( result[ 0 ].name ).toBe( 'Foo' );
			expect( result[ 0 ].localName ).toBe( 'Foo' );
			expect( result[ 0 ].exportKind ).toBe( 'value' );

			expect( result[ 1 ].name ).toBe( 'Bar' );
			expect( result[ 1 ].exportKind ).toBe( 'type' );
			expect( result[ 1 ].internal ).toBe( true );

			// The expanded exports point to the re-exporting file, not the source module.
			for ( const expandedExport of result ) {
				expect( expandedExport.fileName ).toBe( 'index.ts' );
				expect( expandedExport.lineNumber ).toBe( 3 );
				expect( expandedExport.importFrom ).toBe( otherModule );
			}
		} );
	} );
} );
