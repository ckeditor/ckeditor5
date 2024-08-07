/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ListPropertiesView from '../../../src/listproperties/ui/listpropertiesview.js';

import {
	ButtonView,
	CollapsibleView,
	FocusCycler,
	LabeledFieldView,
	SwitchButtonView,
	View,
	ViewCollection
} from '@ckeditor/ckeditor5-ui';

import {
	FocusTracker,
	KeystrokeHandler,
	keyCodes
} from '@ckeditor/ckeditor5-utils';

describe( 'ListPropertiesView', () => {
	let view, locale;

	beforeEach( () => {
		locale = { t: text => text };
		view = new ListPropertiesView( locale, {
			enabledProperties: {
				styles: true,
				startIndex: true,
				reversed: true
			},
			styleButtonViews: [
				new ButtonView( locale ),
				new ButtonView( locale ),
				new ButtonView( locale ),
				new ButtonView( locale ),
				new ButtonView( locale )
			],
			styleGridAriaLabel: 'Foo'
		} );

		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		describe( 'template', () => {
			it( 'should create an #element from the template', () => {
				expect( view.element.tagName ).to.equal( 'DIV' );
				expect( view.element.classList.contains( 'ck' ) ).to.be.true;
				expect( view.element.classList.contains( 'ck-list-properties' ) ).to.be.true;
				expect( view.element.classList.contains( 'ck-list-properties_with-numbered-properties' ) ).to.be.true;
			} );

			describe( 'when styles, start index, and reversed properties are enabled', () => {
				it( 'should use collapsible to host property fields', () => {
					expect( view.children.first ).to.equal( view.stylesView );
					expect( view.children.last ).to.be.instanceOf( CollapsibleView );
					expect( view.children.last.label ).to.equal( 'List properties' );
					expect( view.children.last.isCollapsed ).to.be.true;
					expect( view.children.last.children.first ).to.equal( view.startIndexFieldView );
					expect( view.children.last.children.last ).to.equal( view.reversedSwitchButtonView );
				} );

				it( 'should keep the collapsible button enabled as longs as either start index or reversed field is enabled', () => {
					const collapsibleView = view.children.last;

					expect( collapsibleView.buttonView.isEnabled, 'A' ).to.be.true;

					view.startIndexFieldView.isEnabled = false;
					view.reversedSwitchButtonView.isEnabled = true;
					expect( collapsibleView.buttonView.isEnabled, 'B' ).to.be.true;

					view.startIndexFieldView.isEnabled = true;
					view.reversedSwitchButtonView.isEnabled = false;
					expect( collapsibleView.buttonView.isEnabled, 'C' ).to.be.true;

					view.startIndexFieldView.isEnabled = true;
					view.reversedSwitchButtonView.isEnabled = true;
					expect( collapsibleView.buttonView.isEnabled, 'D' ).to.be.true;

					view.startIndexFieldView.isEnabled = false;
					view.reversedSwitchButtonView.isEnabled = false;
					expect( collapsibleView.buttonView.isEnabled, 'E' ).to.be.false;
				} );

				it( 'should automatically collapse the collapsible when its button gets gets disabled', () => {
					const collapsibleView = view.children.last;

					collapsibleView.isCollapsed = false;

					view.startIndexFieldView.isEnabled = false;
					view.reversedSwitchButtonView.isEnabled = true;
					expect( collapsibleView.isCollapsed, 'A' ).to.be.false;

					view.startIndexFieldView.isEnabled = true;
					view.reversedSwitchButtonView.isEnabled = false;
					expect( collapsibleView.isCollapsed, 'B' ).to.be.false;

					view.startIndexFieldView.isEnabled = false;
					view.reversedSwitchButtonView.isEnabled = false;
					expect( collapsibleView.isCollapsed, 'C' ).to.be.true;

					// It should work only one way. It should not uncollapse when property fields get enabled.
					view.startIndexFieldView.isEnabled = true;
					view.reversedSwitchButtonView.isEnabled = true;
					expect( collapsibleView.isCollapsed, 'D' ).to.be.true;
				} );
			} );

			describe( 'when styles are disabled but start index and reversed properties are enabled', () => {
				it( 'should have no #stylesView and get a specific CSS class', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							startIndex: true,
							reversed: true
						},
						styleButtonViews: [],
						styleGridAriaLabel: 'Foo'
					} );

					view.render();

					expect( view.stylesView ).to.be.null;
					expect( view.element.classList.contains( 'ck-list-properties_without-styles' ) ).to.be.true;

					view.destroy();
				} );

				it( 'should not use CollapsibleView for #startIndexFieldView and #reversedSwitchButtonView', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							startIndex: true,
							reversed: true
						},
						styleButtonViews: [],
						styleGridAriaLabel: 'Foo'
					} );

					view.render();

					expect( view.children.first ).to.equal( view.startIndexFieldView );
					expect( view.children.last ).to.equal( view.reversedSwitchButtonView );

					view.destroy();
				} );
			} );

			describe( 'when only styles property is enabled', () => {
				it( 'should not have no #startIndexFieldView, no #reversedSwitchButtonView, and no specific CSS class', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							styles: true
						},
						styleButtonViews: [
							new ButtonView( locale )
						],
						styleGridAriaLabel: 'Foo'
					} );

					view.render();

					expect( view.startIndexFieldView ).to.be.null;
					expect( view.reversedSwitchButtonView ).to.be.null;
					expect( view.children.first ).to.equal( view.stylesView );
					expect( view.children.last ).to.equal( view.stylesView );
					expect( view.element.classList.contains( 'ck-list-properties_with-numbered-properties' ) ).to.be.false;

					view.destroy();
				} );
			} );

			describe( 'when only start index property is enabled', () => {
				it( 'should not have no #stylesView, no #reversedSwitchButtonView', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							startIndex: true
						},
						styleButtonViews: [],
						styleGridAriaLabel: 'Foo'
					} );

					view.render();

					expect( view.stylesView ).to.be.null;
					expect( view.startIndexFieldView ).to.be.instanceOf( LabeledFieldView );
					expect( view.reversedSwitchButtonView ).to.be.null;
					expect( view.children.first ).to.equal( view.startIndexFieldView );
					expect( view.children.last ).to.equal( view.startIndexFieldView );
					expect( view.element.classList.contains( 'ck-list-properties_with-numbered-properties' ) ).to.be.true;

					view.destroy();
				} );
			} );

			describe( 'when only reversed property is enabled', () => {
				it( 'should not have no #stylesView, no #startIndexFieldView', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							reversed: true
						},
						styleButtonViews: [],
						styleGridAriaLabel: 'Foo'
					} );

					view.render();

					expect( view.stylesView ).to.be.null;
					expect( view.startIndexFieldView ).to.be.null;
					expect( view.reversedSwitchButtonView ).to.be.instanceOf( SwitchButtonView );
					expect( view.children.first ).to.equal( view.reversedSwitchButtonView );
					expect( view.children.last ).to.equal( view.reversedSwitchButtonView );
					expect( view.element.classList.contains( 'ck-list-properties_with-numbered-properties' ) ).to.be.true;

					view.destroy();
				} );
			} );
		} );

		it( 'should have a #children collection', () => {
			expect( view.children ).to.be.instanceOf( ViewCollection );
		} );

		it( 'should have #stylesView', () => {
			expect( view.stylesView ).to.be.instanceOf( View );
		} );

		it( 'should have #startIndexFieldView', () => {
			expect( view.startIndexFieldView ).to.be.instanceOf( LabeledFieldView );
		} );

		it( 'should have #reversedSwitchButtonView', () => {
			expect( view.reversedSwitchButtonView ).to.be.instanceOf( SwitchButtonView );
		} );

		it( 'should have #focusTracker', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'should have #keystrokes', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'should have #focusables', () => {
			expect( view.focusables ).to.be.instanceOf( ViewCollection );
		} );

		it( 'should have #focusCycler', () => {
			expect( view.focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		describe( '#stylesView', () => {
			describe( 'template', () => {
				it( 'should create an element from the template', () => {
					expect( view.stylesView.element.tagName ).to.equal( 'DIV' );
					expect( view.stylesView.element.classList.contains( 'ck' ) ).to.be.true;
					expect( view.stylesView.element.classList.contains( 'ck-list-styles-list' ) ).to.be.true;
					expect( view.stylesView.element.getAttribute( 'aria-label' ) ).to.equal( 'Foo' );
				} );

				it( 'should popupate the view with style buttons', () => {
					expect( view.stylesView.children.length ).to.equal( 5 );
					expect( view.stylesView.children.get( 0 ) ).to.be.instanceOf( ButtonView );
					expect( view.stylesView.children.get( 1 ) ).to.be.instanceOf( ButtonView );
					expect( view.stylesView.element.firstChild.classList.contains( 'ck-button' ) ).to.be.true;
					expect( view.stylesView.element.lastChild.classList.contains( 'ck-button' ) ).to.be.true;
				} );
			} );
		} );

		describe( '#startIndexFieldView', () => {
			it( 'should have basic properties', () => {
				expect( view.startIndexFieldView.label ).to.equal( 'Start at' );
				expect( view.startIndexFieldView.class ).to.equal( 'ck-numbered-list-properties__start-index' );
				expect( view.startIndexFieldView.fieldView.min ).to.equal( 0 );
				expect( view.startIndexFieldView.fieldView.step ).to.equal( 1 );
				expect( view.startIndexFieldView.fieldView.value ).to.equal( 1 );
				expect( view.startIndexFieldView.fieldView.inputMode ).to.equal( 'numeric' );
			} );
		} );

		describe( '#reversedSwitchButtonView', () => {
			it( 'should have basic properties', () => {
				expect( view.reversedSwitchButtonView.withText ).to.be.true;
				expect( view.reversedSwitchButtonView.label ).to.equal( 'Reversed order' );
				expect( view.reversedSwitchButtonView.class ).to.equal( 'ck-numbered-list-properties__reversed-order' );
			} );
		} );
	} );

	describe( 'render()', () => {
		describe( 'focus cycling, tracking and keyboard support', () => {
			describe( 'when styles and all numbered list properties are enabled', () => {
				it( 'should register child views in #focusables', () => {
					expect( view.focusables.map( f => f ) ).to.have.members( [
						view.children.first,
						view.children.last.buttonView,
						view.startIndexFieldView,
						view.reversedSwitchButtonView
					] );
				} );

				it( 'should register child views\' #element in #focusTracker', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							styles: true,
							startIndex: true,
							reversed: true
						},
						styleButtonViews: [
							new ButtonView( locale ),
							new ButtonView( locale )
						],
						styleGridAriaLabel: 'Foo'
					} );

					const spyView = sinon.spy( view.focusTracker, 'add' );

					view.render();

					sinon.assert.calledWithExactly( spyView.getCall( 0 ), view.children.first.element );
					sinon.assert.calledWithExactly( spyView.getCall( 1 ), view.children.last.buttonView.element );
					sinon.assert.calledWithExactly( spyView.getCall( 2 ), view.startIndexFieldView.element );
					sinon.assert.calledWithExactly( spyView.getCall( 3 ), view.reversedSwitchButtonView.element );

					view.destroy();
				} );

				it( 'should register style view\'s items in style view\'s focus tracker', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							styles: true,
							startIndex: true,
							reversed: true
						},
						styleButtonViews: [
							new ButtonView( locale ),
							new ButtonView( locale )
						],
						styleGridAriaLabel: 'Foo'
					} );

					const spyStylesView = sinon.spy( view.stylesView.focusTracker, 'add' );

					view.render();

					sinon.assert.calledWithExactly( spyStylesView.getCall( 0 ), view.stylesView.children.first.element );
					sinon.assert.calledWithExactly( spyStylesView.getCall( 1 ), view.stylesView.children.last.element );

					view.destroy();
				} );
			} );

			describe( 'when styles grid is disabled', () => {
				it( 'should register child views in #focusables', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							startIndex: true,
							reversed: true
						},
						styleButtonViews: [],
						styleGridAriaLabel: 'Foo'
					} );

					view.render();

					expect( view.focusables.map( f => f ) ).to.have.members( [
						view.startIndexFieldView,
						view.reversedSwitchButtonView
					] );

					view.destroy();
				} );

				it( 'should register child views\' #element in #focusTracker', () => {
					const view = new ListPropertiesView( locale, {
						enabledProperties: {
							startIndex: true,
							reversed: true
						},
						styleButtonViews: [],
						styleGridAriaLabel: 'Foo'
					} );

					const spy = sinon.spy( view.focusTracker, 'add' );

					view.render();

					sinon.assert.calledWithExactly( spy.getCall( 0 ), view.startIndexFieldView.element );
					sinon.assert.calledWithExactly( spy.getCall( 1 ), view.reversedSwitchButtonView.element );

					view.destroy();
				} );
			} );

			it( 'starts listening for #keystrokes coming from #element', () => {
				const view = new ListPropertiesView( locale, {
					enabledProperties: {
						styles: true,
						startIndex: true,
						reversed: true
					},
					styleButtonViews: [
						new ButtonView( locale ),
						new ButtonView( locale )
					],
					styleGridAriaLabel: 'Foo'
				} );

				const spy = sinon.spy( view.keystrokes, 'listenTo' );

				view.render();
				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, view.element );

				view.destroy();
			} );

			describe( 'activates keyboard navigation in the properties view', () => {
				it( 'so "tab" focuses the next focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					// Mock the styles view is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.children.first.element;

					// Spy the next view which in this case is the ListProperties button
					const spy = sinon.spy( view.children.last.buttonView, 'focus' );

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

					// Mock the styles view is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.children.first.element;
					view.children.last.isCollapsed = false;

					// Spy the previous view which in this case is the Reversed order switch button
					const spy = sinon.spy( view.reversedSwitchButtonView, 'focus' );

					view.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );

				describe( 'keyboard navigation in the styles grid', () => {
					it( '"arrow right" should focus the next focusable style button', () => {
						const keyEvtData = {
							keyCode: keyCodes.arrowright,
							preventDefault: sinon.spy(),
							stopPropagation: sinon.spy()
						};

						// Mock the first style button is focused.
						view.stylesView.focusTracker.isFocused = true;
						view.stylesView.focusTracker.focusedElement = view.stylesView.children.first.element;

						const spy = sinon.spy( view.stylesView.children.get( 1 ), 'focus' );

						view.stylesView.keystrokes.press( keyEvtData );
						sinon.assert.calledOnce( keyEvtData.preventDefault );
						sinon.assert.calledOnce( keyEvtData.stopPropagation );
						sinon.assert.calledOnce( spy );
					} );

					it( '"arrow down" should focus the focusable style button in the second row', () => {
						const keyEvtData = {
							keyCode: keyCodes.arrowdown,
							preventDefault: sinon.spy(),
							stopPropagation: sinon.spy()
						};

						// Mock the first style button is focused.
						view.stylesView.focusTracker.isFocused = true;
						view.stylesView.focusTracker.focusedElement = view.stylesView.children.first.element;

						const spy = sinon.spy( view.stylesView.children.get( 4 ), 'focus' );

						view.stylesView.keystrokes.press( keyEvtData );
						sinon.assert.calledOnce( keyEvtData.preventDefault );
						sinon.assert.calledOnce( keyEvtData.stopPropagation );
						sinon.assert.calledOnce( spy );
					} );

					// https://github.com/ckeditor/ckeditor5/issues/12340
					it( 'should work regardless of the geometry of the grid', () => {
						view.stylesView.element.style.gridTemplateColumns = 'repeat(2, 1fr)';

						const keyEvtData = {
							keyCode: keyCodes.arrowdown,
							preventDefault: sinon.spy(),
							stopPropagation: sinon.spy()
						};

						// Mock the first style button is focused.
						view.stylesView.focusTracker.isFocused = true;
						view.stylesView.focusTracker.focusedElement = view.stylesView.children.first.element;

						const spy = sinon.spy( view.stylesView.children.get( 2 ), 'focus' );

						view.stylesView.keystrokes.press( keyEvtData );
						sinon.assert.calledOnce( keyEvtData.preventDefault );
						sinon.assert.calledOnce( keyEvtData.stopPropagation );
						sinon.assert.calledOnce( spy );
					} );
				} );
			} );

			it( 'intercepts the arrow* events and overrides the default (parent) toolbar behavior', () => {
				const keyEvtData = {
					stopPropagation: sinon.spy()
				};

				keyEvtData.keyCode = keyCodes.arrowdown;
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );

				keyEvtData.keyCode = keyCodes.arrowup;
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledTwice( keyEvtData.stopPropagation );

				keyEvtData.keyCode = keyCodes.arrowleft;
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledThrice( keyEvtData.stopPropagation );

				keyEvtData.keyCode = keyCodes.arrowright;
				view.keystrokes.press( keyEvtData );
				sinon.assert.callCount( keyEvtData.stopPropagation, 4 );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the first button in #stylesView (when present)', () => {
			const spy = sinon.spy( view.stylesView.children.first, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should focus the #startIndexFieldView when there are no style buttons', () => {
			const view = new ListPropertiesView( locale, {
				enabledProperties: {
					startIndex: true,
					reversed: true
				},
				styleButtonViews: [],
				styleGridAriaLabel: 'Foo'
			} );

			view.render();
			document.body.appendChild( view.element );

			const spy = sinon.spy( view.startIndexFieldView, 'focus' );

			view.focus();
			sinon.assert.calledOnce( spy );

			view.element.remove();
			view.destroy();
		} );

		it( 'should focus the #reversedSwitchButtonView if no #stylesView and no #startIndexFieldView', () => {
			const view = new ListPropertiesView( locale, {
				enabledProperties: {
					reversed: true
				},
				styleButtonViews: [],
				styleGridAriaLabel: 'Foo'
			} );

			view.render();
			document.body.appendChild( view.element );

			const spy = sinon.spy( view.reversedSwitchButtonView, 'focus' );

			view.focus();
			sinon.assert.calledOnce( spy );

			view.element.remove();
			view.destroy();
		} );
	} );

	describe( 'focusLast()', () => {
		it( 'should focus the #reversedSwitchButtonView when present and visible', () => {
			const spy = sinon.spy( view.reversedSwitchButtonView, 'focus' );

			view.children.last.isCollapsed = false;
			view.focusLast();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should focus the collapse button when numbered list properies are collapsed', () => {
			const spy = sinon.spy( view.children.last.buttonView, 'focus' );

			view.children.last.isCollapsed = true;
			view.focusLast();

			sinon.assert.calledOnce( spy );
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

	describe( 'DOM bindings', () => {
		describe( 'styles view', () => {
			it( 'should delegate #execute to the properties view', () => {
				const spy = sinon.spy();

				view.on( 'execute', spy );
				view.stylesView.children.get( 0 ).fire( 'execute' );

				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( '#startIndexFieldView', () => {
			it( 'should fire #listStart upon #input', () => {
				const spy = sinon.spy();
				view.on( 'listStart', spy );

				view.startIndexFieldView.fieldView.value = '123';
				view.startIndexFieldView.fieldView.fire( 'input' );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should not fire #listStart upon #input if the field is empty', () => {
				const spy = sinon.spy();
				view.on( 'listStart', spy );

				view.startIndexFieldView.fieldView.value = '';
				view.startIndexFieldView.fieldView.fire( 'input' );

				sinon.assert.notCalled( spy );
			} );

			it( 'should not fire #listStart upon #input but display an error if the field is invalid', () => {
				const spy = sinon.spy();
				view.on( 'listStart', spy );

				view.startIndexFieldView.fieldView.value = '-5';
				view.startIndexFieldView.fieldView.fire( 'input' );

				sinon.assert.notCalled( spy );
				expect( view.startIndexFieldView.errorText ).to.equal( 'Start index must be greater than 0.' );
			} );

			it( 'should not fire #listStart upon #input but display an error if the numeric value is NaN', () => {
				const spy = sinon.spy();
				view.on( 'listStart', spy );

				view.startIndexFieldView.fieldView.value = '3e';
				view.startIndexFieldView.fieldView.fire( 'input' );

				sinon.assert.notCalled( spy );
				expect( view.startIndexFieldView.errorText ).to.equal( 'Invalid start index value.' );
			} );

			it( 'should hide an error and proceed to fire #listStart when previously invalid value gets corrected', () => {
				const spy = sinon.spy();
				view.on( 'listStart', spy );

				// Check for error.
				view.startIndexFieldView.fieldView.value = '3e';
				view.startIndexFieldView.fieldView.fire( 'input' );

				sinon.assert.notCalled( spy );
				expect( view.startIndexFieldView.errorText ).to.equal( 'Invalid start index value.' );

				// And revert to valid state (clear error).
				view.startIndexFieldView.fieldView.value = '32';
				view.startIndexFieldView.fieldView.fire( 'input' );

				sinon.assert.calledOnce( spy );
				expect( view.startIndexFieldView.errorText ).to.be.null;
			} );
		} );

		describe( '#reversedSwitchButtonView', () => {
			it( 'should fire #listReversed when executed', () => {
				const spy = sinon.spy();
				view.on( 'listReversed', spy );

				view.reversedSwitchButtonView.fire( 'execute' );

				sinon.assert.calledOnce( spy );
			} );
		} );
	} );
} );
