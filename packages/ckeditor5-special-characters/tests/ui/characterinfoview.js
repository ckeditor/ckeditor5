/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import CharacterInfoView from '../../src/ui/characterinfoview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'CharacterInfoView', () => {
	let view;

	testUtils.createSinonSandbox();

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
				expect( view.character ).to.equal( null );
			} );
		} );

		describe( '#name', () => {
			it( 'is defined', () => {
				expect( view.name ).to.equal( null );
			} );
		} );

		describe( '#code', () => {
			it( 'is defined', () => {
				expect( view.code ).to.equal( '' );
			} );

			it( 'is bound to #character', () => {
				view.set( 'character', 'A' );

				expect( view.code ).to.equal( 'U+0041' );
			} );
		} );

		describe( '#element', () => {
			it( 'is being created from template', () => {
				expect( view.element.classList.contains( 'ck' ) ).to.be.true;
				expect( view.element.classList.contains( 'ck-character-info' ) ).to.be.true;

				expect( view.element.firstElementChild.classList.contains( 'ck-character-info__name' ) ).to.be.true;
				expect( view.element.lastElementChild.classList.contains( 'ck-character-info__code' ) ).to.be.true;
			} );

			it( 'is being updated when #code and #name have changed', () => {
				const infoEl = view.element.firstElementChild;
				const codeEl = view.element.lastElementChild;

				expect( infoEl.innerText ).to.equal( '\u200B' );
				expect( codeEl.innerText ).to.equal( '' );

				view.set( {
					character: 'A',
					name: 'SYMBOL: A'
				} );

				expect( infoEl.innerText ).to.equal( 'SYMBOL: A' );
				expect( codeEl.innerText ).to.equal( 'U+0041' );
			} );
		} );
	} );
} );
