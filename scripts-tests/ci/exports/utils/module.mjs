/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import upath from 'upath';
import { describe, expect, it } from 'vitest';
import { Module } from '../../../../scripts/ci/exports/utils/module.mjs';
import { ErrorCollector } from '../../../../scripts/ci/exports/utils/errorcollector.mjs';

const FIXTURES_SRC_PATH = upath.join( import.meta.dirname, '..', '_fixtures', 'parsing', 'packages', 'ckeditor5-parsing', 'src' );

function loadFixture( fileName ) {
	return Module.load( upath.join( FIXTURES_SRC_PATH, fileName ), new ErrorCollector() );
}

describe( 'scripts/ci/exports/utils/module', () => {
	describe( 'load()', () => {
		it( 'should recognize the package name, relative file name, and the `@publicApi` tag', () => {
			const module = loadFixture( 'named-exports.ts' );

			expect( module.packageName ).toBe( '@ckeditor/ckeditor5-parsing' );
			expect( module.relativeFileName ).toBe( 'named-exports.ts' );
			expect( module.isPublicApi ).toBe( true );
			expect( module.isPublicPackage ).toBe( false );
		} );

		it( 'should mark a module without the `@publicApi` tag as non-public and its declarations as internal', () => {
			const module = loadFixture( 'internal-module.ts' );

			expect( module.isPublicApi ).toBe( false );

			const declaration = module.declarations.find( ( { localName } ) => localName === 'ParsingPrivate' );

			expect( declaration.internal ).toBe( true );
			expect( declaration.explicitInternal ).toBe( false );
		} );
	} );

	describe( 'parsing exports', () => {
		it( 'should collect exports of declarations (class, function, variable, type, interface)', () => {
			const module = loadFixture( 'named-exports.ts' );

			const exportTypes = Object.fromEntries(
				module.exports.map( exportItem => [ exportItem.name, exportItem.type ] )
			);

			expect( exportTypes ).toEqual( {
				ParsingFeature: 'class',
				parsingHelper: 'function',
				PARSING_ONE: 'variable',
				PARSING_TWO: 'variable',
				ParsingType: 'type',
				ParsingInterface: 'interface',
				ParsingRenamed: 'identifier',
				ParsingLocalType: 'identifier'
			} );
		} );

		it( 'should collect a renamed export specifier with both names', () => {
			const module = loadFixture( 'named-exports.ts' );

			const exportItem = module.exports.find( ( { name } ) => name === 'ParsingRenamed' );

			expect( exportItem.localName ).toBe( 'ParsingLocal' );
			expect( exportItem.exportKind ).not.toBe( 'type' );
		} );

		it( 'should recognize a type-only export specifier', () => {
			const module = loadFixture( 'named-exports.ts' );

			const exportItem = module.exports.find( ( { name } ) => name === 'ParsingLocalType' );

			expect( exportItem.exportKind ).toBe( 'type' );
		} );

		it( 'should collect a named default export', () => {
			const module = loadFixture( 'default-export.ts' );

			expect( module.exports ).toHaveLength( 1 );
			expect( module.exports[ 0 ].name ).toBe( 'default' );
			expect( module.exports[ 0 ].localName ).toBe( 'ParsingDefault' );
			expect( module.exports[ 0 ].type ).toBe( 'class' );

			expect( module.declarations.map( ( { localName } ) => localName ) ).toContain( 'ParsingDefault' );
		} );

		it( 'should collect an anonymous default export with the `<default>` placeholder name', () => {
			const module = loadFixture( 'default-anonymous.ts' );

			expect( module.exports ).toHaveLength( 1 );
			expect( module.exports[ 0 ].name ).toBe( 'default' );
			expect( module.exports[ 0 ].localName ).toBe( '<default>' );
			expect( module.exports[ 0 ].type ).toBe( 'object' );

			expect( module.declarations.map( ( { localName } ) => localName ) ).toContain( '<default>' );
		} );

		it( 'should collect re-exports with the source module path', () => {
			const module = loadFixture( 're-exports.ts' );

			const namedReExport = module.exports.find( ( { name } ) => name === 'ParsingFeature' );

			expect( namedReExport.type ).toBe( 're-export' );
			expect( namedReExport.importFrom ).toBe( './named-exports.js' );

			const exportAll = module.exports.find( ( { name } ) => name === '*' );

			expect( exportAll.localName ).toBe( '' );
			expect( exportAll.importFrom ).toBe( './default-export.js' );

			const namespaceReExport = module.exports.find( ( { name } ) => name === 'parsingNamespace' );

			expect( namespaceReExport.localName ).toBe( '*' );
			expect( namespaceReExport.type ).toBe( 're-export' );
		} );
	} );

	describe( 'parsing imports', () => {
		it( 'should collect default, named, renamed, type, and namespace imports', () => {
			const module = loadFixture( 'imports.ts' );

			const imports = module.imports.map( ( { name, localName, importKind, importFrom } ) => (
				{ name, localName, importKind, importFrom }
			) );

			expect( imports ).toEqual( [
				{ name: 'default', localName: 'ParsingDefault', importKind: 'value', importFrom: './default-export.js' },
				{ name: 'ParsingFeature', localName: 'ParsingFeature', importKind: 'value', importFrom: './named-exports.js' },
				{ name: 'parsingHelper', localName: 'parsingAlias', importKind: 'value', importFrom: './named-exports.js' },
				{ name: 'ParsingType', localName: 'ParsingType', importKind: 'type', importFrom: './named-exports.js' },
				{ name: 'ParsingChild', localName: 'ParsingChild', importKind: 'type', importFrom: './references.js' },
				{ name: '*', localName: 'parsingNamespace', importKind: 'value', importFrom: 'external-package' }
			] );
		} );
	} );

	describe( 'parsing declarations', () => {
		it( 'should collect declarations with their types', () => {
			const module = loadFixture( 'named-exports.ts' );

			const declarationTypes = Object.fromEntries(
				module.declarations.map( declaration => [ declaration.localName, declaration.type ] )
			);

			expect( declarationTypes ).toEqual( {
				ParsingFeature: 'class',
				parsingHelper: 'function',
				PARSING_ONE: 'var',
				PARSING_TWO: 'var',
				ParsingType: 'type',
				ParsingInterface: 'interface',
				ParsingLocal: 'class',
				ParsingLocalType: 'type'
			} );
		} );

		it( 'should collect references to the base class, implemented interfaces, and property types', () => {
			const module = loadFixture( 'references.ts' );

			const declaration = module.declarations.find( ( { localName } ) => localName === 'ParsingChild' );

			expect( declaration.baseClasses ).toEqual( [ 'ParsingFeature' ] );
			expect( declaration.references ).toContain( 'ParsingFeature' );
			expect( declaration.references ).toContain( 'ParsingInterface' );
			expect( declaration.references ).toContain( 'ParsingType' );
		} );

		it( 'should mark a declaration in an `@internal` export as internal', () => {
			const module = loadFixture( 'references.ts' );

			const declaration = module.declarations.find( ( { localName } ) => localName === 'ParsingInternalChild' );

			expect( declaration.internal ).toBe( true );
		} );

		it( 'should ignore references to generic type parameters', () => {
			const module = loadFixture( 'references.ts' );

			const declaration = module.declarations.find( ( { localName } ) => localName === 'ParsingGeneric' );

			expect( declaration.references ).toContain( 'Array' );
			expect( declaration.references ).not.toContain( 'T' );
		} );

		it( 'should detect a mixin base helper', () => {
			const module = loadFixture( 'mixin.ts' );

			const helperDeclaration = module.declarations.find( ( { localName } ) => localName === 'ParsingObservableBase' );

			expect( helperDeclaration.mixinBaseHelperCandidate ).toBe( true );
			expect( helperDeclaration.isMixinBaseHelper ).toBe( true );

			const classDeclaration = module.declarations.find( ( { localName } ) => localName === 'ParsingObservable' );

			expect( classDeclaration.baseClasses ).toEqual( [ 'ParsingObservableBase' ] );
		} );

		it( 'should collect references from the static `requires` getter and class field', () => {
			const module = loadFixture( 'requires.ts' );

			const getterDeclaration = module.declarations.find( ( { localName } ) => localName === 'ParsingPlugin' );

			expect( getterDeclaration.references ).toContain( 'ParsingFeature' );

			const propertyDeclaration = module.declarations.find( ( { localName } ) => localName === 'ParsingPluginWithProperty' );

			expect( propertyDeclaration.references ).toContain( 'ParsingChild' );
		} );
	} );

	describe( 'resolvePath()', () => {
		function createPackages() {
			return new Map( [
				[ '@ckeditor/ckeditor5-core', {
					packageName: '@ckeditor/ckeditor5-core',
					dirName: '/repo/packages/ckeditor5-core'
				} ]
			] );
		}

		it( 'should resolve a relative path against the module directory and map `.js` to `.ts`', () => {
			const module = loadFixture( 'named-exports.ts' );

			expect( module.resolvePath( './imports.js', createPackages() ) )
				.toBe( upath.join( FIXTURES_SRC_PATH, 'imports.ts' ) );
		} );

		it( 'should return an absolute path as-is', () => {
			const module = loadFixture( 'named-exports.ts' );

			expect( module.resolvePath( '/repo/packages/ckeditor5-core/src/index.ts', createPackages() ) )
				.toBe( '/repo/packages/ckeditor5-core/src/index.ts' );
		} );

		it( 'should resolve a package name to its index module', () => {
			const module = loadFixture( 'named-exports.ts' );

			expect( module.resolvePath( '@ckeditor/ckeditor5-core', createPackages() ) )
				.toBe( '/repo/packages/ckeditor5-core/src/index.ts' );
		} );

		it( 'should resolve the `ckeditor5/src/*` alias to the package index module', () => {
			const module = loadFixture( 'named-exports.ts' );

			expect( module.resolvePath( 'ckeditor5/src/core.js', createPackages() ) )
				.toBe( '/repo/packages/ckeditor5-core/src/index.ts' );
		} );

		it( 'should return `null` for an unknown package', () => {
			const module = loadFixture( 'named-exports.ts' );

			expect( module.resolvePath( 'external-package', createPackages() ) ).toBeNull();
		} );
	} );
} );
