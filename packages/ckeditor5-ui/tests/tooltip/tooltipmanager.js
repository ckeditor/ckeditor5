/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EditorUI } from '../../src/editorui/editorui.js';
import { View } from '../../src/view.js';
import { BalloonPanelView } from '../../src/panel/balloon/balloonpanelview.js';
import { BodyCollection } from '../../src/editorui/bodycollection.js';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { global } from '@ckeditor/ckeditor5-utils';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import { TooltipManager } from '../../src/tooltipmanager.js';
import { Editor } from '@ckeditor/ckeditor5-core';

describe( 'TooltipManager', () => {
	let editor, element, tooltipManager;

	const utils = getUtils();

	beforeEach( async () => {
		// TooltipManager is a singleton shared across editor instances. If any other test didn't
		// kill its editor, tear the lingering instance down (including its document listeners) so it does
		// not double up with the one created below.
		if ( TooltipManager._instance ) {
			TooltipManager._instance.stopListening();
		}

		TooltipManager._instance = null;
		TooltipManager._registrations = new Map();

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

		describe( 'registerBodyCollection()', () => {
			it( 'should register the editor body collection so it can host tooltips', () => {
				expect( TooltipManager._registrations.has( editor.ui.view.body ) ).toBe( true );
			} );

			it( 'should be a no-op when the same body collection is registered again', () => {
				const listenToSpy = vi.spyOn( tooltipManager, 'listenTo' );

				tooltipManager.registerBodyCollection( editor.ui.view.body, {
					shadowRootRegistry: editor.ui.shadowRootRegistry,
					updateEmitter: editor.ui
				} );

				expect( listenToSpy ).not.toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'registered feature body collections', () => {
		let featureHost, featureShadowRoot, featureBody, pinSpy;

		beforeEach( () => {
			featureHost = document.createElement( 'div' );
			document.body.appendChild( featureHost );
			featureShadowRoot = featureHost.attachShadow( { mode: 'open' } );

			featureBody = new BodyCollection( editor.locale );
			featureBody.attachToDom( featureShadowRoot );

			pinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'pin' );
		} );

		afterEach( () => {
			tooltipManager.unregisterBodyCollection( featureBody );
			featureBody.destroy();
			featureHost.remove();
		} );

		function tooltippedElementIn( root ) {
			const button = document.createElement( 'button' );

			button.dataset.ckeTooltipText = 'Feature';
			root.appendChild( button );

			return button;
		}

		it( 'should attach shadow-root listeners for a registered feature body collection', () => {
			expect( tooltipManager._shadowRoots.has( featureShadowRoot ) ).toBe( false );

			tooltipManager.registerBodyCollection( featureBody );

			expect( tooltipManager._shadowRoots.has( featureShadowRoot ) ).toBe( true );
		} );

		it( 'should pin the tooltip into the feature body collection when the target lives in its tree', () => {
			tooltipManager.registerBodyCollection( featureBody );

			tooltipManager._pinTooltip( tooltippedElementIn( featureShadowRoot ), { text: 'Feature', position: 's', cssClass: '' } );

			expect( featureBody.has( tooltipManager.balloonPanelView ) ).toBe( true );
			expect( editor.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( false );
			expect( pinSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should migrate the balloon back to the editor body once the feature collection is unregistered', () => {
			tooltipManager.registerBodyCollection( featureBody );

			tooltipManager._pinTooltip( tooltippedElementIn( featureShadowRoot ), { text: 'Feature', position: 's', cssClass: '' } );
			expect( featureBody.has( tooltipManager.balloonPanelView ) ).toBe( true );

			tooltipManager.unregisterBodyCollection( featureBody );

			expect( featureBody.has( tooltipManager.balloonPanelView ) ).toBe( false );
			expect( tooltipManager._shadowRoots.has( featureShadowRoot ) ).toBe( false );
		} );

		it( 'should unpin a tooltip pinned in the feature body collection when it is unregistered', () => {
			// Otherwise the balloon would be detached with the collection while the manager still treated it as
			// pinned, and a later `update` would try to reposition a removed balloon.
			tooltipManager.registerBodyCollection( featureBody );

			const target = tooltippedElementIn( featureShadowRoot );

			tooltipManager._pinTooltip( target, { text: 'Feature', position: 's', cssClass: '' } );
			expect( tooltipManager._currentElementWithTooltip ).toBe( target );

			const unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );

			tooltipManager.unregisterBodyCollection( featureBody );

			expect( unpinSpy ).toHaveBeenCalled();
			expect( tooltipManager._currentElementWithTooltip ).toBe( null );
			expect( featureBody.has( tooltipManager.balloonPanelView ) ).toBe( false );
		} );

		it( 'should not unpin when unregistering an idle host that merely still holds the balloon', () => {
			// Unpinning here would cancel a pending pin queued by another live registrant during the hover delay.
			tooltipManager.registerBodyCollection( featureBody );

			// Pin then unpin so the balloon is left idle in the feature collection with no tooltip pinned.
			tooltipManager._pinTooltip( tooltippedElementIn( featureShadowRoot ), { text: 'Feature', position: 's', cssClass: '' } );
			tooltipManager._unpinTooltip();

			expect( featureBody.has( tooltipManager.balloonPanelView ) ).toBe( true );
			expect( tooltipManager._currentElementWithTooltip ).toBe( null );

			const unpinSpy = vi.spyOn( tooltipManager, '_unpinTooltip' );

			tooltipManager.unregisterBodyCollection( featureBody );

			expect( unpinSpy ).not.toHaveBeenCalled();
			expect( featureBody.has( tooltipManager.balloonPanelView ) ).toBe( false );
		} );

		it( 'should unpin a pinned tooltip when the hosting collection is unmounted from the DOM', () => {
			// Otherwise the manager would keep treating the balloon (disconnected together with the collection)
			// as pinned and reposition it on every update.
			tooltipManager.registerBodyCollection( featureBody );

			const target = tooltippedElementIn( featureShadowRoot );

			tooltipManager._pinTooltip( target, { text: 'Feature', position: 's', cssClass: '' } );
			expect( tooltipManager._currentElementWithTooltip ).toBe( target );

			featureBody.unmountFromDom();

			expect( tooltipManager._currentElementWithTooltip ).toBe( null );
			expect( featureBody.has( tooltipManager.balloonPanelView ) ).toBe( true );
		} );

		it( 'should not cancel a queued pin when an idle hosting collection is unmounted', () => {
			// Unpinning here would cancel a pending pin queued by another live registrant during the hover delay.
			tooltipManager.registerBodyCollection( featureBody );

			// Pin then unpin so the balloon is left idle in the feature collection with no tooltip pinned.
			tooltipManager._pinTooltip( tooltippedElementIn( featureShadowRoot ), { text: 'Feature', position: 's', cssClass: '' } );
			tooltipManager._unpinTooltip();

			expect( featureBody.has( tooltipManager.balloonPanelView ) ).toBe( true );

			const unpinSpy = vi.spyOn( tooltipManager, '_unpinTooltip' );

			featureBody.unmountFromDom();

			expect( unpinSpy ).not.toHaveBeenCalled();
		} );

		it( 'should re-resolve the host after the feature collection re-mounts into a different tree', () => {
			tooltipManager.registerBodyCollection( featureBody );

			const otherHost = document.createElement( 'div' );

			document.body.appendChild( otherHost );

			const otherShadowRoot = otherHost.attachShadow( { mode: 'open' } );

			featureBody.attachToDom( otherShadowRoot );

			expect( tooltipManager._shadowRoots.has( featureShadowRoot ) ).toBe( false );
			expect( tooltipManager._shadowRoots.has( otherShadowRoot ) ).toBe( true );

			otherHost.remove();
		} );

		it( 'should not pin a tooltip when no body collection is registered', () => {
			tooltipManager.unregisterBodyCollection( editor.ui.view.body );

			const returned = tooltipManager._moveBalloonToConnectedBodyCollection( tooltippedElementIn( featureShadowRoot ) );

			expect( returned ).toBe( false );

			tooltipManager._pinTooltip( tooltippedElementIn( featureShadowRoot ), { text: 'Feature', position: 's', cssClass: '' } );

			expect( pinSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'registered documents', () => {
		it( 'should listen for and render tooltips in each registered document', () => {
			const iframe = document.createElement( 'iframe' );

			document.body.appendChild( iframe );

			const iframeDocument = iframe.contentDocument;
			const iframeBody = new BodyCollection( editor.locale );
			const button = iframeDocument.createElement( 'button' );
			const pinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'pin' );

			iframeBody.attachToDom( iframeDocument.body );
			tooltipManager.registerBodyCollection( iframeBody );

			button.dataset.ckeTooltipText = 'Iframe tooltip';
			button.dataset.ckeTooltipInstant = 'true';
			iframeDocument.body.appendChild( button );

			button.dispatchEvent( new iframe.contentWindow.MouseEvent( 'mouseenter' ) );

			expect( tooltipManager._documents.has( iframeDocument ) ).toBe( true );
			expect( iframeBody.has( tooltipManager.balloonPanelView ) ).toBe( true );
			expect( pinSpy ).toHaveBeenCalledWith( {
				target: button,
				positions: expect.any( Array )
			} );

			tooltipManager.unregisterBodyCollection( iframeBody );

			expect( tooltipManager._documents.has( iframeDocument ) ).toBe( false );

			iframeBody.destroy();
			iframe.remove();
		} );
	} );

	describe( 'destroy()', () => {
		describe( 'singleton', () => {
			it( 'should not be destroyed until the last editor instance gets destroyed', async () => {
				const secondEditor = await ClassicTestEditor.create( element, {
					plugins: [ Paragraph, Bold, Italic ],
					balloonToolbar: [ 'bold', 'italic' ]
				} );

				const manager = editor.ui.tooltipManager;

				await editor.destroy();

				// Still shared with (and kept alive by) the second editor.
				expect( TooltipManager._instance ).toBe( manager );

				await secondEditor.destroy();

				expect( TooltipManager._instance ).toBe( null );
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

		it( 'should unpin the #balloonPanelView when the last holder releases it', () => {
			const unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );

			tooltipManager.release();

			expect( unpinSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should destroy #balloonPanelView when the last holder releases it', () => {
			const destroySpy = vi.spyOn( tooltipManager.balloonPanelView, 'destroy' );

			tooltipManager.release();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );

		it( 'should stop listening to events when the last holder releases it', () => {
			const stopListeningSpy = vi.spyOn( tooltipManager, 'stopListening' );

			tooltipManager.release();

			expect( stopListeningSpy ).toHaveBeenCalled();
		} );

		it( 'should cancel any queued pinning when the last holder releases it', () => {
			const cancelSpy = vi.spyOn( tooltipManager._pinTooltipDebounced, 'cancel' );

			tooltipManager.release();

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

				it( 'should pin the tooltip in a mounted body collection, not in a detached editor\'s unmounted one', async () => {
					// The body collection is mounted lazily and unmounted again when its editing root leaves the
					// document, so the first registered editor may be detached-but-alive with an unmounted body.
					// Adding the balloon there would render it outside the document and keep the tooltip invisible.
					const secondEditor = await ClassicTestEditor.create( element, {
						plugins: [ Paragraph, Bold, Italic ],
						balloonToolbar: [ 'bold', 'italic' ]
					} );

					// Simulate the first editor being detached from the document (but kept alive).
					editor.ui.view.body.unmountFromDom();

					utils.dispatchMouseEnter( elements.a );
					utils.waitForTheTooltipToShow();

					expect( editor.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( false );
					expect( secondEditor.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( true );

					await secondEditor.destroy();
				} );

				it( 'should not pin the tooltip in a body collection whose mount target is detached from the document', async () => {
					// A truthy mount target is not necessarily connected: a configured `ui.overlayContainer` can be
					// mounted while still detached. Such a body must not capture the balloon over a connected editor.
					const secondEditor = await ClassicTestEditor.create( element, {
						plugins: [ Paragraph, Bold, Italic ],
						balloonToolbar: [ 'bold', 'italic' ]
					} );

					// The first editor's body is mounted, but in a target detached from the document.
					editor.ui.view.body.attachToDom( document.createElement( 'div' ) );

					utils.dispatchMouseEnter( elements.a );
					utils.waitForTheTooltipToShow();

					expect( editor.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( false );
					expect( secondEditor.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( true );

					await secondEditor.destroy();
				} );

				it( 'should migrate the balloon out of the previous body collection when the host editor changes', async () => {
					// The balloon is a singleton. When it moves to another editor's body collection it must leave the
					// previous one, otherwise it would belong to two collections at once.
					const secondEditor = await ClassicTestEditor.create( element, {
						plugins: [ Paragraph, Bold, Italic ],
						balloonToolbar: [ 'bold', 'italic' ]
					} );

					// First pin lands in the first editor's (mounted) body collection.
					utils.dispatchMouseEnter( elements.a );
					utils.waitForTheTooltipToShow();

					expect( editor.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( true );

					// The first editor gets detached, so the next pin must migrate to the second editor.
					editor.ui.view.body.unmountFromDom();

					utils.dispatchMouseEnter( elements.b );
					utils.waitForTheTooltipToShow();

					expect( editor.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( false );
					expect( secondEditor.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( true );

					await secondEditor.destroy();
				} );

				it( 'should fall back to the first editor\'s body collection when none is connected', async () => {
					// The balloon still needs a home even if no editor has a mounted, connected body collection
					// (for example every editor is detached-but-alive). It falls back to the first registered editor.
					const secondEditor = await ClassicTestEditor.create( element, {
						plugins: [ Paragraph, Bold, Italic ],
						balloonToolbar: [ 'bold', 'italic' ]
					} );

					editor.ui.view.body.unmountFromDom();
					secondEditor.ui.view.body.unmountFromDom();

					utils.dispatchMouseEnter( elements.a );
					utils.waitForTheTooltipToShow();

					expect( editor.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( true );
					expect( secondEditor.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( false );

					await secondEditor.destroy();
				} );

				it( 'should pin into the connected body collection that shares the hovered element\'s DOM tree', async () => {
					// Each editor's body collection can mount into a different tree (its own shadow root). The shared
					// balloon must land in the tree of the hovered element, or it would be clipped by another root
					// and styled by the wrong sheets. The first-registered `editor` here stays in the light DOM, so a
					// naive "first connected editor" selection would wrongly capture the balloon.
					const hostA = document.createElement( 'div' );
					const hostB = document.createElement( 'div' );

					document.body.appendChild( hostA );
					document.body.appendChild( hostB );

					const rootA = hostA.attachShadow( { mode: 'open' } );
					const rootB = hostB.attachShadow( { mode: 'open' } );
					const editableA = document.createElement( 'div' );
					const editableB = document.createElement( 'div' );

					rootA.appendChild( editableA );
					rootB.appendChild( editableB );

					const editorA = await ClassicTestEditor.create( editableA, { plugins: [ Paragraph ] } );
					const editorB = await ClassicTestEditor.create( editableB, { plugins: [ Paragraph ] } );

					editorA.ui.view.body.attachToDom( rootA );
					editorB.ui.view.body.attachToDom( rootB );

					const button = document.createElement( 'button' );

					button.dataset.ckeTooltipText = 'B';
					rootB.appendChild( button );

					tooltipManager._pinTooltip( button, { text: 'B', position: 's', cssClass: '' } );

					expect( editorB.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( true );
					expect( editorA.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( false );
					expect( editor.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( false );

					await editorA.destroy();
					await editorB.destroy();
					hostA.remove();
					hostB.remove();
				} );

				it( 'should pin into the owning editor\'s body collection when its overlay container is a separate tree', async () => {
					// Each editor's editable lives in its own shadow tree, and `ui.overlayContainer` mounts its body
					// collection into yet another, separate tree. The hovered toolbar element then shares neither
					// body collection's tree, so the owner must be found by the editable's tree — otherwise the
					// tooltip would land in the other editor's overlay container.
					const editableHostA = document.createElement( 'div' );
					const editableHostB = document.createElement( 'div' );
					const overlayHostA = document.createElement( 'div' );
					const overlayHostB = document.createElement( 'div' );

					for ( const host of [ editableHostA, editableHostB, overlayHostA, overlayHostB ] ) {
						document.body.appendChild( host );
					}

					const editableRootA = editableHostA.attachShadow( { mode: 'open' } );
					const editableRootB = editableHostB.attachShadow( { mode: 'open' } );
					const overlayRootA = overlayHostA.attachShadow( { mode: 'open' } );
					const overlayRootB = overlayHostB.attachShadow( { mode: 'open' } );
					const editableA = document.createElement( 'div' );
					const editableB = document.createElement( 'div' );

					editableRootA.appendChild( editableA );
					editableRootB.appendChild( editableB );

					const editorA = await ClassicTestEditor.create( editableA, {
						plugins: [ Paragraph ],
						ui: { overlayContainer: overlayRootA }
					} );
					const editorB = await ClassicTestEditor.create( editableB, {
						plugins: [ Paragraph ],
						ui: { overlayContainer: overlayRootB }
					} );

					// The body collections mount into the overlay trees, separate from the editable trees.
					expect( editorB.ui.view.body.mountTarget ).toBe( overlayRootB );

					const button = document.createElement( 'button' );

					button.dataset.ckeTooltipText = 'B';
					editableRootB.appendChild( button );

					tooltipManager._pinTooltip( button, { text: 'B', position: 's', cssClass: '' } );

					expect( editorB.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( true );
					expect( editorA.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( false );

					await editorA.destroy();
					await editorB.destroy();
					editableHostA.remove();
					editableHostB.remove();
					overlayHostA.remove();
					overlayHostB.remove();
				} );

				it( 'should attribute a UI node registered in its own shadow tree (e.g. a detached toolbar) to its editor', async () => {
					// An editor's toolbar (or menu bar) can be placed in a shadow tree separate from both its editable
					// and its body collection. The editor registers such regions in its shadow root registry, so the
					// tooltip is attributed through it and lands in that editor's body collection, not the first one.
					const toolbarHost = document.createElement( 'div' );

					document.body.appendChild( toolbarHost );

					const toolbarRoot = toolbarHost.attachShadow( { mode: 'open' } );
					const toolbarElement = document.createElement( 'div' );
					const toolbarButton = document.createElement( 'button' );

					toolbarButton.dataset.ckeTooltipText = 'T';
					toolbarElement.appendChild( toolbarButton );
					toolbarRoot.appendChild( toolbarElement );

					const secondEditor = await ClassicTestEditor.create( element, { plugins: [ Paragraph ] } );

					// Mirror how the editor UI registers its toolbar element with the shadow root registry.
					secondEditor.ui.shadowRootRegistry.registerNode( toolbarElement );

					tooltipManager._pinTooltip( toolbarButton, { text: 'T', position: 's', cssClass: '' } );

					expect( secondEditor.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( true );
					expect( editor.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( false );

					await secondEditor.destroy();
					toolbarHost.remove();
				} );

				it( 'should fall back to a connected body collection when the hovered element\'s tree has none', () => {
					// When no connected body collection shares the hovered element's tree, the balloon still has to
					// land somewhere connected (visible), so it prefers a connected body collection over the first
					// registered editor (whose body may be unmounted).
					const detachedElement = document.createElement( 'div' );

					expect( tooltipManager._getConnectedBodyCollection( detachedElement ) ).toBe( editor.ui.view.body );
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

		it( 'should reposition once per update when another registration shares the same update emitter', () => {
			const sharedBody = new BodyCollection( editor.locale );

			sharedBody.attachToDom( document.body );
			tooltipManager.registerBodyCollection( sharedBody, { updateEmitter: editor.ui } );

			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow();

			expect( pinSpy ).toHaveBeenCalledOnce();

			editor.ui.update();

			// Listeners are attached per emitter, not per registration, so the shared emitter must not be listened
			// to twice.
			expect( pinSpy ).toHaveBeenCalledTimes( 2 );

			tooltipManager.unregisterBodyCollection( sharedBody );
			sharedBody.destroy();
		} );

		it( 'should keep repositioning after another registration sharing the update emitter is unregistered', () => {
			const sharedBody = new BodyCollection( editor.locale );

			sharedBody.attachToDom( document.body );
			tooltipManager.registerBodyCollection( sharedBody, { updateEmitter: editor.ui } );

			utils.dispatchMouseEnter( elements.a );
			utils.waitForTheTooltipToShow();

			expect( pinSpy ).toHaveBeenCalledOnce();

			// The tooltip is pinned in the editor's own collection, so unregistering the other one must not drop
			// the reposition listeners of the still-live editor registration.
			tooltipManager.unregisterBodyCollection( sharedBody );

			editor.ui.update();

			expect( pinSpy ).toHaveBeenCalledTimes( 2 );

			sharedBody.destroy();
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
			expect( TooltipManager.defaultBalloonPositions ).toBeDefined();
		} );
	} );

	describe( 'shadow DOM', () => {
		let shadowHost, shadowRoot, shadowEditor, shadowElement, pinSpy, unpinSpy;

		beforeEach( async () => {
			shadowHost = document.createElement( 'div' );
			document.body.appendChild( shadowHost );

			shadowRoot = shadowHost.attachShadow( { mode: 'open' } );
			shadowElement = document.createElement( 'div' );
			shadowRoot.appendChild( shadowElement );

			shadowEditor = await ClassicTestEditor.create( shadowElement, {
				plugins: [ Paragraph, Bold, Italic ],
				balloonToolbar: [ 'bold', 'italic' ]
			} );

			pinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'pin' );
			unpinSpy = vi.spyOn( tooltipManager.balloonPanelView, 'unpin' );

			vi.useFakeTimers();
		} );

		afterEach( async () => {
			vi.useRealTimers();

			await shadowEditor?.destroy();
			shadowHost.remove();
		} );

		function createTooltippedElement( root ) {
			const element = document.createElement( 'button' );

			element.dataset.ckeTooltipText = 'Shadow tooltip';
			root.appendChild( element );

			return element;
		}

		for ( const mode of [ 'open', 'closed' ] ) {
			it( `pins a tooltip for an element hosted in a shadow root (mode: '${ mode }')`, async () => {
				const host = document.createElement( 'div' );

				document.body.appendChild( host );

				const root = host.attachShadow( { mode } );
				const editableElement = document.createElement( 'div' );

				root.appendChild( editableElement );

				const localEditor = await ClassicTestEditor.create( editableElement, {
					plugins: [ Paragraph ]
				} );

				try {
					const button = createTooltippedElement( root );

					button.dispatchEvent( new MouseEvent( 'mouseenter' ) );
					vi.advanceTimersByTime( 650 );

					expect( pinSpy ).toHaveBeenCalledWith( {
						target: button,
						positions: expect.any( Array )
					} );
				} finally {
					await localEditor.destroy();
					host.remove();
				}
			} );
		}

		it( 'unpins the tooltip on mouseleave from an element hosted in a shadow root', () => {
			const button = createTooltippedElement( shadowRoot );

			button.dispatchEvent( new MouseEvent( 'mouseenter' ) );
			vi.advanceTimersByTime( 650 );

			expect( pinSpy ).toHaveBeenCalledOnce();

			// Cleared rather than re-spied: `vi.spyOn()` on an already-spied method returns the same mock, keeping
			// a count that by now already includes the `unpin()` calls made while pinning.
			unpinSpy.mockClear();

			button.dispatchEvent( new MouseEvent( 'mouseleave', { relatedTarget: document.body } ) );
			vi.advanceTimersByTime( 650 );

			expect( unpinSpy ).toHaveBeenCalledOnce();
		} );

		it( 'pins the tooltip immediately on focus of an element hosted in a shadow root', () => {
			const button = createTooltippedElement( shadowRoot );

			button.dispatchEvent( new Event( 'focus', { composed: true } ) );

			expect( pinSpy ).toHaveBeenCalledWith( {
				target: button,
				positions: expect.any( Array )
			} );
		} );

		it( 'unpins the tooltip on blur of an element hosted in a shadow root', () => {
			const button = createTooltippedElement( shadowRoot );

			button.dispatchEvent( new Event( 'focus', { composed: true } ) );

			expect( pinSpy ).toHaveBeenCalledOnce();

			unpinSpy.mockClear();

			button.dispatchEvent( new Event( 'blur', { composed: true } ) );
			vi.advanceTimersByTime( 650 );

			expect( unpinSpy ).toHaveBeenCalledOnce();
		} );

		it( 'keeps the tooltip on scroll of the shadow root that contains both the pinned element and the balloon', () => {
			const button = createTooltippedElement( shadowRoot );

			button.dispatchEvent( new MouseEvent( 'mouseenter' ) );
			vi.advanceTimersByTime( 650 );

			expect( pinSpy ).toHaveBeenCalledOnce();
			// The balloon mounts into the shadow root hosting the element, so that root is a common ancestor of
			// both — scrolling it keeps the tooltip, just like scrolling `<body>` in the light DOM.
			expect( shadowEditor.ui.view.body.has( tooltipManager.balloonPanelView ) ).toBe( true );

			unpinSpy.mockClear();

			shadowRoot.dispatchEvent( new Event( 'scroll' ) );

			expect( unpinSpy ).not.toHaveBeenCalled();
		} );

		it( 'unpins the tooltip on scroll of a shadow-root element containing neither the pinned element nor the balloon', () => {
			const button = createTooltippedElement( shadowRoot );

			button.dispatchEvent( new MouseEvent( 'mouseenter' ) );
			vi.advanceTimersByTime( 650 );

			expect( pinSpy ).toHaveBeenCalledOnce();

			unpinSpy.mockClear();

			// `shadowElement` holds the editor UI but neither the balloon (in the body wrapper) nor the button,
			// both siblings of it in the shadow root, so scrolling it must hide the tooltip. `scroll` is neither
			// `composed` nor bubbling, so this is only observable because `TooltipManager` attaches a listener
			// directly to the shadow root — a `document`-level one, however configured, could never see it.
			shadowElement.dispatchEvent( new Event( 'scroll' ) );

			expect( unpinSpy ).toHaveBeenCalledOnce();
		} );

		it( 'does not throw when #_onEnterOrFocus is called with no target', () => {
			expect( () => {
				tooltipManager._onEnterOrFocus( { name: 'focus' }, { target: null } );
			} ).not.toThrow();
		} );

		it( 'does not throw when #_onLeaveOrBlur is called with no target', () => {
			expect( () => {
				tooltipManager._onLeaveOrBlur( { name: 'blur' }, { target: null } );
			} ).not.toThrow();
		} );

		it( 'detaches shadow-root listeners when the registry fires "remove" while the editor stays alive', async () => {
			const fooElement = document.createElement( 'div' );

			document.body.appendChild( fooElement );

			const barHost = document.createElement( 'div' );

			document.body.appendChild( barHost );

			const barShadowRoot = barHost.attachShadow( { mode: 'open' } );
			const barElement = document.createElement( 'div' );

			barShadowRoot.appendChild( barElement );

			const multiRootEditor = await MultiRootEditor.create( {
				plugins: [ Paragraph ],
				roots: {
					foo: { element: fooElement },
					bar: { element: barElement }
				}
			} );

			multiRootEditor.on( 'detachRoot', ( evt, root ) => {
				multiRootEditor.detachEditable( root ).remove();
			} );

			try {
				const button = createTooltippedElement( barShadowRoot );

				button.dispatchEvent( new MouseEvent( 'mouseenter' ) );
				vi.advanceTimersByTime( 650 );

				expect( pinSpy ).toHaveBeenCalledOnce();

				multiRootEditor.detachRoot( 'bar' );

				pinSpy.mockClear();

				button.dispatchEvent( new MouseEvent( 'mouseenter' ) );
				vi.advanceTimersByTime( 650 );

				expect( pinSpy ).not.toHaveBeenCalled();
			} finally {
				await multiRootEditor.destroy();
				fooElement.remove();
				barHost.remove();
			}
		} );

		it( 'stops reacting to a shadow root once its editor is destroyed', async () => {
			const button = createTooltippedElement( shadowRoot );

			await shadowEditor.destroy();
			shadowEditor = null;

			expect( () => {
				button.dispatchEvent( new MouseEvent( 'mouseenter' ) );
				vi.advanceTimersByTime( 650 );
			} ).not.toThrow();

			expect( pinSpy ).not.toHaveBeenCalled();
		} );

		it( 'keeps the tooltip pinned when the pointer moves from a shadow-hosted element onto the balloon', () => {
			const button = createTooltippedElement( shadowRoot );

			button.dispatchEvent( new MouseEvent( 'mouseenter' ) );
			vi.advanceTimersByTime( 650 );

			expect( pinSpy ).toHaveBeenCalledOnce();

			unpinSpy.mockClear();

			const balloonElement = tooltipManager.balloonPanelView.element;

			// `relatedTarget` is deliberately *not* the balloon: this is the retargeted case, where the leave
			// handler has no way of telling where the pointer actually went.
			button.dispatchEvent( new MouseEvent( 'mouseleave', { relatedTarget: document.body } ) );
			balloonElement.dispatchEvent( new MouseEvent( 'mouseenter' ) );

			vi.advanceTimersByTime( 650 );

			expect( unpinSpy ).not.toHaveBeenCalled();
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
