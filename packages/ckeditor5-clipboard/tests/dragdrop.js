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
import { env } from '@ckeditor/ckeditor5-utils';

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

		it( 'should move text to other place in the same editor (not Firefox)', () => {
			const originalEnvGecko = env.isGecko;

			env.isGecko = false;

			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const clock = sinon.useFakeTimers();
			const dataTransferMock = createDataTransfer();
			const spyClipboardOutput = sinon.spy();
			const spyClipboardInput = sinon.spy();
			let targetPosition;

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDragging( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>'
			);

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 5 );
			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDragging( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{foo}ba<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>r</p>'
			);

			// Dropping.

			dataTransferMock.dropEffect = 'move';
			targetPosition = model.createPositionAt( root.getChild( 0 ), 6 );
			fireDrop( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expect( spyClipboardInput.called ).to.be.true;
			expect( spyClipboardInput.firstCall.firstArg.method ).to.equal( 'drop' );
			expect( spyClipboardInput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );

			fireDragEnd( dataTransferMock );
			expectFinalized();

			expect( getModelData( model ) ).to.equal( '<paragraph>barfoo[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>barfoo{}</p>' );

			env.isGecko = originalEnvGecko;
		} );

		it( 'should move text to other place in the same editor (in Firefox)', () => {
			const originalEnvGecko = env.isGecko;

			env.isGecko = true;

			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const clock = sinon.useFakeTimers();
			const dataTransferMock = createDataTransfer();
			const spyClipboardOutput = sinon.spy();
			const spyClipboardInput = sinon.spy();
			let targetPosition;

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDragging( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>'
			);

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 5 );
			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDragging( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{foo}ba<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>r</p>'
			);

			// Dropping.

			dataTransferMock.dropEffect = 'move';
			targetPosition = model.createPositionAt( root.getChild( 0 ), 6 );
			fireDrop( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expect( spyClipboardInput.called ).to.be.true;
			expect( spyClipboardInput.firstCall.firstArg.method ).to.equal( 'drop' );
			expect( spyClipboardInput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );

			fireDragEnd( dataTransferMock );
			expectFinalized();

			expect( getModelData( model ) ).to.equal( '<paragraph>barfoo[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>barfoo{}</p>' );

			env.isGecko = originalEnvGecko;
		} );

		it( 'should copy text to other place in the same editor (not Firefox)', () => {
			const originalEnvGecko = env.isGecko;

			env.isGecko = false;

			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const clock = sinon.useFakeTimers();
			const dataTransferMock = createDataTransfer();
			const spyClipboardOutput = sinon.spy();
			const spyClipboardInput = sinon.spy();
			let targetPosition;

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDragging( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>'
			);

			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDragging( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>'
			);

			// Dropping.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 6 );
			dataTransferMock.dropEffect = 'copy';
			dataTransferMock.effectAllowed = 'copy';
			fireDrop( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expect( spyClipboardInput.called ).to.be.true;
			expect( spyClipboardInput.firstCall.firstArg.method ).to.equal( 'drop' );
			expect( spyClipboardInput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );

			fireDragEnd( dataTransferMock );
			expectFinalized();

			expect( getModelData( model ) ).to.equal( '<paragraph>foobarfoo[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foobarfoo{}</p>' );

			env.isGecko = originalEnvGecko;
		} );

		it( 'should copy text to other place in the same editor (in Firefox)', () => {
			const originalEnvGecko = env.isGecko;

			env.isGecko = true;

			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const clock = sinon.useFakeTimers();
			const dataTransferMock = createDataTransfer();
			const spyClipboardOutput = sinon.spy();
			const spyClipboardInput = sinon.spy();
			let targetPosition;

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDragging( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>'
			);

			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDragging( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>'
			);

			// Dropping.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 6 );
			dataTransferMock.dropEffect = 'copy';
			dataTransferMock.effectAllowed = 'copy';
			fireDrop( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expect( spyClipboardInput.called ).to.be.true;
			expect( spyClipboardInput.firstCall.firstArg.method ).to.equal( 'drop' );
			expect( spyClipboardInput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );

			fireDragEnd( dataTransferMock );
			expectFinalized();

			expect( getModelData( model ) ).to.equal( '<paragraph>foobarfoo[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foobarfoo{}</p>' );

			env.isGecko = originalEnvGecko;
		} );

		it( 'should copy text to from outside the editor', () => {
			setModelData( model, '<paragraph>[]foobar</paragraph>' );

			const clock = sinon.useFakeTimers();
			const dataTransferMock = createDataTransfer( { 'text/html': 'abc' } );
			const spyClipboardInput = sinon.spy();
			let targetPosition;

			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 5 );
			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDragging( targetPosition );
			expect( dataTransferMock.dropEffect ).to.equal( 'copy' );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{}fooba<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>r</p>'
			);

			// Dropping.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
			dataTransferMock.dropEffect = 'copy';
			dataTransferMock.effectAllowed = 'copy';
			fireDrop( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expect( spyClipboardInput.called ).to.be.true;
			expect( spyClipboardInput.firstCall.firstArg.method ).to.equal( 'drop' );
			expect( spyClipboardInput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );

			fireDragEnd( dataTransferMock );
			expectFinalized();

			expect( getModelData( model ) ).to.equal( '<paragraph>fooabc[]bar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>fooabc{}bar</p>' );
		} );

		describe( 'dragstart', () => {
			it( 'should not start dragging if the selection is collapsed', () => {
				setModelData( model, '<paragraph>foo[]bar</paragraph>' );

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = sinon.spy();
				const spyPreventDefault = sinon.spy();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );

				fireDragStart( dataTransferMock, spyPreventDefault );

				expect( spyPreventDefault.called ).to.be.true;
				expect( spyClipboardOutput.notCalled ).to.be.true;
			} );

			it( 'should not start dragging if the root editable would be dragged itself', () => {
				setModelData( model, '<paragraph>[foo]bar</paragraph>' );

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = sinon.spy();
				const spyPreventDefault = sinon.spy();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );

				const eventData = prepareEventData( model.createPositionAt( root.getChild( 0 ), 3 ) );
				eventData.domTarget = view.getDomRoot();
				eventData.target = domConverter.mapDomToView( view.getDomRoot() );

				viewDocument.fire( 'mousedown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					preventDefault: spyPreventDefault,
					stopPropagation: () => {
					}
				} );

				expect( spyPreventDefault.called ).to.be.true;
				expect( spyClipboardOutput.notCalled ).to.be.true;
			} );

			it( 'should not start dragging if the editor is read-only', () => {
				setModelData( model, '<paragraph>[foo]bar</paragraph>' );

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = sinon.spy();

				editor.isReadOnly = true;

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );

				fireDragStart( dataTransferMock );

				expect( viewDocument.getRoot().hasAttribute( 'draggable' ) ).to.be.false;
				expect( viewDocument.getRoot().hasAttribute( 'spellcheck' ) ).to.be.false;
				expect( spyClipboardOutput.notCalled ).to.be.true;
			} );
		} );

		describe( 'dragenter', () => {
			it( 'should focus the editor while dragging over the editable', () => {
				const stubFocus = sinon.stub( view, 'focus' );

				viewDocument.fire( 'dragenter' );

				expect( stubFocus.calledOnce ).to.be.true;
			} );

			it( 'should not focus the editor while dragging over disabled editor', () => {
				const stubFocus = sinon.stub( view, 'focus' );

				editor.isReadOnly = true;

				viewDocument.fire( 'dragenter' );

				expect( stubFocus.calledOnce ).to.be.false;
			} );
		} );

		describe( 'dragleave', () => {
			it( 'should remove drop target marker', () => {
				setModelData( model, '<paragraph>[foo]bar</paragraph>' );

				const clock = sinon.useFakeTimers();
				const dataTransferMock = createDataTransfer();

				fireDragStart( dataTransferMock );
				expectDragStarted( dataTransferMock, 'foo' );

				fireDragging( dataTransferMock, model.createPositionAt( root.getChild( 0 ), 3 ) );
				clock.tick( 100 );

				viewDocument.fire( 'dragleave' );
				expect( model.markers.has( 'drop-target' ) ).to.be.true;

				clock.tick( 100 );
				expect( model.markers.has( 'drop-target' ) ).to.be.false;
			} );

			it( 'should not focus the editor while dragging over disabled editor', () => {
				const stubFocus = sinon.stub( view, 'focus' );

				editor.isReadOnly = true;

				viewDocument.fire( 'dragenter' );

				expect( stubFocus.calledOnce ).to.be.false;
			} );
		} );

		describe( 'dragend', () => {
			it( 'should properly move content even if dragend event is not fired', () => {
				setModelData( model, '<paragraph>[foo]bar</paragraph>' );

				const clock = sinon.useFakeTimers();
				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = sinon.spy();
				const spyClipboardInput = sinon.spy();
				let targetPosition;

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
				viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

				fireDragStart( dataTransferMock );
				expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

				// Dragging.

				targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
				fireDragging( dataTransferMock, targetPosition );
				clock.tick( 100 );

				expectDragging( targetPosition );
				expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
					'<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>'
				);

				// Dragging.

				targetPosition = model.createPositionAt( root.getChild( 0 ), 5 );
				fireDragging( dataTransferMock, targetPosition );
				clock.tick( 100 );

				expectDragging( targetPosition );
				expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
					'<p>{foo}ba<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>r</p>'
				);

				// Dropping.

				dataTransferMock.dropEffect = 'move';
				targetPosition = model.createPositionAt( root.getChild( 0 ), 6 );
				fireDrop( dataTransferMock, targetPosition );
				clock.tick( 100 );

				expect( spyClipboardInput.called ).to.be.true;
				expect( spyClipboardInput.firstCall.firstArg.method ).to.equal( 'drop' );
				expect( spyClipboardInput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );

				expect( getModelData( model ) ).to.equal( '<paragraph>barfoo[]</paragraph>' );
				expect( getViewData( view ) ).to.equal( '<p>barfoo{}</p>' );

				expectFinalized();
			} );
		} );

		describe( 'dragging', () => {
			it( 'should not allow dropping if the editor is read-only', () => {
				setModelData( model, '<paragraph>[foo]bar</paragraph>' );

				const clock = sinon.useFakeTimers();
				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = sinon.spy();
				const spyClipboardInput = sinon.spy();
				let targetPosition;

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
				viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

				fireDragStart( dataTransferMock );
				expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

				// Dragging.

				targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
				fireDragging( dataTransferMock, targetPosition );
				clock.tick( 100 );

				expectDragging( targetPosition );
				expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
					'<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>'
				);

				editor.isReadOnly = true;

				// Dragging.

				targetPosition = model.createPositionAt( root.getChild( 0 ), 5 );
				fireDragging( dataTransferMock, targetPosition );
				clock.tick( 100 );

				expect( dataTransferMock.dropEffect ).to.equal( 'none' );
				expect( model.markers.has( 'drop-target' ) ).to.be.false;
				expect( getViewData( view, { renderUIElements: true } ) ).to.equal( '<p>{foo}bar</p>' );

				editor.isReadOnly = false;
				// Dropping.

				dataTransferMock.dropEffect = 'move';
				targetPosition = model.createPositionAt( root.getChild( 0 ), 6 );
				fireDrop( dataTransferMock, targetPosition );
				clock.tick( 100 );

				expect( spyClipboardInput.called ).to.be.true;
				expect( spyClipboardInput.firstCall.firstArg.method ).to.equal( 'drop' );
				expect( spyClipboardInput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );

				fireDragEnd( dataTransferMock );
				expectFinalized();

				expect( getModelData( model ) ).to.equal( '<paragraph>foobarfoo[]</paragraph>' );
				expect( getViewData( view ) ).to.equal( '<p>foobarfoo{}</p>' );
			} );
		} );

		function expectDragStarted( dataTransferMock, data, spyClipboardOutput, effectAllowed = 'copyMove' ) {
			expect( dataTransferMock.getData( 'text/html' ) ).to.equal( data );
			expect( dataTransferMock.effectAllowed ).to.equal( effectAllowed );

			expect( viewDocument.getRoot().getAttribute( 'draggable' ) ).to.equal( 'true' );
			expect( viewDocument.getRoot().getAttribute( 'spellcheck' ) ).to.equal( 'false' );

			if ( spyClipboardOutput ) {
				expect( spyClipboardOutput.called ).to.be.true;
				expect( spyClipboardOutput.firstCall.firstArg.method ).to.equal( 'dragstart' );
				expect( spyClipboardOutput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );
				expect( stringifyView( spyClipboardOutput.firstCall.firstArg.content ) ).to.equal( data );
			}
		}

		function expectDragging( targetPosition ) {
			expect( model.markers.has( 'drop-target' ), 'drop-target marker exists' ).to.be.true;
			expect( model.markers.get( 'drop-target' ).getRange().isCollapsed, 'drop-target marker range is collapsed' ).to.be.true;
			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual( targetPosition ), 'drop-target marker range' ).to.be.true;
		}

		function expectFinalized() {
			expect( viewDocument.getRoot().hasAttribute( 'draggable' ) ).to.be.false;
			expect( viewDocument.getRoot().hasAttribute( 'spellcheck' ) ).to.be.false;

			expect( model.markers.has( 'drop-target' ) ).to.be.false;
		}
	} );

	function fireDragStart( dataTransferMock, preventDefault = () => {} ) {
		const eventData = prepareEventData( model.document.selection.getLastPosition() );

		viewDocument.fire( 'mousedown', {
			...eventData
		} );

		viewDocument.fire( 'dragstart', {
			...eventData,
			dataTransfer: dataTransferMock,
			stopPropagation: () => {},
			preventDefault
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
