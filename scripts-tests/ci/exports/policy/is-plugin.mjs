/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { isPluginClass } from '../../../../scripts/ci/exports/policy/is-plugin.mjs';
import { createClassDeclaration, createLibrary } from './_utils.mjs';

describe( 'scripts/ci/exports/policy/is-plugin', () => {
	it( 'should mark a class extending `Plugin` as a plugin class and a part of the public tree', () => {
		const declaration = createClassDeclaration( { baseClasses: [ 'Plugin' ] } );

		isPluginClass( createLibrary( [ declaration ] ) );

		expect( declaration.isPluginClass ).toBe( true );
		expect( declaration.isPublicTree ).toBe( true );
	} );

	it( 'should mark a class extending `ContextPlugin` as a plugin class', () => {
		const declaration = createClassDeclaration( { baseClasses: [ 'ContextPlugin' ] } );

		isPluginClass( createLibrary( [ declaration ] ) );

		expect( declaration.isPluginClass ).toBe( true );
	} );

	it( 'should mark references of a plugin class as a part of the public tree', () => {
		const reference = { references: [] };
		const declaration = createClassDeclaration( { baseClasses: [ 'Plugin' ], references: [ reference ] } );

		isPluginClass( createLibrary( [ declaration ] ) );

		expect( reference.isPublicTree ).toBe( true );
	} );

	it( 'should not mark an internal class', () => {
		const declaration = createClassDeclaration( { baseClasses: [ 'Plugin' ], internal: true } );

		isPluginClass( createLibrary( [ declaration ] ) );

		expect( declaration.isPluginClass ).toBeUndefined();
		expect( declaration.isPublicTree ).toBeUndefined();
	} );

	it( 'should not mark a class that does not extend `Plugin` or `ContextPlugin`', () => {
		const declaration = createClassDeclaration( { baseClasses: [ 'Command' ] } );

		isPluginClass( createLibrary( [ declaration ] ) );

		expect( declaration.isPluginClass ).toBeUndefined();
	} );

	it( 'should not mark a non-class declaration', () => {
		const declaration = { localName: 'Example', type: 'interface', baseClasses: [ 'Plugin' ], internal: false };

		isPluginClass( createLibrary( [ declaration ] ) );

		expect( declaration.isPluginClass ).toBeUndefined();
	} );
} );
