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

import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ImageResize', () => {
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

		absoluteContainer.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResize ],
				image: {
					resizeUnit: 'px'
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				view = editor.editing.view;
				viewDocument = view.document;
				widget = viewDocument.getRoot().getChild( 1 );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'conversion', () => {
		it( 'upcasts 100px width correctly', () => {
			editor.setData( `<figure class="image" style="width:100px;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );

			expect( editor.model.document.getRoot().getChild( 0 ).getAttribute( 'width' ) ).to.equal( '100px' );
		} );

		it( 'upcasts 50% width correctly', () => {
			editor.setData( `<figure class="image" style="width:50%;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );

			expect( editor.model.document.getRoot().getChild( 0 ).getAttribute( 'width' ) ).to.equal( '50%' );
		} );

		it( 'downcasts 100px width correctly', () => {
			setData( editor.model, `<image src="${ IMAGE_SRC_FIXTURE }" width="100px"></image>` );

			expect( editor.getData() )
				.to.equal( `<figure class="image image_resized" style="width:100px;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
		} );

		it( 'downcasts 50% width correctly', () => {
			setData( editor.model, `<image src="${ IMAGE_SRC_FIXTURE }" width="50%"></image>` );

			expect( editor.getData() )
				.to.equal( `<figure class="image image_resized" style="width:50%;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
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

			// It's either 80px or 81px depending on the device, so we need to make the test a bit more loose.
			const realWidth = editor.model.document.getRoot().getChild( 1 ).getAttribute( 'width' );

			expect( realWidth ).to.match( /^\d\dpx$/ );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 0 ] ).to.deep.equal( { width: realWidth } );
		} );

		it( 'disables the resizer if the command is disabled', () => {
			setData( editor.model, `<paragraph>foo</paragraph>[<image src="${ IMAGE_SRC_FIXTURE }"></image>]` );

			const resizer = getFirstResizer( editor );

			let isEnabled = false;

			editor.commands.get( 'imageResize' ).on( 'set:isEnabled', evt => {
				evt.return = isEnabled;
				evt.stop();
			}, { priority: 'highest' } );

			editor.commands.get( 'imageResize' ).refresh();
			expect( resizer.isEnabled ).to.be.false;

			isEnabled = true;
			editor.commands.get( 'imageResize' ).refresh();
			expect( resizer.isEnabled ).to.be.true;
		} );

		it( 'the resizer is disabled from the beginning when the command is disabled when the image is inserted', () => {
			setData( editor.model, '<paragraph>foo[]</paragraph>' );

			editor.commands.get( 'imageResize' ).on( 'set:isEnabled', evt => {
				evt.return = false;
				evt.stop();
			}, { priority: 'highest' } );
			editor.commands.get( 'imageResize' ).refresh();

			editor.model.change( writer => {
				editor.model.insertContent( writer.createElement( 'image', { src: IMAGE_SRC_FIXTURE } ) );
			} );

			const resizer = getFirstResizer( editor );
			const resizerWrapper = editor.ui.getEditableElement().querySelector( '.ck-widget__resizer' );

			expect( resizer.isEnabled ).to.be.false;
			expect( resizerWrapper.style.display ).to.equal( 'none' );
		} );
	} );

	describe( 'visual resizers', () => {
		beforeEach( () => {
			setData( editor.model, `<paragraph>foo</paragraph>[<image src="${ IMAGE_SRC_FIXTURE }"></image>]` );

			widget = viewDocument.getRoot().getChild( 1 );
		} );

		it( 'correct number is added by default', () => {
			const resizers = editor.ui.getEditableElement().querySelectorAll( '.ck-widget__resizer__handle' );

			expect( resizers.length ).to.be.equal( 4 );
		} );

		describe( 'visibility', () => {
			it( 'is hidden by default', () => {
				const allResizers = editor.ui.getEditableElement().querySelectorAll( '.ck-widget__resizer__handle' );

				for ( const resizer of allResizers ) {
					expect( isVisible( resizer ) ).to.be.false;
				}
			} );

			it( 'is shown when image is focused', () => {
				const widget = viewDocument.getRoot().getChild( 1 );
				const allResizers = editor.ui.getEditableElement().querySelectorAll( '.ck-widget__resizer__handle' );
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

			await wait( 160 ); // ui#update event is throttled.

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

	describe( 'srcset integration', () => {
		// The image is 96x96 pixels.
		const imageBaseUrl = '/assets/sample.png';
		const getModel = () => editor.model.document.getRoot().getChild( 0 );
		let image;

		before( async () => {
			image = await preloadImage( imageBaseUrl );
		} );

		after( () => {
			image.remove();
		} );

		beforeEach( () => {
			editor.setData(
				`<figure class="image">
					<img src="${ imageBaseUrl }"
						srcset="${ imageBaseUrl }?a 110w,
							${ imageBaseUrl }?b 440w,
							${ imageBaseUrl }?c 1025w"
						sizes="100vw" width="96">
				</figure>`
			);

			widget = viewDocument.getRoot().getChild( 0 );
		} );

		it( 'works with images containing srcset', generateResizeTest( {
			getModel,
			expectedWidth: 76,
			modelRegExp: /.+/,
			pointerOffset: {
				x: -20,
				y: -20
			},
			resizerPosition: 'bottom-right'
		} ) );

		it( 'retains width after removing srcset', async () => {
			await generateResizeTest( {
				getModel,
				expectedWidth: 80,
				modelRegExp: /.+/,
				pointerOffset: {
					x: -16,
					y: -16
				},
				resizerPosition: 'bottom-right'
			} )();

			editor.model.change( writer => {
				writer.removeAttribute( 'srcset', getModel() );
			} );

			expect( editor.getData() )
				.to.match( /<figure class="image image_resized" style="width:[\d.]{2,}px;"><img src="\/assets\/sample.png"><\/figure>/ );
		} );

		async function preloadImage( imageUrl ) {
			const image = document.createElement( 'img' );

			image.src = imageUrl;

			return new Promise( ( resolve, reject ) => {
				image.addEventListener( 'load', () => resolve( image ) );
				image.addEventListener( 'error', () => reject( image ) );
				document.body.appendChild( image );
			} );
		}
	} );

	// TODO move to Resizer tests.
	describe( 'Resizer', () => {
		it( 'uses rounded (int) values', async () => {
			setData( editor.model, `<paragraph>foo</paragraph>[<image src="${ IMAGE_SRC_FIXTURE }"></image>]` );

			widget = viewDocument.getRoot().getChild( 1 );

			await generateResizeTest( {
				expectedWidth: 97,
				// Makes it resize the image to 97.2188px, unless there's a rounding.
				pointerOffset: {
					x: 7.3,
					y: -1
				},
				resizerPosition: 'bottom-left',
				checkBeforeMouseUp( domFigure, domResizeWrapper ) {
					expect( domFigure.style.width ).to.match( /^\d\dpx$/ );
					expect( domResizeWrapper.style.width ).to.match( /^\d\dpx$/ );
				}
			} )();

			expect( editor.model.document.getRoot().getChild( 1 ).getAttribute( 'width' ) ).to.match( /^\d\dpx$/ );
		} );

		it( 'hides the resize wrapper when its disabled', () => {
			setData( editor.model, `<paragraph>foo</paragraph>[<image src="${ IMAGE_SRC_FIXTURE }"></image>]` );

			const resizer = getFirstResizer( editor );
			const resizerWrapper = editor.ui.getEditableElement().querySelector( '.ck-widget__resizer' );

			expect( resizerWrapper.style.display ).to.equal( '' );

			resizer.isEnabled = false;

			expect( resizerWrapper.style.display ).to.equal( 'none' );
		} );
	} );

	function isVisible( element ) {
		// Checks if the DOM element is visible to the end user.
		return element.offsetParent !== null && !element.classList.contains( 'ck-hidden' );
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
			const domResizeHandle = domResizeWrapper.querySelector( `.ck-widget__resizer__handle-${ options.resizerPosition }` );
			const domFigure = view.domConverter.mapViewToDom( widget );
			const domImage = domFigure.querySelector( 'img' );
			const imageRect = new Rect( domImage );
			const resizerPositionParts = options.resizerPosition.split( '-' );

			const modelRegExp = options.modelRegExp ? options.modelRegExp :
				/<paragraph>foo<\/paragraph><image src=".+?" width="([\d]+)px"><\/image>/;

			focusEditor( editor );

			const initialPointerPosition = {
				pageX: imageRect.left,
				pageY: imageRect.top
			};

			if ( resizerPositionParts.includes( 'right' ) ) {
				initialPointerPosition.pageX = imageRect.right;
			}

			if ( resizerPositionParts.includes( 'bottom' ) ) {
				initialPointerPosition.pageY = imageRect.bottom;
			}

			const finishPointerPosition = Object.assign( {}, initialPointerPosition );

			finishPointerPosition.pageX += options.pointerOffset.x || 0;
			finishPointerPosition.pageY += options.pointerOffset.y || 0;

			fireMouseEvent( domResizeHandle, 'mousedown', initialPointerPosition );
			fireMouseEvent( domResizeHandle, 'mousemove', initialPointerPosition );

			// We need to wait as mousemove events are throttled.
			return wait( 40 )
				.then( () => {
					fireMouseEvent( domResizeHandle, 'mousemove', finishPointerPosition );

					expect( parseInt( domFigure.style.width ) ).to.be.closeTo( options.expectedWidth, 2, 'DOM width check' );

					if ( options.checkBeforeMouseUp ) {
						options.checkBeforeMouseUp( domFigure, domResizeWrapper );
					}

					fireMouseEvent( domResizeHandle, 'mouseup', finishPointerPosition );

					expect( getData( editor.model, {
						withoutSelection: true
					} ) ).to.match( modelRegExp );

					const modelItem = options.getModel ? options.getModel() : editor.model.document.getRoot().getChild( 1 );
					const modelWidth = modelItem.getAttribute( 'width' );

					expect( parseFloat( modelWidth, 0 ) )
						.to.be.closeTo( options.expectedWidth, 2, 'Model width check' );
				} );
		};
	}

	function focusEditor( editor ) {
		editor.editing.view.focus();
		editor.ui.focusTracker.isFocused = true;
	}

	function getFirstResizer( editor ) {
		return Array.from( editor.plugins.get( 'WidgetResize' ).resizersByWrapper.values() )[ 0 ];
	}
} );
