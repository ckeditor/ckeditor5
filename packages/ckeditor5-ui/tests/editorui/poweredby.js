/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Editor } from '@ckeditor/ckeditor5-core';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Rect } from '@ckeditor/ckeditor5-utils';
import { _setModelData } from '@ckeditor/ckeditor5-engine';
import { generateLicenseKey } from '@ckeditor/ckeditor5-core/tests/_utils/generatelicensekey.js';

import { EditorUI } from '../../src/editorui/editorui.js';
import { BalloonPanelView } from '../../src/index.js';
import { View } from '../../src/view.js';

describe( 'PoweredBy', () => {
	let editor, element;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		editor = await createEditor( element );

		vi.spyOn( editor.editing.view.getDomRoot(), 'getBoundingClientRect' ).mockReturnValue( {
			top: 0,
			left: 0,
			right: 400,
			width: 400,
			bottom: 100,
			height: 100
		} );

		vi.spyOn( document.body, 'getBoundingClientRect' ).mockReturnValue( {
			top: 0,
			right: 1000,
			bottom: 1000,
			left: 0,
			width: 1000,
			height: 1000
		} );

		vi.stubGlobal( 'innerWidth', 1000 );
		vi.stubGlobal( 'innerHeight', 1000 );
	} );

	afterEach( async () => {
		element.remove();
		await editor.destroy();
	} );

	describe( 'constructor()', () => {
		describe( 'balloon creation', () => {
			it( 'should not throw if there is no view in EditorUI', async () => {
				let destroyPromise;
				expect( () => {
					const editor = new Editor();

					editor.model.document.createRoot();
					editor.ui = new EditorUI( editor );
					editor.editing.view.attachDomRoot( element );
					editor.fire( 'ready' );
					element.style.display = 'block';
					element.setAttribute( 'contenteditable', 'true' );
					editor.ui.focusTracker.add( element );
					element.focus();

					editor.fire( 'ready' );
					editor.ui.destroy();
					destroyPromise = editor.destroy();
				} ).not.toThrow();
				await destroyPromise;
			} );

			it( 'should create the balloon on demand', () => {
				expect( editor.ui.poweredBy._balloonView ).toBeNull();

				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView ).toBeInstanceOf( BalloonPanelView );
			} );

			it( 'should create the balloon when license is `GPL`', async () => {
				const editor = await createEditor( element, {
					licenseKey: 'GPL'
				} );

				expect( editor.ui.poweredBy._balloonView ).toBeNull();

				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView ).toBeInstanceOf( BalloonPanelView );

				await editor.destroy();
			} );

			it( 'should create the balloon when license is invalid', async () => {
				const showErrorStub = vi.spyOn( ClassicTestEditor.prototype, '_showLicenseError' ).mockImplementation( () => {} );

				const editor = await createEditor( element, {
					licenseKey: '<YOUR_LICENSE_KEY>'
				} );

				expect( editor.ui.poweredBy._balloonView ).toBeNull();

				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView ).toBeInstanceOf( BalloonPanelView );

				await editor.destroy();

				showErrorStub.mockRestore();
			} );

			it( 'should not create the balloon when a white-label license key is configured', async () => {
				const { licenseKey } = generateLicenseKey( { whiteLabel: true } );
				const editor = await createEditor( element, {
					licenseKey
				} );

				expect( editor.ui.poweredBy._balloonView ).toBeNull();

				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView ).toBeNull();

				await editor.destroy();
			} );

			it( 'should create the balloon when a white-label license key is configured and `forceVisible` is set to true', async () => {
				const { licenseKey } = generateLicenseKey( { whiteLabel: true } );
				const editor = await createEditor( element, {
					licenseKey,
					ui: {
						poweredBy: {
							forceVisible: true
						}
					}
				} );

				expect( editor.ui.poweredBy._balloonView ).toBeNull();

				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView ).toBeInstanceOf( BalloonPanelView );

				await editor.destroy();
			} );

			it( 'should create the balloon when a non-white-label license key is configured', async () => {
				const { licenseKey } = generateLicenseKey();
				const editor = await createEditor( element, {
					licenseKey
				} );

				expect( editor.ui.poweredBy._balloonView ).toBeNull();

				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView ).toBeInstanceOf( BalloonPanelView );

				await editor.destroy();
			} );
		} );

		describe( 'balloon management on editor focus change', () => {
			const originalGetVisible = Rect.prototype.getVisible;

			it( 'should show the balloon when the editor gets focused', () => {
				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView.isVisible ).toBe( true );
			} );

			it( 'should show the balloon if the focus is not in the editing root but in other editor UI', async () => {
				const focusableEditorUIElement = document.createElement( 'input' );
				focusableEditorUIElement.type = 'text';
				document.body.appendChild( focusableEditorUIElement );

				editor.ui.focusTracker.add( focusableEditorUIElement );

				// Just generate the balloon on demand.
				focusEditor( editor );
				blurEditor( editor );

				await wait( 10 );
				const pinSpy = vi.spyOn( editor.ui.poweredBy._balloonView, 'pin' );

				focusEditor( editor, focusableEditorUIElement );

				expect( pinSpy ).toHaveBeenCalledOnce();
				expect( pinSpy ).toHaveBeenCalledWith( expect.objectContaining( { target: editor.editing.view.getDomRoot() } ) );

				focusableEditorUIElement.remove();
			} );

			it( 'should hide the balloon on blur', async () => {
				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView.isVisible ).toBe( true );

				blurEditor( editor );

				// FocusTracker's blur handler is asynchronous.
				await wait( 200 );

				expect( editor.ui.poweredBy._balloonView.isVisible ).toBe( false );
			} );

			// This is a weak test because it does not check the geometry but it will do.
			it( 'should show the balloon when the source editing is engaged', async () => {
				const domRoot = editor.editing.view.getDomRoot();
				const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

				function isEditableElement( element ) {
					return Array.from( editor.ui.getEditableElementsNames() ).map( name => {
						return editor.ui.getEditableElement( name );
					} ).includes( element );
				}

				// Rect#getVisible() passthrough to ignore ancestors. Makes testing a lot easier.
				vi.spyOn( Rect.prototype, 'getVisible' ).mockImplementation( function() {
					if ( isEditableElement( this._source ) ) {
						return new Rect( this._source );
					} else {
						return originalGetVisible.call( this );
					}
				} );

				// Stub textarea's client rect.
				vi.spyOn( HTMLElement.prototype, 'getBoundingClientRect' ).mockImplementation( function() {
					if ( this.parentNode.classList.contains( 'ck-source-editing-area' ) ) {
						return {
							top: 0,
							left: 0,
							right: 400,
							width: 400,
							bottom: 200,
							height: 200
						};
					}

					return originalGetBoundingClientRect.call( this );
				} );

				focusEditor( editor );

				domRoot.getBoundingClientRect.mockReturnValue( {
					top: 0,
					left: 0,
					right: 350,
					width: 350,
					bottom: 100,
					height: 100
				} );

				const pinSpy = vi.spyOn( editor.ui.poweredBy._balloonView, 'pin' );

				editor.ui.fire( 'update' );

				await wait( 75 );

				expect( editor.ui.poweredBy._balloonView.isVisible ).toBe( true );
				expect( editor.ui.poweredBy._balloonView.position ).toBe( 'position_border-side_right' );
				expect( pinSpy ).toHaveBeenLastCalledWith( expect.objectContaining( { target: domRoot } ) );

				editor.plugins.get( 'SourceEditing' ).isSourceEditingMode = true;

				const sourceAreaElement = editor.ui.getEditableElement( 'sourceEditing:main' );

				focusEditor( editor, sourceAreaElement );
				expect( pinSpy ).toHaveBeenLastCalledWith(
					expect.objectContaining( { target: sourceAreaElement } )
				);

				expect( editor.ui.poweredBy._balloonView.isVisible ).toBe( true );
				expect( editor.ui.poweredBy._balloonView.position ).toBe( 'position_border-side_right' );

				editor.plugins.get( 'SourceEditing' ).isSourceEditingMode = false;
				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView.isVisible ).toBe( true );
				expect( editor.ui.poweredBy._balloonView.position ).toBe( 'position_border-side_right' );
				expect( pinSpy ).toHaveBeenLastCalledWith( expect.objectContaining( { target: domRoot } ) );
			}, 1000 * 10 );
		} );

		describe( 'balloon management on EditorUI#update', () => {
			it( 'should not trigger if the editor is not focused', () => {
				expect( editor.ui.poweredBy._balloonView ).toBeNull();

				editor.ui.fire( 'update' );

				expect( editor.ui.poweredBy._balloonView ).toBeNull();
			} );

			it( 'should (re-)show the balloon but throttled', async () => {
				focusEditor( editor );

				const pinSpy = vi.spyOn( editor.ui.poweredBy._balloonView, 'pin' );

				editor.ui.fire( 'update' );
				editor.ui.fire( 'update' );

				expect( pinSpy ).not.toHaveBeenCalled();

				await wait( 75 );

				expect( pinSpy ).toHaveBeenCalledOnce();
				expect( pinSpy ).toHaveBeenCalledWith( expect.objectContaining( { target: editor.editing.view.getDomRoot() } ) );
			} );

			it( 'should (re-)show the balloon if the focus is not in the editing root but in other editor UI', async () => {
				const focusableEditorUIElement = document.createElement( 'input' );
				focusableEditorUIElement.type = 'text';
				editor.ui.focusTracker.add( focusableEditorUIElement );
				document.body.appendChild( focusableEditorUIElement );

				focusEditor( editor, focusableEditorUIElement );

				const pinSpy = vi.spyOn( editor.ui.poweredBy._balloonView, 'pin' );

				expect( pinSpy ).not.toHaveBeenCalled();

				editor.ui.fire( 'update' );
				editor.ui.fire( 'update' );

				expect( pinSpy ).toHaveBeenCalledOnce();

				await wait( 75 );

				expect( pinSpy ).toHaveBeenCalledTimes( 2 );
				expect( pinSpy ).toHaveBeenCalledWith( expect.objectContaining( { target: editor.editing.view.getDomRoot() } ) );
				focusableEditorUIElement.remove();
			} );
		} );

		describe( 'balloon view', () => {
			let balloon, focusTrackerAddSpy;

			beforeEach( () => {
				focusTrackerAddSpy = vi.spyOn( editor.ui.focusTracker, 'add' );

				focusEditor( editor );

				balloon = editor.ui.poweredBy._balloonView;
			} );

			it( 'should be an instance of BalloonPanelView', () => {
				expect( balloon ).toBeInstanceOf( BalloonPanelView );
			} );

			it( 'should host a powered by view', () => {
				expect( balloon.content.first ).toBeInstanceOf( View );
			} );

			it( 'should have no arrow', () => {
				expect( balloon.withArrow ).toBe( false );
			} );

			it( 'should have a specific CSS class', () => {
				expect( balloon.class ).toBe( 'ck-powered-by-balloon' );
			} );

			it( 'should be added to editor\'s body view collection', () => {
				expect( editor.ui.view.body.has( balloon ) ).toBe( true );
			} );

			it( 'should be registered in the focus tracker to avoid focus loss on click', () => {
				expect( focusTrackerAddSpy ).toHaveBeenCalledWith( balloon.element );
			} );
		} );

		describe( 'powered by view', () => {
			let view;

			beforeEach( () => {
				focusEditor( editor );

				view = editor.ui.poweredBy._balloonView.content.first;
			} );

			it( 'should have specific CSS classes', () => {
				expect( view.element.classList.contains( 'ck' ) ).toBe( true );
				expect( view.element.classList.contains( 'ck-powered-by' ) ).toBe( true );
			} );

			it( 'should have a link that opens in a new tab', () => {
				const link = 'https://ckeditor.com/powered-by-ckeditor/?utm_source=ckeditor&utm_medium=referral' +
					'&utm_campaign=701Dn000000hVgmIAE_powered_by_ckeditor_logo';
				expect( view.element.firstChild.tagName ).toBe( 'A' );
				expect( view.element.firstChild.href ).toBe( link );
				expect( view.element.firstChild.target ).toBe( '_blank' );
			} );

			it( 'should have a label inside the link', () => {
				expect( view.element.firstChild.firstChild.tagName ).toBe( 'SPAN' );
				expect( view.element.firstChild.firstChild.classList.contains( 'ck' ) ).toBe( true );
				expect( view.element.firstChild.firstChild.classList.contains( 'ck-powered-by__label' ) ).toBe( true );
				expect( view.element.firstChild.firstChild.textContent ).toBe( 'Powered by' );
			} );

			it( 'should have an icon next to the label', () => {
				expect( view.element.firstChild.lastChild.tagName ).toBe( 'svg' );
			} );

			it( 'should be impossible to drag and drop into editor\'s content', () => {
				const spy = vi.fn();
				const evt = new Event( 'dragstart' );

				evt.preventDefault = spy;

				view.element.firstChild.dispatchEvent( evt );

				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should be excluded from the accessibility tree', () => {
				expect( view.element.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
			} );

			it( 'should not be accessible via tab key navigation', () => {
				expect( view.element.firstChild.tabIndex ).toBe( -1 );
			} );

			it( 'should have a configurable label (custom text)', async () => {
				const editor = await createEditor( element, {
					ui: {
						poweredBy: {
							label: 'foo'
						}
					}
				} );

				focusEditor( editor );

				const view = editor.ui.poweredBy._balloonView.content.first;

				expect( view.element.firstChild.firstChild.textContent ).toBe( 'foo' );

				await editor.destroy();
			} );

			it( 'should have an option to hide the label', async () => {
				const editor = await createEditor( element, {
					ui: {
						poweredBy: {
							label: null
						}
					}
				} );

				focusEditor( editor );

				const view = editor.ui.poweredBy._balloonView.content.first;

				expect( view.element.firstChild.childElementCount ).toBe( 1 );
				expect( view.element.firstChild.firstChild.tagName ).toBe( 'svg' );

				await editor.destroy();
			} );
		} );
	} );

	describe( 'destroy()', () => {
		describe( 'if there was a balloon', () => {
			beforeEach( () => {
				focusEditor( editor );
			} );

			it( 'should unpin the balloon', async () => {
				const unpinSpy = vi.spyOn( editor.ui.poweredBy._balloonView, 'unpin' );

				await editor.destroy();

				expect( unpinSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should destroy the balloon', async () => {
				const destroySpy = vi.spyOn( editor.ui.poweredBy._balloonView, 'destroy' );

				await editor.destroy();

				expect( destroySpy ).toHaveBeenCalled();

				expect( editor.ui.poweredBy._balloonView ).toBeNull();
			} );

			it( 'should cancel any throttled show to avoid post-destroy timed errors', async () => {
				const spy = vi.spyOn( editor.ui.poweredBy._showBalloonThrottled, 'cancel' );

				await editor.destroy();

				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );

		describe( 'if there was no balloon', () => {
			it( 'should not throw', async () => {
				let destroyPromise;
				expect( () => {
					destroyPromise = editor.destroy();
				} ).not.toThrow();
				await destroyPromise;
			} );
		} );

		it( 'should destroy the emitter listeners', async () => {
			const spy = vi.spyOn( editor.ui.poweredBy, 'stopListening' );

			await editor.destroy();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'balloon positioning depending on environment and configuration', () => {
		const originalGetVisible = Rect.prototype.getVisible;
		let rootRect, balloonRect;

		beforeEach( () => {
			rootRect = new Rect( { top: 0, left: 0, width: 400, right: 400, bottom: 100, height: 100 } );
			balloonRect = new Rect( { top: 0, left: 0, width: 20, right: 20, bottom: 10, height: 10 } );
		} );

		it( 'should not show the balloon if the root is not visible vertically', async () => {
			const domRoot = editor.editing.view.getDomRoot();
			const parentWithOverflow = document.createElement( 'div' );

			parentWithOverflow.style.overflow = 'scroll';
			// Is not enough height to be visible vertically.
			parentWithOverflow.style.height = '99px';

			document.body.appendChild( parentWithOverflow );
			parentWithOverflow.appendChild( domRoot );

			focusEditor( editor );

			expect( editor.ui.poweredBy._balloonView.isVisible ).toBe( true );
			expect( editor.ui.poweredBy._balloonView.position ).toBe( 'arrowless' );

			parentWithOverflow.remove();
		} );

		it( 'should not show the balloon if the root is not visible horizontally', async () => {
			const domRoot = editor.editing.view.getDomRoot();
			const parentWithOverflow = document.createElement( 'div' );

			parentWithOverflow.style.overflow = 'scroll';
			// Is not enough width to be visible horizontally.
			parentWithOverflow.style.width = '399px';

			document.body.appendChild( parentWithOverflow );
			parentWithOverflow.appendChild( domRoot );

			focusEditor( editor );

			expect( editor.ui.poweredBy._balloonView.isVisible ).toBe( true );
			expect( editor.ui.poweredBy._balloonView.position ).toBe( 'arrowless' );

			parentWithOverflow.remove();
		} );

		it( 'should position the to the left side if the UI language is RTL and no side was configured', async () => {
			const editor = await createEditor( element, {
				language: 'ar'
			} );

			vi.spyOn( editor.ui.getEditableElement( 'main' ), 'getBoundingClientRect' ).mockReturnValue( {
				top: 0,
				left: 0,
				right: 400,
				width: 400,
				bottom: 100,
				height: 100
			} );

			focusEditor( editor );

			const pinSpy = vi.spyOn( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			expect( pinSpy ).toHaveBeenCalledOnce();

			const pinArgs = pinSpy.mock.calls[ 0 ][ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).toBe( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).toEqual( {
				top: 95,
				left: 5,
				name: 'position_border-side_left',
				config: {
					withArrow: false
				}
			} );

			await editor.destroy();
		} );

		it( 'should position the balloon in the lower right corner by default', async () => {
			focusEditor( editor );

			const pinSpy = vi.spyOn( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			expect( pinSpy ).toHaveBeenCalledOnce();

			const pinArgs = pinSpy.mock.calls[ 0 ][ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).toBe( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).toEqual( {
				top: 95,
				left: 375,
				name: 'position_border-side_right',
				config: {
					withArrow: false
				}
			} );
		} );

		it( 'should position the balloon in the lower left corner if configured', async () => {
			const editor = await createEditor( element, {
				ui: {
					poweredBy: {
						side: 'left'
					}
				}
			} );

			vi.spyOn( editor.ui.getEditableElement( 'main' ), 'getBoundingClientRect' ).mockReturnValue( {
				top: 0,
				left: 0,
				right: 400,
				width: 400,
				bottom: 100,
				height: 100
			} );

			focusEditor( editor );

			const pinSpy = vi.spyOn( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			expect( pinSpy ).toHaveBeenCalledOnce();

			const pinArgs = pinSpy.mock.calls[ 0 ][ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).toBe( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).toEqual( {
				top: 95,
				left: 5,
				name: 'position_border-side_left',
				config: {
					withArrow: false
				}
			} );

			await editor.destroy();
		} );

		it( 'should position the balloon over the bottom root border if configured', async () => {
			const editor = await createEditor( element, {
				ui: {
					poweredBy: {
						position: 'border'
					}
				}
			} );

			vi.spyOn( editor.ui.getEditableElement( 'main' ), 'getBoundingClientRect' ).mockReturnValue( {
				top: 0,
				left: 0,
				right: 400,
				width: 400,
				bottom: 100,
				height: 100
			} );

			focusEditor( editor );

			const pinSpy = vi.spyOn( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			expect( pinSpy ).toHaveBeenCalledOnce();

			const pinArgs = pinSpy.mock.calls[ 0 ][ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).toBe( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).toEqual( {
				top: 95,
				left: 375,
				name: 'position_border-side_right',
				config: {
					withArrow: false
				}
			} );

			await editor.destroy();
		} );

		it( 'should position the balloon in the corner of the root if configured', async () => {
			const editor = await createEditor( element, {
				ui: {
					poweredBy: {
						position: 'inside'
					}
				}
			} );

			vi.spyOn( editor.ui.getEditableElement( 'main' ), 'getBoundingClientRect' ).mockReturnValue( {
				top: 0,
				left: 0,
				right: 400,
				width: 400,
				bottom: 100,
				height: 100
			} );

			focusEditor( editor );

			const pinSpy = vi.spyOn( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			expect( pinSpy ).toHaveBeenCalledOnce();

			const pinArgs = pinSpy.mock.calls[ 0 ][ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).toBe( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).toEqual( {
				top: 85,
				left: 375,
				name: 'position_inside-side_right',
				config: {
					withArrow: false
				}
			} );

			await editor.destroy();
		} );

		it( 'should hide the balloon if the root is invisible (cropped by ancestors)', async () => {
			const editor = await createEditor( element );

			const domRoot = editor.editing.view.getDomRoot();

			rootRect = new Rect( { top: 0, left: 0, width: 100, right: 100, bottom: 10, height: 10 } );

			vi.spyOn( rootRect, 'getVisible' ).mockReturnValue( null );

			focusEditor( editor );

			const pinSpy = vi.spyOn( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			expect( pinSpy ).toHaveBeenCalledOnce();

			const pinArgs = pinSpy.mock.calls[ 0 ][ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).toBe( domRoot );
			expect( positioningFunction( rootRect, balloonRect ) ).toBeNull();

			await editor.destroy();
		} );

		it( 'should hide the balloon if displayed over the bottom root border but partially cropped by an ancestor', async () => {
			const editor = await createEditor( element, {
				ui: {
					poweredBy: {
						position: 'border'
					}
				}
			} );

			const domRoot = editor.editing.view.getDomRoot();

			rootRect = new Rect( { top: 0, left: 0, width: 100, right: 100, bottom: 10, height: 10 } );

			focusEditor( editor );

			const pinSpy = vi.spyOn( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			expect( pinSpy ).toHaveBeenCalledOnce();

			const pinArgs = pinSpy.mock.calls[ 0 ][ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).toBe( domRoot );
			expect( positioningFunction( rootRect, balloonRect ) ).toBeNull();

			await editor.destroy();
		} );

		it( 'should hide the balloon if displayed in the corner of the root but partially cropped by an ancestor', async () => {
			const editor = await createEditor( element, {
				ui: {
					poweredBy: {
						position: 'inside'
					}
				}
			} );

			rootRect = new Rect( { top: 0, left: 0, width: 400, right: 400, bottom: 200, height: 200 } );

			vi.spyOn( rootRect, 'getVisible' ).mockReturnValue( { top: 0, left: 0, width: 400, right: 400, bottom: 10, height: 10 } );

			balloonRect = new Rect( { top: 200, left: 0, width: 20, right: 20, bottom: 210, height: 10 } );

			const domRoot = editor.editing.view.getDomRoot();

			focusEditor( editor );

			const pinSpy = vi.spyOn( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			expect( pinSpy ).toHaveBeenCalledOnce();

			const pinArgs = pinSpy.mock.calls[ 0 ][ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).toBe( domRoot );
			expect( positioningFunction( rootRect, balloonRect ) ).toBeNull();

			await editor.destroy();
		} );

		it( 'should allow configuring balloon position offsets', async () => {
			const editor = await createEditor( element, {
				ui: {
					poweredBy: {
						verticalOffset: 10,
						horizontalOffset: 10
					}
				}
			} );

			vi.spyOn( editor.ui.getEditableElement( 'main' ), 'getBoundingClientRect' ).mockReturnValue( {
				top: 0,
				left: 0,
				right: 400,
				width: 400,
				bottom: 100,
				height: 100
			} );

			focusEditor( editor );

			const pinSpy = vi.spyOn( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			expect( pinSpy ).toHaveBeenCalledOnce();

			const pinArgs = pinSpy.mock.calls[ 0 ][ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).toBe( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).toEqual( {
				top: 85,
				left: 370,
				name: 'position_border-side_right',
				config: {
					withArrow: false
				}
			} );

			await editor.destroy();
		} );

		it( 'should not display the balloon if the root is narrower than 350px', async () => {
			const domRoot = editor.editing.view.getDomRoot();

			vi.spyOn( Rect.prototype, 'getVisible' ).mockImplementation( function() {
				if ( this._source === domRoot ) {
					return new Rect( domRoot );
				} else {
					return originalGetVisible.call( this );
				}
			} );

			domRoot.getBoundingClientRect.mockReturnValue( {
				top: 0,
				left: 0,
				right: 349,
				width: 349,
				bottom: 100,
				height: 100
			} );

			focusEditor( editor );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			const pinSpy = vi.spyOn( editor.ui.poweredBy._balloonView, 'pin' );

			expect( editor.ui.poweredBy._balloonView.isVisible ).toBe( true );
			expect( editor.ui.poweredBy._balloonView.position ).toBe( 'arrowless' );

			domRoot.getBoundingClientRect.mockReturnValue( {
				top: 0,
				left: 0,
				right: 350,
				width: 350,
				bottom: 100,
				height: 100
			} );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			expect( editor.ui.poweredBy._balloonView.isVisible ).toBe( true );
			expect( editor.ui.poweredBy._balloonView.position ).toBe( 'position_border-side_right' );

			const pinArgs = pinSpy.mock.calls[ 0 ][ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).toBe( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).toEqual( {
				top: 95,
				left: 325,
				name: 'position_border-side_right',
				config: {
					withArrow: false
				}
			} );
		} );

		it( 'should not display the balloon if the root is shorter than 50px', async () => {
			const domRoot = editor.editing.view.getDomRoot();

			vi.spyOn( Rect.prototype, 'getVisible' ).mockImplementation( function() {
				if ( this._source === domRoot ) {
					return new Rect( domRoot );
				} else {
					return originalGetVisible.call( this );
				}
			} );

			domRoot.getBoundingClientRect.mockReturnValue( {
				top: 0,
				left: 0,
				right: 1000,
				width: 1000,
				bottom: 49,
				height: 49
			} );

			focusEditor( editor );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			const pinSpy = vi.spyOn( editor.ui.poweredBy._balloonView, 'pin' );

			expect( editor.ui.poweredBy._balloonView.isVisible ).toBe( true );
			expect( editor.ui.poweredBy._balloonView.position ).toBe( 'arrowless' );

			domRoot.getBoundingClientRect.mockReturnValue( {
				top: 0,
				left: 0,
				right: 1000,
				width: 1000,
				bottom: 50,
				height: 50
			} );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			expect( editor.ui.poweredBy._balloonView.isVisible ).toBe( true );
			expect( editor.ui.poweredBy._balloonView.position ).toBe( 'position_border-side_right' );

			const pinArgs = pinSpy.mock.calls[ 0 ][ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).toBe( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).toEqual( {
				top: 45,
				left: 975,
				name: 'position_border-side_right',
				config: {
					withArrow: false
				}
			} );
		} );
	} );

	it( 'should have the z-index lower than a regular BalloonPanelView instance', () => {
		focusEditor( editor );

		const balloonView = new BalloonPanelView();
		balloonView.render();

		const zIndexOfPoweredByBalloon = Number( getComputedStyle( editor.ui.poweredBy._balloonView.element ).zIndex );

		document.body.appendChild( balloonView.element );

		const zIndexOfRegularBalloon = Number( getComputedStyle( balloonView.element ).zIndex );

		expect( zIndexOfPoweredByBalloon ).toBeLessThan( zIndexOfRegularBalloon );

		balloonView.element.remove();
		balloonView.destroy();
	} );

	it( 'should not overlap a dropdown panel in a toolbar', async () => {
		const editor = await createClassicEditor( element, {
			toolbar: [ 'heading' ],
			plugins: [ Heading ],
			ui: {
				poweredBy: {
					side: 'left',
					position: 'inside'
				}
			}
		} );

		_setModelData( editor.model, '<heading2>foo[]bar</heading2>' );

		focusEditor( editor );

		const headingToolbarButton = editor.ui.view.toolbar.items
			.find( item => item.buttonView && item.buttonView.label.startsWith( 'Heading' ) );

		const poweredByElement = editor.ui.poweredBy._balloonView.element;

		const poweredByElementGeometry = new Rect( poweredByElement );

		const middleOfThePoweredByCoords = {
			x: ( poweredByElementGeometry.width / 2 ) + poweredByElementGeometry.left,
			y: ( poweredByElementGeometry.height / 2 ) + poweredByElementGeometry.top
		};

		let elementFromPoint = document.elementFromPoint(
			middleOfThePoweredByCoords.x - 5, // "-5" to hit in the label not SVG,
			middleOfThePoweredByCoords.y
		);

		expect( elementFromPoint.classList.contains( 'ck-powered-by__label' ) ).toBe( true );

		// show heading dropdown
		headingToolbarButton.buttonView.fire( 'execute' );

		elementFromPoint = document.elementFromPoint(
			middleOfThePoweredByCoords.x,
			middleOfThePoweredByCoords.y
		);

		expect( elementFromPoint.classList.contains( 'ck-button__label' ) ).toBe( true );

		await editor.destroy();
	} );

	async function createEditor( element, config = { plugins: [ SourceEditing ] } ) {
		return ClassicTestEditor.create( element, config );
	}

	async function createClassicEditor( element, config = {} ) {
		return ClassicEditor.create( element, config );
	}

	function wait( time ) {
		return new Promise( res => {
			window.setTimeout( res, time );
		} );
	}

	function focusEditor( editor, focusableUIElement ) {
		if ( !focusableUIElement ) {
			focusableUIElement = editor.editing.view.getDomRoot();
			editor.editing.view.focus();
		} else {
			focusableUIElement.focus();
		}

		editor.ui.focusTracker.focusedElement = focusableUIElement;
		editor.ui.focusTracker.isFocused = true;
	}

	function blurEditor( editor ) {
		editor.ui.focusTracker.focusedElement = null;
		editor.ui.focusTracker.isFocused = null;
	}
} );
