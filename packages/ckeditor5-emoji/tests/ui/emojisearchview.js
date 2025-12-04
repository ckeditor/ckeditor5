/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EmojiSearchView } from '../../src/ui/emojisearchview.js';
import { SearchInfoView } from '@ckeditor/ckeditor5-ui';
import { EmojiGridView } from '../../src/ui/emojigridview.js';

describe( 'EmojiSearchView', () => {
	let locale, emojiSearchView, emojiCategories;

	beforeEach( () => {
		locale = {
			t: val => val
		};

		emojiCategories = [ {
			title: 'faces',
			icon: '😊',
			items: [
				{ 'annotation': 'grinning face', 'emoji': '😀', skins: { 'default': '😀' } }
			]
		}, {
			title: 'food',
			icon: '🍕',
			items: [
				{ 'annotation': 'grinning face', 'emoji': '😀', skins: { 'default': '😀' } }
			]
		}, {
			title: 'things',
			icon: '📕',
			items: []
		} ];

		const searchInfoView = new SearchInfoView();
		const emojiGridView = new EmojiGridView( locale, { emojiCategories, categoryName: 'faces', getEmojiByQuery: () => [
			{ 'annotation': 'grinning face', 'emoji': '😀', skins: { 'default': '😀' } }
		] } );

		emojiSearchView = new EmojiSearchView( locale, { gridView: emojiGridView, resultsView: searchInfoView } );
		emojiSearchView.render();
	} );

	afterEach( () => {
		emojiSearchView.destroy();
		vi.restoreAllMocks();
	} );

	describe( 'constructor()', () => {
		it( 'creates #element from template', () => {
			expect( Object.values( emojiSearchView.element.childNodes ).length ).toBe( 1 );

			const childNodes = emojiSearchView.element.childNodes;

			expect( childNodes.length ).toBe( 1 );
		} );

		it( 'delegates the #search event up for the search value', () => {
			const spy = vi.fn();

			emojiSearchView.on( 'search', spy );
			emojiSearchView.inputView.fire( 'search', {} );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'search()', () => {
		it( 'should delegate the search event to the inputView (non-empty query)', () => {
			const spy = vi.fn();
			const filterSpy = vi.spyOn( emojiSearchView.gridView, 'filter' );

			emojiSearchView.on( 'search', spy );
			emojiSearchView.search( 'faces' );

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( filterSpy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should delegate the search event to the inputView (empty query)', () => {
			const spy = vi.fn();
			const filterSpy = vi.spyOn( emojiSearchView.gridView, 'filter' );

			emojiSearchView.on( 'search', spy );
			emojiSearchView.search( '' );

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( filterSpy ).toHaveBeenCalledTimes( 1 );
			expect( filterSpy ).toHaveBeenCalledWith( null );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the search bar', () => {
			const spy = vi.spyOn( emojiSearchView.inputView, 'focus' );

			emojiSearchView.focus();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy an instance of the search view', () => {
			const spy = vi.spyOn( emojiSearchView.inputView, 'destroy' );

			emojiSearchView.destroy();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'setInputValue()', () => {
		it( 'sets the value of text input element to passed string', () => {
			emojiSearchView.setInputValue( 'smile' );

			expect( emojiSearchView.element.querySelector( 'input' ).value ).toBe( 'smile' );
		} );

		it( 'sets the value of text input element to an empty value', () => {
			emojiSearchView.setInputValue( 'smile' );

			expect( emojiSearchView.element.querySelector( 'input' ).value ).toBe( 'smile' );

			emojiSearchView.setInputValue( '' );

			expect( emojiSearchView.element.querySelector( 'input' ).value ).toBe( '' );
		} );
	} );

	describe( 'getInputValue()', () => {
		it( 'returns a value provided in the input', () => {
			emojiSearchView.inputView.queryView.fieldView.element.value = 'smile';

			expect( emojiSearchView.getInputValue() ).toBe( 'smile' );
		} );
	} );
} );
