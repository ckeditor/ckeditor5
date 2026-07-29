/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Link } from '@ckeditor/ckeditor5-link';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';

import { View, ButtonView, ContextualBalloon, MenuBarMenuListItemButtonView, BalloonPanelView, LabelView } from '@ckeditor/ckeditor5-ui';
import { IconBookmark, IconPencil, IconRemove, IconBookmarkSmall, IconBookmarkMedium } from '@ckeditor/ckeditor5-icons';
import { WidgetToolbarRepository } from '@ckeditor/ckeditor5-widget';
import { indexOf, isRange, keyCodes } from '@ckeditor/ckeditor5-utils';
import { _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';

import { BookmarkFormView } from '../src/ui/bookmarkformview.js';
import { BookmarkEditing } from '../src/bookmarkediting.js';
import { BookmarkUI } from '../src/bookmarkui.js';

describe( 'BookmarkUI', () => {
	let editor, element, button, balloon, bookmarkUIFeature, formView, widgetToolbarRepository, toolbarView;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ BookmarkUI, BookmarkEditing, Essentials, Paragraph, BlockQuote, Link ]
		} );

		bookmarkUIFeature = editor.plugins.get( BookmarkUI );
		balloon = editor.plugins.get( ContextualBalloon );
		widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
		toolbarView = widgetToolbarRepository._toolbarDefinitions.get( 'bookmark' ).view;

		// There is no point to execute BalloonPanelView attachTo and pin methods so lets override it.
		vi.spyOn( balloon.view, 'attachTo' ).mockReturnValue( {} );
		vi.spyOn( balloon.view, 'pin' ).mockReturnValue( {} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should have proper "requires" value', () => {
		expect( BookmarkUI.requires ).toEqual( [ BookmarkEditing, ContextualBalloon, WidgetToolbarRepository ] );
	} );

	it( 'should be correctly named', () => {
		expect( BookmarkUI.pluginName ).toBe( 'BookmarkUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( BookmarkUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( BookmarkUI.isPremiumPlugin ).toBe( false );
	} );

	it( 'should load ContextualBalloon', () => {
		expect( editor.plugins.get( ContextualBalloon ) ).toBeInstanceOf( ContextualBalloon );
	} );

	it( 'should not create #formView', () => {
		expect( bookmarkUIFeature.formView ).toBeNull();
	} );

	it( 'should not create #actionsView', () => {
		expect( bookmarkUIFeature.actionsView ).toBeUndefined();
	} );

	it( 'should initialize without the Link plugin loaded', async () => {
		const standaloneElement = document.createElement( 'div' );
		document.body.appendChild( standaloneElement );

		const standaloneEditor = await ClassicTestEditor.create( standaloneElement, {
			plugins: [ BookmarkUI, BookmarkEditing, Essentials, Paragraph ]
		} );

		expect( standaloneEditor.plugins.has( 'LinkUI' ) ).toBe( false );
		expect( standaloneEditor.plugins.get( BookmarkUI ) ).toBeInstanceOf( BookmarkUI );

		standaloneElement.remove();
		await standaloneEditor.destroy();
	} );

	describe( 'the "bookmark" toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'bookmark' );
		} );

		testButton( 'bookmark', 'Bookmark', ButtonView );

		it( 'should have tooltip', () => {
			expect( button.tooltip ).toBe( true );
		} );

		it( 'should have an icon', () => {
			expect( button.icon ).toBe( IconBookmark );
		} );

		it( 'should scroll to the selection when executed', () => {
			const scrollSpy = vi.spyOn( editor.editing.view, 'scrollToTheSelection' );

			button.fire( 'execute' );

			expect( scrollSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should bind #isEnabled to insert and update command', () => {
			const insertBookmark = editor.commands.get( 'insertBookmark' );
			const updateBookmark = editor.commands.get( 'updateBookmark' );

			expect( button.isOn ).toBe( false );

			insertBookmark.isEnabled = true;
			updateBookmark.isEnabled = true;
			expect( button.isEnabled ).toBe( true );

			insertBookmark.isEnabled = true;
			updateBookmark.isEnabled = false;
			expect( button.isEnabled ).toBe( true );

			insertBookmark.isEnabled = false;
			updateBookmark.isEnabled = true;
			expect( button.isEnabled ).toBe( true );

			insertBookmark.isEnabled = false;
			updateBookmark.isEnabled = false;
			expect( button.isEnabled ).toBe( false );
		} );
	} );

	describe( 'the menuBar:bookmark menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:bookmark' );
		} );

		testButton( 'bookmark', 'Bookmark', MenuBarMenuListItemButtonView );

		it( 'should scroll to the selection when executed', () => {
			const scrollSpy = vi.spyOn( editor.editing.view, 'scrollToTheSelection' );

			button.fire( 'execute' );

			expect( scrollSpy ).toHaveBeenCalledOnce();
		} );
	} );

	function testButton( featureName, label, Component ) {
		it( 'should register feature component', () => {
			expect( button ).toBeInstanceOf( Component );
		} );

		it( 'should create UI component with correct attribute values', () => {
			expect( button.isOn ).toBe( false );
			expect( button.label ).toBe( label );
		} );

		it( `should execute ${ featureName } command on model execute event and focus the view`, () => {
			const spy = vi.spyOn( bookmarkUIFeature, '_showFormView' );

			button.fire( 'execute' );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should toggle the balloon UI with hidden back button (if not updating)', () => {
			const updateBookmark = editor.commands.get( 'updateBookmark' );

			vi.spyOn( updateBookmark, 'isEnabled', 'get' ).mockReturnValue( false );
			button.fire( 'execute' );

			expect( bookmarkUIFeature.formView.backButtonView.isVisible ).toBe( false );
		} );

		it( 'should toggle the balloon UI with visible back button (if updating)', () => {
			const updateBookmark = editor.commands.get( 'updateBookmark' );

			vi.spyOn( updateBookmark, 'isEnabled', 'get' ).mockReturnValue( true );
			button.fire( 'execute' );

			expect( bookmarkUIFeature.formView.backButtonView.isVisible ).toBe( true );
		} );
	}

	describe( 'bookmark toolbar components', () => {
		describe( 'bookmark preview label', () => {
			let label;

			beforeEach( () => {
				label = editor.ui.componentFactory.create( 'bookmarkPreview' );
			} );

			it( 'should be a LabelView', () => {
				expect( label ).toBeInstanceOf( LabelView );
			} );

			it( 'should have bookmark preview css classes set', () => {
				label.render();

				expect( label.element.classList.contains( 'ck-bookmark-toolbar__preview' ) ).toBe( true );
			} );

			it( 'should bind text to the UpdateBookmarkCommand value', () => {
				const updateBookmarkCommand = editor.commands.get( 'updateBookmark' );

				updateBookmarkCommand.value = 'foo';
				expect( label.text ).toBe( 'foo' );

				updateBookmarkCommand.value = 'bar';
				expect( label.text ).toBe( 'bar' );
			} );
		} );

		describe( 'edit bookmark button', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'editBookmark' );
			} );

			it( 'should be a ButtonView', () => {
				expect( button ).toBeInstanceOf( ButtonView );
			} );

			it( 'should have a label', () => {
				expect( button.label ).toBe( 'Edit bookmark' );
			} );

			it( 'should have a tooltip', () => {
				expect( button.tooltip ).toBe( true );
			} );

			it( 'should have an icon', () => {
				expect( button.icon ).toBe( IconPencil );
			} );

			it( 'should bind #isEnabled to the UpdateBookmarkCommand', () => {
				const updateBookmarkCommand = editor.commands.get( 'updateBookmark' );

				updateBookmarkCommand.isEnabled = false;
				expect( button.isEnabled ).toBe( false );

				updateBookmarkCommand.isEnabled = true;
				expect( button.isEnabled ).toBe( true );

				updateBookmarkCommand.isEnabled = false;
				expect( button.isEnabled ).toBe( false );
			} );

			it( 'should toggle the balloon UI with visible back button', () => {
				const updateBookmarkCommand = editor.commands.get( 'updateBookmark' );

				vi.spyOn( updateBookmarkCommand, 'isEnabled', 'get' ).mockReturnValue( true );
				button.fire( 'execute' );

				expect( bookmarkUIFeature.formView.backButtonView.isVisible ).toBe( true );
			} );

			it( 'should trigger #_showFormView() on execute', () => {
				const spy = vi.spyOn( bookmarkUIFeature, '_showFormView' ).mockImplementation( () => {} );

				button.fire( 'execute' );

				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );

		describe( 'remove bookmark button', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'removeBookmark' );
			} );

			it( 'should be a ButtonView', () => {
				expect( button ).toBeInstanceOf( ButtonView );
			} );

			it( 'should have a label', () => {
				expect( button.label ).toBe( 'Remove bookmark' );
			} );

			it( 'should have a tooltip', () => {
				expect( button.tooltip ).toBe( true );
			} );

			it( 'should have an icon', () => {
				expect( button.icon ).toBe( IconRemove );
			} );

			it( 'should bind #isEnabled to the DeleteCommand', () => {
				const deleteCommand = editor.commands.get( 'delete' );

				deleteCommand.isEnabled = false;
				expect( button.isEnabled ).toBe( false );

				deleteCommand.isEnabled = true;
				expect( button.isEnabled ).toBe( true );

				deleteCommand.isEnabled = false;
				expect( button.isEnabled ).toBe( false );
			} );

			it( 'should trigger DeleteCommand on execute', () => {
				const deleteCommand = editor.commands.get( 'delete' );
				const spy = vi.spyOn( deleteCommand, 'execute' );

				button.fire( 'execute' );

				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should return focus to editable after executing a command', () => {
				const spy = vi.spyOn( editor.editing.view, 'focus' );

				button.fire( 'execute' );

				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'toolbar', () => {
		it( 'should use the config.bookmark.toolbar to create items', () => {
			// Make sure that toolbar is empty before first show.
			expect( toolbarView.items.length ).toBe( 0 );

			editor.ui.focusTracker.isFocused = true;

			_setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

			expect( toolbarView.items ).toHaveLength( 4 );
			expect( toolbarView.items.get( 0 ).text ).toBe( 'foo' );
			expect( toolbarView.items.get( 2 ).label ).toBe( 'Edit bookmark' );
			expect( toolbarView.items.get( 3 ).label ).toBe( 'Remove bookmark' );
		} );

		it( 'should set proper CSS classes', () => {
			const spy = vi.spyOn( balloon, 'add' );

			editor.ui.focusTracker.isFocused = true;

			_setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

			expect( spy ).toHaveBeenCalled();
			const matched = spy.mock.calls.some( ( [ arg ] ) => {
				return arg && arg.view === toolbarView && arg.balloonClassName === 'ck-bookmark-balloon ck-toolbar-container';
			} );
			expect( matched ).toBe( true );
		} );

		it( 'should set aria-label attribute', () => {
			toolbarView.render();

			expect( toolbarView.element.getAttribute( 'aria-label' ) ).toBe( 'Bookmark toolbar' );

			toolbarView.destroy();
		} );

		it( 'should override the default balloon position to match the form view positions', () => {
			const spy = vi.spyOn( balloon, 'add' );
			editor.ui.focusTracker.isFocused = true;

			_setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

			const bookmarkElement = editor.editing.view.getDomRoot().querySelector( 'a' );
			const defaultPositions = BalloonPanelView.defaultPositions;

			expect( spy ).toHaveBeenCalledOnce();

			expect( spy ).toHaveBeenCalledWith( {
				view: toolbarView,
				position: {
					target: bookmarkElement,
					positions: [
						defaultPositions.southArrowNorth,
						defaultPositions.southArrowNorthMiddleWest,
						defaultPositions.southArrowNorthMiddleEast,
						defaultPositions.southArrowNorthWest,
						defaultPositions.southArrowNorthEast,
						defaultPositions.northArrowSouth,
						defaultPositions.northArrowSouthMiddleWest,
						defaultPositions.northArrowSouthMiddleEast,
						defaultPositions.northArrowSouthWest,
						defaultPositions.northArrowSouthEast,
						defaultPositions.viewportStickyNorth
					]
				},
				balloonClassName: 'ck-bookmark-balloon ck-toolbar-container'
			} );
		} );

		describe( 'integration with the editor selection', () => {
			beforeEach( () => {
				editor.ui.focusTracker.isFocused = true;
			} );

			it( 'should show the toolbar on ui#update when the bookmark is selected', () => {
				_setModelData( editor.model, '<paragraph>[]<bookmark bookmarkId="foo"></bookmark></paragraph>' );

				expect( balloon.visibleView ).toBeNull();

				editor.ui.fire( 'update' );

				expect( balloon.visibleView ).toBeNull();

				editor.model.change( writer => {
					writer.setSelection(
						writer.createRangeOn( editor.model.document.getRoot().getChild( 0 ).getChild( 0 ) )
					);
				} );

				expect( balloon.visibleView ).toBe( toolbarView );

				// Make sure successive change does not throw, e.g. attempting
				// to insert the toolbar twice.
				editor.ui.fire( 'update' );
				expect( balloon.visibleView ).toBe( toolbarView );
			} );

			it( 'should hide the toolbar on ui#update if the bookmark is de–selected', () => {
				_setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

				expect( balloon.visibleView ).toBe( toolbarView );

				editor.model.change( writer => {
					writer.setSelection(
						writer.createPositionAt( editor.model.document.getRoot().getChild( 0 ), 0 )
					);
				} );

				expect( balloon.visibleView ).toBeNull();

				// Make sure successive change does not throw, e.g. attempting
				// to remove the toolbar twice.
				editor.ui.fire( 'update' );
				expect( balloon.visibleView ).toBeNull();
			} );
		} );
	} );

	describe( 'link ui integration', () => {
		let linkUI, t, linkCommand;

		beforeEach( () => {
			linkUI = editor.plugins.get( 'LinkUI' );
			linkCommand = editor.commands.get( 'link' );

			t = editor.locale.t;
		} );

		it( 'should register proper link provider', () => {
			const found = linkUI._linksProviders.find( provider => provider.label === t( 'Bookmarks' ) );

			expect( found.emptyListPlaceholder ).toBe( t( 'No bookmarks available.' ) );
			expect( typeof found.navigate ).toBe( 'function' );
			expect( found.getItem ).toBeInstanceOf( Function );
			expect( found.getListItems ).toBeInstanceOf( Function );
		} );

		it( 'should be able to open "Bookmark" tab in the link panel even if the list is empty', () => {
			linkUI._showUI();

			const button = clickNthLinksProvider( 0 );

			expect( button ).toBeDefined();
			expect( button.label ).toBe( t( 'Bookmarks' ) );

			expectedShownItems( [] );
			expectShownEmptyPlaceholder( t( 'No bookmarks available.' ) );
		} );

		it( 'should be able to open "Bookmark" tab in the link panel with single item', () => {
			_setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

			linkUI._showUI();
			clickNthLinksProvider( 0 );

			expectedShownItems( [
				{ label: 'foo', icon: IconBookmarkMedium }
			] );
		} );

		it( 'should show bookmark items that are ordered alphabetically', () => {
			_setModelData( editor.model,
				'<paragraph>f[o]o' +
					'<bookmark bookmarkId="zzz"></bookmark>' +
					'<bookmark bookmarkId="aaa"></bookmark>' +
					'<bookmark bookmarkId="ccc"></bookmark>' +
				'</paragraph>'
			);

			linkUI._showUI();
			clickNthLinksProvider( 0 );

			expectedShownItems( [
				{ label: 'aaa', icon: IconBookmarkMedium },
				{ label: 'ccc', icon: IconBookmarkMedium },
				{ label: 'zzz', icon: IconBookmarkMedium }
			] );
		} );

		it( 'should show proper icon and tooltip in link preview button', () => {
			_setModelData( editor.model,
				'<paragraph>f[o]o' +
					'<bookmark bookmarkId="zzz"></bookmark>' +
				'</paragraph>'
			);

			const button = editor.ui.componentFactory.create( 'linkPreview' );

			linkCommand.value = '#zzz';

			expect( button.icon ).toBe( IconBookmarkSmall );
			expect( button.tooltip ).toBe( t( 'Scroll to bookmark' ) );

			button.destroy();

			linkCommand.value = '#other_non_bookmark';

			expect( button.icon ).not.toBe( IconBookmarkSmall );
			expect( button.tooltip ).not.toBe( t( 'Scroll to bookmark' ) );
		} );

		it( 'should scroll to the bookmark when the link preview button is clicked', () => {
			_setModelData( editor.model,
				'<paragraph>f[o]o' +
					'<bookmark bookmarkId="zzz"></bookmark>' +
				'</paragraph>'
			);

			const button = editor.ui.componentFactory.create( 'linkPreview' );
			const scrollStub = vi.spyOn( editor.editing.view, 'scrollToTheSelection' ).mockImplementation( () => {} );

			linkCommand.value = '#zzz';
			button.render();
			button.element.dispatchEvent( new Event( 'click' ) );

			const selectedElement = editor.model.document.selection.getSelectedElement();

			expect( selectedElement.is( 'element', 'bookmark' ) ).toBe( true );
			expect( selectedElement.getAttribute( 'bookmarkId' ) ).toBe( 'zzz' );
			expect( scrollStub ).toHaveBeenCalledOnce();
		} );

		it( 'should perform default browser action if tried to scroll to non-existing bookmark', () => {
			_setModelData( editor.model,
				'<paragraph>f[o]o' +
					'<bookmark bookmarkId="zzz"></bookmark>' +
				'</paragraph>'
			);

			const bookmarkEditing = editor.plugins.get( 'BookmarkEditing' );
			const button = editor.ui.componentFactory.create( 'linkPreview' );
			const scrollStub = vi.spyOn( editor.editing.view, 'scrollToTheSelection' ).mockImplementation( () => {} );

			// Let's assume that command somehow managed to be set to non-existing bookmark.
			linkCommand.value = '#zzz';
			vi.spyOn( bookmarkEditing, 'getElementForBookmarkId' ).mockReturnValue( null );

			button.render();
			button.element.dispatchEvent( new Event( 'click' ) );

			expect( scrollStub ).not.toHaveBeenCalled();
		} );

		function clickNthLinksProvider( nth ) {
			const providersList = linkUI.formView
				.template.children[ 0 ]
				.find( child => child.template.attributes.class.includes( 'ck-link-form__providers-list' ) );

			expect( providersList ).toBeDefined();

			const button = providersList
				.template.children[ 0 ]
				.get( nth ) // li
				.template.children[ 0 ]
				.get( 0 ); // button

			button.fire( 'execute' );
			return button;
		}

		function expectShownEmptyPlaceholder( placeholder ) {
			const emptyListInformation = linkUI.linkProviderItemsView.emptyListInformation;

			expect( emptyListInformation.element.innerText ).toBe( placeholder );
		}

		function expectedShownItems( expectedItems ) {
			const items = Array
				.from( linkUI.linkProviderItemsView.listChildren )
				.map( child => ( {
					label: child.label,
					icon: child.icon
				} ) );

			expect( items ).toEqual( expectedItems );
		}
	} );

	describe( '_showFormView()', () => {
		let balloonAddSpy;

		beforeEach( () => {
			balloonAddSpy = vi.spyOn( balloon, 'add' );
			editor.editing.view.document.isFocused = true;
		} );

		it( 'should create #formView', () => {
			_setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._showFormView();

			expect( bookmarkUIFeature.formView ).toBeInstanceOf( BookmarkFormView );
		} );

		it( 'should not throw if the UI is already visible', () => {
			_setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._showFormView();

			expect( () => {
				bookmarkUIFeature._showFormView();
			} ).not.toThrow();
		} );

		it( 'should add #formView to the balloon and attach the balloon to the selection when text fragment is selected', () => {
			_setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._showFormView();
			formView = bookmarkUIFeature.formView;

			const expectedRange = getMarkersRange( editor );

			expect( balloon.visibleView ).toBe( formView );

			expect( balloonAddSpy ).toHaveBeenCalledWith( {
				view: formView,
				position: {
					target: expect.toSatisfy( isRange )
				}
			} );

			assertDomRange( expectedRange, balloonAddSpy.mock.calls[ 0 ][ 0 ].position.target );
		} );

		it( 'should bind idInputView #isEnabled to insert and update command', () => {
			const insertBookmark = editor.commands.get( 'insertBookmark' );
			const updateBookmark = editor.commands.get( 'updateBookmark' );

			bookmarkUIFeature._showFormView();
			const idInputView = bookmarkUIFeature.formView.idInputView;

			insertBookmark.isEnabled = true;
			updateBookmark.isEnabled = true;
			expect( idInputView.isEnabled ).toBe( true );

			insertBookmark.isEnabled = true;
			updateBookmark.isEnabled = false;
			expect( idInputView.isEnabled ).toBe( true );

			insertBookmark.isEnabled = false;
			updateBookmark.isEnabled = true;
			expect( idInputView.isEnabled ).toBe( true );

			insertBookmark.isEnabled = false;
			updateBookmark.isEnabled = false;
			expect( idInputView.isEnabled ).toBe( false );
		} );

		it( 'should bind saveButtonView #isEnabled to insert and update command', () => {
			const insertBookmark = editor.commands.get( 'insertBookmark' );
			const updateBookmark = editor.commands.get( 'updateBookmark' );

			bookmarkUIFeature._showFormView();
			const buttonView = bookmarkUIFeature.formView.saveButtonView;

			insertBookmark.isEnabled = true;
			updateBookmark.isEnabled = true;
			expect( buttonView.isEnabled ).toBe( true );

			insertBookmark.isEnabled = true;
			updateBookmark.isEnabled = false;
			expect( buttonView.isEnabled ).toBe( true );

			insertBookmark.isEnabled = false;
			updateBookmark.isEnabled = true;
			expect( buttonView.isEnabled ).toBe( true );

			insertBookmark.isEnabled = false;
			updateBookmark.isEnabled = false;
			expect( buttonView.isEnabled ).toBe( false );
		} );

		it( 'should add #formView to the balloon when bookmark is selected and bookmark toolbar is already visible', () => {
			_setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );
			const bookmarkElement = editor.editing.view.getDomRoot().querySelector( 'a' );

			editor.ui.update();

			expect( balloon.visibleView ).toBe( toolbarView );

			const addSpyFirstCallArgs = balloonAddSpy.mock.calls[ 0 ][ 0 ];

			expect( addSpyFirstCallArgs.view ).toBe( toolbarView );

			bookmarkUIFeature._showFormView();

			const addSpyCallSecondCallArgs = balloonAddSpy.mock.calls[ 1 ][ 0 ];

			expect( addSpyCallSecondCallArgs.view ).toBe( bookmarkUIFeature.formView );
			expect( typeof addSpyCallSecondCallArgs.position.target ).toBe( 'function' );
			expect( addSpyCallSecondCallArgs.position.target() ).toBe( bookmarkElement );
		} );

		it( 'should force `main` stack to be visible', () => {
			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;
			formView.render();

			_setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			balloon.add( {
				view: new View(),
				stackId: 'secondary'
			} );

			bookmarkUIFeature._showFormView();

			expect( balloon.visibleView ).toBe( formView );
		} );

		it( 'should update balloon position when is switched in rotator to a visible panel', () => {
			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;
			formView.render();

			_setModelData( editor.model, '<paragraph>fo[<bookmark bookmarkId="foo"></bookmark>]ar</paragraph>' );

			const customView = new View();
			const BookmarkViewElement = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 1 );
			const BookmarkDomElement = editor.editing.view.domConverter.mapViewToDom( BookmarkViewElement );

			expect( balloon.visibleView ).toBe( toolbarView );
			expect( balloon.view.pin.mock.calls.at( -1 )[ 0 ].target ).toBe( BookmarkDomElement );

			balloon.add( {
				stackId: 'custom',
				view: customView,
				position: { target: {} }
			} );

			balloon.showStack( 'custom' );

			expect( balloon.visibleView ).toBe( customView );
			expect( balloon.hasView( toolbarView ) ).toBe( true );

			editor.execute( 'blockQuote' );
			balloon.showStack( 'main' );

			expect( balloon.visibleView ).toBe( toolbarView );
			expect( balloon.hasView( customView ) ).toBe( true );
			expect( balloon.view.pin.mock.calls.at( -1 )[ 0 ].target ).not.toBe( BookmarkDomElement );

			const newBookmarkViewElement = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 1 );
			const newBookmarkDomElement = editor.editing.view.domConverter.mapViewToDom( newBookmarkViewElement );

			expect( balloon.view.pin.mock.calls.at( -1 )[ 0 ].target ).toBe( newBookmarkDomElement );
		} );

		it( 'should force `main` stack to be visible while bookmark is selected', () => {
			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;
			formView.render();

			_setModelData( editor.model, '<paragraph>fo[<bookmark bookmarkId="foo"></bookmark>]ar</paragraph>' );

			balloon.add( {
				view: new View(),
				stackId: 'secondary'
			} );

			bookmarkUIFeature._showFormView();

			expect( balloon.visibleView ).toBe( formView );
		} );

		it( 'should add #formView to the balloon and attach the balloon to the marker element when selection is collapsed', () => {
			// (https://github.com/ckeditor/ckeditor5/issues/7926)
			_setModelData( editor.model, '<paragraph>f[]oo</paragraph>' );
			bookmarkUIFeature._showFormView();
			formView = bookmarkUIFeature.formView;

			const expectedRange = getMarkersRange( editor );

			expect( balloon.visibleView ).toBe( formView );
			expect( balloonAddSpy ).toHaveBeenCalledWith( {
				view: formView,
				position: {
					target: expect.toSatisfy( isRange )
				}
			} );
			assertDomRange( expectedRange, balloonAddSpy.mock.calls[ 0 ][ 0 ].position.target );
		} );

		it( 'should update the id when bookmark selected', () => {
			const executeSpy = vi.spyOn( editor, 'execute' );

			_setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );
			bookmarkUIFeature._showFormView();
			formView = bookmarkUIFeature.formView;

			const id = 'new_id';
			formView.idInputView.fieldView.value = id;

			formView.fire( 'submit' );
			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy ).toHaveBeenCalledWith( 'updateBookmark', {
				bookmarkId: id
			} );
		} );

		it( 'should focus editor on submit', () => {
			const updateSpy = vi.spyOn( editor.editing.view, 'focus' );

			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;

			_setModelData( editor.model, '<paragraph>[foo]</paragraph>' );

			bookmarkUIFeature._showFormView();

			formView.idInputView.fieldView.value = 'id_1';

			expect( updateSpy ).not.toHaveBeenCalled();
			formView.fire( 'submit' );
			expect( updateSpy ).toHaveBeenCalled();
		} );

		describe( 'form status', () => {
			it( 'should update ui on error due to change balloon position', () => {
				const updateSpy = vi.spyOn( editor.ui, 'update' );

				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;
				formView.render();

				_setModelData( editor.model, '<paragraph>[]</paragraph>' );

				bookmarkUIFeature._showFormView();

				formView.idInputView.fieldView.value = 'name with space';

				expect( updateSpy ).not.toHaveBeenCalled();
				formView.fire( 'submit' );
				expect( updateSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should show error form status if passed bookmark name is empty', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;
				formView.render();

				_setModelData( editor.model, '<paragraph><bookmark bookmarkId="foo"></bookmark>[]</paragraph>' );
				bookmarkUIFeature._showFormView();

				formView.idInputView.fieldView.value = '';

				formView.fire( 'submit' );

				expect( formView.idInputView.errorText ).toBe( 'Bookmark must not be empty.' );
			} );

			it( 'should show error form status if passed bookmark name containing spaces', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;
				formView.render();

				_setModelData( editor.model, '<paragraph>[]</paragraph>' );

				bookmarkUIFeature._showFormView();

				formView.idInputView.fieldView.value = 'name with space';

				formView.fire( 'submit' );

				expect( formView.idInputView.errorText ).toBe( 'Bookmark name cannot contain space characters.' );
			} );

			it( 'should show error form status if passed bookmark name already exists', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;
				formView.render();

				_setModelData( editor.model, '<paragraph><bookmark bookmarkId="foo"></bookmark>[]</paragraph>' );
				bookmarkUIFeature._showFormView();

				formView.idInputView.fieldView.value = 'foo';

				formView.fire( 'submit' );

				expect( formView.idInputView.errorText ).toBe( 'Bookmark name already exists.' );
			} );

			it( 'should reset form status on show', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;
				formView.render();

				_setModelData( editor.model, '<paragraph>[]</paragraph>' );
				bookmarkUIFeature._showFormView();

				formView.idInputView.fieldView.value = 'name with space';

				formView.fire( 'submit' );

				expect( formView.idInputView.errorText ).toBe( 'Bookmark name cannot contain space characters.' );

				bookmarkUIFeature._hideFormView();
				bookmarkUIFeature._showFormView();
				expect( formView.idInputView.errorText ).toBeNull();
			} );
		} );

		describe( 'response to ui#update', () => {
			it( 'should not duplicate #update listeners', () => {
				_setModelData( editor.model, '<paragraph>f[<bookmark bookmarkId="id"></bookmark>]oo</paragraph>' );

				expect( balloon.visibleView ).toBe( toolbarView );

				const spy = vi.spyOn( balloon, 'updatePosition' ).mockReturnValue( {} );

				bookmarkUIFeature._showFormView();
				editor.ui.fire( 'update' );
				bookmarkUIFeature._hideFormView();

				bookmarkUIFeature._showFormView();
				editor.ui.fire( 'update' );

				expect( spy ).toHaveBeenCalledTimes( 3 );
			} );

			it( 'updates the position of the panel – creating a new bookmark, then the selection moved', () => {
				_setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

				bookmarkUIFeature._showFormView();
				const spy = vi.spyOn( balloon, 'updatePosition' ).mockReturnValue( {} );
				const root = editor.model.document.getRoot();

				editor.model.change( writer => {
					writer.setSelection( root.getChild( 0 ), 1 );
				} );

				const expectedRange = getMarkersRange( editor );

				expect( spy ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledWith( {
					target: expect.toSatisfy( isRange )
				} );

				assertDomRange( expectedRange, spy.mock.calls[ 0 ][ 0 ].target );
			} );

			it( 'not update the position when is in not visible stack (bookmark selected)', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;
				formView.render();

				_setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="id"></bookmark>]</paragraph>' );

				bookmarkUIFeature._showFormView();

				const customView = new View();

				balloon.add( {
					stackId: 'custom',
					view: customView,
					position: { target: {} }
				} );

				balloon.showStack( 'custom' );

				expect( balloon.visibleView ).toBe( customView );
				expect( balloon.hasView( toolbarView ) ).toBe( true );

				const spy = vi.spyOn( balloon, 'updatePosition' );

				editor.ui.fire( 'update' );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'not update the position when is in not visible stack', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;

				_setModelData( editor.model, '<paragraph>f[]oo</paragraph>' );

				bookmarkUIFeature._showFormView();

				const customView = new View();

				balloon.add( {
					stackId: 'custom',
					view: customView,
					position: { target: {} }
				} );

				balloon.showStack( 'custom' );

				expect( balloon.visibleView ).toBe( customView );

				const spy = vi.spyOn( balloon, 'updatePosition' );

				editor.ui.fire( 'update' );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'hides of the panel – editing a bookmark, then the selection moved out of the bookmark', () => {
				_setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="id"></bookmark>]bar</paragraph>' );

				bookmarkUIFeature._showFormView();

				const spyUpdate = vi.spyOn( balloon, 'updatePosition' ).mockReturnValue( {} );
				const spyHide = vi.spyOn( bookmarkUIFeature, '_hideFormView' );

				const root = editor.model.document.getRoot();

				// Move selection to b[]ar.
				editor.model.change( writer => {
					writer.setSelection( root.getChild( 0 ), 2 );
				} );

				expect( spyHide ).toHaveBeenCalledOnce();
				expect( spyUpdate ).not.toHaveBeenCalled();
			} );

			it( 'hides the panel – editing a bookmark, then the selection expands', () => {
				_setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="id"></bookmark>]foo</paragraph>' );

				bookmarkUIFeature._showFormView();

				const spyUpdate = vi.spyOn( balloon, 'updatePosition' ).mockReturnValue( {} );
				const spyHide = vi.spyOn( bookmarkUIFeature, '_hideFormView' );

				const root = editor.model.document.getRoot();

				// Move selection to bookmark and a single character after it.
				editor.model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( root.getChild( 0 ), 0 ),
						writer.createPositionAt( root.getChild( 0 ), 2 )
					), true );
				} );

				expect( spyHide ).toHaveBeenCalledOnce();
				expect( spyUpdate ).not.toHaveBeenCalled();
			} );

			it( 'hides the panel – creating a new bookmark, then the selection moved to another parent', () => {
				_setModelData( editor.model, '<paragraph>f[]oo</paragraph><paragraph>bar</paragraph>' );

				bookmarkUIFeature._showFormView();

				const spyUpdate = vi.spyOn( balloon, 'updatePosition' ).mockReturnValue( {} );
				const spyHide = vi.spyOn( bookmarkUIFeature, '_hideFormView' );

				const root = editor.model.document.getRoot();

				// Move selection to b[a]r.
				editor.model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( root.getChild( 1 ), 1 ),
						writer.createPositionAt( root.getChild( 1 ), 2 )
					), true );
				} );

				expect( spyHide ).toHaveBeenCalledOnce();
				expect( spyUpdate ).not.toHaveBeenCalled();
			} );
		} );

		describe( 'fake visual selection', () => {
			describe( 'non-collapsed', () => {
				it( 'should be displayed when a text fragment is selected', () => {
					_setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

					bookmarkUIFeature._showFormView();

					expect( editor.model.markers.has( 'bookmark-ui' ) ).toBe( true );

					const paragraph = editor.model.document.getRoot().getChild( 0 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( paragraph, 1 ),
						editor.model.createPositionAt( paragraph, 2 )
					);
					const markerRange = editor.model.markers.get( 'bookmark-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).toBe( true );

					expect( _getViewData( editor.editing.view ) ).toBe(
						'<p>f{<span class="ck-fake-bookmark-selection">o</span>}o</p>'
					);
					expect( editor.getData() ).toBe( '<p>foo</p>' );
				} );

				it( 'should display a fake visual selection on the next non-empty text node when selection starts at the end ' +
					'of the empty block in the multiline selection', () => {
					_setModelData( editor.model, '<paragraph>[</paragraph><paragraph>foo]</paragraph>' );

					bookmarkUIFeature._showFormView();

					expect( editor.model.markers.has( 'bookmark-ui' ) ).toBe( true );

					const secondParagraph = editor.model.document.getRoot().getChild( 1 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( secondParagraph, 0 ),
						editor.model.createPositionAt( secondParagraph, 3 )
					);

					const markerRange = editor.model.markers.get( 'bookmark-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).toBe( true );

					expect( _getViewData( editor.editing.view ) ).toBe(
						'<p>[</p>' +
						'<p><span class="ck-fake-bookmark-selection">foo</span>]</p>'
					);
					expect( editor.getData() ).toBe( '<p>&nbsp;</p><p>foo</p>' );
				} );

				it( 'should display a fake visual selection on the next non-empty text node when selection starts at the end ' +
					'of the first block in the multiline selection', () => {
					_setModelData( editor.model, '<paragraph>foo[</paragraph><paragraph>bar]</paragraph>' );

					bookmarkUIFeature._showFormView();

					expect( editor.model.markers.has( 'bookmark-ui' ) ).toBe( true );

					const secondParagraph = editor.model.document.getRoot().getChild( 1 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( secondParagraph, 0 ),
						editor.model.createPositionAt( secondParagraph, 3 )
					);

					const markerRange = editor.model.markers.get( 'bookmark-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).toBe( true );

					expect( _getViewData( editor.editing.view ) ).toBe(
						'<p>foo{</p>' +
						'<p><span class="ck-fake-bookmark-selection">bar</span>]</p>'
					);
					expect( editor.getData() ).toBe( '<p>foo</p><p>bar</p>' );
				} );

				it( 'should be displayed on first text node in non-empty element when selection contains few empty elements', () => {
					_setModelData( editor.model, '<paragraph>foo[</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>bar</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>]baz</paragraph>' );

					bookmarkUIFeature._showFormView();

					expect( editor.model.markers.has( 'bookmark-ui' ) ).toBe( true );

					const firstNonEmptyElementInTheSelection = editor.model.document.getRoot().getChild( 3 );
					const rangeEnd = editor.model.document.selection.getFirstRange().end;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( firstNonEmptyElementInTheSelection, 0 ),
						editor.model.createPositionAt( rangeEnd, 0 )
					);

					const markerRange = editor.model.markers.get( 'bookmark-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).toBe( true );

					const expectedViewData = '<p>foo{</p>' +
						'<p></p>' +
						'<p></p>' +
						'<p><span class="ck-fake-bookmark-selection">bar</span></p>' +
						'<p></p>' +
						'<p></p>' +
						'<p>}baz</p>';

					expect( _getViewData( editor.editing.view ) ).toBe( expectedViewData );
					expect( editor.getData() ).toBe(
						'<p>foo</p>' +
						'<p>&nbsp;</p><p>&nbsp;</p>' +
						'<p>bar</p>' +
						'<p>&nbsp;</p><p>&nbsp;</p>' +
						'<p>baz</p>'
					);
				} );
			} );

			describe( 'collapsed', () => {
				it( 'should be displayed on a collapsed selection', () => {
					_setModelData( editor.model, '<paragraph>f[]o</paragraph>' );

					bookmarkUIFeature._showFormView();

					expect( editor.model.markers.has( 'bookmark-ui' ) ).toBe( true );

					const paragraph = editor.model.document.getRoot().getChild( 0 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( paragraph, 1 ),
						editor.model.createPositionAt( paragraph, 1 )
					);
					const markerRange = editor.model.markers.get( 'bookmark-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).toBe( true );

					expect( _getViewData( editor.editing.view ) ).toBe(
						'<p>f{}<span class="ck-fake-bookmark-selection ck-fake-bookmark-selection_collapsed"></span>o</p>'
					);
					expect( editor.getData() ).toBe( '<p>fo</p>' );
				} );

				it( 'should be displayed on selection focus when selection contains only one empty element ' +
					'(selection focus is at the beginning of the first non-empty element)', () => {
					_setModelData( editor.model, '<paragraph>foo[</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>]bar</paragraph>' );

					bookmarkUIFeature._showFormView();

					expect( editor.model.markers.has( 'bookmark-ui' ) ).toBe( true );

					const focus = editor.model.document.selection.focus;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( focus, 0 )
					);

					const markerRange = editor.model.markers.get( 'bookmark-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).toBe( true );

					const expectedViewData = '<p>foo{</p>' +
						'<p></p>' +
						'<p>]<span class="ck-fake-bookmark-selection ck-fake-bookmark-selection_collapsed"></span>bar</p>';

					expect( _getViewData( editor.editing.view ) ).toBe( expectedViewData );
					expect( editor.getData() ).toBe( '<p>foo</p><p>&nbsp;</p><p>bar</p>' );
				} );

				it( 'should be displayed on selection focus when selection contains few empty elements ' +
					'(selection focus is at the beginning of the first non-empty element)', () => {
					_setModelData( editor.model, '<paragraph>foo[</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>]bar</paragraph>' );

					bookmarkUIFeature._showFormView();

					expect( editor.model.markers.has( 'bookmark-ui' ) ).toBe( true );

					const focus = editor.model.document.selection.focus;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( focus, 0 )
					);

					const markerRange = editor.model.markers.get( 'bookmark-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).toBe( true );

					const expectedViewData = '<p>foo{</p>' +
						'<p></p>' +
						'<p></p>' +
						'<p>]<span class="ck-fake-bookmark-selection ck-fake-bookmark-selection_collapsed"></span>bar</p>';

					expect( _getViewData( editor.editing.view ) ).toBe( expectedViewData );
					expect( editor.getData() ).toBe( '<p>foo</p><p>&nbsp;</p><p>&nbsp;</p><p>bar</p>' );
				} );

				it( 'should be displayed on selection focus when selection contains few empty elements ' +
					'(selection focus is inside an empty element)', () => {
					_setModelData( editor.model, '<paragraph>foo[</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>]</paragraph>' +
						'<paragraph>bar</paragraph>' );

					bookmarkUIFeature._showFormView();

					expect( editor.model.markers.has( 'bookmark-ui' ) ).toBe( true );

					const focus = editor.model.document.selection.focus;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( focus, 0 )
					);

					const markerRange = editor.model.markers.get( 'bookmark-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).toBe( true );

					const expectedViewData = '<p>foo{</p>' +
						'<p></p>' +
						'<p>]<span class="ck-fake-bookmark-selection ck-fake-bookmark-selection_collapsed"></span></p>' +
						'<p>bar</p>';

					expect( _getViewData( editor.editing.view ) ).toBe( expectedViewData );
					expect( editor.getData() ).toBe( '<p>foo</p><p>&nbsp;</p><p>&nbsp;</p><p>bar</p>' );
				} );
			} );
		} );
	} );

	describe( '_addFormView()', () => {
		beforeEach( () => {
			editor.editing.view.document.isFocused = true;
		} );

		it( 'should create #formView', () => {
			_setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._addFormView();

			expect( bookmarkUIFeature.formView ).toBeInstanceOf( BookmarkFormView );
		} );

		it( 'should add #formView to the balloon and attach the balloon to the selection when text fragment is selected', () => {
			_setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._addFormView();
			formView = bookmarkUIFeature.formView;

			expect( balloon.visibleView ).toBe( formView );
		} );

		it( 'should implement the CSS transition disabling feature', () => {
			_setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._addFormView();

			expect( typeof bookmarkUIFeature.formView.disableCssTransitions ).toBe( 'function' );
		} );

		describe( 'button label', () => {
			it( 'should have "Insert" by default', () => {
				bookmarkUIFeature._addFormView();
				formView = bookmarkUIFeature.formView;

				expect( formView.saveButtonView.label ).toBe( 'Insert' );
			} );

			it( 'should have "Insert" label when bookmark is not selected', () => {
				_setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

				bookmarkUIFeature._addFormView();
				formView = bookmarkUIFeature.formView;

				bookmarkUIFeature._showFormView();

				expect( formView.saveButtonView.label ).toBe( 'Insert' );
			} );

			it( 'should have "Save" label when bookmark is selected', () => {
				_setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="id"></bookmark>]</paragraph>' );

				bookmarkUIFeature._addFormView();
				formView = bookmarkUIFeature.formView;

				bookmarkUIFeature._showFormView();

				expect( formView.saveButtonView.label ).toBe( 'Save' );
			} );

			it( 'should have "Save" label when bookmark already inserted but balloon is not closed.', () => {
				_setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );
				bookmarkUIFeature._showFormView();
				formView = bookmarkUIFeature.formView;

				expect( formView.saveButtonView.label ).toBe( 'Insert' );

				formView.idInputView.fieldView.value = 'new_id';

				formView.fire( 'submit' );
				bookmarkUIFeature._showFormView();

				expect( formView.saveButtonView.label ).toBe( 'Save' );
			} );
		} );
	} );

	describe( '_hideFormView()', () => {
		beforeEach( () => {
			bookmarkUIFeature._showFormView();

			formView = bookmarkUIFeature.formView;
		} );

		it( 'should remove the UI from the balloon', () => {
			expect( balloon.hasView( formView ) ).toBe( true );

			bookmarkUIFeature._hideFormView();

			expect( balloon.hasView( formView ) ).toBe( false );
		} );

		it( 'should focus the `editable` by default', () => {
			const spy = vi.spyOn( editor.editing.view, 'focus' );

			bookmarkUIFeature._hideFormView();

			// First call is from _removeFormView.
			expect( spy ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should focus the `editable` before before removing elements from the balloon', () => {
			const order = [];
			vi.spyOn( editor.editing.view, 'focus' ).mockImplementation( () => {
				order.push( 'focus' );
			} );
			vi.spyOn( balloon, 'remove' ).mockImplementation( () => {
				order.push( 'remove' );
			} );

			bookmarkUIFeature._hideFormView();

			expect( order.indexOf( 'focus' ) ).toBeLessThan( order.indexOf( 'remove' ) );
		} );

		it( 'should not throw an error when views are not in the `balloon`', () => {
			bookmarkUIFeature._hideFormView();

			expect( () => {
				bookmarkUIFeature._hideFormView();
			} ).not.toThrow();
		} );

		it( 'should clear ui#update listener from the ViewDocument', () => {
			const spy = vi.fn();

			bookmarkUIFeature.listenTo( editor.ui, 'update', spy );
			bookmarkUIFeature._hideFormView();
			editor.ui.fire( 'update' );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should clear the fake visual selection from a selected text fragment', () => {
			expect( editor.model.markers.has( 'bookmark-ui' ) ).toBe( true );

			bookmarkUIFeature._hideFormView();

			expect( editor.model.markers.has( 'bookmark-ui' ) ).toBe( false );
		} );

		it( 'should not throw if selection includes soft break before text item', () => {
			bookmarkUIFeature._hideFormView();

			_setModelData( editor.model, '<paragraph>[<softBreak></softBreak>fo]</paragraph>' );

			bookmarkUIFeature._showFormView();

			expect( () => {
				bookmarkUIFeature._hideFormView();
			} ).not.toThrow();
		} );

		it( 'should be called when the back button is clicked', () => {
			const spy = vi.spyOn( bookmarkUIFeature, '_hideFormView' );

			bookmarkUIFeature._showFormView();
			formView.backButtonView.fire( 'execute' );

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'keyboard support', () => {
		beforeEach( () => {
			// Make sure that forms are lazy initiated.
			expect( bookmarkUIFeature.formView ).toBeNull();

			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;
		} );

		it( 'should hide the UI after Esc key press (from editor) and not focus the editable', () => {
			const spy = vi.spyOn( bookmarkUIFeature, '_hideFormView' );
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: vi.fn(),
				stopPropagation: vi.fn()
			};

			// Balloon is visible.
			bookmarkUIFeature._showFormView();
			editor.keystrokes.press( keyEvtData );

			expect( spy ).toHaveBeenCalledWith();
		} );

		it( 'should hide the UI after Esc key press when form has focus', () => {
			const spy = vi.spyOn( bookmarkUIFeature, '_hideFormView' );
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: vi.fn(),
				stopPropagation: vi.fn()
			};

			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;

			bookmarkUIFeature._showFormView();
			bookmarkUIFeature._removeFormView();

			formView.keystrokes.press( keyEvtData );
			expect( balloon.visibleView ).toBeNull();
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should not hide the UI after Esc key press (from editor) when UI is open but is not visible', () => {
			const spy = vi.spyOn( bookmarkUIFeature, '_hideFormView' );
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: () => {},
				stopPropagation: () => {}
			};

			const viewMock = {
				ready: true,
				render: () => {},
				destroy: () => {}
			};

			bookmarkUIFeature._showFormView();

			// Some view precedes the bookmark UI in the balloon.
			balloon.add( { view: viewMock } );
			editor.keystrokes.press( keyEvtData );

			expect( spy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'mouse support', () => {
		beforeEach( () => {
			// Make sure that forms are lazy initiated.
			expect( bookmarkUIFeature.formView ).toBeNull();

			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;
		} );

		it( 'should hide the UI and not focus editable upon clicking outside the UI', () => {
			const spy = vi.spyOn( bookmarkUIFeature, '_hideFormView' );

			bookmarkUIFeature._showFormView();
			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( spy ).toHaveBeenCalledWith( false );
		} );

		it( 'should not hide the UI upon clicking inside the the UI', () => {
			const spy = vi.spyOn( bookmarkUIFeature, '_hideFormView' );

			bookmarkUIFeature._showFormView();
			balloon.view.element.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( spy ).not.toHaveBeenCalled();
		} );
	} );

	function getMarkersRange( editor ) {
		const markerElements = editor.ui.view.element.querySelectorAll( '.ck-fake-bookmark-selection' );
		const lastMarkerElement = markerElements[ markerElements.length - 1 ];

		const range = document.createRange();
		range.setStart( markerElements[ 0 ].parentElement, indexOf( markerElements[ 0 ] ) );
		range.setEnd( lastMarkerElement.parentElement, indexOf( lastMarkerElement ) + 1 );

		return range;
	}

	function assertDomRange( expected, actual ) {
		expect( actual.startContainer, 'startContainer' ).toBe( expected.startContainer );
		expect( actual.startOffset, 'startOffset' ).toBe( expected.startOffset );
		expect( actual.endContainer, 'endContainer' ).toBe( expected.endContainer );
		expect( actual.endOffset, 'endOffset' ).toBe( expected.endOffset );
	}
} );
