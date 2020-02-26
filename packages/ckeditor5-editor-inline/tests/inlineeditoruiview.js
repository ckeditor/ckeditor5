/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import InlineEditorUIView from '../src/inlineeditoruiview';
import EditingView from '@ckeditor/ckeditor5-engine/src/view/view';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import createRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ResizeObserver from '@ckeditor/ckeditor5-utils/src/dom/resizeobserver';

const toPx = toUnit( 'px' );

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'InlineEditorUIView', () => {
	let locale, view, editingView, editingViewRoot;
	let resizeCallback;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = new Locale();
		editingView = new EditingView();
		editingViewRoot = createRoot( editingView.document );
		view = new InlineEditorUIView( locale, editingView );
		view.editable.name = editingViewRoot.rootName;

		// Make sure other tests of the editor do not affect tests that follow.
		// Without it, if an instance of ResizeObserver already exists somewhere undestroyed
		// in DOM, the following DOM mock will have no effect.
		ResizeObserver._observerInstance = null;

		testUtils.sinon.stub( global.window, 'ResizeObserver' ).callsFake( callback => {
			resizeCallback = callback;

			return {
				observe: sinon.spy(),
				unobserve: sinon.spy()
			};
		} );
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		describe( '#toolbar', () => {
			it( 'is created', () => {
				expect( view.toolbar ).to.be.instanceof( ToolbarView );
			} );

			it( 'is given a locale object', () => {
				expect( view.toolbar.locale ).to.equal( locale );
			} );

			it( 'is not rendered', () => {
				expect( view.toolbar.isRendered ).to.be.false;
			} );

			it( 'should have the shouldGroupWhenFull option set based on constructor options', () => {
				const view = new InlineEditorUIView( locale, editingView, null, {
					shouldToolbarGroupWhenFull: true
				} );

				expect( view.toolbar.options.shouldGroupWhenFull ).to.be.true;

				view.destroy();
			} );
		} );

		describe( '#panel', () => {
			it( 'is created', () => {
				expect( view.panel ).to.be.instanceof( BalloonPanelView );
			} );

			it( 'is given a locale object', () => {
				expect( view.panel.locale ).to.equal( locale );
			} );

			it( 'gets view.panel#withArrow set', () => {
				expect( view.panel.withArrow ).to.be.false;
			} );

			it( 'is not rendered', () => {
				expect( view.panel.isRendered ).to.be.false;
			} );
		} );

		describe( '#editable', () => {
			it( 'is created', () => {
				expect( view.editable ).to.be.instanceof( InlineEditableUIView );
			} );

			it( 'is given a locale object', () => {
				expect( view.editable.locale ).to.equal( locale );
			} );

			it( 'is not rendered', () => {
				expect( view.editable.isRendered ).to.be.false;
			} );
		} );
	} );

	describe( 'render()', () => {
		beforeEach( () => {
			view.render();
		} );

		describe( '#toolbar', () => {
			it( 'is given the right CSS classes', () => {
				expect( view.toolbar.element.classList.contains( 'ck-toolbar_floating' ) ).to.be.true;
			} );

			it( 'sets the default value of the #viewportTopOffset attribute', () => {
				expect( view.viewportTopOffset ).to.equal( 0 );
			} );

			describe( 'automatic resizing when shouldToolbarGroupWhenFull is "true"', () => {
				it( 'should set and update toolbar max-width according to the width of the editable element', () => {
					const locale = new Locale();
					const editingView = new EditingView();
					const editingViewRoot = createRoot( editingView.document );
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
					expect( view.toolbar.maxWidth ).to.be.equal( toPx( new Rect( editableElement ).width ) );

					editableElement.style.width = '200px';

					resizeCallback( [ {
						target: editableElement,
						contentRect: new Rect( editableElement )
					} ] );

					// Include paddings.
					expect( view.toolbar.maxWidth ).to.be.equal( toPx( new Rect( editableElement ).width ) );

					editableElement.remove();
					view.destroy();
				} );
			} );
		} );

		describe( '#panel', () => {
			it( 'is given the right CSS class', () => {
				expect( view.panel.element.classList.contains( 'ck-toolbar-container' ) ).to.be.true;
			} );

			it( 'is put into the #body collection', () => {
				expect( view.body.get( 0 ) ).to.equal( view.panel );
			} );
		} );

		describe( '#editable', () => {
			it( 'is registered as a child', () => {
				const spy = sinon.spy( view.editable, 'destroy' );

				view.destroy();
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'init()', () => {
		it( 'appends #toolbar to panel#content', () => {
			locale = new Locale();
			const view = new InlineEditorUIView( locale, editingView );

			view.editable.name = editingViewRoot.rootName;

			expect( view.panel.content ).to.have.length( 0 );

			view.render();
			expect( view.panel.content.get( 0 ) ).to.equal( view.toolbar );

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

			expect( positions ).to.have.length( 2 );
			expect( positions[ 0 ]( editableRect, panelRect ).name ).to.equal( 'toolbar_west' );
			expect( positions[ 1 ]( editableRect, panelRect ).name ).to.equal( 'toolbar_east' );
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

			expect( positions ).to.have.length( 2 );
			expect( positions[ 0 ]( editableRect, panelRect ).name ).to.equal( 'toolbar_east' );
			expect( positions[ 1 ]( editableRect, panelRect ).name ).to.equal( 'toolbar_west' );
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

				expect( top ).to.equal( 1 );
				expect( left ).to.equal( expectedLeft );
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

				expect( top ).to.equal( 0 );
				expect( left ).to.equal( expectedLeft );
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

				expect( top ).to.equal( 0 );
				expect( left ).to.equal( expectedLeft );
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

				expect( top ).to.equal( 0 );
				expect( left ).to.equal( expectedLeft );
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

				expect( top ).to.equal( 150 );
				expect( left ).to.equal( expectedLeft );
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

					expect( top ).to.equal( 50 );
					expect( left ).to.equal( expectedLeft );
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

					expect( top ).to.equal( 150 );
					expect( left ).to.equal( expectedLeft );
				} );
			} );
		}
	} );
} );
