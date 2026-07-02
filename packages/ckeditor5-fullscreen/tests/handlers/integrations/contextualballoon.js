/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { BalloonPanelView, ContextualBalloon } from '@ckeditor/ckeditor5-ui';
import { Rect, global } from '@ckeditor/ckeditor5-utils';

import { registerFullscreenBalloonOffsetCorrection } from '../../../src/handlers/integrations/contextualballoon.js';

describe( 'ContextualBalloon - integration', () => {
	let editor, domElement, wrapper, toolbarSlot, menuBarSlot, capturedListener;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicEditor.create( {
			attachTo: domElement,
			plugins: [ Paragraph, Essentials, ContextualBalloon ]
		} );

		// Minimal wrapper that mirrors the fullscreen slot structure.
		wrapper = global.document.createElement( 'div' );
		toolbarSlot = global.document.createElement( 'div' );
		menuBarSlot = global.document.createElement( 'div' );

		toolbarSlot.setAttribute( 'data-ck-fullscreen', 'toolbar' );
		menuBarSlot.setAttribute( 'data-ck-fullscreen', 'menu-bar' );

		wrapper.appendChild( toolbarSlot );
		wrapper.appendChild( menuBarSlot );
		global.document.body.appendChild( wrapper );

		// Intercept .on() to capture the correction listener for direct invocation —
		// firing the full event would hang because ContextualBalloon's own listeners
		// attempt real DOM positioning work in response to getPositionOptions.
		const contextualBalloon = editor.plugins.get( 'ContextualBalloon' );
		const originalOn = contextualBalloon.on.bind( contextualBalloon );

		vi.spyOn( contextualBalloon, 'on' ).mockImplementation( ( eventName, listener, opts ) => {
			if ( eventName === 'getPositionOptions' ) {
				capturedListener = listener;
			}

			return originalOn( eventName, listener, opts );
		} );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		domElement.remove();
		wrapper.remove();

		return editor.destroy();
	} );

	it( 'should return a no-op cleanup function if ContextualBalloon is not present', async () => {
		const tempDomElement = global.document.createElement( 'div' );
		global.document.body.appendChild( tempDomElement );

		const tempEditor = await ClassicEditor.create( {
			attachTo: tempDomElement,
			plugins: [ Paragraph, Essentials ]
		} );

		const cleanup = registerFullscreenBalloonOffsetCorrection( tempEditor, wrapper );

		expect( cleanup ).toBeInstanceOf( Function );
		expect( () => cleanup() ).not.toThrow();

		tempDomElement.remove();
		return tempEditor.destroy();
	} );

	it( 'should register a getPositionOptions listener on ContextualBalloon', () => {
		const contextualBalloon = editor.plugins.get( 'ContextualBalloon' );

		registerFullscreenBalloonOffsetCorrection( editor, wrapper );

		expect( contextualBalloon.on ).toHaveBeenCalledWith(
			'getPositionOptions',
			expect.any( Function ),
			{ priority: 'low' }
		);
	} );

	it( 'should return a cleanup function that removes the listener', () => {
		const contextualBalloon = editor.plugins.get( 'ContextualBalloon' );
		const cleanup = registerFullscreenBalloonOffsetCorrection( editor, wrapper );
		const offSpy = vi.spyOn( contextualBalloon, 'off' );

		cleanup();

		expect( offSpy ).toHaveBeenCalledWith( 'getPositionOptions', expect.any( Function ) );
	} );

	it( 'should increase viewportOffsetConfig.top by the toolbar height', () => {
		vi.spyOn( toolbarSlot, 'getBoundingClientRect' ).mockReturnValue(
			{ height: 50, width: 800, top: 0, bottom: 50, left: 0, right: 800, x: 0, y: 0, toJSON: () => {} }
		);

		registerFullscreenBalloonOffsetCorrection( editor, wrapper );

		const mockEvt = {
			return: {
				positions: [ BalloonPanelView.defaultPositions.viewportStickyNorth ],
				viewportOffsetConfig: { top: 10 }
			}
		};

		capturedListener( mockEvt );

		expect( mockEvt.return.viewportOffsetConfig.top ).toBe( 60 ); // 10 + 50
	} );

	it( 'should also account for the menu bar height when computing the offset', () => {
		vi.spyOn( toolbarSlot, 'getBoundingClientRect' ).mockReturnValue(
			{ height: 40, width: 800, top: 0, bottom: 40, left: 0, right: 800, x: 0, y: 0, toJSON: () => {} }
		);
		vi.spyOn( menuBarSlot, 'getBoundingClientRect' ).mockReturnValue(
			{ height: 30, width: 800, top: 0, bottom: 30, left: 0, right: 800, x: 0, y: 0, toJSON: () => {} }
		);

		registerFullscreenBalloonOffsetCorrection( editor, wrapper );

		const mockEvt = {
			return: {
				positions: [ BalloonPanelView.defaultPositions.viewportStickyNorth ],
				viewportOffsetConfig: { top: 0 }
			}
		};

		capturedListener( mockEvt );

		expect( mockEvt.return.viewportOffsetConfig.top ).toBe( 70 ); // 40 + 30
	} );

	it( 'should not modify position options when the top bar has no height', () => {
		vi.spyOn( toolbarSlot, 'getBoundingClientRect' ).mockReturnValue(
			{ height: 0, width: 0, top: 0, bottom: 0, left: 0, right: 0, x: 0, y: 0, toJSON: () => {} }
		);

		registerFullscreenBalloonOffsetCorrection( editor, wrapper );

		const mockEvt = {
			return: {
				positions: [ BalloonPanelView.defaultPositions.viewportStickyNorth ],
				viewportOffsetConfig: { top: 5 }
			}
		};

		capturedListener( mockEvt );

		expect( mockEvt.return.viewportOffsetConfig.top ).toBe( 5 );
	} );

	it( 'should not modify position options when evt.return is null', () => {
		registerFullscreenBalloonOffsetCorrection( editor, wrapper );

		const mockEvt = { return: null };

		expect( () => capturedListener( mockEvt ) ).not.toThrow();
		expect( mockEvt.return ).toBeNull();
	} );

	it( 'should not apply the correction when positions does not include viewportStickyNorth', () => {
		// Even with a real toolbar height available, the correction must be a no-op
		// unless the balloon actually offered `viewportStickyNorth` as one of its positions.
		vi.spyOn( toolbarSlot, 'getBoundingClientRect' ).mockReturnValue(
			{ height: 50, width: 800, top: 0, bottom: 50, left: 0, right: 800, x: 0, y: 0, toJSON: () => {} }
		);

		registerFullscreenBalloonOffsetCorrection( editor, wrapper );

		const otherPosition = () => null;
		const mockEvt = {
			return: {
				positions: [ otherPosition ],
				viewportOffsetConfig: { top: 10 }
			}
		};

		capturedListener( mockEvt );

		// Nothing should have been appended or changed.
		expect( mockEvt.return.positions ).toHaveLength( 1 );
		expect( mockEvt.return.positions[ 0 ] ).toBe( otherPosition );
		expect( mockEvt.return.viewportOffsetConfig.top ).toBe( 10 );
	} );

	it( 'should not apply the correction when positions is missing entirely', () => {
		vi.spyOn( toolbarSlot, 'getBoundingClientRect' ).mockReturnValue(
			{ height: 50, width: 800, top: 0, bottom: 50, left: 0, right: 800, x: 0, y: 0, toJSON: () => {} }
		);

		registerFullscreenBalloonOffsetCorrection( editor, wrapper );

		const mockEvt = { return: { viewportOffsetConfig: { top: 10 } } };

		capturedListener( mockEvt );

		expect( mockEvt.return.positions ).toBeUndefined();
		expect( mockEvt.return.viewportOffsetConfig.top ).toBe( 10 );
	} );

	it( 'should handle a missing viewportOffsetConfig gracefully', () => {
		vi.spyOn( toolbarSlot, 'getBoundingClientRect' ).mockReturnValue(
			{ height: 40, width: 800, top: 0, bottom: 40, left: 0, right: 800, x: 0, y: 0, toJSON: () => {} }
		);

		registerFullscreenBalloonOffsetCorrection( editor, wrapper );

		const mockEvt = { return: { positions: [ BalloonPanelView.defaultPositions.viewportStickyNorth ] } };

		capturedListener( mockEvt );

		expect( mockEvt.return.viewportOffsetConfig.top ).toBe( 40 );
	} );

	it( 'should use 0 as height for missing slots when computing the offset', () => {
		menuBarSlot.remove();

		vi.spyOn( toolbarSlot, 'getBoundingClientRect' ).mockReturnValue(
			{ height: 45, width: 800, top: 0, bottom: 45, left: 0, right: 800, x: 0, y: 0, toJSON: () => {} }
		);

		registerFullscreenBalloonOffsetCorrection( editor, wrapper );

		const mockEvt = {
			return: {
				positions: [ BalloonPanelView.defaultPositions.viewportStickyNorth ],
				viewportOffsetConfig: { top: 10 }
			}
		};

		capturedListener( mockEvt );
		expect( mockEvt.return.viewportOffsetConfig.top ).toBe( 55 );
	} );

	it( 'should update contextual balloon position on init and cleanup if view is visible', () => {
		const contextualBalloon = editor.plugins.get( 'ContextualBalloon' );
		const updatePositionSpy = vi.spyOn( contextualBalloon, 'updatePosition' ).mockImplementation( () => {} );

		contextualBalloon.visibleView = { element: global.document.createElement( 'div' ) };

		const cleanup = registerFullscreenBalloonOffsetCorrection( editor, wrapper );

		expect( updatePositionSpy ).toHaveBeenCalledTimes( 1 );

		cleanup();

		expect( updatePositionSpy ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should use 0 as height when toolbarSlot is missing', () => {
		toolbarSlot.remove();

		vi.spyOn( menuBarSlot, 'getBoundingClientRect' ).mockReturnValue(
			{ height: 30, width: 800, top: 0, bottom: 30, left: 0, right: 800, x: 0, y: 0, toJSON: () => {} }
		);

		registerFullscreenBalloonOffsetCorrection( editor, wrapper );

		const mockEvt = {
			return: {
				positions: [ BalloonPanelView.defaultPositions.viewportStickyNorth ],
				viewportOffsetConfig: { top: 15 }
			}
		};

		capturedListener( mockEvt );
		expect( mockEvt.return.viewportOffsetConfig.top ).toBe( 45 );
	} );

	describe( 'createFullscreenStickyNorthPosition', () => {
		let stickyNorth, viewportElement, targetElement, balloonElement;

		beforeEach( () => {
			vi.spyOn( toolbarSlot, 'getBoundingClientRect' ).mockReturnValue(
				{ height: 40, width: 800, top: 0, bottom: 40, left: 0, right: 800, x: 0, y: 0, toJSON: () => {} }
			);

			registerFullscreenBalloonOffsetCorrection( editor, wrapper );

			const sentinel = () => null;
			const mockEvt = {
				return: {
					positions: [ sentinel, BalloonPanelView.defaultPositions.viewportStickyNorth ],
					viewportOffsetConfig: { top: 0 }
				}
			};

			capturedListener( mockEvt );
			stickyNorth = mockEvt.return.positions.at( -1 );

			viewportElement = global.document.createElement( 'div' );
			targetElement = global.document.createElement( 'div' );
			balloonElement = global.document.createElement( 'div' );

			global.document.body.appendChild( viewportElement );
			global.document.body.appendChild( targetElement );
			global.document.body.appendChild( balloonElement );
		} );

		afterEach( () => {
			viewportElement.remove();
			targetElement.remove();
			balloonElement.remove();
			vi.restoreAllMocks();
		} );

		it( 'should be appended to the positions array', () => {
			const sentinel = () => null;
			const mockEvt = {
				return: {
					positions: [ sentinel, BalloonPanelView.defaultPositions.viewportStickyNorth ],
					viewportOffsetConfig: { top: 0 }
				}
			};

			capturedListener( mockEvt );

			expect( mockEvt.return.positions ).toHaveLength( 3 );
			expect( mockEvt.return.positions[ 0 ] ).toBe( sentinel );
			expect( mockEvt.return.positions[ 1 ] ).toBe( BalloonPanelView.defaultPositions.viewportStickyNorth );
			expect( mockEvt.return.positions[ 2 ] ).toBeInstanceOf( Function );
		} );

		it( 'should return null when the wrapper does not intersect the constrained viewport', () => {
			// Push wrapper entirely above the viewport — bottom=-50, viewport starts at y=0: no intersection.
			// If document.body were used instead of wrapper (original viewportStickyNorth), body starts at y=0
			// and would intersect, giving a non-null result. This verifies the wrapper substitution is in effect.
			Object.assign( wrapper.style, { position: 'fixed', top: '-100px', height: '50px' } );

			expect( stickyNorth(
				new Rect( global.window ),
				new Rect( global.window ),
				new Rect( global.window )
			) ).toBeNull();
		} );

		it( 'should return null when the target does not intersect the visible boundary', () => {
			// Wrapper covers y=0..400, target is at y=500..550 — below the boundary, no intersection.
			Object.assign( wrapper.style, { position: 'fixed', top: '0', left: '0', width: '100%', height: '400px' } );
			Object.assign( viewportElement.style, { position: 'fixed', top: '0', left: '0', width: '800px', height: '400px' } );
			Object.assign( targetElement.style, { position: 'fixed', top: '500px', left: '50px', width: '700px', height: '50px' } );
			Object.assign( balloonElement.style, { position: 'fixed', top: '0', left: '0', width: '200px', height: '30px' } );

			expect( stickyNorth(
				new Rect( targetElement ),
				new Rect( balloonElement ),
				new Rect( viewportElement )
			) ).toBeNull();
		} );

		it( 'should return null when there is enough space to show the balloon normally', () => {
			Object.assign( wrapper.style, { position: 'fixed', top: '0', left: '0', width: '100%', height: '400px' } );
			Object.assign( viewportElement.style, { position: 'fixed', top: '0', left: '0', width: '800px', height: '400px' } );

			// Small target well within the viewport — space below (150px) exceeds balloon height (30px) → no sticky.
			Object.assign( targetElement.style, { position: 'fixed', top: '200px', left: '50px', width: '700px', height: '50px' } );
			Object.assign( balloonElement.style, { position: 'fixed', top: '0', left: '0', width: '200px', height: '30px' } );

			expect( stickyNorth(
				new Rect( targetElement ),
				new Rect( balloonElement ),
				new Rect( viewportElement )
			) ).toBeNull();
		} );

		it( 'should return a sticky position when the target fills the viewport', () => {
			// Wrapper covers the viewport area.
			Object.assign( wrapper.style, { position: 'fixed', top: '0', left: '0', width: '100%', height: '400px' } );

			// viewportElement acts as the constrained viewport passed to the positioning function.
			Object.assign( viewportElement.style, { position: 'fixed', top: '0', left: '0', width: '800px', height: '400px' } );

			// Target fills the viewport top-to-bottom — classic sticky scenario.
			// top=0 mimics a target already clipped to the constrained viewport by getOptimalPosition.
			Object.assign( targetElement.style, { position: 'fixed', top: '0', left: '50px', width: '700px', height: '600px' } );

			// Small balloon.
			Object.assign( balloonElement.style, { position: 'fixed', top: '0', left: '0', width: '200px', height: '30px' } );

			const result = stickyNorth(
				new Rect( targetElement ),
				new Rect( balloonElement ),
				new Rect( viewportElement )
			);

			expect( result ).not.toBeNull();
			expect( result.name ).toBe( 'arrowless' );
			expect( result.config.withArrow ).toBe( false );
			expect( result.top ).toBe( BalloonPanelView.stickyVerticalOffset );
		} );
	} );
} );
