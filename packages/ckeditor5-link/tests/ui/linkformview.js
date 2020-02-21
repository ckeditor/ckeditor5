/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Event, document */

import LinkFormView from '../../src/ui/linkformview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ManualDecorator from '../../src/utils/manualdecorator';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Link from '../../src/link';

describe( 'LinkFormView', () => {
	let view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new LinkFormView( { t: val => val } );
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-link-form' ) ).to.true;
			expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
		} );

		it( 'should create child views', () => {
			expect( view.urlInputView ).to.be.instanceOf( View );
			expect( view.saveButtonView ).to.be.instanceOf( View );
			expect( view.cancelButtonView ).to.be.instanceOf( View );

			expect( view.saveButtonView.element.classList.contains( 'ck-button-save' ) ).to.be.true;
			expect( view.cancelButtonView.element.classList.contains( 'ck-button-cancel' ) ).to.be.true;

			expect( view.children.get( 0 ) ).to.equal( view.urlInputView );
			expect( view.children.get( 1 ) ).to.equal( view.saveButtonView );
			expect( view.children.get( 2 ) ).to.equal( view.cancelButtonView );
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

		it( 'should fire `cancel` event on cancelButtonView#execute', () => {
			const spy = sinon.spy();

			view.on( 'cancel', spy );

			view.cancelButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );

		describe( 'url input view', () => {
			it( 'has placeholder', () => {
				expect( view.urlInputView.inputView.placeholder ).to.equal( 'https://example.com' );
			} );
		} );

		describe( 'template', () => {
			it( 'has url input view', () => {
				expect( view.template.children[ 0 ].get( 0 ) ).to.equal( view.urlInputView );
			} );

			it( 'has button views', () => {
				expect( view.template.children[ 0 ].get( 1 ) ).to.equal( view.saveButtonView );
				expect( view.template.children[ 0 ].get( 2 ) ).to.equal( view.cancelButtonView );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child views in #_focusables', () => {
			expect( view._focusables.map( f => f ) ).to.have.members( [
				view.urlInputView,
				view.saveButtonView,
				view.cancelButtonView
			] );
		} );

		it( 'should register child views\' #element in #focusTracker', () => {
			const spy = testUtils.sinon.spy( FocusTracker.prototype, 'add' );

			view = new LinkFormView( { t: () => {} } );
			view.render();

			sinon.assert.calledWithExactly( spy.getCall( 0 ), view.urlInputView.element );
			sinon.assert.calledWithExactly( spy.getCall( 1 ), view.saveButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 2 ), view.cancelButtonView.element );
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			view = new LinkFormView( { t: () => {} } );

			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );
		} );

		describe( 'activates keyboard navigation for the toolbar', () => {
			it( 'so "tab" focuses the next focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the url input is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.urlInputView.element;

				const spy = sinon.spy( view.saveButtonView, 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );

			it( 'so "shift + tab" focuses the previous focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the cancel button is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.cancelButtonView.element;

				const spy = sinon.spy( view.saveButtonView, 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'DOM bindings', () => {
		describe( 'submit event', () => {
			it( 'should trigger submit event', () => {
				const spy = sinon.spy();

				view.on( 'submit', spy );
				view.element.dispatchEvent( new Event( 'submit' ) );

				expect( spy.calledOnce ).to.true;
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the #urlInputView', () => {
			const spy = sinon.spy( view.urlInputView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'manual decorators', () => {
		let view, collection;
		beforeEach( () => {
			collection = new Collection();
			collection.add( new ManualDecorator( {
				id: 'decorator1',
				label: 'Foo',
				attributes: {
					foo: 'bar'
				}
			} ) );
			collection.add( new ManualDecorator( {
				id: 'decorator2',
				label: 'Download',
				attributes: {
					download: 'download'
				}
			} ) );
			collection.add( new ManualDecorator( {
				id: 'decorator3',
				label: 'Multi',
				attributes: {
					class: 'fancy-class',
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			} ) );

			view = new LinkFormView( { t: val => val }, collection );
			view.render();
		} );

		afterEach( () => {
			view.destroy();
			collection.clear();
		} );

		it( 'switch buttons reflects state of manual decorators', () => {
			expect( view._manualDecoratorSwitches.length ).to.equal( 3 );

			expect( view._manualDecoratorSwitches.get( 0 ) ).to.deep.include( {
				name: 'decorator1',
				label: 'Foo'
			} );
			expect( view._manualDecoratorSwitches.get( 1 ) ).to.deep.include( {
				name: 'decorator2',
				label: 'Download'
			} );
			expect( view._manualDecoratorSwitches.get( 2 ) ).to.deep.include( {
				name: 'decorator3',
				label: 'Multi'
			} );
		} );

		it( 'reacts on switch button changes', () => {
			const modelItem = collection.first;
			const viewItem = view._manualDecoratorSwitches.first;

			expect( modelItem.value ).to.be.undefined;
			expect( viewItem.isOn ).to.be.undefined;

			viewItem.element.dispatchEvent( new Event( 'click' ) );

			expect( modelItem.value ).to.be.true;
			expect( viewItem.isOn ).to.be.true;

			viewItem.element.dispatchEvent( new Event( 'click' ) );

			expect( modelItem.value ).to.be.false;
			expect( viewItem.isOn ).to.be.false;
		} );

		describe( 'getDecoratorSwitchesState()', () => {
			it( 'should provide object with decorators states', () => {
				expect( view.getDecoratorSwitchesState() ).to.deep.equal( {
					decorator1: undefined,
					decorator2: undefined,
					decorator3: undefined
				} );

				view._manualDecoratorSwitches.map( item => {
					item.element.dispatchEvent( new Event( 'click' ) );
				} );

				view._manualDecoratorSwitches.get( 2 ).element.dispatchEvent( new Event( 'click' ) );

				expect( view.getDecoratorSwitchesState() ).to.deep.equal( {
					decorator1: true,
					decorator2: true,
					decorator3: false
				} );
			} );
		} );
	} );

	describe( 'localization of manual decorators', () => {
		before( () => {
			addTranslations( 'pl', {
				'Open in a new tab': 'Otwórz w nowym oknie'
			} );
		} );
		after( () => {
			clearTranslations();
		} );

		let editor, editorElement, linkFormView;

		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Link ],
					toolbar: [ 'link' ],
					language: 'pl',
					link: {
						decorators: {
							IsExternal: {
								mode: 'manual',
								label: 'Open in a new tab',
								attributes: {
									target: '_blank'
								}
							}
						}
					}
				} )
				.then( newEditor => {
					editor = newEditor;
					linkFormView = new LinkFormView( editor.locale, editor.commands.get( 'link' ).manualDecorators );
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		it( 'translates labels of manual decorators UI', () => {
			expect( linkFormView._manualDecoratorSwitches.first.label ).to.equal( 'Otwórz w nowym oknie' );
		} );
	} );
} );
