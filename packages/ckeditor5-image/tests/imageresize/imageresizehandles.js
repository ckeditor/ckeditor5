/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// ClassicTestEditor can't be used, as it doesn't handle the focus, which is needed to test resizer visual cues.
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import HtmlEmbedEditing from '@ckeditor/ckeditor5-html-embed/src/htmlembedediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import LinkImageEditing from '@ckeditor/ckeditor5-link/src/linkimageediting.js';
import LegacyTodoList from '@ckeditor/ckeditor5-list/src/legacytodolist.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import {
	focusEditor,
	resizerMouseSimulator,
	getWidgetDomParts,
	getHandleCenterPoint
} from '@ckeditor/ckeditor5-widget/tests/widgetresize/_utils/utils.js';
import { IMAGE_SRC_FIXTURE, waitForAllImagesLoaded } from './_utils/utils.js';

import Image from '../../src/image.js';
import ImageToolbar from '../../src/imagetoolbar.js';
import ImageResizeEditing from '../../src/imageresize/imageresizeediting.js';
import ImageResizeHandles from '../../src/imageresize/imageresizehandles.js';
import ImageTextAlternative from '../../src/imagetextalternative.js';
import ImageStyle from '../../src/imagestyle.js';
import PictureEditing from '../../src/pictureediting.js';

