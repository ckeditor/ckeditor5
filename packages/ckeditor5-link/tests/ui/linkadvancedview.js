/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Event, document */

import {
	mix,
	ObservableMixin,
	Collection,
	KeystrokeHandler,
	FocusTracker,
	keyCodes
} from '@ckeditor/ckeditor5-utils';
import {
	View,
	FocusCycler,
	ViewCollection
} from '@ckeditor/ckeditor5-ui';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service.js';

import Link from '../../src/link.js';
import LinkAdvancedView from '../../src/ui/linkadvancedview.js';
import ManualDecorator from '../../src/utils/manualdecorator.js';

const mockLocale = { t: val => val };

const mockLinkCommand = ( collection = new Collection() ) => {
	class LinkCommandMock {
		constructor( manualDecorators ) {
			this.manualDecorators = manualDecorators;
			this.set( 'value' );
		}
	}
	mix( LinkCommandMock, ObservableMixin );

	return new LinkCommandMock( collection );
};

describe( 'LinkAdvancedView', () => {
	let view, collection, linkCommand;

	testUtils.createSinonSandbox();

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
			},
			defaultValue: true
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

		linkCommand = mockLinkCommand( collection );
		view = new LinkAdvancedView( mockLocale, linkCommand );
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
			expect( view.element.tagName.toLowerCase() ).to.equal( 'form' );
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-link__panel' ) ).to.true;
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

		it( 'should fire `cancel` event on backButtonView#execute', () => {
			const spy = sinon.spy();

			view.on( 'cancel', spy );

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

	describe( 'manual decorators', () => {
		let view, collection, linkCommand;

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
				},
				defaultValue: true
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

			linkCommand = mockLinkCommand( collection );
			view = new LinkAdvancedView( mockLocale, linkCommand );
			view.render();
			document.body.appendChild( view.element );
		} );

		afterEach( () => {
			view.element.remove();
			view.destroy();
			collection.clear();
		} );

		it( 'switch buttons reflects state of manual decorators', () => {
			expect( view.listChildren.length ).to.equal( 3 );

			expect( view.listChildren.get( 0 ) ).to.deep.include( {
				name: 'decorator1',
				label: 'Foo',
				isOn: false
			} );
			expect( view.listChildren.get( 1 ) ).to.deep.include( {
				name: 'decorator2',
				label: 'Download',
				isOn: true
			} );
			expect( view.listChildren.get( 2 ) ).to.deep.include( {
				name: 'decorator3',
				label: 'Multi',
				isOn: false
			} );
		} );

		it( 'reacts on switch button changes', () => {
			const modelItem = collection.first;
			const viewItem = view.listChildren.first;

			expect( modelItem.value ).to.be.undefined;
			expect( viewItem.isOn ).to.be.false;

			viewItem.element.dispatchEvent( new Event( 'click' ) );

			expect( modelItem.value ).to.be.true;
			expect( viewItem.isOn ).to.be.true;

			viewItem.element.dispatchEvent( new Event( 'click' ) );

			expect( modelItem.value ).to.be.false;
			expect( viewItem.isOn ).to.be.false;
		} );

		it( 'reacts on switch button changes for the decorator with defaultValue', () => {
			const modelItem = collection.get( 1 );
			const viewItem = view.listChildren.get( 1 );

			expect( modelItem.value ).to.be.undefined;
			expect( viewItem.isOn ).to.be.true;

			viewItem.element.dispatchEvent( new Event( 'click' ) );

			expect( modelItem.value ).to.be.false;
			expect( viewItem.isOn ).to.be.false;

			viewItem.element.dispatchEvent( new Event( 'click' ) );

			expect( modelItem.value ).to.be.true;
			expect( viewItem.isOn ).to.be.true;
		} );

		describe( 'getDecoratorSwitchesState()', () => {
			it( 'should provide object with decorators states', () => {
				expect( view.getDecoratorSwitchesState() ).to.deep.equal( {
					decorator1: false,
					decorator2: true,
					decorator3: false
				} );

				view.listChildren.map( item => {
					item.element.dispatchEvent( new Event( 'click' ) );
				} );

				view.listChildren.get( 2 ).element.dispatchEvent( new Event( 'click' ) );

				expect( view.getDecoratorSwitchesState() ).to.deep.equal( {
					decorator1: true,
					decorator2: false,
					decorator3: false
				} );
			} );

			it( 'should use decorator default value if command and decorator values are not set', () => {
				expect( view.getDecoratorSwitchesState() ).to.deep.equal( {
					decorator1: false,
					decorator2: true,
					decorator3: false
				} );
			} );

			it( 'should use a decorator value if decorator value is set', () => {
				for ( const decorator of collection ) {
					decorator.value = true;
				}

				expect( view.getDecoratorSwitchesState() ).to.deep.equal( {
					decorator1: true,
					decorator2: true,
					decorator3: true
				} );

				for ( const decorator of collection ) {
					decorator.value = false;
				}

				expect( view.getDecoratorSwitchesState() ).to.deep.equal( {
					decorator1: false,
					decorator2: false,
					decorator3: false
				} );
			} );

			it( 'should use a decorator value if link command value is set', () => {
				linkCommand.value = '';

				expect( view.getDecoratorSwitchesState() ).to.deep.equal( {
					decorator1: false,
					decorator2: false,
					decorator3: false
				} );

				for ( const decorator of collection ) {
					decorator.value = false;
				}

				expect( view.getDecoratorSwitchesState() ).to.deep.equal( {
					decorator1: false,
					decorator2: false,
					decorator3: false
				} );

				for ( const decorator of collection ) {
					decorator.value = true;
				}

				expect( view.getDecoratorSwitchesState() ).to.deep.equal( {
					decorator1: true,
					decorator2: true,
					decorator3: true
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

		let editor, editorElement, view;

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
					view = new LinkAdvancedView( mockLocale, editor.commands.get( 'link' ) );
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		it( 'translates labels of manual decorators UI', () => {
			expect( view.listChildren.first.label ).to.equal( 'Otwórz w nowym oknie' );
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
			const view = new LinkAdvancedView( mockLocale, linkCommand );
			const spy = testUtils.sinon.spy( view.focusTracker, 'add' );

			view.render();

			sinon.assert.calledWithExactly( spy.getCall( 0 ), view.listChildren.get( 0 ).element );
			sinon.assert.calledWithExactly( spy.getCall( 1 ), view.listChildren.get( 1 ).element );
			sinon.assert.calledWithExactly( spy.getCall( 2 ), view.listChildren.get( 2 ).element );
			sinon.assert.calledWithExactly( spy.getCall( 3 ), view.backButtonView.element );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new LinkAdvancedView( mockLocale, linkCommand );
			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );

			view.destroy();
		} );

		describe( 'activates keyboard navigation for the toolbar', () => {
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

// TODO: getDecoratorSwitchesState
// TODO: Flow from form view to advanced view
