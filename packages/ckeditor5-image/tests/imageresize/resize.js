/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, window */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ImagePlugin from '../../src/image';
import ImageStyle from '../../src/imagestyle';

import {
	getData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe.only( 'Image resizer', () => {
	const FIXTURE_WIDTH = 100;
	const FIXTURE_HEIGHT = 50;
	const MOUSE_BUTTON_MAIN = 0; // Id of left mouse button.
	// 60x30 black png image
	const imageFixture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAQAAAAAPLY1AAAAQklEQVR42u3PQREAAAgDoK1/' +
		'aM3g14MGNJMXKiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiJysRFNMgH0RpujAAAAAElFTkSuQmCC';
	let editor, view, viewDocument, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		editorElement.innerHTML = `<p>foo</p><figure><img src="${ imageFixture }"></figure>`;

		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ImagePlugin, ImageStyle, ParagraphPlugin ]
			} )
			.then( newEditor => {
				editor = newEditor;
				view = editor.editing.view;
				viewDocument = view.document;
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	describe( 'visual resizers', () => {
		it( 'correct amount is added by default', () => {
			const resizers = document.querySelectorAll( '.ck-widget__resizer' );

			expect( resizers.length ).to.be.equal( 4 );
		} );

		describe( 'visibility', () => {
			it( 'is hidden by default', () => {
				const allResizers = document.querySelectorAll( '.ck-widget__resizer' );

				for ( const resizer of allResizers ) {
					expect( isVisible( resizer ) ).to.be.false;
				}
			} );

			it( 'is shown when image is focused', () => {
				const widget = viewDocument.getRoot().getChild( 1 );
				const allResizers = document.querySelectorAll( '.ck-widget__resizer' );
				const domEventDataMock = {
					target: widget,
					preventDefault: sinon.spy()
				};

				viewDocument.fire( 'mousedown', domEventDataMock );

				for ( const resizer of allResizers ) {
					expect( isVisible( resizer ) ).to.be.true;
				}
			} );
		} );
	} );

	describe( 'standard image', () => {
		let widget;

		beforeEach( async function() {
			await editor.setData( `<p>foo</p><figure><img src="${ imageFixture }"></figure>` );

			widget = viewDocument.getRoot().getChild( 1 );
			const domEventDataMock = {
				target: widget,
				preventDefault: sinon.spy()
			};

			this.widget = widget;

			viewDocument.fire( 'mousedown', domEventDataMock );
		} );

		it( 'shrinks correctly with left-bottom handler', generateResizeTest( {
			expectedWidth: 80,
			pointerOffset: {
				x: 10,
				y: -10
			},
			resizerPosition: 'bottom-left'
		} ) );

		it( 'shrinks correctly with right-bottom handler', generateResizeTest( {
			expectedWidth: 80,
			pointerOffset: {
				x: -10,
				y: -10
			},
			resizerPosition: 'bottom-right'
		} ) );

		it( 'enlarges correctly with right-bottom handler, x axis only', generateResizeTest( {
			expectedWidth: 110,
			pointerOffset: {
				x: 10,
				y: 0
			},
			resizerPosition: 'bottom-right'
		} ) );

		it( 'enlarges correctly with right-bottom handler, y axis only', generateResizeTest( {
			expectedWidth: 120,
			pointerOffset: {
				x: 0,
				y: 10
			},
			resizerPosition: 'bottom-right'
		} ) );

		it( 'enlarges correctly with left-bottom handler, x axis only', generateResizeTest( {
			expectedWidth: 110,
			pointerOffset: {
				x: -10,
				y: 0
			},
			resizerPosition: 'bottom-left'
		} ) );

		it( 'enlarges correctly with left-bottom handler, y axis only', generateResizeTest( {
			expectedWidth: 120,
			pointerOffset: {
				x: 0,
				y: 10
			},
			resizerPosition: 'bottom-left'
		} ) );

		// --- top handlers ---

		it( 'enlarges correctly with left-top handler', generateResizeTest( {
			expectedWidth: 120,
			pointerOffset: {
				x: -10,
				y: -10
			},
			resizerPosition: 'top-left'
		} ) );

		it( 'enlarges correctly with left-top handler, y axis only', generateResizeTest( {
			expectedWidth: 120,
			pointerOffset: {
				x: 0,
				y: -10
			},
			resizerPosition: 'top-left'
		} ) );

		it( 'enlarges correctly with right-top handler', generateResizeTest( {
			expectedWidth: 120,
			pointerOffset: {
				x: 10,
				y: -10
			},
			resizerPosition: 'top-right'
		} ) );

		it( 'enlarges correctly with right-top handler, y axis only', generateResizeTest( {
			expectedWidth: 120,
			pointerOffset: {
				x: 0,
				y: -10
			},
			resizerPosition: 'top-right'
		} ) );
	} );

	describe( 'side image', () => {
		let widget;

		beforeEach( async function() {
			await editor.setData( `<p>foo</p><figure class="image image-style-side"><img src="${ imageFixture }"></figure>` );

			widget = viewDocument.getRoot().getChild( 1 );
			const domEventDataMock = {
				target: widget,
				preventDefault: sinon.spy()
			};

			this.widget = widget;

			viewDocument.fire( 'mousedown', domEventDataMock );
		} );

		it( 'shrinks correctly with left-bottom handler', generateResizeTest( {
			isSideImage: true,
			expectedWidth: 80,
			pointerOffset: {
				x: 20,
				y: -10
			},
			resizerPosition: 'bottom-left'
		} ) );

		it( 'shrinks correctly with right-bottom handler', generateResizeTest( {
			isSideImage: true,
			expectedWidth: 80,
			pointerOffset: {
				x: -20,
				y: -10
			},
			resizerPosition: 'bottom-right'
		} ) );

		it( 'shrinks correctly with left-top handler', generateResizeTest( {
			isSideImage: true,
			expectedWidth: 80,
			pointerOffset: {
				x: 20,
				y: 10
			},
			resizerPosition: 'top-left'
		} ) );

		it( 'shrinks correctly with right-top handler', generateResizeTest( {
			isSideImage: true,
			expectedWidth: 80,
			pointerOffset: {
				x: -20,
				y: 10
			},
			resizerPosition: 'top-right'
		} ) );

		it( 'enlarges correctly with left-bottom handler', generateResizeTest( {
			isSideImage: true,
			expectedWidth: 120,
			pointerOffset: {
				x: -10,
				y: 10
			},
			resizerPosition: 'bottom-left'
		} ) );

		it( 'enlarges correctly with right-bottom handler', generateResizeTest( {
			isSideImage: true,
			expectedWidth: 120,
			pointerOffset: {
				x: 10,
				y: 10
			},
			resizerPosition: 'bottom-right'
		} ) );

		it( 'enlarges correctly with right-bottom handler, y axis only', generateResizeTest( {
			isSideImage: true,
			expectedWidth: 140,
			pointerOffset: {
				x: 0,
				y: 20
			},
			resizerPosition: 'bottom-right'
		} ) );

		it( 'enlarges correctly with right-bottom handler, x axis only', generateResizeTest( {
			isSideImage: true,
			expectedWidth: 140,
			pointerOffset: {
				x: 40,
				y: 0
			},
			resizerPosition: 'bottom-right'
		} ) );

		it( 'enlarges correctly with left-top handler', generateResizeTest( {
			isSideImage: true,
			expectedWidth: 120,
			pointerOffset: {
				x: -20,
				y: -10
			},
			resizerPosition: 'top-left'
		} ) );

		it( 'enlarges correctly with right-top handler', generateResizeTest( {
			isSideImage: true,
			expectedWidth: 120,
			pointerOffset: {
				x: 20,
				y: 10
			},
			resizerPosition: 'top-right'
		} ) );
	} );

	function isVisible( element ) {
		// Checks if the DOM element is visible to the end user.
		return element.offsetParent !== null;
	}

	function fireMouseEvent( target, eventType, eventData ) {
		// Using initMouseEvent instead of MouseEvent constructor, as MouseEvent constructor doesn't support passing pageX
		// and pageY. See https://stackoverflow.com/questions/45843458/setting-click-events-pagex-and-pagey-always-reverts-to-0
		// However there's still a problem, that events created with `initMouseEvent` have **floored** pageX, pageY numbers.
		const event = document.createEvent( 'MouseEvent' );
		event.initMouseEvent( eventType, true, true, window, null, 0, 0, eventData.pageX, eventData.pageY, false, false, false, false,
			MOUSE_BUTTON_MAIN, null );

		target.dispatchEvent( event );
	}

	function getElementPosition( element ) {
		// Returns top left corner point.
		const viewportPosition = element.getBoundingClientRect();

		return {
			x: viewportPosition.left + window.scrollX,
			y: viewportPosition.top + window.scrollY
		};
	}

	function wait( delay ) {
		return new Promise( resolve => window.setTimeout( () => resolve(), delay ) );
	}

	function generateResizeTest( options ) {
		// options.resizerPosition - top-left / top-right / bottom-right / bottom-left
		// options.pointerOffset - object - pointer offset relative to the dragged corner. Negative values are perfectly fine.
		// e.g. { x: 10, y: -5 }
		// options.expectedWidth
		// [options.isSideImage=false]
		// Returns a test case that puts
		return function() {
			const widget = this.widget;
			const domResizeWrapper = view.domConverter.mapViewToDom( widget.getChild( 1 ) );
			const domBottomLeftResizer = domResizeWrapper.querySelector( `.ck-widget__resizer-${ options.resizerPosition }` );
			const domImage = view.domConverter.mapViewToDom( widget ).querySelector( 'img' );
			const imageTopLeftPosition = getElementPosition( domImage );
			const resizerPositionParts = options.resizerPosition.split( '-' );

			const initialPointerPosition = {
				pageX: imageTopLeftPosition.x,
				pageY: imageTopLeftPosition.y
			};

			if ( resizerPositionParts.includes( 'right' ) ) {
				initialPointerPosition.pageX += FIXTURE_WIDTH;
			}

			if ( resizerPositionParts.includes( 'bottom' ) ) {
				initialPointerPosition.pageY += FIXTURE_HEIGHT;
			}

			const finishPointerPosition = Object.assign( {}, initialPointerPosition );

			finishPointerPosition.pageX += options.pointerOffset.x || 0;
			finishPointerPosition.pageY += options.pointerOffset.y || 0;

			fireMouseEvent( domBottomLeftResizer, 'mousedown', initialPointerPosition );
			fireMouseEvent( domBottomLeftResizer, 'mousemove', initialPointerPosition );

			// We need to wait as mousemove events are throttled.
			return wait( 30 )
				.then( () => {
					fireMouseEvent( domBottomLeftResizer, 'mousemove', finishPointerPosition );

					expect( domImage.width ).to.be.closeTo( options.expectedWidth, 1 );

					fireMouseEvent( domBottomLeftResizer, 'mouseup', finishPointerPosition );

					const modelDataRegExp = !options.isSideImage ? /<paragraph>foo<\/paragraph><image src=".+?" width="(\d+)"><\/image>/ :
						/<paragraph>foo<\/paragraph><image imageStyle="side" src=".+?" width="(\d+)"><\/image>/;

					expect( getData( editor.model, {
						withoutSelection: true
					} ) ).to.match( modelDataRegExp );

					const modelItem = editor.model.document.getRoot().getChild( 1 );

					expect( modelItem.getAttribute( 'width' ) ).to.be.closeTo( options.expectedWidth, 1, 'Model check' );
				} );
		};
	}
} );