describe( 'ImageResizeHandles', () => {
	let widget, editor, view, viewDocument, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
	} );

	afterEach( async () => {
		editorElement.remove();

		if ( editor && editor.state !== 'destroyed' ) {
			await editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( ImageResizeHandles.pluginName ).to.equal( 'ImageResizeHandles' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageResizeHandles.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageResizeHandles.isPremiumPlugin ).to.be.false;
	} );

	describe( 'for block image', () => {
		it( 'uses percents by default', async () => {
			const localEditor = await createEditor( {
				plugins: [ Image, ImageResizeEditing, ImageResizeHandles ]
			} );

			const attachToSpy = sinon.spy( localEditor.plugins.get( 'WidgetResize' ), 'attachTo' );

			await setModelAndWaitForImages( localEditor, `[<imageBlock imageStyle="side" src="${ IMAGE_SRC_FIXTURE }"></imageBlock>]` );

			expect( attachToSpy.args[ 0 ][ 0 ] ).to.have.a.property( 'unit', '%' );

			attachToSpy.restore();

			await localEditor.destroy();
		} );

		describe( 'command', () => {
			beforeEach( async () => {
				editor = await createEditor();
			} );

			it( 'uses the command on commit', async () => {
				const spy = sinon.spy( editor.commands.get( 'resizeImage' ), 'execute' );

				await setModelAndWaitForImages( editor,
					`<paragraph>foo</paragraph>[<imageBlock src="${ IMAGE_SRC_FIXTURE }"></imageBlock>]` );
				widget = viewDocument.getRoot().getChild( 1 );
				const domParts = getWidgetDomParts( editor, widget, 'bottom-left' );

				const finalPointerPosition = getHandleCenterPoint( domParts.widget, 'bottom-left' ).moveBy( 10, -10 );

				resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, finalPointerPosition );

				expect( spy.calledOnce ).to.be.true;
				expect( spy.args[ 0 ][ 0 ] ).to.deep.equal( { width: '90px' } );
			} );

			it( 'disables the resizer if the command is disabled', async () => {
				await setModelAndWaitForImages( editor,
					`<paragraph>foo</paragraph>[<imageBlock src="${ IMAGE_SRC_FIXTURE }"></imageBlock>]` );
				// Enforce selection on an image. See: https://github.com/ckeditor/ckeditor5/issues/8617.
				editor.model.change( writer => writer.setSelection( editor.model.document.getRoot().getChild( 1 ), 'on' ) );

				const resizer = getSelectedImageResizer( editor );

				let isEnabled = false;

				editor.commands.get( 'resizeImage' ).on( 'set:isEnabled', evt => {
					evt.return = isEnabled;
					evt.stop();
				}, { priority: 'highest' } );

				editor.commands.get( 'resizeImage' ).refresh();
				expect( resizer.isEnabled ).to.be.false;

				isEnabled = true;
				editor.commands.get( 'resizeImage' ).refresh();
				expect( resizer.isEnabled ).to.be.true;
			} );

			it( 'the resizer is disabled from the beginning when the command is disabled when the image is inserted', async () => {
				editor.commands.get( 'resizeImage' ).on( 'set:isEnabled', evt => {
					evt.return = false;
					evt.stop();
				}, { priority: 'highest' } );
				editor.commands.get( 'resizeImage' ).refresh();

				setData( editor.model, `[<imageBlock src="${ IMAGE_SRC_FIXTURE }"></imageBlock>]` );

				await waitForAllImagesLoaded( editor );

				const resizer = getSelectedImageResizer( editor );
				const resizerWrapper = editor.ui.getEditableElement().querySelector( '.ck-widget__resizer' );

				expect( resizer.isEnabled ).to.be.false;
				expect( resizerWrapper.classList.contains( 'ck-hidden' ) ).to.be.true;
			} );

			it( 'removes the image_resized class if the command was overriden and canceled', async () => {
				// Stub "execute" to override the command like, for instance, Track Changes would.
				const stub = sinon.stub( editor.commands.get( 'resizeImage' ), 'execute' );

				await setModelAndWaitForImages( editor,
					`<paragraph>foo</paragraph>[<imageBlock src="${ IMAGE_SRC_FIXTURE }"></imageBlock>]` );

				widget = viewDocument.getRoot().getChild( 1 );

				const domParts = getWidgetDomParts( editor, widget, 'bottom-left' );
				const finalPointerPosition = getHandleCenterPoint( domParts.widget, 'bottom-left' ).moveBy( 10, -10 );

				resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, finalPointerPosition );

				expect( stub.calledOnce ).to.be.true;
				expect( stub.args[ 0 ][ 0 ] ).to.deep.equal( { width: '90px' } );

				expect( widget.hasClass( 'image_resized' ), 'CSS class' ).to.be.false;
				expect( widget.hasStyle( 'width' ), 'width style' ).to.be.false;
			} );
		} );

		describe( 'side image resizing', () => {
			beforeEach( async () => {
				editor = await createEditor();

				await setModelAndWaitForImages( editor,
					`<paragraph>foo</paragraph>[<imageBlock imageStyle="side" src="${ IMAGE_SRC_FIXTURE }"></imageBlock>]` );

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

				expect( modelItem.getAttribute( 'resizedWidth' ), 'model width attribute' ).to.be.undefined;
			} );
		} );

		describe( 'undo integration', () => {
			beforeEach( async () => {
				editor = await createEditor();

				await setModelAndWaitForImages( editor,
					`<paragraph>foo</paragraph>[<imageBlock src="${ IMAGE_SRC_FIXTURE }"></imageBlock>]` );
				// Enforce selection on an image. See: https://github.com/ckeditor/ckeditor5/issues/8617.
				editor.model.change( writer => writer.setSelection( editor.model.document.getRoot().getChild( 1 ), 'on' ) );

				widget = viewDocument.getRoot().getChild( 1 );
			} );

			it( 'has correct border size after undo', () => {
				const domParts = getWidgetDomParts( editor, widget, 'bottom-left' );
				const initialPosition = getHandleCenterPoint( domParts.widget, 'bottom-left' );
				const finalPointerPosition = initialPosition.clone().moveBy( 0, 10 );
				const plugin = editor.plugins.get( 'WidgetResize' );

				resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, {
					from: initialPosition,
					to: finalPointerPosition
				} );

				expect( domParts.widget.style.width ).to.equal( '120px' );

				editor.commands.get( 'undo' ).execute();

				// Toggle _visibleResizer to force synchronous redraw. Otherwise you'd need to wait ~200ms for
				// throttled redraw to take place, making tests slower.
				for ( const [ , resizer ] of plugin._resizers.entries() ) {
					resizer.redraw();
				}

				const resizerWrapper = document.querySelector( '.ck-widget__resizer' );
				const shadowBoundingRect = resizerWrapper.getBoundingClientRect();

				expect( shadowBoundingRect.width ).to.equal( 100 );
				expect( shadowBoundingRect.height ).to.equal( 50 );
			} );

			it( 'doesn\'t show resizers when undoing to multiple images', async () => {
				// Based on https://github.com/ckeditor/ckeditor5/pull/8108#issuecomment-695949745.
				await setModelAndWaitForImages( editor,
					`[<imageBlock src="${ IMAGE_SRC_FIXTURE }"></imageBlock><imageBlock src="${ IMAGE_SRC_FIXTURE }"></imageBlock>]` );

				const paragraph = editor.model.change( writer => {
					return writer.createElement( 'paragraph' );
				} );
				editor.model.insertContent( paragraph );

				// Undo to go back to two, selected images.
				editor.commands.get( 'undo' ).execute();

				for ( let i = 0; i < 2; i++ ) {
					widget = viewDocument.getRoot().getChild( i );
					const domImage = getWidgetDomParts( editor, widget, 'bottom-right' ).widget.querySelector( 'img' );
					viewDocument.fire( 'imageLoaded', { target: domImage } );

					const domResizeWrapper = getWidgetDomParts( editor, widget, 'bottom-left' ).resizeWrapper;

					expect( domResizeWrapper.getBoundingClientRect().height ).to.equal( 0 );
				}
			} );
		} );

		describe( 'table integration', () => {
			it( 'works when resizing in a table', async () => {
				editor = await createEditor();

				await setModelAndWaitForImages( editor,
					'<table>' +
						`<tableRow><tableCell>[<imageBlock src="${ IMAGE_SRC_FIXTURE }"></imageBlock>]</tableCell></tableRow>` +
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

				expect( model.getAttribute( 'resizedWidth' ) ).to.equal( '60px' );
			} );
		} );

		it( 'doesn\'t create multiple resizers for a single image widget', async () => {
			// https://github.com/ckeditor/ckeditor5/pull/8108#issuecomment-708302992
			editor = await createEditor();
			await setModelAndWaitForImages( editor, `[<imageBlock src="${ IMAGE_SRC_FIXTURE }"></imageBlock>]` );
			widget = viewDocument.getRoot().getChild( 0 );

			const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );
			const alternativeImageFixture =
				'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

			// Change the image so that load event triggers for the same img element again.
			domParts.widget.querySelector( 'img' ).src = alternativeImageFixture;
			await waitForAllImagesLoaded( editor );

			expect( domParts.widget.querySelectorAll( '.ck-widget__resizer' ).length ).to.equal( 1 );
		} );

		it( 'only creates a resizer after the image is loaded', async () => {
			// https://github.com/ckeditor/ckeditor5/issues/8088
			editor = await createEditor();
			setData( editor.model, `[<imageBlock src="${ IMAGE_SRC_FIXTURE }"></imageBlock>]` );
			widget = viewDocument.getRoot().getChild( 0 );
			const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );

			expect( domParts.widget.querySelectorAll( '.ck-widget__resizer' ).length ).to.equal( 0 );

			await waitForAllImagesLoaded( editor );
			expect( domParts.widget.querySelectorAll( '.ck-widget__resizer' ).length ).to.equal( 1 );
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
				editor = await createEditor();

				editor.setData(
					`<figure class="image">
						<img src="${ imageBaseUrl }"
							srcset="${ imageBaseUrl }?a 110w,
								${ imageBaseUrl }?b 440w,
								${ imageBaseUrl }?c 1025w"
							sizes="100vw" width="96">
					</figure>`
				);

				await waitForAllImagesLoaded( editor );

				widget = viewDocument.getRoot().getChild( 0 );
				model = editor.model.document.getRoot().getChild( 0 );
			} );

			it( 'works with images containing srcset', async () => {
				const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );
				const initialPosition = getHandleCenterPoint( domParts.widget, 'bottom-right' );
				const finalPointerPosition = initialPosition.clone().moveBy( -20, -20 );

				resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, {
					from: initialPosition,
					to: finalPointerPosition
				} );

				expect( model.getAttribute( 'resizedWidth' ) ).to.equal( '76px' );
			} );

			it( 'retains width after removing srcset', async () => {
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

				const expectedHtml = '<figure class="image image_resized" style="width:80px;">' +
					'<img src="/assets/sample.png" width="96">' +
				'</figure>';
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
				editor = await createEditor( {
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

				await setModelAndWaitForImages( editor,
					`<paragraph>foo</paragraph>[<imageBlock src="${ IMAGE_SRC_FIXTURE }"></imageBlock>]` );

				// Enforce selection on an image. See: https://github.com/ckeditor/ckeditor5/issues/8617.
				editor.model.change( writer => writer.setSelection( editor.model.document.getRoot().getChild( 1 ), 'on' ) );

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

		describe( 'Link image integration', () => {
			it( 'should attach the resizer to the image inside the link', async () => {
				editor = await createEditor( {
					plugins: [ Image, ImageResizeEditing, ImageResizeHandles, LinkImageEditing ]
				} );

				const attachToSpy = sinon.spy( editor.plugins.get( 'WidgetResize' ), 'attachTo' );

				setData( editor.model,
					`[<imageBlock linkHref="http://ckeditor.com" src="${ IMAGE_SRC_FIXTURE }" alt="alt text"></imageBlock>]` );

				await waitForAllImagesLoaded( editor );

				expect( attachToSpy ).calledOnce;

				attachToSpy.restore();
			} );
		} );

		describe( 'PictureEditing integration', () => {
			it( 'should add resize handles to a block image using <picture>', async () => {
				const editor = await createEditor( {
					plugins: [ Image, ImageResizeEditing, ImageResizeHandles, LinkImageEditing, PictureEditing, Paragraph ]
				} );

				const attachToSpy = sinon.spy( editor.plugins.get( 'WidgetResize' ), 'attachTo' );

				setData( editor.model,
					`[<imageBlock linkHref="http://ckeditor.com" src="${ IMAGE_SRC_FIXTURE }" alt="alt text"></imageBlock>]`
				);

				editor.model.change( writer => {
					writer.setAttribute( 'sources', [
						{ srcset: IMAGE_SRC_FIXTURE }
					], editor.model.document.getRoot().getChild( 0 ) );
				} );

				await waitForAllImagesLoaded( editor );

				expect( attachToSpy ).calledOnce;

				attachToSpy.restore();

				await editor.destroy();
			} );
		} );
	} );

	describe( 'for inline image', () => {
		it( 'uses percents by default', async () => {
			const localEditor = await createEditor( {
				plugins: [ Image, ImageResizeEditing, ImageResizeHandles, Paragraph ]
			} );

			const attachToSpy = sinon.spy( localEditor.plugins.get( 'WidgetResize' ), 'attachTo' );

			await setModelAndWaitForImages( localEditor,
				`<paragraph>[<imageInline imageStyle="side" src="${ IMAGE_SRC_FIXTURE }"></imageInline>]</paragraph>`
			);

			expect( attachToSpy.args[ 0 ][ 0 ] ).to.have.a.property( 'unit', '%' );

			attachToSpy.restore();

			await localEditor.destroy();
		} );

		describe( 'command', () => {
			beforeEach( async () => {
				editor = await createEditor();
			} );

			it( 'uses the command on commit', async () => {
				const spy = sinon.spy( editor.commands.get( 'resizeImage' ), 'execute' );

				await setModelAndWaitForImages( editor,
					'<paragraph>foo</paragraph>' +
					`<paragraph>[<imageInline src="${ IMAGE_SRC_FIXTURE }"></imageInline>]</paragraph>`
				);
				widget = viewDocument.getRoot().getChild( 1 ).getChild( 0 );
				const domParts = getWidgetDomParts( editor, widget, 'bottom-left' );

				const finalPointerPosition = getHandleCenterPoint( domParts.widget, 'bottom-left' ).moveBy( 10, -10 );

				resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, finalPointerPosition );

				expect( spy.calledOnce ).to.be.true;
				expect( spy.args[ 0 ][ 0 ] ).to.deep.equal( { width: '90px' } );
			} );

			it( 'disables the resizer if the command is disabled', async () => {
				await setModelAndWaitForImages( editor,
					'<paragraph>foo</paragraph>' +
					`<paragraph>[<imageInline src="${ IMAGE_SRC_FIXTURE }"></imageInline>]</paragraph>`
				);
				// Enforce selection on an image. See: https://github.com/ckeditor/ckeditor5/issues/8617.
				editor.model.change( writer => writer.setSelection( editor.model.document.getRoot().getChild( 1 ).getChild( 0 ), 'on' ) );

				const resizer = getSelectedImageResizer( editor );

				let isEnabled = false;

				editor.commands.get( 'resizeImage' ).on( 'set:isEnabled', evt => {
					evt.return = isEnabled;
					evt.stop();
				}, { priority: 'highest' } );

				editor.commands.get( 'resizeImage' ).refresh();
				expect( resizer.isEnabled ).to.be.false;

				isEnabled = true;
				editor.commands.get( 'resizeImage' ).refresh();
				expect( resizer.isEnabled ).to.be.true;
			} );

			it( 'the resizer is disabled from the beginning when the command is disabled when the image is inserted', async () => {
				editor.commands.get( 'resizeImage' ).on( 'set:isEnabled', evt => {
					evt.return = false;
					evt.stop();
				}, { priority: 'highest' } );
				editor.commands.get( 'resizeImage' ).refresh();

				setData( editor.model, `<paragraph>[<imageInline src="${ IMAGE_SRC_FIXTURE }"></imageInline>]</paragraph>` );

				await waitForAllImagesLoaded( editor );

				const resizer = getSelectedImageResizer( editor );
				const resizerWrapper = editor.ui.getEditableElement().querySelector( '.ck-widget__resizer' );

				expect( resizer.isEnabled ).to.be.false;
				expect( resizerWrapper.classList.contains( 'ck-hidden' ) ).to.be.true;
			} );
		} );

		describe( 'side image resizing', () => {
			beforeEach( async () => {
				editor = await createEditor();

				await setModelAndWaitForImages( editor,
					'<paragraph>foo</paragraph>' +
					`<paragraph>[<imageInline imageStyle="side" src="${ IMAGE_SRC_FIXTURE }"></imageInline>]</paragraph>`
				);

				widget = viewDocument.getRoot().getChild( 1 ).getChild( 0 );
			} );

			it( 'doesn\'t flicker at the beginning of the resize', async () => {
				// (#5189)
				const resizerPosition = 'bottom-left';
				const domParts = getWidgetDomParts( editor, widget, resizerPosition );
				const initialPointerPosition = getHandleCenterPoint( domParts.widget, resizerPosition );
				const resizeWrapperView = widget.getChild( 1 );

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

				const modelItem = editor.model.document.getRoot().getChild( 1 ).getChild( 0 );

				expect( modelItem.getAttribute( 'resizedWidth' ), 'model width attribute' ).to.be.undefined;
			} );
		} );

		describe( 'height style', () => {
			beforeEach( async () => {
				editor = await createEditor();

				await setModelAndWaitForImages( editor,
					'<paragraph>[' +
						`<imageInline resizedHeight="50px" imageStyle="side" src="${ IMAGE_SRC_FIXTURE }"></imageInline>` +
					']</paragraph>'
				);

				widget = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
			} );

			it( 'is removed after starting resizing', () => {
				const resizerPosition = 'bottom-left';
				const domParts = getWidgetDomParts( editor, widget, resizerPosition );
				const initialPointerPosition = getHandleCenterPoint( domParts.widget, resizerPosition );
				const viewImage = widget.getChild( 0 );

				expect( viewImage.getStyle( 'height' ) ).to.equal( '50px' );

				resizerMouseSimulator.down( editor, domParts.resizeHandle );

				resizerMouseSimulator.move( editor, domParts.resizeHandle, null, initialPointerPosition );

				expect( viewImage.getStyle( 'height' ) ).to.be.undefined;

				resizerMouseSimulator.up( editor );
			} );
		} );

		describe( 'undo integration', () => {
			beforeEach( async () => {
				editor = await createEditor();

				await setModelAndWaitForImages( editor,
					'<paragraph>foo</paragraph>' +
					`<paragraph>[<imageInline src="${ IMAGE_SRC_FIXTURE }"></imageInline>]</paragraph>`
				);
				// Enforce selection on an image. See: https://github.com/ckeditor/ckeditor5/issues/8617.
				editor.model.change( writer => writer.setSelection( editor.model.document.getRoot().getChild( 1 ).getChild( 0 ), 'on' ) );

				widget = viewDocument.getRoot().getChild( 1 ).getChild( 0 );
			} );

			it( 'has correct border size after undo', () => {
				const domParts = getWidgetDomParts( editor, widget, 'bottom-left' );
				const initialPosition = getHandleCenterPoint( domParts.widget, 'bottom-left' );
				const finalPointerPosition = initialPosition.clone().moveBy( 0, 10 );
				const plugin = editor.plugins.get( 'WidgetResize' );

				resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, {
					from: initialPosition,
					to: finalPointerPosition
				} );

				expect( domParts.widget.style.width ).to.equal( '120px' );

				editor.commands.get( 'undo' ).execute();

				// Toggle _visibleResizer to force synchronous redraw. Otherwise you'd need to wait ~200ms for
				// throttled redraw to take place, making tests slower.
				for ( const [ , resizer ] of plugin._resizers.entries() ) {
					resizer.redraw();
				}

				const resizerWrapper = document.querySelector( '.ck-widget__resizer' );
				const shadowBoundingRect = resizerWrapper.getBoundingClientRect();

				expect( shadowBoundingRect.width ).to.equal( 100 );
				expect( shadowBoundingRect.height ).to.equal( 50 );
			} );

			it( 'doesn\'t show resizers when undoing to multiple images', async () => {
				// Based on https://github.com/ckeditor/ckeditor5/pull/8108#issuecomment-695949745.
				await setModelAndWaitForImages( editor,
					'<paragraph>' +
						`[<imageInline src="${ IMAGE_SRC_FIXTURE }"></imageInline>` +
						`<imageInline src="${ IMAGE_SRC_FIXTURE }"></imageInline>]` +
					'</paragraph>'
				);

				const paragraph = editor.model.change( writer => {
					return writer.createElement( 'paragraph' );
				} );
				editor.model.insertContent( paragraph );

				// Undo to go back to two, selected images.
				editor.commands.get( 'undo' ).execute();

				for ( let i = 0; i < 2; i++ ) {
					widget = viewDocument.getRoot().getChild( 0 ).getChild( i );
					const domImage = getWidgetDomParts( editor, widget, 'bottom-right' ).widget.querySelector( 'img' );
					viewDocument.fire( 'imageLoaded', { target: domImage } );

					const domResizeWrapper = getWidgetDomParts( editor, widget, 'bottom-left' ).resizeWrapper;

					expect( domResizeWrapper.getBoundingClientRect().height ).to.equal( 0 );
				}
			} );
		} );

		it( 'doesn\'t create multiple resizers for a single image widget', async () => {
			// https://github.com/ckeditor/ckeditor5/pull/8108#issuecomment-708302992
			editor = await createEditor();
			await setModelAndWaitForImages( editor, `<paragraph>[<imageInline src="${ IMAGE_SRC_FIXTURE }"></imageInline>]</paragraph>` );
			widget = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

			const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );
			const alternativeImageFixture =
				'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

			// Change the image so that load event triggers for the same img element again.
			domParts.widget.querySelector( 'img' ).src = alternativeImageFixture;
			await waitForAllImagesLoaded( editor );

			expect( domParts.widget.querySelectorAll( '.ck-widget__resizer' ).length ).to.equal( 1 );
		} );

		it( 'only creates a resizer after the image is loaded', async () => {
			// https://github.com/ckeditor/ckeditor5/issues/8088
			editor = await createEditor();
			setData( editor.model, `<paragraph>[<imageInline src="${ IMAGE_SRC_FIXTURE }"></imageInline>]</paragraph>` );
			widget = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
			const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );

			expect( domParts.widget.querySelectorAll( '.ck-widget__resizer' ).length ).to.equal( 0 );

			await waitForAllImagesLoaded( editor );
			expect( domParts.widget.querySelectorAll( '.ck-widget__resizer' ).length ).to.equal( 1 );
		} );

		it( 'should be able to get the proper resizeHost size when the image it is wrapped with an inline element', async () => {
			// https://github.com/ckeditor/ckeditor5/issues/9568
			const editor = await createEditor( {
				plugins: [ Image, ImageResizeEditing, ImageResizeHandles, LinkImageEditing, Paragraph ],
				image: { resizeUnit: 'px' }
			} );

			await setModelAndWaitForImages( editor,
				'<paragraph>' +
					`[<imageInline linkHref="http://ckeditor.com" src="${ IMAGE_SRC_FIXTURE }" alt="alt text"></imageInline>]` +
				'</paragraph>' );

			widget = viewDocument.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 );
			const spy = sinon.spy( editor.commands.get( 'resizeImage' ), 'execute' );
			const domParts = getWidgetDomParts( editor, widget, 'bottom-left' );
			const finalPointerPosition = getHandleCenterPoint( domParts.widget, 'bottom-left' ).moveBy( 10, -10 );

			resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, finalPointerPosition );

			sinon.assert.calledWithExactly( spy.firstCall, { width: '90px' } );

			await editor.destroy();
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
				editor = await createEditor();

				await setModelAndWaitForImages( editor,
					'<paragraph>' +
						'[<imageInline ' +
							`src="${ imageBaseUrl }" ` +
							`srcset="${ imageBaseUrl }?a 110w, ${ imageBaseUrl }?b 440w, ${ imageBaseUrl }?c 1025w" ` +
							'sizes="100vw" ' +
							'width="96">' +
						'</imageInline>]' +
					'</paragraph>'
				);

				widget = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
				model = editor.model.document.getRoot().getChild( 0 ).getChild( 0 );
			} );

			it( 'works with images containing srcset', async () => {
				const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );
				const initialPosition = getHandleCenterPoint( domParts.widget, 'bottom-right' );
				const finalPointerPosition = initialPosition.clone().moveBy( -20, -20 );

				resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, {
					from: initialPosition,
					to: finalPointerPosition
				} );

				expect( model.getAttribute( 'resizedWidth' ) ).to.equal( '76px' );
			} );

			it( 'retains width after removing srcset', async () => {
				const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );
				const initialPosition = getHandleCenterPoint( domParts.widget, 'bottom-right' );
				const finalPointerPosition = initialPosition.clone().moveBy( -20, -20 );

				resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, {
					from: initialPosition,
					to: finalPointerPosition
				} );

				editor.model.change( writer => {
					writer.removeAttribute( 'srcset', model );
				} );

				const expectedHtml = '<p><img class="image_resized" style="width:76px;" src="/assets/sample.png" width="96"></p>';
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
				editor = await createEditor( {
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

				await setModelAndWaitForImages( editor,
					`<paragraph>foo</paragraph><paragraph>[<imageInline src="${ IMAGE_SRC_FIXTURE }"></imageInline>]</paragraph>`
				);

				// Enforce selection on an image. See: https://github.com/ckeditor/ckeditor5/issues/8617.
				editor.model.change( writer => writer.setSelection( editor.model.document.getRoot().getChild( 1 ).getChild( 0 ), 'on' ) );

				widget = viewDocument.getRoot().getChild( 1 ).getChild( 0 );

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

		describe( 'Link image integration', () => {
			beforeEach( async () => {
				editor = await createEditor( {
					plugins: [ Image, ImageResizeEditing, ImageResizeHandles, LinkImageEditing, Paragraph ]
				} );
			} );

			afterEach( async () => {
				await editor.destroy();
			} );

			it( 'should attach the resizer to the image inside the link', async () => {
				const attachToSpy = sinon.spy( editor.plugins.get( 'WidgetResize' ), 'attachTo' );

				await setModelAndWaitForImages( editor,
					'<paragraph>' +
						`[<imageInline linkHref="http://ckeditor.com" src="${ IMAGE_SRC_FIXTURE }" alt="alt text"></imageInline>]` +
					'</paragraph>'
				);

				expect( attachToSpy ).calledOnce;

				attachToSpy.restore();
			} );

			it( 'should set non-inline element as the resize host for an image wrapped with a link', async () => {
				await setModelAndWaitForImages( editor,
					'<paragraph>' +
						`[<imageInline linkHref="http://ckeditor.com" src="${ IMAGE_SRC_FIXTURE }" alt="alt text"></imageInline>]` +
					'</paragraph>'
				);

				const resizer = Array.from( editor.plugins.get( 'WidgetResize' )._resizers.values() )[ 0 ];

				expect( window.getComputedStyle( resizer._getResizeHost() ).display ).not.to.equal( 'inline' );
			} );
		} );

		describe( 'PictureEditing integration', () => {
			it( 'should add resize handles to an inline image using <picture>', async () => {
				const editor = await createEditor( {
					plugins: [ Image, ImageResizeEditing, ImageResizeHandles, LinkImageEditing, PictureEditing, Paragraph ]
				} );

				const attachToSpy = sinon.spy( editor.plugins.get( 'WidgetResize' ), 'attachTo' );

				setData( editor.model,
					'<paragraph>' +
						`[<imageInline linkHref="http://ckeditor.com" src="${ IMAGE_SRC_FIXTURE }" alt="alt text"></imageInline>]` +
					'</paragraph>'
				);

				editor.model.change( writer => {
					writer.setAttribute( 'sources', [
						{ srcset: IMAGE_SRC_FIXTURE }
					], editor.model.document.getRoot().getChild( 0 ).getChild( 0 ) );
				} );

				await waitForAllImagesLoaded( editor );

				expect( attachToSpy ).calledOnce;

				attachToSpy.restore();

				await editor.destroy();
			} );
		} );

		describe( 'to-do list integration', () => {
			it( 'should set non-inline as the resize host if an image is inside a to-do list', async () => {
				editor = await createEditor( {
					plugins: [ Image, ImageResizeEditing, ImageResizeHandles, LegacyTodoList, Paragraph ]
				} );

				await setModelAndWaitForImages( editor,
					'<listItem listType="todo" listIndent="0">' +
						`[<imageInline linkHref="http://ckeditor.com" src="${ IMAGE_SRC_FIXTURE }" alt="alt text"></imageInline>]` +
					'</listItem>'
				);

				const resizer = Array.from( editor.plugins.get( 'WidgetResize' )._resizers.values() )[ 0 ];

				expect( window.getComputedStyle( resizer._getResizeHost() ).display ).not.to.equal( 'inline' );

				await editor.destroy();
			} );
		} );
	} );

	describe( 'HTML embed integration', () => {
		it( 'does not attach the resizer to the image inside the HTML embed preview', async () => {
			editor = await createEditor( {
				plugins: [ Image, ImageResizeEditing, ImageResizeHandles, HtmlEmbedEditing ],
				htmlEmbed: {
					showPreviews: true,
					sanitizeHtml: input => ( { html: input, hasChanged: false } )
				}
			} );

			const attachToSpy = sinon.spy( editor.plugins.get( 'WidgetResize' ), 'attachTo' );

			setData( editor.model, '[<rawHtml></rawHtml>]' );

			editor.model.change( writer => {
				writer.setAttribute( 'value', `<img src="${ IMAGE_SRC_FIXTURE }">`, editor.model.document.getRoot().getChild( 0 ) );
			} );

			await waitForAllImagesLoaded( editor );

			expect( attachToSpy ).not.called;

			attachToSpy.restore();
		} );
	} );

	function getDomWidth( domElement ) {
		return new Rect( domElement ).width;
	}

	function getSelectedImageResizer( editor ) {
		return editor.plugins.get( 'WidgetResize' ).getResizerByViewElement(
			editor.editing.view.document.selection.getSelectedElement()
		);
	}

	async function createEditor( config ) {
		const newEditor = await ClassicEditor.create( editorElement, config || {
			plugins: [ Widget, Image, ImageStyle, Paragraph, Undo, Table, ImageResizeEditing, ImageResizeHandles ],
			image: {
				resizeUnit: 'px'
			}
		} );

		view = newEditor.editing.view;
		viewDocument = view.document;

		await focusEditor( newEditor );

		return newEditor;
	}

	async function setModelAndWaitForImages( editor, data ) {
		setData( editor.model, data );
		return waitForAllImagesLoaded( editor );
	}
} );
