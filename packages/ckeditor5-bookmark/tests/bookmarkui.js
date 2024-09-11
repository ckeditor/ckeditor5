/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import indexOf from '@ckeditor/ckeditor5-utils/src/dom/indexof.js';
import isRange from '@ckeditor/ckeditor5-utils/src/dom/isrange.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon.js';
import BookmarkInsertView from '../src/ui/bookmarkview.js';

import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import BookmarkUI from '../src/bookmarkui.js';

import bookmarkIcon from '../theme/icons/bookmark.svg';

describe( 'BookmarkUI', () => {
	let editor, element, button, balloon, bookmarkUIFeature, bookmarkView, formView;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ BookmarkUI, Essentials, Paragraph ]
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

	it( 'should be correctly named', () => {
		expect( BookmarkUI.pluginName ).to.equal( 'BookmarkUI' );
	} );

	it( 'should load ContextualBalloon', () => {
		expect( editor.plugins.get( ContextualBalloon ) ).to.be.instanceOf( ContextualBalloon );
	} );

	it( 'should not create #bookmarkView', () => {
		expect( bookmarkUIFeature.bookmarkView ).to.be.null;
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

		it( 'should create #bookmarkView', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._showUI();

			expect( bookmarkUIFeature.bookmarkView ).to.be.instanceOf( BookmarkInsertView );
		} );

		it( 'should not throw if the UI is already visible', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._showUI();

			expect( () => {
				bookmarkUIFeature._showUI();
			} ).to.not.throw();
		} );

		it( 'should add #bookmarkView to the balloon and attach the balloon to the selection when text fragment is selected', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			bookmarkUIFeature._showUI();
			bookmarkView = bookmarkUIFeature.bookmarkView;

			const expectedRange = getMarkersRange( editor );

			expect( balloon.visibleView ).to.equal( bookmarkView );
			sinon.assert.calledWithExactly( balloonAddSpy, {
				view: bookmarkView,
				position: {
					target: sinon.match( isRange )
				}
			} );

			assertDomRange( expectedRange, balloonAddSpy.args[ 0 ][ 0 ].position.target );
		} );

		it( 'should add #bookmarkView to the balloon and attach the balloon to the marker element when selection is collapsed', () => {
			// (#7926)
			setModelData( editor.model, '<paragraph>f[]oo</paragraph>' );
			bookmarkUIFeature._showUI();
			bookmarkView = bookmarkUIFeature.bookmarkView;

			const expectedRange = getMarkersRange( editor );

			expect( balloon.visibleView ).to.equal( bookmarkView );
			sinon.assert.calledWithExactly( balloonAddSpy, {
				view: bookmarkView,
				position: {
					target: sinon.match( isRange )
				}
			} );
			assertDomRange( expectedRange, balloonAddSpy.args[ 0 ][ 0 ].position.target );
		} );

		describe( 'form status', () => {
			it( 'should update ui on error due to change ballon position', () => {
				const updateSpy = sinon.spy( editor.ui, 'update' );

				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.bookmarkView.formView;

				setModelData( editor.model, '<paragraph>[foo]</paragraph>' );

				bookmarkUIFeature._showUI();

				formView.idInputView.fieldView.value = 'id 1';

				expect( updateSpy ).not.to.be.called;
				formView.fire( 'submit' );
				expect( updateSpy ).to.be.calledOnce;
			} );

			it( 'should show error form status if passed invalid ID', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.bookmarkView.formView;

				setModelData( editor.model, '<paragraph>[foo]</paragraph>' );

				bookmarkUIFeature._showUI();

				formView.idInputView.fieldView.value = 'id 1';

				formView.fire( 'submit' );

				expect( formView.idInputView.errorText ).to.be.equal( 'Spaces not allowed in ID.' );
			} );

			it( 'should reset error form status after filling invalid ID', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.bookmarkView.formView;

				setModelData( editor.model, '<paragraph>[foo]</paragraph>' );

				bookmarkUIFeature._showUI();

				formView.idInputView.fieldView.value = 'id 1';

				formView.fire( 'submit' );
				expect( formView.idInputView.errorText ).to.be.equal( 'Spaces not allowed in ID.' );

				formView.idInputView.fieldView.value = 'id_1';
				formView.fire( 'submit' );

				expect( formView.idInputView.errorText ).to.be.null;
			} );

			it( 'should reset form status on show', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.bookmarkView.formView;

				setModelData( editor.model, '<paragraph>[foo]</paragraph>' );
				bookmarkUIFeature._showUI();

				formView.idInputView.fieldView.value = 'id 1';

				formView.fire( 'submit' );
				expect( formView.idInputView.errorText ).to.be.equal( 'Spaces not allowed in ID.' );

				bookmarkUIFeature._hideUI();
				bookmarkUIFeature._showUI();
				expect( formView.idInputView.errorText ).to.be.null;
			} );
		} );

		describe( 'response to ui#update', () => {
			let view, viewDocument;

			beforeEach( () => {
				view = editor.editing.view;
				viewDocument = view.document;
			} );

			it( 'should not duplicate #update listeners', () => {
				setModelData( editor.model, '<paragraph>f[]oo</paragraph>' );

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

				const root = viewDocument.getRoot();
				const text = root.getChild( 0 ).getChild( 2 );

				view.change( writer => {
					writer.setSelection( text, 1, true );
				} );

				const expectedRange = getMarkersRange( editor );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, {
					target: sinon.match( isRange )
				} );

				assertDomRange( expectedRange, spy.args[ 0 ][ 0 ].target );
			} );

			it( 'not update the position when is in not visible stack', () => {
				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.bookmarkView.formView;

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

		describe( '_addFormView()', () => {
			beforeEach( () => {
				editor.editing.view.document.isFocused = true;
			} );

			it( 'should create #bookmarkView', () => {
				setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

				bookmarkUIFeature._addFormView();

				expect( bookmarkUIFeature.bookmarkView ).to.be.instanceOf( BookmarkInsertView );
			} );

			it( 'should add #formView to the balloon and attach the balloon to the selection when text fragment is selected', () => {
				setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

				bookmarkUIFeature._addFormView();
				bookmarkView = bookmarkUIFeature.bookmarkView;

				expect( balloon.visibleView ).to.equal( bookmarkView );
			} );

			it( 'should implement the CSS transition disabling feature', () => {
				setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

				bookmarkUIFeature._addFormView();

				expect( bookmarkUIFeature.bookmarkView.formView.disableCssTransitions ).to.be.a( 'function' );
			} );
		} );

		describe( '_hideUI()', () => {
			beforeEach( () => {
				bookmarkUIFeature._showUI();

				bookmarkView = bookmarkUIFeature.bookmarkView;
			} );

			it( 'should remove the UI from the balloon', () => {
				expect( balloon.hasView( bookmarkView ) ).to.be.true;

				bookmarkUIFeature._hideUI();

				expect( balloon.hasView( bookmarkView ) ).to.be.false;
			} );

			it( 'should focus the `editable` by default', () => {
				const spy = testUtils.sinon.spy( editor.editing.view, 'focus' );

				bookmarkUIFeature._hideUI();

				// First call is from _removeFormView.
				sinon.assert.calledTwice( spy );
			} );

			// https://github.com/ckeditor/ckeditor5-link/issues/193
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
				expect( bookmarkUIFeature.bookmarkView ).to.be.null;

				bookmarkUIFeature._createViews();
				bookmarkView = bookmarkUIFeature.bookmarkView;
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

			it( 'should hide the UI after Esc key press when form has focus', () => {
				const spy = testUtils.sinon.spy( bookmarkUIFeature, '_hideUI' );
				const keyEvtData = {
					keyCode: keyCodes.esc,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				bookmarkUIFeature._createViews();
				formView = bookmarkUIFeature.bookmarkView.formView;

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
				expect( bookmarkUIFeature.bookmarkView ).to.be.null;

				bookmarkUIFeature._createViews();
				bookmarkView = bookmarkUIFeature.bookmarkView;
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

				document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

				sinon.assert.calledWithExactly( spy );
			} );

			it( 'should not hide the UI upon clicking inside the the UI', () => {
				const spy = testUtils.sinon.spy( bookmarkUIFeature, '_hideUI' );

				bookmarkUIFeature._showUI();
				balloon.view.element.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

				sinon.assert.notCalled( spy );
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
