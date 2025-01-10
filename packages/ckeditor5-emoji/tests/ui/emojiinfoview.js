/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import EmojiInfoView from '../../src/ui/emojiinfoview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'EmojiInfoView', () => {
	let view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new EmojiInfoView();
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		describe( '#emoji', () => {
			it( 'is defined', () => {
				expect( view.emoji ).to.equal( null );
			} );
		} );

		describe( '#name', () => {
			it( 'is defined', () => {
				expect( view.name ).to.equal( null );
			} );
		} );

		describe( '#element', () => {
			it( 'is being created from template', () => {
				expect( view.element.classList.contains( 'ck' ) ).to.be.true;
				expect( view.element.classList.contains( 'ck-emoji-info' ) ).to.be.true;

				expect( view.element.firstElementChild.classList.contains( 'ck-emoji-info__name' ) ).to.be.true;
			} );

			it( 'is being updated when #name have changed', () => {
				const infoEl = view.element.firstElementChild;

				expect( infoEl.innerText ).to.equal( '\u200B' );

				view.set( {
					emoji: 'A',
					name: 'SYMBOL: A'
				} );

				expect( infoEl.innerText ).to.equal( 'SYMBOL: A' );
			} );
		} );
	} );
} );
