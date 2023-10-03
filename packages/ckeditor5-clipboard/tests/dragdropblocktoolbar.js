/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, DragEvent, DataTransfer */

import DragDropTarget from '../src/dragdroptarget';
import DragDrop from '../src/dragdrop';
import PastePlainText from '../src/pasteplaintext';
import DragDropBlockToolbar from '../src/dragdropblocktoolbar';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Table from '@ckeditor/ckeditor5-table/src/table';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import BlockToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import { Image, ImageCaption } from '@ckeditor/ckeditor5-image';
import env from '@ckeditor/ckeditor5-utils/src/env';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'Drag and Drop Block Toolbar', () => {
	let editorElement, editor, model, view, viewDocument, root, mapper, domConverter, dragDropBlockToolbar,
		blockToolbar, blockToolbarButton;

	testUtils.createSinonSandbox();

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

	describe( 'init', () => {
		it( 'should toggle read only mode', () => {
			expect( dragDropBlockToolbar.isEnabled ).to.be.true;

			editor.enableReadOnlyMode( 'test' );

			expect( dragDropBlockToolbar.isEnabled ).to.be.false;

			editor.disableReadOnlyMode( 'test' );

			expect( dragDropBlockToolbar.isEnabled ).to.be.true;
		} );

		it( 'should be disabled on android', async () => {
			env.isAndroid = true;

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ DragDrop, DragDropBlockToolbar ]
			} );

			expect( editor.plugins.get( DragDropBlockToolbar ).isEnabled ).to.be.false;

			await editor.destroy();

			env.isAndroid = false;
		} );

		it( 'should display block toolbar button', () => {
			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			expect( blockToolbarButton ).not.to.be.null;
			expect( blockToolbarButton.className.includes( 'ck-hidden' ) ).to.be.false;
		} );
	} );

	describe( 'dragging', () => {
		it( 'should set selection on drag block toolbar button', () => {
			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			sinon.spy( editor.editing.view, 'focus' );

			const dragEvent = new DragEvent( 'dragstart' );

			viewDocument.on( 'dragstart', ( evt, data ) => {
				expect( data.domEvent ).to.equal( dragEvent );
				evt.stop();
			}, 'highest' );

			blockToolbarButton.dispatchEvent( dragEvent );

			const modelSelection = model.document.selection;
			const { focus, anchor } = modelSelection;

			expect( focus.path ).to.deep.equal( [ 0, 6 ] );
			expect( anchor.path ).to.deep.equal( [ 0, 0 ] );
			expect( dragDropBlockToolbar._isBlockDragging ).to.be.true;
			expect( editor.editing.view.focus.calledOnce ).to.be.true;
		} );

		it( 'should not set selection if plugin is disabled', () => {
			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			editor.enableReadOnlyMode( 'test' );

			const dragEvent = new DragEvent( 'dragstart' );

			blockToolbarButton.dispatchEvent( dragEvent );

			const modelSelection = model.document.selection;
			const { focus, anchor } = modelSelection;

			expect( focus.path ).to.deep.equal( [ 0, 3 ] );
			expect( anchor.path ).to.deep.equal( [ 0, 0 ] );
		} );

		it( 'should display dragging marker', () => {
			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

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
			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

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
			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

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

			expect( model.markers.has( 'drop-target' ) ).to.be.false;
		} );

		it( 'should not display dragging marker', () => {
			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

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

			expect( model.markers.has( 'drop-target' ) ).to.be.false;
		} );

		it( 'should drop element', () => {
			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const modelParagraph = root.getNodeByPath( [ 0 ] );
			const viewParagraph = mapper.toViewElement( modelParagraph );
			const domNode = domConverter.mapViewToDom( viewParagraph );
			const spyClipboardInput = sinon.spy();

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

			expect( spyClipboardInput.called ).to.be.true;
			expect( spyClipboardInput.firstCall.firstArg.method ).to.equal( 'drop' );
		} );

		it( 'should end drag and drop', () => {
			setModelData( model, '<paragraph>[foo]bar</paragraph>' );

			const modelParagraph = root.getNodeByPath( [ 0 ] );
			const viewParagraph = mapper.toViewElement( modelParagraph );
			const domNode = domConverter.mapViewToDom( viewParagraph );
			const spyClipboardInput = sinon.spy();

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

			expect( dragDropBlockToolbar._isBlockDragging ).to.be.false;
		} );
	} );

	function expectDraggingMarker( targetPositionOrRange ) {
		expect( model.markers.has( 'drop-target' ) ).to.be.true;

		if ( targetPositionOrRange.is( 'position' ) ) {
			expect( model.markers.get( 'drop-target' ).getRange().isCollapsed ).to.be.true;
			expect( model.markers.get( 'drop-target' ).getRange().start.isEqual( targetPositionOrRange ) ).to.be.true;
		} else {
			expect( model.markers.get( 'drop-target' ).getRange().isEqual( targetPositionOrRange ) ).to.be.true;
		}
	}
} );
