/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document setTimeout Event KeyboardEvent */

import { ContextualBalloon, Dialog } from 'ckeditor5/src/ui.js';
import { EmojiPicker } from '../src/index.js';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'EmojiPicker', () => {
	let editor, editorElement, emojiPicker;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		await ClassicEditor
			.create( editorElement, {
				plugins: [ EmojiPicker, Essentials, Paragraph ],
				toolbar: [ 'emoji' ],
				menuBar: {
					isVisible: true
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				emojiPicker = newEditor.plugins.get( EmojiPicker );
			} );
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should be correctly named', () => {
		expect( EmojiPicker.pluginName ).to.equal( 'EmojiPicker' );
	} );

	it( 'should have proper "requires" value', () => {
		expect( EmojiPicker.requires ).to.deep.equal( [
			ContextualBalloon, Typing, Dialog
		] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmojiPicker.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( EmojiPicker.isPremiumPlugin ).to.be.false;
	} );

	it( 'should open the picker when clicking the toolbar button', async () => {
		clickEmojiToolbarButton();

		const emojiGrid = document.querySelector( '.ck-emoji-grid__tiles' );

		expect( emojiGrid.checkVisibility() ).to.equal( true );
	} );

	it( 'should open the picker when clicking the menu bar button', async () => {
		const insertMenuBarButton = Array.from( document.querySelectorAll( '.ck-menu-bar__menu__button' ) )
			.find( button => button.innerText === 'Insert' );

		insertMenuBarButton.click();

		const emojiMenuBarButton = Array.from( document.querySelectorAll( '.ck-menu-bar__menu__item__button' ) )
			.find( button => button.innerText === 'Emoji' );

		emojiMenuBarButton.click();

		const emojiGrid = document.querySelector( '.ck-emoji-grid__tiles' );

		expect( emojiGrid.checkVisibility() ).to.equal( true );
	} );

	it( 'should have the "Nothing found" message hidden after opening the picker by default', async () => {
		clickEmojiToolbarButton();

		expect(
			document.querySelector( '.ck.ck-emoji-nothing-found' ).classList.contains( 'hidden' )
		).to.equal( true );
	} );

	it( 'should insert an emoji after clicking on it in the picker', async () => {
		expect( getModelData( editor.model ) ).to.equal( '<paragraph>[]</paragraph>' );

		clickEmojiToolbarButton();

		const firstEmojiInGrid = document.querySelector( '.ck-emoji-grid__tiles > button' );

		firstEmojiInGrid.click();

		expect( getModelData( editor.model ) ).to.equal( '<paragraph>😀[]</paragraph>' );
	} );

	it( 'should close the picker when clicking outside of it', async () => {
		clickEmojiToolbarButton();

		const firstEmojiInGrid = document.querySelector( '.ck-emoji-grid__tiles > button' );
		expect( firstEmojiInGrid.checkVisibility() ).to.equal( true );

		document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

		expect( firstEmojiInGrid.checkVisibility() ).to.equal( false );
	} );

	it( 'should close the picker when focus is on the picker and escape is clicked', async () => {
		clickEmojiToolbarButton();

		const emojiSearchBar = document.querySelector( '.ck-emoji-input input' );
		expect( emojiSearchBar.checkVisibility() ).to.equal( true );

		emojiSearchBar.dispatchEvent( new KeyboardEvent( 'keydown', { bubbles: true, composed: true, key: 'Escape' } ) );

		expect( emojiSearchBar.checkVisibility() ).to.equal( false );
	} );

	it( 'should update the grid when search query changes', async () => {
		clickEmojiToolbarButton();

		const originalFirstEmojiInGridTitle = document.querySelector( '.ck-emoji-grid__tiles > button' ).title;

		const emojiSearchBar = document.querySelector( '.ck-emoji-input input' );
		emojiSearchBar.value = 'frown';
		emojiSearchBar.dispatchEvent( new Event( 'input' ) );

		// Wait for the emojis to load.
		await new Promise( resolve => setTimeout( resolve, 250 ) );

		const newFirstEmojiInGridTitle = document.querySelector( '.ck-emoji-grid__tiles > button' ).title;

		expect( originalFirstEmojiInGridTitle ).to.not.equal( newFirstEmojiInGridTitle );
	} );

	it( 'should update the grid when category changes', async () => {
		clickEmojiToolbarButton();

		const originalFirstEmojiInGridTitle = document.querySelector( '.ck-emoji-grid__tiles > button' ).title;

		const secondCategoryButton = document.querySelectorAll( '.ck-emoji-categories > button' )[ 1 ];
		secondCategoryButton.click();

		// Wait for the emojis to load.
		await new Promise( resolve => setTimeout( resolve, 250 ) );

		const newFirstEmojiInGridTitle = document.querySelector( '.ck-emoji-grid__tiles > button' ).title;

		expect( originalFirstEmojiInGridTitle ).to.not.equal( newFirstEmojiInGridTitle );
	} );

	it( 'should load previous category after reopening the emoji picker', async () => {
		clickEmojiToolbarButton();

		const secondCategoryButton = document.querySelectorAll( '.ck-emoji-categories > button' )[ 1 ];
		secondCategoryButton.click();

		// Wait for the emojis to load.
		await new Promise( resolve => setTimeout( resolve, 250 ) );

		// Close the emoji picker.
		document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

		clickEmojiToolbarButton();

		const secondCategoryButtonAfterReopen = document.querySelectorAll( '.ck-emoji-categories > button' )[ 1 ];

		expect( [ ...secondCategoryButtonAfterReopen.classList ] ).to.include( 'ck-active-category' );
	} );

	it( 'should update the grid when skin tone changes', async () => {
		clickEmojiToolbarButton();

		const secondCategoryButton = document.querySelectorAll( '.ck-emoji-categories > button' )[ 1 ];
		secondCategoryButton.click();

		// Wait for the emojis to load.
		await new Promise( resolve => setTimeout( resolve, 250 ) );

		const originalFirstEmojiInGrid = document.querySelector( '.ck-emoji-grid__tiles > button' );
		const originalFirstEmojiInGridTitle = originalFirstEmojiInGrid.title;
		const originalFirstEmojiInGridText = originalFirstEmojiInGrid.innerText;

		const skinToneDropdown = document.querySelector( '.ck-emoji-tone button' );
		skinToneDropdown.click();

		const lastSkinToneButton = Array.from( document.querySelectorAll( '.ck-emoji-tone .ck-dropdown__panel button' ) ).at( -1 );
		lastSkinToneButton.click();

		// Wait for the emojis to load.
		await new Promise( resolve => setTimeout( resolve, 250 ) );

		const newFirstEmojiInGrid = document.querySelector( '.ck-emoji-grid__tiles > button' );
		const newFirstEmojiInGridTitle = newFirstEmojiInGrid.title;
		const newFirstEmojiInGridText = newFirstEmojiInGrid.innerText;

		// Title stays the same as the emojis are the same.
		expect( originalFirstEmojiInGridTitle ).to.equal( newFirstEmojiInGridTitle );
		// Inner text changes as the emojis are different skin tone variants.
		expect( originalFirstEmojiInGridText ).to.not.equal( newFirstEmojiInGridText );
	} );

	it( 'should show emoji info on the bottom panel when an emoji in the grid is hovered', async () => {
		clickEmojiToolbarButton();

		const spy = sinon.spy( emojiPicker._emojiPickerView.infoView, 'set' );

		sinon.assert.notCalled( spy );

		emojiPicker._emojiPickerView.gridView.fire( 'tileHover' );

		sinon.assert.calledOnce( spy );
	} );

	it( 'should show emoji info on the bottom panel when an emoji in the grid is focused', async () => {
		clickEmojiToolbarButton();

		const spy = sinon.spy( emojiPicker._emojiPickerView.infoView, 'set' );

		sinon.assert.notCalled( spy );

		emojiPicker._emojiPickerView.gridView.fire( 'tileFocus' );

		sinon.assert.calledOnce( spy );
	} );

	describe( 'fake visual selection', () => {
		describe( 'non-collapsed', () => {
			it( 'should be displayed when a text fragment is selected', () => {
				setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

				emojiPicker.showUI();

				expect( editor.model.markers.has( 'emoji-picker' ) ).to.be.true;

				const paragraph = editor.model.document.getRoot().getChild( 0 );
				const expectedRange = editor.model.createRange(
					editor.model.createPositionAt( paragraph, 1 ),
					editor.model.createPositionAt( paragraph, 2 )
				);
				const markerRange = editor.model.markers.get( 'emoji-picker' ).getRange();

				expect( markerRange.isEqual( expectedRange ) ).to.be.true;

				expect( getViewData( editor.editing.view ) ).to.equal( '<p>f{<span class="ck-fake-emoji-selection">o</span>}o</p>' );
				expect( editor.getData() ).to.equal( '<p>foo</p>' );
			} );

			it( 'should display a fake visual selection on the next non-empty text node when selection starts at the end ' +
						'of the empty block in the multiline selection', () => {
				setModelData( editor.model, '<paragraph>[</paragraph><paragraph>foo]</paragraph>' );

				emojiPicker.showUI();

				expect( editor.model.markers.has( 'emoji-picker' ) ).to.be.true;

				const secondParagraph = editor.model.document.getRoot().getChild( 1 );
				const expectedRange = editor.model.createRange(
					editor.model.createPositionAt( secondParagraph, 0 ),
					editor.model.createPositionAt( secondParagraph, 3 )
				);

				const markerRange = editor.model.markers.get( 'emoji-picker' ).getRange();

				expect( markerRange.isEqual( expectedRange ) ).to.be.true;

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<p>[</p><p><span class="ck-fake-emoji-selection">foo</span>]</p>'
				);
				expect( editor.getData() ).to.equal( '<p>&nbsp;</p><p>foo</p>' );
			} );

			it( 'should display a fake visual selection on the next non-empty text node when selection starts at the end ' +
						'of the first block in the multiline selection', () => {
				setModelData( editor.model, '<paragraph>foo[</paragraph><paragraph>bar]</paragraph>' );

				emojiPicker.showUI();

				expect( editor.model.markers.has( 'emoji-picker' ) ).to.be.true;

				const secondParagraph = editor.model.document.getRoot().getChild( 1 );
				const expectedRange = editor.model.createRange(
					editor.model.createPositionAt( secondParagraph, 0 ),
					editor.model.createPositionAt( secondParagraph, 3 )
				);

				const markerRange = editor.model.markers.get( 'emoji-picker' ).getRange();

				expect( markerRange.isEqual( expectedRange ) ).to.be.true;

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<p>foo{</p><p><span class="ck-fake-emoji-selection">bar</span>]</p>'
				);
				expect( editor.getData() ).to.equal( '<p>foo</p><p>bar</p>' );
			} );

			it( 'should be displayed on first text node in non-empty element when selection contains few empty elements', () => {
				setModelData( editor.model, [
					'<paragraph>foo[</paragraph>',
					'<paragraph></paragraph>',
					'<paragraph></paragraph>',
					'<paragraph>bar</paragraph>',
					'<paragraph></paragraph>',
					'<paragraph></paragraph>',
					'<paragraph>]baz</paragraph>'
				].join( '' ) );

				emojiPicker.showUI();

				expect( editor.model.markers.has( 'emoji-picker' ) ).to.be.true;

				const firstNonEmptyElementInTheSelection = editor.model.document.getRoot().getChild( 3 );
				const rangeEnd = editor.model.document.selection.getFirstRange().end;
				const expectedRange = editor.model.createRange(
					editor.model.createPositionAt( firstNonEmptyElementInTheSelection, 0 ),
					editor.model.createPositionAt( rangeEnd, 0 )
				);

				const markerRange = editor.model.markers.get( 'emoji-picker' ).getRange();

				expect( markerRange.isEqual( expectedRange ) ).to.be.true;

				const expectedViewData = [
					'<p>foo{</p>',
					'<p></p>',
					'<p></p>',
					'<p><span class="ck-fake-emoji-selection">bar</span></p>',
					'<p></p>',
					'<p></p>',
					'<p>}baz</p>'
				].join( '' );

				expect( getViewData( editor.editing.view ) ).to.equal( expectedViewData );
				expect( editor.getData() ).to.equal( [
					'<p>foo</p>',
					'<p>&nbsp;</p><p>&nbsp;</p>',
					'<p>bar</p>',
					'<p>&nbsp;</p><p>&nbsp;</p>',
					'<p>baz</p>'
				].join( '' ) );
			} );
		} );

		describe( 'collapsed', () => {
			it( 'should be displayed on a collapsed selection', () => {
				setModelData( editor.model, '<paragraph>f[]o</paragraph>' );

				emojiPicker.showUI();

				expect( editor.model.markers.has( 'emoji-picker' ) ).to.be.true;

				const paragraph = editor.model.document.getRoot().getChild( 0 );
				const expectedRange = editor.model.createRange(
					editor.model.createPositionAt( paragraph, 1 ),
					editor.model.createPositionAt( paragraph, 1 )
				);
				const markerRange = editor.model.markers.get( 'emoji-picker' ).getRange();

				expect( markerRange.isEqual( expectedRange ) ).to.be.true;

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<p>f{}<span class="ck-fake-emoji-selection ck-fake-emoji-selection_collapsed"></span>o</p>'
				);
				expect( editor.getData() ).to.equal( '<p>fo</p>' );
			} );

			it( 'should be displayed on selection focus when selection contains only one empty element ' +
						'(selection focus is at the beginning of the first non-empty element)', () => {
				setModelData( editor.model, [
					'<paragraph>foo[</paragraph>',
					'<paragraph></paragraph>',
					'<paragraph>]bar</paragraph>'
				].join( '' ) );

				emojiPicker.showUI();

				expect( editor.model.markers.has( 'emoji-picker' ) ).to.be.true;

				const focus = editor.model.document.selection.focus;
				const expectedRange = editor.model.createRange(
					editor.model.createPositionAt( focus, 0 )
				);

				const markerRange = editor.model.markers.get( 'emoji-picker' ).getRange();

				expect( markerRange.isEqual( expectedRange ) ).to.be.true;

				const expectedViewData = [
					'<p>foo{</p>',
					'<p></p>',
					'<p>]<span class="ck-fake-emoji-selection ck-fake-emoji-selection_collapsed"></span>bar</p>'
				].join( '' );

				expect( getViewData( editor.editing.view ) ).to.equal( expectedViewData );
				expect( editor.getData() ).to.equal( '<p>foo</p><p>&nbsp;</p><p>bar</p>' );
			} );

			it( 'should be displayed on selection focus when selection contains few empty elements ' +
						'(selection focus is at the beginning of the first non-empty element)', () => {
				setModelData( editor.model, [
					'<paragraph>foo[</paragraph>',
					'<paragraph></paragraph>',
					'<paragraph></paragraph>',
					'<paragraph>]bar</paragraph>'
				].join( '' ) );

				emojiPicker.showUI();

				expect( editor.model.markers.has( 'emoji-picker' ) ).to.be.true;

				const focus = editor.model.document.selection.focus;
				const expectedRange = editor.model.createRange(
					editor.model.createPositionAt( focus, 0 )
				);

				const markerRange = editor.model.markers.get( 'emoji-picker' ).getRange();

				expect( markerRange.isEqual( expectedRange ) ).to.be.true;

				const expectedViewData = [
					'<p>foo{</p>',
					'<p></p>',
					'<p></p>',
					'<p>]<span class="ck-fake-emoji-selection ck-fake-emoji-selection_collapsed"></span>bar</p>'
				].join( '' );

				expect( getViewData( editor.editing.view ) ).to.equal( expectedViewData );
				expect( editor.getData() ).to.equal( '<p>foo</p><p>&nbsp;</p><p>&nbsp;</p><p>bar</p>' );
			} );

			it( 'should be displayed on selection focus when selection contains few empty elements ' +
						'(selection focus is inside an empty element)', () => {
				setModelData( editor.model, [
					'<paragraph>foo[</paragraph>',
					'<paragraph></paragraph>',
					'<paragraph>]</paragraph>',
					'<paragraph>bar</paragraph>'
				].join( '' ) );

				emojiPicker.showUI();

				expect( editor.model.markers.has( 'emoji-picker' ) ).to.be.true;

				const focus = editor.model.document.selection.focus;
				const expectedRange = editor.model.createRange(
					editor.model.createPositionAt( focus, 0 )
				);

				const markerRange = editor.model.markers.get( 'emoji-picker' ).getRange();

				expect( markerRange.isEqual( expectedRange ) ).to.be.true;

				const expectedViewData = [
					'<p>foo{</p>',
					'<p></p>',
					'<p>]<span class="ck-fake-emoji-selection ck-fake-emoji-selection_collapsed"></span></p>',
					'<p>bar</p>'
				].join( '' );

				expect( getViewData( editor.editing.view ) ).to.equal( expectedViewData );
				expect( editor.getData() ).to.equal( '<p>foo</p><p>&nbsp;</p><p>&nbsp;</p><p>bar</p>' );
			} );
		} );
	} );
} );

function clickEmojiToolbarButton() {
	const emojiToolbarButton = document.querySelector( 'button[data-cke-tooltip-text="Emoji"]' );

	emojiToolbarButton.click();
}
