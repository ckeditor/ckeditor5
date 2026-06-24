/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FocusTracker } from '../src/focustracker.js';
import { global } from '../src/dom/global.js';
import { expectToThrowCKEditorError } from './_utils/utils.js';
import { View } from '@ckeditor/ckeditor5-ui';

describe( 'FocusTracker', () => {
	let focusTracker, container, containerFirstInput, containerSecondInput;

	beforeEach( () => {
		container = document.createElement( 'div' );
		containerFirstInput = document.createElement( 'input' );
		containerSecondInput = document.createElement( 'input' );

		container.appendChild( containerFirstInput );
		container.appendChild( containerSecondInput );

		vi.useFakeTimers();

		focusTracker = new FocusTracker();
	} );

	afterEach( () => {
		vi.useRealTimers();
		focusTracker.destroy();
	} );

	describe( 'constructor()', () => {
		describe( 'isFocused', () => {
			it( 'should be false at default', () => {
				expect( focusTracker.isFocused ).toBe( false );
			} );

			it( 'should be observable', () => {
				const observableSpy = vi.fn();

				focusTracker.listenTo( focusTracker, 'change:isFocused', observableSpy );

				focusTracker.isFocused = true;

				expect( observableSpy ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		describe( 'focusedElement', () => {
			it( 'should be null at default', () => {
				expect( focusTracker.focusedElement ).toBeNull();
			} );

			it( 'should be observable', () => {
				const observableSpy = vi.fn();

				focusTracker.listenTo( focusTracker, 'change:focusedElement', observableSpy );

				focusTracker.focusedElement = global.document.body;

				expect( observableSpy ).toHaveBeenCalledTimes( 1 );
			} );
		} );
	} );

	describe( 'add()', () => {
		describe( 'for DOM elements', () => {
			it( 'should throw an error when element has been already added', () => {
				focusTracker.add( containerFirstInput );

				expectToThrowCKEditorError( () => {
					focusTracker.add( containerFirstInput );
				}, 'focustracker-add-element-already-exist', focusTracker );
			} );

			describe( 'single element', () => {
				it( 'should start listening on element focus and update `isFocused` property', () => {
					focusTracker.add( containerFirstInput );

					expect( focusTracker.isFocused ).toBe( false );

					containerFirstInput.dispatchEvent( new Event( 'focus' ) );

					expect( focusTracker.isFocused ).toBe( true );
					expect( focusTracker.focusedElement ).toBe( containerFirstInput );
				} );

				it( 'should start listening on element blur and update `isFocused` property', () => {
					focusTracker.add( containerFirstInput );
					containerFirstInput.dispatchEvent( new Event( 'focus' ) );

					expect( focusTracker.focusedElement ).toBe( containerFirstInput );

					containerFirstInput.dispatchEvent( new Event( 'blur' ) );
					vi.advanceTimersByTime( 0 );

					expect( focusTracker.isFocused ).toBe( false );
					expect( focusTracker.focusedElement ).toBeNull();
				} );
			} );

			describe( 'container element', () => {
				it( 'should start listening on element focus using event capturing and update `isFocused` property', () => {
					focusTracker.add( container );

					expect( focusTracker.isFocused ).toBe( false );

					containerFirstInput.dispatchEvent( new Event( 'focus' ) );

					expect( focusTracker.isFocused ).toBe( true );
					expect( focusTracker.focusedElement ).toBe( container );
				} );

				it( 'should start listening on element blur using event capturing and update `isFocused` property', () => {
					focusTracker.add( container );
					containerFirstInput.dispatchEvent( new Event( 'focus' ) );

					expect( focusTracker.focusedElement ).toBe( container );

					containerFirstInput.dispatchEvent( new Event( 'blur' ) );
					vi.advanceTimersByTime( 0 );

					expect( focusTracker.isFocused ).toBe( false );
					expect( focusTracker.focusedElement ).toBeNull();
				} );

				it( 'should not change `isFocused` property when focus is going between child elements', () => {
					const changeSpy = vi.fn();

					focusTracker.add( container );

					containerFirstInput.dispatchEvent( new Event( 'focus' ) );
					expect( focusTracker.focusedElement ).toBe( container );
					expect( focusTracker.isFocused ).toBe( true );

					focusTracker.listenTo( focusTracker, 'change:isFocused', changeSpy );

					containerFirstInput.dispatchEvent( new Event( 'blur' ) );
					containerSecondInput.dispatchEvent( new Event( 'focus' ) );
					vi.advanceTimersByTime( 0 );

					expect( focusTracker.focusedElement ).toBe( container );
					expect( focusTracker.isFocused ).toBe( true );
					expect( changeSpy ).not.toHaveBeenCalled();
				} );

				// https://github.com/ckeditor/ckeditor5-utils/issues/159
				it( 'should keep `isFocused` synced when multiple blur events are followed by the focus', () => {
					focusTracker.add( container );
					container.dispatchEvent( new Event( 'focus' ) );

					expect( focusTracker.focusedElement ).toBe( container );

					container.dispatchEvent( new Event( 'blur' ) );
					containerFirstInput.dispatchEvent( new Event( 'blur' ) );
					containerSecondInput.dispatchEvent( new Event( 'focus' ) );
					vi.advanceTimersByTime( 0 );

					expect( focusTracker.isFocused ).toBe( true );
					expect( focusTracker.focusedElement ).toBe( container );
				} );
			} );
		} );

		describe( 'for views', () => {
			describe( 'without focus tracker', () => {
				let view;

				beforeEach( () => {
					view = new FocusableView();

					view.render();
					document.body.appendChild( view.element );
				} );

				afterEach( () => {
					view.destroy();
					view.element.remove();
				} );

				it( 'should add view#element as a plain DOM element', () => {
					focusTracker.add( view );

					view.focus();

					expect( focusTracker.isFocused ).toBe( true );
					expect( focusTracker.focusedElement ).toBe( view.element );
				} );

				it( 'should not be listed in #externalViews', () => {
					focusTracker.add( view );

					expect( focusTracker.externalViews ).toHaveLength( 0 );
				} );

				it( 'should contribute to #elements', () => {
					focusTracker.add( view );

					expect( focusTracker.elements ).toEqual( [ view.element ] );
				} );

				it( 'should throw if view#element is unavailable', () => {
					const view = new FocusableView();

					view.element = null;

					expectToThrowCKEditorError( () => {
						focusTracker.add( view );
					}, 'focustracker-add-view-missing-element', {
						focusTracker,
						view
					} );
				} );
			} );

			describe( 'with focus tracker', () => {
				let childViewA, childViewB, childViewC, rootFocusTracker, rootElement, isFocusedSpy, focusedElementSpy;

				beforeEach( () => {
					rootElement = document.createElement( 'root' );
					rootElement.setAttribute( 'tabindex', 0 );

					document.body.appendChild( rootElement );

					childViewA = new FocusableViewWithFocusTracker( 'child-a' );
					childViewB = new FocusableViewWithFocusTracker( 'child-b' );
					childViewC = new FocusableViewWithFocusTracker( 'child-c' );

					childViewA.render();
					childViewB.render();
					childViewC.render();

					rootFocusTracker = focusTracker;

					isFocusedSpy = vi.fn();
					focusedElementSpy = vi.fn();

					rootFocusTracker.on( 'change:isFocused', ( evt, name, isFocused ) => isFocusedSpy( isFocused ) );
					rootFocusTracker.on( 'change:focusedElement', ( evt, name, focusedElement ) => {
						focusedElementSpy( focusedElement );
					} );
				} );

				afterEach( () => {
					childViewA.destroy();
					childViewB.destroy();
					childViewC.destroy();
					rootElement.remove();

					childViewA.element.remove();
					childViewB.element.remove();
					childViewC.element.remove();
				} );

				it( 'should add view as a related view', () => {
					rootElement.appendChild( childViewA.element );
					rootFocusTracker.add( childViewA );

					childViewA.children.first.focus();

					expect( rootFocusTracker.isFocused ).toBe( true );
					expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );
				} );

				it( 'should be listed in #externalViews', () => {
					rootFocusTracker.add( childViewA );

					expect( rootFocusTracker.externalViews ).toEqual( [ childViewA ] );
				} );

				it( 'should contribute to #elements', () => {
					rootFocusTracker.add( childViewA );

					expect( rootFocusTracker.elements ).toEqual( [ childViewA.element ] );
				} );

				it( 'should allow adding a related view without #element', () => {
					const detachedView = {
						element: null,
						focusTracker: new FocusTracker()
					};

					rootFocusTracker.add( detachedView );
					detachedView.focusTracker.focusedElement = document.body;

					expect( rootFocusTracker.externalViews ).toEqual( [ detachedView ] );
					expect( rootFocusTracker.elements ).toEqual( [] );
					expect( rootFocusTracker.isFocused ).toBe( false );
					expect( rootFocusTracker.focusedElement ).toBeNull();

					detachedView.focusTracker.destroy();
				} );

				describe( 'focus detection between linked focus trackers', () => {
					it( 'should set #focusedElement to a child view#element when a sub-child got focused', () => {
						// <rootElement>                           (tracked by root FT)
						// 	<child-a>                              (tracked by root FT)
						// 		<child-a-a />                      (tracked by child-a)          -> 1st focus
						// 		<child-a-b />                      (tracked by child-a)
						// 	</child-a>
						// </rootElement>
						rootElement.appendChild( childViewA.element );

						rootFocusTracker.add( rootElement );
						rootFocusTracker.add( childViewA );

						childViewA.children.get( 0 ).focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

						expect( isFocusedSpy ).toHaveBeenCalledTimes( 1 );
						expect( focusedElementSpy ).toHaveBeenCalledTimes( 1 );
					} );

					it( 'should set #focusedElement to a child view#element when multiple sub-child got focused in short order', () => {
						// <rootElement>                           (tracked by root FT)
						// 	<child-a>                              (tracked by root FT)
						// 		<child-a-a />                      (tracked by child-a)          -> 1st focus
						// 		<child-a-b />                      (tracked by child-a)          -> 2nd focus
						// 	</child-a>
						// </rootElement>
						rootElement.appendChild( childViewA.element );

						rootFocusTracker.add( rootElement );
						rootFocusTracker.add( childViewA );

						childViewA.children.get( 0 ).focus();
						childViewA.children.get( 1 ).focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

						expect( isFocusedSpy ).toHaveBeenCalledTimes( 1 );
						expect( focusedElementSpy ).toHaveBeenCalledTimes( 1 );
					} );

					it( 'should set #focusedElement the correct child view#element if two successive focuses ocurred in that view ' +
						'at different nesting levels',
					() => {
						// <rootElement>                           (tracked by root FT)
						// 	<child-a>                              (tracked by root FT)
						// 		<child-a-a>                        (tracked by child-a)
						// 			<child-b>                      (tracked by child-a)        -> 1st focus
						// 				<child-b-a></child-b-a>    (tracked by child-b)        -> 2nd focus
						// 				<child-b-b />              (tracked by child-b)
						// 			</child-b>
						// 		</child-a-a>
						// 		<child-a-b />                      (tracked by child-a)
						// 	</child-a>
						// </rootElement>
						childViewA.children.get( 0 ).children.add( childViewB );
						rootElement.appendChild( childViewA.element );

						rootFocusTracker.add( rootElement );
						rootFocusTracker.add( childViewA );
						childViewA.focusTracker.add( childViewB );

						childViewB.focus();
						childViewB.children.get( 0 ).focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

						expect( isFocusedSpy ).toHaveBeenCalledTimes( 1 );
						expect( focusedElementSpy ).toHaveBeenCalledTimes( 1 );
					} );

					it( 'should set #focusedElement to a child view#element when a logically connected sub-child was focused', () => {
						// <rootElement>                           (tracked by root FT)
						// 	<child-a>                              (tracked by root FT)
						// 		<child-a-a />                      (tracked by child-a)
						// 		<child-a-b />                      (tracked by child-a)
						// 	</child-a>
						// 	<child-b>                              (tracked by child-a)
						// 		<child-b-a />                      (tracked by child-b)              -> 1st focus
						// 		<child-b-b />                      (tracked by child-b)
						// 	</child-b>
						// </rootElement>
						rootElement.appendChild( childViewA.element );
						rootElement.appendChild( childViewB.element );

						rootFocusTracker.add( rootElement );
						rootFocusTracker.add( childViewA );
						childViewA.focusTracker.add( childViewB );

						childViewB.children.get( 0 ).focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

						expect( isFocusedSpy ).toHaveBeenCalledTimes( 1 );
						expect( focusedElementSpy ).toHaveBeenCalledTimes( 1 );
					} );

					it( 'should set #focusedElement to a child view#element when multiple logically connected sub-children were ' +
						'focused in short order',
					() => {
						// <rootElement>                           (tracked by root FT)
						// 	<child-a>                              (tracked by root FT)
						// 		<child-a-a />                      (tracked by child-a)
						// 		<child-a-b />                      (tracked by child-a)
						// 	</child-a>
						// 	<child-b>                              (tracked by child-a)
						// 		<child-b-a />                      (tracked by child-b)              -> 1st focus
						// 		<child-b-b />                      (tracked by child-b)
						// 	</child-b>
						// 	<child-c>                              (tracked by child-a)
						// 		<child-c-a />                      (tracked by child-c)              -> 2nd focus
						// 		<child-c-b />                      (tracked by child-c)
						// 	</child-c>
						// </rootElement>
						rootElement.appendChild( childViewA.element );
						rootElement.appendChild( childViewB.element );
						rootElement.appendChild( childViewC.element );

						rootFocusTracker.add( rootElement );
						rootFocusTracker.add( childViewA );
						childViewA.focusTracker.add( childViewB );
						childViewA.focusTracker.add( childViewC );

						childViewB.children.get( 0 ).focus();
						childViewC.children.get( 0 ).focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

						expect( isFocusedSpy ).toHaveBeenCalledTimes( 1 );
						expect( focusedElementSpy ).toHaveBeenCalledTimes( 1 );
					} );
				} );

				describe( 'blur handling between linked focus trackers', () => {
					it( 'should set #focusedElement to the root element if focus moved back from the child view', () => {
						// <rootElement>                           (tracked by root FT)          -> 2nd focus
						// 	<child-a>                              (tracked by root FT)
						// 		<child-a-a />                      (tracked by child-a)          -> 1st focus
						// 		<child-a-b />                      (tracked by child-a)
						// 	</child-a>
						// </rootElement>
						rootElement.appendChild( childViewA.element );

						rootFocusTracker.add( rootElement );
						rootFocusTracker.add( childViewA );

						childViewA.children.get( 0 ).focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

						rootElement.focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( rootElement );

						expect( isFocusedSpy ).toHaveBeenCalledTimes( 1 );
						expect( focusedElementSpy ).toHaveBeenCalledTimes( 2 );
						expect( focusedElementSpy ).toHaveBeenNthCalledWith( 1, childViewA.element );
						expect( focusedElementSpy ).toHaveBeenNthCalledWith( 2, rootElement );
					} );

					it( 'should set #focusedElement to the view#element if focus moved from the sub-child to the child view', () => {
						// <rootElement>                           (tracked by root FT)
						// 	<child-a>                              (tracked by root FT)          -> 2nd focus
						// 		<child-a-a />                      (tracked by child-a)          -> 1st focus
						// 		<child-a-b />                      (tracked by child-a)
						// 	</child-a>
						// </rootElement>
						rootElement.appendChild( childViewA.element );

						rootFocusTracker.add( rootElement );
						rootFocusTracker.add( childViewA );

						childViewA.children.get( 0 ).focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

						childViewA.focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

						expect( isFocusedSpy ).toHaveBeenCalledTimes( 1 );
						expect( focusedElementSpy ).toHaveBeenCalledTimes( 1 );
					} );

					it( 'should set #focusedElement to a view#element in a different DOM sub-tree when its child gets focused', () => {
						// <rootElement>                           (tracked by root FT)
						// 	<child-a>                              (tracked by root FT)          -> 1st focus
						// 		<child-a-a />                      (tracked by child-a)
						// 		<child-a-b />                      (tracked by child-a)
						// 	</child-a>
						// </rootElement>
						// <child-b>                              (tracked by root FT)
						// 	<child-b-a />                         (tracked by child-b)           -> 2nd focus
						// 	<child-b-b />                         (tracked by child-b)
						// </child-b>
						rootElement.appendChild( childViewA.element );
						document.body.appendChild( childViewB.element );

						rootFocusTracker.add( rootElement );
						rootFocusTracker.add( childViewA );
						rootFocusTracker.add( childViewB );

						childViewA.focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

						childViewB.children.first.focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewB.element );

						expect( isFocusedSpy ).toHaveBeenCalledTimes( 1 );
						expect( focusedElementSpy ).toHaveBeenCalledTimes( 2 );
						expect( focusedElementSpy ).toHaveBeenNthCalledWith( 1, childViewA.element );
						expect( focusedElementSpy ).toHaveBeenNthCalledWith( 2, childViewB.element );
					} );

					it( 'should set #focusedElement to a view#element in a different DOM sub-tree when it gets focused', () => {
						// <rootElement>                           (tracked by root FT)
						// 	<child-a>                              (tracked by root FT)          -> 1st focus
						// 		<child-a-a />                      (tracked by child-a)
						// 		<child-a-b />                      (tracked by child-a)
						// 	</child-a>
						// </rootElement>
						// <child-b>                              (tracked by root FT)           -> 2nd focus
						// 	<child-b-a />                         (tracked by child-b)
						// 	<child-b-b />                         (tracked by child-b)
						// </child-b>
						rootElement.appendChild( childViewA.element );
						document.body.appendChild( childViewB.element );

						rootFocusTracker.add( rootElement );
						rootFocusTracker.add( childViewA );
						rootFocusTracker.add( childViewB );

						childViewA.focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

						childViewB.focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewB.element );

						expect( isFocusedSpy ).toHaveBeenCalledTimes( 1 );
						expect( focusedElementSpy ).toHaveBeenCalledTimes( 2 );
						expect( focusedElementSpy ).toHaveBeenNthCalledWith( 1, childViewA.element );
						expect( focusedElementSpy ).toHaveBeenNthCalledWith( 2, childViewB.element );
					} );

					it( 'should preserve #focusedElement if a focused element in a sub-tree was removed', () => {
						// <rootElement>                           (tracked by root FT)
						// 	<child-a>                              (tracked by root FT)          -> 1st focus, then remove
						// 		<child-a-a />                      (tracked by child-a)
						// 		<child-a-b />                      (tracked by child-a)
						// 	</child-a>
						// </rootElement>
						rootElement.appendChild( childViewA.element );
						rootFocusTracker.add( childViewA );

						childViewA.children.first.focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

						expect( isFocusedSpy ).toHaveBeenCalledTimes( 1 );
						expect( focusedElementSpy ).toHaveBeenCalledTimes( 1 );

						childViewA.element.remove();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

						expect( isFocusedSpy ).toHaveBeenCalledTimes( 1 );
						expect( focusedElementSpy ).toHaveBeenCalledTimes( 1 );
					} );

					it( 'should avoid accidental blurs as the focus traverses multiple DOM sub-trees (1)', () => {
						// <rootElement>                             (tracked by root FT)
						//     <child-a>                             (tracked by root FT)
						//         <child-a-a />                     (tracked by child-a)            -> 1st focus
						//         <child-a-b />                     (tracked by child-a)
						//     </child-a>
						// </rootElement>
						// <child-b>                                 (tracked by root FT)           -> 2nd focus
						//     <child-b-a>                           (tracked by child-b)
						//         <child-c>                         (tracked by child-b)
						//             <child-c-a />                 (tracked by child-c)
						//             <child-c-b />                 (tracked by child-c)           -> 3rd focus
						//         </child-c>
						//     </child-b-a>
						//     <child-b-b />                         (tracked by child-b)           -> 4th focus
						// </child-b>
						rootElement.appendChild( childViewA.element );
						document.body.appendChild( childViewB.element );
						childViewB.children.first.children.add( childViewC );

						rootFocusTracker.add( rootElement );
						rootFocusTracker.add( childViewA );
						rootFocusTracker.add( childViewB );
						childViewB.focusTracker.add( childViewC );

						childViewA.children.first.focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

						childViewB.focus();
						childViewC.children.last.focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewB.element );

						childViewB.children.last.focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewB.element );

						expect( isFocusedSpy ).toHaveBeenCalledTimes( 1 );
						expect( focusedElementSpy ).toHaveBeenCalledTimes( 2 );
						expect( focusedElementSpy ).toHaveBeenNthCalledWith( 1, childViewA.element );
						expect( focusedElementSpy ).toHaveBeenNthCalledWith( 2, childViewB.element );
					} );

					it( 'should avoid accidental blurs as the focus traverses multiple DOM sub-trees (2)', () => {
						// <rootElement>                             (tracked by root FT)
						//     <child-a>                             (tracked by root FT)
						//         <child-a-a />                     (tracked by child-a)            -> 1st focus
						//         <child-a-b />                     (tracked by child-a)
						//     </child-a>
						//     <child-b>                             (tracked by root FT)           -> 3rd focus
						//         <child-b-a />                     (tracked by child-b)
						//         <child-b-b />                     (tracked by child-b)
						//     </child-b>
						// </rootElement>
						// <child-c>                                  (tracked by child-b)
						//     <child-c-a />                          (tracked by child-c)
						//     <child-c-b />                          (tracked by child-c)           -> 2nd focus
						// </child-c>
						rootElement.appendChild( childViewA.element );
						rootElement.appendChild( childViewB.element );
						document.body.appendChild( childViewC.element );

						rootFocusTracker.add( rootElement );
						rootFocusTracker.add( childViewA );
						rootFocusTracker.add( childViewB );
						childViewB.focusTracker.add( childViewC );

						childViewA.children.first.focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

						childViewC.children.first.focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewB.element );

						childViewB.focus();
						expect( rootFocusTracker.isFocused ).toBe( true );
						expect( rootFocusTracker.focusedElement ).toBe( childViewB.element );

						expect( isFocusedSpy ).toHaveBeenCalledTimes( 1 );
						expect( focusedElementSpy ).toHaveBeenCalledTimes( 2 );
						expect( focusedElementSpy ).toHaveBeenNthCalledWith( 1, childViewA.element );
						expect( focusedElementSpy ).toHaveBeenNthCalledWith( 2, childViewB.element );
					} );
				} );

				it( 'should avoid accidental blurs as the focus traverses multiple DOM sub-trees (3)', () => {
					// <rootElement>                             (tracked by root FT)
					//     <child-a>                             (tracked by root FT)
					//         <child-a-a />                     (tracked by child-a)            -> 1st focus
					//         <child-a-b />                     (tracked by child-a)
					//     </child-a>
					//     <child-b>                             (tracked by root FT)
					//         <child-b-a />                     (tracked by child-b)
					//         <child-b-b />                     (tracked by child-b)
					//     </child-b>
					// </rootElement>
					// <child-c>
					//     <child-c-a />                          (tracked by child-c)           -> 2nd focus
					//     <child-c-b />                          (tracked by child-c)
					// </child-c>
					rootElement.appendChild( childViewA.element );
					rootElement.appendChild( childViewB.element );
					document.body.appendChild( childViewC.element );

					rootFocusTracker.add( rootElement );
					rootFocusTracker.add( childViewA );
					rootFocusTracker.add( childViewB );

					childViewA.children.first.focus();
					expect( rootFocusTracker.isFocused ).toBe( true );
					expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

					childViewC.children.first.focus();
					expect( rootFocusTracker.isFocused ).toBe( false );
					expect( rootFocusTracker.focusedElement ).toBe( null );

					expect( isFocusedSpy ).toHaveBeenCalledTimes( 2 );
					expect( focusedElementSpy ).toHaveBeenCalledTimes( 2 );
					expect( focusedElementSpy ).toHaveBeenNthCalledWith( 1, childViewA.element );
					expect( focusedElementSpy ).toHaveBeenNthCalledWith( 2, null );
				} );
			} );
		} );
	} );

	describe( 'remove()', () => {
		describe( 'for DOM elements', () => {
			it( 'should do nothing when element was not added', () => {
				expect( () => {
					focusTracker.remove( container );
				} ).not.toThrow();
			} );

			it( 'should stop listening on element focus', () => {
				focusTracker.add( containerFirstInput );
				focusTracker.remove( containerFirstInput );

				containerFirstInput.dispatchEvent( new Event( 'focus' ) );

				expect( focusTracker.isFocused ).toBe( false );
				expect( focusTracker.focusedElement ).toBeNull();
			} );

			it( 'should stop listening on element blur', () => {
				focusTracker.add( containerFirstInput );
				focusTracker.remove( containerFirstInput );
				focusTracker.isFocused = true;

				containerFirstInput.dispatchEvent( new Event( 'blur' ) );
				vi.advanceTimersByTime( 0 );

				expect( focusTracker.isFocused ).toBe( true );
			} );

			it( 'should blur element before removing when is focused', () => {
				focusTracker.add( containerFirstInput );
				containerFirstInput.dispatchEvent( new Event( 'focus' ) );
				expect( focusTracker.focusedElement ).toBe( containerFirstInput );

				expect( focusTracker.isFocused ).toBe( true );

				focusTracker.remove( containerFirstInput );
				vi.advanceTimersByTime( 0 );

				expect( focusTracker.isFocused ).toBe( false );
				expect( focusTracker.focusedElement ).toBeNull();
			} );
		} );

		describe( 'for views', () => {
			describe( 'without focus tracker', () => {
				let viewA, viewB;

				beforeEach( () => {
					viewA = new FocusableView( 'a' );
					viewB = new FocusableView( 'b' );

					viewA.render();
					viewB.render();

					document.body.appendChild( viewA.element );
					document.body.appendChild( viewB.element );
				} );

				afterEach( () => {
					viewA.destroy();
					viewB.destroy();

					viewA.element.remove();
					viewB.element.remove();
				} );

				it( 'should stop listening to view#element just like any other DOM element', () => {
					focusTracker.add( viewA );
					focusTracker.add( viewB );

					viewA.focus();

					expect( focusTracker.isFocused ).toBe( true );
					expect( focusTracker.focusedElement ).toBe( viewA.element );

					viewB.focus();

					expect( focusTracker.isFocused ).toBe( true );
					expect( focusTracker.focusedElement ).toBe( viewB.element );

					focusTracker.remove( viewA );
					vi.advanceTimersByTime( 10 );

					expect( focusTracker.isFocused ).toBe( true );
					expect( focusTracker.focusedElement ).toBe( viewB.element );

					viewA.focus();

					expect( focusTracker.isFocused ).toBe( false );
					expect( focusTracker.focusedElement ).toBe( null );
				} );

				it( 'should remove view#element from #elements', () => {
					focusTracker.add( viewA );
					focusTracker.add( viewB );

					expect( focusTracker.elements ).toEqual( [ viewA.element, viewB.element ] );

					focusTracker.remove( viewA );
					vi.advanceTimersByTime( 10 );

					expect( focusTracker.elements ).toEqual( [ viewB.element ] );
				} );

				it( 'should update state upon removing view#element if focused', () => {
					focusTracker.add( viewA );

					viewA.focus();

					expect( focusTracker.isFocused ).toBe( true );
					expect( focusTracker.focusedElement ).toBe( viewA.element );

					focusTracker.remove( viewA );
					vi.advanceTimersByTime( 10 );

					expect( focusTracker.isFocused ).toBe( false );
					expect( focusTracker.focusedElement ).toBe( null );
				} );
			} );

			describe( 'with focus tracker', () => {
				let childViewA, childViewB, rootFocusTracker, rootElement;

				beforeEach( () => {
					rootElement = document.createElement( 'root' );
					rootElement.setAttribute( 'tabindex', 0 );

					document.body.appendChild( rootElement );

					childViewA = new FocusableViewWithFocusTracker( 'child-a' );
					childViewB = new FocusableViewWithFocusTracker( 'child-b' );

					childViewA.render();
					childViewB.render();

					rootFocusTracker = focusTracker;
				} );

				afterEach( () => {
					childViewA.destroy();
					childViewB.destroy();
					rootElement.remove();
					childViewA.element.remove();
					childViewB.element.remove();
				} );

				it( 'should stop listening to view#element just like any other DOM element', () => {
					focusTracker.add( childViewA );
					focusTracker.add( childViewB );

					document.body.appendChild( childViewA.element );
					document.body.appendChild( childViewB.element );

					childViewA.focus();

					expect( rootFocusTracker.isFocused ).toBe( true );
					expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

					childViewB.focus();

					expect( focusTracker.isFocused ).toBe( true );
					expect( focusTracker.focusedElement ).toBe( childViewB.element );

					focusTracker.remove( childViewA );
					vi.advanceTimersByTime( 10 );

					expect( focusTracker.isFocused ).toBe( true );
					expect( focusTracker.focusedElement ).toBe( childViewB.element );

					childViewA.focus();

					expect( focusTracker.isFocused ).toBe( false );
					expect( focusTracker.focusedElement ).toBeNull();
				} );

				it( 'should remove view from #externalViews', () => {
					focusTracker.add( childViewA );

					expect( focusTracker.externalViews ).toEqual( [ childViewA ] );

					focusTracker.remove( childViewA );

					expect( focusTracker.externalViews ).toEqual( [] );
				} );

				it( 'should remove a related view without #element', () => {
					const detachedView = {
						element: null,
						focusTracker: new FocusTracker()
					};

					focusTracker.add( detachedView );
					focusTracker.remove( detachedView );

					expect( focusTracker.externalViews ).toEqual( [] );
					expect( focusTracker.elements ).toEqual( [] );

					detachedView.focusTracker.destroy();
				} );

				it( 'should remove view#element from #elements', () => {
					focusTracker.add( childViewA );

					expect( focusTracker.elements ).toEqual( [ childViewA.element ] );

					focusTracker.remove( childViewA );

					expect( focusTracker.elements ).toEqual( [] );
				} );

				it( 'should update the focus tracker\'s state upon removing view#element (if view#element was focused)', () => {
					focusTracker.add( childViewA );
					focusTracker.add( childViewB );

					document.body.appendChild( childViewA.element );
					document.body.appendChild( childViewB.element );

					childViewA.focus();

					expect( rootFocusTracker.isFocused ).toBe( true );
					expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

					focusTracker.remove( childViewA );
					vi.advanceTimersByTime( 10 );

					expect( focusTracker.isFocused ).toBe( false );
					expect( focusTracker.focusedElement ).toBeNull();
				} );

				it( 'should not blur the focus tracker if another focus tracker is focused', () => {
					focusTracker.add( childViewA );
					focusTracker.add( childViewB );

					document.body.appendChild( childViewA.element );
					document.body.appendChild( childViewB.element );

					childViewA.focus();

					expect( rootFocusTracker.isFocused ).toBe( true );
					expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

					childViewB.focus();

					expect( focusTracker.isFocused ).toBe( true );
					expect( focusTracker.focusedElement ).toBe( childViewB.element );

					focusTracker.remove( childViewA );
					vi.advanceTimersByTime( 10 );

					expect( focusTracker.isFocused ).toBe( true );
					expect( focusTracker.focusedElement ).toBe( childViewB.element );
				} );

				it( 'should not blur the focus tracker if another DOM element is focused', () => {
					const focusableDomElement = document.createElement( 'button' );

					focusTracker.add( childViewA );
					focusTracker.add( focusableDomElement );

					document.body.appendChild( childViewA.element );
					document.body.appendChild( focusableDomElement );

					childViewA.focus();

					expect( rootFocusTracker.isFocused ).toBe( true );
					expect( rootFocusTracker.focusedElement ).toBe( childViewA.element );

					focusableDomElement.focus();

					expect( focusTracker.isFocused ).toBe( true );
					expect( focusTracker.focusedElement ).toBe( focusableDomElement );

					focusTracker.remove( childViewA );
					vi.advanceTimersByTime( 10 );

					expect( focusTracker.isFocused ).toBe( true );
					expect( focusTracker.focusedElement ).toBe( focusableDomElement );

					focusableDomElement.remove();
				} );
			} );
		} );
	} );

	describe( '#elements', () => {
		it( 'should return an array with elements currently added to the focus tracker', () => {
			expect( focusTracker.elements ).toEqual( [] );

			const elementA = document.createElement( 'div' );
			focusTracker.add( elementA );

			expect( focusTracker.elements ).toEqual( [ elementA ] );

			const elementB = document.createElement( 'div' );
			focusTracker.add( elementB );

			expect( focusTracker.elements ).toEqual( [ elementA, elementB ] );

			focusTracker.remove( elementA );

			expect( focusTracker.elements ).toEqual( [ elementB ] );

			focusTracker.remove( elementB );

			expect( focusTracker.elements ).toEqual( [] );
		} );

		it( 'changing returned value should not have an effect on focus tracker', () => {
			const elements = focusTracker.elements;

			expect( focusTracker.elements ).toEqual( [] );

			const elementA = document.createElement( 'div' );
			elements.push( elementA );

			expect( focusTracker.elements ).toEqual( [] );
		} );
	} );

	describe( '#externalViews', () => {
		it( 'should return an array of views linked to the focus tracker that contribute to its state', () => {
			const viewA = new FocusableViewWithFocusTracker( 'a' );
			const viewB = new FocusableViewWithFocusTracker( 'a' );

			focusTracker.add( viewA );
			focusTracker.add( viewB );

			expect( focusTracker.externalViews ).toBeInstanceOf( Array );
			expect( focusTracker.externalViews ).toEqual( [ viewA, viewB ] );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should stop listening', () => {
			const stopListeningSpy = vi.spyOn( focusTracker, 'stopListening' );

			focusTracker.destroy();

			expect( stopListeningSpy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	class FocusableView extends View {
		constructor( elementName = 'childElement' ) {
			super();

			this.children = this.createCollection();

			this.setTemplate( {
				tag: elementName,
				attributes: {
					tabindex: 0
				},
				children: this.children
			} );
		}

		focus() {
			this.element.focus();
			vi.advanceTimersByTime( 10 );
		}
	}

	class FocusableViewWithFocusTracker extends FocusableView {
		constructor( elementName ) {
			super( elementName );

			this.children.addMany( [
				new FocusableView( elementName + '-a' ),
				new FocusableView( elementName + '-b' )
			] );

			this.focusTracker = new FocusTracker();
		}

		render() {
			super.render();

			this.focusTracker.add( this.children.get( 0 ) );
			this.focusTracker.add( this.children.get( 1 ) );
		}

		destroy() {
			super.destroy();

			this.focusTracker.destroy();
		}
	}
} );
