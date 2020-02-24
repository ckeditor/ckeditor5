/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
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
import ImageToolbar from '../src/imagetoolbar';
import ImageTextAlternative from '../src/imagetextalternative';
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

	afterEach( () => {
		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor ) {
			return editor.destroy();
		}
	} );

	describe( 'conversion', () => {
		beforeEach( () => createEditor() );

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
		beforeEach( () => createEditor() );

		it( 'allows the width attribute', () => {
			expect( editor.model.schema.checkAttribute( 'image', 'width' ) ).to.be.true;
		} );

		it( 'defines width as a formatting attribute', () => {
			expect( editor.model.schema.getAttributeProperties( 'width' ) ).to.have.property( 'isFormatting', true );
		} );
	} );

	describe( 'command', () => {
		beforeEach( () => createEditor() );

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

			const resizer = getSelectedImageResizer( editor );

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

			const resizer = getSelectedImageResizer( editor );
			const resizerWrapper = editor.ui.getEditableElement().querySelector( '.ck-widget__resizer' );

			expect( resizer.isEnabled ).to.be.false;
			expect( resizerWrapper.style.display ).to.equal( 'none' );
		} );
	} );

	describe( 'visual resizers', () => {
		beforeEach( async () => {
			await createEditor();

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
		beforeEach( async () => {
			await createEditor();

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
		beforeEach( async () => {
			await createEditor();

			setData( editor.model, `<paragraph>foo</paragraph>[<image imageStyle="side" src="${ IMAGE_SRC_FIXTURE }"></image>]` );

			widget = viewDocument.getRoot().getChild( 1 );
		} );

		it( 'shrinks correctly with left-bottom handler', generateSideResizeTest( {
			expectedWidth: 80,
			pointerOffset: {
				x: 20,
				y: -10
			},
			resizerPosition: 'bottom-left'
		} ) );

		it( 'shrinks correctly with right-bottom handler', generateSideResizeTest( {
			expectedWidth: 80,
			pointerOffset: {
				x: -20,
				y: -10
			},
			resizerPosition: 'bottom-right'
		} ) );

		it( 'shrinks correctly with left-top handler', generateSideResizeTest( {
			expectedWidth: 80,
			pointerOffset: {
				x: 20,
				y: 10
			},
			resizerPosition: 'top-left'
		} ) );

		it( 'shrinks correctly with right-top handler', generateSideResizeTest( {
			expectedWidth: 80,
			pointerOffset: {
				x: -20,
				y: 10
			},
			resizerPosition: 'top-right'
		} ) );

		it( 'enlarges correctly with left-bottom handler', generateSideResizeTest( {
			expectedWidth: 120,
			pointerOffset: {
				x: -10,
				y: 10
			},
			resizerPosition: 'bottom-left'
		} ) );

		it( 'enlarges correctly with right-bottom handler', generateSideResizeTest( {
			expectedWidth: 120,
			pointerOffset: {
				x: 10,
				y: 10
			},
			resizerPosition: 'bottom-right'
		} ) );

		it( 'enlarges correctly with right-bottom handler, y axis only', generateSideResizeTest( {
			expectedWidth: 140,
			pointerOffset: {
				x: 0,
				y: 20
			},
			resizerPosition: 'bottom-right'
		} ) );

		it( 'enlarges correctly with right-bottom handler, x axis only', generateSideResizeTest( {
			expectedWidth: 140,
			pointerOffset: {
				x: 40,
				y: 0
			},
			resizerPosition: 'bottom-right'
		} ) );

		it( 'enlarges correctly with left-top handler', generateSideResizeTest( {
			expectedWidth: 120,
			pointerOffset: {
				x: -20,
				y: -10
			},
			resizerPosition: 'top-left'
		} ) );

		it( 'enlarges correctly with right-top handler', generateSideResizeTest( {
			expectedWidth: 120,
			pointerOffset: {
				x: 20,
				y: 10
			},
			resizerPosition: 'top-right'
		} ) );

		it( 'doesn\'t flicker at the beginning of the resize', async () => {
			// (#5189)
			const resizerPosition = 'bottom-left';
			const domParts = getWidgetDomParts( widget, resizerPosition );
			const initialPointerPosition = getResizerCoordinates( domParts.figure, resizerPosition );
			const resizeWrapperView = widget.getChild( 1 );

			focusEditor( editor );
			fireMouseEvent( domParts.resizeHandle, 'mousedown', initialPointerPosition );

			await wait( 40 );

			fireMouseEvent( domParts.resizeHandle, 'mousemove', initialPointerPosition );

			expect( resizeWrapperView.getStyle( 'width' ) ).to.be.equal( '100px' );

			fireMouseEvent( domParts.resizeHandle, 'mouseup', initialPointerPosition );
		} );

		it( 'makes no change when clicking the handle without drag', () => {
			const resizerPosition = 'bottom-left';
			const expectedWidth = 100;
			const domParts = getWidgetDomParts( widget, resizerPosition );
			const initialPointerPosition = getResizerCoordinates( domParts.figure, resizerPosition );

			focusEditor( editor );
			fireMouseEvent( domParts.resizeHandle, 'mousedown', initialPointerPosition );

			expect( getDomWidth( domParts.figure ), 'DOM width check' ).to.be.closeTo( expectedWidth, 2 );

			fireMouseEvent( domParts.resizeHandle, 'mouseup', initialPointerPosition );

			const modelItem = editor.model.document.getRoot().getChild( 1 );

			expect( modelItem.getAttribute( 'width' ), 'model width attribute' ).to.be.undefined;
		} );

		function generateSideResizeTest( options ) {
			return generateResizeTest( Object.assign( {
				modelRegExp: /<paragraph>foo<\/paragraph><image imageStyle="side" src=".+?" width="([\d.]+)px"><\/image>/
			}, options ) );
		}
	} );

	describe( 'percent resizing', () => {
		beforeEach( () => createEditor( {
			plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResize ]
		} ) );

		describe( 'standard image', () => {
			beforeEach( () => {
				setData( editor.model, `<paragraph>foo</paragraph>[<image src="${ IMAGE_SRC_FIXTURE }"></image>]` );

				widget = viewDocument.getRoot().getChild( 1 );
			} );

			it( 'shrinks correctly with left-bottom handler', generateResizeTest( {
				expectedWidth: 16,
				modelRegExp: /<paragraph>foo<\/paragraph><image src=".+?" width="([\d]{2}(?:\.[\d]{1,2}))%"><\/image>/,
				pointerOffset: {
					x: 10,
					y: -10
				},
				resizerPosition: 'bottom-left'
			} ) );

			it( 'enlarges correctly with right-bottom handler', generateResizeTest( {
				expectedWidth: 22,
				modelRegExp: /<paragraph>foo<\/paragraph><image src=".+?" width="([\d]{2}(?:\.[\d]{1,2}))%"><\/image>/,
				pointerOffset: {
					x: 0,
					y: 5
				},
				resizerPosition: 'bottom-right'
			} ) );

			it( 'enlarges correctly an image with unsupported width unit', async () => {
				setData( editor.model, `<paragraph>foo</paragraph>[<image src="${ IMAGE_SRC_FIXTURE }" width="50pt"></image>]` );

				widget = viewDocument.getRoot().getChild( 1 );

				await generateResizeTest( {
					expectedWidth: 15,
					modelRegExp: /<paragraph>foo<\/paragraph><image src=".+?" width="([\d]{2}(?:\.[\d]{1,2}))%"><\/image>/,
					pointerOffset: {
						x: 0,
						y: 5
					},
					resizerPosition: 'bottom-right'
				} )();
			} );
		} );

		describe( 'side image', () => {
			beforeEach( () => {
				setData( editor.model, `<paragraph>foo</paragraph>[<image imageStyle="side" src="${ IMAGE_SRC_FIXTURE }"></image>]` );

				view = editor.editing.view;
				viewDocument = view.document;
				widget = viewDocument.getRoot().getChild( 1 );
			} );

			it( 'shrinks correctly with left-bottom handler', generateResizeTest( {
				expectedWidth: 18,
				modelRegExp: /<paragraph>foo<\/paragraph><image imageStyle="side" src=".+?" width="([\d]{2}(?:\.[\d]{1,2}))%"><\/image>/,
				pointerOffset: {
					x: 10,
					y: -10
				},
				resizerPosition: 'bottom-left'
			} ) );
		} );
	} );

	describe( 'undo integration', () => {
		beforeEach( async () => {
			await createEditor();

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
		beforeEach( async () => {
			await createEditor();

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
		let images = [];

		before( () => {
			return Promise.all( [
				preloadImage( imageBaseUrl ),
				preloadImage( imageBaseUrl + '?a' ),
				preloadImage( imageBaseUrl + '?b' ),
				preloadImage( imageBaseUrl + '?c' )
			] ).then( loadedImages => {
				images = loadedImages;
			} );
		} );

		after( () => {
			for ( const image of images ) {
				image.remove();
			}
		} );

		beforeEach( async () => {
			await createEditor();

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
		beforeEach( () => createEditor() );

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

			const resizer = getSelectedImageResizer( editor );
			const resizerWrapper = editor.ui.getEditableElement().querySelector( '.ck-widget__resizer' );

			expect( resizerWrapper.style.display ).to.equal( '' );

			resizer.isEnabled = false;

			expect( resizerWrapper.style.display ).to.equal( 'none' );
		} );
	} );

	describe( 'widget toolbar integration', () => {
		let widgetToolbarRepository;

		beforeEach( async () => {
			await createEditor( {
				plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResize, ImageToolbar, ImageTextAlternative ],
				image: {
					toolbar: [ 'imageTextAlternative' ],
					resizeUnit: 'px'
				}
			} );

			setData( editor.model, `<paragraph>foo</paragraph>[<image src="${ IMAGE_SRC_FIXTURE }"></image>]` );

			widget = viewDocument.getRoot().getChild( 1 );

			widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
		} );

		it( 'default toolbar visibility', async () => {
			expect( widgetToolbarRepository.isEnabled ).to.be.true;
		} );

		it( 'visibility during the resize', async () => {
			await generateResizeTest( {
				expectedWidth: 100,
				modelRegExp: /.+/,
				pointerOffset: {
					x: 0,
					y: 0
				},
				resizerPosition: 'bottom-right',
				checkBeforeMouseUp: () => {
					expect( widgetToolbarRepository.isEnabled ).to.be.false;
				}
			} )();
		} );

		it( 'visibility after the resize', async () => {
			await generateResizeTest( {
				expectedWidth: 100,
				modelRegExp: /.+/,
				pointerOffset: {
					x: 0,
					y: 0
				},
				resizerPosition: 'bottom-right'
			} )();

			expect( widgetToolbarRepository.isEnabled ).to.be.true;
		} );

		it( 'visibility after the resize was canceled', async () => {
			const resizer = getSelectedImageResizer( editor );

			await generateResizeTest( {
				expectedWidth: 100,
				modelRegExp: /.+/,
				pointerOffset: {
					x: 0,
					y: 0
				},
				resizerPosition: 'bottom-right',
				checkBeforeMouseUp: () => {
					resizer.cancel();
					expect( widgetToolbarRepository.isEnabled ).to.be.true;
				}
			} )();
		} );

		it( 'restores toolbar when clicking the handle without drag', () => {
			// (https://github.com/ckeditor/ckeditor5-widget/pull/112#pullrequestreview-337725256).
			const resizerPosition = 'bottom-left';
			const domParts = getWidgetDomParts( widget, resizerPosition );
			const initialPointerPosition = getResizerCoordinates( domParts.figure, resizerPosition );

			focusEditor( editor );
			fireMouseEvent( domParts.resizeHandle, 'mousedown', initialPointerPosition );
			fireMouseEvent( domParts.resizeHandle, 'mouseup', initialPointerPosition );

			expect( widgetToolbarRepository.isEnabled ).to.be.true;
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
		// Returns a test case that puts
		return async function() {
			const domParts = getWidgetDomParts( widget, options.resizerPosition );
			const domResizeWrapper = view.domConverter.mapViewToDom( widget.getChild( 1 ) );

			const modelRegExp = options.modelRegExp ? options.modelRegExp :
				/<paragraph>foo<\/paragraph><image src=".+?" width="([\d]+)px"><\/image>/;

			focusEditor( editor );

			const initialPointerPosition = getResizerCoordinates( domParts.figure, options.resizerPosition );

			fireMouseEvent( domParts.resizeHandle, 'mousedown', initialPointerPosition );
			fireMouseEvent( domParts.resizeHandle, 'mousemove', initialPointerPosition );

			// We need to wait as mousemove events are throttled.
			await wait( 40 );

			const finishPointerPosition = Object.assign( {}, initialPointerPosition );

			finishPointerPosition.pageX += options.pointerOffset.x || 0;
			finishPointerPosition.pageY += options.pointerOffset.y || 0;

			fireMouseEvent( domParts.resizeHandle, 'mousemove', finishPointerPosition );

			expect( parseInt( domParts.figure.style.width ) ).to.be.closeTo( options.expectedWidth, 2, 'DOM width check' );

			if ( options.checkBeforeMouseUp ) {
				options.checkBeforeMouseUp( domParts.figure, domResizeWrapper );
			}

			fireMouseEvent( domParts.resizeHandle, 'mouseup', finishPointerPosition );

			expect( getData( editor.model, {
				withoutSelection: true
			} ) ).to.match( modelRegExp );

			const modelItem = options.getModel ? options.getModel() : editor.model.document.getRoot().getChild( 1 );
			const modelWidth = modelItem.getAttribute( 'width' );

			expect( parseFloat( modelWidth, 0 ) )
				.to.be.closeTo( options.expectedWidth, 2, 'Model width check' );
		};
	}

	function focusEditor( editor ) {
		editor.editing.view.focus();
		editor.ui.focusTracker.isFocused = true;
	}

	function getResizerCoordinates( domFigure, resizerPosition ) {
		const domImage = domFigure.querySelector( 'img' );
		const imageRect = new Rect( domImage );
		const initialPointerPosition = {
			pageX: imageRect.left,
			pageY: imageRect.top
		};
		const resizerPositionParts = resizerPosition.split( '-' );

		if ( resizerPositionParts.includes( 'right' ) ) {
			initialPointerPosition.pageX = imageRect.right;
		}

		if ( resizerPositionParts.includes( 'bottom' ) ) {
			initialPointerPosition.pageY = imageRect.bottom;
		}

		return initialPointerPosition;
	}

	function getWidgetDomParts( widget, resizerPosition ) {
		const resizeWrapper = view.domConverter.mapViewToDom( widget.getChild( 1 ) );
		const resizeHandle = resizeWrapper.querySelector( `.ck-widget__resizer__handle-${ resizerPosition }` );
		const figure = view.domConverter.mapViewToDom( widget );

		return {
			resizeWrapper,
			resizeHandle,
			figure
		};
	}

	function getDomWidth( domElement ) {
		return new Rect( domElement ).width;
	}

	function getSelectedImageResizer( editor ) {
		return editor.plugins.get( 'WidgetResize' )._getResizerByViewElement(
			editor.editing.view.document.selection.getSelectedElement()
		);
	}

	function createEditor( config ) {
		editorElement = document.createElement( 'div' );

		absoluteContainer.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, config || {
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
	}
} );
