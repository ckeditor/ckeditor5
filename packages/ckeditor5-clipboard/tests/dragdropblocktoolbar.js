/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { DragDropTarget } from '../src/dragdroptarget.js';
import { DragDrop } from '../src/dragdrop.js';
import { PastePlainText } from '../src/pasteplaintext.js';
import { DragDropBlockToolbar } from '../src/dragdropblocktoolbar.js';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table } from '@ckeditor/ckeditor5-table';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { ShiftEnter } from '@ckeditor/ckeditor5-enter';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { BlockToolbar } from '@ckeditor/ckeditor5-ui';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { Image, ImageCaption } from '@ckeditor/ckeditor5-image';
import { env } from '@ckeditor/ckeditor5-utils';

import { _setModelData } from '@ckeditor/ckeditor5-engine';

describe( 'Drag and Drop Block Toolbar', () => {
	let editorElement, editor, model, view, viewDocument, root, mapper, domConverter, dragDropBlockToolbar,
		blockToolbar, blockToolbarButton;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				DragDrop,
				DragDropBlockToolbar,
				DragDropTarget,
				PastePlainText,
				Paragraph,
				Table,
				HorizontalLine,
				ShiftEnter,
				BlockQuote,
				Bold,
				Image,
				ImageCaption,
				BlockToolbar
			],
			blockToolbar: [ 'bold' ]
		} );

		editor.ui.focusTracker.isFocused = true;

		model = editor.model;
		root = model.document.getRoot();
		mapper = editor.editing.mapper;
		view = editor.editing.view;
		viewDocument = view.document;
		domConverter = view.domConverter;
		dragDropBlockToolbar = editor.plugins.get( DragDropBlockToolbar );

		blockToolbar = editor.plugins.get( BlockToolbar );
		blockToolbarButton = blockToolbar.buttonView.element;
	} );

	afterEach( async () => {
		await editor.destroy();
		editorElement.remove();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( DragDropBlockToolbar.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( DragDropBlockToolbar.isPremiumPlugin ).toBe( false );
	} );

	describe( 'init', () => {
		it( 'should toggle read only mode', () => {
			expect( dragDropBlockToolbar.isEnabled ).toBe( true );

			editor.enableReadOnlyMode( 'test' );

			expect( dragDropBlockToolbar.isEnabled ).toBe( false );

			editor.disableReadOnlyMode( 'test' );

			expect( dragDropBlockToolbar.isEnabled ).toBe( true );
		} );

		it( 'should be disabled on android', async () => {
			env.isAndroid = true;

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ DragDrop, DragDropBlockToolbar ]
			} );

			expect( editor.plugins.get( DragDropBlockToolbar ).isEnabled ).toBe( false );

			await editor.destroy();

			env.isAndroid = false;
		} );

		it( 'should not set draggable="true" on BlockToolbar button when disabled on Android init', async () => {
			env.isAndroid = true;

			const localElement = document.createElement( 'div' );
			document.body.appendChild( localElement );

			const localEditor = await ClassicTestEditor.create( localElement, {
				plugins: [
					DragDrop,
					DragDropBlockToolbar,
					DragDropTarget,
					PastePlainText,
					Paragraph,
					BlockToolbar,
					Bold
				],
				blockToolbar: [ 'bold' ]
			} );

			const localBlockToolbar = localEditor.plugins.get( BlockToolbar );
			const buttonElement = localBlockToolbar.buttonView.element;

			expect( buttonElement.getAttribute( 'draggable' ) ).not.toBe( 'true' );

			await localEditor.destroy();
			localElement.remove();

			env.isAndroid = false;
		} );

		it( 'should display block toolbar button', () => {
			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			expect( blockToolbarButton ).not.toBeNull();
			expect( blockToolbarButton.className.includes( 'ck-hidden' ) ).toBe( false );
		} );
	} );

	describe( 'dragging', () => {
		it( 'should set selection on drag block toolbar button', () => {
			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

			const dragEvent = new DragEvent( 'dragstart' );

			viewDocument.on( 'dragstart', ( evt, data ) => {
				expect( data.domEvent ).toBe( dragEvent );
				evt.stop();
			}, 'highest' );

			blockToolbarButton.dispatchEvent( dragEvent );

			const modelSelection = model.document.selection;
			const { focus, anchor } = modelSelection;

			expect( focus.path ).toEqual( [ 0, 6 ] );
			expect( anchor.path ).toEqual( [ 0, 0 ] );
			expect( dragDropBlockToolbar._isBlockDragging ).toBe( true );
			expect( focusSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should not set selection if plugin is disabled', () => {
			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			editor.enableReadOnlyMode( 'test' );

			const dragEvent = new DragEvent( 'dragstart' );

			blockToolbarButton.dispatchEvent( dragEvent );

			const modelSelection = model.document.selection;
			const { focus, anchor } = modelSelection;

			expect( focus.path ).toEqual( [ 0, 3 ] );
			expect( anchor.path ).toEqual( [ 0, 0 ] );
		} );

		it( 'should display dragging marker', () => {
			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const dragStartEvent = new DragEvent( 'dragstart', {
				dataTransfer: new DataTransfer()
			} );

			const { x: clientX, y: clientY } = editor.editing.view.getDomRoot().getBoundingClientRect();

			blockToolbarButton.dispatchEvent( dragStartEvent );

			const dragOverEvent = new DragEvent( 'dragover', {
				clientX: clientX - 50,
				clientY,
				dataTransfer: new DataTransfer()
			} );

			document.dispatchEvent( dragOverEvent );

			const targetPosition = model.createPositionAt( root.getChild( 0 ), 'before' );

			expectDraggingMarker( targetPosition );
		} );

		it( 'should display dragging marker (RTL)', () => {
			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			editor.locale.contentLanguageDirection = 'rtl';

			const dragStartEvent = new DragEvent( 'dragstart', {
				dataTransfer: new DataTransfer()
			} );

			const { x: clientX, y: clientY, width } = editor.editing.view.getDomRoot().getBoundingClientRect();

			blockToolbarButton.dispatchEvent( dragStartEvent );

			const dragOverEvent = new DragEvent( 'dragover', {
				clientX: clientX + width + 50,
				clientY,
				dataTransfer: new DataTransfer()
			} );

			document.dispatchEvent( dragOverEvent );

			const targetPosition = model.createPositionAt( root.getChild( 0 ), 'before' );

			expectDraggingMarker( targetPosition );
		} );

		it( 'should not drag if block toolbar is disabled', () => {
			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			editor.enableReadOnlyMode( 'test' );

			const dragStartEvent = new DragEvent( 'dragstart', {
				dataTransfer: new DataTransfer()
			} );
			const modelParagraph = root.getNodeByPath( [ 0 ] );
			const viewParagraph = mapper.toViewElement( modelParagraph );
			const domNode = domConverter.mapViewToDom( viewParagraph );

			const { x: clientX, y: clientY } = domNode.getBoundingClientRect();

			blockToolbarButton.dispatchEvent( dragStartEvent );

			const dragOverEvent = new DragEvent( 'dragover', {
				clientX,
				clientY,
				dataTransfer: new DataTransfer()
			} );

			document.dispatchEvent( dragOverEvent );

			expect( model.markers.has( 'drop-target' ) ).toBe( false );
		} );

		it( 'should not display dragging marker', () => {
			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const dragStartEvent = new DragEvent( 'dragstart', {
				dataTransfer: new DataTransfer()
			} );

			blockToolbarButton.dispatchEvent( dragStartEvent );

			const dragOverEvent = new DragEvent( 'dragover', {
				clientX: -99999,
				clientY: -99999,
				dataTransfer: new DataTransfer()
			} );

			document.dispatchEvent( dragOverEvent );

			expect( model.markers.has( 'drop-target' ) ).toBe( false );
		} );

		it( 'should drop element', () => {
			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const modelParagraph = root.getNodeByPath( [ 0 ] );
			const viewParagraph = mapper.toViewElement( modelParagraph );
			const domNode = domConverter.mapViewToDom( viewParagraph );
			const spyClipboardInput = vi.fn();

			const { x: clientX, y: clientY } = domNode.getBoundingClientRect();
			const dragStartEvent = new DragEvent( 'dragstart', {
				dataTransfer: new DataTransfer()
			} );

			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			blockToolbarButton.dispatchEvent( dragStartEvent );

			const dragOverEvent = new DragEvent( 'dragover', {
				clientX,
				clientY,
				dataTransfer: new DataTransfer()
			} );

			document.dispatchEvent( dragOverEvent );

			const dropEvent = new DragEvent( 'drop', {
				clientX,
				clientY,
				dataTransfer: new DataTransfer()
			} );

			viewDocument.on( 'drop', ( evt, data ) => {
				data.stopPropagation();
			}, 'highest' );

			document.dispatchEvent( dropEvent );

			expect( spyClipboardInput ).toHaveBeenCalled();
			expect( spyClipboardInput.mock.calls[ 0 ][ 0 ].method ).toBe( 'drop' );
		} );

		it( 'should end drag and drop', () => {
			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const modelParagraph = root.getNodeByPath( [ 0 ] );
			const viewParagraph = mapper.toViewElement( modelParagraph );
			const domNode = domConverter.mapViewToDom( viewParagraph );
			const spyClipboardInput = vi.fn();

			const { x: clientX, y: clientY } = domNode.getBoundingClientRect();
			const dragStartEvent = new DragEvent( 'dragstart', {
				dataTransfer: new DataTransfer()
			} );

			viewDocument.on( 'clipboardInput', ( event, data ) => spyClipboardInput( data ) );

			blockToolbarButton.dispatchEvent( dragStartEvent );

			const dragOverEvent = new DragEvent( 'dragover', {
				clientX,
				clientY,
				dataTransfer: new DataTransfer()
			} );

			document.dispatchEvent( dragOverEvent );

			const dragEndEvent = new DragEvent( 'dragend', {
				clientX,
				clientY,
				dataTransfer: new DataTransfer()
			} );

			document.dispatchEvent( dragEndEvent );

			expect( dragDropBlockToolbar._isBlockDragging ).toBe( false );
		} );

		it( 'should show preview with white background on iOS', () => {
			const originalEnviOs = env.isiOS;

			env.isiOS = true;

			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const dataTransfer = new DataTransfer();
			const spy = vi.spyOn( dataTransfer, 'setDragImage' );

			const dragStartEvent = new DragEvent( 'dragstart', {
				dataTransfer
			} );

			blockToolbarButton.dispatchEvent( dragStartEvent );

			expect( spy ).toHaveBeenCalledOnce();

			const [ previewElement, offsetX, offsetY ] = spy.mock.calls[ 0 ];

			expect( previewElement.style.backgroundColor ).toBe( 'var(--ck-color-base-background)' );
			expect( previewElement.style.width ).toMatch( /^[\d.]+px$/ );
			expect( previewElement.className ).toBe( 'ck ck-content ck-clipboard-preview' );
			expect( previewElement.firstChild.tagName ).toBe( 'P' );
			expect( previewElement.firstChild.innerHTML ).toBe( 'foobar' );
			expect( offsetX ).toBe( 0 );
			expect( offsetY ).toBe( 0 );

			env.isiOS = originalEnviOs;
		} );

		it( 'should show preview without white background if not iOS', () => {
			const originalEnviOs = env.isiOS;

			env.isiOS = false;

			_setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const dataTransfer = new DataTransfer();
			const spy = vi.spyOn( dataTransfer, 'setDragImage' );

			const dragStartEvent = new DragEvent( 'dragstart', {
				dataTransfer
			} );

			blockToolbarButton.dispatchEvent( dragStartEvent );

			expect( spy ).toHaveBeenCalledOnce();

			const [ previewElement, offsetX, offsetY ] = spy.mock.calls[ 0 ];

			expect( previewElement.style.backgroundColor ).toBe( '' );
			expect( previewElement.style.width ).toMatch( /^[\d.]+px$/ );
			expect( previewElement.className ).toBe( 'ck ck-content ck-clipboard-preview' );
			expect( previewElement.firstChild.tagName ).toBe( 'P' );
			expect( previewElement.firstChild.innerHTML ).toBe( 'foobar' );
			expect( offsetX ).toBe( 0 );
			expect( offsetY ).toBe( 0 );

			env.isiOS = originalEnviOs;
		} );
	} );

	function expectDraggingMarker( targetPositionOrRange ) {
		expect( model.markers.has( 'drop-target' ) ).toBe( true );

		if ( targetPositionOrRange.is( 'position' ) ) {
			expect( model.markers.get( 'drop-target' ).getRange().isCollapsed ).toBe( true );
			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual( targetPositionOrRange ) ).toBe( true );
		} else {
			expect( model.markers.get( 'drop-target' ).getRange().isEqual( targetPositionOrRange ) ).toBe( true );
		}
	}
} );
