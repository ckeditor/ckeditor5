/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event, setTimeout */

import DragDrop from '../src/dragdrop';
import DragDropTarget from '../src/dragdroptarget';
import PastePlainText from '../src/pasteplaintext';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Table from '@ckeditor/ckeditor5-table/src/table';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'Drag and Drop target', () => {
	let editorElement, editor, model, view, viewDocument, root, mapper, domConverter, dragDropTarget;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ DragDrop, PastePlainText, Paragraph, Table, HorizontalLine, ShiftEnter, BlockQuote, Bold ]
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
