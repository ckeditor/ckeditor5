/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import {
	KeystrokeHandler,
	FocusTracker,
	keyCodes
} from '@ckeditor/ckeditor5-utils';

import {
	View,
	ListView,
	FocusCycler,
	ViewCollection,
	ButtonView
} from '@ckeditor/ckeditor5-ui';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import LinkBookmarksView from '../../src/ui/linkbookmarksview.js';

const mockLocale = { t: val => val };

describe( 'LinkBookmarksView', () => {
	let view, bookmarksButtonsArrayMock;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new LinkBookmarksView( mockLocale );
		view.render();
		document.body.appendChild( view.element );

		bookmarksButtonsArrayMock = [
			createButton( 'Mocked bookmark button 1' ),
			createButton( 'Mocked bookmark button 2' ),
			createButton( 'Mocked bookmark button 3' )
		];
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName.toLowerCase() ).to.equal( 'div' );
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-link__panel' ) ).to.true;
			expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
		} );

		it( 'should create child views', () => {
			expect( view.backButton ).to.be.instanceOf( ButtonView );
			expect( view.listView ).to.be.instanceOf( ListView );
			expect( view.emptyListInformation ).to.be.instanceOf( View );
			expect( view.children ).to.be.instanceOf( ViewCollection );
			expect( view.listChildren ).to.be.instanceOf( ViewCollection );
			expect( view.children ).to.be.instanceOf( ViewCollection );
		} );

		it( 'should create #focusTracker instance', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'should create #_focusCycler instance', () => {
			expect( view._focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		it( 'should create #_focusables view collection', () => {
			expect( view._focusables ).to.be.instanceOf( ViewCollection );
		} );

		it( 'should create #hasItems instance and set it to `false`', () => {
			expect( view.hasItems ).to.be.equal( false );

			view.listChildren.addMany( bookmarksButtonsArrayMock );

			expect( view.hasItems ).to.be.equal( true );

			view.listChildren.clear();

			expect( view.hasItems ).to.be.equal( false );
		} );

		it( 'should fire `cancel` event on backButton#execute', () => {
			const spy = sinon.spy();

			view.on( 'cancel', spy );

			view.backButton.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );

		describe( 'template', () => {
			it( 'has back button', () => {
				const button = view.template.children[ 0 ].get( 0 ).template.children[ 0 ].get( 0 );

				expect( button ).to.equal( view.backButton );
			} );
		} );

		it( 'should create emptyListInformation element from template', () => {
			const emptyListInformation = view.emptyListInformation;

			expect( emptyListInformation.element.tagName.toLowerCase() ).to.equal( 'p' );
			expect( emptyListInformation.element.classList.contains( 'ck' ) ).to.true;
			expect( emptyListInformation.element.classList.contains( 'ck-link__empty-prompt' ) ).to.true;

			expect( emptyListInformation.template.children[ 0 ].text[ 0 ] ).to.equal( 'No bookmarks available.' );
		} );
	} );

	describe( 'bindings', () => {
		it( 'should hide and reveal the #actionsView after Esc key press if link command has a value', () => {
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			view.keystrokes.press( keyEvtData );

			sinon.assert.calledOnce( keyEvtData.preventDefault );
			sinon.assert.calledOnce( keyEvtData.stopPropagation );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child views in #_focusables', () => {
			expect( view._focusables.map( f => f ) ).to.have.members( [
				view.backButton,
				view.listView
			] );
		} );

		it( 'should register child views #element in #focusTracker', () => {
			const view = new LinkBookmarksView( mockLocale );
			const spy = testUtils.sinon.spy( view.focusTracker, 'add' );

			view.render();

			sinon.assert.calledWithExactly( spy.getCall( 0 ), view.listView.element );
			sinon.assert.calledWithExactly( spy.getCall( 1 ), view.backButton.element );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new LinkBookmarksView( mockLocale );
			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );

			view.destroy();
		} );

		describe( 'activates keyboard navigation for the toolbar', () => {
			let view;

			testUtils.createSinonSandbox();

			beforeEach( () => {
				view = new LinkBookmarksView( mockLocale );
				view.render();
				document.body.appendChild( view.element );

				view.listChildren.addMany( bookmarksButtonsArrayMock );
			} );

			afterEach( () => {
				view.element.remove();
				view.destroy();
			} );

			it( 'so "tab" focuses the next focusable item', () => {
				expect( view.hasItems ).to.be.equal( true );

				const spy = sinon.spy( view.backButton, 'focus' );
				const keyEvtData = {
					keyCode: keyCodes.tab,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the focus on list.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.listView.element;
				view.keystrokes.press( keyEvtData );

				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );

			it( 'so "shift + tab" focuses the previous focusable item', () => {
				expect( view.hasItems ).to.be.equal( true );

				const spy = sinon.spy( view.listView, 'focus' );
				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the back button is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.backButton.element;
				view.keystrokes.press( keyEvtData );

				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = sinon.spy( view.focusTracker, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = sinon.spy( view.keystrokes, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the back button when bookmarks list is empty', () => {
			const backButtonSpy = sinon.spy( view.backButton, 'focus' );

			view.focus();

			sinon.assert.calledOnce( backButtonSpy );
		} );

		it( 'focuses the back button when bookmarks list is not empty', () => {
			const backButtonSpy = sinon.spy( view.backButton, 'focus' );

			view.listChildren.addMany( bookmarksButtonsArrayMock );

			const listItemSpy = sinon.spy( view.listChildren.first, 'focus' );

			view.focus();

			sinon.assert.notCalled( backButtonSpy );
			sinon.assert.calledOnce( listItemSpy );
		} );
	} );

	function createButton( label ) {
		const button = new ButtonView( mockLocale );

		button.set( {
			label,
			withText: true
		} );

		return button;
	}
} );
