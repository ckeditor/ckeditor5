/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ContextualBalloon, Dialog, ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import { _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { keyCodes } from '@ckeditor/ckeditor5-utils';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import { EmojiPicker } from '../src/emojipicker.js';
import { EmojiRepository } from '../src/emojirepository.js';
import { EmojiCommand } from '../src/emojicommand.js';
import { EmojiPickerFormView } from '../src/ui/emojipickerformview.js';

function mockEmojiRepositoryValues( editor ) {
	const repository = editor.plugins.get( 'EmojiRepository' );

	repository.getEmojiByQuery = vi.fn();

	repository.getEmojiCategories = vi.fn().mockReturnValue( [
		{
			title: 'Smileys & Expressions',
			icon: '😀',
			items: []
		},
		{
			title: 'Food & Drinks',
			icon: '🍎',
			items: []
		}
	] );

	repository.getSkinTones = vi.fn().mockReturnValue( [
		{ id: 'default', icon: '👋', tooltip: 'Default skin tone' },
		{ id: 'medium', icon: '👋🏽', tooltip: 'Medium skin tone' },
		{ id: 'dark', icon: '👋🏿', tooltip: 'Dark skin tone' }
	] );
}

describe( 'EmojiPicker', () => {
	let editor, editorElement, emojiPicker, fetchStub;

	beforeEach( async () => {
		EmojiRepository._results = {};

		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		const exampleRepositoryEntry = {
			shortcodes: [
				'grinning'
			],
			annotation: 'grinning face',
			tags: [],
			emoji: '😀',
			order: 1,
			group: 0,
			version: 1
		};

		fetchStub = vi.fn().mockImplementation( () => {
			return new Promise( resolve => {
				const results = JSON.stringify( [ exampleRepositoryEntry ] );

				resolve( new Response( results ) );
			} );
		} );

		vi.spyOn( window, 'fetch' ).mockImplementation( ( ...args ) => fetchStub( ...args ) );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ EmojiPicker, Essentials, Paragraph ],
			toolbar: [ 'emoji' ],
			menuBar: {
				isVisible: true
			}
		} );

		mockEmojiRepositoryValues( editor );

		emojiPicker = editor.plugins.get( EmojiPicker );
	} );

	afterEach( async () => {
		vi.restoreAllMocks();

		await editor.destroy();
		editorElement.remove();
	} );

	it( 'should be correctly named', () => {
		expect( EmojiPicker.pluginName ).toBe( 'EmojiPicker' );
	} );

	it( 'should have proper "requires" value', () => {
		expect( EmojiPicker.requires ).toEqual( [
			EmojiRepository, ContextualBalloon, Dialog, Typing
		] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmojiPicker.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( EmojiPicker.isPremiumPlugin ).toBe( false );
	} );

	describe( 'command', () => {
		it( 'should register emoji command', () => {
			const command = editor.commands.get( 'emoji' );

			expect( command ).toBeInstanceOf( EmojiCommand );
		} );
	} );

	describe( '#skinTone', () => {
		it( 'should return the value from configuration if the UI is not ready yet (configuration not provided)', () => {
			expect( emojiPicker.skinTone ).toBe( 'default' );
		} );

		it( 'should return the value from configuration if the UI is not ready yet (configuration provided)', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			// As the data are shored between editors creation, let's manually clear it before creating a new editor.
			EmojiRepository._results = {};

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiPicker, Essentials, Paragraph ],
				emoji: {
					skinTone: 'medium'
				}
			} );

			mockEmojiRepositoryValues( editor );

			expect( editor.plugins.get( EmojiPicker ).skinTone ).toBe( 'medium' );

			await editor.destroy();
			editorElement.remove();
		} );

		it( 'should read the selected skin tone from the view when it is ready', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			// As the data are shored between editors creation, let's manually clear it before creating a new editor.
			EmojiRepository._results = {};

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiPicker, Essentials, Paragraph ],
				emoji: {
					skinTone: 'medium'
				}
			} );

			mockEmojiRepositoryValues( editor );

			const emojiPicker = editor.plugins.get( EmojiPicker );
			emojiPicker.showUI();
			emojiPicker._hideUI();
			emojiPicker.emojiPickerView.gridView.skinTone = 'dark';

			expect( editor.plugins.get( EmojiPicker ).skinTone ).toBe( 'dark' );

			await editor.destroy();
			editorElement.remove();
		} );
	} );

	describe( '_createButton()', () => {
		describe( 'a toolbar icon', () => {
			it( 'should provide the "emoji" toolbar component', () => {
				expect( editor.ui.componentFactory.has( 'emoji' ) ).toBe( true );

				const toolbarButton = editor.ui.componentFactory.create( 'emoji' );
				expect( toolbarButton ).toBeInstanceOf( ButtonView );

				const showUISpy = vi.spyOn( emojiPicker, 'showUI' );

				toolbarButton.fire( 'execute' );

				expect( showUISpy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should scroll to the selection when the "emoji" toolbar component is executed', () => {
				const scrollSpy = vi.spyOn( editor.editing.view, 'scrollToTheSelection' );

				const toolbarButton = editor.ui.componentFactory.create( 'emoji' );

				toolbarButton.fire( 'execute' );

				expect( scrollSpy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should scroll to the selection when the "menuBar:emoji" toolbar component is executed', () => {
				const scrollSpy = vi.spyOn( editor.editing.view, 'scrollToTheSelection' );

				const toolbarButton = editor.ui.componentFactory.create( 'menuBar:emoji' );

				toolbarButton.fire( 'execute' );

				expect( scrollSpy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should provide the "menuBar:emoji" toolbar component', () => {
				expect( editor.ui.componentFactory.has( 'menuBar:emoji' ) ).toBe( true );

				expect( editor.ui.componentFactory.create( 'menuBar:emoji' ) ).toBeInstanceOf( MenuBarMenuListItemButtonView );
			} );

			it( 'must not register the "emoji" toolbar component if emoji repository is not ready', async () => {
				const editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
				fetchStub.mockRejectedValue( 'Failed to load CDN.' );

				// As the data are shored between editors creation, let's manually clear it before creating a new editor.
				EmojiRepository._results = {};

				const editor = await ClassicTestEditor.create( editorElement, {
					plugins: [ EmojiPicker, Paragraph, Essentials ]
				} );

				expect( editor.ui.componentFactory.has( 'emoji' ) ).toBe( false );

				await editor.destroy();
				editorElement.remove();
			} );

			it( 'should disable the button when editor switches to the read-only mode', () => {
				expect( editor.ui.componentFactory.has( 'emoji' ) ).toBe( true );

				const toolbarButton = editor.ui.componentFactory.create( 'emoji' );

				expect( toolbarButton.isEnabled ).toBe( true );
				editor.enableReadOnlyMode( 'testing-purposes' );
				expect( toolbarButton.isEnabled ).toBe( false );
				editor.disableReadOnlyMode( 'testing-purposes' );
				expect( toolbarButton.isEnabled ).toBe( true );
			} );
		} );

		describe( 'a menu bar item', () => {
			it( 'should provide the "menuBar:emoji" toolbar component', async () => {
				expect( editor.ui.componentFactory.has( 'menuBar:emoji' ) ).toBe( true );

				expect( editor.ui.componentFactory.create( 'menuBar:emoji' ) ).toBeInstanceOf( MenuBarMenuListItemButtonView );
			} );

			it( 'must not register the "menuBar:emoji" toolbar component if emoji repository is not ready', async () => {
				const editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
				fetchStub.mockRejectedValue( 'Failed to load CDN.' );

				// As the data are shored between editors creation, let's manually clear it before creating a new editor.
				EmojiRepository._results = {};

				const editor = await ClassicTestEditor.create( editorElement, {
					plugins: [ EmojiPicker, Paragraph, Essentials ]
				} );

				expect( editor.ui.componentFactory.has( 'menuBar:emoji' ) ).toBe( false );

				await editor.destroy();
				editorElement.remove();
			} );

			it( 'should disable the menu bar item when editor switches to the read-only mode', () => {
				expect( editor.ui.componentFactory.has( 'menuBar:emoji' ) ).toBe( true );

				const toolbarButton = editor.ui.componentFactory.create( 'menuBar:emoji' );

				expect( toolbarButton.isEnabled ).toBe( true );
				editor.enableReadOnlyMode( 'testing-purposes' );
				expect( toolbarButton.isEnabled ).toBe( false );
				editor.disableReadOnlyMode( 'testing-purposes' );
				expect( toolbarButton.isEnabled ).toBe( true );
			} );
		} );
	} );

	describe( 'showUI()', () => {
		it( 'should read categories from the repository plugin when creating UI', () => {
			const repository = editor.plugins.get( 'EmojiRepository' );
			const getEmojiCategories = vi.spyOn( repository, 'getEmojiCategories' );

			emojiPicker.showUI();

			expect( getEmojiCategories ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should read skin tones from the repository plugin when creating UI', () => {
			const repository = editor.plugins.get( 'EmojiRepository' );
			const getSkinTones = vi.spyOn( repository, 'getSkinTones' );

			emojiPicker.showUI();

			expect( getSkinTones ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should pass the specified query to the UI view', () => {
			const repository = editor.plugins.get( 'EmojiRepository' );
			const getEmojiByQuery = vi.spyOn( repository, 'getEmojiByQuery' ).mockReturnValue( [] );

			emojiPicker.showUI( 'query' );

			expect( emojiPicker.emojiPickerView.searchView.inputView.queryView.fieldView.value ).toBe( 'query' );
			expect( getEmojiByQuery ).toHaveBeenCalledTimes( 1 );
			expect( getEmojiByQuery.mock.calls[ 0 ][ 0 ] ).toBe( 'query' );
		} );

		it( 'should add the emoji UI view to the `ContextualBalloon` plugin when opens UI', () => {
			expect( emojiPicker.balloonPlugin.visibleView ).toBe( null );

			emojiPicker.showUI();

			expect( emojiPicker.balloonPlugin.visibleView ).toBeInstanceOf( EmojiPickerFormView );
		} );

		it( 'should focus the query input when opens UI', async () => {
			emojiPicker.showUI();

			expect( document.activeElement ).toBe( emojiPicker.emojiPickerView.searchView.inputView.queryView.fieldView.element );
		} );

		it( 'should insert an emoji after clicking on it in the picker', () => {
			expect( _getModelData( editor.model ) ).toBe( '<paragraph>[]</paragraph>' );

			emojiPicker.showUI();
			emojiPicker.emojiPickerView.gridView.fire( 'execute', { emoji: '😀' } );

			expect( _getModelData( editor.model ) ).toBe( '<paragraph>😀[]</paragraph>' );
		} );

		it( 'should remove fake visual selection marker before inserting the emoji', () => {
			expect( _getModelData( editor.model ) ).toBe( '<paragraph>[]</paragraph>' );

			emojiPicker.showUI();

			editor.commands.get( 'insertText' ).once( 'execute', () => {
				expect( editor.model.markers.has( 'emoji-picker' ) ).toBe( false );
			} );

			emojiPicker.emojiPickerView.gridView.fire( 'execute', { emoji: '😀' } );

			expect( _getModelData( editor.model ) ).toBe( '<paragraph>😀[]</paragraph>' );
		} );

		it( 'should use the "insertText" command when inserting the emoji', () => {
			const spy = vi.fn();

			editor.commands.get( 'insertText' ).on( 'execute', spy );

			emojiPicker.showUI();
			emojiPicker.emojiPickerView.gridView.fire( 'execute', { emoji: '😀' } );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should update the balloon position on update event', () => {
			const updatePositionSpy = vi.spyOn( emojiPicker.balloonPlugin, 'updatePosition' );

			emojiPicker.showUI();
			emojiPicker.emojiPickerView.fire( 'update' );

			expect( updatePositionSpy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not update the balloon position on update event when visible view is not current emoji picker view', () => {
			const updatePositionSpy = vi.spyOn( emojiPicker.balloonPlugin, 'updatePosition' );

			emojiPicker.showUI();
			emojiPicker.balloonPlugin.visibleView = {};

			emojiPicker.emojiPickerView.fire( 'update' );

			expect( updatePositionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should close the picker when clicking outside of it', () => {
			emojiPicker.showUI();

			const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( emojiPicker.balloonPlugin.visibleView ).toBe( null );
			expect( focusSpy ).not.toHaveBeenCalled();
		} );

		it( 'should close the picker when focus is on the picker and escape is clicked', () => {
			emojiPicker.showUI();

			emojiPicker.balloonPlugin.visibleView.element.dispatchEvent( new KeyboardEvent( 'keydown', {
				keyCode: keyCodes.esc,
				bubbles: true
			} ) );

			expect( emojiPicker.balloonPlugin.visibleView ).toBe( null );
		} );

		it( 'should close when back button of form view is clicked', () => {
			emojiPicker.showUI();

			expect( emojiPicker.balloonPlugin.visibleView ).toBeInstanceOf( EmojiPickerFormView );

			emojiPicker.emojiPickerFormView.backButtonView.fire( 'execute' );

			expect( emojiPicker.balloonPlugin.visibleView ).toBe( null );
		} );

		it( 'should load previous category after reopening the emoji picker', () => {
			emojiPicker.showUI();
			emojiPicker.emojiPickerView.categoriesView.categoryName = 'Food & Drinks';
			emojiPicker._hideUI();
			emojiPicker.showUI();

			expect( emojiPicker.emojiPickerView.gridView.categoryName ).toBe( 'Food & Drinks' );
		} );

		it( 'should not crash when opening the UI twice in a row', () => {
			expect( () => {
				emojiPicker.showUI();
				emojiPicker.showUI();
			} ).not.toThrow();
		} );

		// See #17819.
		it( 'should not change the selection after opening the UI', async () => {
			_setModelData(
				editor.model,
				'<paragraph>Lorem Ipsum is simply dummy [text] of the printing and typesetting industry.</paragraph>'
			);

			emojiPicker.showUI();

			expect( _getModelData( editor.model ) ).toBe(
				'<paragraph>Lorem Ipsum is simply dummy [text] of the printing and typesetting industry.</paragraph>'
			);
		} );

		// See #17964
		it( 'should have the ck-emoji-picker-balloon class to make sure z-index does not conflict with the dialog system', () => {
			emojiPicker.showUI();

			const ballon = document.querySelector( '.ck-emoji-picker-balloon' );

			expect( ballon ).not.toBe( null );
			expect( ballon.innerText ).toContain( 'Find an emoji (min. 2 characters)' );
		} );

		describe( 'fake visual selection', () => {
			describe( 'non-collapsed', () => {
				it( 'should be displayed when a text fragment is selected', () => {
					_setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

					emojiPicker.showUI();

					expect( editor.model.markers.has( 'emoji-picker' ) ).toBe( true );

					const paragraph = editor.model.document.getRoot().getChild( 0 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( paragraph, 1 ),
						editor.model.createPositionAt( paragraph, 2 )
					);
					const markerRange = editor.model.markers.get( 'emoji-picker' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).toBe( true );

					expect( _getViewData( editor.editing.view ) ).toBe( '<p>f{<span class="ck-fake-emoji-selection">o</span>}o</p>' );
					expect( editor.getData() ).toBe( '<p>foo</p>' );
				} );

				it( 'should display a fake visual selection on the next non-empty text node when selection starts at the end ' +
					'of the empty block in the multiline selection', () => {
					_setModelData( editor.model, '<paragraph>[</paragraph><paragraph>foo]</paragraph>' );

					emojiPicker.showUI();

					expect( editor.model.markers.has( 'emoji-picker' ) ).toBe( true );

					const secondParagraph = editor.model.document.getRoot().getChild( 1 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( secondParagraph, 0 ),
						editor.model.createPositionAt( secondParagraph, 3 )
					);

					const markerRange = editor.model.markers.get( 'emoji-picker' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).toBe( true );

					expect( _getViewData( editor.editing.view ) ).toBe(
						'<p>[</p><p><span class="ck-fake-emoji-selection">foo</span>]</p>'
					);
					expect( editor.getData() ).toBe( '<p>&nbsp;</p><p>foo</p>' );
				} );

				it( 'should display a fake visual selection on the next non-empty text node when selection starts at the end ' +
					'of the first block in the multiline selection', () => {
					_setModelData( editor.model, '<paragraph>foo[</paragraph><paragraph>bar]</paragraph>' );

					emojiPicker.showUI();

					expect( editor.model.markers.has( 'emoji-picker' ) ).toBe( true );

					const secondParagraph = editor.model.document.getRoot().getChild( 1 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( secondParagraph, 0 ),
						editor.model.createPositionAt( secondParagraph, 3 )
					);

					const markerRange = editor.model.markers.get( 'emoji-picker' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).toBe( true );

					expect( _getViewData( editor.editing.view ) ).toBe(
						'<p>foo{</p><p><span class="ck-fake-emoji-selection">bar</span>]</p>'
					);
					expect( editor.getData() ).toBe( '<p>foo</p><p>bar</p>' );
				} );

				it( 'should be displayed on first text node in non-empty element when selection contains few empty elements', () => {
					_setModelData( editor.model, [
						'<paragraph>foo[</paragraph>',
						'<paragraph></paragraph>',
						'<paragraph></paragraph>',
						'<paragraph>bar</paragraph>',
						'<paragraph></paragraph>',
						'<paragraph></paragraph>',
						'<paragraph>]baz</paragraph>'
					].join( '' ) );

					emojiPicker.showUI();

					expect( editor.model.markers.has( 'emoji-picker' ) ).toBe( true );

					const firstNonEmptyElementInTheSelection = editor.model.document.getRoot().getChild( 3 );
					const rangeEnd = editor.model.document.selection.getFirstRange().end;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( firstNonEmptyElementInTheSelection, 0 ),
						editor.model.createPositionAt( rangeEnd, 0 )
					);

					const markerRange = editor.model.markers.get( 'emoji-picker' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).toBe( true );

					const expectedViewData = [
						'<p>foo{</p>',
						'<p></p>',
						'<p></p>',
						'<p><span class="ck-fake-emoji-selection">bar</span></p>',
						'<p></p>',
						'<p></p>',
						'<p>}baz</p>'
					].join( '' );

					expect( _getViewData( editor.editing.view ) ).toBe( expectedViewData );
					expect( editor.getData() ).toBe( [
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
					_setModelData( editor.model, '<paragraph>f[]o</paragraph>' );

					emojiPicker.showUI();

					expect( editor.model.markers.has( 'emoji-picker' ) ).toBe( true );

					const paragraph = editor.model.document.getRoot().getChild( 0 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( paragraph, 1 ),
						editor.model.createPositionAt( paragraph, 1 )
					);
					const markerRange = editor.model.markers.get( 'emoji-picker' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).toBe( true );

					expect( _getViewData( editor.editing.view ) ).toBe(
						'<p>f{}<span class="ck-fake-emoji-selection ck-fake-emoji-selection_collapsed"></span>o</p>'
					);
					expect( editor.getData() ).toBe( '<p>fo</p>' );
				} );

				it( 'should be displayed on selection focus when selection contains only one empty element ' +
					'(selection focus is at the beginning of the first non-empty element)', () => {
					_setModelData( editor.model, [
						'<paragraph>foo[</paragraph>',
						'<paragraph></paragraph>',
						'<paragraph>]bar</paragraph>'
					].join( '' ) );

					emojiPicker.showUI();

					expect( editor.model.markers.has( 'emoji-picker' ) ).toBe( true );

					const focus = editor.model.document.selection.focus;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( focus, 0 )
					);

					const markerRange = editor.model.markers.get( 'emoji-picker' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).toBe( true );

					const expectedViewData = [
						'<p>foo{</p>',
						'<p></p>',
						'<p>]<span class="ck-fake-emoji-selection ck-fake-emoji-selection_collapsed"></span>bar</p>'
					].join( '' );

					expect( _getViewData( editor.editing.view ) ).toBe( expectedViewData );
					expect( editor.getData() ).toBe( '<p>foo</p><p>&nbsp;</p><p>bar</p>' );
				} );

				it( 'should be displayed on selection focus when selection contains few empty elements ' +
					'(selection focus is at the beginning of the first non-empty element)', () => {
					_setModelData( editor.model, [
						'<paragraph>foo[</paragraph>',
						'<paragraph></paragraph>',
						'<paragraph></paragraph>',
						'<paragraph>]bar</paragraph>'
					].join( '' ) );

					emojiPicker.showUI();

					expect( editor.model.markers.has( 'emoji-picker' ) ).toBe( true );

					const focus = editor.model.document.selection.focus;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( focus, 0 )
					);

					const markerRange = editor.model.markers.get( 'emoji-picker' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).toBe( true );

					const expectedViewData = [
						'<p>foo{</p>',
						'<p></p>',
						'<p></p>',
						'<p>]<span class="ck-fake-emoji-selection ck-fake-emoji-selection_collapsed"></span>bar</p>'
					].join( '' );

					expect( _getViewData( editor.editing.view ) ).toBe( expectedViewData );
					expect( editor.getData() ).toBe( '<p>foo</p><p>&nbsp;</p><p>&nbsp;</p><p>bar</p>' );
				} );

				it( 'should be displayed on selection focus when selection contains few empty elements ' +
					'(selection focus is inside an empty element)', () => {
					_setModelData( editor.model, [
						'<paragraph>foo[</paragraph>',
						'<paragraph></paragraph>',
						'<paragraph>]</paragraph>',
						'<paragraph>bar</paragraph>'
					].join( '' ) );

					emojiPicker.showUI();

					expect( editor.model.markers.has( 'emoji-picker' ) ).toBe( true );

					const focus = editor.model.document.selection.focus;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( focus, 0 )
					);

					const markerRange = editor.model.markers.get( 'emoji-picker' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).toBe( true );

					const expectedViewData = [
						'<p>foo{</p>',
						'<p></p>',
						'<p>]<span class="ck-fake-emoji-selection ck-fake-emoji-selection_collapsed"></span></p>',
						'<p>bar</p>'
					].join( '' );

					expect( _getViewData( editor.editing.view ) ).toBe( expectedViewData );
					expect( editor.getData() ).toBe( '<p>foo</p><p>&nbsp;</p><p>&nbsp;</p><p>bar</p>' );
				} );
			} );
		} );
	} );
} );
