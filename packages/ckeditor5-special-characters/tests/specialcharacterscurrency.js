/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { SpecialCharacters } from '../src/specialcharacters.js';
import { SpecialCharactersCurrency } from '../src/specialcharacterscurrency.js';

describe( 'SpecialCharactersCurrency', () => {
	let editor, editorElement, addItemsSpy, addItemsFirstCallArgs;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );

		addItemsSpy = vi.spyOn( SpecialCharacters.prototype, 'addItems' );

		document.body.appendChild( editorElement );
		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ SpecialCharacters, SpecialCharactersCurrency ]
			} )
			.then( newEditor => {
				editor = newEditor;
				addItemsFirstCallArgs = addItemsSpy.mock.calls[ 0 ];
			} );
	} );

	afterEach( () => {
		vi.restoreAllMocks();

		editorElement.remove();
		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( SpecialCharactersCurrency.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( SpecialCharactersCurrency.isPremiumPlugin ).toBe( false );
	} );

	it( 'adds new items', () => {
		expect( addItemsSpy ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'properly names the category', () => {
		expect( addItemsFirstCallArgs[ 0 ] ).toEqual( 'Currency' );
	} );

	it( 'defines a label displayed in the toolbar', () => {
		expect( addItemsFirstCallArgs[ 2 ] ).toEqual( {
			label: 'Currency'
		} );
	} );

	it( 'adds proper characters', () => {
		expect( addItemsFirstCallArgs[ 1 ] ).toContainEqual( expect.objectContaining( {
			character: '¢',
			title: 'Cent sign'
		} ) );

		expect( addItemsFirstCallArgs[ 1 ] ).toContainEqual( expect.objectContaining( {
			character: '₿',
			title: 'Bitcoin sign'
		} ) );
	} );
} );
