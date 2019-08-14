/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, window */

// ClassicTestEditor can't be used, as it doesn't handle the focus, which is needed to test resizer visual cues.
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Image from '../src/image';
import ImageResize from '../src/imageresize';
import ImageResizeCommand from '../src/imageresize/imageresizecommand';
import ImageStyle from '../src/imagestyle';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Table from '@ckeditor/ckeditor5-table/src/table';

import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ImageResize', () => {
	const FIXTURE_WIDTH = 100;
	const FIXTURE_HEIGHT = 50;
	// Id of the left mouse button.
	const MOUSE_BUTTON_MAIN = 0;
	// 60x50 black png image
	const IMAGE_SRC_FIXTURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAQAAAAAPLY1AAAAQklEQVR42u3PQREAAAgDoK1/' +
		'aM3g14MGNJMXKiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiJysRFNMgH0RpujAAAAAElFTkSuQmCC';

	let absoluteContainer, widget, editor, view, viewDocument, editorElement;

	before( () => {
		// This container is required to position editor element in a reliable element.
		// See fireMouseEvent method for more information regarding imprecise mouse position.
		absoluteContainer = document.createElement( 'div' );
		absoluteContainer.style.top = '50px';
		absoluteContainer.style.left = '50px';
		absoluteContainer.style.height = '1000px';
		absoluteContainer.style.width = '500px';
		absoluteContainer.style.position = 'absolute';
		document.body.appendChild( absoluteContainer );
	} );

	after( () => {
		absoluteContainer.remove();
	} );

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		editorElement.innerHTML = `<p>foo</p><figure class="image"><img src="${ IMAGE_SRC_FIXTURE }"></figure>`;

		absoluteContainer.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResize ]
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

	describe( 'conversion', () => {
		it( 'upcasts 100px width correctly', () => {
			editor.setData( `<figure class="image"><img src="${ IMAGE_SRC_FIXTURE }" style="width:100px;"></figure>` );

			expect( editor.model.document.getRoot().getChild( 0 ).getAttribute( 'width' ) ).to.equal( '100px' );
		} );

		it( 'upcasts 50% width correctly', () => {
			editor.setData( `<figure class="image"><img src="${ IMAGE_SRC_FIXTURE }" style="width:50%;"></figure>` );

			expect( editor.model.document.getRoot().getChild( 0 ).getAttribute( 'width' ) ).to.equal( '50%' );
		} );

		it( 'downcasts 100px width correctly', () => {
			setData( editor.model, `<image src="${ IMAGE_SRC_FIXTURE }" width="100px"></image>` );

			expect( editor.getData() )
				.to.equal( `<figure class="image image_resized"><img style="width:100px;" src="${ IMAGE_SRC_FIXTURE }"></figure>` );
		} );

		it( 'downcasts 50% width correctly', () => {
			setData( editor.model, `<image src="${ IMAGE_SRC_FIXTURE }" width="50%"></image>` );

			expect( editor.getData() )
				.to.equal( `<figure class="image image_resized"><img style="width:50%;" src="${ IMAGE_SRC_FIXTURE }"></figure>` );
		} );
	} );

	describe( 'schema', () => {
		it( 'allows the width attribute', () => {
			expect( editor.model.schema.checkAttribute( 'image', 'width' ) ).to.be.true;
		} );

		it( 'defines width as a formatting attribute', () => {
			expect( editor.model.schema.getAttributeProperties( 'width' ) ).to.have.property( 'isFormatting', true );
		} );
	} );

	describe( 'command', () => {
		it( 'defines the imageResize command', () => {
			expect( editor.commands.get( 'imageResize' ) ).to.be.instanceOf( ImageResizeCommand );
		} );
	} );

	describe( 'visual resizers', () => {
		it( 'correct amount is added by default', () => {
			const resizers = document.querySelectorAll( '.ck-widget__resizer__handle' );

			expect( resizers.length ).to.be.equal( 4 );
		} );

		describe( 'visibility', () => {
			it( 'is hidden by default', () => {
				const allResizers = document.querySelectorAll( '.ck-widget__resizer__handle' );

				for ( const resizer of allResizers ) {
					expect( isVisible( resizer ) ).to.be.false;
				}
			} );

			it( 'is shown when image is focused', () => {
				const widget = viewDocument.getRoot().getChild( 1 );
				const allResizers = document.querySelectorAll( '.ck-widget__resizer__handle' );
				const domEventDataMock = {
					target: widget,
					preventDefault: sinon.spy()
				};

				focusEditor( editor );

				viewDocument.fire( 'mousedown', domEventDataMock );

				for ( const resizer of allResizers ) {
					expect( isVisible( resizer ) ).to.be.true;
				}
			} );
		} );
	} );

	it( 'uses the command on commit', async () => {
		setData( editor.model, `<paragraph>foo</paragraph>[<image src="${ IMAGE_SRC_FIXTURE }"></image>]` );

		widget = viewDocument.getRoot().getChild( 1 );

		const spy = sinon.spy( editor.commands.get( 'imageResize' ), 'execute' );

		await generateResizeTest( {
			expectedWidth: 80,
			pointerOffset: {
				x: 10,
				y: -10
			},
			resizerPosition: 'bottom-left'
		} )();

		expect( spy.calledOnce ).to.be.true;
		expect( spy.args[ 0 ][ 0 ] ).to.deep.equal( { width: '80px' } );
	} );

	describe( 'standard image resizing', () => {
		beforeEach( () => {
			setData( editor.model, `<paragraph>foo</paragraph>[<image src="${ IMAGE_SRC_FIXTURE }"></image>]` );

			widget = viewDocument.getRoot().getChild( 1 );
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
			expectedWidth: 120,
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
			expectedWidth: 120,
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

	describe( 'side image resizing', () => {
		beforeEach( () => {
			setData( editor.model, `<paragraph>foo</paragraph>[<image imageStyle="side" src="${ IMAGE_SRC_FIXTURE }"></image>]` );

			widget = viewDocument.getRoot().getChild( 1 );
		} );

		it( 'shrinks correctly with left-bottom handler', generateSideResizeTest( {
			isSideImage: true,
			expectedWidth: 80,
			pointerOffset: {
				x: 20,
				y: -10
			},
			resizerPosition: 'bottom-left'
		} ) );

		it( 'shrinks correctly with right-bottom handler', generateSideResizeTest( {
			isSideImage: true,
			expectedWidth: 80,
			pointerOffset: {
				x: -20,
				y: -10
			},
			resizerPosition: 'bottom-right'
		} ) );

		it( 'shrinks correctly with left-top handler', generateSideResizeTest( {
			isSideImage: true,
			expectedWidth: 80,
			pointerOffset: {
				x: 20,
				y: 10
			},
			resizerPosition: 'top-left'
		} ) );

		it( 'shrinks correctly with right-top handler', generateSideResizeTest( {
			isSideImage: true,
			expectedWidth: 80,
			pointerOffset: {
				x: -20,
				y: 10
			},
			resizerPosition: 'top-right'
		} ) );

		it( 'enlarges correctly with left-bottom handler', generateSideResizeTest( {
			isSideImage: true,
			expectedWidth: 120,
			pointerOffset: {
				x: -10,
				y: 10
			},
			resizerPosition: 'bottom-left'
		} ) );

		it( 'enlarges correctly with right-bottom handler', generateSideResizeTest( {
			isSideImage: true,
			expectedWidth: 120,
			pointerOffset: {
				x: 10,
				y: 10
			},
			resizerPosition: 'bottom-right'
		} ) );

		it( 'enlarges correctly with right-bottom handler, y axis only', generateSideResizeTest( {
			isSideImage: true,
			expectedWidth: 140,
			pointerOffset: {
				x: 0,
				y: 20
			},
			resizerPosition: 'bottom-right'
		} ) );

		it( 'enlarges correctly with right-bottom handler, x axis only', generateSideResizeTest( {
			isSideImage: true,
			expectedWidth: 140,
			pointerOffset: {
				x: 40,
				y: 0
			},
			resizerPosition: 'bottom-right'
		} ) );

		it( 'enlarges correctly with left-top handler', generateSideResizeTest( {
			isSideImage: true,
			expectedWidth: 120,
			pointerOffset: {
				x: -20,
				y: -10
			},
			resizerPosition: 'top-left'
		} ) );

		it( 'enlarges correctly with right-top handler', generateSideResizeTest( {
			isSideImage: true,
			expectedWidth: 120,
			pointerOffset: {
				x: 20,
				y: 10
			},
			resizerPosition: 'top-right'
		} ) );

		function generateSideResizeTest( options ) {
			return generateResizeTest( Object.assign( {
				isSideImage: true,
				modelRegExp: /<paragraph>foo<\/paragraph><image imageStyle="side" src=".+?" width="([\d.]+)px"><\/image>/
			}, options ) );
		}
	} );

	describe( 'undo integration', () => {
		beforeEach( () => {
			setData( editor.model, `<paragraph>foo</paragraph>[<image src="${ IMAGE_SRC_FIXTURE }"></image>]` );

			widget = viewDocument.getRoot().getChild( 1 );
		} );

		it( 'has correct border size after undo', async () => {
			await generateResizeTest( {
				expectedWidth: 120,
				pointerOffset: {
					x: 0,
					y: 10
				},
				resizerPosition: 'bottom-left'
			} )();

			editor.commands.get( 'undo' ).execute();

			await wait( 40 );

			const resizerWrapper = document.querySelector( '.ck-widget__resizer' );
			const shadowBoundingRect = resizerWrapper.getBoundingClientRect();

			expect( shadowBoundingRect.width ).to.be.equal( 100 );
			expect( shadowBoundingRect.height ).to.be.equal( 50 );
		} );
	} );

	describe( 'table integration', () => {
		beforeEach( () => {
			setData( editor.model,
				'<table>' +
					`<tableRow><tableCell>[<image src="${ IMAGE_SRC_FIXTURE }"></image>]</tableCell></tableRow>` +
				'</table>'
			);

			widget = viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 0 ).getChild( 0 );
		} );

		it( 'works when resizing in a table', generateResizeTest( {
			getModel: () => editor.model.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 ).getChild( 0 ),
			expectedWidth: 60,
			modelRegExp: /.+/,
			pointerOffset: {
				x: -40,
				y: -20
			},
			resizerPosition: 'bottom-right'
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
			x: viewportPosition.left,
			y: viewportPosition.top
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
			const domResizeWrapper = view.domConverter.mapViewToDom( widget.getChild( 1 ) );
			const domBottomLeftResizer = domResizeWrapper.querySelector( `.ck-widget__resizer__handle-${ options.resizerPosition }` );
			const domImage = view.domConverter.mapViewToDom( widget ).querySelector( 'img' );
			const imageTopLeftPosition = getElementPosition( domImage );
			const resizerPositionParts = options.resizerPosition.split( '-' );

			const modelRegExp = options.modelRegExp ? options.modelRegExp :
				/<paragraph>foo<\/paragraph><image src=".+?" width="([\d.]+)px"><\/image>/;

			focusEditor( editor );

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
			return wait( 40 )
				.then( () => {
					fireMouseEvent( domBottomLeftResizer, 'mousemove', finishPointerPosition );

					expect( domImage.width ).to.be.closeTo( options.expectedWidth, 2, 'DOM width check' );

					fireMouseEvent( domBottomLeftResizer, 'mouseup', finishPointerPosition );

					expect( getData( editor.model, {
						withoutSelection: true
					} ) ).to.match( modelRegExp );

					const modelItem = options.getModel ? options.getModel() : editor.model.document.getRoot().getChild( 1 );

					expect( modelItem.getAttribute( 'width' ) ).to.match( /^([\d.]+)px$/, 'Model width is properly formatted' );
					expect( parseInt( modelItem.getAttribute( 'width' ), 0 ) )
						.to.be.closeTo( options.expectedWidth, 2, 'Model width check' );
				} );
		};
	}

	function focusEditor( editor ) {
		editor.editing.view.focus();
		editor.ui.focusTracker.isFocused = true;
	}
} );
