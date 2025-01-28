/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document setTimeout Event KeyboardEvent */

import { ContextualBalloon, Dialog, ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { EmojiPicker } from '../src/index.js';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import EmojiRepository from '../src/emojirepository.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils';
import EmojiPickerView from '../src/ui/emojipickerview.js';
import EmojiCommand from '../src/emojicommand.js';

class EmojiRepositoryMock extends EmojiRepository {
	// Overridden `init()` to prevent the `fetch()` call.
	init() {
		this.getEmojiByQuery = sinon.stub();
		this.getEmojiCategories = sinon.stub();
		this.getSkinTones = sinon.stub();
		this.isReady = sinon.stub();

		// Let's define a default behavior as we need this in UI, but we do not check it.
		this.getEmojiCategories.returns( [
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

		this.getSkinTones.returns( [
			{ id: 'default', icon: '👋', tooltip: 'Default skin tone' },
			{ id: 'medium', icon: '👋🏽', tooltip: 'Medium skin tone' },
			{ id: 'dark', icon: '👋🏿', tooltip: 'Dark skin tone' }
		] );

		this.isReady.returns( EmojiRepositoryMock.isReady );
	}

	// Property exposed for testing purposes to control the plugin initialization flow.
	static isReady = true;
}

describe( 'EmojiPicker', () => {
	let editor, editorElement, emojiPicker;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		EmojiRepositoryMock.isReady = true;

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ EmojiPicker, Essentials, Paragraph ],
			substitutePlugins: [ EmojiRepositoryMock ],
			toolbar: [ 'emoji' ],
			menuBar: {
				isVisible: true
			}
		} );

		emojiPicker = editor.plugins.get( EmojiPicker );
	} );

	afterEach( async () => {
		await editor.destroy();
		editorElement.remove();
	} );

	it( 'should be correctly named', () => {
		expect( EmojiPicker.pluginName ).to.equal( 'EmojiPicker' );
	} );

	it( 'should have proper "requires" value', () => {
		expect( EmojiPicker.requires ).to.deep.equal( [
			EmojiRepository, ContextualBalloon, Dialog
		] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmojiPicker.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( EmojiPicker.isPremiumPlugin ).to.be.false;
	} );

	describe( 'command', () => {
		it( 'should register emoji command', () => {
			const command = editor.commands.get( 'emoji' );

			expect( command ).to.be.instanceOf( EmojiCommand );
		} );
	} );

	describe( '#skinTone', () => {
		it( 'should return the value from configuration if the UI is not ready yet (configuration not provided)', () => {
			expect( emojiPicker.skinTone ).to.equal( 'default' );
		} );

		it( 'should return the value from configuration if the UI is not ready yet (configuration provided)', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiPicker, Essentials, Paragraph ],
				substitutePlugins: [ EmojiRepositoryMock ],
				emoji: {
					skinTone: 'medium'
				}
			} );

			expect( editor.plugins.get( EmojiPicker ).skinTone ).to.equal( 'medium' );

			await editor.destroy();
			editorElement.remove();
		} );

		it( 'should read the selected skin tone from the view when it is ready', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiPicker, Essentials, Paragraph ],
				substitutePlugins: [ EmojiRepositoryMock ],
				emoji: {
					skinTone: 'medium'
				}
			} );

			const emojiPicker = editor.plugins.get( EmojiPicker );
			emojiPicker.showUI();
			emojiPicker._hideUI();
			emojiPicker.emojiPickerView.gridView.skinTone = 'dark';

			expect( editor.plugins.get( EmojiPicker ).skinTone ).to.equal( 'dark' );

			await editor.destroy();
			editorElement.remove();
		} );
	} );

	it( 'should provide the "emoji" toolbar component', () => {
		expect( editor.ui.componentFactory.has( 'emoji' ) ).to.equal( true );

		const toolbarButton = editor.ui.componentFactory.create( 'emoji' );
		expect( toolbarButton ).to.instanceOf( ButtonView );

		const stub = sinon.stub( emojiPicker, 'showUI' );

		toolbarButton.fire( 'execute' );

		sinon.assert.calledOnce( stub );
	} );

	it( 'should provide the "menuBar:emoji" toolbar component', () => {
		expect( editor.ui.componentFactory.has( 'menuBar:emoji' ) ).to.equal( true );

		expect( editor.ui.componentFactory.create( 'menuBar:emoji' ) ).to.instanceOf( MenuBarMenuListItemButtonView );
	} );

	it( 'must not register the "emoji" toolbar component if emoji repository is not ready', async () => {
		EmojiRepositoryMock.isReady = false;

		await editor.destroy();

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ EmojiPicker, Paragraph, Essentials ],
			substitutePlugins: [ EmojiRepositoryMock ]
		} );

		expect( editor.ui.componentFactory.has( 'emoji' ) ).to.equal( false );
	} );

	it( 'must not register the "menuBar:emoji" toolbar component if emoji repository is not ready', async () => {
		EmojiRepositoryMock.isReady = false;

		await editor.destroy();

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ EmojiPicker, Paragraph, Essentials ],
			substitutePlugins: [ EmojiRepositoryMock ],
			menuBar: {
				isVisible: true
			}
		} );

		expect( editor.ui.componentFactory.has( 'menuBar:emoji' ) ).to.equal( false );
	} );

	describe( 'showUI()', () => {
		it( 'should read categories from the repository plugin when creating UI', () => {
			const { getEmojiCategories } = editor.plugins.get( 'EmojiRepository' );

			emojiPicker.showUI();

			expect( getEmojiCategories.callCount ).to.equal( 1 );
		} );

		it( 'should read skin tones from the repository plugin when creating UI', () => {
			const { getSkinTones } = editor.plugins.get( 'EmojiRepository' );

			emojiPicker.showUI();

			expect( getSkinTones.callCount ).to.equal( 1 );
		} );

		it( 'should pass the specified query to the UI view', () => {
			const { getEmojiByQuery } = editor.plugins.get( 'EmojiRepository' );
			getEmojiByQuery.returns( [] );

			emojiPicker.showUI( 'query' );

			expect( emojiPicker.emojiPickerView.searchView.inputView.queryView.fieldView.value ).to.equal( 'query' );
			expect( getEmojiByQuery.callCount ).to.equal( 1 );
			expect( getEmojiByQuery.firstCall.firstArg ).to.equal( 'query' );
		} );

		it( 'should add the emoji UI view to the `ContextualBalloon` plugin when opens UI', () => {
			expect( emojiPicker._balloonPlugin.visibleView ).to.equal( null );

			emojiPicker.showUI();

			expect( emojiPicker._balloonPlugin.visibleView ).to.be.instanceOf( EmojiPickerView );
		} );

		it( 'should focus the query input when opens UI', async () => {
			emojiPicker.showUI();

			await new Promise( resolve => {
				setTimeout( resolve );
			} );

			expect( document.activeElement ).to.equal( emojiPicker.emojiPickerView.searchView.inputView.queryView.fieldView.element );
		} );

		it( 'should insert an emoji after clicking on it in the picker', () => {
			expect( getModelData( editor.model ) ).to.equal( '<paragraph>[]</paragraph>' );

			emojiPicker.showUI();
			emojiPicker.emojiPickerView.gridView.fire( 'execute', { emoji: '😀' } );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>😀[]</paragraph>' );
		} );

		it( 'should update the balloon position on update event', () => {
			const updatePositionSpy = sinon.spy( emojiPicker._balloonPlugin, 'updatePosition' );

			emojiPicker.showUI();
			emojiPicker.emojiPickerView.fire( 'update' );

			sinon.assert.calledOnce( updatePositionSpy );
		} );

		it( 'should not update the balloon position on update event when visible view is not current emoji picker view', () => {
			const updatePositionSpy = sinon.spy( emojiPicker._balloonPlugin, 'updatePosition' );

			emojiPicker.showUI();
			emojiPicker._balloonPlugin.visibleView = {};

			emojiPicker.emojiPickerView.fire( 'update' );

			sinon.assert.notCalled( updatePositionSpy );
		} );

		it( 'should close the picker when clicking outside of it', () => {
			emojiPicker.showUI();

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( emojiPicker._balloonPlugin.visibleView ).to.equal( null );
		} );

		it( 'should close the picker when focus is on the picker and escape is clicked', () => {
			emojiPicker.showUI();

			emojiPicker._balloonPlugin.visibleView.element.dispatchEvent( new KeyboardEvent( 'keydown', {
				keyCode: keyCodes.esc,
				bubbles: true
			} ) );

			expect( emojiPicker._balloonPlugin.visibleView ).to.equal( null );
		} );

		it( 'should load previous category after reopening the emoji picker', () => {
			emojiPicker.showUI();
			emojiPicker.emojiPickerView.categoriesView.categoryName = 'Food & Drinks';
			emojiPicker._hideUI();
			emojiPicker.showUI();

			expect( emojiPicker.emojiPickerView.gridView.categoryName ).to.equal( 'Food & Drinks' );
		} );

		it( 'should not crash when opening the UI twice in a row', () => {
			expect( () => {
				emojiPicker.showUI();
				emojiPicker.showUI();
			} ).to.not.throw();
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
} );
