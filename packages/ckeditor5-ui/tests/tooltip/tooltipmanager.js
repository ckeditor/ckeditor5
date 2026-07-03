/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EditorUI } from '../../src/editorui/editorui.js';
import { View } from '../../src/view.js';
import { BalloonPanelView } from '../../src/panel/balloon/balloonpanelview.js';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { global } from '@ckeditor/ckeditor5-utils';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { TooltipManager } from '../../src/tooltipmanager.js';
import { Editor } from '@ckeditor/ckeditor5-core';

describe( 'TooltipManager', () => {
	let editor, element, tooltipManager;

	const utils = getUtils();

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

				expect( editor.ui.tooltipManager ).toBe( secondEditor.ui.tooltipManager );

				await secondEditor.destroy();
			} );
		} );

		it( 'should have #tooltipTextView', () => {
			expect( tooltipManager.tooltipTextView ).toBeInstanceOf( View );
			expect( tooltipManager.tooltipTextView.text ).toBe( '' );
			expect( Array.from( tooltipManager.tooltipTextView.element.classList ) ).toEqual(
				expect.arrayContaining( [ 'ck', 'ck-tooltip__text' ] )
			);
		} );

		it( 'should have #balloonPanelView', () => {
			expect( tooltipManager.balloonPanelView ).toBeInstanceOf( BalloonPanelView );
			expect( tooltipManager.balloonPanelView.class ).toBe( 'ck-tooltip' );
			expect( tooltipManager.balloonPanelView.content.first ).toBe( tooltipManager.tooltipTextView );
		} );
	} );

	describe( 'destroy()', () => {
		describe( 'singleton', () => {
			it( 'should no be destroyed until the last editor instance gets destroyed', async () => {
				const secondEditor = await ClassicTestEditor.create( element, {
					plugins: [ Paragraph, Bold, Italic ],
					balloonToolbar: [ 'bold', 'italic' ]
				} );

				const stopListeningSpy = vi.spyOn( editor.ui.tooltipManager, 'stopListening' );

				await editor.destroy();

				expect( stopListeningSpy ).toHaveBeenCalledOnce();
				expect( stopListeningSpy.mock.calls[ 0 ] ).toEqual( [ editor.ui ] );

				await secondEditor.destroy();

				expect( stopListeningSpy.mock.calls[ 1 ] ).toEqual( [ secondEditor.ui ] );
				expect( stopListeningSpy.mock.calls[ 2 ] ).toEqual( [] );
			} );

			// https://github.com/ckeditor/ckeditor5/issues/12602
			it( 'should avoid destroying #balloonPanelView until the last editor gets destroyed', async () => {
				const spy = vi.spyOn( tooltipManager.balloonPanelView, 'destroy' );
				const elements = getElementsWithTooltips( {
					a: {
						text: 'A'
					}
				} );
				vi.useFakeTimers();

				const secondEditor = await ClassicTestEditor.create( element, {
					plugins: [ Paragraph, Bold, Italic ],
					balloonToolbar: [ 'bold', 'italic' ]
				} );

				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow();

				await editor.destroy();

				expect( spy ).not.toHaveBeenCalled();

				await secondEditor.destroy();

				expect( spy ).toHaveBeenCalledOnce();

				destroyElements( elements );
				vi.useRealTimers();
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
				expect( secondEditor.state ).toBe( 'destroyed' );
			} );
		} );

		it( 'should unpin the #balloonPanelView', () => {
			const unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );

			tooltipManager.destroy( editor );

			expect( unpinSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should destroy #balloonPanelView', () => {
			const destroySpy = vi.spyOn( tooltipManager.balloonPanelView, 'destroy' );

			tooltipManager.destroy( editor );

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );

		it( 'should stop listening to events', () => {
			const stopListeningSpy = vi.spyOn( tooltipManager, 'stopListening' );

			tooltipManager.destroy( editor );

			expect( stopListeningSpy ).toHaveBeenCalled();
		} );

		it( 'should cancel any queued pinning', () => {
			const cancelSpy = vi.spyOn( tooltipManager._pinTooltipDebounced, 'cancel' );

			tooltipManager.destroy( editor );

			expect( cancelSpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'displaying tooltips', () => {
		let elements, pinSpy, unpinSpy, defaultPositions;

		beforeEach( () => {
			vi.useFakeTimers();
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

			pinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'pin' );
			unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );
		} );

		afterEach( () => {
			destroyElements( elements );
			vi.useRealTimers();
		} );

		describe( 'on mouseenter', () => {
			it( 'should not work for elements that have no descendant with the data-attribute', () => {
				utils.dispatchMouseEnter( elements.unrelated );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).not.toHaveBeenCalled();
			} );

			it( 'should not work if an element already has a tooltip', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow();

				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should not work for elements with a data-cke-tooltip-disabled attribute', () => {
				utils.dispatchMouseEnter( elements.disabled );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).not.toHaveBeenCalled();
			} );

			describe( 'when all conditions are met', () => {
				it( 'should unpin the tooltip first', () => {
					utils.dispatchMouseEnter( elements.a );
					utils.waitForTheTooltipToShow();

					expect( unpinSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( pinSpy.mock.invocationCallOrder[ 0 ] );
				} );

				it( 'should pin a tooltip with a delay', () => {
					utils.dispatchMouseEnter( elements.a );

					expect( pinSpy ).not.toHaveBeenCalled();

					utils.waitForTheTooltipToShow();

					expect( pinSpy ).toHaveBeenCalledOnce();
					expect( pinSpy ).toHaveBeenCalledWith( {
						target: elements.a,
						positions: expect.any( Array )
					} );
				} );

				it( 'should pin a tooltip instantly if element has a `data-cke-tooltip-instant` attribute', () => {
					elements.a.dataset.ckeTooltipInstant = true;

					utils.dispatchMouseEnter( elements.a );

					expect( pinSpy ).toHaveBeenCalledOnce();
					expect( pinSpy ).toHaveBeenCalledWith( {
						target: elements.a,
						positions: expect.any( Array )
					} );
				} );

				it( 'should pin just a single tooltip (singleton)', async () => {
					const secondEditor = await ClassicTestEditor.create( element, {
						plugins: [ Paragraph, Bold, Italic ],
						balloonToolbar: [ 'bold', 'italic' ]
					} );

					utils.dispatchMouseEnter( elements.a );
					utils.waitForTheTooltipToShow();

					expect( pinSpy ).toHaveBeenCalledOnce();
					expect( Array.from( document.querySelectorAll( '.ck-tooltip' ) ) ).toHaveLength( 1 );

					await secondEditor.destroy();
				} );

				it( 'should add a custom class to the #balloonPanelView if specified in the data attribute', () => {
					expect( tooltipManager.balloonPanelView.class ).toBe( 'ck-tooltip' );

					utils.dispatchMouseEnter( elements.customClass );
					utils.waitForTheTooltipToShow();

					expect( pinSpy ).toHaveBeenCalledOnce();
					expect( tooltipManager.balloonPanelView.class ).toBe( 'ck-tooltip foo-bar' );

					utils.dispatchMouseEnter( elements.a );
					utils.waitForTheTooltipToShow();

					expect( pinSpy ).toHaveBeenCalledTimes( 2 );
					expect( tooltipManager.balloonPanelView.class ).toBe( 'ck-tooltip' );
				} );

				it( 'should show up for the last element the mouse entered (last element has tooltip)', () => {
					utils.dispatchMouseEnter( elements.a );
					utils.dispatchMouseEnter( elements.b );

					utils.waitForTheTooltipToShow();

					expect( pinSpy ).toHaveBeenCalledOnce();
					expect( pinSpy ).toHaveBeenCalledWith( {
						target: elements.b,
						positions: expect.any( Array )
					} );
				} );

				it( 'should show up for the first element the mouse entered (last element has no tooltip)', () => {
					utils.dispatchMouseEnter( elements.a );
					utils.dispatchMouseEnter( elements.unrelated );

					utils.waitForTheTooltipToShow();

					expect( pinSpy ).toHaveBeenCalledOnce();
					expect( pinSpy ).toHaveBeenCalledWith( {
						target: elements.a,
						positions: expect.any( Array )
					} );
				} );
			} );
		} );

		describe( 'on focus', () => {
			it( 'should not focus immediately if hovered', () => {
				vi.spyOn( elements.a, 'matches' ).mockImplementation( selector => selector === ':hover' ? true : false );

				utils.dispatchFocus( elements.a );
				expect( pinSpy ).not.toHaveBeenCalled();

				utils.waitForTheTooltipToShow();
				expect( pinSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should not work for elements that have no descendant with the data-attribute', () => {
				utils.dispatchFocus( elements.unrelated );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).not.toHaveBeenCalled();
			} );

			it( 'should not work if an element already has a tooltip', () => {
				utils.dispatchFocus( elements.a );
				utils.waitForTheTooltipToShow();

				utils.dispatchFocus( elements.a );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should not work for elements with a data-cke-tooltip-disabled', () => {
				utils.dispatchFocus( elements.disabled );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).not.toHaveBeenCalled();
			} );

			describe( 'when all conditions are met', () => {
				it( 'should unpin the tooltip first', () => {
					utils.dispatchFocus( elements.a );
					utils.waitForTheTooltipToShow();

					expect( unpinSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( pinSpy.mock.invocationCallOrder[ 0 ] );
				} );

				it( 'should pin a tooltip without a delay', () => {
					utils.dispatchFocus( elements.a );

					expect( pinSpy ).toHaveBeenCalledOnce();
					expect( pinSpy ).toHaveBeenCalledWith( {
						target: elements.a,
						positions: expect.any( Array )
					} );
				} );

				it( 'should add a custom class to the #balloonPanelView if specified in the data attribute', () => {
					expect( tooltipManager.balloonPanelView.class ).toBe( 'ck-tooltip' );

					utils.dispatchFocus( elements.customClass );
					utils.waitForTheTooltipToShow();

					expect( pinSpy ).toHaveBeenCalledOnce();
					expect( tooltipManager.balloonPanelView.class ).toBe( 'ck-tooltip foo-bar' );

					utils.dispatchFocus( elements.a );
					utils.waitForTheTooltipToShow();

					expect( pinSpy ).toHaveBeenCalledTimes( 2 );
					expect( tooltipManager.balloonPanelView.class ).toBe( 'ck-tooltip' );
				} );

				it( 'should show up for the last element the mouse entered (last element has tooltip)', () => {
					utils.dispatchFocus( elements.a );
					utils.dispatchFocus( elements.b );

					utils.waitForTheTooltipToShow();

					expect( pinSpy ).toHaveBeenCalledTimes( 2 );
					expect( pinSpy ).toHaveBeenCalledWith( {
						target: elements.b,
						positions: expect.any( Array )
					} );
				} );
			} );
		} );

		it( 'should put the #balloonPanelView in the body collection once on demand', () => {
			expect( tooltipManager.balloonPanelView.element ).toBeNull();

			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow();

			expect( editor.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( true );

			utils.dispatchMouseEnter( elements.b );
			utils.waitForTheTooltipToShow();

			expect( editor.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( true );
		} );

		describe( 'translation of position name into BalloonPanelView positioning function', () => {
			it( 'should be defined for "s" position', () => {
				utils.dispatchMouseEnter( elements.positionS );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();
				expect( pinSpy ).toHaveBeenCalledWith( {
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
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();
				expect( pinSpy ).toHaveBeenCalledWith( {
					target: elements.positionN,
					positions: [
						defaultPositions.northArrowSouth
					]
				} );
			} );

			it( 'should be defined for "e" position', () => {
				utils.dispatchMouseEnter( elements.positionE );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();
				expect( pinSpy ).toHaveBeenCalledWith( {
					target: elements.positionE,
					positions: [
						defaultPositions.eastArrowWest
					]
				} );
			} );

			it( 'should be defined for "w" position', () => {
				utils.dispatchMouseEnter( elements.positionW );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();
				expect( pinSpy ).toHaveBeenCalledWith( {
					target: elements.positionW,
					positions: [
						defaultPositions.westArrowEast
					]
				} );
			} );

			it( 'should be defined for "sw" position', () => {
				utils.dispatchMouseEnter( elements.positionSW );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();
				expect( pinSpy ).toHaveBeenCalledWith( {
					target: elements.positionSW,
					positions: [
						defaultPositions.southArrowNorthEast
					]
				} );
			} );

			it( 'should be defined for "se" position', () => {
				utils.dispatchMouseEnter( elements.positionSE );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();
				expect( pinSpy ).toHaveBeenCalledWith( {
					target: elements.positionSE,
					positions: [
						defaultPositions.southArrowNorthWest
					]
				} );
			} );
		} );

		it( 'should update the position if the attribute was changed', async () => {
			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow();
			vi.useRealTimers();

			// ResizeObserver is asynchronous.
			await wait( 100 );

			expect( elements.a.dataset.ckeTooltipPosition ).toBeUndefined();
			expect( pinSpy ).toHaveBeenCalledOnce();

			elements.a.dataset.ckeTooltipPosition = 'e';

			await wait( 100 );

			expect( pinSpy ).toHaveBeenCalledTimes( 2 );
		} );

		// Ensure that all changes to the tooltip are set before pinning it due to positioning issues.
		// See https://github.com/ckeditor/ckeditor5/issues/16365
		it( 'should set proper class to ballonPanelView before the tooltip is shown', () => {
			const { balloonPanelView } = tooltipManager;

			elements.a.dataset.ckeTooltipClass = 'ck-tooltip_multi-line';
			elements.a.dataset.ckeTooltipText = 'Hello World';

			pinSpy.mockRestore();

			// Ensure all changes has been applied to DOM before pinning.
			const pinStub = vi.spyOn( balloonPanelView, 'pin' ).mockImplementation( () => {
				expect( tooltipManager.tooltipTextView.element.innerText ).toBe( 'Hello World' );
				expect( balloonPanelView.element.classList.contains( 'ck-tooltip_multi-line' ) ).toBe( true );
			} );

			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow();

			expect( pinStub ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'hiding tooltips', () => {
		let elements, pinSpy, unpinSpy;

		beforeEach( () => {
			vi.useFakeTimers();

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

			pinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'pin' );

			elements.a.appendChild( elements.childOfA );
		} );

		afterEach( () => {
			destroyElements( elements );
			vi.useRealTimers();
		} );

		describe( 'on keydown', () => {
			it( 'should work if `Escape` keyboard keydown event occurs and tooltip opened', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();

				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );

				const event = new KeyboardEvent( 'keydown', { key: 'Escape' } );
				const stopPropagationSpy = vi.spyOn( event, 'stopPropagation' );

				element.dispatchEvent( event );
				utils.waitForTheTooltipToHide();

				expect( stopPropagationSpy ).toHaveBeenCalledOnce();
				expect( unpinSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should not work if `A` keyboard keydown event occurs and tooltip opened', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();

				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchKeydown( document, 'A' );

				utils.waitForTheTooltipToHide();
				expect( unpinSpy ).not.toHaveBeenCalled();
			} );

			it( 'should not throw exception if there is no opened tooltip and `Escape` keydown event occurs', () => {
				expect( () => {
					utils.dispatchKeydown( document, 'Escape' );
				} ).not.toThrow();
			} );
		} );

		describe( 'on mouseleave', () => {
			it( 'should not work for unrelated event targets such as DOM document', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();

				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchMouseLeave( document );

				utils.waitForTheTooltipToHide();
				expect( unpinSpy ).not.toHaveBeenCalled();
			} );

			it( 'should not work if the tooltip is currently pinned and' +
				'the event target is element and relatedTarget is balloon element', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();

				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );

				utils.dispatchMouseLeave( elements.a, tooltipManager.balloonPanelView.element );

				utils.waitForTheTooltipToHide();
				expect( unpinSpy ).not.toHaveBeenCalled();
			} );

			it( 'should work if the tooltip is currently pinned and' +
				'the event target is balloon element and relatedTarget is something else', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();

				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchMouseLeave( tooltipManager.balloonPanelView.element, elements.b );

				utils.waitForTheTooltipToHide();
				expect( unpinSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should remove the tooltip immediately if the element has `data-cke-tooltip-instant` attribute', () => {
				elements.a.dataset.ckeTooltipInstant = true;

				utils.dispatchMouseEnter( elements.a );

				expect( pinSpy ).toHaveBeenCalledOnce();

				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchMouseLeave( tooltipManager.balloonPanelView.element, elements.b );

				expect( unpinSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should not work if the tooltip is currently pinned and the event target is different than the current element', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();

				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchMouseLeave( elements.b );

				utils.waitForTheTooltipToHide();
				expect( unpinSpy ).not.toHaveBeenCalled();
			} );

			it( 'should not work if the tooltip is not visible and leaving an element that has nothing to do with tooltips', () => {
				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchMouseLeave( elements.unrelated );

				utils.waitForTheTooltipToHide();
				expect( unpinSpy ).not.toHaveBeenCalled();
			} );

			it( 'should unpin the tooltip when moving from one element with a tooltip to another element with a tooltip quickly' +
				'before the tooltip shows for the first tooltip (cancelling the queued pinning)', () => {
				utils.dispatchMouseEnter( elements.a );

				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchMouseLeave( elements.childOfA, elements.a );

				utils.waitForTheTooltipToHide();
				expect( unpinSpy ).toHaveBeenCalledOnce();

				utils.waitForTheTooltipToShow();
				expect( pinSpy ).not.toHaveBeenCalled();
			} );

			it( 'should unpin the tooltip otherwise', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();

				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchMouseLeave( elements.a );

				utils.waitForTheTooltipToHide();
				expect( unpinSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should cancel pending unpin when hovered another tooltip', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();
				utils.dispatchMouseLeave( elements.a );

				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );
				const debounceCancelUnpinSpy = vi.spyOn( tooltipManager._unpinTooltipDebounced, 'cancel' );

				utils.dispatchMouseEnter( elements.b );

				expect( debounceCancelUnpinSpy ).toHaveBeenCalledOnce();
				expect( unpinSpy ).toHaveBeenCalledOnce();

				utils.waitForTheTooltipToHide();
				expect( unpinSpy ).toHaveBeenCalledTimes( 3 );
			} );
		} );

		describe( 'on blur', () => {
			it( 'should not work if a tooltip is pinned but blur ocurred in an unrelated place', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();

				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchBlur( elements.unrelated );

				utils.waitForTheTooltipToHide();
				expect( unpinSpy ).not.toHaveBeenCalled();
			} );

			it( 'should unpin if the tooltip was pinned and the blur ocurred on the same element', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();

				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchBlur( elements.a );

				utils.waitForTheTooltipToHide();
				expect( unpinSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should unpin if the tooltip was not pinned (cancels the queued pinning)', () => {
				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchBlur( elements.unrelated );

				utils.waitForTheTooltipToHide();
				expect( unpinSpy ).toHaveBeenCalledOnce();
			} );
		} );

		describe( 'on scroll', () => {
			it( 'should not unpin the tooltip if not pinned in the first place', () => {
				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchScroll( elements.a );

				utils.waitForTheTooltipToHide();
				expect( unpinSpy ).not.toHaveBeenCalled();
			} );

			it( 'should not unpin the tooltip if the scrolled element is a common ancestor of the #balloonPanelView ' +
				'and the element with tooltip', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();

				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchScroll( document );
				utils.waitForTheTooltipToHide();
				expect( unpinSpy ).not.toHaveBeenCalled();
			} );

			it( 'should unpin if the scrolled element does not contain the #balloonPanelView', () => {
				utils.dispatchMouseEnter( elements.childOfA );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();

				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchScroll( elements.a );
				utils.waitForTheTooltipToHide();
				expect( unpinSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should unpin if the scrolled element does not contain the current element with a tooltip', () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow();

				expect( pinSpy ).toHaveBeenCalledOnce();

				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );
				utils.dispatchScroll( elements.unrelated );
				utils.waitForTheTooltipToHide();
				expect( unpinSpy ).toHaveBeenCalledOnce();
			} );
		} );

		describe( 'when the element disappears', () => {
			it( 'should unpin if the element that it was attached was removed from DOM', async () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow();
				vi.useRealTimers();

				// ResizeObserver is asynchronous.
				await wait( 100 );

				expect( pinSpy ).toHaveBeenCalledOnce();
				expect( pinSpy ).toHaveBeenCalledWith( {
					target: elements.a,
					positions: expect.any( Array )
				} );

				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );

				elements.a.remove();

				// ResizeObserver is asynchronous.
				await wait( 100 );

				expect( unpinSpy ).toHaveBeenCalled();
			} );

			it( 'should unpin if the element that it was attached was hidden in CSS', async () => {
				utils.dispatchMouseEnter( elements.a );
				utils.waitForTheTooltipToShow();
				vi.useRealTimers();

				// ResizeObserver is asynchronous.
				await wait( 100 );

				expect( pinSpy ).toHaveBeenCalledOnce();
				expect( pinSpy ).toHaveBeenCalledWith( {
					target: elements.a,
					positions: expect.any( Array )
				} );

				unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );

				elements.a.style.display = 'none';

				// ResizeObserver is asynchronous.
				await wait( 100 );

				expect( unpinSpy ).toHaveBeenCalled();
			} );
		} );

		it( 'when the tooltip text gets removed', async () => {
			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow();
			vi.useRealTimers();

			// ResizeObserver is asynchronous.
			await wait( 100 );

			unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );

			elements.a.dataset.ckeTooltipText = '';

			await wait( 100 );

			expect( unpinSpy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'updating tooltip position on EditorUI#update', () => {
		let elements, pinSpy, unpinSpy;

		beforeEach( () => {
			vi.useFakeTimers();

			elements = getElementsWithTooltips( {
				a: {
					text: 'A'
				}
			} );

			pinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'pin' );
		} );

		afterEach( () => {
			destroyElements( elements );
			vi.useRealTimers();
		} );

		it( 'should start when the tooltip gets pinned', () => {
			utils.dispatchMouseEnter( elements.a );

			editor.ui.update();
			expect( pinSpy ).not.toHaveBeenCalled();

			utils.waitForTheTooltipToShow();

			expect( pinSpy ).toHaveBeenCalledOnce();
			expect( pinSpy.mock.calls[ 0 ][ 0 ] ).toEqual( {
				target: elements.a,
				positions: expect.any( Array )
			} );

			editor.ui.update();
			expect( pinSpy ).toHaveBeenCalledTimes( 2 );
			expect( pinSpy.mock.calls[ 1 ][ 0 ] ).toEqual( {
				target: elements.a,
				positions: expect.any( Array )
			} );
		} );

		it( 'should work for all editors (singleton)', async () => {
			const secondEditor = await ClassicTestEditor.create( element, {
				plugins: [ Paragraph, Bold, Italic ],
				balloonToolbar: [ 'bold', 'italic' ]
			} );

			expect( editor.ui.tooltipManager ).toBe( secondEditor.ui.tooltipManager );

			utils.dispatchMouseEnter( elements.a );

			editor.ui.update();
			expect( pinSpy ).not.toHaveBeenCalled();

			utils.waitForTheTooltipToShow();

			expect( pinSpy ).toHaveBeenCalledOnce();

			editor.ui.update();
			expect( pinSpy ).toHaveBeenCalledTimes( 2 );

			await secondEditor.destroy();
		} );

		it( 'should stop when the tooltip gets unpinned', () => {
			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow();

			expect( pinSpy ).toHaveBeenCalledOnce();

			editor.ui.update();
			expect( pinSpy ).toHaveBeenCalledTimes( 2 );

			utils.dispatchMouseLeave( elements.a );
			utils.waitForTheTooltipToHide();

			editor.ui.update();

			expect( pinSpy ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should unpin the tooltip when the target element disappeared', () => {
			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow();

			expect( pinSpy ).toHaveBeenCalledOnce();
			unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );

			elements.a.style.display = 'none';

			editor.ui.update();
			expect( pinSpy ).toHaveBeenCalledOnce();
			expect( unpinSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should unpin the tooltip when the target element was removed from DOM', () => {
			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow();

			expect( pinSpy ).toHaveBeenCalledOnce();
			unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );

			elements.a.remove();

			editor.ui.update();
			expect( pinSpy ).toHaveBeenCalledOnce();
			expect( unpinSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should not crash when the tooltip gets removed on the same UI `update` event', () => {
			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow();

			expect( pinSpy ).toHaveBeenCalledOnce();

			editor.ui.update();
			expect( pinSpy ).toHaveBeenCalledTimes( 2 );

			expect( editor.editing.view.document.isFocused ).toBe( false );

			// Minimal case of unlinking with the button in the link balloon toolbar.
			// See https://github.com/ckeditor/ckeditor5/pull/16363.
			editor.ui.once( 'update', () => {
				editor.editing.view.focus();
			} );

			// After removing a link from content, model changed so view and DOM got updated.
			editor.ui.update();

			utils.waitForTheTooltipToHide();

			editor.ui.update();

			expect( pinSpy ).toHaveBeenCalledTimes( 2 );
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
		waitForTheTooltipToShow: () => {
			vi.advanceTimersByTime( 650 );
		},

		waitForTheTooltipToHide: () => {
			vi.advanceTimersByTime( 650 );
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
