/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { SpecialCharacters } from '../src/specialcharacters.js';
import { SpecialCharactersLatin } from '../src/specialcharacterslatin.js';

describe( 'SpecialCharactersLatin', () => {
	let editor, editorElement, addItemsSpy, addItemsFirstCallArgs;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );

		addItemsSpy = vi.spyOn( SpecialCharacters.prototype, 'addItems' );

		document.body.appendChild( editorElement );
		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ SpecialCharacters, SpecialCharactersLatin ]
			} )
			.then( newEditor => {
				editor = newEditor;
				addItemsFirstCallArgs = addItemsSpy.mock.calls[ 0 ];
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( SpecialCharactersLatin.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( SpecialCharactersLatin.isPremiumPlugin ).toBe( false );
	} );

	it( 'adds new items', () => {
		expect( addItemsSpy ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'properly names the category', () => {
		expect( addItemsFirstCallArgs[ 0 ] ).toBe( 'Latin' );
	} );

	it( 'defines a label displayed in the toolbar', () => {
		expect( addItemsFirstCallArgs[ 2 ] ).toEqual( {
			label: 'Latin'
		} );
	} );

	it( 'adds proper characters', () => {
		expect( addItemsFirstCallArgs[ 1 ] ).toContainEqual( {
			character: 'Ō',
			title: 'Latin capital letter o with macron'
		} );

		expect( addItemsFirstCallArgs[ 1 ] ).toContainEqual( {
			character: 'Ō',
			title: 'Latin capital letter o with macron'
		} );
	} );
} );
