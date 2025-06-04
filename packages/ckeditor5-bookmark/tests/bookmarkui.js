/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Link } from '@ckeditor/ckeditor5-link';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';

import { View, ButtonView, ContextualBalloon, MenuBarMenuListItemButtonView, BalloonPanelView, LabelView } from '@ckeditor/ckeditor5-ui';
import { IconBookmark, IconPencil, IconRemove, IconBookmarkSmall, IconBookmarkMedium } from '@ckeditor/ckeditor5-icons';
import { WidgetToolbarRepository } from '@ckeditor/ckeditor5-widget';
import { indexOf, isRange, keyCodes } from '@ckeditor/ckeditor5-utils';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import BookmarkFormView from '../src/ui/bookmarkformview.js';
import BookmarkEditing from '../src/bookmarkediting.js';
import BookmarkUI from '../src/bookmarkui.js';

describe( 'BookmarkUI', () => {
	let editor, element, button, balloon, bookmarkUIFeature, formView, widgetToolbarRepository, toolbarView;

	testUtils.createSinonSandbox();

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
		testUtils.sinon.stub( balloon.view, 'attachTo' ).returns( {} );
		testUtils.sinon.stub( balloon.view, 'pin' ).returns( {} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should have proper "requires" value', () => {
		expect( BookmarkUI.requires ).to.deep.equal( [ BookmarkEditing, ContextualBalloon, WidgetToolbarRepository ] );
	} );

	it( 'should be correctly named', () => {
		expect( BookmarkUI.pluginName ).to.equal( 'BookmarkUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( BookmarkUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( BookmarkUI.isPremiumPlugin ).to.be.false;
	} );

	it( 'should load ContextualBalloon', () => {
		expect( editor.plugins.get( ContextualBalloon ) ).to.be.instanceOf( ContextualBalloon );
	} );

	it( 'should not create #formView', () => {
		expect( bookmarkUIFeature.formView ).to.be.null;
	} );

	it( 'should not create #actionsView', () => {
		expect( bookmarkUIFeature.actionsView ).to.be.undefined;
	} );

	describe( 'the "bookmark" toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'bookmark' );
		} );

		testButton( 'bookmark', 'Bookmark', ButtonView );

		it( 'should have tooltip', () => {
			expect( button.tooltip ).to.be.true;
		} );

		it( 'should have an icon', () => {
			expect( button.icon ).to.equal( IconBookmark );
		} );

		it( 'should scroll to the selection when executed', () => {
			const scrollSpy = sinon.spy( editor.editing.view, 'scrollToTheSelection' );

			button.fire( 'execute' );

			sinon.assert.calledOnce( scrollSpy );
		} );

		it( 'should bind #isEnabled to insert and update command', () => {
			const insertBookmark = editor.commands.get( 'insertBookmark' );
			const updateBookmark = editor.commands.get( 'updateBookmark' );

			expect( button.isOn ).to.be.false;

			insertBookmark.isEnabled = true;
			updateBookmark.isEnabled = true;
			expect( button.isEnabled ).to.equal( true );

			insertBookmark.isEnabled = true;
			updateBookmark.isEnabled = false;
			expect( button.isEnabled ).to.equal( true );

			insertBookmark.isEnabled = false;
			updateBookmark.isEnabled = true;
			expect( button.isEnabled ).to.equal( true );

			insertBookmark.isEnabled = false;
			updateBookmark.isEnabled = false;
			expect( button.isEnabled ).to.equal( false );
		} );
	} );

	describe( 'the menuBar:bookmark menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:bookmark' );
		} );

		testButton( 'bookmark', 'Bookmark', MenuBarMenuListItemButtonView );

		it( 'should scroll to the selection when executed', () => {
			const scrollSpy = sinon.spy( editor.editing.view, 'scrollToTheSelection' );

			button.fire( 'execute' );

			sinon.assert.calledOnce( scrollSpy );
		} );
	} );

	function testButton( featureName, label, Component ) {
		it( 'should register feature component', () => {
			expect( button ).to.be.instanceOf( Component );
		} );

		it( 'should create UI component with correct attribute values', () => {
			expect( button.isOn ).to.be.false;
			expect( button.label ).to.equal( label );
		} );

		it( `should execute ${ featureName } command on model execute event and focus the view`, () => {
			const spy = testUtils.sinon.spy( bookmarkUIFeature, '_showFormView' );

			button.fire( 'execute' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should toggle the balloon UI with hidden back button (if not updating)', () => {
			const updateBookmark = editor.commands.get( 'updateBookmark' );

			sinon.stub( updateBookmark, 'isEnabled' ).get( () => false );
			button.fire( 'execute' );

			expect( bookmarkUIFeature.formView.backButtonView.isVisible ).to.be.false;
		} );

		it( 'should toggle the balloon UI with visible back button (if updating)', () => {
			const updateBookmark = editor.commands.get( 'updateBookmark' );

			sinon.stub( updateBookmark, 'isEnabled' ).get( () => true );
			button.fire( 'execute' );

			expect( bookmarkUIFeature.formView.backButtonView.isVisible ).to.be.true;
		} );
	}

	describe( 'bookmark toolbar components', () => {
		describe( 'bookmark preview label', () => {
			let label;

			beforeEach( () => {
				label = editor.ui.componentFactory.create( 'bookmarkPreview' );
			} );

			it( 'should be a LabelView', () => {
				expect( label ).to.be.instanceOf( LabelView );
			} );

			it( 'should have bookmark preview css classes set', () => {
				label.render();

				expect( label.element.classList.contains( 'ck-bookmark-toolbar__preview' ) ).to.be.true;
			} );

			it( 'should bind text to the UpdateBookmarkCommand value', () => {
				const updateBookmarkCommand = editor.commands.get( 'updateBookmark' );

				updateBookmarkCommand.value = 'foo';
				expect( label.text ).to.equal( 'foo' );

				updateBookmarkCommand.value = 'bar';
				expect( label.text ).to.equal( 'bar' );
			} );
		} );

		describe( 'edit bookmark button', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'editBookmark' );
			} );

			it( 'should be a ButtonView', () => {
				expect( button ).to.be.instanceOf( ButtonView );
			} );

			it( 'should have a label', () => {
				expect( button.label ).to.equal( 'Edit bookmark' );
			} );

			it( 'should have a tooltip', () => {
				expect( button.tooltip ).to.be.true;
			} );

			it( 'should have an icon', () => {
				expect( button.icon ).to.equal( IconPencil );
			} );

			it( 'should bind #isEnabled to the UpdateBookmarkCommand', () => {
				const updateBookmarkCommand = editor.commands.get( 'updateBookmark' );

				updateBookmarkCommand.isEnabled = false;
				expect( button.isEnabled ).to.equal( false );

				updateBookmarkCommand.isEnabled = true;
				expect( button.isEnabled ).to.equal( true );

				updateBookmarkCommand.isEnabled = false;
				expect( button.isEnabled ).to.equal( false );
			} );

			it( 'should toggle the balloon UI with visible back button', () => {
				const updateBookmarkCommand = editor.commands.get( 'updateBookmark' );

				sinon.stub( updateBookmarkCommand, 'isEnabled' ).get( () => true );
				button.fire( 'execute' );

				expect( bookmarkUIFeature.formView.backButtonView.isVisible ).to.be.true;
			} );

			it( 'should trigger #_showFormView() on execute', () => {
				const spy = sinon.stub( bookmarkUIFeature, '_showFormView' );

				button.fire( 'execute' );

				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( 'remove bookmark button', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'removeBookmark' );
			} );

			it( 'should be a ButtonView', () => {
				expect( button ).to.be.instanceOf( ButtonView );
			} );

			it( 'should have a label', () => {
				expect( button.label ).to.equal( 'Remove bookmark' );
			} );

			it( 'should have a tooltip', () => {
				expect( button.tooltip ).to.be.true;
			} );

			it( 'should have an icon', () => {
				expect( button.icon ).to.equal( IconRemove );
			} );

			it( 'should bind #isEnabled to the DeleteCommand', () => {
				const deleteCommand = editor.commands.get( 'delete' );

				deleteCommand.isEnabled = false;
				expect( button.isEnabled ).to.equal( false );

				deleteCommand.isEnabled = true;
				expect( button.isEnabled ).to.equal( true );

				deleteCommand.isEnabled = false;
				expect( button.isEnabled ).to.equal( false );
			} );

			it( 'should trigger DeleteCommand on execute', () => {
				const deleteCommand = editor.commands.get( 'delete' );
				const spy = sinon.spy( deleteCommand, 'execute' );

				button.fire( 'execute' );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should return focus to editable after executing a command', () => {
				const spy = sinon.spy( editor.editing.view, 'focus' );

				button.fire( 'execute' );

				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'toolbar', () => {
		it( 'should use the config.bookmark.toolbar to create items', () => {
			// Make sure that toolbar is empty before first show.
			expect( toolbarView.items.length ).to.equal( 0 );

			editor.ui.focusTracker.isFocused = true;

			setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

			expect( toolbarView.items ).to.have.length( 4 );
			expect( toolbarView.items.get( 0 ).text ).to.equal( 'foo' );
			expect( toolbarView.items.get( 2 ).label ).to.equal( 'Edit bookmark' );
			expect( toolbarView.items.get( 3 ).label ).to.equal( 'Remove bookmark' );
		} );

		it( 'should set proper CSS classes', () => {
			const spy = sinon.spy( balloon, 'add' );

			editor.ui.focusTracker.isFocused = true;

			setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

			sinon.assert.calledWithMatch( spy, sinon.match( ( { balloonClassName, view } ) => {
				return view === toolbarView && balloonClassName === 'ck-bookmark-balloon ck-toolbar-container';
			} ) );
		} );

		it( 'should set aria-label attribute', () => {
			toolbarView.render();

			expect( toolbarView.element.getAttribute( 'aria-label' ) ).to.equal( 'Bookmark toolbar' );

			toolbarView.destroy();
		} );

		it( 'should override the default balloon position to match the form view positions', () => {
			const spy = sinon.spy( balloon, 'add' );
			editor.ui.focusTracker.isFocused = true;

			setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

			const bookmarkElement = editor.editing.view.getDomRoot().querySelector( 'a' );
			const defaultPositions = BalloonPanelView.defaultPositions;

			sinon.assert.calledOnce( spy );

			sinon.assert.calledWithExactly( spy, {
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
				setModelData( editor.model, '<paragraph>[]<bookmark bookmarkId="foo"></bookmark></paragraph>' );

				expect( balloon.visibleView ).to.be.null;

				editor.ui.fire( 'update' );

				expect( balloon.visibleView ).to.be.null;

				editor.model.change( writer => {
					writer.setSelection(
						writer.createRangeOn( editor.model.document.getRoot().getChild( 0 ).getChild( 0 ) )
					);
				} );

				expect( balloon.visibleView ).to.equal( toolbarView );

				// Make sure successive change does not throw, e.g. attempting
				// to insert the toolbar twice.
				editor.ui.fire( 'update' );
				expect( balloon.visibleView ).to.equal( toolbarView );
			} );

			it( 'should hide the toolbar on ui#update if the bookmark is de–selected', () => {
				setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

				expect( balloon.visibleView ).to.equal( toolbarView );

				editor.model.change( writer => {
					writer.setSelection(
						writer.createPositionAt( editor.model.document.getRoot().getChild( 0 ), 0 )
					);
				} );

				expect( balloon.visibleView ).to.be.null;

				// Make sure successive change does not throw, e.g. attempting
				// to remove the toolbar twice.
				editor.ui.fire( 'update' );
				expect( balloon.visibleView ).to.be.null;
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

			expect( found.emptyListPlaceholder ).to.equal( t( 'No bookmarks available.' ) );
			expect( found.navigate ).to.be.a( 'function' );
			expect( found.getItem ).to.be.instanceOf( Function );
			expect( found.getListItems ).to.be.instanceOf( Function );
		} );

		it( 'should be able to open "Bookmark" tab in the link panel even if the list is empty', () => {
			linkUI._showUI();

			const button = clickNthLinksProvider( 0 );

			expect( button ).not.to.be.undefined;
			expect( button.label ).to.equal( t( 'Bookmarks' ) );

			expectedShownItems( [] );
			expectShownEmptyPlaceholder( t( 'No bookmarks available.' ) );
		} );

		it( 'should be able to open "Bookmark" tab in the link panel with single item', () => {
			setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );

			linkUI._showUI();
			clickNthLinksProvider( 0 );

			expectedShownItems( [
				{ label: 'foo', icon: IconBookmarkMedium }
			] );
		} );

		it( 'should show bookmark items that are ordered alphabetically', () => {
			setModelData( editor.model,
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
			setModelData( editor.model,
				'<paragraph>f[o]o' +
					'<bookmark bookmarkId="zzz"></bookmark>' +
				'</paragraph>'
			);

			const button = editor.ui.componentFactory.create( 'linkPreview' );

			linkCommand.value = '#zzz';

			expect( button.icon ).to.equal( IconBookmarkSmall );
			expect( button.tooltip ).to.equal( t( 'Scroll to bookmark' ) );

			button.destroy();

			linkCommand.value = '#other_non_bookmark';

			expect( button.icon ).not.to.be.equal( IconBookmarkSmall );
			expect( button.tooltip ).not.to.be.equal( t( 'Scroll to bookmark' ) );
		} );

		it( 'should scroll to the bookmark when the link preview button is clicked', () => {
			setModelData( editor.model,
				'<paragraph>f[o]o' +
					'<bookmark bookmarkId="zzz"></bookmark>' +
				'</paragraph>'
			);

			const button = editor.ui.componentFactory.create( 'linkPreview' );
			const scrollStub = sinon.stub( editor.editing.view, 'scrollToTheSelection' );

			linkCommand.value = '#zzz';
			button.render();
			button.element.dispatchEvent( new Event( 'click' ) );

			const selectedElement = editor.model.document.selection.getSelectedElement();

			expect( selectedElement.is( 'element', 'bookmark' ) ).to.be.true;
			expect( selectedElement.getAttribute( 'bookmarkId' ) ).to.equal( 'zzz' );
			expect( scrollStub.calledOnce ).to.be.true;
		} );

		it( 'should perform default browser action if tried to scroll to non-existing bookmark', () => {
			setModelData( editor.model,
				'<paragraph>f[o]o' +
					'<bookmark bookmarkId="zzz"></bookmark>' +
				'</paragraph>'
			);

			const bookmarkEditing = editor.plugins.get( 'BookmarkEditing' );
			const button = editor.ui.componentFactory.create( 'linkPreview' );
			const scrollStub = sinon.stub( editor.editing.view, 'scrollToTheSelection' );

			// Let's assume that command somehow managed to be set to non-existing bookmark.
			linkCommand.value = '#zzz';
			sinon
				.stub( bookmarkEditing, 'getElementForBookmarkId' )
				.returns( null );

			button.render();
			button.element.dispatchEvent( new Event( 'click' ) );

			expect( scrollStub.calledOnce ).to.be.false;
		} );

		function clickNthLinksProvider( nth ) {
			const providersList = linkUI.formView
				.template.children[ 0 ]
				.find( child => child.template.attributes.class.includes( 'ck-link-form__providers-list' ) );

			expect( providersList ).not.to.be.undefined;

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

			expect( emptyListInformation.element.innerText ).to.equal( placeholder );
		}

		function expectedShownItems( expectedItems ) {
			const items = Array
				.from( linkUI.linkProviderItemsView.listChildren )
				.map( child => ( {
					label: child.label,
					icon: child.icon
				} ) );

			expect( items ).to.be.deep.equal( expectedItems );
		}
	} );

	describe( '_showFormView()', () => {
		let balloonAddSpy;

		beforeEach( () => {
			balloonAddSpy = testUtils.sinon.spy( balloon, 'add' );
			editor.editing.view.document.isFocused = true;
		} );

		it( 'should create #formView', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._showFormView();

			expect( bookmarkUIFeature.formView ).to.be.instanceOf( BookmarkFormView );
		} );

		it( 'should not throw if the UI is already visible', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._showFormView();

			expect( () => {
				bookmarkUIFeature._showFormView();
			} ).to.not.throw();
		} );

		it( 'should add #formView to the balloon and attach the balloon to the selection when text fragment is selected', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._showFormView();
			formView = bookmarkUIFeature.formView;

			const expectedRange = getMarkersRange( editor );

			expect( balloon.visibleView ).to.equal( formView );
			sinon.assert.calledWithExactly( balloonAddSpy, {
				view: formView,
				position: {
					target: sinon.match( isRange )
				}
			} );

			assertDomRange( expectedRange, balloonAddSpy.args[ 0 ][ 0 ].position.target );
		} );

		it( 'should bind idInputView #isEnabled to insert and update command', () => {
			const insertBookmark = editor.commands.get( 'insertBookmark' );
			const updateBookmark = editor.commands.get( 'updateBookmark' );

			bookmarkUIFeature._showFormView();
			const idInputView = bookmarkUIFeature.formView.idInputView;

			insertBookmark.isEnabled = true;
			updateBookmark.isEnabled = true;
			expect( idInputView.isEnabled ).to.equal( true );

			insertBookmark.isEnabled = true;
			updateBookmark.isEnabled = false;
			expect( idInputView.isEnabled ).to.equal( true );

			insertBookmark.isEnabled = false;
			updateBookmark.isEnabled = true;
			expect( idInputView.isEnabled ).to.equal( true );

			insertBookmark.isEnabled = false;
			updateBookmark.isEnabled = false;
			expect( idInputView.isEnabled ).to.equal( false );
		} );

		it( 'should bind saveButtonView #isEnabled to insert and update command', () => {
			const insertBookmark = editor.commands.get( 'insertBookmark' );
			const updateBookmark = editor.commands.get( 'updateBookmark' );

			bookmarkUIFeature._showFormView();
			const buttonView = bookmarkUIFeature.formView.saveButtonView;

			insertBookmark.isEnabled = true;
			updateBookmark.isEnabled = true;
			expect( buttonView.isEnabled ).to.equal( true );

			insertBookmark.isEnabled = true;
			updateBookmark.isEnabled = false;
			expect( buttonView.isEnabled ).to.equal( true );

			insertBookmark.isEnabled = false;
			updateBookmark.isEnabled = true;
			expect( buttonView.isEnabled ).to.equal( true );

			insertBookmark.isEnabled = false;
			updateBookmark.isEnabled = false;
			expect( buttonView.isEnabled ).to.equal( false );
		} );

		it( 'should add #formView to the balloon when bookmark is selected and bookmark toolbar is already visible', () => {
			setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );
			const bookmarkElement = editor.editing.view.getDomRoot().querySelector( 'a' );

			editor.ui.update();

			expect( balloon.visibleView ).to.equal( toolbarView );

			const addSpyFirstCallArgs = balloonAddSpy.firstCall.args[ 0 ];

			expect( addSpyFirstCallArgs.view ).to.equal( toolbarView );

			bookmarkUIFeature._showFormView();

			const addSpyCallSecondCallArgs = balloonAddSpy.secondCall.args[ 0 ];

			expect( addSpyCallSecondCallArgs.view ).to.equal( bookmarkUIFeature.formView );
			expect( addSpyCallSecondCallArgs.position.target ).to.be.a( 'function' );
			expect( addSpyCallSecondCallArgs.position.target() ).to.equal( bookmarkElement );
		} );

		it( 'should force `main` stack to be visible', () => {
			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;
			formView.render();

			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			balloon.add( {
				view: new View(),
				stackId: 'secondary'
			} );

			bookmarkUIFeature._showFormView();

			expect( balloon.visibleView ).to.equal( formView );
		} );

		it( 'should update balloon position when is switched in rotator to a visible panel', () => {
			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;
			formView.render();

			setModelData( editor.model, '<paragraph>fo[<bookmark bookmarkId="foo"></bookmark>]ar</paragraph>' );

			const customView = new View();
			const BookmarkViewElement = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 1 );
			const BookmarkDomElement = editor.editing.view.domConverter.mapViewToDom( BookmarkViewElement );

			expect( balloon.visibleView ).to.equal( toolbarView );
			expect( balloon.view.pin.lastCall.args[ 0 ].target ).to.equal( BookmarkDomElement );

			balloon.add( {
				stackId: 'custom',
				view: customView,
				position: { target: {} }
			} );

			balloon.showStack( 'custom' );

			expect( balloon.visibleView ).to.equal( customView );
			expect( balloon.hasView( toolbarView ) ).to.equal( true );

			editor.execute( 'blockQuote' );
			balloon.showStack( 'main' );

			expect( balloon.visibleView ).to.equal( toolbarView );
			expect( balloon.hasView( customView ) ).to.equal( true );
			expect( balloon.view.pin.lastCall.args[ 0 ].target ).to.not.equal( BookmarkDomElement );

			const newBookmarkViewElement = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 1 );
			const newBookmarkDomElement = editor.editing.view.domConverter.mapViewToDom( newBookmarkViewElement );

			expect( balloon.view.pin.lastCall.args[ 0 ].target ).to.equal( newBookmarkDomElement );
		} );

		it( 'should force `main` stack to be visible while bookmark is selected', () => {
			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;
			formView.render();

			setModelData( editor.model, '<paragraph>fo[<bookmark bookmarkId="foo"></bookmark>]ar</paragraph>' );

			balloon.add( {
				view: new View(),
				stackId: 'secondary'
			} );

			bookmarkUIFeature._showFormView();

			expect( balloon.visibleView ).to.equal( formView );
		} );

		it( 'should add #formView to the balloon and attach the balloon to the marker element when selection is collapsed', () => {
			// (#7926)
			setModelData( editor.model, '<paragraph>f[]oo</paragraph>' );
			bookmarkUIFeature._showFormView();
			formView = bookmarkUIFeature.formView;

			const expectedRange = getMarkersRange( editor );

			expect( balloon.visibleView ).to.equal( formView );
			sinon.assert.calledWithExactly( balloonAddSpy, {
				view: formView,
				position: {
					target: sinon.match( isRange )
				}
			} );
			assertDomRange( expectedRange, balloonAddSpy.args[ 0 ][ 0 ].position.target );
		} );

		it( 'should update the id when bookmark selected', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );

			setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );
			bookmarkUIFeature._showFormView();
			formView = bookmarkUIFeature.formView;

			const id = 'new_id';
			formView.idInputView.fieldView.value = id;

			formView.fire( 'submit' );
			expect( executeSpy.calledOnce ).to.be.true;
			expect( executeSpy.calledWith( 'updateBookmark', {
				bookmarkId: id
			} ) ).to.be.true;
		} );

		it( 'should focus editor on submit', () => {
			const updateSpy = sinon.spy( editor.editing.view, 'focus' );

			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;

			setModelData( editor.model, '<paragraph>[foo]</paragraph>' );

			bookmarkUIFeature._showFormView();

			formView.idInputView.fieldView.value = 'id_1';

			expect( updateSpy ).not.to.be.called;
			formView.fire( 'submit' );
			expect( updateSpy ).to.be.called;
		} );

		describe( 'form status', () => {
			it( 'should update ui on error due to change balloon position', () => {
				const updateSpy = sinon.spy( editor.ui, 'update' );

				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;
				formView.render();

				setModelData( editor.model, '<paragraph>[]</paragraph>' );

				bookmarkUIFeature._showFormView();

				formView.idInputView.fieldView.value = 'name with space';

				expect( updateSpy ).not.to.be.called;
				formView.fire( 'submit' );
				expect( updateSpy ).to.be.calledOnce;
			} );

			it( 'should show error form status if passed bookmark name is empty', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;
				formView.render();

				setModelData( editor.model, '<paragraph><bookmark bookmarkId="foo"></bookmark>[]</paragraph>' );
				bookmarkUIFeature._showFormView();

				formView.idInputView.fieldView.value = '';

				formView.fire( 'submit' );

				expect( formView.idInputView.errorText ).to.be.equal( 'Bookmark must not be empty.' );
			} );

			it( 'should show error form status if passed bookmark name containing spaces', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;
				formView.render();

				setModelData( editor.model, '<paragraph>[]</paragraph>' );

				bookmarkUIFeature._showFormView();

				formView.idInputView.fieldView.value = 'name with space';

				formView.fire( 'submit' );

				expect( formView.idInputView.errorText ).to.be.equal( 'Bookmark name cannot contain space characters.' );
			} );

			it( 'should show error form status if passed bookmark name already exists', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;
				formView.render();

				setModelData( editor.model, '<paragraph><bookmark bookmarkId="foo"></bookmark>[]</paragraph>' );
				bookmarkUIFeature._showFormView();

				formView.idInputView.fieldView.value = 'foo';

				formView.fire( 'submit' );

				expect( formView.idInputView.errorText ).to.be.equal( 'Bookmark name already exists.' );
			} );

			it( 'should reset form status on show', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;
				formView.render();

				setModelData( editor.model, '<paragraph>[]</paragraph>' );
				bookmarkUIFeature._showFormView();

				formView.idInputView.fieldView.value = 'name with space';

				formView.fire( 'submit' );

				expect( formView.idInputView.errorText ).to.be.equal( 'Bookmark name cannot contain space characters.' );

				bookmarkUIFeature._hideFormView();
				bookmarkUIFeature._showFormView();
				expect( formView.idInputView.errorText ).to.be.null;
			} );
		} );

		describe( 'response to ui#update', () => {
			it( 'should not duplicate #update listeners', () => {
				setModelData( editor.model, '<paragraph>f[<bookmark bookmarkId="id"></bookmark>]oo</paragraph>' );

				expect( balloon.visibleView ).to.equal( toolbarView );

				const spy = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );

				bookmarkUIFeature._showFormView();
				editor.ui.fire( 'update' );
				bookmarkUIFeature._hideFormView();

				bookmarkUIFeature._showFormView();
				editor.ui.fire( 'update' );

				sinon.assert.calledThrice( spy );
			} );

			it( 'updates the position of the panel – creating a new bookmark, then the selection moved', () => {
				setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

				bookmarkUIFeature._showFormView();
				const spy = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );
				const root = editor.model.document.getRoot();

				editor.model.change( writer => {
					writer.setSelection( root.getChild( 0 ), 1 );
				} );

				const expectedRange = getMarkersRange( editor );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, {
					target: sinon.match( isRange )
				} );

				assertDomRange( expectedRange, spy.args[ 0 ][ 0 ].target );
			} );

			it( 'not update the position when is in not visible stack (bookmark selected)', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;
				formView.render();

				setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="id"></bookmark>]</paragraph>' );

				bookmarkUIFeature._showFormView();

				const customView = new View();

				balloon.add( {
					stackId: 'custom',
					view: customView,
					position: { target: {} }
				} );

				balloon.showStack( 'custom' );

				expect( balloon.visibleView ).to.equal( customView );
				expect( balloon.hasView( toolbarView ) ).to.equal( true );

				const spy = testUtils.sinon.spy( balloon, 'updatePosition' );

				editor.ui.fire( 'update' );

				sinon.assert.notCalled( spy );
			} );

			it( 'not update the position when is in not visible stack', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;

				setModelData( editor.model, '<paragraph>f[]oo</paragraph>' );

				bookmarkUIFeature._showFormView();

				const customView = new View();

				balloon.add( {
					stackId: 'custom',
					view: customView,
					position: { target: {} }
				} );

				balloon.showStack( 'custom' );

				expect( balloon.visibleView ).to.equal( customView );

				const spy = testUtils.sinon.spy( balloon, 'updatePosition' );

				editor.ui.fire( 'update' );

				sinon.assert.notCalled( spy );
			} );

			it( 'hides of the panel – editing a bookmark, then the selection moved out of the bookmark', () => {
				setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="id"></bookmark>]bar</paragraph>' );

				bookmarkUIFeature._showFormView();

				const spyUpdate = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );
				const spyHide = testUtils.sinon.spy( bookmarkUIFeature, '_hideFormView' );

				const root = editor.model.document.getRoot();

				// Move selection to b[]ar.
				editor.model.change( writer => {
					writer.setSelection( root.getChild( 0 ), 2 );
				} );

				sinon.assert.calledOnce( spyHide );
				sinon.assert.notCalled( spyUpdate );
			} );

			it( 'hides the panel – editing a bookmark, then the selection expands', () => {
				setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="id"></bookmark>]foo</paragraph>' );

				bookmarkUIFeature._showFormView();

				const spyUpdate = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );
				const spyHide = testUtils.sinon.spy( bookmarkUIFeature, '_hideFormView' );

				const root = editor.model.document.getRoot();

				// Move selection to bookmark and a single character after it.
				editor.model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( root.getChild( 0 ), 0 ),
						writer.createPositionAt( root.getChild( 0 ), 2 )
					), true );
				} );

				sinon.assert.calledOnce( spyHide );
				sinon.assert.notCalled( spyUpdate );
			} );

			it( 'hides the panel – creating a new bookmark, then the selection moved to another parent', () => {
				setModelData( editor.model, '<paragraph>f[]oo</paragraph><paragraph>bar</paragraph>' );

				bookmarkUIFeature._showFormView();

				const spyUpdate = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );
				const spyHide = testUtils.sinon.spy( bookmarkUIFeature, '_hideFormView' );

				const root = editor.model.document.getRoot();

				// Move selection to b[a]r.
				editor.model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( root.getChild( 1 ), 1 ),
						writer.createPositionAt( root.getChild( 1 ), 2 )
					), true );
				} );

				sinon.assert.calledOnce( spyHide );
				sinon.assert.notCalled( spyUpdate );
			} );
		} );

		describe( 'fake visual selection', () => {
			describe( 'non-collapsed', () => {
				it( 'should be displayed when a text fragment is selected', () => {
					setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

					bookmarkUIFeature._showFormView();

					expect( editor.model.markers.has( 'bookmark-ui' ) ).to.be.true;

					const paragraph = editor.model.document.getRoot().getChild( 0 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( paragraph, 1 ),
						editor.model.createPositionAt( paragraph, 2 )
					);
					const markerRange = editor.model.markers.get( 'bookmark-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					expect( getViewData( editor.editing.view ) ).to.equal( '<p>f{<span class="ck-fake-bookmark-selection">o</span>}o</p>' );
					expect( editor.getData() ).to.equal( '<p>foo</p>' );
				} );

				it( 'should display a fake visual selection on the next non-empty text node when selection starts at the end ' +
					'of the empty block in the multiline selection', () => {
					setModelData( editor.model, '<paragraph>[</paragraph><paragraph>foo]</paragraph>' );

					bookmarkUIFeature._showFormView();

					expect( editor.model.markers.has( 'bookmark-ui' ) ).to.be.true;

					const secondParagraph = editor.model.document.getRoot().getChild( 1 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( secondParagraph, 0 ),
						editor.model.createPositionAt( secondParagraph, 3 )
					);

					const markerRange = editor.model.markers.get( 'bookmark-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					expect( getViewData( editor.editing.view ) ).to.equal(
						'<p>[</p>' +
						'<p><span class="ck-fake-bookmark-selection">foo</span>]</p>'
					);
					expect( editor.getData() ).to.equal( '<p>&nbsp;</p><p>foo</p>' );
				} );

				it( 'should display a fake visual selection on the next non-empty text node when selection starts at the end ' +
					'of the first block in the multiline selection', () => {
					setModelData( editor.model, '<paragraph>foo[</paragraph><paragraph>bar]</paragraph>' );

					bookmarkUIFeature._showFormView();

					expect( editor.model.markers.has( 'bookmark-ui' ) ).to.be.true;

					const secondParagraph = editor.model.document.getRoot().getChild( 1 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( secondParagraph, 0 ),
						editor.model.createPositionAt( secondParagraph, 3 )
					);

					const markerRange = editor.model.markers.get( 'bookmark-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					expect( getViewData( editor.editing.view ) ).to.equal(
						'<p>foo{</p>' +
						'<p><span class="ck-fake-bookmark-selection">bar</span>]</p>'
					);
					expect( editor.getData() ).to.equal( '<p>foo</p><p>bar</p>' );
				} );

				it( 'should be displayed on first text node in non-empty element when selection contains few empty elements', () => {
					setModelData( editor.model, '<paragraph>foo[</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>bar</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>]baz</paragraph>' );

					bookmarkUIFeature._showFormView();

					expect( editor.model.markers.has( 'bookmark-ui' ) ).to.be.true;

					const firstNonEmptyElementInTheSelection = editor.model.document.getRoot().getChild( 3 );
					const rangeEnd = editor.model.document.selection.getFirstRange().end;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( firstNonEmptyElementInTheSelection, 0 ),
						editor.model.createPositionAt( rangeEnd, 0 )
					);

					const markerRange = editor.model.markers.get( 'bookmark-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					const expectedViewData = '<p>foo{</p>' +
						'<p></p>' +
						'<p></p>' +
						'<p><span class="ck-fake-bookmark-selection">bar</span></p>' +
						'<p></p>' +
						'<p></p>' +
						'<p>}baz</p>';

					expect( getViewData( editor.editing.view ) ).to.equal( expectedViewData );
					expect( editor.getData() ).to.equal(
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
					setModelData( editor.model, '<paragraph>f[]o</paragraph>' );

					bookmarkUIFeature._showFormView();

					expect( editor.model.markers.has( 'bookmark-ui' ) ).to.be.true;

					const paragraph = editor.model.document.getRoot().getChild( 0 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( paragraph, 1 ),
						editor.model.createPositionAt( paragraph, 1 )
					);
					const markerRange = editor.model.markers.get( 'bookmark-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					expect( getViewData( editor.editing.view ) ).to.equal(
						'<p>f{}<span class="ck-fake-bookmark-selection ck-fake-bookmark-selection_collapsed"></span>o</p>'
					);
					expect( editor.getData() ).to.equal( '<p>fo</p>' );
				} );

				it( 'should be displayed on selection focus when selection contains only one empty element ' +
					'(selection focus is at the beginning of the first non-empty element)', () => {
					setModelData( editor.model, '<paragraph>foo[</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>]bar</paragraph>' );

					bookmarkUIFeature._showFormView();

					expect( editor.model.markers.has( 'bookmark-ui' ) ).to.be.true;

					const focus = editor.model.document.selection.focus;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( focus, 0 )
					);

					const markerRange = editor.model.markers.get( 'bookmark-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					const expectedViewData = '<p>foo{</p>' +
						'<p></p>' +
						'<p>]<span class="ck-fake-bookmark-selection ck-fake-bookmark-selection_collapsed"></span>bar</p>';

					expect( getViewData( editor.editing.view ) ).to.equal( expectedViewData );
					expect( editor.getData() ).to.equal( '<p>foo</p><p>&nbsp;</p><p>bar</p>' );
				} );

				it( 'should be displayed on selection focus when selection contains few empty elements ' +
					'(selection focus is at the beginning of the first non-empty element)', () => {
					setModelData( editor.model, '<paragraph>foo[</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>]bar</paragraph>' );

					bookmarkUIFeature._showFormView();

					expect( editor.model.markers.has( 'bookmark-ui' ) ).to.be.true;

					const focus = editor.model.document.selection.focus;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( focus, 0 )
					);

					const markerRange = editor.model.markers.get( 'bookmark-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					const expectedViewData = '<p>foo{</p>' +
						'<p></p>' +
						'<p></p>' +
						'<p>]<span class="ck-fake-bookmark-selection ck-fake-bookmark-selection_collapsed"></span>bar</p>';

					expect( getViewData( editor.editing.view ) ).to.equal( expectedViewData );
					expect( editor.getData() ).to.equal( '<p>foo</p><p>&nbsp;</p><p>&nbsp;</p><p>bar</p>' );
				} );

				it( 'should be displayed on selection focus when selection contains few empty elements ' +
					'(selection focus is inside an empty element)', () => {
					setModelData( editor.model, '<paragraph>foo[</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>]</paragraph>' +
						'<paragraph>bar</paragraph>' );

					bookmarkUIFeature._showFormView();

					expect( editor.model.markers.has( 'bookmark-ui' ) ).to.be.true;

					const focus = editor.model.document.selection.focus;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( focus, 0 )
					);

					const markerRange = editor.model.markers.get( 'bookmark-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					const expectedViewData = '<p>foo{</p>' +
						'<p></p>' +
						'<p>]<span class="ck-fake-bookmark-selection ck-fake-bookmark-selection_collapsed"></span></p>' +
						'<p>bar</p>';

					expect( getViewData( editor.editing.view ) ).to.equal( expectedViewData );
					expect( editor.getData() ).to.equal( '<p>foo</p><p>&nbsp;</p><p>&nbsp;</p><p>bar</p>' );
				} );
			} );
		} );
	} );

	describe( '_addFormView()', () => {
		beforeEach( () => {
			editor.editing.view.document.isFocused = true;
		} );

		it( 'should create #formView', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._addFormView();

			expect( bookmarkUIFeature.formView ).to.be.instanceOf( BookmarkFormView );
		} );

		it( 'should add #formView to the balloon and attach the balloon to the selection when text fragment is selected', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._addFormView();
			formView = bookmarkUIFeature.formView;

			expect( balloon.visibleView ).to.equal( formView );
		} );

		it( 'should implement the CSS transition disabling feature', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._addFormView();

			expect( bookmarkUIFeature.formView.disableCssTransitions ).to.be.a( 'function' );
		} );

		describe( 'button label', () => {
			it( 'should have "Insert" by default', () => {
				bookmarkUIFeature._addFormView();
				formView = bookmarkUIFeature.formView;

				expect( formView.saveButtonView.label ).to.equal( 'Insert' );
			} );

			it( 'should have "Insert" label when bookmark is not selected', () => {
				setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

				bookmarkUIFeature._addFormView();
				formView = bookmarkUIFeature.formView;

				bookmarkUIFeature._showFormView();

				expect( formView.saveButtonView.label ).to.equal( 'Insert' );
			} );

			it( 'should have "Save" label when bookmark is selected', () => {
				setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="id"></bookmark>]</paragraph>' );

				bookmarkUIFeature._addFormView();
				formView = bookmarkUIFeature.formView;

				bookmarkUIFeature._showFormView();

				expect( formView.saveButtonView.label ).to.equal( 'Save' );
			} );

			it( 'should have "Save" label when bookmark already inserted but balloon is not closed.', () => {
				setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );
				bookmarkUIFeature._showFormView();
				formView = bookmarkUIFeature.formView;

				expect( formView.saveButtonView.label ).to.equal( 'Insert' );

				formView.idInputView.fieldView.value = 'new_id';

				formView.fire( 'submit' );
				bookmarkUIFeature._showFormView();

				expect( formView.saveButtonView.label ).to.equal( 'Save' );
			} );
		} );
	} );

	describe( '_hideFormView()', () => {
		beforeEach( () => {
			bookmarkUIFeature._showFormView();

			formView = bookmarkUIFeature.formView;
		} );

		it( 'should remove the UI from the balloon', () => {
			expect( balloon.hasView( formView ) ).to.be.true;

			bookmarkUIFeature._hideFormView();

			expect( balloon.hasView( formView ) ).to.be.false;
		} );

		it( 'should focus the `editable` by default', () => {
			const spy = testUtils.sinon.spy( editor.editing.view, 'focus' );

			bookmarkUIFeature._hideFormView();

			// First call is from _removeFormView.
			sinon.assert.calledTwice( spy );
		} );

		it( 'should focus the `editable` before before removing elements from the balloon', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
			const removeSpy = testUtils.sinon.spy( balloon, 'remove' );

			bookmarkUIFeature._hideFormView();

			expect( focusSpy.calledBefore( removeSpy ) ).to.equal( true );
		} );

		it( 'should not throw an error when views are not in the `balloon`', () => {
			bookmarkUIFeature._hideFormView();

			expect( () => {
				bookmarkUIFeature._hideFormView();
			} ).to.not.throw();
		} );

		it( 'should clear ui#update listener from the ViewDocument', () => {
			const spy = sinon.spy();

			bookmarkUIFeature.listenTo( editor.ui, 'update', spy );
			bookmarkUIFeature._hideFormView();
			editor.ui.fire( 'update' );

			sinon.assert.notCalled( spy );
		} );

		it( 'should clear the fake visual selection from a selected text fragment', () => {
			expect( editor.model.markers.has( 'bookmark-ui' ) ).to.be.true;

			bookmarkUIFeature._hideFormView();

			expect( editor.model.markers.has( 'bookmark-ui' ) ).to.be.false;
		} );

		it( 'should not throw if selection includes soft break before text item', () => {
			bookmarkUIFeature._hideFormView();

			setModelData( editor.model, '<paragraph>[<softBreak></softBreak>fo]</paragraph>' );

			bookmarkUIFeature._showFormView();

			expect( () => {
				bookmarkUIFeature._hideFormView();
			} ).to.not.throw();
		} );

		it( 'should be called when the back button is clicked', () => {
			const spy = testUtils.sinon.spy( bookmarkUIFeature, '_hideFormView' );

			bookmarkUIFeature._showFormView();
			formView.backButtonView.fire( 'execute' );

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'keyboard support', () => {
		beforeEach( () => {
			// Make sure that forms are lazy initiated.
			expect( bookmarkUIFeature.formView ).to.be.null;

			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;
		} );

		it( 'should hide the UI after Esc key press (from editor) and not focus the editable', () => {
			const spy = testUtils.sinon.spy( bookmarkUIFeature, '_hideFormView' );
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			// Balloon is visible.
			bookmarkUIFeature._showFormView();
			editor.keystrokes.press( keyEvtData );

			sinon.assert.calledWithExactly( spy );
		} );

		it( 'should hide the UI after Esc key press when form has focus', () => {
			const spy = testUtils.sinon.spy( bookmarkUIFeature, '_hideFormView' );
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;

			bookmarkUIFeature._showFormView();
			bookmarkUIFeature._removeFormView();

			formView.keystrokes.press( keyEvtData );
			expect( balloon.visibleView ).to.equal( null );
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should not hide the UI after Esc key press (from editor) when UI is open but is not visible', () => {
			const spy = testUtils.sinon.spy( bookmarkUIFeature, '_hideFormView' );
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

			sinon.assert.notCalled( spy );
		} );
	} );

	describe( 'mouse support', () => {
		beforeEach( () => {
			// Make sure that forms are lazy initiated.
			expect( bookmarkUIFeature.formView ).to.be.null;

			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;
		} );

		it( 'should hide the UI and not focus editable upon clicking outside the UI', () => {
			const spy = testUtils.sinon.spy( bookmarkUIFeature, '_hideFormView' );

			bookmarkUIFeature._showFormView();
			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.calledWithExactly( spy, false );
		} );

		it( 'should not hide the UI upon clicking inside the the UI', () => {
			const spy = testUtils.sinon.spy( bookmarkUIFeature, '_hideFormView' );

			bookmarkUIFeature._showFormView();
			balloon.view.element.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( spy );
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
		expect( actual, 'startContainer' ).to.have.property( 'startContainer', expected.startContainer );
		expect( actual, 'startOffset' ).to.have.property( 'startOffset', expected.startOffset );
		expect( actual, 'endContainer' ).to.have.property( 'endContainer', expected.endContainer );
		expect( actual, 'endOffset' ).to.have.property( 'endOffset', expected.endOffset );
	}
} );
