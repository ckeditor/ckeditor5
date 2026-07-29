/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ClipboardPipeline } from '../src/clipboardpipeline.js';
import { DragDrop } from '../src/dragdrop.js';
import { DragDropTarget } from '../src/dragdroptarget.js';
import { PastePlainText } from '../src/pasteplaintext.js';
import { DragDropBlockToolbar } from '../src/dragdropblocktoolbar.js';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import { Widget, WidgetToolbarRepository } from '@ckeditor/ckeditor5-widget';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table } from '@ckeditor/ckeditor5-table';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { ShiftEnter } from '@ckeditor/ckeditor5-enter';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { Image, ImageCaption } from '@ckeditor/ckeditor5-image';
import { env, Rect } from '@ckeditor/ckeditor5-utils';

import { _getModelData, _setModelData, _getViewData, _stringifyView } from '@ckeditor/ckeditor5-engine';

import { CustomTitle } from './utils/customtitleplugin.js';

describe( 'Drag and Drop', () => {
	let editorElement, editor, model, view, viewDocument, root, mapper, domConverter;

	afterEach( () => {
		vi.useRealTimers();
	} );

	it( 'requires DragDropTarget, ClipboardPipeline and Widget', () => {
		expect( DragDrop.requires ).toEqual( [ ClipboardPipeline, Widget, DragDropTarget, DragDropBlockToolbar ] );
	} );

	it( 'has proper name', () => {
		expect( DragDrop.pluginName ).toBe( 'DragDrop' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( DragDrop.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( DragDrop.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be disabled on Android', async () => {
		env.isAndroid = true;

		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		const editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ DragDrop ]
		} );

		const plugin = editor.plugins.get( 'DragDrop' );

		expect( plugin.isEnabled ).toBe( false );

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

			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			vi.useFakeTimers();
			const dataTransferMock = createDataTransfer();
			const spyClipboardOutput = vi.fn();
			const spyClipboardInput = vi.fn();
			let targetPosition;

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
			dataTransferMock.effectAllowed = 'copyMove';
			fireDragging( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expectDraggingMarker( targetPosition );
			expect( _getViewData( view, { renderUIElements: true } ) )
				.toBe( '<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>' );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 5 );
			dataTransferMock.effectAllowed = 'copy';
			fireDragging( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expectDraggingMarker( targetPosition );
			expect( _getViewData( view, { renderUIElements: true } ) )
				.toBe( '<p>{foo}ba<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>r</p>' );

			// Dropping.

			dataTransferMock.effectAllowed = 'copyMove';
			dataTransferMock.dropEffect = 'move';
			targetPosition = model.createPositionAt( root.getChild( 0 ), 6 );
			fireDrop( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expect( spyClipboardInput ).toHaveBeenCalled();
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].method ).toBe( 'drop' );
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );

			fireDragEnd( dataTransferMock );
			expectFinalized();

			expect( _getModelData( model ) ).toBe( '<paragraph>barfoo[]</paragraph>' );
			expect( _getViewData( view ) ).toBe( '<p>barfoo{}</p>' );

			env.isGecko = originalEnvGecko;
		} );

		it( 'should move text to other place in the same editor (in Firefox)', () => {
			const originalEnvGecko = env.isGecko;

			env.isGecko = true;

			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			vi.useFakeTimers();
			const dataTransferMock = createDataTransfer();
			const spyClipboardOutput = vi.fn();
			const spyClipboardInput = vi.fn();
			let targetPosition;

			vi.spyOn( dataTransferMock, 'setDragImage' ).mockReturnValue( () => null );

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
			fireDragging( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expectDraggingMarker( targetPosition );
			expect( _getViewData( view, { renderUIElements: true } ) )
				.toBe( '<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>' );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 5 );
			fireDragging( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expectDraggingMarker( targetPosition );
			expect( _getViewData( view, { renderUIElements: true } ) )
				.toBe( '<p>{foo}ba<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>r</p>' );

			// Dropping.

			dataTransferMock.dropEffect = 'move';
			targetPosition = model.createPositionAt( root.getChild( 0 ), 6 );
			fireDrop( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expect( spyClipboardInput ).toHaveBeenCalled();
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].method ).toBe( 'drop' );
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );

			fireDragEnd( dataTransferMock );
			expectFinalized();

			expect( _getModelData( model ) ).toBe( '<paragraph>barfoo[]</paragraph>' );
			expect( _getViewData( view ) ).toBe( '<p>barfoo{}</p>' );

			env.isGecko = originalEnvGecko;
		} );

		it( 'should copy text to other place in the same editor (not Firefox)', () => {
			const originalEnvGecko = env.isGecko;

			env.isGecko = false;

			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			vi.useFakeTimers();
			const dataTransferMock = createDataTransfer();
			const spyClipboardOutput = vi.fn();
			const spyClipboardInput = vi.fn();
			let targetPosition;

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
			dataTransferMock.effectAllowed = 'copy';
			fireDragging( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expectDraggingMarker( targetPosition );
			expect( _getViewData( view, { renderUIElements: true } ) )
				.toBe( '<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>' );

			fireDragging( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expectDraggingMarker( targetPosition );
			expect( _getViewData( view, { renderUIElements: true } ) )
				.toBe( '<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>' );

			// Dropping.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 6 );
			dataTransferMock.dropEffect = 'copy';
			dataTransferMock.effectAllowed = 'copy';
			fireDrop( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expect( spyClipboardInput ).toHaveBeenCalled();
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].method ).toBe( 'drop' );
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );

			fireDragEnd( dataTransferMock );
			expectFinalized();

			expect( _getModelData( model ) ).toBe( '<paragraph>foobarfoo[]</paragraph>' );
			expect( _getViewData( view ) ).toBe( '<p>foobarfoo{}</p>' );

			env.isGecko = originalEnvGecko;
		} );

		it( 'should copy text to other place in the same editor (in Firefox)', () => {
			const originalEnvGecko = env.isGecko;

			env.isGecko = true;

			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			vi.useFakeTimers();
			const dataTransferMock = createDataTransfer();
			const spyClipboardOutput = vi.fn();
			const spyClipboardInput = vi.fn();
			let targetPosition;

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
			fireDragging( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expectDraggingMarker( targetPosition );
			expect( _getViewData( view, { renderUIElements: true } ) )
				.toBe( '<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>' );

			fireDragging( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expectDraggingMarker( targetPosition );
			expect( _getViewData( view, { renderUIElements: true } ) )
				.toBe( '<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>' );

			// Dropping.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 6 );
			dataTransferMock.dropEffect = 'copy';
			dataTransferMock.effectAllowed = 'copy';
			fireDrop( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expect( spyClipboardInput ).toHaveBeenCalled();
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].method ).toBe( 'drop' );
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );

			fireDragEnd( dataTransferMock );
			expectFinalized();

			expect( _getModelData( model ) ).toBe( '<paragraph>foobarfoo[]</paragraph>' );
			expect( _getViewData( view ) ).toBe( '<p>foobarfoo{}</p>' );

			env.isGecko = originalEnvGecko;
		} );

		it( 'should move text to other place in the same editor (over some widget)', () => {
			_setModelData( model, '<paragraph>[foo]bar</paragraph><horizontalLine></horizontalLine>' );

			vi.useFakeTimers();
			const dataTransferMock = createDataTransfer();
			const spyClipboardOutput = vi.fn();
			const spyClipboardInput = vi.fn();

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dragging.

			const targetRange = model.createPositionAt( root.getChild( 1 ), 'after' );
			fireDragging( dataTransferMock, targetRange );
			vi.advanceTimersByTime( 100 );

			expectDraggingMarker( targetRange );
			expect( _getViewData( view ) ).toBe( '<p>{foo}bar</p>' +
				'<div class="ck-horizontal-line ck-widget" contenteditable="false">' +
					'<hr></hr>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</div>'
			);

			// Dropping.

			dataTransferMock.dropEffect = 'move';
			fireDrop( dataTransferMock, targetRange );
			vi.advanceTimersByTime( 100 );

			expect( spyClipboardInput ).toHaveBeenCalled();
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].method ).toBe( 'drop' );
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );

			fireDragEnd( dataTransferMock );
			expectFinalized();

			expect( _getModelData( model ) ).toBe( '<paragraph>bar</paragraph>' +
				'<horizontalLine></horizontalLine>' +
				'<paragraph>foo[]</paragraph>'
			);
		} );

		it( 'should do nothing if dropped on dragged range', () => {
			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			vi.useFakeTimers();
			const dataTransferMock = createDataTransfer();
			const spyClipboardOutput = vi.fn();
			const spyClipboardInput = vi.fn();

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dropping.

			const targetPosition = model.createPositionAt( root.getChild( 0 ), 2 );
			dataTransferMock.dropEffect = 'move';
			dataTransferMock.effectAllowed = 'copyMove';
			fireDrop( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expect( spyClipboardInput ).not.toHaveBeenCalled();

			fireDragEnd( dataTransferMock );
			expectFinalized();

			expect( _getModelData( model ) ).toBe( '<paragraph>[foo]bar</paragraph>' );
			expect( _getViewData( view ) ).toBe( '<p>{foo}bar</p>' );
		} );

		it( 'should copy text to from outside the editor', () => {
			_setModelData( model, '<paragraph>[]foobar</paragraph>' );

			vi.useFakeTimers();
			const dataTransferMock = createDataTransfer( { 'text/html': 'abc' } );
			const spyClipboardInput = vi.fn();
			let targetPosition;

			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 5 );
			fireDragging( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expectDraggingMarker( targetPosition );
			expect( dataTransferMock.dropEffect ).toBe( 'copy' );
			expect( _getViewData( view, { renderUIElements: true } ) )
				.toBe( '<p>{}fooba<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>r</p>' );

			// Dropping.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
			dataTransferMock.dropEffect = 'copy';
			dataTransferMock.effectAllowed = 'copy';
			fireDrop( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expect( spyClipboardInput ).toHaveBeenCalled();
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].method ).toBe( 'drop' );
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );

			fireDragEnd( dataTransferMock );
			expectFinalized();

			expect( _getModelData( model ) ).toBe( '<paragraph>fooabc[]bar</paragraph>' );
			expect( _getViewData( view ) ).toBe( '<p>fooabc{}bar</p>' );
		} );

		it( 'should finalize dragging when drop target range cannot be determined', () => {
			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			vi.useFakeTimers();
			const dataTransferMock = createDataTransfer();
			const spyClipboardOutput = vi.fn();
			const spyClipboardInput = vi.fn();

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dragging.

			const targetPosition = model.createPositionAt( root.getChild( 0 ), 6 );
			fireDragging( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expectDraggingMarker( targetPosition );

			// Stub getFinalDropRange to return null.
			const dragDropTarget = editor.plugins.get( DragDropTarget );
			vi.spyOn( dragDropTarget, 'getFinalDropRange' ).mockReturnValue( null );

			// Dropping.

			dataTransferMock.dropEffect = 'move';
			fireDrop( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			// The clipboardInput event should have been stopped before reaching further listeners.
			expect( spyClipboardInput ).not.toHaveBeenCalled();

			expectFinalized();

			// Data should remain unchanged.
			expect( _getModelData( model ) ).toBe( '<paragraph>[foo]bar</paragraph>' );
		} );

		it( 'should not remove dragged range if it is from other drag session', () => {
			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			vi.useFakeTimers();
			let dataTransferMock = createDataTransfer();
			const spyClipboardOutput = vi.fn();
			const spyClipboardInput = vi.fn();

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dragging finalized outside the editor without proper dragend event.

			dataTransferMock = createDataTransfer( { 'text/html': 'abc' } );

			let targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
			fireDragging( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expectDraggingMarker( targetPosition );
			expect( _getViewData( view, { renderUIElements: true } ) )
				.toBe( '<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>' );

			// Dropping.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
			dataTransferMock.dropEffect = 'copy';
			dataTransferMock.effectAllowed = 'copy';
			fireDrop( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expect( spyClipboardInput ).toHaveBeenCalled();
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].method ).toBe( 'drop' );
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );

			fireDragEnd( dataTransferMock );
			expectFinalized();

			expect( _getModelData( model ) ).toBe( '<paragraph>fooabc[]bar</paragraph>' );
			expect( _getViewData( view ) ).toBe( '<p>fooabc{}bar</p>' );
		} );

		it( 'should not remove dragged range if insert into drop target was not allowed', () => {
			editor.model.schema.extend( 'caption', {
				allowIn: '$root'
			} );

			editor.conversion.elementToElement( {
				view: 'caption',
				model: 'caption'
			} );

			_setModelData( model,
				'<caption>foo</caption>' +
				'[<table><tableRow><tableCell><paragraph>bar</paragraph></tableCell></tableRow></table>]'
			);

			const dataTransferMock = createDataTransfer();
			const viewElement = viewDocument.getRoot().getChild( 1 );
			const domNode = domConverter.mapViewToDom( viewElement );

			const eventData = {
				domTarget: domNode,
				target: viewElement,
				domEvent: {
					isPrimary: true
				}
			};

			viewDocument.fire( 'pointerdown', {
				...eventData
			} );

			viewDocument.fire( 'dragstart', {
				...eventData,
				dataTransfer: dataTransferMock,
				stopPropagation: () => {}
			} );

			expect( dataTransferMock.getData( 'text/html' ) ).toBe( '<table class="table"><tbody><tr><td>bar</td></tr></tbody></table>'
			);

			const targetPosition = model.createPositionAt( root.getChild( 0 ), 2 );
			fireDrop( dataTransferMock, targetPosition );

			expect( _getModelData( model ) ).toBe( '<caption>foo</caption>' +
				'[<table><tableRow><tableCell><paragraph>bar</paragraph></tableCell></tableRow></table>]'
			);
		} );

		it( 'should properly move content even if dragend event is not fired', () => {
			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			vi.useFakeTimers();
			const dataTransferMock = createDataTransfer();
			const spyClipboardOutput = vi.fn();
			const spyClipboardInput = vi.fn();
			let targetPosition;

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
			fireDragging( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expectDraggingMarker( targetPosition );
			expect( _getViewData( view, { renderUIElements: true } ) )
				.toBe( '<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>' );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 5 );
			fireDragging( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expectDraggingMarker( targetPosition );
			expect( _getViewData( view, { renderUIElements: true } ) )
				.toBe( '<p>{foo}ba<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>r</p>' );

			// Dropping.

			dataTransferMock.dropEffect = 'move';
			targetPosition = model.createPositionAt( root.getChild( 0 ), 6 );
			fireDrop( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expect( spyClipboardInput ).toHaveBeenCalled();
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].method ).toBe( 'drop' );
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );

			expect( _getModelData( model ) ).toBe( '<paragraph>barfoo[]</paragraph>' );
			expect( _getViewData( view ) ).toBe( '<p>barfoo{}</p>' );

			expectFinalized();
		} );

		it( 'should not allow dropping if the editor is read-only', () => {
			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			vi.useFakeTimers();
			const dataTransferMock = createDataTransfer();
			const spyClipboardOutput = vi.fn();
			const spyClipboardInput = vi.fn();
			let targetPosition;

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
			fireDragging( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expectDraggingMarker( targetPosition );
			expect( _getViewData( view, { renderUIElements: true } ) )
				.toBe( '<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>' );

			editor.enableReadOnlyMode( 'unit-test' );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 5 );
			fireDragging( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expect( dataTransferMock.dropEffect ).toBe( 'none' );
			expect( model.markers.has( 'drop-target' ) ).toBe( false );
			expect( _getViewData( view, { renderUIElements: true } ) ).toBe( '<p>{foo}bar</p>' );

			editor.disableReadOnlyMode( 'unit-test' );
			// Dropping.

			dataTransferMock.dropEffect = 'move';
			targetPosition = model.createPositionAt( root.getChild( 0 ), 6 );
			fireDrop( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expect( spyClipboardInput ).toHaveBeenCalled();
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].method ).toBe( 'drop' );
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );

			fireDragEnd( dataTransferMock );
			expectFinalized();

			expect( _getModelData( model ) ).toBe( '<paragraph>foobarfoo[]</paragraph>' );
			expect( _getViewData( view ) ).toBe( '<p>foobarfoo{}</p>' );
		} );

		it( 'should not allow dropping if the plugin is disabled', () => {
			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const plugin = editor.plugins.get( 'DragDrop' );
			vi.useFakeTimers();
			const dataTransferMock = createDataTransfer();
			const spyClipboardOutput = vi.fn();
			const spyClipboardInput = vi.fn();
			let targetPosition;

			viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );
			expectDragStarted( dataTransferMock, 'foo', spyClipboardOutput );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
			fireDragging( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expectDraggingMarker( targetPosition );
			expect( _getViewData( view, { renderUIElements: true } ) )
				.toBe( '<p>{foo}<span class="ck ck-clipboard-drop-target-position">\u2060<span></span>\u2060</span>bar</p>' );

			plugin.forceDisabled( 'test' );

			// Dragging.

			targetPosition = model.createPositionAt( root.getChild( 0 ), 5 );
			fireDragging( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expect( dataTransferMock.dropEffect ).toBe( 'none' );
			expect( model.markers.has( 'drop-target' ) ).toBe( false );
			expect( _getViewData( view, { renderUIElements: true } ) ).toBe( '<p>{foo}bar</p>' );

			plugin.clearForceDisabled( 'test' );
			// Dropping.

			dataTransferMock.dropEffect = 'move';
			targetPosition = model.createPositionAt( root.getChild( 0 ), 6 );
			fireDrop( dataTransferMock, targetPosition );
			vi.advanceTimersByTime( 100 );

			expect( spyClipboardInput ).toHaveBeenCalled();
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].method ).toBe( 'drop' );
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );

			fireDragEnd( dataTransferMock );
			expectFinalized();

			expect( _getModelData( model ) ).toBe( '<paragraph>foobarfoo[]</paragraph>' );
			expect( _getViewData( view ) ).toBe( '<p>foobarfoo{}</p>' );
		} );

		it( 'should do nothing if dragging on Android', () => {
			env.isAndroid = true;

			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const dataTransferMock = createDataTransfer();
			const spyClipboardInput = vi.fn();

			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			fireDragStart( dataTransferMock );

			expect( dataTransferMock.getData( 'text/html' ) ).toBe( 'foo' );
			expect( dataTransferMock.effectAllowed ).toBe( 'copyMove' );

			expect( viewDocument.getRoot().hasAttribute( 'draggable' ) ).toBe( false );

			env.isAndroid = false;
		} );

		describe( 'dragstart', () => {
			it( 'should not start dragging if the selection is collapsed', () => {
				_setModelData( model, '<paragraph>foo[]bar</paragraph>' );

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = vi.fn();
				const spyPreventDefault = vi.fn();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );

				fireDragStart( dataTransferMock, spyPreventDefault );

				expect( spyPreventDefault ).toHaveBeenCalled();
				expect( spyClipboardOutput ).not.toHaveBeenCalled();
			} );

			it( 'should not start dragging if the root editable would be dragged itself', () => {
				_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = vi.fn();
				const spyPreventDefault = vi.fn();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );

				const eventData = prepareEventData( model.createPositionAt( root.getChild( 0 ), 3 ) );
				eventData.domTarget = view.getDomRoot();
				eventData.target = domConverter.mapDomToView( view.getDomRoot() );
				eventData.domEvent = {
					isPrimary: true
				};

				viewDocument.fire( 'pointerdown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					preventDefault: spyPreventDefault,
					stopPropagation: () => {
					}
				} );

				expect( spyPreventDefault ).toHaveBeenCalled();
				expect( spyClipboardOutput ).not.toHaveBeenCalled();
			} );

			it( 'should not start dragging if the editable would be dragged itself', () => {
				_setModelData( model, '<table><tableRow><tableCell><paragraph>[foo]bar</paragraph></tableCell></tableRow></table>' );

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = vi.fn();
				const spyPreventDefault = vi.fn();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );

				const modelElement = root.getNodeByPath( [ 0, 0, 0 ] );
				const eventData = prepareEventData( model.createPositionAt( modelElement.getChild( 0 ), 3 ) );
				eventData.target = mapper.toViewElement( modelElement );
				eventData.domTarget = domConverter.mapViewToDom( eventData.target );
				eventData.domEvent = {
					isPrimary: true
				};

				expect( eventData.target.is( 'editableElement', 'td' ) ).toBe( true );

				viewDocument.fire( 'pointerdown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					preventDefault: spyPreventDefault,
					stopPropagation: () => {
					}
				} );

				expect( spyPreventDefault ).toHaveBeenCalled();
				expect( spyClipboardOutput ).not.toHaveBeenCalled();
			} );

			it( 'should mark allowed effect as "copy" if the editor is read-only', () => {
				_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = vi.fn();

				editor.enableReadOnlyMode( 'unit-test' );

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );

				fireDragStart( dataTransferMock );

				expect( viewDocument.getRoot().hasAttribute( 'draggable' ) ).toBe( false );
				expect( dataTransferMock.effectAllowed ).toBe( 'copy' );
			} );

			it( 'should start dragging by grabbing the widget selection handle', () => {
				_setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = vi.fn();
				const spyClipboardInput = vi.fn();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
				viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

				const domNode = view.getDomRoot().querySelector( '.ck-widget__selection-handle' );
				const widgetViewElement = viewDocument.getRoot().getChild( 1 );
				const selectionHandleElement = widgetViewElement.getChild( 0 );

				expect( selectionHandleElement.hasClass( 'ck-widget__selection-handle' ) ).toBe( true );

				const eventData = {
					domTarget: domNode,
					target: selectionHandleElement,
					domEvent: {
						isPrimary: true
					}
				};

				viewDocument.fire( 'pointerdown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					stopPropagation: () => {}
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).toBe( '<table class="table"><tbody><tr><td>abc</td></tr></tbody></table>'
				);

				expect( widgetViewElement.getAttribute( 'draggable' ) ).toBe( 'true' );

				expect( spyClipboardOutput ).toHaveBeenCalled();
				expect( spyClipboardOutput.mock.calls[ 0 ][ 0 ].method ).toBe( 'dragstart' );
				expect( spyClipboardOutput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );
				expect( _stringifyView( spyClipboardOutput.mock.calls[ 0 ][ 0 ].content ) )
					.toBe( '<table class="table"><tbody><tr><td><p>abc</p></td></tr></tbody></table>' );

				dataTransferMock.dropEffect = 'move';
				const targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
				fireDrop( dataTransferMock, targetPosition );

				expect( spyClipboardInput ).toHaveBeenCalled();
				expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].method ).toBe( 'drop' );
				expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );

				fireDragEnd( dataTransferMock );
				expectFinalized();

				expect( _getModelData( model ) ).toBe( '<paragraph>foobar</paragraph>' +
					'[<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>]'
				);
			} );

			it( 'should start dragging by grabbing the widget selection handle (in read only mode)', () => {
				_setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>'
				);

				editor.enableReadOnlyMode( 'unit-test' );

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = vi.fn();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );

				const domNode = view.getDomRoot().querySelector( '.ck-widget__selection-handle' );
				const widgetViewElement = viewDocument.getRoot().getChild( 1 );
				const selectionHandleElement = widgetViewElement.getChild( 0 );

				expect( selectionHandleElement.hasClass( 'ck-widget__selection-handle' ) ).toBe( true );

				const eventData = {
					domTarget: domNode,
					target: selectionHandleElement,
					domEvent: {
						isPrimary: true
					}
				};

				viewDocument.fire( 'pointerdown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					stopPropagation: () => {}
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).toBe( '<table class="table"><tbody><tr><td>abc</td></tr></tbody></table>'
				);

				expect( widgetViewElement.getAttribute( 'draggable' ) ).toBe( 'true' );

				expect( spyClipboardOutput ).toHaveBeenCalled();
				expect( spyClipboardOutput.mock.calls[ 0 ][ 0 ].method ).toBe( 'dragstart' );
				expect( spyClipboardOutput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );
				expect( _stringifyView( spyClipboardOutput.mock.calls[ 0 ][ 0 ].content ) )
					.toBe( '<table class="table"><tbody><tr><td><p>abc</p></td></tr></tbody></table>' );
			} );

			it( 'should start dragging by grabbing the widget element directly', () => {
				_setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<horizontalLine></horizontalLine>'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = vi.fn();
				const spyClipboardInput = vi.fn();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
				viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

				const widgetViewElement = viewDocument.getRoot().getChild( 1 );
				const domNode = domConverter.mapViewToDom( widgetViewElement );

				const eventData = {
					domTarget: domNode,
					target: widgetViewElement,
					domEvent: {
						isPrimary: true
					}
				};

				viewDocument.fire( 'pointerdown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					stopPropagation: () => {}
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).toBe( '<hr>' );

				expect( widgetViewElement.getAttribute( 'draggable' ) ).toBe( 'true' );

				expect( spyClipboardOutput ).toHaveBeenCalled();
				expect( spyClipboardOutput.mock.calls[ 0 ][ 0 ].method ).toBe( 'dragstart' );
				expect( spyClipboardOutput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );
				expect( _stringifyView( spyClipboardOutput.mock.calls[ 0 ][ 0 ].content ) ).toBe( '<hr></hr>' );

				dataTransferMock.dropEffect = 'move';
				const targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
				fireDrop( dataTransferMock, targetPosition );

				expect( spyClipboardInput ).toHaveBeenCalled();
				expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].method ).toBe( 'drop' );
				expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );

				fireDragEnd( dataTransferMock );
				expectFinalized();

				expect( _getModelData( model ) ).toBe( '<paragraph>foobar</paragraph>' +
					'[<horizontalLine></horizontalLine>]'
				);
			} );

			it( 'should start dragging the selected text fragment', () => {
				_setModelData( model,
					'<paragraph>[foo]bar</paragraph>'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = vi.fn();
				const spyClipboardInput = vi.fn();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
				viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

				const viewNode = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
				const domNode = domConverter.findCorrespondingDomText( viewNode );

				viewDocument.fire( 'pointerdown', {
					domTarget: domNode.parentNode,
					target: viewNode.parent,
					domEvent: {
						isPrimary: true
					}
				} );

				viewDocument.fire( 'dragstart', {
					domTarget: domNode,
					target: null, // text node
					domEvent: {},
					dataTransfer: dataTransferMock,
					stopPropagation: () => {}
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).toBe( 'foo' );

				expect( spyClipboardOutput ).toHaveBeenCalled();
				expect( spyClipboardOutput.mock.calls[ 0 ][ 0 ].method ).toBe( 'dragstart' );
				expect( spyClipboardOutput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );
				expect( _stringifyView( spyClipboardOutput.mock.calls[ 0 ][ 0 ].content ) ).toBe( 'foo' );

				dataTransferMock.dropEffect = 'move';
				const targetPosition = model.createPositionAt( root.getChild( 0 ), 4 );
				fireDrop( dataTransferMock, targetPosition );

				expect( spyClipboardInput ).toHaveBeenCalled();
				expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].method ).toBe( 'drop' );
				expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );

				fireDragEnd( dataTransferMock );
				expectFinalized();

				expect( _getModelData( model ) ).toBe( '<paragraph>bfoo[]ar</paragraph>'
				);
			} );

			// TODO: what does it mean "(but not nested editable)"?
			it( 'should start dragging by grabbing a widget nested element (but not nested editable)', () => {
				_setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<horizontalLine></horizontalLine>'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = vi.fn();
				const spyClipboardInput = vi.fn();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
				viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

				const widgetViewElement = viewDocument.getRoot().getChild( 1 );
				const viewElement = widgetViewElement.getChild( 0 );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'element', 'hr' ) ).toBe( true );

				const eventData = {
					domTarget: domNode,
					target: viewElement,
					domEvent: {
						isPrimary: true
					}
				};

				viewDocument.fire( 'pointerdown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					stopPropagation: () => {}
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).toBe( '<hr>' );

				expect( widgetViewElement.getAttribute( 'draggable' ) ).toBe( 'true' );

				expect( spyClipboardOutput ).toHaveBeenCalled();
				expect( spyClipboardOutput.mock.calls[ 0 ][ 0 ].method ).toBe( 'dragstart' );
				expect( spyClipboardOutput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );
				expect( _stringifyView( spyClipboardOutput.mock.calls[ 0 ][ 0 ].content ) ).toBe( '<hr></hr>' );

				dataTransferMock.dropEffect = 'move';
				const targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
				fireDrop( dataTransferMock, targetPosition );

				expect( spyClipboardInput ).toHaveBeenCalled();
				expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].method ).toBe( 'drop' );
				expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );

				fireDragEnd( dataTransferMock );
				expectFinalized();

				expect( _getModelData( model ) ).toBe( '<paragraph>foobar</paragraph>' +
					'[<horizontalLine></horizontalLine>]'
				);
			} );

			it( 'should not start dragging a widget if it is not a target for an event', () => {
				_setModelData( model,
					'<paragraph>foobar</paragraph>' +
					'[<horizontalLine></horizontalLine>]'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = vi.fn();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );

				const editableElement = viewDocument.getRoot();
				const editableDomNode = domConverter.mapViewToDom( editableElement );

				const eventData = {
					domTarget: editableDomNode,
					target: editableElement,
					domEvent: {
						isPrimary: true
					}
				};

				viewDocument.fire( 'pointerdown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					stopPropagation: () => {},
					preventDefault: () => {}
				} );

				expect( spyClipboardOutput ).not.toHaveBeenCalled();
				expect( dataTransferMock.getData( 'text/html' ) ).toBeUndefined();
			} );

			// TODO: this test looks invalid, "this._draggedRange" in experimental in most cases is not undefined.
			it.skip( 'should not start dragging a widget if it is not a target for an event (but it was selected)', () => {
				_setModelData( model,
					'<paragraph>foobar</paragraph>' +
					'[<horizontalLine></horizontalLine>]'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = vi.fn();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );

				const targetElement = viewDocument.getRoot().getChild( 0 );
				const targetDomNode = domConverter.mapViewToDom( targetElement );

				const eventData = {
					domTarget: targetDomNode,
					target: targetElement,
					domEvent: {
						isPrimary: true
					}
				};

				viewDocument.fire( 'pointerdown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					stopPropagation: () => {},
					preventDefault: () => {}
				} );

				expect( spyClipboardOutput ).not.toHaveBeenCalled();
				expect( dataTransferMock.getData( 'text/html' ) ).toBeUndefined();
			} );

			it( 'should drag parent paragraph if entire content is selected', () => {
				_setModelData( model,
					'<paragraph>foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>[<softBreak></softBreak>]</paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = vi.fn();
				const spyClipboardInput = vi.fn();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
				viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

				const modelElement = model.document.getRoot().getNodeByPath( [ 1, 0, 0, 0, 0 ] );
				const viewElement = mapper.toViewElement( modelElement );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'element', 'br' ) ).toBe( true );

				const eventData = {
					domTarget: domNode,
					target: viewElement,
					domEvent: {
						isPrimary: true
					}
				};

				viewDocument.fire( 'pointerdown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					stopPropagation: () => {}
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).toBe( '<p><br>&nbsp;</p>' );

				const modelCellElement = model.document.getRoot().getNodeByPath( [ 1, 0, 0 ] );
				const viewCellElement = mapper.toViewElement( modelCellElement );
				expect( viewCellElement.is( 'editableElement', 'td' ) ).toBe( true );
				expect( viewCellElement.getAttribute( 'draggable' ) ).toBe( 'true' );

				expect( spyClipboardOutput ).toHaveBeenCalled();
				expect( spyClipboardOutput.mock.calls[ 0 ][ 0 ].method ).toBe( 'dragstart' );
				expect( spyClipboardOutput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );
				expect( _stringifyView( spyClipboardOutput.mock.calls[ 0 ][ 0 ].content ) ).toBe( '<p><br></br></p>' );

				dataTransferMock.dropEffect = 'move';
				const targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
				fireDrop( dataTransferMock, targetPosition );

				expect( spyClipboardInput ).toHaveBeenCalled();
				expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].method ).toBe( 'drop' );
				expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );

				fireDragEnd( dataTransferMock );
				expectFinalized();

				expect( _getModelData( model ) ).toBe( '<paragraph>foobar</paragraph><paragraph><softBreak></softBreak> []</paragraph>' +
					'<table><tableRow><tableCell><paragraph></paragraph></tableCell></tableRow></table>'
				);
			} );

			it( 'should start dragging text from caption to paragraph', () => {
				_setModelData( model, trim`
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

				expect( dataTransferMock.getData( 'text/html' ) ).toBe( 'World' );

				fireDragging( dataTransferMock, positionAfterHr );
				expectDraggingMarker( positionAfterHr );

				fireDrop(
					dataTransferMock,
					model.createPositionAt( root.getChild( 1 ), 5 )
				);

				expect( _getModelData( model ) ).toBe( trim`
					<imageBlock src="">
						<caption></caption>
					</imageBlock>
					<paragraph>HelloWorld[]</paragraph>
				` );
			} );

			it( 'should start dragging text from title to paragraph', () => {
				_setModelData( model, trim`
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

				expect( dataTransferMock.getData( 'text/html' ) ).toBe( 'Foo' );

				fireDragging( dataTransferMock, position );
				expectDraggingMarker( position );

				fireDrop(
					dataTransferMock,
					model.createPositionAt( root.getChild( 1 ), 3 )
				);

				expect( _getModelData( model ) ).toBe( trim`
					<title><title-content> Bar</title-content></title>
					<paragraph>BarFoo[]</paragraph>
				` );
			} );

			it( 'should start dragging text from paragraph to title', () => {
				_setModelData( model, trim`
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

				expect( dataTransferMock.getData( 'text/html' ) ).toBe( '<p>Baz</p>' );

				fireDragging( dataTransferMock, model.createPositionAt( root.getChild( 0 ).getChild( 0 ), 3 ) );

				fireDrop(
					dataTransferMock,
					model.createPositionAt( root.getChild( 0 ).getChild( 0 ), 3 )
				);

				expect( _getModelData( model ) ).toBe( trim`
					<paragraph>Baz[]</paragraph>
					<title><title-content>Foo Bar</title-content></title>
				` );
			} );

			it( 'should not drag parent paragraph when only portion of content is selected', () => {
				_setModelData( model,
					'<paragraph>foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>ba[<softBreak></softBreak>]z</paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardOutput = vi.fn();
				const spyClipboardInput = vi.fn();

				viewDocument.on( 'clipboardOutput', ( event, data ) => spyClipboardOutput( data ) );
				viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

				const modelElement = model.document.getRoot().getNodeByPath( [ 1, 0, 0, 0, 2 ] );
				const viewElement = mapper.toViewElement( modelElement );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'element', 'br' ) ).toBe( true );

				const eventData = {
					domTarget: domNode,
					target: viewElement,
					domEvent: {
						isPrimary: true
					}
				};

				viewDocument.fire( 'pointerdown', {
					...eventData
				} );

				viewDocument.fire( 'dragstart', {
					...eventData,
					dataTransfer: dataTransferMock,
					stopPropagation: () => {}
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).toBe( '<br>' );

				const modelCellElement = model.document.getRoot().getNodeByPath( [ 1, 0, 0 ] );
				const viewCellElement = mapper.toViewElement( modelCellElement );
				expect( viewCellElement.is( 'editableElement', 'td' ) ).toBe( true );
				expect( viewCellElement.getAttribute( 'draggable' ) ).toBe( 'true' );

				expect( spyClipboardOutput ).toHaveBeenCalled();
				expect( spyClipboardOutput.mock.calls[ 0 ][ 0 ].method ).toBe( 'dragstart' );
				expect( spyClipboardOutput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );
				expect( _stringifyView( spyClipboardOutput.mock.calls[ 0 ][ 0 ].content ) ).toBe( '<br></br>' );

				dataTransferMock.dropEffect = 'move';
				const targetPosition = model.createPositionAt( root.getChild( 0 ), 3 );
				fireDrop( dataTransferMock, targetPosition );

				expect( spyClipboardInput ).toHaveBeenCalled();
				expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].method ).toBe( 'drop' );
				expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );

				fireDragEnd( dataTransferMock );
				expectFinalized();

				expect( _getModelData( model ) ).toBe( '<paragraph>foo<softBreak></softBreak>[]bar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>baz</paragraph></tableCell></tableRow></table>'
				);
			} );

			it( 'should remove "draggable" attribute from widget element if pointerup before dragging start (selection handle)', () => {
				_setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>'
				);

				vi.useFakeTimers();
				const domNode = view.getDomRoot().querySelector( '.ck-widget__selection-handle' );
				const widgetViewElement = viewDocument.getRoot().getChild( 1 );
				const selectionHandleElement = widgetViewElement.getChild( 0 );

				expect( selectionHandleElement.hasClass( 'ck-widget__selection-handle' ) ).toBe( true );

				const eventData = {
					domTarget: domNode,
					target: selectionHandleElement,
					domEvent: {
						isPrimary: true
					}
				};

				viewDocument.fire( 'pointerdown', {
					...eventData
				} );

				expect( widgetViewElement.getAttribute( 'draggable' ) ).toBe( 'true' );

				viewDocument.fire( 'pointerup' );
				vi.advanceTimersByTime( 50 );

				expect( widgetViewElement.hasAttribute( 'draggable' ) ).toBe( false );
			} );

			it( 'should remove "draggable" attribute from widget element if pointerup before dragging start (widget)', () => {
				_setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<horizontalLine></horizontalLine>'
				);

				vi.useFakeTimers();
				const widgetViewElement = viewDocument.getRoot().getChild( 1 );
				const viewElement = widgetViewElement.getChild( 0 );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'element', 'hr' ) ).toBe( true );

				const eventData = {
					domTarget: domNode,
					target: viewElement,
					domEvent: {
						isPrimary: true
					}
				};

				viewDocument.fire( 'pointerdown', {
					...eventData
				} );

				expect( widgetViewElement.getAttribute( 'draggable' ) ).toBe( 'true' );

				viewDocument.fire( 'pointerup' );
				vi.advanceTimersByTime( 50 );

				expect( widgetViewElement.hasAttribute( 'draggable' ) ).toBe( false );
			} );

			it( 'can drag multiple elements', () => {
				_setModelData( model,
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
				_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

				vi.useFakeTimers();
				const editableElement = viewDocument.getRoot();
				const viewElement = editableElement.getChild( 0 );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'element', 'p' ) ).toBe( true );

				const eventData = {
					domTarget: domNode,
					target: viewElement,
					domEvent: {
						isPrimary: true
					}
				};

				viewDocument.fire( 'pointerdown', {
					...eventData
				} );

				expect( editableElement.getAttribute( 'draggable' ) ).toBe( 'true' );

				viewDocument.fire( 'pointerup' );
				vi.advanceTimersByTime( 50 );

				expect( editableElement.hasAttribute( 'draggable' ) ).toBe( false );
			} );

			it( 'should not clear "draggable" attribute on pointerup when on Android', () => {
				_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

				vi.useFakeTimers();
				const editableElement = viewDocument.getRoot();
				const viewElement = editableElement.getChild( 0 );
				const domNode = domConverter.mapViewToDom( viewElement );

				viewDocument.fire( 'pointerdown', {
					domTarget: domNode,
					target: viewElement,
					domEvent: { isPrimary: true }
				} );

				expect( editableElement.getAttribute( 'draggable' ) ).toBe( 'true' );

				env.isAndroid = true;
				viewDocument.fire( 'pointerup' );
				vi.advanceTimersByTime( 50 );
				env.isAndroid = false;

				expect( editableElement.getAttribute( 'draggable' ) ).toBe( 'true' );
			} );

			it( 'should only show one preview element when you drag element outside the editing root', () => {
				_setModelData( model,
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
				expect( numberOfCkContentElements ).toBe( 2 );
			} );

			it( 'should show preview with custom implementation if drag element outside the editing root', () => {
				_setModelData( editor.model, '<paragraph>[Foo.]</paragraph><horizontalLine></horizontalLine>' );

				const dataTransfer = createDataTransfer( {} );

				const spy = vi.spyOn( dataTransfer, 'setDragImage' );
				const clientX = 10;

				viewDocument.fire( 'dragstart', {
					dataTransfer,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn(),
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

				expect( spy ).toHaveBeenCalledTimes( 1 );

				const [ previewElement, x, y ] = spy.mock.calls[ 0 ];
				expect( x ).toBe( 0 );
				expect( y ).toBe( 0 );
				// Note: browsers silently reject negative padding-left values, so we check via style.width instead.
				// width = editableWidth + offsetLeft, where offsetLeft = domRect.left - clientX + paddingLeft.
				const offsetLeft = domRect.left - clientX + paddingLeft;
				const domEditablePaddingRight = parseFloat( window.getComputedStyle( domEditable ).paddingRight );
				const editableWidth = parseFloat( window.getComputedStyle( domEditable ).width ) - paddingLeft - domEditablePaddingRight;
				expect( previewElement.style.width ).toBe( `${ editableWidth + offsetLeft }px` );
				expect( previewElement.className ).toBe( 'ck ck-content ck-clipboard-preview' );
				expect( previewElement.firstChild.tagName ).toBe( 'P' );
				expect( previewElement.firstChild.innerHTML ).toBe( 'Foo.' );
			} );

			it( 'should show preview with custom implementation on iOS', () => {
				const originalEnviOs = env.isiOS;

				env.isiOS = true;
				_setModelData( editor.model, '<paragraph>[Foo.]</paragraph><horizontalLine></horizontalLine>' );

				const dataTransfer = createDataTransfer( {} );

				const spy = vi.spyOn( dataTransfer, 'setDragImage' );

				const modelElement = root.getNodeByPath( [ 0 ] );
				const viewElement = mapper.toViewElement( modelElement );
				const domElement = domConverter.mapViewToDom( viewElement );

				viewDocument.fire( 'dragstart', {
					dataTransfer,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn(),
					domEvent: getMockedMousePosition( domElement ),
					domTarget: domElement
				} );

				expect( spy ).toHaveBeenCalledTimes( 1 );

				const [ previewElementiOS, xi, yi ] = spy.mock.calls[ 0 ];
				expect( xi ).toBe( 0 );
				expect( yi ).toBe( 0 );
				expect( previewElementiOS.style.getPropertyValue( 'padding' ) ).toBe( '10px' );
				expect( previewElementiOS.style.getPropertyValue( 'min-width' ) ).toBe( '200px' );
				expect( previewElementiOS.style.getPropertyValue( 'min-height' ) ).toBe( '20px' );
				expect( previewElementiOS.style.getPropertyValue( 'box-sizing' ) ).toBe( 'border-box' );
				expect( previewElementiOS.style.getPropertyValue( 'max-width' ) ).toMatch( /px$/ );
				expect( previewElementiOS.style.getPropertyValue( 'background-color' ) ).toBe( 'var(--ck-color-base-background)' );
				expect( previewElementiOS.className ).toBe( 'ck ck-content ck-clipboard-preview' );
				expect( previewElementiOS.firstChild.tagName ).toBe( 'P' );
				expect( previewElementiOS.firstChild.innerHTML ).toBe( 'Foo.' );

				env.isiOS = originalEnviOs;
			} );

			it( 'should show preview with browser implementation if drag element inside the editing root', () => {
				_setModelData( editor.model, '<paragraph>[Foo.]</paragraph><horizontalLine></horizontalLine>' );

				const dataTransfer = createDataTransfer( {} );

				const spy = vi.spyOn( dataTransfer, 'setDragImage' );

				const modelElement = root.getNodeByPath( [ 0 ] );
				const viewElement = mapper.toViewElement( modelElement );
				const domElement = domConverter.mapViewToDom( viewElement );

				viewDocument.fire( 'dragstart', {
					dataTransfer,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn(),
					domEvent: getMockedMousePosition( domElement ),
					domTarget: domElement
				} );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should not fail when preview container exists but has no child on second drag', () => {
				_setModelData( editor.model, '<paragraph>[Foo.]</paragraph><horizontalLine></horizontalLine>' );

				const dataTransfer = createDataTransfer( {} );
				const spySetDragImage = vi.spyOn( dataTransfer, 'setDragImage' );

				const modelElement = root.getNodeByPath( [ 0 ] );
				const viewElement = mapper.toViewElement( modelElement );
				const domElement = domConverter.mapViewToDom( viewElement );

				// First drag inside the editable — creates the preview container but returns early without
				// appending a child (browser handles the preview natively).
				viewDocument.fire( 'dragstart', {
					dataTransfer,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn(),
					domEvent: getMockedMousePosition( domElement ),
					domTarget: domElement
				} );

				expect( spySetDragImage ).not.toHaveBeenCalled();

				// Second drag outside the editable — the container already exists but has no firstElementChild.
				const outsideElement = document.createElement( 'div' );

				viewDocument.fire( 'dragstart', {
					dataTransfer,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn(),
					domEvent: { clientX: 0 },
					domTarget: outsideElement
				} );

				expect( spySetDragImage ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		describe( 'dragenter', () => {
			it( 'should focus the editor while dragging over the editable', () => {
				const stubFocus = vi.spyOn( view, 'focus' ).mockImplementation( () => {} );

				viewDocument.fire( 'dragenter', {} );

				expect( stubFocus ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should not focus the editor while dragging over disabled editor', () => {
				const stubFocus = vi.spyOn( view, 'focus' ).mockImplementation( () => {} );

				editor.enableReadOnlyMode( 'unit-test' );

				viewDocument.fire( 'dragenter' );

				expect( stubFocus ).not.toHaveBeenCalled();
			} );
		} );

		describe( 'dragleave', () => {
			it( 'should remove drop target marker', () => {
				_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

				vi.useFakeTimers();
				const dataTransferMock = createDataTransfer();

				fireDragStart( dataTransferMock );
				expectDragStarted( dataTransferMock, 'foo' );

				fireDragging( dataTransferMock, model.createPositionAt( root.getChild( 0 ), 3 ) );
				vi.advanceTimersByTime( 100 );

				viewDocument.fire( 'dragleave' );
				expect( model.markers.has( 'drop-target' ) ).toBe( true );

				vi.advanceTimersByTime( 100 );
				expect( model.markers.has( 'drop-target' ) ).toBe( false );
			} );

			it( 'should not remove drop target marker if dragging left some nested element', () => {
				_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

				const spy = vi.fn();
				vi.useFakeTimers();
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
				vi.advanceTimersByTime( 100 );

				viewDocument.fire( 'dragleave' );
				expectDraggingMarker( targetPosition );

				vi.advanceTimersByTime( 10 );
				expectDraggingMarker( targetPosition );

				targetPosition = model.createPositionAt( root.getChild( 0 ), 4 );
				fireDragging( dataTransferMock, targetPosition );
				vi.advanceTimersByTime( 60 );

				expectDraggingMarker( targetPosition );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should not focus the editor while dragging over disabled editor', () => {
				const stubFocus = vi.spyOn( view, 'focus' ).mockImplementation( () => {} );

				editor.enableReadOnlyMode( 'unit-test' );

				viewDocument.fire( 'dragenter' );

				expect( stubFocus ).not.toHaveBeenCalled();
			} );
		} );

		describe( 'dragover', () => {
			it( 'should put drop target marker inside a text node', () => {
				_setModelData( model, '<paragraph>[]foobar</paragraph>' );

				const dataTransferMock = createDataTransfer();
				const targetPosition = model.createPositionAt( root.getChild( 0 ), 2 );

				fireDragging( dataTransferMock, targetPosition );

				expectDraggingMarker( targetPosition );
			} );

			it( 'cannot be dropped on non-editable place.', () => {
				_setModelData( model, '<paragraph>[]foobar</paragraph>' );

				const dataTransferMock = createDataTransfer();
				const targetPosition = model.createPositionAt( root.getChild( 0 ), 2 );

				// For selection to be in non-editable place by overwriting `canEditAt()`.
				model.on( 'canEditAt', evt => {
					evt.return = false;
					evt.stop();
				}, { priority: 'highest' } );

				fireDragging( dataTransferMock, targetPosition );

				expect( model.markers.has( 'drop-target' ) ).toBe( false );
			} );

			it( 'should put drop target marker inside and attribute element', () => {
				_setModelData( model, '<paragraph>[]foo<$text bold="true">bar</$text></paragraph>' );

				const dataTransferMock = createDataTransfer();

				const viewElement = viewDocument.getRoot().getChild( 0 ).getChild( 1 );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'attributeElement' ) ).toBe( true );

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
				_setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();

				const viewElement = viewDocument.getRoot().getChild( 1 ).getChild( 0 );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.hasClass( 'ck-widget__selection-handle' ) ).toBe( true );

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: viewElement,
					dataTransfer: dataTransferMock,
					domEvent: getMockedMousePosition( domNode )
				} );

				expectDraggingMarker( model.createPositionAt( root.getChild( 1 ), 'before' ) );
			} );

			it( 'should put marker after element when mouse position is on the bottom half of it', () => {
				_setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();

				const viewElement = viewDocument.getRoot().getChild( 1 ).getChild( 0 );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.hasClass( 'ck-widget__selection-handle' ) ).toBe( true );

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
				_setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();

				const modelElement = root.getNodeByPath( [ 1, 0 ] );
				const viewElement = mapper.toViewElement( modelElement );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'element', 'tr' ) ).toBe( true );

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: viewElement,
					dataTransfer: dataTransferMock,
					domEvent: getMockedMousePosition( domNode )
				} );

				expectDraggingMarker( model.createPositionAt( root.getChild( 1 ), 'before' ) );
			} );

			it( 'should find drop position while hovering over empty nested editable', () => {
				_setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph></paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();

				const modelElement = root.getNodeByPath( [ 1, 0, 0 ] );
				const viewElement = mapper.toViewElement( modelElement );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'element', 'td' ) ).toBe( true );

				viewDocument.fire( 'dragging', {
					domTarget: domNode,
					target: viewElement,
					dataTransfer: dataTransferMock,
					domEvent: getMockedMousePosition( domNode )
				} );

				expectDraggingMarker( model.createPositionAt( root.getNodeByPath( [ 1, 0, 0, 0 ] ), 'before' ) );
			} );

			it( 'should find drop position while hovering over space between blocks', () => {
				_setModelData( model,
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

				expect( viewElement.is( 'rootElement' ) ).toBe( true );

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
				_setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<table><tableRow><tableCell><paragraph>abc</paragraph></tableCell></tableRow></table>'
				);

				const dataTransferMock = createDataTransfer();

				const rootElement = viewDocument.getRoot();
				const modelElement = root.getNodeByPath( [ 1, 0, 0 ] );
				const viewElement = mapper.toViewElement( modelElement );
				const domNode = domConverter.mapViewToDom( viewElement );

				expect( viewElement.is( 'element', 'td' ) ).toBe( true );

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
				_setModelData( model,
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
				_setModelData( model,
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

				expect( viewElement.is( 'rootElement' ) ).toBe( true );

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

				_setModelData( model,
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

				_setModelData( model,
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
				_setModelData( model,
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
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				} );

				// Fire the 'dragend' event on the document
				document.dispatchEvent( new Event( 'dragend' ) );

				// Check if the blockMode changes to 'false'
				expect( plugin._blockMode ).toBe( false );
				expect( model.markers.has( 'drop-target' ) ).toBe( false );
			} );
		} );

		describe( 'drop', () => {
			// TODO: to be discussed.
			it.skip( 'should update targetRanges', () => {
				_setModelData( model,
					'<paragraph>[]foobar</paragraph>' +
					'<horizontalLine></horizontalLine>'
				);

				const dataTransferMock = createDataTransfer();
				const spyClipboardInput = vi.fn();

				viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

				dataTransferMock.dropEffect = 'move';
				const targetPosition = model.createPositionAt( root.getChild( 1 ), 0 );
				fireDrop( dataTransferMock, targetPosition );

				expect( spyClipboardInput ).toHaveBeenCalled();

				const data = spyClipboardInput.mock.calls[ 0 ][ 0 ];
				expect( data.method ).toBe( 'drop' );
				expect( data.dataTransfer ).toBe( dataTransferMock );
				expect( data.targetRanges.length ).toBe( 1 );
				expect( data.targetRanges[ 0 ].isEqual( view.createRangeOn( viewDocument.getRoot().getChild( 1 ) ) ) ).toBe( true );
			} );
		} );

		describe( 'extending selection range when all parent elements are selected', () => {
			it( 'extends flat selection', () => {
				_setModelData( model, trim`
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
				_setModelData( model, trim`
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
				_setModelData( model, trim`
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
				_setModelData( model, trim`
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
				expect( widgetToolbarRepository.isEnabled ).toBe( true );
			} );

			it( 'is enabled when starts dragging the text node', () => {
				_setModelData( editor.model, '<paragraph>[Foo.]</paragraph><horizontalLine></horizontalLine>' );

				const nodeModel = root.getNodeByPath( [ 0 ] );
				const nodeView = mapper.toViewElement( nodeModel );
				const nodeDOM = domConverter.mapViewToDom( nodeView );
				const dataTransfer = createDataTransfer( {} );

				viewDocument.fire( 'dragstart', {
					dataTransfer,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn(),
					domEvent: getMockedMousePosition( nodeDOM )
				} );

				expect( widgetToolbarRepository.isEnabled ).toBe( true );
			} );

			it( 'is disabled when plugin is disabled', () => {
				_setModelData( editor.model, '<paragraph>Foo.</paragraph>[<horizontalLine></horizontalLine>]' );

				const nodeModel = root.getNodeByPath( [ 0 ] );
				const nodeView = mapper.toViewElement( nodeModel );
				const nodeDOM = domConverter.mapViewToDom( nodeView );

				const plugin = editor.plugins.get( 'DragDrop' );
				plugin.isEnabled = false;

				viewDocument.fire( 'dragstart', {
					preventDefault: vi.fn(),
					target: viewDocument.getRoot().getChild( 1 ),
					dataTransfer: createDataTransfer( {} ),
					stopPropagation: vi.fn(),
					domEvent: getMockedMousePosition( nodeDOM )
				} );

				expect( widgetToolbarRepository.isEnabled ).toBe( false );
			} );

			it( 'is disabled when starts dragging the widget', () => {
				_setModelData( editor.model, '<paragraph>Foo.</paragraph>[<horizontalLine></horizontalLine>]' );

				const nodeModel = root.getNodeByPath( [ 0 ] );
				const nodeView = mapper.toViewElement( nodeModel );
				const nodeDOM = domConverter.mapViewToDom( nodeView );

				viewDocument.fire( 'dragstart', {
					preventDefault: vi.fn(),
					target: viewDocument.getRoot().getChild( 1 ),
					dataTransfer: createDataTransfer( {} ),
					stopPropagation: vi.fn(),
					domEvent: getMockedMousePosition( nodeDOM )
				} );

				expect( widgetToolbarRepository.isEnabled ).toBe( false );
			} );

			it( 'is enabled when ends dragging (drop in the editable)', () => {
				_setModelData( editor.model, '[<horizontalLine></horizontalLine>]' );

				const dataTransfer = createDataTransfer( {} );

				const nodeModel = root.getNodeByPath( [ 0 ] );
				const nodeView = mapper.toViewElement( nodeModel );
				const nodeDOM = domConverter.mapViewToDom( nodeView );

				viewDocument.fire( 'dragstart', {
					preventDefault: vi.fn(),
					target: viewDocument.getRoot().getChild( 0 ),
					dataTransfer,
					stopPropagation: vi.fn(),
					domEvent: getMockedMousePosition( nodeDOM )
				} );

				expect( widgetToolbarRepository.isEnabled ).toBe( false );

				viewDocument.fire( 'drop', {
					preventDefault: vi.fn(),
					stopPropagation: vi.fn(),
					target: viewDocument.getRoot().getChild( 0 ),
					dataTransfer,
					method: 'drop',
					domEvent: {
						clientX: vi.fn(),
						clientY: vi.fn()
					}
				} );

				expect( widgetToolbarRepository.isEnabled ).toBe( true );
			} );

			it( 'is enabled when ends dragging (drop outside the editable)', () => {
				_setModelData( editor.model, '[<horizontalLine></horizontalLine>]' );

				const dataTransfer = createDataTransfer( {} );

				const nodeModel = root.getNodeByPath( [ 0 ] );
				const nodeView = mapper.toViewElement( nodeModel );
				const nodeDOM = domConverter.mapViewToDom( nodeView );

				viewDocument.fire( 'dragstart', {
					preventDefault: vi.fn(),
					target: viewDocument.getRoot().getChild( 0 ),
					dataTransfer,
					stopPropagation() {},
					domEvent: getMockedMousePosition( nodeDOM )
				} );

				expect( widgetToolbarRepository.isEnabled ).toBe( false );

				viewDocument.fire( 'dragend', {
					preventDefault: vi.fn(),
					dataTransfer
				} );

				expect( widgetToolbarRepository.isEnabled ).toBe( true );
			} );
		} );
	} );

	describe( '_updatePreview', () => {
		let targetElement, dragDrop, warnStub;

		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ DragDrop, PastePlainText, Paragraph, Bold ]
			} );

			dragDrop = editor.plugins.get( DragDrop );

			targetElement = document.createElement( 'div' );
			warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		} );

		afterEach( async () => {
			await editor.destroy();

			editorElement.remove();
			targetElement.remove();
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

			expect( dragDrop._previewContainer.querySelector( 'script' ) ).toBeNull();
			expect( dragDrop._previewContainer.querySelector( 'style' ) ).toBeNull();
			expect( dragDrop._previewContainer.querySelector( 'strong' ) ).not.toBeNull();
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

			expect( insertedElement.getAttribute( 'onclick' ) ).toBeNull();

			expect( warnStub ).toHaveBeenCalledTimes( 1 );
			expect( warnStub ).toHaveBeenCalledWith(
				expect.stringMatching( /^domconverter-unsafe-attribute-detected/ ),
				{
					domElement: insertedElement,
					key: 'onclick',
					value: 'alert(\'abc\')'
				},
				expect.any( String ) // Link to the documentation
			);
		} );
	} );

	function fireDragStart( dataTransferMock, preventDefault = () => {}, domTarget ) {
		const eventData = prepareEventData( model.document.selection.getLastPosition(), domTarget );

		viewDocument.fire( 'pointerdown', {
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
			content: dataTransferMock.getData( 'text/html' ),
			stopPropagation: () => {},
			preventDefault: () => {}
		} );
	}

	function fireDrop( dataTransferMock, modelPosition ) {
		viewDocument.fire( 'clipboardInput', {
			...prepareEventData( modelPosition ),
			method: 'drop',
			dataTransfer: dataTransferMock,
			content: dataTransferMock.getData( 'text/html' ),
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
		expect( dataTransferMock.getData( 'text/html' ) ).toBe( data );
		expect( dataTransferMock.effectAllowed ).toBe( effectAllowed );

		expect( viewDocument.getRoot().getAttribute( 'draggable' ) ).toBe( 'true' );

		if ( spyClipboardOutput ) {
			expect( spyClipboardOutput ).toHaveBeenCalled();
			expect( spyClipboardOutput.mock.calls[ 0 ][ 0 ].method ).toBe( 'dragstart' );
			expect( spyClipboardOutput.mock.calls[ 0 ][ 0 ].dataTransfer ).toBe( dataTransferMock );
			expect( _stringifyView( spyClipboardOutput.mock.calls[ 0 ][ 0 ].content ) ).toBe( data );
		}
	}

	function expectDraggingMarker( targetPositionOrRange ) {
		expect( model.markers.has( 'drop-target' ) ).toBe( true );

		if ( targetPositionOrRange.is( 'position' ) ) {
			expect( model.markers.get( 'drop-target' ).getRange().isCollapsed ).toBe( true );
			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual( targetPositionOrRange ) ).toBe( true );
		} else {
			expect( model.markers.get( 'drop-target' ).getRange().isEqual( targetPositionOrRange ) ).toBe( true );
		}
	}

	function expectFinalized() {
		expect( viewDocument.getRoot().hasAttribute( 'draggable' ) ).toBe( false );

		expect( model.markers.has( 'drop-target' ) ).toBe( false );
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
