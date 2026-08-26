/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CharacterInfoView } from '../../src/ui/characterinfoview.js';

describe( 'CharacterInfoView', () => {
	let view;

	beforeEach( () => {
		view = new CharacterInfoView();
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		describe( '#character', () => {
			it( 'is defined', () => {
				expect( view.character ).toEqual( null );
			} );
		} );

		describe( '#name', () => {
			it( 'is defined', () => {
				expect( view.name ).toEqual( null );
			} );
		} );

		describe( '#code', () => {
			it( 'is defined', () => {
				expect( view.code ).toEqual( '' );
			} );

			it( 'is bound to #character', () => {
				view.set( 'character', 'A' );

				expect( view.code ).toEqual( 'U+0041' );
			} );
		} );

		describe( '#element', () => {
			it( 'is being created from template', () => {
				expect( view.element.classList.contains( 'ck' ) ).toBe( true );
				expect( view.element.classList.contains( 'ck-character-info' ) ).toBe( true );

				expect( view.element.firstElementChild.classList.contains( 'ck-character-info__name' ) ).toBe( true );
				expect( view.element.lastElementChild.classList.contains( 'ck-character-info__code' ) ).toBe( true );
			} );

			it( 'is being updated when #code and #name have changed', () => {
				const infoEl = view.element.firstElementChild;
				const codeEl = view.element.lastElementChild;

				expect( infoEl.innerText ).toEqual( '\u200B' );
				expect( codeEl.innerText ).toEqual( '' );

				view.set( {
					character: 'A',
					name: 'SYMBOL: A'
				} );

				expect( infoEl.innerText ).toEqual( 'SYMBOL: A' );
				expect( codeEl.innerText ).toEqual( 'U+0041' );
			} );
		} );
	} );
} );
