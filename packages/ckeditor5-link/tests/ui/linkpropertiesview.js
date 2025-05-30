/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	Collection,
	KeystrokeHandler,
	FocusTracker,
	keyCodes
} from '@ckeditor/ckeditor5-utils';
import {
	View,
	FocusCycler,
	ViewCollection,
	SwitchButtonView
} from '@ckeditor/ckeditor5-ui';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import LinkPropertiesView from '../../src/ui/linkpropertiesview.js';
import ManualDecorator from '../../src/utils/manualdecorator.js';

const mockLocale = { t: val => val };

describe( 'LinkPropertiesView', () => {
	let view, collection, linkCommand, decorator1, decorator2, decorator3;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		collection = new Collection();

		decorator1 = new ManualDecorator( {
			id: 'decorator1',
			label: 'Foo',
			attributes: {
				foo: 'bar'
			}
		} );

		decorator2 = new ManualDecorator( {
			id: 'decorator2',
			label: 'Download',
			attributes: {
				download: 'download'
			},
			defaultValue: true
		} );

		decorator3 = new ManualDecorator( {
			id: 'decorator3',
			label: 'Multi',
			attributes: {
				class: 'fancy-class',
				target: '_blank',
				rel: 'noopener noreferrer'
			}
		} );

		collection.addMany( [
			decorator1,
			decorator2,
			decorator3
		] );

		view = new LinkPropertiesView( mockLocale );

		view.listChildren.bindTo( collection ).using( decorator => {
			const button = new SwitchButtonView();

			button.set( {
				label: decorator.label,
				withText: true
			} );

			button.bind( 'isOn' ).toMany( [ decorator ], 'value', decoratorValue => {
				return Boolean( decoratorValue === undefined ? decorator.defaultValue : decoratorValue );
			} );

			button.on( 'execute', () => {
				decorator.set( 'value', !button.isOn );
			} );

			return button;
		} );

		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
		collection.clear();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName.toLowerCase() ).to.equal( 'div' );
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-link-properties' ) ).to.true;
		} );

		it( 'should create child views', () => {
			expect( view.backButtonView ).to.be.instanceOf( View );
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

		it( 'should fire `back` event on backButtonView#execute', () => {
			const spy = sinon.spy();

			view.on( 'back', spy );

			view.backButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );

		describe( 'template', () => {
			it( 'has back button', () => {
				const button = view.template.children[ 0 ].get( 0 ).template.children[ 0 ].get( 0 );

				expect( button ).to.equal( view.backButtonView );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child views in #_focusables', () => {
			expect( view._focusables.map( f => f ) ).to.have.members( [
				view.backButtonView,
				...view.listChildren
			] );
		} );

		it( 'should register child views #element in #focusTracker', () => {
			expect( view.focusTracker.elements[ 0 ] ).to.equal( view.listChildren.get( 0 ).element );
			expect( view.focusTracker.elements[ 1 ] ).to.equal( view.listChildren.get( 1 ).element );
			expect( view.focusTracker.elements[ 2 ] ).to.equal( view.listChildren.get( 2 ).element );
			expect( view.focusTracker.elements[ 3 ] ).to.equal( view.backButtonView.element );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new LinkPropertiesView( mockLocale, linkCommand );
			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );

			view.destroy();
		} );

		describe( 'activates keyboard navigation', () => {
			it( 'so "tab" focuses the next focusable item', () => {
				const spy = sinon.spy( view.backButtonView, 'focus' );

				const keyEvtData = {
					keyCode: keyCodes.tab,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the focus on last switch button.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.listChildren.last.element;
				view.keystrokes.press( keyEvtData );

				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );

			it( 'so "shift + tab" focuses the previous focusable item', () => {
				const spy = sinon.spy( view.listChildren.last, 'focus' );

				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the cancel button is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.backButtonView.element;
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
		it( 'focuses the first switch button', () => {
			const spy = sinon.spy( view.listChildren.first, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
