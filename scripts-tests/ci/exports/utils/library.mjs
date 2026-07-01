/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import upath from 'upath';
import { globSync } from 'glob';
import { beforeEach, describe, expect, it } from 'vitest';
import { Library } from '../../../../scripts/ci/exports/utils/library.mjs';

const FIXTURES_PATH = upath.join( import.meta.dirname, '..', '_fixtures', 'library' );

function getFixtureFilePaths() {
	return globSync( upath.join( FIXTURES_PATH, 'packages', '*', 'src', '**', '*.ts' ) )
		.map( upath.normalize )
		.sort();
}

describe( 'scripts/ci/exports/utils/library', () => {
	let library;

	beforeEach( () => {
		library = new Library().loadModules( getFixtureFilePaths() );
	} );

	describe( 'loadModules()', () => {
		it( 'should load all modules and group them by package', () => {
			expect( library.modules ).toHaveLength( 5 );
			expect( [ ...library.packages.keys() ].sort() ).toEqual( [
				'@ckeditor/ckeditor5-library',
				'@ckeditor/ckeditor5-other'
			] );
		} );

		it( 'should separate the package index module from other modules', () => {
			const pkg = library.packages.get( '@ckeditor/ckeditor5-library' );

			expect( pkg.index.relativeFileName ).toBe( 'index.ts' );
			expect( pkg.modules.map( module => module.relativeFileName ).sort() ).toEqual( [
				'libraryfeature.ts',
				'libraryutils.ts'
			] );
			expect( pkg.dirName.endsWith( 'packages/ckeditor5-library' ) ).toBe( true );
			expect( pkg.isPublicPackage ).toBe( false );
		} );

		it( 'should not collect any errors for valid modules', () => {
			expect( library.errorCollector.hasErrors() ).toBe( false );
		} );
	} );

	describe( 'import and export resolution', () => {
		it( 'should resolve the re-export source to the module object', () => {
			const pkg = library.packages.get( '@ckeditor/ckeditor5-library' );
			const featureModule = pkg.modules.find( module => module.relativeFileName === 'libraryfeature.ts' );

			const indexExport = pkg.index.exports.find( ( { name } ) => name === 'LibraryFeature' );

			expect( indexExport.importFrom ).toBe( featureModule );
			expect( indexExport.references ).toEqual( [
				featureModule.exports.find( ( { name } ) => name === 'LibraryFeature' )
			] );
		} );

		it( 'should resolve a cross-package import to the index module of the other package', () => {
			const libraryPkg = library.packages.get( '@ckeditor/ckeditor5-library' );
			const otherPkg = library.packages.get( '@ckeditor/ckeditor5-other' );

			const otherModule = otherPkg.modules.find( module => module.relativeFileName === 'otherfeature.ts' );
			const importItem = otherModule.imports.find( ( { name } ) => name === 'LibraryFeature' );

			expect( importItem.importFrom ).toBe( libraryPkg.index );
			expect( importItem.references ).toEqual( [
				libraryPkg.index.exports.find( ( { name } ) => name === 'LibraryFeature' )
			] );
		} );

		it( 'should link a declaration with its export', () => {
			const pkg = library.packages.get( '@ckeditor/ckeditor5-library' );
			const featureModule = pkg.modules.find( module => module.relativeFileName === 'libraryfeature.ts' );

			const declaration = featureModule.declarations.find( ( { localName } ) => localName === 'LibraryFeature' );
			const exportItem = featureModule.exports.find( ( { name } ) => name === 'LibraryFeature' );

			expect( declaration.references ).toContain( exportItem );
			expect( exportItem.references ).toEqual( [ declaration ] );
		} );
	} );

	describe( 'marking re-exports', () => {
		function getSourceExport( name ) {
			const pkg = library.packages.get( '@ckeditor/ckeditor5-library' );

			return pkg.modules
				.flatMap( module => module.exports )
				.find( exportItem => exportItem.name === name );
		}

		it( 'should mark an export re-exported from the package index', () => {
			expect( getSourceExport( 'LibraryFeature' ).reExported ).toEqual( [
				{ name: 'LibraryFeature', kind: 'value' }
			] );
		} );

		it( 'should mark a renamed re-export with the name used in the package index', () => {
			expect( getSourceExport( 'LibraryHelper' ).reExported ).toEqual( [
				{ name: 'LibraryHelperAlias', kind: 'value' }
			] );
		} );

		it( 'should mark exports re-exported with `export * as namespace` using qualified names', () => {
			expect( getSourceExport( 'libraryUtil' ).reExported ).toEqual( [
				{ name: 'libraryUtils.libraryUtil', kind: 'value' }
			] );
		} );

		it( 'should not mark exports that are not re-exported from the package index', () => {
			const otherPkg = library.packages.get( '@ckeditor/ckeditor5-other' );
			const otherModule = otherPkg.modules.find( module => module.relativeFileName === 'otherfeature.ts' );

			// `OtherFeature` is re-exported, but the index export itself has no further re-exports.
			expect( otherModule.exports.find( ( { name } ) => name === 'OtherFeature' ).reExported ).toHaveLength( 1 );
			expect( otherPkg.index.exports.find( ( { name } ) => name === 'OtherFeature' ).reExported ).toHaveLength( 0 );
		} );
	} );
} );
