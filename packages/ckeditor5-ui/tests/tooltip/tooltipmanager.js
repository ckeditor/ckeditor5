/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import EditorUI from '../../src/editorui/editorui.js';
import View from '../../src/view.js';
import BalloonPanelView from '../../src/panel/balloon/balloonpanelview.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import TooltipManager from '../../src/tooltipmanager.js';
import { Editor } from '@ckeditor/ckeditor5-core';

describe( 'TooltipManager', () => {
	let editor, element, tooltipManager;

	const utils = getUtils();

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		// TooltipManager is a singleton shared across editor instances. If any other test didn't
		// kill its editor, this will affect assertions in tests here.
		TooltipManager._editors = new Set();

		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ Paragraph, Bold, Italic ],
			balloonToolbar: [ 'bold', 'italic' ]
		} );

		tooltipManager = editor.ui.tooltipManager;
	} );

	afterEach( async () => {
		await editor.destroy();

		element.remove();
	} );

	describe( 'constructor()', () => {
		describe( 'singleton', () => {
			it( 'should be created once for all editor instances', async () => {
				const secondEditor = await ClassicTestEditor.create( element, {
					plugins: [ Paragraph, Bold, Italic ],
					balloonToolbar: [ 'bold', 'italic' ]
				} );

				expect( editor.ui.tooltipManager ).to.equal( secondEditor.ui.tooltipManager );

				await secondEditor.destroy();
			} );
		} );

		it( 'should have #tooltipTextView', () => {
			expect( tooltipManager.tooltipTextView ).to.be.instanceOf( View );
			expect( tooltipManager.tooltipTextView.text ).to.equal( '' );
			expect( Array.from( tooltipManager.tooltipTextView.element.classList ) ).to.have.members( [ 'ck', 'ck-tooltip__text' ] );
		} );

		it( 'should have #balloonPanelView', () => {
			expect( tooltipManager.balloonPanelView ).to.be.instanceOf( BalloonPanelView );
			expect( tooltipManager.balloonPanelView.class ).to.equal( 'ck-tooltip' );
			expect( tooltipManager.balloonPanelView.content.first ).to.equal( tooltipManager.tooltipTextView );
		} );
	} );

	describe( 'destroy()', () => {
		describe( 'singleton', () => {
			it( 'should no be destroyed until the last editor instance gets destroyed', async () => {
				const secondEditor = await ClassicTestEditor.create( element, {
					plugins: [ Paragraph, Bold, Italic ],
					balloonToolbar: [ 'bold', 'italic' ]
				} );

				const stopListeningSpy = sinon.spy( editor.ui.tooltipManager, 'stopListening' );

				await editor.destroy();

				sinon.assert.calledOnce( stopListeningSpy );
				sinon.assert.calledWithExactly( stopListeningSpy.firstCall, editor.ui );

				await secondEditor.destroy();

				sinon.assert.calledWithExactly( stopListeningSpy.secondCall, secondEditor.ui );
				sinon.assert.calledWithExactly( stopListeningSpy.thirdCall );
			} );

			// https://github.com/ckeditor/ckeditor5/issues/12602
			it( 'should avoid destroying #balloonPanelView until the last editor gets destroyed', async () => {
				const spy = testUtils.sinon.spy( tooltipManager.balloonPanelView, 'destroy' );
				const elements = getElementsWithTooltips( {
					a: {
						text: 'A'
					}
				} );
				const clock = sinon.useFakeTimers();

				const secondEditor = await ClassicTestEditor.create( element, {
					plugins: [ Paragraph, Bold, Italic ],
					balloonToolbar: [ 'bold', 'italic' ]
				} );

				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow( clock );

				await editor.destroy();

				sinon.assert.notCalled( spy );

				await secondEditor.destroy();

				sinon.assert.calledOnce( spy );

				destroyElements( elements );
				clock.restore();
			} );

			it( 'should not throw if the editor has no ui#view', async () => {
				class EditorWithoutUIView extends Editor {
					static create( config ) {
						return new Promise( resolve => {
							const editor = new this( config );

							resolve(
								editor.initPlugins()
									.then( () => {
										editor.ui = new EditorUI( editor );
										editor.fire( 'ready' );
									} )
									.then( () => editor )
							);
						} );
					}

					destroy() {
						this.ui.destroy();

						return super.destroy();
					}
				}

				const secondEditor = await EditorWithoutUIView.create();

				await secondEditor.destroy();

				// No error was thrown.
				expect( secondEditor.state ).to.equal( 'destroyed' );
			} );
		} );

		it( 'should unpin the #balloonPanelView', () => {
			const unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );

			tooltipManager.destroy( editor );

			sinon.assert.calledOnce( unpinSpy );
		} );

		it( 'should destroy #balloonPanelView', () => {
			const destroySpy = sinon.spy( tooltipManager.balloonPanelView, 'destroy' );

			tooltipManager.destroy( editor );

			sinon.assert.calledOnce( destroySpy );
		} );

		it( 'should stop listening to events', () => {
			const stopListeningSpy = sinon.spy( tooltipManager, 'stopListening' );

			tooltipManager.destroy( editor );

			sinon.assert.called( stopListeningSpy );
		} );

		it( 'should cancel any queued pinning', () => {
			const cancelSpy = sinon.spy( tooltipManager._pinTooltipDebounced, 'cancel' );

			tooltipManager.destroy( editor );

			sinon.assert.called( cancelSpy );
		} );
	} );

	describe( 'displaying tooltips', () => {
		let clock, elements, pinSpy, unpinSpy, defaultPositions;

		beforeEach( () => {
			clock = sinon.useFakeTimers();
			defaultPositions = TooltipManager.defaultBalloonPositions;

			elements = getElementsWithTooltips( {
				a: {
					text: 'A'
				},

				b: {
					text: 'B'
				},

				disabled: {
					text: 'DISABLED',
					isDisabled: true
				},

				customClass: {
					text: 'CUSTOM_CLASS',
					class: 'foo-bar'
				},

				unrelated: {},

				positionS: {
					text: 'POSITION_S',
					position: 's'
				},

				positionN: {
					text: 'POSITION_N',
					position: 'n'
				},

				positionE: {
					text: 'POSITION_E',
					position: 'e'
				},

				positionW: {
					text: 'POSITION_W',
					position: 'w'
				},

				positionSW: {
					text: 'POSITION_SW',
					position: 'sw'
				},

				positionSE: {
					text: 'POSITION_SE',
					position: 'se'
				}
			} );

			pinSpy = sinon.spy( tooltipManager.balloonPanelView, 'pin' );
			unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );
		} );

		afterEach( () => {
			destroyElements( elements );
			clock.restore();
		} );

		describe( 'on mouseenter', () => {
			it( 'should not work for elements that have no descendant with the data-attribute', () => {
				utils.dispatchMouseEnter( elements.unrelated );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.notCalled( pinSpy );
			} );

			it( 'should not work if an element already has a tooltip', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow( clock );

				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );
			} );

			it( 'should not work for elements with a data-cke-tooltip-disabled attribute', () => {
				utils.dispatchMouseEnter( elements.disabled );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.notCalled( pinSpy );
			} );

			describe( 'when all conditions are met', () => {
				it( 'should unpin the tooltip first', () => {
					utils.dispatchMouseEnter( elements.a );
					utils.waitForTheTooltipToShow( clock );

					sinon.assert.callOrder( unpinSpy, pinSpy );
				} );

				it( 'should pin a tooltip with a delay', () => {
					utils.dispatchMouseEnter( elements.a );

					sinon.assert.notCalled( pinSpy );

					utils.waitForTheTooltipToShow( clock );

					sinon.assert.calledOnce( pinSpy );
					sinon.assert.calledWith( pinSpy, {
						target: elements.a,
						positions: sinon.match.array
					} );
				} );

				it( 'should pin a tooltip instantly if element has a `data-cke-tooltip-instant` attribute', () => {
					elements.a.dataset.ckeTooltipInstant = true;

					utils.dispatchMouseEnter( elements.a );

					sinon.assert.calledOnce( pinSpy );
					sinon.assert.calledWith( pinSpy, {
						target: elements.a,
						positions: sinon.match.array
					} );
				} );

				it( 'should pin just a single tooltip (singleton)', async () => {
					const secondEditor = await ClassicTestEditor.create( element, {
						plugins: [ Paragraph, Bold, Italic ],
						balloonToolbar: [ 'bold', 'italic' ]
					} );

					utils.dispatchMouseEnter( elements.a );
					utils.waitForTheTooltipToShow( clock );

					sinon.assert.calledOnce( pinSpy );
					expect( Array.from( document.querySelectorAll( '.ck-tooltip' ) ) ).to.have.length( 1 );

					await secondEditor.destroy();
				} );

				it( 'should add a custom class to the #balloonPanelView if specified in the data attribute', () => {
					expect( tooltipManager.balloonPanelView.class ).to.equal( 'ck-tooltip' );

					utils.dispatchMouseEnter( elements.customClass );
					utils.waitForTheTooltipToShow( clock );

					sinon.assert.calledOnce( pinSpy );
					expect( tooltipManager.balloonPanelView.class ).to.equal( 'ck-tooltip foo-bar' );

					utils.dispatchMouseEnter( elements.a );
					utils.waitForTheTooltipToShow( clock );

					sinon.assert.calledTwice( pinSpy );
					expect( tooltipManager.balloonPanelView.class ).to.equal( 'ck-tooltip' );
				} );

				it( 'should show up for the last element the mouse entered (last element has tooltip)', () => {
					utils.dispatchMouseEnter( elements.a );
					utils.dispatchMouseEnter( elements.b );

					utils.waitForTheTooltipToShow( clock );

					sinon.assert.calledOnce( pinSpy );
					sinon.assert.calledWith( pinSpy, {
						target: elements.b,
						positions: sinon.match.array
					} );
				} );

				it( 'should show up for the first element the mouse entered (last element has no tooltip)', () => {
					utils.dispatchMouseEnter( elements.a );
					utils.dispatchMouseEnter( elements.unrelated );

					utils.waitForTheTooltipToShow( clock );

					sinon.assert.calledOnce( pinSpy );
					sinon.assert.calledWith( pinSpy, {
						target: elements.a,
						positions: sinon.match.array
					} );
				} );
			} );
		} );

		describe( 'on focus', () => {
			it( 'should not focus immediately if hovered', () => {
				sinon.stub( elements.a, 'matches' ).withArgs( ':hover' ).returns( true );

				utils.dispatchFocus( elements.a );
				sinon.assert.notCalled( pinSpy );

				utils.waitForTheTooltipToShow( clock );
				sinon.assert.calledOnce( pinSpy );
			} );

			it( 'should not work for elements that have no descendant with the data-attribute', () => {
				utils.dispatchFocus( elements.unrelated );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.notCalled( pinSpy );
			} );

			it( 'should not work if an element already has a tooltip', () => {
				utils.dispatchFocus( elements.a );
				utils.waitForTheTooltipToShow( clock );

				utils.dispatchFocus( elements.a );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );
			} );

			it( 'should not work for elements with a data-cke-tooltip-disabled', () => {
				utils.dispatchFocus( elements.disabled );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.notCalled( pinSpy );
			} );

			describe( 'when all conditions are met', () => {
				it( 'should unpin the tooltip first', () => {
					utils.dispatchFocus( elements.a );
					utils.waitForTheTooltipToShow( clock );

					sinon.assert.callOrder( unpinSpy, pinSpy );
				} );

				it( 'should pin a tooltip without a delay', () => {
					utils.dispatchFocus( elements.a );

					sinon.assert.calledOnce( pinSpy );
					sinon.assert.calledWith( pinSpy, {
						target: elements.a,
						positions: sinon.match.array
					} );
				} );

				it( 'should add a custom class to the #balloonPanelView if specified in the data attribute', () => {
					expect( tooltipManager.balloonPanelView.class ).to.equal( 'ck-tooltip' );

					utils.dispatchFocus( elements.customClass );
					utils.waitForTheTooltipToShow( clock );

					sinon.assert.calledOnce( pinSpy );
					expect( tooltipManager.balloonPanelView.class ).to.equal( 'ck-tooltip foo-bar' );

					utils.dispatchFocus( elements.a );
					utils.waitForTheTooltipToShow( clock );

					sinon.assert.calledTwice( pinSpy );
					expect( tooltipManager.balloonPanelView.class ).to.equal( 'ck-tooltip' );
				} );

				it( 'should show up for the last element the mouse entered (last element has tooltip)', () => {
					utils.dispatchFocus( elements.a );
					utils.dispatchFocus( elements.b );

					utils.waitForTheTooltipToShow( clock );

					sinon.assert.calledTwice( pinSpy );
					sinon.assert.calledWith( pinSpy, {
						target: elements.b,
						positions: sinon.match.array
					} );
				} );
			} );
		} );

		it( 'should put the #balloonPanelView in the body collection once on demand', () => {
			expect( tooltipManager.balloonPanelView.element ).to.be.null;

			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow( clock );

			expect( editor.ui.view.body.has( tooltipManager.balloonPanelView ) ).to.be.true;

			utils.dispatchMouseEnter( elements.b );
			utils.waitForTheTooltipToShow( clock );

			expect( editor.ui.view.body.has( tooltipManager.balloonPanelView ) ).to.be.true;
		} );

		describe( 'translation of position name into BalloonPanelView positioning function', () => {
			it( 'should be defined for "s" position', () => {
				utils.dispatchMouseEnter( elements.positionS );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );
				sinon.assert.calledWith( pinSpy, {
					target: elements.positionS,
					positions: [
						defaultPositions.southArrowNorth,
						defaultPositions.southArrowNorthEast,
						defaultPositions.southArrowNorthWest
					]
				} );
			} );

			it( 'should be defined for "n" position', () => {
				utils.dispatchMouseEnter( elements.positionN );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );
				sinon.assert.calledWith( pinSpy, {
					target: elements.positionN,
					positions: [
						defaultPositions.northArrowSouth
					]
				} );
			} );

			it( 'should be defined for "e" position', () => {
				utils.dispatchMouseEnter( elements.positionE );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );
				sinon.assert.calledWith( pinSpy, {
					target: elements.positionE,
					positions: [
						defaultPositions.eastArrowWest
					]
				} );
			} );

			it( 'should be defined for "w" position', () => {
				utils.dispatchMouseEnter( elements.positionW );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );
				sinon.assert.calledWith( pinSpy, {
					target: elements.positionW,
					positions: [
						defaultPositions.westArrowEast
					]
				} );
			} );

			it( 'should be defined for "sw" position', () => {
				utils.dispatchMouseEnter( elements.positionSW );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );
				sinon.assert.calledWith( pinSpy, {
					target: elements.positionSW,
					positions: [
						defaultPositions.southArrowNorthEast
					]
				} );
			} );

			it( 'should be defined for "se" position', () => {
				utils.dispatchMouseEnter( elements.positionSE );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );
				sinon.assert.calledWith( pinSpy, {
					target: elements.positionSE,
					positions: [
						defaultPositions.southArrowNorthWest
					]
				} );
			} );
		} );

		it( 'should update the position if the attribute was changed', async () => {
			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow( clock );
			clock.restore();

			// ResizeObserver is asynchronous.
			await wait( 100 );

			expect( elements.a.dataset.ckeTooltipPosition ).to.equal( undefined );
			sinon.assert.calledOnce( pinSpy );

			elements.a.dataset.ckeTooltipPosition = 'e';

			await wait( 100 );

			sinon.assert.calledTwice( pinSpy );
		} );

		// Ensure that all changes to the tooltip are set before pinning it due to positioning issues.
		// See https://github.com/ckeditor/ckeditor5/issues/16365
		it( 'should set proper class to ballonPanelView before the tooltip is shown', () => {
			const { balloonPanelView } = tooltipManager;

			elements.a.dataset.ckeTooltipClass = 'ck-tooltip_multi-line';
			elements.a.dataset.ckeTooltipText = 'Hello World';

			pinSpy.restore();

			// Ensure all changes has been applied to DOM before pinning.
			const pinStub = sinon.stub( balloonPanelView, 'pin' ).callsFake( () => {
				expect( tooltipManager.tooltipTextView.element.innerText ).to.equal( 'Hello World' );
				expect( balloonPanelView.element.classList.contains( 'ck-tooltip_multi-line' ) ).to.be.true;
			} );

			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow( clock );

			expect( pinStub ).to.be.calledOnce;
		} );
	} );

	describe( 'hiding tooltips', () => {
		let clock, elements, pinSpy, unpinSpy;

		beforeEach( () => {
			clock = sinon.useFakeTimers();

			elements = getElementsWithTooltips( {
				a: {
					text: 'A'
				},

				b: {
					text: 'B'
				},

				childOfA: {
					text: 'CHILD_OF_A'
				},

				unrelated: {}
			} );

			pinSpy = sinon.spy( tooltipManager.balloonPanelView, 'pin' );

			elements.a.appendChild( elements.childOfA );
		} );

		afterEach( () => {
			destroyElements( elements );
			clock.restore();
		} );

		describe( 'on keydown', () => {
			it( 'should work if `Escape` keyboard keydown event occurs and tooltip opened', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );

				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );

				const event = new KeyboardEvent( 'keydown', { key: 'Escape' } );
				const stopPropagationSpy = sinon.spy( event, 'stopPropagation' );

				element.dispatchEvent( event );
				utils.waitForTheTooltipToHide( clock );

				sinon.assert.calledOnce( stopPropagationSpy );
				sinon.assert.calledOnce( unpinSpy );
			} );

			it( 'should not work if `A` keyboard keydown event occurs and tooltip opened', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );

				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchKeydown( document, 'A' );

				utils.waitForTheTooltipToHide( clock );
				sinon.assert.notCalled( unpinSpy );
			} );

			it( 'should not throw exception if there is no opened tooltip and `Escape` keydown event occurs', () => {
				expect( () => {
					utils.dispatchKeydown( document, 'Escape' );
				} ).not.to.throw();
			} );
		} );

		describe( 'on mouseleave', () => {
			it( 'should not work for unrelated event targets such as DOM document', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );

				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchMouseLeave( document );

				utils.waitForTheTooltipToHide( clock );
				sinon.assert.notCalled( unpinSpy );
			} );

			it( 'should not work if the tooltip is currently pinned and' +
				'the event target is element and relatedTarget is balloon element', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );

				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );

				utils.dispatchMouseLeave( elements.a, tooltipManager.balloonPanelView.element );

				utils.waitForTheTooltipToHide( clock );
				sinon.assert.notCalled( unpinSpy );
			} );

			it( 'should work if the tooltip is currently pinned and' +
				'the event target is balloon element and relatedTarget is something else', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );

				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchMouseLeave( tooltipManager.balloonPanelView.element, elements.b );

				utils.waitForTheTooltipToHide( clock );
				sinon.assert.calledOnce( unpinSpy );
			} );

			it( 'should remove the tooltip immediately if the element has `data-cke-tooltip-instant` attribute', () => {
				elements.a.dataset.ckeTooltipInstant = true;

				utils.dispatchMouseEnter( elements.a );

				sinon.assert.calledOnce( pinSpy );

				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchMouseLeave( tooltipManager.balloonPanelView.element, elements.b );

				sinon.assert.calledOnce( unpinSpy );
			} );

			it( 'should not work if the tooltip is currently pinned and the event target is different than the current element', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );

				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchMouseLeave( elements.b );

				utils.waitForTheTooltipToHide( clock );
				sinon.assert.notCalled( unpinSpy );
			} );

			it( 'should not work if the tooltip is not visible and leaving an element that has nothing to do with tooltips', () => {
				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchMouseLeave( elements.unrelated );

				utils.waitForTheTooltipToHide( clock );
				sinon.assert.notCalled( unpinSpy );
			} );

			it( 'should unpin the tooltip when moving from one element with a tooltip to another element with a tooltip quickly' +
				'before the tooltip shows for the first tooltip (cancelling the queued pinning)', () => {
				utils.dispatchMouseEnter( elements.a );

				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchMouseLeave( elements.childOfA, elements.a );

				utils.waitForTheTooltipToHide( clock );
				sinon.assert.calledOnce( unpinSpy );

				utils.waitForTheTooltipToShow( clock );
				sinon.assert.notCalled( pinSpy );
			} );

			it( 'should unpin the tooltip otherwise', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );

				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchMouseLeave( elements.a );

				utils.waitForTheTooltipToHide( clock );
				sinon.assert.calledOnce( unpinSpy );
			} );

			it( 'should cancel pending unpin when hovered another tooltip', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );
				utils.dispatchMouseLeave( elements.a );

				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );
				const debounceCancelUnpinSpy = sinon.spy( tooltipManager._unpinTooltipDebounced, 'cancel' );

				utils.dispatchMouseEnter( elements.b );

				sinon.assert.calledOnce( debounceCancelUnpinSpy );
				sinon.assert.calledOnce( unpinSpy );

				utils.waitForTheTooltipToHide( clock );
				sinon.assert.calledThrice( unpinSpy );
			} );
		} );

		describe( 'on blur', () => {
			it( 'should not work if a tooltip is pinned but blur ocurred in an unrelated place', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );

				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchBlur( elements.unrelated );

				utils.waitForTheTooltipToHide( clock );
				sinon.assert.notCalled( unpinSpy );
			} );

			it( 'should unpin if the tooltip was pinned and the blur ocurred on the same element', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );

				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchBlur( elements.a );

				utils.waitForTheTooltipToHide( clock );
				sinon.assert.calledOnce( unpinSpy );
			} );

			it( 'should unpin if the tooltip was not pinned (cancels the queued pinning)', () => {
				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchBlur( elements.unrelated );

				utils.waitForTheTooltipToHide( clock );
				sinon.assert.calledOnce( unpinSpy );
			} );
		} );

		describe( 'on scroll', () => {
			it( 'should not unpin the tooltip if not pinned in the first place', () => {
				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchScroll( elements.a );

				utils.waitForTheTooltipToHide( clock );
				sinon.assert.notCalled( unpinSpy );
			} );

			it( 'should not unpin the tooltip if the scrolled element is a common ancestor of the #balloonPanelView ' +
				'and the element with tooltip', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );

				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchScroll( document );
				utils.waitForTheTooltipToHide( clock );
				sinon.assert.notCalled( unpinSpy );
			} );

			it( 'should unpin if the scrolled element does not contain the #balloonPanelView', () => {
				utils.dispatchMouseEnter( elements.childOfA );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );

				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchScroll( elements.a );
				utils.waitForTheTooltipToHide( clock );
				sinon.assert.calledOnce( unpinSpy );
			} );

			it( 'should unpin if the scrolled element does not contain the current element with a tooltip', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow( clock );

				sinon.assert.calledOnce( pinSpy );

				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchScroll( elements.unrelated );
				utils.waitForTheTooltipToHide( clock );
				sinon.assert.calledOnce( unpinSpy );
			} );
		} );

		describe( 'when the element disappears', () => {
			it( 'should unpin if the element that it was attached was removed from DOM', async () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow( clock );
				clock.restore();

				// ResizeObserver is asynchronous.
				await wait( 100 );

				sinon.assert.calledOnce( pinSpy );
				sinon.assert.calledWith( pinSpy, {
					target: elements.a,
					positions: sinon.match.array
				} );

				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );

				elements.a.remove();

				// ResizeObserver is asynchronous.
				await wait( 100 );

				sinon.assert.called( unpinSpy );
			} );

			it( 'should unpin if the element that it was attached was hidden in CSS', async () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow( clock );
				clock.restore();

				// ResizeObserver is asynchronous.
				await wait( 100 );

				sinon.assert.calledOnce( pinSpy );
				sinon.assert.calledWith( pinSpy, {
					target: elements.a,
					positions: sinon.match.array
				} );

				unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );

				elements.a.style.display = 'none';

				// ResizeObserver is asynchronous.
				await wait( 100 );

				sinon.assert.called( unpinSpy );
			} );
		} );

		it( 'when the tooltip text gets removed', async () => {
			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow( clock );
			clock.restore();

			// ResizeObserver is asynchronous.
			await wait( 100 );

			unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );

			elements.a.dataset.ckeTooltipText = '';

			await wait( 100 );

			sinon.assert.calledOnce( unpinSpy );
		} );
	} );

	describe( 'updating tooltip position on EditorUI#update', () => {
		let clock, elements, pinSpy, unpinSpy;

		beforeEach( () => {
			clock = sinon.useFakeTimers();

			elements = getElementsWithTooltips( {
				a: {
					text: 'A'
				}
			} );

			pinSpy = sinon.spy( tooltipManager.balloonPanelView, 'pin' );
		} );

		afterEach( () => {
			destroyElements( elements );
			clock.restore();
		} );

		it( 'should start when the tooltip gets pinned', () => {
			utils.dispatchMouseEnter( elements.a );

			editor.ui.update();
			sinon.assert.notCalled( pinSpy );

			utils.waitForTheTooltipToShow( clock );

			sinon.assert.calledOnce( pinSpy );
			sinon.assert.calledWith( pinSpy.firstCall, {
				target: elements.a,
				positions: sinon.match.array
			} );

			editor.ui.update();
			sinon.assert.calledTwice( pinSpy );
			sinon.assert.calledWith( pinSpy.secondCall, {
				target: elements.a,
				positions: sinon.match.array
			} );
		} );

		it( 'should work for all editors (singleton)', async () => {
			const secondEditor = await ClassicTestEditor.create( element, {
				plugins: [ Paragraph, Bold, Italic ],
				balloonToolbar: [ 'bold', 'italic' ]
			} );

			expect( editor.ui.tooltipManager ).to.equal( secondEditor.ui.tooltipManager );

			utils.dispatchMouseEnter( elements.a );

			editor.ui.update();
			sinon.assert.notCalled( pinSpy );

			utils.waitForTheTooltipToShow( clock );

			sinon.assert.calledOnce( pinSpy );

			editor.ui.update();
			sinon.assert.calledTwice( pinSpy );

			await secondEditor.destroy();
		} );

		it( 'should stop when the tooltip gets unpinned', () => {
			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow( clock );

			sinon.assert.calledOnce( pinSpy );

			editor.ui.update();
			sinon.assert.calledTwice( pinSpy );

			utils.dispatchMouseLeave( elements.a );
			utils.waitForTheTooltipToHide( clock );

			editor.ui.update();

			sinon.assert.calledTwice( pinSpy );
		} );

		it( 'should unpin the tooltip when the target element disappeared', () => {
			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow( clock );

			sinon.assert.calledOnce( pinSpy );
			unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );

			elements.a.style.display = 'none';

			editor.ui.update();
			sinon.assert.calledOnce( pinSpy );
			sinon.assert.calledOnce( unpinSpy );
		} );

		it( 'should unpin the tooltip when the target element was removed from DOM', () => {
			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow( clock );

			sinon.assert.calledOnce( pinSpy );
			unpinSpy = sinon.spy( tooltipManager.balloonPanelView, 'unpin' );

			elements.a.remove();

			editor.ui.update();
			sinon.assert.calledOnce( pinSpy );
			sinon.assert.calledOnce( unpinSpy );
		} );

		it( 'should not crash when the tooltip gets removed on the same UI `update` event', () => {
			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow( clock );

			sinon.assert.calledOnce( pinSpy );

			editor.ui.update();
			sinon.assert.calledTwice( pinSpy );

			expect( editor.editing.view.document.isFocused ).to.be.false;

			// Minimal case of unlinking with the button in the link balloon toolbar.
			// See https://github.com/ckeditor/ckeditor5/pull/16363.
			editor.ui.once( 'update', () => {
				editor.editing.view.focus();
			} );

			// After removing a link from content, model changed so view and DOM got updated.
			editor.ui.update();

			utils.waitForTheTooltipToHide( clock );

			editor.ui.update();

			sinon.assert.calledTwice( pinSpy );
		} );
	} );

	describe( '#defaultPositions', () => {
		it( 'should be defined', () => {

		} );
	} );
} );

