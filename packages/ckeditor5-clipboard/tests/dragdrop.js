/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClipboardPipeline from '../src/clipboardpipeline.js';
import DragDrop from '../src/dragdrop.js';
import DragDropTarget from '../src/dragdroptarget.js';
import PastePlainText from '../src/pasteplaintext.js';
import DragDropBlockToolbar from '../src/dragdropblocktoolbar.js';

import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import { Image, ImageCaption } from '@ckeditor/ckeditor5-image';
import env from '@ckeditor/ckeditor5-utils/src/env.js';
import { Rect } from '@ckeditor/ckeditor5-utils';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData, stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import { CustomTitle } from './utils/customtitleplugin.js';

describe( 'Drag and Drop', () => {
	let editorElement, editor, model, view, viewDocument, root, mapper, domConverter;

	testUtils.createSinonSandbox();

	it( 'requires DragDropTarget, ClipboardPipeline and Widget', () => {
		expect( DragDrop.requires ).to.deep.equal( [ ClipboardPipeline, Widget, DragDropTarget, DragDropBlockToolbar ] );
	} );

	it( 'has proper name', () => {
		expect( DragDrop.pluginName ).to.equal( 'DragDrop' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( DragDrop.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( DragDrop.isPremiumPlugin ).to.be.false;
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
		editorElement.remove();

		env.isAndroid = false;
	} );

	describe( 'dragging', () => {
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
		} );

		afterEach( async () => {
			await editor.destroy();
			editorElement.remove();
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

			sinon.stub( dataTransferMock, 'setDragImage' ).returns( () => null );

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

			const targetRange = model.createPositionAt( root.getChild( 1 ), 'after' );
			fireDragging( dataTransferMock, targetRange );
			clock.tick( 100 );

			expectDraggingMarker( targetRange );
			expect( getViewData( view ) ).to.equal(
				'<p>{foo}bar</p>' +
				'<div class="ck-horizontal-line ck-widget" contenteditable="false">' +
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

			expect( getModelData( model ) ).to.equal(
				'<paragraph>bar</paragraph>' +
				'<horizontalLine></horizontalLine>' +
				'<paragraph>foo[]</paragraph>'
			);
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

			let targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
			fireDragging( dataTransferMock, targetPosition );
			clock.tick( 100 );

			expectDraggingMarker( targetPosition );
			expect( getViewData( view, { renderUIElements: true } ) ).to.equal(
				'<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>'
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
			editor.model.schema.extend( 'caption', {
				allowIn: '$root'
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
				'<caption>foo</caption>' +
				'[<table><tableRow><tableCell><paragraph>bar</paragraph></tableCell></tableRow></table>]'
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
					'<paragraph>foobar</paragraph>' +
					'[<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>]'
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
					'<paragraph>foobar</paragraph>' +
					'[<horizontalLine></horizontalLine>]'
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

			// TODO: what does it mean "(but not nested editable)"?
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
					'<paragraph>foobar</paragraph>' +
					'[<horizontalLine></horizontalLine>]'
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

			// TODO: this test looks invalid, "this._draggedRange" in experimental in most cases is not undefined.
			it.skip( 'should not start dragging a widget if it is not a target for an event (but it was selected)', () => {
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

			it( 'should drag parent paragraph if entire content is selected', () => {
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

				expect( dataTransferMock.getData( 'text/html' ) ).to.equal( '<p><br>&nbsp;</p>' );

				const modelCellElement = model.document.getRoot().getNodeByPath( [ 1, 0, 0 ] );
				const viewCellElement = mapper.toViewElement( modelCellElement );
				expect( viewCellElement.is( 'editableElement', 'td' ) ).to.be.true;
				expect( viewCellElement.getAttribute( 'draggable' ) ).to.equal( 'true' );

				expect( spyClipboardOutput.called ).to.be.true;
				expect( spyClipboardOutput.firstCall.firstArg.method ).to.equal( 'dragstart' );
				expect( spyClipboardOutput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );
				expect( stringifyView( spyClipboardOutput.firstCall.firstArg.content ) ).to.equal( '<p><br></br></p>' );

				dataTransferMock.dropEffect = 'move';
				const targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
				fireDrop( dataTransferMock, targetPosition );

				expect( spyClipboardInput.called ).to.be.true;
				expect( spyClipboardInput.firstCall.firstArg.method ).to.equal( 'drop' );
				expect( spyClipboardInput.firstCall.firstArg.dataTransfer ).to.equal( dataTransferMock );

				fireDragEnd( dataTransferMock );
				expectFinalized();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foobar</paragraph><paragraph><softBreak></softBreak> []</paragraph>' +
					'<table><tableRow><tableCell><paragraph></paragraph></tableCell></tableRow></table>'
				);
			} );

			it( 'should start dragging text from caption to paragraph', () => {
				setModelData( model, trim`
					<imageBlock src="">
						<caption>[World]</caption>
					</imageBlock>
					<paragraph>Hello</paragraph>
				` );

				const dataTransferMock = createDataTransfer();
				const viewElement = viewDocument.getRoot().getChild( 1 );
				const positionAfterHr = model.createPositionAt( root.getChild( 1 ), 'after' );

				viewDocument.fire( 'dragstart', {
					domTarget: domConverter.mapViewToDom( viewElement ),
					target: viewElement,
					domEvent: {},
					dataTransfer: dataTransferMock,
					stopPropagation: () => {}
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).to.equal( 'World' );

				fireDragging( dataTransferMock, positionAfterHr );
				expectDraggingMarker( positionAfterHr );

				fireDrop(
					dataTransferMock,
					model.createPositionAt( root.getChild( 1 ), 5 )
				);

				expect( getModelData( model ) ).to.equal( trim`
					<imageBlock src="">
						<caption></caption>
					</imageBlock>
					<paragraph>HelloWorld[]</paragraph>
				` );
			} );

			it( 'should start dragging text from title to paragraph', () => {
				setModelData( model, trim`
					<title><title-content>[Foo] Bar</title-content></title>
					<paragraph>Bar</paragraph>
				` );

				const dataTransferMock = createDataTransfer();
				const viewElement = viewDocument.getRoot().getChild( 1 );
				const position = model.createPositionAt( root.getChild( 1 ), 'after' );

				viewDocument.fire( 'dragstart', {
					domTarget: domConverter.mapViewToDom( viewElement ),
					target: viewElement,
					domEvent: {},
					dataTransfer: dataTransferMock,
					stopPropagation: () => {}
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).to.equal( 'Foo' );

				fireDragging( dataTransferMock, position );
				expectDraggingMarker( position );

				fireDrop(
					dataTransferMock,
					model.createPositionAt( root.getChild( 1 ), 3 )
				);

				expect( getModelData( model ) ).to.equal( trim`
					<title><title-content> Bar</title-content></title>
					<paragraph>BarFoo[]</paragraph>
				` );
			} );

			it( 'should start dragging text from paragraph to title', () => {
				setModelData( model, trim`
					<title><title-content>Foo Bar</title-content></title>
					<paragraph>[Baz]</paragraph>
				` );

				const dataTransferMock = createDataTransfer();
				const viewElement = viewDocument.getRoot().getChild( 0 );

				viewDocument.fire( 'dragstart', {
					domTarget: domConverter.mapViewToDom( viewElement ),
					target: viewElement,
					domEvent: {},
					dataTransfer: dataTransferMock,
					stopPropagation: () => {}
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).to.equal( '<p>Baz</p>' );

				fireDragging( dataTransferMock, model.createPositionAt( root.getChild( 0 ).getChild( 0 ), 3 ) );

				fireDrop(
					dataTransferMock,
					model.createPositionAt( root.getChild( 0 ).getChild( 0 ), 3 )
				);

				expect( getModelData( model ) ).to.equal( trim`
					<paragraph>Baz[]</paragraph>
					<title><title-content>Foo Bar</title-content></title>
				` );
			} );

			it( 'should not drag parent paragraph when only portion of content is selected', () => {
				setModelData( model,
					'<paragraph>foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>ba[<softBreak></softBreak>]z</paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = sinon.spy();
				const spyClipboardInput = sinon.spy();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
				viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

				const modelElement = model.document.getRoot().getNodeByPath( [ 1, 0, 0, 0, 2 ] );
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
					'<table><tableRow><tableCell><paragraph>baz</paragraph></tableCell></tableRow></table>'
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

			it( 'can drag multiple elements', () => {
				setModelData( model,
					'<blockQuote>' +
						'[<paragraph>foo</paragraph>' +
						'<paragraph>bar</paragraph>]' +
						'<paragraph>baz</paragraph>' +
					'</blockQuote>' +
					'<horizontalLine></horizontalLine>'
				);

				const dataTransferMock = createDataTransfer();
				const positionAfterHr = model.createPositionAt( root.getChild( 1 ), 'after' );

				fireDragStart( dataTransferMock );
				expectDragStarted( dataTransferMock, '<p>foo</p><p>bar</p>' );

				fireDragging( dataTransferMock, positionAfterHr );
				expectDraggingMarker( positionAfterHr );
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

			it( 'should only show one preview element when you drag element outside the editing root', () => {
				setModelData( model,
					'<blockQuote>' +
						'[<paragraph>foo</paragraph>' +
						'<paragraph>bar</paragraph>]' +
						'<paragraph>baz</paragraph>' +
					'</blockQuote>' +
					'<horizontalLine></horizontalLine>'
				);

				const pilcrow = document.createElement( 'div' );
				pilcrow.setAttribute( 'class', 'pilcrow' );

				const dataTransferMock = createDataTransfer();

				fireDragStart( dataTransferMock, () => {}, pilcrow );
				fireDragStart( dataTransferMock, () => {}, pilcrow );

				const numberOfCkContentElements = Object
					.keys( document.getElementsByClassName( 'ck-content' ) )
					.length;

				// There should be two elements with the `.ck-content` class - editor and drag-and-drop preview.
				expect( numberOfCkContentElements ).to.equal( 2 );
			} );

			it( 'should show preview with custom implementation if drag element outside the editing root', () => {
				setModelData( editor.model, '<paragraph>[Foo.]</paragraph><horizontalLine></horizontalLine>' );

				const dataTransfer = createDataTransfer( {} );

				const spy = sinon.spy( dataTransfer, 'setDragImage' );
				const clientX = 10;

				viewDocument.fire( 'dragstart', {
					dataTransfer,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy(),
					domEvent: {
						clientX
					}
				} );

				const editable = editor.editing.view.document.selection.editableElement;
				const domEditable = editor.editing.view.domConverter.mapViewToDom( editable );
				const computedStyle = window.getComputedStyle( domEditable );
				const paddingLeftString = computedStyle.paddingLeft;
				const paddingLeft = parseFloat( paddingLeftString );

				const domRect = new Rect( domEditable );

				sinon.assert.calledWith( spy, sinon.match( {
					style: {
						'padding-left': `${ domRect.left - clientX + paddingLeft }px`
					},
					className: 'ck ck-content',
					firstChild: sinon.match( {
						tagName: 'P',
						innerHTML: 'Foo.'
					} )
				} ), 0, 0 );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should show preview with browser implementation if drag element inside the editing root', () => {
				setModelData( editor.model, '<paragraph>[Foo.]</paragraph><horizontalLine></horizontalLine>' );

				const dataTransfer = createDataTransfer( {} );

				const spy = sinon.spy( dataTransfer, 'setDragImage' );

				const modelElement = root.getNodeByPath( [ 0 ] );
				const viewElement = mapper.toViewElement( modelElement );
				const domElement = domConverter.mapViewToDom( viewElement );

				viewDocument.fire( 'dragstart', {
					dataTransfer,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy(),
					domEvent: getMockedMousePosition( domElement ),
					domTarget: domElement
				} );

				sinon.assert.notCalled( spy );
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

			// TODO: this should be fixed in code.
			it.skip( 'cannot be dropped on non-editable place.', () => {
				setModelData( model, '<paragraph>[]foobar</paragraph>' );

				const dataTransferMock = createDataTransfer();
				const targetPosition = model.createPositionAt( root.getChild( 0 ), 2 );

				// For selection to be in non-editable place by overwriting `canEditAt()`.
				model.on( 'canEditAt', evt => {
					evt.return = false;
					evt.stop();
				}, { priority: 'highest' } );

				fireDragging( dataTransferMock, targetPosition );

				expect( model.markers.has( 'drop-target' ) ).to.be.false;
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
					dataTransfer: dataTransferMock,
					domEvent: getMockedMousePosition( domNode )
				} );

				expectDraggingMarker( model.createPositionAt( root.getChild( 0 ), 5 ) );
			} );

			it( 'should put marker before element when mouse position is on the upper half of it', () => {
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
					dataTransfer: dataTransferMock,
					domEvent: getMockedMousePosition( domNode )
				} );

				expectDraggingMarker( model.createPositionAt( root.getChild( 1 ), 'before' ) );
			} );

			it( 'should put marker after element when mouse position is on the bottom half of it', () => {
				setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();

				const viewElement = viewDocument.getRoot().getChild( 1 ).getChild( 0 );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.hasClass( 'ck-widget__selection-handle' ) ).to.be.true;

				const widgetUIHeight = 25;

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: viewElement,
					dataTransfer: dataTransferMock,
					domEvent: getMockedMousePosition( domNode, 'after', widgetUIHeight )
				} );

				expectDraggingMarker( model.createPositionAt( root.getChild( 1 ), 'after' ) );
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
					dataTransfer: dataTransferMock,
					domEvent: getMockedMousePosition( domNode )
				} );

				expectDraggingMarker( model.createPositionAt( root.getChild( 1 ), 'before' ) );
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
					dataTransfer: dataTransferMock,
					domEvent: getMockedMousePosition( domNode )
				} );

				expectDraggingMarker( model.createPositionAt( root.getNodeByPath( [ 1, 0, 0, 0 ] ), 'before' ) );
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
				const nestedParagraphDomNode = domConverter.mapViewToDom( nestedViewParagraph );

				expect( viewElement.is( 'rootElement' ) ).to.be.true;

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: rootElement,
					targetRanges: [ view.createRangeOn( nestedModelParagraph ) ],
					dataTransfer: dataTransferMock,
					domEvent: getMockedMousePosition( nestedParagraphDomNode )
				} );

				expectDraggingMarker( model.createPositionAt( root.getChild( 1 ), 'before' ) );
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
					dataTransfer: dataTransferMock,
					domEvent: getMockedMousePosition( domNode )
				} );

				expectDraggingMarker( model.createPositionAt( root.getNodeByPath( [ 1, 0, 0, 0 ] ), 'before' ) );
			} );

			it( 'should find drop position while hovering over table with target position inside after paragraph', () => {
				setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();

				const modelElement = root.getNodeByPath( [ 1, 0, 0 ] );
				const viewElement = mapper.toViewElement( modelElement );
				const domNode = domConverter.mapViewToDom( viewElement );

				const paragraphModel = root.getNodeByPath( [ 1, 0, 0, 0 ] );
				const paragraphView = mapper.toViewElement( paragraphModel );

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: viewElement,
					targetRanges: [ view.createRange( view.createPositionAt( paragraphView, 'after' ) ) ],
					dataTransfer: dataTransferMock,
					domEvent: getMockedMousePosition( domNode, 'after' )
				} );

				expectDraggingMarker( model.createPositionAt( root.getNodeByPath( [ 1, 0, 0, 0 ] ), 'after' ) );
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

				const firstParagraphModelElement = root.getChild( 1 );
				const firstParagraphViewElement = mapper.toViewElement( firstParagraphModelElement );
				const firstParagraphDomNode = domConverter.mapViewToDom( firstParagraphViewElement );

				expect( viewElement.is( 'rootElement' ) ).to.be.true;

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: rootElement,
					targetRanges: [ view.createRangeOn( firstParagraphModelElement ) ],
					dataTransfer: dataTransferMock,
					domEvent: getMockedMousePosition( firstParagraphDomNode )
				} );

				expectDraggingMarker( model.createPositionAt( firstParagraphModelElement, 'before' ) );
			} );

			it( 'should find drop position while hovering after widget without content (not Firefox)', () => {
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

				const modelElement = root.getNodeByPath( [ 1 ] );
				const viewWidget = mapper.toViewElement( modelElement );
				const domWidget = domConverter.mapViewToDom( viewWidget );

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: rootElement,
					targetRanges: [ view.createRange( view.createPositionAt( viewWidget, 'after' ) ) ],
					dataTransfer: dataTransferMock,
					domEvent: getMockedMousePosition( domWidget, 'after' )
				} );

				expectDraggingMarker( model.createPositionAt( root.getChild( 1 ), 'after' ) );

				env.isGecko = originalEnvGecko;
			} );

			it( 'should find drop position while hovering after widget without content (in Firefox)', () => {
				const originalEnvGecko = env.isGecko;

				env.isGecko = true;

				setModelData( model,
					'<paragraph>[]foo</paragraph>' +
					'<blockQuote><horizontalLine></horizontalLine></blockQuote>' +
					'<paragraph>bar</paragraph>'
				);

				const dataTransferMock = createDataTransfer();

				const modelWidget = root.getNodeByPath( [ 1, 0 ] );
				const viewWidget = mapper.toViewElement( modelWidget );
				const domWidget = domConverter.mapViewToDom( viewWidget );

				const modelQuote = root.getNodeByPath( [ 1 ] );
				const viewQuote = mapper.toViewElement( modelQuote );
				const domQuote = domConverter.mapViewToDom( viewQuote );

				viewDocument.fire( 'dragging', {
					domTarget: domQuote,
					target: viewQuote,
					targetRanges: [ view.createRange( view.createPositionAt( viewWidget, 'after' ) ) ],
					dataTransfer: dataTransferMock,
					domEvent: getMockedMousePosition( domWidget, 'after' )
				} );

				expectDraggingMarker( model.createPositionAt( modelWidget, 'after' ) );

				env.isGecko = originalEnvGecko;
			} );
		} );

		describe( 'dragend', () => {
			it( 'should reset block dragging when dropped outside the editable', () => {
				setModelData( model,
					'<paragraph>foobar</paragraph>' +
					'[<horizontalLine></horizontalLine>]'
				);

				const plugin = editor.plugins.get( 'DragDrop' );
				const modelElement = model.document.getRoot().getNodeByPath( [ 1 ] );
				const viewElement = mapper.toViewElement( modelElement );

				// Fire the 'dragstart' event to change the '_blockMode to true
				viewDocument.fire( 'dragstart', {
					domTarget: domConverter.mapViewToDom( viewElement ),
					target: viewElement,
					domEvent: {},
					dataTransfer: createDataTransfer( {} ),
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				} );

				// Fire the 'dragend' event on the document
				document.dispatchEvent( new Event( 'dragend' ) );

				// Check if the blockMode changes to 'false'
				expect( plugin._blockMode ).to.be.false;
				expect( model.markers.has( 'drop-target' ) ).to.be.false;
			} );
		} );

		describe( 'drop', () => {
			// TODO: to be discussed.
			it.skip( 'should update targetRanges', () => {
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

		describe( 'extending selection range when all parent elements are selected', () => {
			it( 'extends flat selection', () => {
				setModelData( model, trim`
					<blockQuote>
						<paragraph>[one</paragraph>
						<paragraph>two</paragraph>
						<paragraph>three]</paragraph>
					</blockQuote>
					<horizontalLine></horizontalLine>
				` );

				const dataTransferMock = createDataTransfer();
				const positionAfterHr = model.createPositionAt( root.getChild( 1 ), 'after' );

				fireDragStart( dataTransferMock );
				expectDragStarted( dataTransferMock, trim`
					<blockquote>
						<p>one</p>
						<p>two</p>
						<p>three</p>
					</blockquote>
				` );

				fireDragging( dataTransferMock, positionAfterHr );
				expectDraggingMarker( positionAfterHr );
			} );

			it( 'extends nested selection', () => {
				setModelData( model, trim`
					<blockQuote>
						<paragraph>[one</paragraph>
						<blockQuote>
							<paragraph>two</paragraph>
							<paragraph>three</paragraph>
							<paragraph>four</paragraph>
						</blockQuote>
						<paragraph>five]</paragraph>
					</blockQuote>
					<horizontalLine></horizontalLine>
				` );

				const dataTransferMock = createDataTransfer();
				const positionAfterHr = model.createPositionAt( root.getChild( 1 ), 'after' );

				fireDragStart( dataTransferMock );
				expectDragStarted( dataTransferMock, trim`
					<blockquote>
						<p>one</p>
						<blockquote>
							<p>two</p>
							<p>three</p>
							<p>four</p>
						</blockquote>
						<p>five</p>
					</blockquote>
				` );

				fireDragging( dataTransferMock, positionAfterHr );
				expectDraggingMarker( positionAfterHr );
			} );

			it( 'extends selection when it starts at different level than it ends', () => {
				setModelData( model, trim`
					<blockQuote>
						<blockQuote>
							<paragraph>[one</paragraph>
							<paragraph>two</paragraph>
							<paragraph>three</paragraph>
						</blockQuote>
						<paragraph>four]</paragraph>
					</blockQuote>
					<horizontalLine></horizontalLine>
				` );

				const dataTransferMock = createDataTransfer();
				const positionAfterHr = model.createPositionAt( root.getChild( 1 ), 'after' );

				fireDragStart( dataTransferMock );
				expectDragStarted( dataTransferMock, trim`
					<blockquote>
						<blockquote>
							<p>one</p>
							<p>two</p>
							<p>three</p>
						</blockquote>
						<p>four</p>
					</blockquote>
				` );

				fireDragging( dataTransferMock, positionAfterHr );
				expectDraggingMarker( positionAfterHr );
			} );

			it( 'extends selection when it ends at different level than it starts', () => {
				setModelData( model, trim`
					<blockQuote>
						<paragraph>[one</paragraph>
						<blockQuote>
							<paragraph>two</paragraph>
							<paragraph>three</paragraph>
							<paragraph>four]</paragraph>
						</blockQuote>
					</blockQuote>
					<horizontalLine></horizontalLine>
				` );

				const dataTransferMock = createDataTransfer();
				const positionAfterHr = model.createPositionAt( root.getChild( 1 ), 'after' );

				fireDragStart( dataTransferMock );
				expectDragStarted( dataTransferMock, trim`
					<blockquote>
						<p>one</p>
						<blockquote>
							<p>two</p>
							<p>three</p>
							<p>four</p>
						</blockquote>
					</blockquote>
				` );

				fireDragging( dataTransferMock, positionAfterHr );
				expectDraggingMarker( positionAfterHr );
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

		afterEach( async () => {
			await editor.destroy();
			editorElement.remove();
		} );

		describe( 'WidgetToolbarRepository#isEnabled', () => {
			it( 'is enabled by default', () => {
				expect( widgetToolbarRepository.isEnabled ).to.be.true;
			} );

			it( 'is enabled when starts dragging the text node', () => {
				setModelData( editor.model, '<paragraph>[Foo.]</paragraph><horizontalLine></horizontalLine>' );

				const nodeModel = root.getNodeByPath( [ 0 ] );
				const nodeView = mapper.toViewElement( nodeModel );
				const nodeDOM = domConverter.mapViewToDom( nodeView );
				const dataTransfer = createDataTransfer( {} );

				viewDocument.fire( 'dragstart', {
					dataTransfer,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy(),
					domEvent: getMockedMousePosition( nodeDOM )
				} );

				expect( widgetToolbarRepository.isEnabled ).to.be.true;
			} );

			it( 'is disabled when plugin is disabled', () => {
				setModelData( editor.model, '<paragraph>Foo.</paragraph>[<horizontalLine></horizontalLine>]' );

				const nodeModel = root.getNodeByPath( [ 0 ] );
				const nodeView = mapper.toViewElement( nodeModel );
				const nodeDOM = domConverter.mapViewToDom( nodeView );

				const plugin = editor.plugins.get( 'DragDrop' );
				plugin.isEnabled = false;

				viewDocument.fire( 'dragstart', {
					preventDefault: sinon.spy(),
					target: viewDocument.getRoot().getChild( 1 ),
					dataTransfer: createDataTransfer( {} ),
					stopPropagation: sinon.spy(),
					domEvent: getMockedMousePosition( nodeDOM )
				} );

				expect( widgetToolbarRepository.isEnabled ).to.be.false;
			} );

			it( 'is disabled when starts dragging the widget', () => {
				setModelData( editor.model, '<paragraph>Foo.</paragraph>[<horizontalLine></horizontalLine>]' );

				const nodeModel = root.getNodeByPath( [ 0 ] );
				const nodeView = mapper.toViewElement( nodeModel );
				const nodeDOM = domConverter.mapViewToDom( nodeView );

				viewDocument.fire( 'dragstart', {
					preventDefault: sinon.spy(),
					target: viewDocument.getRoot().getChild( 1 ),
					dataTransfer: createDataTransfer( {} ),
					stopPropagation: sinon.spy(),
					domEvent: getMockedMousePosition( nodeDOM )
				} );

				expect( widgetToolbarRepository.isEnabled ).to.be.false;
			} );

			it( 'is enabled when ends dragging (drop in the editable)', () => {
				setModelData( editor.model, '[<horizontalLine></horizontalLine>]' );

				const dataTransfer = createDataTransfer( {} );

				const nodeModel = root.getNodeByPath( [ 0 ] );
				const nodeView = mapper.toViewElement( nodeModel );
				const nodeDOM = domConverter.mapViewToDom( nodeView );

				viewDocument.fire( 'dragstart', {
					preventDefault: sinon.spy(),
					target: viewDocument.getRoot().getChild( 0 ),
					dataTransfer,
					stopPropagation: sinon.spy(),
					domEvent: getMockedMousePosition( nodeDOM )
				} );

				expect( widgetToolbarRepository.isEnabled ).to.be.false;

				viewDocument.fire( 'drop', {
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy(),
					target: viewDocument.getRoot().getChild( 0 ),
					dataTransfer,
					method: 'drop',
					domEvent: {
						clientX: sinon.spy(),
						clientY: sinon.spy()
					}
				} );

				expect( widgetToolbarRepository.isEnabled ).to.be.true;
			} );

			it( 'is enabled when ends dragging (drop outside the editable)', () => {
				setModelData( editor.model, '[<horizontalLine></horizontalLine>]' );

				const dataTransfer = createDataTransfer( {} );

				const nodeModel = root.getNodeByPath( [ 0 ] );
				const nodeView = mapper.toViewElement( nodeModel );
				const nodeDOM = domConverter.mapViewToDom( nodeView );

				viewDocument.fire( 'dragstart', {
					preventDefault: sinon.spy(),
					target: viewDocument.getRoot().getChild( 0 ),
					dataTransfer,
					stopPropagation() {},
					domEvent: getMockedMousePosition( nodeDOM )
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

	describe( 'integration with paragraph-only editor', () => {
		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			editor = await ClassicTestEditor.create( editorElement, {
				useInlineRoot: true,
				plugins: [ DragDrop, PastePlainText, Paragraph, Bold ]
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
			editorElement.remove();
		} );

		it( 'handles paste', () => {
			setModelData( model,
				'foo[]'
			);

			editor.editing.view.document.fire( 'paste', {
				dataTransfer: createDataTransfer( { 'text/html': '<strong>bar</strong>' } ),
				stopPropagation() {},
				preventDefault() {}
			} );

			expect( getModelData( model ) ).to.equal( 'foo<$text bold="true">bar[]</$text>' );
		} );

		it( 'stops `clipboardInput` event', () => {
			setModelData( model,
				'foo[]'
			);

			const spyClipboardInput = sinon.spy();
			const rootElement = viewDocument.getRoot();
			const domNode = domConverter.mapViewToDom( rootElement );

			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			viewDocument.fire( 'clipboardInput', {
				domTarget: domNode,
				target: rootElement,
				method: 'drop',
				dataTransfer: createDataTransfer(),
				domEvent: getMockedMousePosition( domNode ),
				stopPropagation: () => {},
				preventDefault: () => {}
			} );

			expect( spyClipboardInput.called ).to.be.false;
		} );
	} );

	describe( '_updatePreview', () => {
		let targetElement, dragDrop, warnStub;

		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			editor = await ClassicTestEditor.create( editorElement, {
				useInlineRoot: true,
				plugins: [ DragDrop, PastePlainText, Paragraph, Bold ]
			} );

			dragDrop = editor.plugins.get( DragDrop );

			targetElement = document.createElement( 'div' );
			warnStub = sinon.stub( console, 'warn' );
		} );

		afterEach( async () => {
			await editor.destroy();

			editorElement.remove();
			targetElement.remove();
			warnStub.restore();
		} );

		it( 'should not append unsafe html tags from malformed data transfer object to the preview', () => {
			dragDrop._updatePreview( {
				target: targetElement,
				clientX: 10,
				dataTransfer: createDataTransfer( {
					'text/html': [
						'<script>console.log("hello");</script>',
						'<strong>Test</strong>',
						'<style>body { color: red; }</style>'
					].join( ' ' )
				} )
			} );

			expect( dragDrop._previewContainer.querySelector( 'script' ) ).to.be.null;
			expect( dragDrop._previewContainer.querySelector( 'style' ) ).to.be.null;
			expect( dragDrop._previewContainer.querySelector( 'strong' ) ).not.to.be.null;
		} );

		it( 'should not append unsafe attributes to the preview', () => {
			dragDrop._updatePreview( {
				target: targetElement,
				clientX: 10,
				dataTransfer: createDataTransfer( {
					'text/html': '<strong onclick="alert(\'abc\')">Test</strong>'
				} )
			} );

			const insertedElement = dragDrop._previewContainer.querySelector( 'strong' );

			expect( insertedElement.getAttribute( 'onclick' ) ).to.be.null;

			sinon.assert.calledOnce( warnStub );
			sinon.assert.calledWithExactly( warnStub,
				sinon.match( /^domconverter-unsafe-attribute-detected/ ),
				{
					domElement: insertedElement,
					key: 'onclick',
					value: 'alert(\'abc\')'
				},
				sinon.match.string // Link to the documentation
			);
		} );
	} );

	function fireDragStart( dataTransferMock, preventDefault = () => {}, domTarget ) {
		const eventData = prepareEventData( model.document.selection.getLastPosition(), domTarget );

		viewDocument.fire( 'mousedown', {
			...eventData,
			preventDefault
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

	function prepareEventData( modelPositionOrRange, domTarget ) {
		let domNode, viewElement, viewRange;

		if ( modelPositionOrRange.is( 'position' ) ) {
			const viewPosition = mapper.toViewPosition( modelPositionOrRange );

			viewRange = view.createRange( viewPosition );
			viewElement = mapper.findMappedViewAncestor( viewPosition );

			if ( !domTarget ) {
				domNode = viewPosition.parent.is( '$text' ) ?
					domConverter.findCorrespondingDomText( viewPosition.parent ).parentNode :
					domConverter.mapViewToDom( viewElement );
			} else {
				domNode = domTarget;
			}
		} else {
			viewRange = mapper.toViewRange( modelPositionOrRange );
			viewElement = viewRange.getContainedElement();
			domNode = domTarget || domConverter.mapViewToDom( viewElement );
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
			},

			setDragImage() {
				return null;
			}
		};
	}

	function getMockedMousePosition( domNode, position = 'before', extraOffset = 0 ) {
		const { x, y, height } = domNode.getBoundingClientRect();

		if ( position === 'after' ) {
			return {
				clientX: x,
				clientY: y + height + extraOffset
			};
		}

		return {
			clientX: x,
			clientY: y + extraOffset
		};
	}

	function trim( strings ) {
		return strings
			.join( '' )
			.trim()
			.replace( />\s+</g, '><' );
	}
} );
