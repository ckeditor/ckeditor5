/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals document, Event */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';

import { View, ButtonView, ContextualBalloon, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import { icons } from '@ckeditor/ckeditor5-core';
import { ClickObserver } from '@ckeditor/ckeditor5-engine';
import { indexOf, isRange, keyCodes } from '@ckeditor/ckeditor5-utils';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import BookmarkFormView from '../src/ui/bookmarkformview.js';
import BookmarkActionsView from '../src/ui/bookmarkactionsview.js';
import BookmarkEditing from '../src/bookmarkediting.js';
import BookmarkUI from '../src/bookmarkui.js';

const bookmarkIcon = icons.bookmark;

describe( 'BookmarkUI', () => {
	let editor, element, button, balloon, bookmarkUIFeature, formView, actionsView;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ BookmarkUI, BookmarkEditing, Essentials, Paragraph, BlockQuote ]
		} );

		bookmarkUIFeature = editor.plugins.get( BookmarkUI );
		balloon = editor.plugins.get( ContextualBalloon );

		// There is no point to execute BalloonPanelView attachTo and pin methods so lets override it.
		testUtils.sinon.stub( balloon.view, 'attachTo' ).returns( {} );
		testUtils.sinon.stub( balloon.view, 'pin' ).returns( {} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should have proper "requires" value', () => {
		expect( BookmarkUI.requires ).to.deep.equal( [ BookmarkEditing, ContextualBalloon ] );
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
		expect( bookmarkUIFeature.actionsView ).to.be.null;
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
			expect( button.icon ).to.equal( bookmarkIcon );
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
			const spy = testUtils.sinon.spy( bookmarkUIFeature, '_showUI' );

			button.fire( 'execute' );

			sinon.assert.calledOnce( spy );
		} );
	}

	describe( '_showUI()', () => {
		let balloonAddSpy;

		beforeEach( () => {
			balloonAddSpy = testUtils.sinon.spy( balloon, 'add' );
			editor.editing.view.document.isFocused = true;
		} );

		it( 'should create #formView', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._showUI();

			expect( bookmarkUIFeature.formView ).to.be.instanceOf( BookmarkFormView );
		} );

		it( 'should not throw if the UI is already visible', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._showUI();

			expect( () => {
				bookmarkUIFeature._showUI();
			} ).to.not.throw();
		} );

		it( 'should add #formView to the balloon and attach the balloon to the selection when text fragment is selected', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._showUI();
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

			bookmarkUIFeature._showUI();
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

		it( 'should bind buttonView #isEnabled to insert and update command', () => {
			const insertBookmark = editor.commands.get( 'insertBookmark' );
			const updateBookmark = editor.commands.get( 'updateBookmark' );

			bookmarkUIFeature._showUI();
			const buttonView = bookmarkUIFeature.formView.buttonView;

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

		it( 'should add #actionsView to the balloon and attach the balloon to the bookmark element when selected', () => {
			setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );
			const bookmarkElement = editor.editing.view.getDomRoot().querySelector( 'a' );

			bookmarkUIFeature._showUI();
			formView = bookmarkUIFeature.formView;
			actionsView = bookmarkUIFeature.actionsView;

			expect( balloon.visibleView ).to.equal( actionsView );

			const addSpyCallArgs = balloonAddSpy.firstCall.args[ 0 ];

			expect( addSpyCallArgs.view ).to.equal( actionsView );
			expect( addSpyCallArgs.position.target ).to.be.a( 'function' );
			expect( addSpyCallArgs.position.target() ).to.equal( bookmarkElement );
		} );

		it( 'should add #formView to the balloon when bookmark is selected and #actionsView is already visible', () => {
			setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="foo"></bookmark>]</paragraph>' );
			const bookmarkElement = editor.editing.view.getDomRoot().querySelector( 'a' );

			bookmarkUIFeature._showUI();
			formView = bookmarkUIFeature.formView;
			actionsView = bookmarkUIFeature.actionsView;

			expect( balloon.visibleView ).to.equal( actionsView );

			const addSpyFirstCallArgs = balloonAddSpy.firstCall.args[ 0 ];

			expect( addSpyFirstCallArgs.view ).to.equal( actionsView );
			expect( addSpyFirstCallArgs.position.target ).to.be.a( 'function' );
			expect( addSpyFirstCallArgs.position.target() ).to.equal( bookmarkElement );

			bookmarkUIFeature._showUI();

			const addSpyCallSecondCallArgs = balloonAddSpy.secondCall.args[ 0 ];

			expect( addSpyCallSecondCallArgs.view ).to.equal( formView );
			expect( addSpyCallSecondCallArgs.position.target ).to.be.a( 'function' );
			expect( addSpyCallSecondCallArgs.position.target() ).to.equal( bookmarkElement );
		} );

		it( 'should optionally force `main` stack to be visible', () => {
			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;
			actionsView = bookmarkUIFeature.actionsView;
			formView.render();

			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			balloon.add( {
				view: new View(),
				stackId: 'secondary'
			} );

			bookmarkUIFeature._showUI( true );

			expect( balloon.visibleView ).to.equal( formView );
		} );

		it( 'should update balloon position when is switched in rotator to a visible panel', () => {
			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;
			actionsView = bookmarkUIFeature.actionsView;
			formView.render();

			setModelData( editor.model, '<paragraph>fo[<bookmark bookmarkId="foo"></bookmark>]ar</paragraph>' );
			bookmarkUIFeature._showUI();

			const customView = new View();
			const BookmarkViewElement = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 1 );
			const BookmarkDomElement = editor.editing.view.domConverter.mapViewToDom( BookmarkViewElement );

			expect( balloon.visibleView ).to.equal( actionsView );
			expect( balloon.view.pin.lastCall.args[ 0 ].target() ).to.equal( BookmarkDomElement );

			balloon.add( {
				stackId: 'custom',
				view: customView,
				position: { target: {} }
			} );

			balloon.showStack( 'custom' );

			expect( balloon.visibleView ).to.equal( customView );
			expect( balloon.hasView( actionsView ) ).to.equal( true );

			editor.execute( 'blockQuote' );
			balloon.showStack( 'main' );

			expect( balloon.visibleView ).to.equal( actionsView );
			expect( balloon.hasView( customView ) ).to.equal( true );
			expect( balloon.view.pin.lastCall.args[ 0 ].target() ).to.not.equal( BookmarkDomElement );

			const newBookmarkViewElement = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 1 );
			const newBookmarkDomElement = editor.editing.view.domConverter.mapViewToDom( newBookmarkViewElement );

			expect( balloon.view.pin.lastCall.args[ 0 ].target() ).to.equal( newBookmarkDomElement );
		} );

		it( 'should optionally force `main` stack to be visible while bookmark is selected', () => {
			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;
			actionsView = bookmarkUIFeature.actionsView;
			formView.render();

			setModelData( editor.model, '<paragraph>fo[<bookmark bookmarkId="foo"></bookmark>]ar</paragraph>' );

			balloon.add( {
				view: new View(),
				stackId: 'secondary'
			} );

			bookmarkUIFeature._showUI( true );

			expect( balloon.visibleView ).to.equal( actionsView );
		} );

		it( 'should add #formView to the balloon and attach the balloon to the marker element when selection is collapsed', () => {
			// (#7926)
			setModelData( editor.model, '<paragraph>f[]oo</paragraph>' );
			bookmarkUIFeature._showUI();
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
			bookmarkUIFeature._showUI();
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

			bookmarkUIFeature._showUI();

			formView.idInputView.fieldView.value = 'id_1';

			expect( updateSpy ).not.to.be.called;
			formView.fire( 'submit' );
			expect( updateSpy ).to.be.calledOnce;
		} );

		describe( 'form status', () => {
			it( 'should update ui on error due to change ballon position', () => {
				const updateSpy = sinon.spy( editor.ui, 'update' );

				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;
				actionsView = bookmarkUIFeature.actionsView;
				formView.render();

				setModelData( editor.model, '<paragraph>[]</paragraph>' );

				bookmarkUIFeature._showUI();

				formView.idInputView.fieldView.value = 'name with space';

				expect( updateSpy ).not.to.be.called;
				formView.fire( 'submit' );
				expect( updateSpy ).to.be.calledOnce;
			} );

			it( 'should show error form status if passed bookmark name is empty', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;
				actionsView = bookmarkUIFeature.actionsView;
				formView.render();

				setModelData( editor.model, '<paragraph><bookmark bookmarkId="foo"></bookmark>[]</paragraph>' );
				bookmarkUIFeature._showUI();

				formView.idInputView.fieldView.value = '';

				formView.fire( 'submit' );

				expect( formView.idInputView.errorText ).to.be.equal( 'Bookmark must not be empty.' );
			} );

			it( 'should show error form status if passed bookmark name containing spaces', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;
				actionsView = bookmarkUIFeature.actionsView;
				formView.render();

				setModelData( editor.model, '<paragraph>[]</paragraph>' );

				bookmarkUIFeature._showUI();

				formView.idInputView.fieldView.value = 'name with space';

				formView.fire( 'submit' );

				expect( formView.idInputView.errorText ).to.be.equal( 'Bookmark name cannot contain space characters.' );
			} );

			it( 'should show error form status if passed bookmark name already exists', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;
				actionsView = bookmarkUIFeature.actionsView;
				formView.render();

				setModelData( editor.model, '<paragraph><bookmark bookmarkId="foo"></bookmark>[]</paragraph>' );
				bookmarkUIFeature._showUI();

				formView.idInputView.fieldView.value = 'foo';

				formView.fire( 'submit' );

				expect( formView.idInputView.errorText ).to.be.equal( 'Bookmark name already exists.' );
			} );

			it( 'should reset form status on show', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;
				actionsView = bookmarkUIFeature.actionsView;
				formView.render();

				setModelData( editor.model, '<paragraph>[]</paragraph>' );
				bookmarkUIFeature._showUI();

				formView.idInputView.fieldView.value = 'name with space';

				formView.fire( 'submit' );

				expect( formView.idInputView.errorText ).to.be.equal( 'Bookmark name cannot contain space characters.' );

				bookmarkUIFeature._hideUI();
				bookmarkUIFeature._showUI();
				expect( formView.idInputView.errorText ).to.be.null;
			} );
		} );

		describe( 'response to ui#update', () => {
			it( 'should not duplicate #update listeners', () => {
				setModelData( editor.model, '<paragraph>f[<bookmark bookmarkId="id"></bookmark>]oo</paragraph>' );

				const spy = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );

				bookmarkUIFeature._showUI();
				editor.ui.fire( 'update' );
				bookmarkUIFeature._hideUI();

				bookmarkUIFeature._showUI();
				editor.ui.fire( 'update' );
				sinon.assert.calledTwice( spy );
			} );

			it( 'updates the position of the panel – creating a new bookmark, then the selection moved', () => {
				setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

				bookmarkUIFeature._showUI();
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
				actionsView = bookmarkUIFeature.actionsView;
				formView.render();

				setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="id"></bookmark>]</paragraph>' );

				bookmarkUIFeature._showUI();

				const customView = new View();

				balloon.add( {
					stackId: 'custom',
					view: customView,
					position: { target: {} }
				} );

				balloon.showStack( 'custom' );

				expect( balloon.visibleView ).to.equal( customView );
				expect( balloon.hasView( actionsView ) ).to.equal( true );

				const spy = testUtils.sinon.spy( balloon, 'updatePosition' );

				editor.ui.fire( 'update' );

				sinon.assert.notCalled( spy );
			} );

			it( 'not update the position when is in not visible stack', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.formView;

				setModelData( editor.model, '<paragraph>f[]oo</paragraph>' );

				bookmarkUIFeature._showUI();

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

				bookmarkUIFeature._showUI();

				const spyUpdate = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );
				const spyHide = testUtils.sinon.spy( bookmarkUIFeature, '_hideUI' );

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

				bookmarkUIFeature._showUI();

				const spyUpdate = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );
				const spyHide = testUtils.sinon.spy( bookmarkUIFeature, '_hideUI' );

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

				bookmarkUIFeature._showUI();

				const spyUpdate = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );
				const spyHide = testUtils.sinon.spy( bookmarkUIFeature, '_hideUI' );

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

					bookmarkUIFeature._showUI();

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

					bookmarkUIFeature._showUI();

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

					bookmarkUIFeature._showUI();

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

					bookmarkUIFeature._showUI();

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

					bookmarkUIFeature._showUI();

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

					bookmarkUIFeature._showUI();

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

					bookmarkUIFeature._showUI();

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

					bookmarkUIFeature._showUI();

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

	describe( '_addActionsView()', () => {
		beforeEach( () => {
			editor.editing.view.document.isFocused = true;
		} );

		it( 'should create #actionsView', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._addActionsView();

			expect( bookmarkUIFeature.actionsView ).to.be.instanceOf( BookmarkActionsView );
		} );

		it( 'should add #actionsView to the balloon and attach the balloon to the bookmark element when selected', () => {
			setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="id"></bookmark>]</paragraph>' );

			bookmarkUIFeature._addActionsView();
			actionsView = bookmarkUIFeature.actionsView;

			expect( balloon.visibleView ).to.equal( actionsView );
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

				expect( formView.buttonView.label ).to.equal( 'Insert' );
			} );

			it( 'should have "Insert" label when bookmark is not selected', () => {
				setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

				bookmarkUIFeature._addFormView();
				formView = bookmarkUIFeature.formView;

				bookmarkUIFeature._showUI();

				expect( formView.buttonView.label ).to.equal( 'Insert' );
			} );

			it( 'should have "Update" label when bookmark is selected', () => {
				setModelData( editor.model, '<paragraph>[<bookmark bookmarkId="id"></bookmark>]</paragraph>' );

				bookmarkUIFeature._addFormView();
				formView = bookmarkUIFeature.formView;

				bookmarkUIFeature._showUI();

				expect( formView.buttonView.label ).to.equal( 'Update' );
			} );

			it( 'should have "Update" label when bookmark already inserted but balloon is not closed.', () => {
				setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );
				bookmarkUIFeature._showUI();
				formView = bookmarkUIFeature.formView;
				actionsView = bookmarkUIFeature.actionsView;

				expect( formView.buttonView.label ).to.equal( 'Insert' );

				formView.idInputView.fieldView.value = 'new_id';

				formView.fire( 'submit' );
				actionsView.fire( 'edit' );

				expect( formView.buttonView.label ).to.equal( 'Update' );
			} );
		} );
	} );

	describe( '_hideUI()', () => {
		beforeEach( () => {
			bookmarkUIFeature._showUI();

			formView = bookmarkUIFeature.formView;
			actionsView = bookmarkUIFeature.actionsView;
		} );

		it( 'should remove the UI from the balloon', () => {
			expect( balloon.hasView( formView ) ).to.be.true;
			expect( balloon.hasView( actionsView ) ).to.be.true;

			bookmarkUIFeature._hideUI();

			expect( balloon.hasView( formView ) ).to.be.false;
			expect( balloon.hasView( actionsView ) ).to.be.false;
		} );

		it( 'should focus the `editable` by default', () => {
			const spy = testUtils.sinon.spy( editor.editing.view, 'focus' );

			bookmarkUIFeature._hideUI();

			// First call is from _removeFormView.
			sinon.assert.calledTwice( spy );
		} );

		it( 'should focus the `editable` before before removing elements from the balloon', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
			const removeSpy = testUtils.sinon.spy( balloon, 'remove' );

			bookmarkUIFeature._hideUI();

			expect( focusSpy.calledBefore( removeSpy ) ).to.equal( true );
		} );

		it( 'should not throw an error when views are not in the `balloon`', () => {
			bookmarkUIFeature._hideUI();

			expect( () => {
				bookmarkUIFeature._hideUI();
			} ).to.not.throw();
		} );

		it( 'should clear ui#update listener from the ViewDocument', () => {
			const spy = sinon.spy();

			bookmarkUIFeature.listenTo( editor.ui, 'update', spy );
			bookmarkUIFeature._hideUI();
			editor.ui.fire( 'update' );

			sinon.assert.notCalled( spy );
		} );

		it( 'should clear the fake visual selection from a selected text fragment', () => {
			expect( editor.model.markers.has( 'bookmark-ui' ) ).to.be.true;

			bookmarkUIFeature._hideUI();

			expect( editor.model.markers.has( 'bookmark-ui' ) ).to.be.false;
		} );

		it( 'should not throw if selection includes soft break before text item', () => {
			bookmarkUIFeature._hideUI();

			setModelData( editor.model, '<paragraph>[<softBreak></softBreak>fo]</paragraph>' );

			bookmarkUIFeature._showUI();

			expect( () => {
				bookmarkUIFeature._hideUI();
			} ).to.not.throw();
		} );
	} );

	describe( 'keyboard support', () => {
		beforeEach( () => {
			// Make sure that forms are lazy initiated.
			expect( bookmarkUIFeature.formView ).to.be.null;

			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;
			actionsView = bookmarkUIFeature.actionsView;
		} );

		it( 'should hide the UI after Esc key press (from editor) and not focus the editable', () => {
			const spy = testUtils.sinon.spy( bookmarkUIFeature, '_hideUI' );
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			// Balloon is visible.
			bookmarkUIFeature._showUI();
			editor.keystrokes.press( keyEvtData );

			sinon.assert.calledWithExactly( spy );
		} );

		it( 'should focus the the #actionsView on `Tab` key press when #actionsView is visible', () => {
			const keyEvtData = {
				keyCode: keyCodes.tab,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			const normalPriorityTabCallbackSpy = sinon.spy();
			const highestPriorityTabCallbackSpy = sinon.spy();
			editor.keystrokes.set( 'Tab', normalPriorityTabCallbackSpy );
			editor.keystrokes.set( 'Tab', highestPriorityTabCallbackSpy, { priority: 'highest' } );

			// Balloon is invisible, form not focused.
			actionsView.focusTracker.isFocused = false;

			const spy = sinon.spy( actionsView, 'focus' );

			editor.keystrokes.press( keyEvtData );
			sinon.assert.notCalled( keyEvtData.preventDefault );
			sinon.assert.notCalled( keyEvtData.stopPropagation );
			sinon.assert.notCalled( spy );
			sinon.assert.calledOnce( normalPriorityTabCallbackSpy );
			sinon.assert.calledOnce( highestPriorityTabCallbackSpy );

			// Balloon is visible, form focused.
			bookmarkUIFeature._showUI();
			testUtils.sinon.stub( bookmarkUIFeature, '_areActionsVisible' ).value( true );

			actionsView.focusTracker.isFocused = true;

			editor.keystrokes.press( keyEvtData );
			sinon.assert.notCalled( keyEvtData.preventDefault );
			sinon.assert.notCalled( keyEvtData.stopPropagation );
			sinon.assert.notCalled( spy );
			sinon.assert.calledTwice( normalPriorityTabCallbackSpy );
			sinon.assert.calledTwice( highestPriorityTabCallbackSpy );

			// Balloon is still visible, form not focused.
			actionsView.focusTracker.isFocused = false;

			editor.keystrokes.press( keyEvtData );
			sinon.assert.calledOnce( keyEvtData.preventDefault );
			sinon.assert.calledOnce( keyEvtData.stopPropagation );
			sinon.assert.calledOnce( spy );
			sinon.assert.calledTwice( normalPriorityTabCallbackSpy );
			sinon.assert.calledThrice( highestPriorityTabCallbackSpy );
		} );

		it( 'should hide the UI after Esc key press when form has focus', () => {
			const spy = testUtils.sinon.spy( bookmarkUIFeature, '_hideUI' );
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;

			bookmarkUIFeature._showUI();
			bookmarkUIFeature._removeFormView();

			formView.keystrokes.press( keyEvtData );
			expect( balloon.visibleView ).to.equal( null );
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should not hide the UI after Esc key press (from editor) when UI is open but is not visible', () => {
			const spy = testUtils.sinon.spy( bookmarkUIFeature, '_hideUI' );
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

			bookmarkUIFeature._showUI();

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
			expect( bookmarkUIFeature.actionsView ).to.be.null;

			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;
			actionsView = bookmarkUIFeature.actionsView;
		} );

		it( 'should hide the UI and not focus editable upon clicking outside the UI', () => {
			const spy = testUtils.sinon.spy( bookmarkUIFeature, '_hideUI' );

			bookmarkUIFeature._showUI();
			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.calledWithExactly( spy );
		} );

		it( 'should hide the UI when bookmark is in not currently visible stack', () => {
			const spy = testUtils.sinon.spy( bookmarkUIFeature, '_hideUI' );

			balloon.add( {
				view: new View(),
				stackId: 'secondary'
			} );

			bookmarkUIFeature._showUI();

			// Be sure any of bookmark view is not currently visible/
			expect( balloon.visibleView ).to.not.equal( formView );
			expect( balloon.visibleView ).to.not.equal( actionsView );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.calledWithExactly( spy );
		} );

		it( 'should not hide the UI upon clicking inside the the UI', () => {
			const spy = testUtils.sinon.spy( bookmarkUIFeature, '_hideUI' );

			bookmarkUIFeature._showUI();
			balloon.view.element.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( spy );
		} );

		describe( 'clicking on editable', () => {
			let observer, spy;

			beforeEach( () => {
				observer = editor.editing.view.getObserver( ClickObserver );
				editor.model.schema.extend( 'bookmark', { allowIn: '$root' } );

				spy = testUtils.sinon.stub( bookmarkUIFeature, '_showUI' ).returns( {} );
			} );

			it( 'should show the UI when bookmark element selected', () => {
				setModelData( editor.model, '<bookmark bookmarkId="id"></bookmark>' );

				observer.fire( 'click', { target: document.body } );
				sinon.assert.calledWithExactly( spy );
			} );

			it( 'should do nothing when selection is not inside link element', () => {
				setModelData( editor.model, '[]' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );
		} );
	} );

	describe( 'actions view', () => {
		let focusEditableSpy;

		beforeEach( () => {
			// Make sure that forms are lazy initiated.
			expect( bookmarkUIFeature.formView ).to.be.null;
			expect( bookmarkUIFeature.actionsView ).to.be.null;

			bookmarkUIFeature._createViews();
			formView = bookmarkUIFeature.formView;
			actionsView = bookmarkUIFeature.actionsView;

			formView.render();

			focusEditableSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
		} );

		it( 'should mark the editor UI as focused when the #actionsView is focused', () => {
			bookmarkUIFeature._showUI();
			bookmarkUIFeature._removeFormView();

			expect( balloon.visibleView ).to.equal( actionsView );

			editor.ui.focusTracker.isFocused = false;
			actionsView.element.dispatchEvent( new Event( 'focus' ) );

			expect( editor.ui.focusTracker.isFocused ).to.be.true;
		} );

		describe( 'binding', () => {
			it( 'should show the #formView on #edit event and select the ID input field', () => {
				bookmarkUIFeature._showUI();
				bookmarkUIFeature._removeFormView();

				const selectSpy = testUtils.sinon.spy( formView.idInputView.fieldView, 'select' );
				actionsView.fire( 'edit' );

				expect( balloon.visibleView ).to.equal( formView );
				sinon.assert.calledOnce( selectSpy );
			} );

			it( 'should disable CSS transitions before showing the form to avoid unnecessary animations' +
				'(and then enable them again)', () => {
				const addSpy = testUtils.sinon.spy( balloon, 'add' );
				const disableCssTransitionsSpy = testUtils.sinon.spy( formView, 'disableCssTransitions' );
				const enableCssTransitionsSpy = testUtils.sinon.spy( formView, 'enableCssTransitions' );
				const selectSpy = testUtils.sinon.spy( formView.idInputView.fieldView, 'select' );

				actionsView.fire( 'edit' );

				sinon.assert.callOrder( disableCssTransitionsSpy, addSpy, selectSpy, enableCssTransitionsSpy );
			} );

			it( 'should hide and focus editable on actionsView#remove event', () => {
				bookmarkUIFeature._showUI();
				bookmarkUIFeature._removeFormView();

				// Removing the form would call the focus spy.
				focusEditableSpy.resetHistory();
				actionsView.fire( 'remove' );

				expect( balloon.visibleView ).to.be.null;
				expect( focusEditableSpy.calledOnce ).to.be.true;
			} );

			it( 'should hide after Esc key press', () => {
				const keyEvtData = {
					keyCode: keyCodes.esc,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				bookmarkUIFeature._showUI();
				bookmarkUIFeature._removeFormView();

				// Removing the form would call the focus spy.
				focusEditableSpy.resetHistory();

				actionsView.keystrokes.press( keyEvtData );
				expect( balloon.visibleView ).to.equal( null );
				expect( focusEditableSpy.calledOnce ).to.be.true;
			} );
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