function getElementsWithTooltips( definitions ) {
	const elements = {};

	for ( const name in definitions ) {
		const element = document.createElement( 'div' );
		const def = definitions[ name ];

		if ( def.text ) {
			element.dataset.ckeTooltipText = def.text;
		}

		if ( def.position ) {
			element.dataset.ckeTooltipPosition = def.position;
		}

		if ( def.class ) {
			element.dataset.ckeTooltipClass = def.class;
		}

		if ( def.isDisabled ) {
			element.setAttribute( 'data-cke-tooltip-disabled', 'true' );
		}

		element.id = name;
		element.textContent = 'foo';

		document.body.appendChild( element );

		elements[ name ] = element;
	}

	return elements;
}

function destroyElements( elements ) {
	for ( const name in elements ) {
		elements[ name ].remove();
	}
}

function getUtils() {
	return {
		waitForTheTooltipToShow: clock => {
			clock.tick( 650 );
		},

		waitForTheTooltipToHide: clock => {
			clock.tick( 650 );
		},

		dispatchMouseEnter: element => {
			element.dispatchEvent( new MouseEvent( 'mouseenter' ) );
		},

		dispatchKeydown: ( element, key ) => {
			element.dispatchEvent( new KeyboardEvent( 'keydown', { key } ) );
		},

		dispatchMouseLeave: ( element, relatedTarget ) => {
			element.dispatchEvent( new MouseEvent( 'mouseleave', { relatedTarget } ) );
		},

		dispatchFocus: element => {
			element.dispatchEvent( new Event( 'focus' ) );
		},

		dispatchBlur: element => {
			element.dispatchEvent( new Event( 'blur' ) );
		},

		dispatchScroll: element => {
			element.dispatchEvent( new Event( 'scroll' ) );
		}
	};
}

function wait( time ) {
	return new Promise( res => {
		global.window.setTimeout( res, time );
	} );
}
