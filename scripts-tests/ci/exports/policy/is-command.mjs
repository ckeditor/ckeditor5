/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { isCommandClass } from '../../../../scripts/ci/exports/policy/is-command.mjs';
import { createClassDeclaration, createLibrary } from './_utils.mjs';

describe( 'scripts/ci/exports/policy/is-command', () => {
	it( 'should mark a class extending `Command` as a command class and a part of the public tree', () => {
		const declaration = createClassDeclaration( { baseClasses: [ 'Command' ] } );

		isCommandClass( createLibrary( [ declaration ] ) );

		expect( declaration.isCommandClass ).toBe( true );
		expect( declaration.isPublicTree ).toBe( true );
	} );

	it( 'should mark a class with `Command` anywhere in the base classes chain', () => {
		const declaration = createClassDeclaration( { baseClasses: [ 'ExampleCommandBase', 'Command' ] } );

		isCommandClass( createLibrary( [ declaration ] ) );

		expect( declaration.isCommandClass ).toBe( true );
	} );

	it( 'should mark references of a command class as a part of the public tree', () => {
		const reference = { references: [] };
		const declaration = createClassDeclaration( { baseClasses: [ 'Command' ], references: [ reference ] } );

		isCommandClass( createLibrary( [ declaration ] ) );

		expect( reference.isPublicTree ).toBe( true );
	} );

	it( 'should not mark an internal class', () => {
		const declaration = createClassDeclaration( { baseClasses: [ 'Command' ], internal: true } );

		isCommandClass( createLibrary( [ declaration ] ) );

		expect( declaration.isCommandClass ).toBeUndefined();
		expect( declaration.isPublicTree ).toBeUndefined();
	} );

	it( 'should not mark a class that does not extend `Command`', () => {
		const declaration = createClassDeclaration( { baseClasses: [ 'Plugin' ] } );

		isCommandClass( createLibrary( [ declaration ] ) );

		expect( declaration.isCommandClass ).toBeUndefined();
	} );

	it( 'should not mark a non-class declaration', () => {
		const declaration = { localName: 'ExampleCommand', type: 'interface', baseClasses: [ 'Command' ], internal: false };

		isCommandClass( createLibrary( [ declaration ] ) );

		expect( declaration.isCommandClass ).toBeUndefined();
	} );
} );
