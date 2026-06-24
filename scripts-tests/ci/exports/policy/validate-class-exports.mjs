/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { validateClassExports } from '../../../../scripts/ci/exports/policy/validate-class-exports.mjs';
import { Declaration } from '../../../../scripts/ci/exports/utils/declaration.mjs';
import { Export } from '../../../../scripts/ci/exports/utils/export.mjs';

function createLibrary( indexExports ) {
	return {
		packages: new Map( [
			[ '@ckeditor/ckeditor5-example', {
				packageName: '@ckeditor/ckeditor5-example',
				index: indexExports && { relativeFileName: 'index.ts', exports: indexExports }
			} ]
		] )
	};
}

function createIndexExport( { localName = 'ExampleClass', exportKind = 'type', references = [] } = {} ) {
	const exportItem = new Export( {
		name: localName,
		localName,
		exportKind,
		fileName: 'index.ts',
		lineNumber: 1
	} );

	exportItem.references = references;

	return exportItem;
}

function createDeclaration( { type = 'class', ambient = false } = {} ) {
	return new Declaration( {
		localName: 'ExampleClass',
		type,
		ambient,
		fileName: 'examplefeature.ts',
		lineNumber: 1
	} );
}

describe( 'scripts/ci/exports/policy/validate-class-exports', () => {
	it( 'should report a class declaration re-exported as a type-only export', () => {
		const exportItem = createIndexExport( { references: [ createDeclaration() ] } );

		const errors = validateClassExports( createLibrary( [ exportItem ] ) );

		expect( errors ).toHaveLength( 1 );
		expect( errors[ 0 ].Package ).toBe( '@ckeditor/ckeditor5-example' );
		expect( errors[ 0 ][ 'Local name' ] ).toBe( 'ExampleClass' );
		expect( errors[ 0 ].Action ).toBe( 'Class must be exported as value, not type' );
	} );

	it( 'should follow a re-export chain to the class declaration', () => {
		const reExport = new Export( {
			name: 'ExampleClass',
			localName: 'ExampleClass',
			fileName: 'examplefeature.ts',
			lineNumber: 1
		} );

		reExport.references = [ createDeclaration() ];

		const exportItem = createIndexExport( { references: [ reExport ] } );

		const errors = validateClassExports( createLibrary( [ exportItem ] ) );

		expect( errors ).toHaveLength( 1 );
	} );

	it( 'should not report a class exported as a value', () => {
		const exportItem = createIndexExport( { exportKind: 'value', references: [ createDeclaration() ] } );

		const errors = validateClassExports( createLibrary( [ exportItem ] ) );

		expect( errors ).toHaveLength( 0 );
	} );

	it( 'should not report a type-only export of an interface', () => {
		const exportItem = createIndexExport( { references: [ createDeclaration( { type: 'interface' } ) ] } );

		const errors = validateClassExports( createLibrary( [ exportItem ] ) );

		expect( errors ).toHaveLength( 0 );
	} );

	it( 'should not report a type-only export of an ambient class (`declare class`)', () => {
		const exportItem = createIndexExport( { references: [ createDeclaration( { ambient: true } ) ] } );

		const errors = validateClassExports( createLibrary( [ exportItem ] ) );

		expect( errors ).toHaveLength( 0 );
	} );

	it( 'should not descend into references of a non-class declaration', () => {
		// An interface referencing a class (e.g. as a property type) must not be reported.
		const interfaceDeclaration = createDeclaration( { type: 'interface' } );

		interfaceDeclaration.references = [ createDeclaration() ];

		const exportItem = createIndexExport( { references: [ interfaceDeclaration ] } );

		const errors = validateClassExports( createLibrary( [ exportItem ] ) );

		expect( errors ).toHaveLength( 0 );
	} );

	it( 'should not report a type-only export without references', () => {
		const exportItem = createIndexExport( { references: null } );

		const errors = validateClassExports( createLibrary( [ exportItem ] ) );

		expect( errors ).toHaveLength( 0 );
	} );

	it( 'should handle circular references', () => {
		const firstExport = createIndexExport( {} );
		const secondExport = createIndexExport( {} );

		firstExport.references = [ secondExport ];
		secondExport.references = [ firstExport ];

		const errors = validateClassExports( createLibrary( [ firstExport ] ) );

		expect( errors ).toHaveLength( 0 );
	} );

	it( 'should skip a package without an index module', () => {
		const errors = validateClassExports( createLibrary( null ) );

		expect( errors ).toHaveLength( 0 );
	} );
} );
