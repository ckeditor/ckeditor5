/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClipboardPipeline from '../src/clipboardpipeline';
import DragDrop from '../src/dragdrop';
import PastePlainText from '../src/pasteplaintext';

import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Table from '@ckeditor/ckeditor5-table/src/table';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import env from '@ckeditor/ckeditor5-utils/src/env';

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

	it( 'should be disabled on Android', async () => {
		env.isAndroid = true;

		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		const editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ DragDrop ]
		} );

		const plugin = editor.plugins.get( 'DragDrop' );

		expect( plugin.isEnabled ).to.be.false;

		await editor.destroy();
		await editorElement.remove();

		env.isAndroid = false;
	} );

	describe( 'dragging', () => {
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
			dataTransferMock.effectAllowed = 'copyMove';
			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDraggingMarker( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>'
			);

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 5 );
			dataTransferMock.effectAllowed = 'copy';
			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDraggingMarker( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{foo}ba<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>r</p>'
			);

			// Dropping.

			dataTransferMock.effectAllowed = 'copyMove';
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

			expectDraggingMarker( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>'
			);

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 5 );
			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDraggingMarker( targetPosition );
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
			dataTransferMock.effectAllowed = 'copy';
			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDraggingMarker( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>'
			);

			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDraggingMarker( targetPosition );
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

			expectDraggingMarker( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>'
			);

			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDraggingMarker( targetPosition );
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

		it( 'should move text to other place in the same editor (over some widget)', () => {
			setModelData( model, '<paragraph>[foo]bar</paragraph><horizontalLine></horizontalLine>' );

			const clock = sinon.useFakeTimers();
			const dataTransferMock = createDataTransfer();
			const spyClipboardOutput = sinon.spy();
			const spyClipboardInput = sinon.spy();

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dragging.

			const targetRange = model.createRangeOn( root.getChild( 1 ) );
			fireDragging( dataTransferMock, targetRange );
			clock.tick( 100 );

			expectDraggingMarker( targetRange );
			expect( getViewData( view ) ).to.equal(
				'<p>{foo}bar</p>' +
				'<div class="ck-clipboard-drop-target-range ck-horizontal-line ck-widget" contenteditable="false">' +
					'<hr></hr>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</div>'
			);

			// Dropping.

			dataTransferMock.dropEffect = 'move';
			fireDrop( dataTransferMock, targetRange );
			clock.tick( 100 );

			expect( spyClipboardInput.called ).to.be.true;
			expect( spyClipboardInput.firstCall.firstArg.method ).to.equal( 'drop' );
			expect( spyClipboardInput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );

			fireDragEnd( dataTransferMock );
			expectFinalized();

			expect( getModelData( model ) ).to.equal( '<paragraph>bar</paragraph><paragraph>foo[]</paragraph>' );
		} );

		it( 'should do nothing if dropped on dragged range', () => {
			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const clock = sinon.useFakeTimers();
			const dataTransferMock = createDataTransfer();
			const spyClipboardOutput = sinon.spy();
			const spyClipboardInput = sinon.spy();

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dropping.

			const targetPosition = model.createPositionAt( root.getChild( 0 ), 2 );
			dataTransferMock.dropEffect = 'move';
			dataTransferMock.effectAllowed = 'copyMove';
			fireDrop( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expect( spyClipboardInput.called ).to.be.false;

			fireDragEnd( dataTransferMock );
			expectFinalized();

			expect( getModelData( model ) ).to.equal( '<paragraph>[foo]bar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>{foo}bar</p>' );
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

			expectDraggingMarker( targetPosition );
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

		it( 'should not remove dragged range if it is from other drag session', () => {
			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const clock = sinon.useFakeTimers();
			let dataTransferMock = createDataTransfer();
			const spyClipboardOutput = sinon.spy();
			const spyClipboardInput = sinon.spy();

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dragging finalized outside the editor without proper dragend event.

			dataTransferMock = createDataTransfer( { 'text/html': 'abc' } );

			let targetPosition = model.createPositionAt( root.getChild( 0 ), 2 );
			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDraggingMarker( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{fo<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>o}bar</p>'
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

		it( 'should not remove dragged range if insert into drop target was not allowed', () => {
			editor.model.schema.register( 'caption', {
				allowIn: '$root',
				allowContentOf: '$block',
				isObject: true
			} );

			editor.conversion.elementToElement( {
				view: 'caption',
				model: 'caption'
			} );

			setModelData( model,
				'<caption>foo</caption>' +
				'[<table><tableRow><tableCell><paragraph>bar</paragraph></tableCell></tableRow></table>]'
			);

			const dataTransferMock = createDataTransfer();
			const viewElement = viewDocument.getRoot().getChild( 1 );
			const domNode = domConverter.mapViewToDom( viewElement );

			const eventData = {
				domTarget: domNode,
				target: viewElement,
				domEvent: {}
			};

			viewDocument.fire( 'mousedown', {
				...eventData
			} );

			viewDocument.fire( 'dragstart', {
				...eventData,
				dataTransfer: dataTransferMock,
				stopPropagation: () => {}
			} );

			expect( dataTransferMock.getData( 'text/html' ) ).to.equal(
				'<figure class="table"><table><tbody><tr><td>bar</td></tr></tbody></table></figure>'
			);

			const targetPosition = model.createPositionAt( root.getChild( 0 ), 2 );
			fireDrop( dataTransferMock, targetPosition );

			expect( getModelData( model ) ).to.equal(
				'<caption>fo[]o</caption>' +
				'<table><tableRow><tableCell><paragraph>bar</paragraph></tableCell></tableRow></table>'
			);
		} );

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

			expectDraggingMarker( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>'
			);

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 5 );
			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDraggingMarker( targetPosition );
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

			expectDraggingMarker( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>'
			);

			editor.enableReadOnlyMode( 'unit-test' );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 5 );
			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expect( dataTransferMock.dropEffect ).to.equal( 'none' );
			expect( model.markers.has( 'drop-target' ) ).to.be.false;
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal( '<p>{foo}bar</p>' );

			editor.disableReadOnlyMode( 'unit-test' );
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

		it( 'should not allow dropping if the plugin is disabled', () => {
			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const plugin = editor.plugins.get( 'DragDrop' );
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

			expectDraggingMarker( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>'
			);

			plugin.forceDisabled( 'test' );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 5 );
			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expect( dataTransferMock.dropEffect ).to.equal( 'none' );
			expect( model.markers.has( 'drop-target' ) ).to.be.false;
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal( '<p>{foo}bar</p>' );

			plugin.clearForceDisabled( 'test' );
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

		it( 'should do nothing if dragging on Android', () => {
			env.isAndroid = true;

			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const dataTransferMock = createDataTransfer();
			const spyClipboardInput = sinon.spy();

			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );

			expect( dataTransferMock.getData( 'text/html' ) ).to.equal( 'foo' );
			expect( dataTransferMock.effectAllowed ).to.equal( 'copyMove' );

			expect( viewDocument.getRoot().hasAttribute( 'draggable' ) ).to.be.false;

			env.isAndroid = false;
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

			it( 'should not start dragging if the editable would be dragged itself', () => {
				setModelData( model, '<table><tableRow><tableCell><paragraph>[foo]bar</paragraph></tableCell></tableRow></table>' );

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = sinon.spy();
				const spyPreventDefault = sinon.spy();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );

				const modelElement = root.getNodeByPath( [ 0, 0, 0 ] );
				const eventData = prepareEventData( model.createPositionAt( modelElement.getChild( 0 ), 3 ) );
				eventData.target = mapper.toViewElement( modelElement );
				eventData.domTarget = domConverter.mapViewToDom( eventData.target );

				expect( eventData.target.is( 'editableElement', 'td' ) ).to.be.true;

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

			it( 'should mark allowed effect as "copy" if the editor is read-only', () => {
				setModelData( model, '<paragraph>[foo]bar</paragraph>' );

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = sinon.spy();

				editor.enableReadOnlyMode( 'unit-test' );

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );

				fireDragStart( dataTransferMock );

				expect( viewDocument.getRoot().hasAttribute( 'draggable' ) ).to.be.false;
				expect( dataTransferMock.effectAllowed ).to.equal( 'copy' );
			} );

			it( 'should start dragging by grabbing the widget selection handle', () => {
				setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = sinon.spy();
				const spyClipboardInput = sinon.spy();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
				viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

				const domNode = view.getDomRoot().querySelector( '.ck-widget__selection-handle' );
				const widgetViewElement = viewDocument.getRoot().getChild( 1 );
				const selectionHandleElement = widgetViewElement.getChild( 0 );

				expect( selectionHandleElement.hasClass( 'ck-widget__selection-handle' ) ).to.be.true;

				const eventData = {
					domTarget: domNode,
					target: selectionHandleElement,
					domEvent: {}
				};

				viewDocument.fire( 'mousedown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					stopPropagation: () => {}
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).to.equal(
					'<figure class="table"><table><tbody><tr><td>abc</td></tr></tbody></table></figure>'
				);

				expect( widgetViewElement.getAttribute( 'draggable' ) ).to.equal( 'true' );

				expect( spyClipboardOutput.called ).to.be.true;
				expect( spyClipboardOutput.firstCall.firstArg.method ).to.equal( 'dragstart' );
				expect( spyClipboardOutput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );
				expect( stringifyView( spyClipboardOutput.firstCall.firstArg.content ) ).to.equal(
					'<figure class="table"><table><tbody><tr><td><p>abc</p></td></tr></tbody></table></figure>'
				);

				dataTransferMock.dropEffect = 'move';
				const targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
				fireDrop( dataTransferMock, targetPosition );

				expect( spyClipboardInput.called ).to.be.true;
				expect( spyClipboardInput.firstCall.firstArg.method ).to.equal( 'drop' );
				expect( spyClipboardInput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );

				fireDragEnd( dataTransferMock );
				expectFinalized();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'[<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>]' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should start dragging by grabbing the widget selection handle (in read only mode)', () => {
				setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>'
				);

				editor.enableReadOnlyMode( 'unit-test' );

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = sinon.spy();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );

				const domNode = view.getDomRoot().querySelector( '.ck-widget__selection-handle' );
				const widgetViewElement = viewDocument.getRoot().getChild( 1 );
				const selectionHandleElement = widgetViewElement.getChild( 0 );

				expect( selectionHandleElement.hasClass( 'ck-widget__selection-handle' ) ).to.be.true;

				const eventData = {
					domTarget: domNode,
					target: selectionHandleElement,
					domEvent: {}
				};

				viewDocument.fire( 'mousedown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					stopPropagation: () => {}
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).to.equal(
					'<figure class="table"><table><tbody><tr><td>abc</td></tr></tbody></table></figure>'
				);

				expect( widgetViewElement.getAttribute( 'draggable' ) ).to.equal( 'true' );

				expect( spyClipboardOutput.called ).to.be.true;
				expect( spyClipboardOutput.firstCall.firstArg.method ).to.equal( 'dragstart' );
				expect( spyClipboardOutput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );
				expect( stringifyView( spyClipboardOutput.firstCall.firstArg.content ) ).to.equal(
					'<figure class="table"><table><tbody><tr><td><p>abc</p></td></tr></tbody></table></figure>'
				);
			} );

			it( 'should start dragging by grabbing the widget element directly', () => {
				setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<horizontalLine></horizontalLine>'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = sinon.spy();
				const spyClipboardInput = sinon.spy();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
				viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

				const widgetViewElement = viewDocument.getRoot().getChild( 1 );
				const domNode = domConverter.mapViewToDom( widgetViewElement );

				const eventData = {
					domTarget: domNode,
					target: widgetViewElement,
					domEvent: {}
				};

				viewDocument.fire( 'mousedown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					stopPropagation: () => {}
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).to.equal( '<hr>' );

				expect( widgetViewElement.getAttribute( 'draggable' ) ).to.equal( 'true' );

				expect( spyClipboardOutput.called ).to.be.true;
				expect( spyClipboardOutput.firstCall.firstArg.method ).to.equal( 'dragstart' );
				expect( spyClipboardOutput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );
				expect( stringifyView( spyClipboardOutput.firstCall.firstArg.content ) ).to.equal( '<hr></hr>' );

				dataTransferMock.dropEffect = 'move';
				const targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
				fireDrop( dataTransferMock, targetPosition );

				expect( spyClipboardInput.called ).to.be.true;
				expect( spyClipboardInput.firstCall.firstArg.method ).to.equal( 'drop' );
				expect( spyClipboardInput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );

				fireDragEnd( dataTransferMock );
				expectFinalized();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'[<horizontalLine></horizontalLine>]' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should start dragging the selected text fragment', () => {
				setModelData( model,
					'<paragraph>[foo]bar</paragraph>'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = sinon.spy();
				const spyClipboardInput = sinon.spy();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
				viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

				const viewNode = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
				const domNode = domConverter.findCorrespondingDomText( viewNode );

				viewDocument.fire( 'mousedown', {
					domTarget: domNode.parentNode,
					target: viewNode.parent,
					domEvent: {}
				} );

				viewDocument.fire( 'dragstart', {
					domTarget: domNode,
					target: null, // text node
					domEvent: {},
					dataTransfer: dataTransferMock,
					stopPropagation: () => {}
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).to.equal( 'foo' );

				expect( spyClipboardOutput.called ).to.be.true;
				expect( spyClipboardOutput.firstCall.firstArg.method ).to.equal( 'dragstart' );
				expect( spyClipboardOutput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );
				expect( stringifyView( spyClipboardOutput.firstCall.firstArg.content ) ).to.equal( 'foo' );

				dataTransferMock.dropEffect = 'move';
				const targetPosition = model.createPositionAt( root.getChild( 0 ), 4 );
				fireDrop( dataTransferMock, targetPosition );

				expect( spyClipboardInput.called ).to.be.true;
				expect( spyClipboardInput.firstCall.firstArg.method ).to.equal( 'drop' );
				expect( spyClipboardInput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );

				fireDragEnd( dataTransferMock );
				expectFinalized();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>bfoo[]ar</paragraph>'
				);
			} );

			it( 'should start dragging by grabbing a widget nested element (but not nested editable)', () => {
				setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<horizontalLine></horizontalLine>'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = sinon.spy();
				const spyClipboardInput = sinon.spy();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
				viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

				const widgetViewElement = viewDocument.getRoot().getChild( 1 );
				const viewElement = widgetViewElement.getChild( 0 );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'element', 'hr' ) ).to.be.true;

				const eventData = {
					domTarget: domNode,
					target: viewElement,
					domEvent: {}
				};

				viewDocument.fire( 'mousedown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					stopPropagation: () => {}
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).to.equal( '<hr>' );

				expect( widgetViewElement.getAttribute( 'draggable' ) ).to.equal( 'true' );

				expect( spyClipboardOutput.called ).to.be.true;
				expect( spyClipboardOutput.firstCall.firstArg.method ).to.equal( 'dragstart' );
				expect( spyClipboardOutput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );
				expect( stringifyView( spyClipboardOutput.firstCall.firstArg.content ) ).to.equal( '<hr></hr>' );

				dataTransferMock.dropEffect = 'move';
				const targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
				fireDrop( dataTransferMock, targetPosition );

				expect( spyClipboardInput.called ).to.be.true;
				expect( spyClipboardInput.firstCall.firstArg.method ).to.equal( 'drop' );
				expect( spyClipboardInput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );

				fireDragEnd( dataTransferMock );
				expectFinalized();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'[<horizontalLine></horizontalLine>]' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should not start dragging a widget if it is not a target for an event', () => {
				setModelData( model,
					'<paragraph>foobar</paragraph>' +
					'[<horizontalLine></horizontalLine>]'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = sinon.spy();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );

				const editableElement = viewDocument.getRoot();
				const editableDomNode = domConverter.mapViewToDom( editableElement );

				const eventData = {
					domTarget: editableDomNode,
					target: editableElement,
					domEvent: {}
				};

				viewDocument.fire( 'mousedown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					stopPropagation: () => {},
					preventDefault: () => {}
				} );

				expect( spyClipboardOutput.notCalled ).to.be.true;
				expect( dataTransferMock.getData( 'text/html' ) ).to.be.undefined;
			} );

			it( 'should not start dragging a widget if it is not a target for an event (but it was selected)', () => {
				setModelData( model,
					'<paragraph>foobar</paragraph>' +
					'[<horizontalLine></horizontalLine>]'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = sinon.spy();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );

				const targetElement = viewDocument.getRoot().getChild( 0 );
				const targetDomNode = domConverter.mapViewToDom( targetElement );

				const eventData = {
					domTarget: targetDomNode,
					target: targetElement,
					domEvent: {}
				};

				viewDocument.fire( 'mousedown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					stopPropagation: () => {},
					preventDefault: () => {}
				} );

				expect( spyClipboardOutput.notCalled ).to.be.true;
				expect( dataTransferMock.getData( 'text/html' ) ).to.be.undefined;
			} );

			it( 'should not start dragging a widget when some element inside nested editable is dragged', () => {
				setModelData( model,
					'<paragraph>foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>[<softBreak></softBreak>]</paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = sinon.spy();
				const spyClipboardInput = sinon.spy();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
				viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

				const modelElement = model.document.getRoot().getNodeByPath( [ 1, 0, 0, 0, 0 ] );
				const viewElement = mapper.toViewElement( modelElement );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'element', 'br' ) ).to.be.true;

				const eventData = {
					domTarget: domNode,
					target: viewElement,
					domEvent: {}
				};

				viewDocument.fire( 'mousedown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					stopPropagation: () => {}
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).to.equal( '<br>' );

				const modelCellElement = model.document.getRoot().getNodeByPath( [ 1, 0, 0 ] );
				const viewCellElement = mapper.toViewElement( modelCellElement );
				expect( viewCellElement.is( 'editableElement', 'td' ) ).to.be.true;
				expect( viewCellElement.getAttribute( 'draggable' ) ).to.equal( 'true' );

				expect( spyClipboardOutput.called ).to.be.true;
				expect( spyClipboardOutput.firstCall.firstArg.method ).to.equal( 'dragstart' );
				expect( spyClipboardOutput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );
				expect( stringifyView( spyClipboardOutput.firstCall.firstArg.content ) ).to.equal( '<br></br>' );

				dataTransferMock.dropEffect = 'move';
				const targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
				fireDrop( dataTransferMock, targetPosition );

				expect( spyClipboardInput.called ).to.be.true;
				expect( spyClipboardInput.firstCall.firstArg.method ).to.equal( 'drop' );
				expect( spyClipboardInput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );

				fireDragEnd( dataTransferMock );
				expectFinalized();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo<softBreak></softBreak>[]bar</paragraph>' +
					'<table><tableRow><tableCell><paragraph></paragraph></tableCell></tableRow></table>'
				);
			} );

			it( 'should remove "draggable" attribute from widget element if mouseup before dragging start (selection handle)', () => {
				setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>'
				);

				const clock = sinon.useFakeTimers();
				const domNode = view.getDomRoot().querySelector( '.ck-widget__selection-handle' );
				const widgetViewElement = viewDocument.getRoot().getChild( 1 );
				const selectionHandleElement = widgetViewElement.getChild( 0 );

				expect( selectionHandleElement.hasClass( 'ck-widget__selection-handle' ) ).to.be.true;

				const eventData = {
					domTarget: domNode,
					target: selectionHandleElement,
					domEvent: {}
				};

				viewDocument.fire( 'mousedown', {
					...eventData
				} );

				expect( widgetViewElement.getAttribute( 'draggable' ) ).to.equal( 'true' );

				viewDocument.fire( 'mouseup' );
				clock.tick( 50 );

				expect( widgetViewElement.hasAttribute( 'draggable' ) ).to.be.false;
			} );

			it( 'should remove "draggable" attribute from widget element if mouseup before dragging start (widget)', () => {
				setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<horizontalLine></horizontalLine>'
				);

				const clock = sinon.useFakeTimers();
				const widgetViewElement = viewDocument.getRoot().getChild( 1 );
				const viewElement = widgetViewElement.getChild( 0 );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'element', 'hr' ) ).to.be.true;

				const eventData = {
					domTarget: domNode,
					target: viewElement,
					domEvent: {}
				};

				viewDocument.fire( 'mousedown', {
					...eventData
				} );

				expect( widgetViewElement.getAttribute( 'draggable' ) ).to.equal( 'true' );

				viewDocument.fire( 'mouseup' );
				clock.tick( 50 );

				expect( widgetViewElement.hasAttribute( 'draggable' ) ).to.be.false;
			} );

			it( 'should do nothing on mouseup on android', () => {
				env.isAndroid = true;

				setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<horizontalLine></horizontalLine>'
				);

				const clock = sinon.useFakeTimers();
				const widgetViewElement = viewDocument.getRoot().getChild( 1 );
				const viewElement = widgetViewElement.getChild( 0 );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'element', 'hr' ) ).to.be.true;

				const eventData = {
					domTarget: domNode,
					target: viewElement,
					domEvent: {},
					preventDefault() {}
				};

				viewDocument.fire( 'mousedown', {
					...eventData
				} );

				expect( widgetViewElement.hasAttribute( 'draggable' ) ).to.be.false;

				viewDocument.fire( 'mouseup' );
				clock.tick( 50 );

				expect( widgetViewElement.hasAttribute( 'draggable' ) ).to.be.false;

				env.isAndroid = false;
			} );

			it( 'should remove "draggable" attribute from editable element', () => {
				setModelData( model, '<paragraph>[foo]bar</paragraph>' );

				const clock = sinon.useFakeTimers();
				const editableElement = viewDocument.getRoot();
				const viewElement = editableElement.getChild( 0 );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'element', 'p' ) ).to.be.true;

				const eventData = {
					domTarget: domNode,
					target: viewElement,
					domEvent: {}
				};

				viewDocument.fire( 'mousedown', {
					...eventData
				} );

				expect( editableElement.getAttribute( 'draggable' ) ).to.equal( 'true' );

				viewDocument.fire( 'mouseup' );
				clock.tick( 50 );

				expect( editableElement.hasAttribute( 'draggable' ) ).to.be.false;
			} );
		} );

		describe( 'dragenter', () => {
			it( 'should focus the editor while dragging over the editable', () => {
				const stubFocus = sinon.stub( view, 'focus' );

				viewDocument.fire( 'dragenter', {} );

				expect( stubFocus.calledOnce ).to.be.true;
			} );

			it( 'should not focus the editor while dragging over disabled editor', () => {
				const stubFocus = sinon.stub( view, 'focus' );

				editor.enableReadOnlyMode( 'unit-test' );

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

			it( 'should not remove drop target marker if dragging left some nested element', () => {
				setModelData( model, '<paragraph>[foo]bar</paragraph>' );

				const spy = sinon.spy();
				const clock = sinon.useFakeTimers();
				const dataTransferMock = createDataTransfer();

				model.markers.on( 'update:drop-target', ( evt, marker, oldRange, newRange ) => {
					if ( !newRange ) {
						spy();
					}
				} );

				fireDragStart( dataTransferMock );
				expectDragStarted( dataTransferMock, 'foo' );

				let targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
				fireDragging( dataTransferMock, targetPosition );
				clock.tick( 100 );

				viewDocument.fire( 'dragleave' );
				expectDraggingMarker( targetPosition );

				clock.tick( 10 );
				expectDraggingMarker( targetPosition );

				targetPosition = model.createPositionAt( root.getChild( 0 ), 4 );
				fireDragging( dataTransferMock, targetPosition );
				clock.tick( 60 );

				expectDraggingMarker( targetPosition );
				expect( spy.notCalled ).to.be.true;
			} );

			it( 'should not focus the editor while dragging over disabled editor', () => {
				const stubFocus = sinon.stub( view, 'focus' );

				editor.enableReadOnlyMode( 'unit-test' );

				viewDocument.fire( 'dragenter' );

				expect( stubFocus.calledOnce ).to.be.false;
			} );
		} );

		describe( 'dragover', () => {
			it( 'should put drop target marker inside a text node', () => {
				setModelData( model, '<paragraph>[]foobar</paragraph>' );

				const dataTransferMock = createDataTransfer();
				const targetPosition = model.createPositionAt( root.getChild( 0 ), 2 );

				fireDragging( dataTransferMock, targetPosition );

				expectDraggingMarker( targetPosition );
			} );

			it( 'should put drop target marker inside and attribute element', () => {
				setModelData( model, '<paragraph>[]foo<$text bold="true">bar</$text></paragraph>' );

				const dataTransferMock = createDataTransfer();

				const viewElement = viewDocument.getRoot().getChild( 0 ).getChild( 1 );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'attributeElement' ) ).to.be.true;

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: viewElement,
					targetRanges: [ view.createRange( view.createPositionAt( viewElement.getChild( 0 ), 2 ) ) ],
					dataTransfer: dataTransferMock
				} );

				expectDraggingMarker( model.createPositionAt( root.getChild( 0 ), 5 ) );
			} );

			it( 'should find ancestor widget while hovering over the selection handle (UIElement)', () => {
				setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();

				const viewElement = viewDocument.getRoot().getChild( 1 ).getChild( 0 );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.hasClass( 'ck-widget__selection-handle' ) ).to.be.true;

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: viewElement,
					dataTransfer: dataTransferMock
				} );

				expectDraggingMarker( model.createRangeOn( root.getChild( 1 ) ) );
			} );

			it( 'should find ancestor widget while hovering over inner content of widget (but not nested editable)', () => {
				setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();

				const modelElement = root.getNodeByPath( [ 1, 0 ] );
				const viewElement = mapper.toViewElement( modelElement );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'element', 'tr' ) ).to.be.true;

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: viewElement,
					dataTransfer: dataTransferMock
				} );

				expectDraggingMarker( model.createRangeOn( root.getChild( 1 ) ) );
			} );

			it( 'should find drop position while hovering over empty nested editable', () => {
				setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph></paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();

				const modelElement = root.getNodeByPath( [ 1, 0, 0 ] );
				const viewElement = mapper.toViewElement( modelElement );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'element', 'td' ) ).to.be.true;

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: viewElement,
					dataTransfer: dataTransferMock
				} );

				expectDraggingMarker( model.createPositionAt( root.getNodeByPath( [ 1, 0, 0, 0 ] ), 0 ) );
			} );

			it( 'should find drop position while hovering over space between blocks', () => {
				setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph></paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();

				const rootElement = viewDocument.getRoot();
				const viewElement = rootElement;
				const domNode = domConverter.mapViewToDom( viewElement );

				const nestedModelParagraph = root.getNodeByPath( [ 1, 0, 0, 0 ] );
				const nestedViewParagraph = mapper.toViewElement( nestedModelParagraph );

				expect( viewElement.is( 'rootElement' ) ).to.be.true;

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: rootElement,
					targetRanges: [ view.createRange( view.createPositionAt( nestedViewParagraph, 0 ) ) ],
					dataTransfer: dataTransferMock
				} );

				expectDraggingMarker( model.createRangeOn( root.getChild( 1 ) ) );
			} );

			it( 'should find drop position while hovering over table figure', () => {
				setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();

				const rootElement = viewDocument.getRoot();
				const modelElement = root.getNodeByPath( [ 1, 0, 0 ] );
				const viewElement = mapper.toViewElement( modelElement );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'element', 'td' ) ).to.be.true;

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: viewElement,
					targetRanges: [ view.createRange( view.createPositionAt( rootElement.getChild( 1 ), 1 ) ) ],
					dataTransfer: dataTransferMock
				} );

				expectDraggingMarker( model.createRangeOn( root.getChild( 1 ) ) );
			} );

			it( 'should find drop position while hovering over table with target range inside figure', () => {
				setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();

				const rootElement = viewDocument.getRoot();
				const modelElement = root.getNodeByPath( [ 1, 0, 0 ] );
				const viewElement = mapper.toViewElement( modelElement );
				const domNode = domConverter.mapViewToDom( viewElement );

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: viewElement,
					targetRanges: [ view.createRange( view.createPositionAt( rootElement.getChild( 1 ), 1 ) ) ],
					dataTransfer: dataTransferMock
				} );

				expectDraggingMarker( model.createRangeOn( root.getChild( 1 ) ) );
			} );

			it( 'should find drop position while hovering over table with target range inside tr', () => {
				setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();

				const modelElement = root.getNodeByPath( [ 1, 0, 0 ] );
				const viewElement = mapper.toViewElement( modelElement );
				const domNode = domConverter.mapViewToDom( viewElement );

				const tableRow = root.getNodeByPath( [ 1, 0 ] );
				const tableRowView = mapper.toViewElement( tableRow );

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: viewElement,
					targetRanges: [ view.createRange( view.createPositionAt( tableRowView, 0 ) ) ],
					dataTransfer: dataTransferMock
				} );

				expectDraggingMarker( model.createRangeOn( root.getChild( 1 ) ) );
			} );

			it( 'should find drop position while hovering over space between blocks but the following element is not an object', () => {
				setModelData( model,
					'<paragraph>[]foo</paragraph>' +
					'<paragraph>bar</paragraph>'
				);

				const dataTransferMock = createDataTransfer();

				const rootElement = viewDocument.getRoot();
				const viewElement = rootElement;
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'rootElement' ) ).to.be.true;

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: rootElement,
					targetRanges: [ view.createRange( view.createPositionAt( rootElement.getChild( 1 ), 0 ) ) ],
					dataTransfer: dataTransferMock
				} );

				expectDraggingMarker( model.createPositionAt( root.getChild( 1 ), 0 ) );
			} );

			it( 'should find drop position while hovering over a widget without content (not Firefox)', () => {
				const originalEnvGecko = env.isGecko;

				env.isGecko = false;

				setModelData( model,
					'<paragraph>[]foo</paragraph>' +
					'<horizontalLine></horizontalLine>' +
					'<paragraph>bar</paragraph>'
				);

				const dataTransferMock = createDataTransfer();

				const rootElement = viewDocument.getRoot();
				const domNode = domConverter.mapViewToDom( rootElement );

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: rootElement,
					targetRanges: [ view.createRange( view.createPositionAt( rootElement, 2 ) ) ],
					dataTransfer: dataTransferMock
				} );

				expectDraggingMarker( model.createRangeOn( root.getChild( 1 ) ) );

				env.isGecko = originalEnvGecko;
			} );

			it( 'should find drop position while hovering over a widget without content (in Firefox)', () => {
				const originalEnvGecko = env.isGecko;

				env.isGecko = true;

				setModelData( model,
					'<paragraph>[]foo</paragraph>' +
					'<blockQuote><horizontalLine></horizontalLine></blockQuote>' +
					'<paragraph>bar</paragraph>'
				);

				const dataTransferMock = createDataTransfer();

				const rootElement = viewDocument.getRoot();
				const domNode = domConverter.mapViewToDom( rootElement );

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: rootElement,
					targetRanges: [ view.createRange( view.createPositionAt( rootElement.getChild( 1 ), 0 ) ) ],
					dataTransfer: dataTransferMock
				} );

				expectDraggingMarker( model.createRangeOn( root.getNodeByPath( [ 1, 0 ] ) ) );

				env.isGecko = originalEnvGecko;
			} );
		} );

		describe( 'drop', () => {
			it( 'should update targetRanges', () => {
				setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<horizontalLine></horizontalLine>'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardInput = sinon.spy();

				viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

				dataTransferMock.dropEffect = 'move';
				const targetPosition = model.createPositionAt( root.getChild( 1 ), 0 );
				fireDrop( dataTransferMock, targetPosition );

				expect( spyClipboardInput.called ).to.be.true;

				const data = spyClipboardInput.firstCall.firstArg;
				expect( data.method ).to.equal( 'drop' );
				expect( data.dataTransfer ).to.equal( dataTransferMock );
				expect( data.targetRanges.length ).to.equal( 1 );
				expect( data.targetRanges[ 0 ].isEqual( view.createRangeOn( viewDocument.getRoot().getChild( 1 ) ) ) ).to.be.true;
			} );
		} );
	} );

	describe( 'integration with the WidgetToolbarRepository plugin', () => {
		let editor, widgetToolbarRepository, editorElement, viewDocument;

		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Paragraph, WidgetToolbarRepository, DragDrop, HorizontalLine ]
				} )
				.then( newEditor => {
					editor = newEditor;
					viewDocument = editor.editing.view.document;
					widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );

					editor.setData( '<p></p>' );
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		describe( 'WidgetToolbarRepository#isEnabled', () => {
			it( 'is enabled by default', () => {
				expect( widgetToolbarRepository.isEnabled ).to.be.true;
			} );

			it( 'is enabled when starts dragging the text node', () => {
				setModelData( editor.model, '<paragraph>[Foo.]</paragraph><horizontalLine></horizontalLine>' );

				viewDocument.fire( 'dragstart', {
					preventDefault: sinon.spy(),
					dataTransfer: createDataTransfer( {} )
				} );

				expect( widgetToolbarRepository.isEnabled ).to.be.true;
			} );

			it( 'is disabled when starts dragging the widget', () => {
				setModelData( editor.model, '<paragraph>Foo.</paragraph>[<horizontalLine></horizontalLine>]' );

				viewDocument.fire( 'dragstart', {
					preventDefault: sinon.spy(),
					target: viewDocument.getRoot().getChild( 1 ),
					dataTransfer: createDataTransfer( {} )
				} );

				expect( widgetToolbarRepository.isEnabled ).to.be.false;
			} );

			it( 'is enabled when ends dragging (drop in the editable)', () => {
				setModelData( editor.model, '[<horizontalLine></horizontalLine>]' );

				const dataTransfer = createDataTransfer( {} );

				viewDocument.fire( 'dragstart', {
					preventDefault: sinon.spy(),
					target: viewDocument.getRoot().getChild( 0 ),
					dataTransfer
				} );

				expect( widgetToolbarRepository.isEnabled ).to.be.false;

				viewDocument.fire( 'drop', {
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy(),
					target: viewDocument.getRoot().getChild( 0 ),
					dataTransfer,
					method: 'drop'
				} );

				expect( widgetToolbarRepository.isEnabled ).to.be.true;
			} );

			it( 'is enabled when ends dragging (drop outside the editable)', () => {
				setModelData( editor.model, '[<horizontalLine></horizontalLine>]' );

				const dataTransfer = createDataTransfer( {} );

				viewDocument.fire( 'dragstart', {
					preventDefault: sinon.spy(),
					target: viewDocument.getRoot().getChild( 0 ),
					dataTransfer
				} );

				expect( widgetToolbarRepository.isEnabled ).to.be.false;

				viewDocument.fire( 'dragend', {
					preventDefault: sinon.spy(),
					dataTransfer
				} );

				expect( widgetToolbarRepository.isEnabled ).to.be.true;
			} );
		} );
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

	function fireDragging( dataTransferMock, modelPositionOrRange ) {
		viewDocument.fire( 'dragging', {
			...prepareEventData( modelPositionOrRange ),
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

	function prepareEventData( modelPositionOrRange ) {
		let domNode, viewElement, viewRange;

		if ( modelPositionOrRange.is( 'position' ) ) {
			const viewPosition = mapper.toViewPosition( modelPositionOrRange );

			viewRange = view.createRange( viewPosition );
			viewElement = mapper.findMappedViewAncestor( viewPosition );

			domNode = viewPosition.parent.is( '$text' ) ?
				domConverter.findCorrespondingDomText( viewPosition.parent ).parentNode :
				domConverter.mapViewToDom( viewElement );
		} else {
			viewRange = mapper.toViewRange( modelPositionOrRange );
			viewElement = viewRange.getContainedElement();
			domNode = domConverter.mapViewToDom( viewElement );
		}

		return {
			domTarget: domNode,
			target: viewElement,
			targetRanges: [ viewRange ],
			domEvent: {}
		};
	}

	function expectDragStarted( dataTransferMock, data, spyClipboardOutput, effectAllowed = 'copyMove' ) {
		expect( dataTransferMock.getData( 'text/html' ) ).to.equal( data );
		expect( dataTransferMock.effectAllowed ).to.equal( effectAllowed );

		expect( viewDocument.getRoot().getAttribute( 'draggable' ) ).to.equal( 'true' );

		if ( spyClipboardOutput ) {
			expect( spyClipboardOutput.called ).to.be.true;
			expect( spyClipboardOutput.firstCall.firstArg.method ).to.equal( 'dragstart' );
			expect( spyClipboardOutput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );
			expect( stringifyView( spyClipboardOutput.firstCall.firstArg.content ) ).to.equal( data );
		}
	}

	function expectDraggingMarker( targetPositionOrRange ) {
		expect( model.markers.has( 'drop-target' ) ).to.be.true;

		if ( targetPositionOrRange.is( 'position' ) ) {
			expect( model.markers.get( 'drop-target' ).getRange().isCollapsed ).to.be.true;
			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual( targetPositionOrRange ) ).to.be.true;
		} else {
			expect( model.markers.get( 'drop-target' ).getRange().isEqual( targetPositionOrRange ) ).to.be.true;
		}
	}

	function expectFinalized() {
		expect( viewDocument.getRoot().hasAttribute( 'draggable' ) ).to.be.false;

		expect( model.markers.has( 'drop-target' ) ).to.be.false;
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
