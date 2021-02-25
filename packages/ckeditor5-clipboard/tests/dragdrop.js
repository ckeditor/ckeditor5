/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClipboardPipeline from '../src/clipboardpipeline';
import DragDrop from '../src/dragdrop';
import PastePlainText from '../src/pasteplaintext';

import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData, stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'Drag and Drop', () => {
	let editorElement, editor, model, view, viewDocument, root, mapper, domConverter;

	testUtils.createSinonSandbox();

	it( 'requires ClipboardPipeline and Widget', () => {
		expect( DragDrop.requires ).to.deep.equal( [ ClipboardPipeline, Widget ] );
	} );

	it( 'has proper name', () => {
		expect( DragDrop.pluginName ).to.equal( 'DragDrop' );
	} );

	describe( 'dragging', () => {
		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ DragDrop, PastePlainText, Paragraph ]
			} );

			model = editor.model;
			root = model.document.getRoot();
			mapper = editor.editing.mapper;
			view = editor.editing.view;
			viewDocument = view.document;
			domConverter = view.domConverter;
		} );

		afterEach( async () => {
			await editor.destroy();
			await editorElement.remove();
		} );

		it( 'should move text to other place in the same editor', () => {
			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const clock = sinon.useFakeTimers();
			const dataTransferMock = createDataTransfer();
			const spyClipboardOutput = sinon.spy();

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );

			fireDragStart( dataTransferMock );

			expect( dataTransferMock.getData( 'text/html' ) ).to.equal( 'foo' );
			expect( dataTransferMock.effectAllowed ).to.equal( 'copyMove' );

			expect( viewDocument.getRoot().getAttribute( 'draggable' ) ).to.equal( 'true' );
			expect( viewDocument.getRoot().getAttribute( 'spellcheck' ) ).to.equal( 'false' );

			expect( spyClipboardOutput.called ).to.be.true;
			expect( spyClipboardOutput.firstCall.firstArg.method ).to.equal( 'dragstart' );
			expect( spyClipboardOutput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );
			expect( stringifyView( spyClipboardOutput.firstCall.firstArg.content ) ).to.equal( 'foo' );

			// Dragging.

			const targetPosition1 = model.createPositionAt( root.getChild( 0 ), 3 );

			fireDragging( dataTransferMock, targetPosition1 );
			clock.tick( 100 );

			expect( model.markers.has( 'drop-target' ) ).to.be.true;
			expect( model.markers.get( 'drop-target' ).getRange().isCollapsed ).to.be.true;
			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual( targetPosition1 ) ).to.be.true;
			expect( getViewData( view ) ).to.equal( '<p>{foo}<span class="ck ck-clipboard-drop-target-position"></span>bar</p>' );

			// Dragging.

			const targetPosition2 = model.createPositionAt( root.getChild( 0 ), 5 );

			fireDragging( dataTransferMock, targetPosition2 );
			clock.tick( 100 );

			expect( model.markers.has( 'drop-target' ) ).to.be.true;
			expect( model.markers.get( 'drop-target' ).getRange().isCollapsed ).to.be.true;
			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual( targetPosition2 ) ).to.be.true;
			expect( getViewData( view ) ).to.equal( '<p>{foo}ba<span class="ck ck-clipboard-drop-target-position"></span>r</p>' );

			// Dropping.

			fireDrop( dataTransferMock, model.createPositionAt( root.getChild( 0 ), 6 ) );

			dataTransferMock.dropEffect = 'move';

			fireDragEnd( dataTransferMock );

			expect( viewDocument.getRoot().hasAttribute( 'draggable' ) ).to.be.false;
			expect( viewDocument.getRoot().hasAttribute( 'spellcheck' ) ).to.be.false;

			expect( model.markers.has( 'drop-target' ) ).to.be.false;

			expect( getModelData( model ) ).to.equal( '<paragraph>barfoo[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>barfoo{}</p>' );
		} );
	} );

	function fireDragStart( dataTransferMock ) {
		const eventData = prepareEventData( model.document.selection.getLastPosition() );

		viewDocument.fire( 'mousedown', {
			...eventData
		} );

		viewDocument.fire( 'dragstart', {
			...eventData,
			dataTransfer: dataTransferMock,
			stopPropagation: () => {}
		} );
	}

	function fireDragging( dataTransferMock, modelPosition ) {
		viewDocument.fire( 'dragging', {
			...prepareEventData( modelPosition ),
			method: 'dragging',
			dataTransfer: dataTransferMock,
			stopPropagation: () => {},
			preventDefault: () => {}
		} );
	}

	function fireDrop( dataTransferMock, modelPosition ) {
		viewDocument.fire( 'clipboardInput', {
			...prepareEventData( modelPosition ),
			method: 'drop',
			dataTransfer: dataTransferMock,
			stopPropagation: () => {},
			preventDefault: () => {}
		} );
	}

	function fireDragEnd( dataTransferMock ) {
		viewDocument.fire( 'dragend', {
			dataTransfer: dataTransferMock,
			stopPropagation: () => {},
			preventDefault: () => {}
		} );
	}

	function prepareEventData( modelPosition ) {
		const viewPosition = mapper.toViewPosition( modelPosition );
		const viewElement = mapper.findMappedViewAncestor( viewPosition );
		const domNode = viewPosition.parent.is( '$text' ) ?
			domConverter.findCorrespondingDomText( viewPosition.parent ).parentNode :
			domConverter.mapViewToDom( viewElement );

		return {
			domTarget: domNode,
			target: viewElement,
			targetRanges: [ view.createRange( viewPosition ) ]
		};
	}

	function createDataTransfer( data = {} ) {
		return {
			setData( type, value ) {
				data[ type ] = value;
			},

			getData( type ) {
				return data[ type ];
			}
		};
	}
} );
