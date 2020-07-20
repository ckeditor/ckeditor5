/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

// ClassicTestEditor can't be used, as it doesn't handle the focus, which is needed to test resizer visual cues.
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Image from '../../src/image';
import ImageToolbar from '../../src/imagetoolbar';
import ImageResizeEditing from '../../src/imageresize/imageresizeediting';
import ImageResizeHandles from '../../src/imageresize/imageresizehandles';
import ImageTextAlternative from '../../src/imagetextalternative';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ImageStyle from '../../src/imagestyle';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Table from '@ckeditor/ckeditor5-table/src/table';

import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import {
	focusEditor,
	resizerMouseSimulator,
	getWidgetDomParts,
	getHandleCenterPoint
} from '@ckeditor/ckeditor5-widget/tests/widgetresize/_utils/utils';

import WidgetResize from '@ckeditor/ckeditor5-widget/src/widgetresize';

describe( 'ImageResizeHandles', () => {
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

	beforeEach( () => createEditor() );

	afterEach( () => {
		const wrappers = Array.from( document.querySelectorAll( '.ck-body-wrapper' ) );

		// We need to remove all leftovers manually.
		for ( const wrapper of wrappers ) {
			wrapper.remove();
		}

		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor ) {
			editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( ImageResizeHandles.pluginName ).to.equal( 'ImageResizeHandles' );
	} );

	it( 'uses percents by default', async () => {
		const localEditor = await createEditor( {
			plugins: [ Image, ImageResizeEditing, ImageResizeHandles ]
		} );

		const attachToSpy = sinon.spy( localEditor.plugins.get( WidgetResize ), 'attachTo' );

		setData( localEditor.model, `[<image imageStyle="side" src="${ IMAGE_SRC_FIXTURE }"></image>]` );

		expect( attachToSpy.args[ 0 ][ 0 ] ).to.have.a.property( 'unit', '%' );

		attachToSpy.restore();
	} );

	describe( 'command', () => {
		it( 'uses the command on commit', () => {
			const spy = sinon.spy( editor.commands.get( 'imageResize' ), 'execute' );

			setData( editor.model, `<paragraph>foo</paragraph>[<image src="${ IMAGE_SRC_FIXTURE }"></image>]` );
			widget = viewDocument.getRoot().getChild( 1 );
			const domParts = getWidgetDomParts( editor, widget, 'bottom-left' );

			const finalPointerPosition = getHandleCenterPoint( domParts.widget, 'bottom-left' ).moveBy( 10, -10 );

			resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, finalPointerPosition );

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
		beforeEach( async () => {
			await createEditor();

			setData( editor.model, `<paragraph>foo</paragraph>[<image imageStyle="side" src="${ IMAGE_SRC_FIXTURE }"></image>]` );

			widget = viewDocument.getRoot().getChild( 1 );
		} );

		it( 'doesn\'t flicker at the beginning of the resize', async () => {
			// (#5189)
			const resizerPosition = 'bottom-left';
			const domParts = getWidgetDomParts( editor, widget, resizerPosition );
			const initialPointerPosition = getHandleCenterPoint( domParts.widget, resizerPosition );
			const resizeWrapperView = widget.getChild( 2 );

			resizerMouseSimulator.down( editor, domParts.resizeHandle );

			resizerMouseSimulator.move( editor, domParts.resizeHandle, null, initialPointerPosition );

			expect( resizeWrapperView.getStyle( 'width' ) ).to.equal( '100px' );

			resizerMouseSimulator.up( editor );
		} );

		it( 'makes no change when clicking the handle without drag', () => {
			const resizerPosition = 'bottom-left';
			const expectedWidth = 100;
			const domParts = getWidgetDomParts( editor, widget, resizerPosition );

			resizerMouseSimulator.down( editor, domParts.resizeHandle );

			expect( getDomWidth( domParts.widget ), 'DOM width check' ).to.be.closeTo( expectedWidth, 2 );

			resizerMouseSimulator.up( editor );

			const modelItem = editor.model.document.getRoot().getChild( 1 );

			expect( modelItem.getAttribute( 'width' ), 'model width attribute' ).to.be.undefined;
		} );
	} );

	describe( 'undo integration', () => {
		beforeEach( async () => {
			await createEditor();

			setData( editor.model, `<paragraph>foo</paragraph>[<image src="${ IMAGE_SRC_FIXTURE }"></image>]` );

			widget = viewDocument.getRoot().getChild( 1 );
		} );

		it( 'has correct border size after undo', async () => {
			const domParts = getWidgetDomParts( editor, widget, 'bottom-left' );
			const initialPosition = getHandleCenterPoint( domParts.widget, 'bottom-left' );
			const finalPointerPosition = initialPosition.clone().moveBy( 0, 10 );
			const plugin = editor.plugins.get( 'WidgetResize' );

			resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, {
				from: initialPosition,
				to: finalPointerPosition
			} );

			expect( '120px' ).to.equal( domParts.widget.style.width );

			editor.commands.get( 'undo' ).execute();

			// Toggle _visibleResizer to force synchronous redraw. Otherwise you'd need to wait ~200ms for
			// throttled redraw to take place, making tests slower.
			const visibleResizer = plugin._visibleResizer;
			plugin._visibleResizer = null;
			plugin._visibleResizer = visibleResizer;

			const resizerWrapper = document.querySelector( '.ck-widget__resizer' );
			const shadowBoundingRect = resizerWrapper.getBoundingClientRect();

			expect( shadowBoundingRect.width ).to.equal( 100 );
			expect( shadowBoundingRect.height ).to.equal( 50 );
		} );
	} );

	describe( 'table integration', () => {
		beforeEach( () => createEditor() );

		it( 'works when resizing in a table', () => {
			setData( editor.model,
				'<table>' +
					`<tableRow><tableCell>[<image src="${ IMAGE_SRC_FIXTURE }"></image>]</tableCell></tableRow>` +
				'</table>'
			);

			widget = viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 0 ).getChild( 0 );
			const model = editor.model.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 ).getChild( 0 );

			const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );
			const initialPosition = getHandleCenterPoint( domParts.widget, 'bottom-right' );
			const finalPointerPosition = initialPosition.clone().moveBy( -40, -20 );

			resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, {
				from: initialPosition,
				to: finalPointerPosition
			} );

			expect( model.getAttribute( 'width' ) ).to.equal( '60px' );
		} );
	} );

	describe( 'srcset integration', () => {
		// The image is 96x96 pixels.
		const imageBaseUrl = '/assets/sample.png';
		let model;
		let images = [];

		before( async () => {
			images = await Promise.all( [
				preloadImage( imageBaseUrl ),
				preloadImage( imageBaseUrl + '?a' ),
				preloadImage( imageBaseUrl + '?b' ),
				preloadImage( imageBaseUrl + '?c' )
			] );
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
			model = editor.model.document.getRoot().getChild( 0 );
		} );

		it( 'works with images containing srcset', () => {
			const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );
			const initialPosition = getHandleCenterPoint( domParts.widget, 'bottom-right' );
			const finalPointerPosition = initialPosition.clone().moveBy( -20, -20 );

			resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, {
				from: initialPosition,
				to: finalPointerPosition
			} );

			expect( model.getAttribute( 'width' ) ).to.equal( '76px' );
		} );

		it( 'retains width after removing srcset', () => {
			const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );
			const initialPosition = getHandleCenterPoint( domParts.widget, 'bottom-right' );
			const finalPointerPosition = initialPosition.clone().moveBy( -16, -16 );

			resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, {
				from: initialPosition,
				to: finalPointerPosition
			} );

			editor.model.change( writer => {
				writer.removeAttribute( 'srcset', model );
			} );

			const expectedHtml = '<figure class="image image_resized" style="width:80px;"><img src="/assets/sample.png"></figure>';
			expect( editor.getData() ).to.equal( expectedHtml );
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

		beforeEach( async () => {
			await createEditor( {
				plugins: [
					Paragraph,
					Image,
					ImageResizeEditing,
					ImageResizeHandles,
					ImageToolbar,
					ImageTextAlternative
				],
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
			const domResizeHandle = getWidgetDomParts( editor, widget, 'bottom-left' ).resizeHandle;

			resizerMouseSimulator.down( editor, domResizeHandle );

			expect( widgetToolbarRepository.isEnabled ).to.be.false;

			resizerMouseSimulator.up( editor, domResizeHandle );
		} );

		it( 'visibility after the resize', async () => {
			const domResizeHandle = getWidgetDomParts( editor, widget, 'bottom-left' ).resizeHandle;

			resizerMouseSimulator.down( editor, domResizeHandle );
			resizerMouseSimulator.up( editor, domResizeHandle );

			expect( widgetToolbarRepository.isEnabled ).to.be.true;
		} );

		it( 'visibility after the resize was canceled', async () => {
			const resizer = getSelectedImageResizer( editor );
			const domResizeHandle = getWidgetDomParts( editor, widget, 'bottom-left' ).resizeHandle;

			resizerMouseSimulator.down( editor, domResizeHandle );

			resizer.cancel();
			expect( widgetToolbarRepository.isEnabled ).to.be.true;
		} );

		it( 'restores toolbar when clicking the handle without drag', () => {
			// (https://github.com/ckeditor/ckeditor5-widget/pull/112#pullrequestreview-337725256).
			const domResizeHandle = getWidgetDomParts( editor, widget, 'bottom-left' ).resizeHandle;

			resizerMouseSimulator.down( editor, domResizeHandle );
			resizerMouseSimulator.up( editor, domResizeHandle );

			expect( widgetToolbarRepository.isEnabled ).to.be.true;
		} );
	} );

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
				plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResizeEditing, ImageResizeHandles ],
				image: {
					resizeUnit: 'px'
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				view = editor.editing.view;
				viewDocument = view.document;
				widget = viewDocument.getRoot().getChild( 1 );

				focusEditor( editor );

				return newEditor;
			} );
	}
} );
