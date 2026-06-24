/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InlineEditorUIView } from '../src/inlineeditoruiview.js';
import { EditingView } from '@ckeditor/ckeditor5-engine';
import { ToolbarView, BalloonPanelView, InlineEditableUIView, MenuBarView } from '@ckeditor/ckeditor5-ui';
import { Locale, Rect, toUnit, global, ResizeObserver } from '@ckeditor/ckeditor5-utils';
import { createViewRoot } from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';

const toPx = toUnit( 'px' );

describe( 'InlineEditorUIView', () => {
	let locale, view, editingView, editingViewRoot;
	let resizeCallback;

	beforeEach( () => {
		locale = new Locale();
		editingView = new EditingView();
		editingViewRoot = createViewRoot( editingView.document );
		view = new InlineEditorUIView( locale, editingView );
		view.editable.name = editingViewRoot.rootName;

		// Make sure other tests of the editor do not affect tests that follow.
		// Without it, if an instance of ResizeObserver already exists somewhere undestroyed
		// in DOM, the following DOM mock will have no effect.
		ResizeObserver._observerInstance = null;

		vi.spyOn( global.window, 'ResizeObserver' ).mockImplementation( function( callback ) {
			resizeCallback = callback;

			return {
				observe: vi.fn(),
				unobserve: vi.fn()
			};
		} );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		describe( '#toolbar', () => {
			it( 'is created', () => {
				expect( view.toolbar ).toBeInstanceOf( ToolbarView );
			} );

			it( 'is given a locale object', () => {
				expect( view.toolbar.locale ).toBe( locale );
			} );

			it( 'is not rendered', () => {
				expect( view.toolbar.isRendered ).toBe( false );
			} );

			it( 'should have the shouldGroupWhenFull option set based on constructor options', () => {
				const view = new InlineEditorUIView( locale, editingView, null, {
					shouldToolbarGroupWhenFull: true
				} );

				expect( view.toolbar.options.shouldGroupWhenFull ).toBe( true );

				view.destroy();
			} );

			it( 'should have the isFloating option set to true', () => {
				expect( view.toolbar.options.isFloating ).toBe( true );
			} );
		} );

		describe( '#panel', () => {
			it( 'is created', () => {
				expect( view.panel ).toBeInstanceOf( BalloonPanelView );
			} );

			it( 'is given a locale object', () => {
				expect( view.panel.locale ).toBe( locale );
			} );

			it( 'is not rendered', () => {
				expect( view.panel.isRendered ).toBe( false );
			} );
		} );

		describe( '#editable', () => {
			it( 'is created', () => {
				expect( view.editable ).toBeInstanceOf( InlineEditableUIView );
			} );

			it( 'is given a locale object', () => {
				expect( view.editable.locale ).toBe( locale );
			} );

			it( 'is not rendered', () => {
				expect( view.editable.isRendered ).toBe( false );
			} );

			it( 'creates an editing root with the default aria-label', () => {
				view.render();

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Rich Text Editor. Editing area: main' );

				view.destroy();
			} );

			it( 'creates an editing root with the configured aria-label (string format)', () => {
				const editingView = new EditingView();
				const editingViewRoot = createViewRoot( editingView.document );
				const view = new InlineEditorUIView( locale, editingView, undefined, {
					label: 'Foo'
				} );
				view.editable.name = editingViewRoot.rootName;
				view.render();

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Foo' );

				view.destroy();
			} );

			it( 'creates an editing root with the configured aria-label (object format)', () => {
				const editingView = new EditingView();
				const editingViewRoot = createViewRoot( editingView.document );
				const view = new InlineEditorUIView( locale, editingView, undefined, {
					label: {
						main: 'Foo'
					}
				} );
				view.editable.name = editingViewRoot.rootName;
				view.render();

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).toBe( 'Foo' );

				view.destroy();
			} );
		} );

		describe( '#menuBarView', () => {
			it( 'is not created', () => {
				expect( view.menuBarView ).toBeUndefined();
			} );
		} );
	} );

	describe( 'with menu bar', () => {
		let viewWithMenuBar;

		beforeEach( () => {
			viewWithMenuBar = new InlineEditorUIView( locale, editingView, undefined, { useMenuBar: true } );
			viewWithMenuBar.editable.name = editingViewRoot.rootName;
			viewWithMenuBar.render();
		} );

		afterEach( () => {
			viewWithMenuBar.destroy();
		} );

		describe( '#menuBarView', () => {
			it( 'is created', () => {
				expect( viewWithMenuBar.menuBarView ).toBeInstanceOf( MenuBarView );
			} );

			it( 'is given a locale object', () => {
				expect( viewWithMenuBar.menuBarView.locale ).toBe( locale );
			} );

			it( 'is put into the "panel.content" collection', () => {
				expect( viewWithMenuBar.panel.content.get( 0 ) ).toBe( viewWithMenuBar.menuBarView );
				expect( viewWithMenuBar.panel.content.get( 1 ) ).toBe( viewWithMenuBar.toolbar );
			} );
		} );
	} );

	describe( 'render()', () => {
		beforeEach( () => {
			view.render();
		} );

		describe( '#toolbar', () => {
			it( 'sets the default value of the #viewportTopOffset attribute', () => {
				expect( view.viewportTopOffset ).toBe( 0 );
			} );

			describe( 'automatic resizing when shouldToolbarGroupWhenFull is "true"', () => {
				it( 'should set and update toolbar max-width according to the width of the editable element', () => {
					const locale = new Locale();
					const editingView = new EditingView();
					const editingViewRoot = createViewRoot( editingView.document );
					const view = new InlineEditorUIView( locale, editingView, null, {
						shouldToolbarGroupWhenFull: true
					} );
					view.editable.name = editingViewRoot.rootName;
					view.render();

					const editableElement = view.editable.element;

					// View element should be inside the body, otherwise the `Rect` instance will complain
					// that it's not available in the DOM.
					global.document.body.appendChild( editableElement );

					editableElement.style.width = '400px';

					resizeCallback( [ {
						target: editableElement,
						contentRect: new Rect( editableElement )
					} ] );

					// Include paddings.
					expect( view.toolbar.maxWidth ).toBe( toPx( new Rect( editableElement ).width ) );

					editableElement.style.width = '200px';

					resizeCallback( [ {
						target: editableElement,
						contentRect: new Rect( editableElement )
					} ] );

					// Include paddings.
					expect( view.toolbar.maxWidth ).toBe( toPx( new Rect( editableElement ).width ) );

					editableElement.remove();
					view.destroy();
				} );
			} );
		} );

		describe( '#panel', () => {
			it( 'is given the right CSS class', () => {
				expect( view.panel.element.classList.contains( 'ck-toolbar-container' ) ).toBe( true );
			} );

			it( 'is put into the #body collection', () => {
				expect( view.body.get( 0 ) ).toBe( view.panel );
			} );
		} );

		describe( '#editable', () => {
			it( 'is registered as a child', () => {
				const spy = vi.spyOn( view.editable, 'destroy' );

				view.destroy();
				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );
		} );
	} );

	describe( 'init()', () => {
		it( 'appends #toolbar to panel#content', () => {
			locale = new Locale();
			const view = new InlineEditorUIView( locale, editingView );

			view.editable.name = editingViewRoot.rootName;

			expect( view.panel.content ).toHaveLength( 0 );

			view.render();
			expect( view.panel.content.get( 0 ) ).toBe( view.toolbar );

			view.destroy();
		} );
	} );

	describe( 'panelPositions', () => {
		it( 'returns the positions in the right order (uiLanguageDirection="ltr")', () => {
			locale.uiLanguageDirection = 'ltr';

			const uiView = new InlineEditorUIView( locale, editingView );
			const positions = uiView.panelPositions;
			const editableRect = {
				top: 100,
				bottom: 200,
				left: 100,
				right: 100,
				width: 100,
				height: 100
			};
			const panelRect = {
				width: 50,
				height: 50
			};

			expect( positions ).toHaveLength( 2 );
			expect( positions[ 0 ]( editableRect, panelRect ).name ).toBe( 'toolbar_west' );
			expect( positions[ 1 ]( editableRect, panelRect ).name ).toBe( 'toolbar_east' );
		} );

		it( 'returns the positions in the right order (uiLanguageDirection="rtl")', () => {
			locale.uiLanguageDirection = 'rtl';

			const uiView = new InlineEditorUIView( locale, editingView );
			const positions = uiView.panelPositions;
			const editableRect = {
				top: 100,
				bottom: 200,
				left: 100,
				right: 100,
				width: 100,
				height: 100
			};
			const panelRect = {
				width: 50,
				height: 50
			};

			expect( positions ).toHaveLength( 2 );
			expect( positions[ 0 ]( editableRect, panelRect ).name ).toBe( 'toolbar_east' );
			expect( positions[ 1 ]( editableRect, panelRect ).name ).toBe( 'toolbar_west' );
		} );

		it( 'returned positions ahould have no arrow', () => {
			const uiView = new InlineEditorUIView( locale, editingView );
			const positions = uiView.panelPositions;
			const editableRect = {
				top: 100,
				bottom: 200,
				left: 100,
				right: 100,
				width: 100,
				height: 100
			};
			const panelRect = {
				width: 50,
				height: 50
			};

			expect( positions ).toHaveLength( 2 );
			expect( positions[ 0 ]( editableRect, panelRect ).config.withArrow ).toBe( false );
			expect( positions[ 1 ]( editableRect, panelRect ).config.withArrow ).toBe( false );
		} );

		describe( 'west', () => {
			testTopPositions( 0, 100 );
		} );

		describe( 'east', () => {
			testTopPositions( 1, 150 );
		} );

		function testTopPositions( positionIndex, expectedLeft ) {
			it( 'positions the panel above editable when there\'s enough space', () => {
				const position = view.panelPositions[ positionIndex ];
				const editableRect = {
					top: 101, // !
					bottom: 200,
					left: 100,
					right: 100,
					width: 100,
					height: 100
				};
				const panelRect = {
					width: 50,
					height: 100 // !
				};

				const { top, left } = position( editableRect, panelRect );

				expect( top ).toBe( 1 );
				expect( left ).toBe( expectedLeft );
			} );

			it( 'positions the panel over the editable when there\'s not enough space above (1)', () => {
				const position = view.panelPositions[ positionIndex ];
				const editableRect = {
					top: 100, // !
					bottom: 300,
					left: 100,
					right: 100,
					width: 100,
					height: 200
				};
				const panelRect = {
					width: 50,
					height: 100 // !
				};

				const { top, left } = position( editableRect, panelRect );

				expect( top ).toBe( 0 );
				expect( left ).toBe( expectedLeft );
			} );

			it( 'positions the panel over the editable when there\'s not enough space above (2)', () => {
				const position = view.panelPositions[ positionIndex ];
				const editableRect = {
					top: 99, // !
					bottom: 399,
					left: 100,
					right: 100,
					width: 100,
					height: 200
				};
				const panelRect = {
					width: 50,
					height: 100 // !
				};

				const { top, left } = position( editableRect, panelRect );

				expect( top ).toBe( 0 );
				expect( left ).toBe( expectedLeft );
			} );

			it( 'positions the panel over the editable when there\'s not enough space above (3)', () => {
				const position = view.panelPositions[ positionIndex ];
				const editableRect = {
					top: 51, // !
					bottom: 399,
					left: 100,
					right: 100,
					width: 100,
					height: 200
				};
				const panelRect = {
					width: 50,
					height: 100 // !
				};

				const { top, left } = position( editableRect, panelRect );

				expect( top ).toBe( 0 );
				expect( left ).toBe( expectedLeft );
			} );

			it( 'positions the panel below the editable when there\'s not enough space above/over', () => {
				const position = view.panelPositions[ positionIndex ];
				const editableRect = {
					top: 50,
					bottom: 150, // !
					left: 100,
					right: 100,
					width: 100,
					height: 100
				};
				const panelRect = {
					width: 50,
					height: 100 // !
				};

				const { top, left } = position( editableRect, panelRect );

				expect( top ).toBe( 150 );
				expect( left ).toBe( expectedLeft );
			} );

			describe( 'view#viewportTopOffset', () => {
				it( 'sticks the panel to the offset when there\'s not enough space above', () => {
					view.viewportTopOffset = 50;

					const position = view.panelPositions[ positionIndex ];
					const editableRect = {
						top: 0, // !
						bottom: 200,
						left: 100,
						right: 100,
						width: 100,
						height: 200
					};
					const panelRect = {
						width: 50,
						height: 50
					};

					const { top, left } = position( editableRect, panelRect );

					expect( top ).toBe( 50 );
					expect( left ).toBe( expectedLeft );
				} );

				it( 'positions the panel below the editable when there\'s not enough space above/over', () => {
					view.viewportTopOffset = 50;

					const position = view.panelPositions[ positionIndex ];
					const editableRect = {
						top: 100,
						bottom: 150,
						left: 100,
						right: 100,
						width: 100,
						height: 50
					};
					const panelRect = {
						width: 50,
						height: 80
					};

					const { top, left } = position( editableRect, panelRect );

					expect( top ).toBe( 150 );
					expect( left ).toBe( expectedLeft );
				} );
			} );
		}
	} );
} );
