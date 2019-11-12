/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import SpecialCharacters from '../src/specialcharacters';
import SpecialCharactersUI from '../src/specialcharactersui';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'SpecialCharacters', () => {
	let plugin;

	beforeEach( () => {
		plugin = new SpecialCharacters( {} );
	} );

	it( 'should require Typing and SpecialCharactersUI', () => {
		expect( SpecialCharacters.requires ).to.deep.equal( [ Typing, SpecialCharactersUI ] );
	} );

	it( 'should be named', () => {
		expect( SpecialCharacters.pluginName ).to.equal( 'SpecialCharacters' );
	} );

	describe( 'addItems()', () => {
		it( 'adds special characters to the available symbols', () => {
			plugin.addItems( 'Arrows', [
				{ title: 'arrow left', character: '←' },
				{ title: 'arrow right', character: '→' }
			] );

			expect( plugin._groups.size ).to.equal( 1 );
			expect( plugin._groups.has( 'Arrows' ) ).to.equal( true );

			expect( plugin._characters.size ).to.equal( 2 );
			expect( plugin._characters.has( 'arrow left' ) ).to.equal( true );
			expect( plugin._characters.has( 'arrow right' ) ).to.equal( true );
		} );

		it( 'throw an error when a title is not a unique value', () => {
			expectToThrowCKEditorError( () => {
				plugin.addItems( 'Arrows', [
					{ title: 'arrow left', character: '←' },
					{ title: 'arrow left', character: '←' }
				] );
			}, /^specialcharacters-duplicated-character-name/ )
		} );
	} );

	describe( 'getGroups()', () => {
		it( 'returns iterator of defined groups', () => {
			plugin.addItems( 'Arrows', [
				{ title: 'arrow left', character: '←' }
			] );

			plugin.addItems( 'Mathematical', [
				{ title: 'precedes', character: '≺' },
				{ title: 'succeeds', character: '≻' }
			] );

			const groups = [ ...plugin.getGroups() ];
			expect( groups ).to.deep.equal( [ 'Arrows', 'Mathematical' ] );
		} );
	} );

	describe( 'getCharactersForGroup()', () => {
		it( 'returns a collection of defined special characters names', () => {
			plugin.addItems( 'Mathematical', [
				{ title: 'precedes', character: '≺' },
				{ title: 'succeeds', character: '≻' }
			] );

			const characters = plugin.getCharactersForGroup( 'Mathematical' );

			expect( characters.size ).to.equal( 2 );
			expect( characters.has( 'precedes' ) ).to.equal( true );
			expect( characters.has( 'succeeds' ) ).to.equal( true );
		} );

		it( 'returns undefined for non-existing group', () => {
			plugin.addItems( 'Mathematical', [
				{ title: 'precedes', character: '≺' },
				{ title: 'succeeds', character: '≻' }
			] );

			const characters = plugin.getCharactersForGroup( 'Foo' );

			expect( characters ).to.be.undefined;
		} );
	} );

	describe( 'getCharacter()', () => {
		it( 'returns a collection of defined special characters names', () => {
			plugin.addItems( 'Mathematical', [
				{ title: 'precedes', character: '≺' },
				{ title: 'succeeds', character: '≻' }
			] );

			expect( plugin.getCharacter( 'succeeds' ) ).to.equal( '≻' );
		} );

		it( 'returns undefined for non-existing character', () => {
			expect( plugin.getCharacter( 'succeeds' ) ).to.be.undefined;
		} );
	} );
} );
