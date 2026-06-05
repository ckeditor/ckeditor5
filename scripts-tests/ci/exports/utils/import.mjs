/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { Import } from '../../../../scripts/ci/exports/utils/import.mjs';
import { ExternalModule } from '../../../../scripts/ci/exports/utils/externalmodule.mjs';

function createNode( { line = 1, importKind } = {} ) {
	return {
		loc: { start: { line } },
		importKind
	};
}

describe( 'scripts/ci/exports/utils/import', () => {
	describe( 'create()', () => {
		it( 'should create an import with data from the AST node', () => {
			const importItem = Import.create( {
				name: 'Foo',
				localName: 'FooAlias',
				importFrom: './foo.js',
				node: createNode( { line: 5, importKind: 'value' } ),
				fileName: '/repo/packages/ckeditor5-example/src/bar.ts'
			} );

			expect( importItem.name ).toBe( 'Foo' );
			expect( importItem.localName ).toBe( 'FooAlias' );
			expect( importItem.importFrom ).toBe( './foo.js' );
			expect( importItem.fileName ).toBe( '/repo/packages/ckeditor5-example/src/bar.ts' );
			expect( importItem.lineNumber ).toBe( 5 );
			expect( importItem.references ).toBeNull();
		} );

		it( 'should use the `type` import kind from the AST node (`import type { ... }`)', () => {
			const importItem = Import.create( {
				name: 'Foo',
				localName: 'Foo',
				importKind: 'value',
				importFrom: './foo.js',
				node: createNode( { importKind: 'type' } ),
				fileName: 'bar.ts'
			} );

			expect( importItem.importKind ).toBe( 'type' );
		} );

		it( 'should prefer the explicitly passed import kind for value imports', () => {
			const importItem = Import.create( {
				name: 'Foo',
				localName: 'Foo',
				importKind: 'type',
				importFrom: './foo.js',
				node: createNode( { importKind: 'value' } ),
				fileName: 'bar.ts'
			} );

			expect( importItem.importKind ).toBe( 'type' );
		} );

		it( 'should fall back to the node import kind', () => {
			const importItem = Import.create( {
				name: 'Foo',
				localName: 'Foo',
				importFrom: './foo.js',
				node: createNode( { importKind: 'value' } ),
				fileName: 'bar.ts'
			} );

			expect( importItem.importKind ).toBe( 'value' );
		} );
	} );

	describe( 'resolveImport()', () => {
		it( 'should store the resolved module and return itself for a named import', () => {
			const importItem = Import.create( {
				name: 'Foo',
				localName: 'Foo',
				importFrom: './foo.js',
				node: createNode(),
				fileName: 'bar.ts'
			} );

			const otherModule = { fileName: '/repo/packages/ckeditor5-example/src/foo.ts', exports: [] };
			const result = importItem.resolveImport( otherModule );

			expect( result ).toEqual( [ importItem ] );
			expect( importItem.importFrom ).toBe( otherModule );
		} );

		it( 'should allow a namespace import from an external module', () => {
			const importItem = Import.create( {
				name: '*',
				localName: 'external',
				importFrom: 'external-package',
				node: createNode(),
				fileName: 'bar.ts'
			} );

			const externalModule = new ExternalModule( 'external-package' );
			const result = importItem.resolveImport( externalModule );

			expect( result ).toEqual( [ importItem ] );
			expect( importItem.importFrom ).toBe( externalModule );
		} );

		it( 'should throw for a namespace import from a project module', () => {
			const importItem = Import.create( {
				name: '*',
				localName: 'foo',
				importFrom: './foo.js',
				node: createNode(),
				fileName: 'bar.ts'
			} );

			expect( () => {
				importItem.resolveImport( { fileName: 'foo.ts', exports: [] } );
			} ).toThrow( 'import * as abc from ... is not supported' );
		} );
	} );
} );
