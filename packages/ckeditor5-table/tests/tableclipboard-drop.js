/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting.js';
import ImageCaptionEditing from '@ckeditor/ckeditor5-image/src/imagecaption/imagecaptionediting.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { modelTable, viewTable } from './_utils/utils.js';

import TableEditing from '../src/tableediting.js';
import TableClipboard from '../src/tableclipboard.js';

describe( 'table clipboard', () => {
	let editor, model, modelRoot, viewDocument, element;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ TableEditing, TableClipboard, Paragraph, Clipboard ]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();
		viewDocument = editor.editing.view.document;

		setModelData( model, modelTable( [
			[ '00[]', '01', '02' ],
			[ '10', '11', '12' ],
			[ '20', '21', '22' ]
		] ) );
	} );

	afterEach( async () => {
		await editor.destroy();

		element.remove();
	} );

	describe( 'Clipboard integration - drop', () => {
		it( 'should embed a table when it is dropped inside another table cell', () => {
			const dataTransferMock = createDataTransfer();

			// Set up a table to be dragged.
			dataTransferMock.setData( 'text/html', viewTable( [
				[ 'aa', 'ab' ],
				[ 'ba', 'bb' ]
			] ) );

			// Position the selection in a cell.
			const targetCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );
			model.change( writer => {
				writer.setSelection( model.createRangeIn( targetCell ) );
			} );

			// Get corresponding view and DOM elements for proper event creation.
			const viewElement = editor.editing.mapper.toViewElement( targetCell );
			const domNode = editor.editing.view.domConverter.mapViewToDom( viewElement );

			// Trigger drop event with properly mocked data.
			viewDocument.fire( 'drop', {
				dataTransfer: dataTransferMock,
				target: viewElement,
				domTarget: domNode,
				preventDefault: () => {},
				stopPropagation: () => {},
				domEvent: getMockedMousePosition( domNode, 'before' )
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
				[ '00', '01', '02' ],
				[ '10', modelTable( [ [ 'aa', 'ab' ], [ 'ba', 'bb' ] ] ) + '<paragraph>11</paragraph>', '12' ],
				[ '20', '21', '22' ]
			] ) );
		} );

		it( 'should handle nested tables when dropped inside another table cell', () => {
			const dataTransferMock = createDataTransfer();

			// Set up a nested table to be dragged.
			dataTransferMock.setData( 'text/html', viewTable( [
				[ 'aa', 'ab' ],
				[ 'ba', viewTable( [ [ 'xx', 'xy' ], [ 'yx', 'yy' ] ] ) ]
			] ) );

			// Position the selection in a cell.
			const targetCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );
			model.change( writer => {
				writer.setSelection( model.createRangeIn( targetCell ) );
			} );

			const viewElement = editor.editing.mapper.toViewElement( targetCell );
			const domNode = editor.editing.view.domConverter.mapViewToDom( viewElement );

			// Trigger drop event with properly mocked data.
			viewDocument.fire( 'drop', {
				dataTransfer: dataTransferMock,
				target: viewElement,
				domTarget: domNode,
				preventDefault: () => {},
				stopPropagation: () => {},
				domEvent: getMockedMousePosition( domNode, 'before' )
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
				[ '00', '01', '02' ],
				[
					'10',
					modelTable( [
						[ 'aa', 'ab' ],
						[ 'ba', modelTable( [ [ 'xx', 'xy' ], [ 'yx', 'yy' ] ] ) ]
					] ) + '<paragraph>11</paragraph>',
					'12'
				],
				[ '20', '21', '22' ]
			] ) );
		} );

		it( 'should embed a table when it is dropped between paragraphs inside a table cell', async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( element, {
				plugins: [ TableEditing, TableClipboard, Paragraph, Clipboard ]
			} );

			model = editor.model;
			modelRoot = model.document.getRoot();
			viewDocument = editor.editing.view.document;

			// Position the selection between paragraphs in a cell by using [].
			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '<paragraph>Foo</paragraph>[]<paragraph>Bar</paragraph>', '11', '12' ],
				[ '20', '21', '22' ]
			] ) );

			const dataTransferMock = createDataTransfer();

			// Set up a table to be dragged.
			dataTransferMock.setData( 'text/html', viewTable( [
				[ 'aa', 'ab' ],
				[ 'ba', 'bb' ]
			] ) );

			// Get the cell element and its paragraphs by path.
			const cell = modelRoot.getNodeByPath( [ 0, 1, 0 ] );
			const firstParagraph = cell.getChild( 0 );

			// Get the position between paragraphs.
			const position = model.createPositionAfter( firstParagraph );

			// Get corresponding view position and elements.
			const viewPosition = editor.editing.mapper.toViewPosition( position );
			const viewRange = editor.editing.view.createRange( viewPosition );

			// Get the parent element for the view position (should be the cell).
			const viewElement = editor.editing.mapper.toViewElement( firstParagraph );

			// Get the DOM node for the cell.
			const firstParagraphDomNode = editor.editing.view.domConverter.mapViewToDom( viewElement );

			// Trigger drop event.
			viewDocument.fire( 'drop', {
				dataTransfer: dataTransferMock,
				target: viewElement,
				domTarget: firstParagraphDomNode,
				targetRanges: [ viewRange ],
				preventDefault: () => {},
				stopPropagation: () => {},
				domEvent: getMockedMousePosition( firstParagraphDomNode, 'after' )
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
				[ '00', '01', '02' ],
				[
					'<paragraph>Foo</paragraph>' +
						modelTable( [ [ 'aa', 'ab' ], [ 'ba', 'bb' ] ] ) +
						'<paragraph>Bar</paragraph>',
					'11', '12'
				],
				[ '20', '21', '22' ]
			] ) );
		} );

		it( 'should embed a table when it is dropped before to an image inside a table cell', async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( element, {
				plugins: [ TableEditing, TableClipboard, Paragraph, Clipboard, ImageBlockEditing, ImageCaptionEditing ]
			} );

			model = editor.model;
			modelRoot = model.document.getRoot();
			viewDocument = editor.editing.view.document;

			// Position the selection after the image by using [].
			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '[]<imageBlock src="/assets/sample.png"><caption>Caption</caption></imageBlock>', '11', '12' ]
			] ) );

			const dataTransferMock = createDataTransfer();

			// Set up a table to be dragged.
			dataTransferMock.setData( 'text/html', viewTable( [
				[ 'aa', 'ab' ],
				[ 'ba', 'bb' ]
			] ) );

			// Get the position at the selection.
			const selection = model.document.selection;
			const position = selection.getFirstPosition();

			// Get corresponding view elements.
			const viewPosition = editor.editing.mapper.toViewPosition( position );
			const viewRange = editor.editing.view.createRange( viewPosition );
			const viewElement = viewPosition.parent;
			const domNode = editor.editing.view.domConverter.mapViewToDom( viewElement );

			// Trigger drop event.
			viewDocument.fire( 'drop', {
				dataTransfer: dataTransferMock,
				target: viewElement,
				domTarget: domNode,
				targetRanges: [ viewRange ],
				preventDefault: () => {},
				stopPropagation: () => {},
				domEvent: getMockedMousePosition( domNode, 'before' )
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
				[ '00', '01', '02' ],
				[
					modelTable( [ [ 'aa', 'ab' ], [ 'ba', 'bb' ] ] ) +
						'<imageBlock src="/assets/sample.png"><caption>Caption</caption></imageBlock>',
					'11', '12'
				]
			] ) );
		} );

		it( 'should embed a table when it is dropped after an image inside a table cell', async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( element, {
				plugins: [ TableEditing, TableClipboard, Paragraph, Clipboard, ImageBlockEditing, ImageCaptionEditing ]
			} );

			model = editor.model;
			modelRoot = model.document.getRoot();
			viewDocument = editor.editing.view.document;

			// Position the image in a cell and place selection after it (using []).
			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '<imageBlock src="/assets/sample.png"><caption>Caption</caption></imageBlock>[]', '11', '12' ]
			] ) );

			const dataTransferMock = createDataTransfer();

			// Set up a table to be dragged.
			dataTransferMock.setData( 'text/html', viewTable( [
				[ 'aa', 'ab' ],
				[ 'ba', 'bb' ]
			] ) );

			// Get the cell element and its paragraphs by path.
			const cell = modelRoot.getNodeByPath( [ 0, 1, 0 ] );
			const firstParagraph = cell.getChild( 0 );

			// Get the position between paragraphs.
			const position = model.createPositionAfter( firstParagraph );

			// Get corresponding view position and elements.
			const viewPosition = editor.editing.mapper.toViewPosition( position );
			const viewRange = editor.editing.view.createRange( viewPosition );

			// Get the parent element for the view position (should be the cell).
			const viewElement = editor.editing.mapper.toViewElement( firstParagraph );

			// Get the DOM node for the cell.
			const firstParagraphDomNode = editor.editing.view.domConverter.mapViewToDom( viewElement );

			// Trigger drop event.
			viewDocument.fire( 'drop', {
				dataTransfer: dataTransferMock,
				target: viewElement,
				domTarget: firstParagraphDomNode,
				targetRanges: [ viewRange ],
				preventDefault: () => {},
				stopPropagation: () => {},
				domEvent: getMockedMousePosition( firstParagraphDomNode, 'after' )
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
				[ '00', '01', '02' ],
				[
					'<imageBlock src="/assets/sample.png"><caption>Caption</caption></imageBlock>' +
						modelTable( [ [ 'aa', 'ab' ], [ 'ba', 'bb' ] ] ),
					'11', '12'
				]
			] ) );
		} );

		it( 'should insert a table when it is dropped directly into the editor content', async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( element, {
				plugins: [ TableEditing, TableClipboard, Paragraph, Clipboard ]
			} );

			model = editor.model;
			modelRoot = model.document.getRoot();
			viewDocument = editor.editing.view.document;

			// Set up a simple document with just a paragraph,
			setModelData( model, '<paragraph>Some text[]</paragraph>' );

			const dataTransferMock = createDataTransfer();

			// Set up a table to be dragged
			dataTransferMock.setData( 'text/html', viewTable( [
				[ 'aa', 'ab' ],
				[ 'ba', 'bb' ]
			] ) );

			// Get the paragraph element,
			const paragraph = modelRoot.getChild( 0 );

			// Get corresponding view and DOM elements,
			const viewElement = editor.editing.mapper.toViewElement( paragraph );
			const domNode = editor.editing.view.domConverter.mapViewToDom( viewElement );

			// Get the position at the selection,
			const selection = model.document.selection;
			const position = selection.getFirstPosition();
			const viewPosition = editor.editing.mapper.toViewPosition( position );
			const viewRange = editor.editing.view.createRange( viewPosition );

			// Trigger drop event,
			viewDocument.fire( 'drop', {
				dataTransfer: dataTransferMock,
				target: viewElement,
				domTarget: domNode,
				targetRanges: [ viewRange ],
				preventDefault: () => {},
				stopPropagation: () => {},
				domEvent: getMockedMousePosition( domNode, 'after' )
			} );

			// Expect the table to be inserted at the position where it was dropped,
			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>Some text</paragraph>' +
				modelTable( [
					[ 'aa', 'ab' ],
					[ 'ba', 'bb' ]
				] )
			);
		} );
	} );

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

	function createDataTransfer() {
		const store = new Map();

		return {
			setData( type, data ) {
				store.set( type, data );
			},

			getData( type ) {
				return store.get( type );
			}
		};
	}
} );
