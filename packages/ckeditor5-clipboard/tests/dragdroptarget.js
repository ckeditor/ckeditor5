/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import DragDrop from '../src/dragdrop.js';
import DragDropTarget from '../src/dragdroptarget.js';
import PastePlainText from '../src/pasteplaintext.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import { Image, ImageCaption } from '@ckeditor/ckeditor5-image';

import { LiveRange } from '@ckeditor/ckeditor5-engine';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import { CustomTitle } from './utils/customtitleplugin.js';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget';

describe( 'Drag and Drop target', () => {
	let editorElement, editor, model, view, viewDocument, root, mapper, domConverter, dragDropTarget;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				DragDrop,
				PastePlainText,
				Paragraph,
				Table,
				HorizontalLine,
				ShiftEnter,
				BlockQuote,
				Bold,
				Image,
				ImageCaption,
				CustomTitle
			]
		} );

		model = editor.model;
		root = model.document.getRoot();
		mapper = editor.editing.mapper;
		view = editor.editing.view;
		viewDocument = view.document;
		domConverter = view.domConverter;

		dragDropTarget = editor.plugins.get( DragDropTarget );
	} );

	afterEach( async () => {
		await editor.destroy();
		editorElement.remove();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( DragDropTarget.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( DragDropTarget.isPremiumPlugin ).to.be.false;
	} );

	describe( 'getFinalDropRange', () => {
		it( 'should return drop position after paragraph', () => {
			setModelData( model,
				'<paragraph>foobar</paragraph>' +
				'[<horizontalLine></horizontalLine>]'
			);

			const targetModel = root.getNodeByPath( [ 0 ] );
			const targetElement = mapper.toViewElement( targetModel );
			const targetDomNode = domConverter.mapViewToDom( targetElement );
			const { clientX, clientY } = getMockedMousePosition( { domNode: targetDomNode, position: 'after' } );

			const targetPosition = dragDropTarget.getFinalDropRange(
				targetElement,
				[ view.createRangeOn( targetModel ) ],
				clientX,
				clientY,
				true
			);

			expect( targetPosition.start.isEqual(
				model.createPositionAt( root.getChild( 0 ), 'after' )
			) ).to.be.true;
		} );

		it( 'should return drop position before paragraph', () => {
			setModelData( model,
				'<paragraph>foobar</paragraph>' +
				'[<horizontalLine></horizontalLine>]'
			);

			const targetModel = root.getNodeByPath( [ 0 ] );
			const targetElement = mapper.toViewElement( targetModel );
			const targetDomNode = domConverter.mapViewToDom( targetElement );
			const { clientX, clientY } = getMockedMousePosition( { domNode: targetDomNode } );

			const targetPosition = dragDropTarget.getFinalDropRange(
				targetElement,
				[ view.createRangeOn( targetModel ) ],
				clientX,
				clientY,
				true
			);

			expect( targetPosition.start.isEqual(
				model.createPositionAt( root.getChild( 0 ), 'before' )
			) ).to.be.true;
		} );

		it( 'should return drop position after widget in none block mode', () => {
			setModelData( model,
				'<paragraph>[]foo</paragraph>' +
				'<blockQuote><horizontalLine></horizontalLine></blockQuote>' +
				'<paragraph>bar</paragraph>'
			);

			const targetModel = root.getNodeByPath( [ 0 ] );
			const targetElement = mapper.toViewElement( targetModel );

			const widgetModel = root.getNodeByPath( [ 1, 0 ] );
			const widgetElement = mapper.toViewElement( widgetModel );
			const widgetDomNode = domConverter.mapViewToDom( widgetElement );

			const { clientX, clientY } = getMockedMousePosition( { domNode: widgetDomNode, position: 'after' } );

			const targetPosition = dragDropTarget.getFinalDropRange(
				targetElement,
				[ view.createRangeOn( widgetElement ) ],
				clientX,
				clientY,
				false
			);

			expect( targetPosition.start.isEqual(
				model.createPositionAt( root.getChild( 1 ), 'after' )
			) ).to.be.true;
		} );

		it( 'should return drop position without target ranges', () => {
			setModelData( model,
				'<paragraph>[]foo</paragraph>' +
				'<blockQuote><horizontalLine></horizontalLine></blockQuote>' +
				'<paragraph>bar</paragraph>'
			);

			const targetModel = root.getNodeByPath( [ 0 ] );
			const targetElement = mapper.toViewElement( targetModel );

			const widgetModel = root.getNodeByPath( [ 1, 0 ] );
			const widgetElement = mapper.toViewElement( widgetModel );
			const widgetDomNode = domConverter.mapViewToDom( widgetElement );

			const { clientX, clientY } = getMockedMousePosition( { domNode: widgetDomNode, position: 'after' } );

			const targetPosition = dragDropTarget.getFinalDropRange(
				targetElement,
				null,
				clientX,
				clientY,
				false
			);

			expect( targetPosition.start.isEqual(
				model.createPositionAt( root.getChild( 0 ), 'after' )
			) ).to.be.true;
		} );

		it( 'should return drop position before paragraph in none block mode', () => {
			setModelData( model, '<paragraph>[]foobar</paragraph>' );

			const modelPosition = model.createPositionAt( root.getChild( 0 ), 2 );

			const targetModel = root.getNodeByPath( [ 0 ] );
			const targetElement = mapper.toViewElement( targetModel );
			const targetDomNode = domConverter.mapViewToDom( targetElement );

			const { clientX, clientY } = getMockedMousePosition( { domNode: targetDomNode } );

			const targetPosition = dragDropTarget.getFinalDropRange(
				targetElement,
				[ view.createRange( mapper.toViewPosition( modelPosition ) ) ],
				clientX,
				clientY,
				false
			);

			expect( targetPosition.start.isEqual(
				model.createPositionAt( root.getChild( 0 ), 2 )
			) ).to.be.true;
		} );

		it( 'should return drop position in inline mode before text', () => {
			setModelData( model,
				'<paragraph><softBreak></softBreak><$text bold="true">foobar</$text></paragraph>'
			);

			const targetModel = root.getNodeByPath( [ 0, 0 ] );
			const targetElement = mapper.toViewElement( targetModel );
			const targetDomNode = domConverter.mapViewToDom( targetElement );

			const { clientX, clientY } = getMockedMousePosition( { domNode: targetDomNode, extraOffsetX: -5 } );

			const targetPosition = dragDropTarget.getFinalDropRange(
				targetElement,
				[ view.createRange( view.createPositionAt( targetElement, 5 ) ) ],
				clientX,
				clientY,
				false
			);

			expect( targetPosition.start.isEqual(
				model.createPositionAt( root.getChild( 0 ), 0 )
			) ).to.be.true;
		} );

		it( 'should return drop position in inline mode after text', () => {
			setModelData( model,
				'<paragraph><softBreak></softBreak><$text bold="true">foobar</$text></paragraph>'
			);

			const targetModel = root.getNodeByPath( [ 0, 0 ] );
			const targetElement = mapper.toViewElement( targetModel );
			const targetDomNode = domConverter.mapViewToDom( targetElement );

			const { clientX, clientY } = getMockedMousePosition( { domNode: targetDomNode } );

			const targetPosition = dragDropTarget.getFinalDropRange(
				targetElement,
				[ view.createRange( view.createPositionAt( targetElement, 5 ) ) ],
				clientX,
				clientY,
				false
			);

			expect( targetPosition.start.isEqual(
				model.createPositionAt( root.getChild( 0 ), 1 )
			) ).to.be.true;
		} );

		it( 'should return drop position inside block before paragraph', () => {
			setModelData( model,
				'<paragraph>[]foobar</paragraph>' +
				'<table><tableRow><tableCell><paragraph></paragraph></tableCell></tableRow></table>'
			);

			const rootElement = viewDocument.getRoot();
			const viewElement = rootElement;

			const nestedModelParagraph = root.getNodeByPath( [ 1, 0, 0, 0 ] );
			const nestedViewParagraph = mapper.toViewElement( nestedModelParagraph );
			const nestedParagraphDomNode = domConverter.mapViewToDom( nestedViewParagraph );

			const { clientX, clientY } = getMockedMousePosition( { domNode: nestedParagraphDomNode } );

			const targetPosition = dragDropTarget.getFinalDropRange(
				viewElement,
				[ view.createRangeOn( nestedModelParagraph ) ],
				clientX,
				clientY,
				true
			);

			expect( targetPosition.start.isEqual(
				model.createPositionAt( root.getChild( 1 ), 'before' )
			) ).to.be.true;
		} );

		it( 'should return drop position inside block after paragraph', () => {
			setModelData( model,
				'<paragraph>[]foobar</paragraph>' +
				'<table><tableRow><tableCell><paragraph></paragraph></tableCell></tableRow></table>'
			);

			const rootElement = viewDocument.getRoot();
			const viewElement = rootElement;

			const nestedModelParagraph = root.getNodeByPath( [ 1, 0, 0, 0 ] );
			const nestedViewParagraph = mapper.toViewElement( nestedModelParagraph );
			const nestedParagraphDomNode = domConverter.mapViewToDom( nestedViewParagraph );

			const { clientX, clientY } = getMockedMousePosition( { domNode: nestedParagraphDomNode, position: 'after' } );

			const targetPosition = dragDropTarget.getFinalDropRange(
				viewElement,
				[ view.createRangeOn( nestedModelParagraph ) ],
				clientX,
				clientY,
				true
			);

			expect( targetPosition.start.isEqual(
				model.createPositionAt( root.getChild( 1 ), 'after' )
			) ).to.be.true;
		} );

		it( 'should through a warn in case when something went wrong', () => {
			setModelData( model,
				'<paragraph>[]foobar</paragraph>' +
				'<table><tableRow><tableCell><paragraph></paragraph></tableCell></tableRow></table>'
			);

			const rootElement = viewDocument.getRoot();

			const nestedModelParagraph = root.getNodeByPath( [ 1, 0, 0, 0 ] );
			const nestedViewParagraph = mapper.toViewElement( nestedModelParagraph );
			const nestedParagraphDomNode = domConverter.mapViewToDom( nestedViewParagraph );

			sinon.stub( model.schema, 'checkChild' ).returns( null );

			const { clientX, clientY } = getMockedMousePosition( { domNode: nestedParagraphDomNode } );

			const targetPosition = dragDropTarget.getFinalDropRange(
				rootElement,
				[ view.createRangeOn( nestedModelParagraph ) ],
				clientX,
				clientY,
				true
			);

			expect( targetPosition ).to.be.null;
		} );

		it( 'should return drop position for $text element when hovering widget', () => {
			setModelData( model,
				'<paragraph>[]foo<$text bold="true">bar</$text>baz</paragraph>' +
				'<horizontalLine></horizontalLine>'
			);

			const viewParagraph = viewDocument.getRoot().getChild( 0 ).getChild( 1 );
			const domParagraph = domConverter.mapViewToDom( viewParagraph );

			const { clientX, clientY } = getMockedMousePosition( { domNode: domParagraph } );

			const targetPosition = dragDropTarget.getFinalDropRange(
				viewParagraph,
				[ view.createRange( view.createPositionAt( viewDocument.getRoot().getChild( 1 ), 0 ) ) ],
				clientX,
				clientY,
				false
			);

			expect( targetPosition.start.isEqual(
				model.createPositionAt( root.getChild( 1 ), 'before' )
			) ).to.be.true;
		} );
	} );

	describe( 'updateDropMarker', () => {
		it( 'should find drop position while hovering over empty nested editable', () => {
			setModelData( model,
				'<paragraph>[]foobar</paragraph>' +
				'<table><tableRow><tableCell><paragraph></paragraph></tableCell></tableRow></table>'
			);

			const modelElement = root.getNodeByPath( [ 1, 0, 0 ] );
			const viewElement = mapper.toViewElement( modelElement );
			const domNode = domConverter.mapViewToDom( viewElement );

			const { clientX, clientY } = getMockedMousePosition( { domNode } );

			dragDropTarget.updateDropMarker(
				viewElement,
				[ view.createRange( view.createPositionAt( viewDocument.getRoot().getChild( 1 ), 0 ) ) ],
				clientX,
				clientY,
				false
			);

			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual(
				model.createPositionAt( root.getNodeByPath( [ 1, 0, 0, 0 ] ), 'before' )
			) ).to.be.true;
		} );

		it( 'should find drop position before block element', () => {
			setModelData( model,
				'<paragraph>foobar</paragraph><horizontalLine></horizontalLine>'
			);

			const modelElement = root.getNodeByPath( [ 1 ] );
			const viewElement = mapper.toViewElement( modelElement );
			const domNode = domConverter.mapViewToDom( viewElement );

			const { clientX, clientY } = getMockedMousePosition( { domNode } );

			dragDropTarget.updateDropMarker(
				viewElement,
				[ view.createRange( view.createPositionAt( viewDocument.getRoot().getChild( 1 ), 0 ) ) ],
				clientX,
				clientY,
				false
			);

			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual(
				model.createPositionAt( root.getNodeByPath( [ 1 ] ), 'before' )
			) ).to.be.true;
		} );

		it( 'should find drop position after block element', () => {
			setModelData( model,
				'<horizontalLine></horizontalLine>'
			);

			const modelElement = root.getNodeByPath( [ 0 ] );
			const viewElement = mapper.toViewElement( modelElement );
			const domNode = domConverter.mapViewToDom( viewElement );

			const { clientX, clientY } = getMockedMousePosition( { domNode, position: 'after' } );

			dragDropTarget.updateDropMarker(
				viewElement,
				[ view.createRange( view.createPositionAt( viewElement, 'after' ) ) ],
				clientX,
				clientY,
				false
			);

			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual(
				model.createPositionAt( root.getNodeByPath( [ 0 ] ), 'after' )
			) ).to.be.true;
		} );

		it( 'should find drop position inside empty container element', () => {
			model.schema.register( 'htmlDiv', { inheritAllFrom: '$container' } );
			editor.conversion.elementToElement( { model: 'htmlDiv', view: 'div' } );

			setModelData( model,
				'<htmlDiv></htmlDiv>'
			);

			const modelElement = root.getChild( 0 );
			const viewElement = mapper.toViewElement( modelElement );
			const domNode = domConverter.mapViewToDom( viewElement );

			const { clientX, clientY } = getMockedMousePosition( { domNode } );

			dragDropTarget.updateDropMarker(
				viewElement,
				[ view.createRange( view.createPositionAt( viewElement, 0 ) ) ],
				clientX,
				clientY,
				false
			);

			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual(
				model.createPositionAt( root.getChild( 0 ), 0 )
			) ).to.be.true;
		} );

		it( 'should hide drop target if target is not in editing root', () => {
			setModelData( model,
				'<horizontalLine></horizontalLine>'
			);

			const modelElement = root.getNodeByPath( [ 0 ] );
			const viewElement = mapper.toViewElement( modelElement );
			const domNode = domConverter.mapViewToDom( viewElement );

			const { clientX, clientY } = getMockedMousePosition( { domNode, position: 'after' } );

			sinon.stub( domNode.parentElement, 'getBoundingClientRect' ).returns( {
				bottom: 0,
				top: 0
			} );

			dragDropTarget.updateDropMarker(
				viewElement,
				[ view.createRange( view.createPositionAt( viewElement, 'after' ) ) ],
				clientX,
				clientY,
				false
			);

			expect( document.querySelector( '.ck-clipboard-drop-target-line.ck-hidden' ) ).not.to.be.null;
		} );

		it( 'should put drop target marker inside a text node', () => {
			setModelData( model, '<paragraph>[]foobar</paragraph>' );

			const modelPosition = model.createPositionAt( root.getChild( 0 ), 2 );
			const viewPosition = mapper.toViewPosition( modelPosition );
			const domNode = domConverter.findCorrespondingDomText( viewPosition.parent ).parentNode;

			const { clientX, clientY } = getMockedMousePosition( { domNode } );

			dragDropTarget.updateDropMarker(
				mapper.findMappedViewAncestor( viewPosition ),
				[ view.createRange( viewPosition ) ],
				clientX,
				clientY,
				false
			);

			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual(
				model.createPositionAt( root.getChild( 0 ), 2 )
			) ).to.be.true;
		} );

		it( 'should put drop target marker inside a text node (even if dragged range is an inline object with block content)', () => {
			model.schema.register( 'inlineWidget', { inheritAllFrom: '$inlineObject' } );
			model.schema.register( 'widgetTitle', { isLimit: true, allowIn: 'inlineWidget', allowContentOf: '$block' } );

			editor.conversion.for( 'editingDowncast' )
				.elementToElement( {
					model: 'inlineWidget',
					view: ( modelElement, { writer: viewWriter } ) => {
						return toWidget( viewWriter.createContainerElement( 'span' ), viewWriter );
					}
				} )
				.elementToElement( {
					model: 'widgetTitle',
					view: ( modelElement, { writer: viewWriter } ) => {
						return toWidgetEditable( viewWriter.createEditableElement( 'h1' ), viewWriter );
					}
				} );

			setModelData( model, '<paragraph>[<inlineWidget><widgetTitle>abc</widgetTitle></inlineWidget>]foobar</paragraph>' );

			const modelPosition = model.createPositionAt( root.getChild( 0 ), 4 );
			const viewPosition = mapper.toViewPosition( modelPosition );
			const domNode = domConverter.findCorrespondingDomText( viewPosition.parent ).parentNode;

			const { clientX, clientY } = getMockedMousePosition( { domNode } );

			dragDropTarget.updateDropMarker(
				mapper.findMappedViewAncestor( viewPosition ),
				[ view.createRange( viewPosition ) ],
				clientX,
				clientY,
				false,
				LiveRange.fromRange( model.document.selection.getFirstRange() )
			);

			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual(
				model.createPositionAt( root.getChild( 0 ), 4 )
			) ).to.be.true;
		} );

		it( 'should not remove drop target marker if dragging left some nested element', () => {
			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const spy = sinon.spy();
			const clock = sinon.useFakeTimers();

			const modelPosition = model.createPositionAt( root.getChild( 0 ), 3 );
			const viewPosition = mapper.toViewPosition( modelPosition );
			const domNode = domConverter.findCorrespondingDomText( viewPosition.parent ).parentNode;

			model.markers.on( 'update:drop-target', ( evt, marker, oldRange, newRange ) => {
				if ( !newRange ) {
					spy();
				}
			} );

			const { clientX, clientY } = getMockedMousePosition( { domNode } );

			dragDropTarget.updateDropMarker(
				mapper.findMappedViewAncestor( viewPosition ),
				[ view.createRange( viewPosition ) ],
				clientX,
				clientY,
				false
			);

			clock.tick( 100 );

			viewDocument.fire( 'dragleave' );

			clock.tick( 10 );

			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual(
				modelPosition
			) ).to.be.true;

			const newModelPosition = model.createPositionAt( root.getChild( 0 ), 4 );
			const newViewPosition = mapper.toViewPosition( newModelPosition );

			dragDropTarget.updateDropMarker(
				mapper.findMappedViewAncestor( newViewPosition ),
				[ view.createRange( newViewPosition ) ],
				clientX,
				clientY,
				false
			);

			clock.tick( 60 );

			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual(
				newModelPosition
			) ).to.be.true;

			expect( spy.notCalled ).to.be.true;
		} );

		it( 'should hide drop target if range is collapsed', () => {
			setModelData( model,
				'<paragraph>[]foo</paragraph>' +
				'<paragraph>bar</paragraph>'
			);

			const firstParagraphModelElement = root.getChild( 1 );

			const range = model.createRangeOn( firstParagraphModelElement );

			model.change( writer => {
				writer.addMarker( 'drop-target', {
					range,
					usingOperation: false
				} );
			} );

			expect( document.querySelector( '.ck-clipboard-drop-target-line.ck-hidden' ) ).not.to.be.null;
		} );

		it( 'should reconvert drop target on scroll event', done => {
			setModelData( model,
				'<paragraph>[]foo</paragraph>' +
				'<paragraph>bar</paragraph>'
			);

			const rootElement = viewDocument.getRoot();
			const domNode = domConverter.mapViewToDom( rootElement );

			const firstParagraphModelElement = root.getChild( 1 );
			const firstParagraphViewElement = mapper.toViewElement( firstParagraphModelElement );

			const spy = sinon.spy( editor.editing, 'reconvertMarker' );

			const { clientX, clientY } = getMockedMousePosition( { domNode } );

			dragDropTarget.updateDropMarker(
				rootElement,
				[ view.createRangeOn( firstParagraphViewElement ) ],
				clientX,
				clientY,
				false
			);

			const scrollEvent = new Event( 'scroll' );

			document.body.dispatchEvent( scrollEvent );

			setTimeout( () => {
				expect( spy.withArgs( 'drop-target' ).called ).to.be.true;
				done();
			} );
		} );

		it( 'should not drop target marker inside the element being dragged', () => {
			setModelData( model,
				'<blockQuote>' +
					'<paragraph>one</paragraph>' +
					'<paragraph>two</paragraph>' +
					'<paragraph>three</paragraph>' +
				'</blockQuote>'
			);

			const middleParagraphElement = root.getNodeByPath( [ 0, 1 ] );
			const viewElement = mapper.toViewElement( middleParagraphElement );
			const domNode = domConverter.mapViewToDom( viewElement );
			const { clientX, clientY } = getMockedMousePosition( { domNode } );

			// Simulate dragging blockquote into the first paragraph inside it
			dragDropTarget.updateDropMarker(
				viewElement,
				null,
				clientX,
				clientY,
				false,
				LiveRange.fromRange( model.createRangeOn( root.getChild( 0 ) ) )
			);

			expect( model.markers.get( 'drop-target' ) ).to.be.null;
		} );

		it( 'should find place to drop target marker when dropping is not allowed on a given element', () => {
			setModelData( model,
				'<paragraph>' +
					'[<imageInline src="/assets/sample.png"></imageInline>]' +
				'</paragraph>' +
				'<imageBlock src="/assets/sample.png">' +
					'<caption></caption>' +
				'</imageBlock>'
			);

			const inlineImageElement = root.getNodeByPath( [ 0, 0 ] );
			const captionElement = root.getNodeByPath( [ 1, 0 ] );
			const viewElement = mapper.toViewElement( captionElement );
			const { x, y, height } = domConverter.mapViewToDom( viewElement ).getBoundingClientRect();

			// Simulate dragging inline image into block image caption
			dragDropTarget.updateDropMarker(
				viewElement,
				[ view.createRange( view.createPositionAt( viewElement, 0 ) ) ],
				x,
				y + ( height * 0.6 ),
				false,
				LiveRange.fromRange( model.createRangeOn( inlineImageElement ) )
			);

			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual(
				model.createPositionAt( root.getChild( 1 ), 'after' )
			) ).to.be.true;
		} );

		it( 'should drop position when mouse is over the bottom half of the block element', () => {
			setModelData( model,
				'<paragraph>foobar</paragraph>' +
				'<horizontalLine></horizontalLine>'
			);

			const paragraphElement = root.getChild( 0 );
			const hrElement = root.getChild( 1 );
			const hrViewElement = mapper.toViewElement( hrElement );
			const { x, y, height } = domConverter.mapViewToDom( hrViewElement ).getBoundingClientRect();

			// Simulate mouse position at 60% of the `<horizontalLine>` height.
			dragDropTarget.updateDropMarker(
				hrViewElement,
				null,
				x,
				y + ( height * 0.6 ),
				false,
				LiveRange.fromRange( model.createRangeOn( paragraphElement ) )
			);

			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual(
				model.createPositionAt( hrElement, 'after' )
			) ).to.be.true;
		} );

		it( 'should show drop target if the dragged element cannot be dropped on a given position, but is a block element', () => {
			setModelData( model,
				'<table><tableRow><tableCell><paragraph></paragraph></tableCell></tableRow></table>' +
				'<imageBlock alt="bar" src="/assets/sample.png">' +
					'<caption>Caption</caption>' +
				'</imageBlock>'
			);

			const tableElement = root.getChild( 0 );
			const imageBlock = root.getChild( 1 );
			const blockImageViewElement = mapper.toViewElement( imageBlock );
			const blockImageDomRect = domConverter
				.mapViewToDom( blockImageViewElement )
				.getBoundingClientRect();

			// Simulate mouse position at 60% of the `<imageBlock>` height.
			dragDropTarget.updateDropMarker(
				blockImageViewElement,
				null,
				blockImageDomRect.x,
				blockImageDomRect.y + ( blockImageDomRect.height * 0.6 ),
				false,
				LiveRange.fromRange( model.createRangeOn( tableElement ) )
			);

			// Marker should be places after the `<imageBlock>` element.
			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual(
				model.createPositionAt( imageBlock, 'after' )
			) ).to.be.true;

			const captionViewElement = mapper.toViewElement( imageBlock.getChild( 0 ) );
			const captionDomRect = domConverter
				.mapViewToDom( captionViewElement )
				.getBoundingClientRect();

			// Simulate mouse position on `<caption>` element.
			dragDropTarget.updateDropMarker(
				captionViewElement,
				null,
				captionDomRect.x,
				captionDomRect.y,
				false,
				LiveRange.fromRange( model.createRangeOn( tableElement ) )
			);

			// Marker should be places after the `<imageBlock>` element.
			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual(
				model.createPositionAt( imageBlock, 'after' )
			) ).to.be.true;
		} );

		it( 'should find drop position when hovering over object element', () => {
			setModelData( model,
				'<paragraph>[foo]</paragraph>' +
				'<imageBlock alt="bar" src="/assets/sample.png">' +
					'<caption>Caption</caption>' +
				'</imageBlock>'
			);

			const modelElement = root.getChild( 0 );
			const viewElement = mapper.toViewElement( modelElement );
			const domNode = domConverter.mapViewToDom( viewElement );
			const { clientX, clientY } = getMockedMousePosition( { domNode } );

			// Get `<img>`, because that's what the event returns when dragging over an image.
			const targetViewElement = viewElement.getChild( 0 );

			dragDropTarget.updateDropMarker(
				targetViewElement,
				[ view.createRange( view.createPositionAt( viewDocument.getRoot().getChild( 1 ), 0 ) ) ],
				clientX,
				clientY,
				false,
				LiveRange.fromRange( model.createRangeOn( modelElement ) )
			);

			expect( model.markers.get( 'drop-target' ) ).to.not.be.undefined;
		} );

		it( 'should find the drop target if element cannot be dropped on a given position', () => {
			setModelData( model,
				'<paragraph>' +
					'<imageInline alt="foo" src="/assets/sample.png"></imageInline>' +
				'</paragraph>' +
				'<imageBlock alt="bar" src="/assets/sample.png">' +
					'<caption>Caption</caption>' +
				'</imageBlock>'
			);

			const inlineImageElement = root.getNodeByPath( [ 0, 0 ] );
			const blockImageElement = root.getChild( 1 );
			const blockImageViewElement = mapper.toViewElement( blockImageElement );
			const blockImageDomRect = domConverter
				.mapViewToDom( blockImageViewElement )
				.getBoundingClientRect();

			// Simulate mouse position at 60% of the `<imageBlock>` height.
			dragDropTarget.updateDropMarker(
				blockImageViewElement,
				null,
				blockImageDomRect.x,
				blockImageDomRect.y + ( blockImageDomRect.height * 0.6 ),
				false,
				LiveRange.fromRange( model.createRangeOn( inlineImageElement ) )
			);

			// Marker should be places after the `<imageBlock>` element.
			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual(
				model.createPositionAt( blockImageElement, 'after' )
			) ).to.be.true;

			const captionViewElement = mapper.toViewElement( blockImageElement.getChild( 0 ) );
			const captionDomRect = domConverter
				.mapViewToDom( captionViewElement )
				.getBoundingClientRect();

			// Simulate mouse position on `<caption>` element.
			dragDropTarget.updateDropMarker(
				captionViewElement,
				null,
				captionDomRect.x,
				captionDomRect.y + ( captionDomRect.height * 0.6 ),
				false,
				LiveRange.fromRange( model.createRangeOn( inlineImageElement ) )
			);

			// Marker should be placed after the `<imageBlock>`, because `<imageInline>` can't be dropped inside the `<caption>`.
			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual(
				model.createPositionAt( root.getChild( 1 ), 'after' )
			) ).to.be.true;
		} );
	} );

	describe( 'removeDropMarker', () => {
		it( 'should remove drop target with delay', () => {
			setModelData( model, '<paragraph>[]foobar</paragraph>' );

			const clock = sinon.useFakeTimers();
			const modelPosition = model.createPositionAt( root.getChild( 0 ), 2 );
			const viewPosition = mapper.toViewPosition( modelPosition );
			const domNode = domConverter.findCorrespondingDomText( viewPosition.parent ).parentNode;

			const { clientX, clientY } = getMockedMousePosition( { domNode } );

			const spy = sinon.spy( dragDropTarget, 'removeDropMarker' );

			dragDropTarget.updateDropMarker(
				mapper.findMappedViewAncestor( viewPosition ),
				[ view.createRange( viewPosition ) ],
				clientX,
				clientY,
				false
			);

			dragDropTarget.removeDropMarkerDelayed();

			expect( spy.called ).to.be.false;

			clock.tick( 100 );

			expect( spy.called ).to.be.true;
		} );

		it( 'should remove drop target marker ', () => {
			setModelData( model, '<paragraph>[]foobar</paragraph>' );

			const modelPosition = model.createPositionAt( root.getChild( 0 ), 2 );
			const viewPosition = mapper.toViewPosition( modelPosition );
			const domNode = domConverter.findCorrespondingDomText( viewPosition.parent ).parentNode;

			const { clientX, clientY } = getMockedMousePosition( { domNode } );

			dragDropTarget.updateDropMarker(
				mapper.findMappedViewAncestor( viewPosition ),
				[ view.createRange( viewPosition ) ],
				clientX,
				clientY,
				false
			);

			dragDropTarget.removeDropMarker();

			expect( model.markers.has( 'drop-target' ) ).to.be.false;
		} );
	} );

	function getMockedMousePosition( { domNode, position = 'before', extraOffsetX = 0, extraOffsetY = 0 } ) {
		const { x, y, height } = domNode.getBoundingClientRect();

		if ( position === 'after' ) {
			return {
				clientX: x + extraOffsetX,
				clientY: y + height + extraOffsetY
			};
		}

		return {
			clientX: x + extraOffsetX,
			clientY: y + extraOffsetY
		};
	}
} );
