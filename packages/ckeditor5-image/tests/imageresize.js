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

import { mouseMock, getWidgetDomParts, getHandleCenterPoint } from '@ckeditor/ckeditor5-widget/tests/widgetresize/_utils/utils';

describe( 'ImageResize', () => {
	// 100x50 black png image
	const IMAGE_SRC_FIXTURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAQAAAAAPLY1AAAAQklEQVR42u3PQREAAAgDoK1/' +
		'aM3g14MGNJMXKiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiJysRFNMgH0RpujAAAAAElFTkSuQmCC';

	let absoluteContainer, widget, editor, view, viewDocument, editorElement;

	before( () => {
		// This container is required to position editor element in a reliable element.
		// @todo ensure whether it's required after migrating the tests.
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

		it( 'doesn\'t downcast consumed tokens', () => {
			editor.conversion.for( 'downcast' ).add( dispatcher =>
				dispatcher.on( 'attribute:width:image', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, 'attribute:width:image' );
				}, { priority: 'high' } )
			);
			setData( editor.model, `<image src="${ IMAGE_SRC_FIXTURE }" width="50%"></image>` );

			expect( editor.getData() )
				.to.equal( `<figure class="image"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
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
			const spy = sinon.spy( editor.commands.get( 'imageResize' ), 'execute' );

			setData( editor.model, `<paragraph>foo</paragraph>[<image src="${ IMAGE_SRC_FIXTURE }"></image>]` );
			widget = viewDocument.getRoot().getChild( 1 );
			const domParts = getWidgetDomParts( editor, widget, 'bottom-left' );

			const finalPointerPosition = getHandleCenterPoint( domParts.widget, 'bottom-left' ).moveBy( 10, -10 );

			focusEditor( editor );
			mouseMock.dragTo( editor, domParts.resizeHandle, finalPointerPosition );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 0 ] ).to.deep.equal( { width: '80px' } );
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

	describe( 'side image resizing', () => {
		beforeEach( () => createEditor() );

		beforeEach( () => {
			setData( editor.model, `<paragraph>foo</paragraph>[<image imageStyle="side" src="${ IMAGE_SRC_FIXTURE }"></image>]` );

			widget = viewDocument.getRoot().getChild( 1 );
		} );

		it( 'doesn\'t flicker at the beginning of the resize', async () => {
			// (#5189)
			const resizerPosition = 'bottom-left';
			const domParts = getWidgetDomParts( editor, widget, resizerPosition );
			const initialPointerPosition = getHandleCenterPoint( domParts.widget, resizerPosition );
			const resizeWrapperView = widget.getChild( 1 );

			focusEditor( editor );
			mouseMock.down( editor, domParts.resizeHandle );

			await wait( 40 );

			mouseMock.move( editor, domParts.resizeHandle, null, initialPointerPosition );

			expect( resizeWrapperView.getStyle( 'width' ) ).to.be.equal( '100px' );

			mouseMock.up( editor );
		} );

		it( 'makes no change when clicking the handle without drag', () => {
			const resizerPosition = 'bottom-left';
			const expectedWidth = 100;
			const domParts = getWidgetDomParts( editor, widget, resizerPosition );

			focusEditor( editor );
			mouseMock.down( editor, domParts.resizeHandle );

			expect( getDomWidth( domParts.widget ), 'DOM width check' ).to.be.closeTo( expectedWidth, 2 );

			mouseMock.up( editor );

			const modelItem = editor.model.document.getRoot().getChild( 1 );

			expect( modelItem.getAttribute( 'width' ), 'model width attribute' ).to.be.undefined;
		} );
	} );

	describe( 'undo integration', () => {
		beforeEach( () => createEditor() );

		beforeEach( () => {
			setData( editor.model, `<paragraph>foo</paragraph>[<image src="${ IMAGE_SRC_FIXTURE }"></image>]` );

			widget = viewDocument.getRoot().getChild( 1 );
		} );

		it( 'has correct border size after undo', async () => {
			const domParts = getWidgetDomParts( editor, widget, 'bottom-left' );
			const initialPosition = getHandleCenterPoint( domParts.widget, 'bottom-left' );
			const finalPointerPosition = initialPosition.clone().moveBy( 0, 10 );

			focusEditor( editor );

			mouseMock.dragTo( editor, domParts.resizeHandle, {
				from: initialPosition,
				to: finalPointerPosition
			} );

			expect( '120px' ).to.be.equal( domParts.widget.style.width );

			editor.commands.get( 'undo' ).execute();

			await wait( 180 ); // ui#update event is throttled.

			const resizerWrapper = document.querySelector( '.ck-widget__resizer' );
			const shadowBoundingRect = resizerWrapper.getBoundingClientRect();

			expect( shadowBoundingRect.width ).to.be.equal( 100 );
			expect( shadowBoundingRect.height ).to.be.equal( 50 );
		} );
	} );

	describe( 'table integration', () => {
		beforeEach( () => createEditor() );

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
		beforeEach( () => createEditor() );

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

	describe( 'widget toolbar integration', () => {
		let widgetToolbarRepository;

		beforeEach( () => createEditor( {
			plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResize, ImageToolbar, ImageTextAlternative ],
			image: {
				toolbar: [ 'imageTextAlternative' ],
				resizeUnit: 'px'
			}
		} ) );

		beforeEach( async () => {
			setData( editor.model, `<paragraph>foo</paragraph>[<image src="${ IMAGE_SRC_FIXTURE }"></image>]` );

			widget = viewDocument.getRoot().getChild( 1 );

			widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
		} );

		it( 'default toolbar visibility', async () => {
			expect( widgetToolbarRepository.isEnabled ).to.be.true;
		} );

		it( 'visibility during the resize', async () => {
			const domResizeHandle = getWidgetDomParts( editor, widget, 'bottom-left' ).resizeHandle;

			focusEditor( editor );
			mouseMock.down( editor, domResizeHandle );

			expect( widgetToolbarRepository.isEnabled ).to.be.false;

			mouseMock.up( editor, domResizeHandle );
		} );

		it( 'visibility after the resize', async () => {
			const domResizeHandle = getWidgetDomParts( editor, widget, 'bottom-left' ).resizeHandle;

			focusEditor( editor );
			mouseMock.down( editor, domResizeHandle );
			mouseMock.up( editor, domResizeHandle );

			expect( widgetToolbarRepository.isEnabled ).to.be.true;
		} );

		it( 'visibility after the resize was canceled', async () => {
			const resizer = getSelectedImageResizer( editor );
			const domResizeHandle = getWidgetDomParts( editor, widget, 'bottom-left' ).resizeHandle;

			focusEditor( editor );
			mouseMock.down( editor, domResizeHandle );

			resizer.cancel();
			expect( widgetToolbarRepository.isEnabled ).to.be.true;
		} );

		it( 'restores toolbar when clicking the handle without drag', () => {
			// (https://github.com/ckeditor/ckeditor5-widget/pull/112#pullrequestreview-337725256).
			const domResizeHandle = getWidgetDomParts( editor, widget, 'bottom-left' ).resizeHandle;

			focusEditor( editor );
			mouseMock.down( editor, domResizeHandle );
			mouseMock.up( editor, domResizeHandle );

			expect( widgetToolbarRepository.isEnabled ).to.be.true;
		} );
	} );

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
			const domParts = getWidgetDomParts( editor, widget, options.resizerPosition );
			const domResizeWrapper = view.domConverter.mapViewToDom( widget.getChild( 1 ) );

			const modelRegExp = options.modelRegExp ? options.modelRegExp :
				/<paragraph>foo<\/paragraph><image src=".+?" width="([\d]+)px"><\/image>/;

			focusEditor( editor );

			const initialPointerPosition = getHandleCenterPoint( domParts.widget, options.resizerPosition );

			mouseMock.down( editor, domParts.resizeHandle );
			mouseMock.move( editor, domParts.resizeHandle, null, initialPointerPosition );

			// We need to wait as mousemove events are throttled.
			await wait( 40 );

			const finishPointerPosition = initialPointerPosition.moveBy( options.pointerOffset.x || 0, options.pointerOffset.y || 0 );

			mouseMock.move( editor, domParts.resizeHandle, null, finishPointerPosition );

			expect( parseInt( domParts.widget.style.width ) ).to.be.closeTo( options.expectedWidth, 2, 'DOM width check' );

			if ( options.checkBeforeMouseUp ) {
				options.checkBeforeMouseUp( domParts.widget, domResizeWrapper );
			}

			mouseMock.up( editor );

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
