/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../src/tableediting';
import TableSelection from '../src/tableselection';
import { modelTable, viewTable } from './_utils/utils';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import ViewDocumentFragment from '@ckeditor/ckeditor5-engine/src/view/documentfragment';
import { stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'table selection', () => {
	let editor, model, modelRoot, tableSelection, viewDocument;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableEditing, TableSelection, Paragraph, Clipboard ]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();
		viewDocument = editor.editing.view.document;
		tableSelection = editor.plugins.get( TableSelection );

		setModelData( model, modelTable( [
			[ '11[]', '12', '13' ],
			[ '21', '22', '23' ],
			[ '31', '32', '33' ]
		] ) );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'Clipboard integration', () => {
		describe( 'copy', () => {
			it( 'should to nothing for normal selection in table', () => {
				const dataTransferMock = createDataTransfer();
				const spy = sinon.spy();

				viewDocument.on( 'clipboardOutput', spy );

				viewDocument.fire( 'copy', {
					dataTransfer: dataTransferMock,
					preventDefault: sinon.spy()
				} );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should copy selected table cells as standalone table', done => {
				const dataTransferMock = createDataTransfer();
				const preventDefaultSpy = sinon.spy();

				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 1, 2 ] ) );

				viewDocument.on( 'clipboardOutput', ( evt, data ) => {
					expect( preventDefaultSpy.calledOnce ).to.be.true;
					expect( data.method ).to.equal( 'copy' );

					expect( data.dataTransfer ).to.equal( dataTransferMock );

					expect( data.content ).is.instanceOf( ViewDocumentFragment );
					expect( stringifyView( data.content ) ).to.equal( viewTable( [
						[ '12', '13' ],
						[ '22', '23' ]
					] ) );

					done();
				} );

				viewDocument.fire( 'copy', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy
				} );
			} );

			it( 'should trim selected table to a selection rectangle (inner cell with colspan, no colspan after trim)', done => {
				setModelData( model, modelTable( [
					[ '11[]', '12', '13' ],
					[ '21', { contents: '22', colspan: 2 } ],
					[ '31', '32', '33' ]
				] ) );

				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 2, 1 ] ) );

				viewDocument.on( 'clipboardOutput', ( evt, data ) => {
					expect( stringifyView( data.content ) ).to.equal( viewTable( [
						[ '11', '12' ],
						[ '21', '22' ],
						[ '31', '32' ]
					] ) );

					done();
				} );

				viewDocument.fire( 'copy', {
					dataTransfer: createDataTransfer(),
					preventDefault: sinon.spy()
				} );
			} );

			it( 'should trim selected table to a selection rectangle (inner cell with colspan, has colspan after trim)', done => {
				setModelData( model, modelTable( [
					[ '11[]', '12', '13' ],
					[ { contents: '21', colspan: 3 } ],
					[ '31', '32', '33' ]
				] ) );

				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 2, 1 ] ) );

				viewDocument.on( 'clipboardOutput', ( evt, data ) => {
					expect( stringifyView( data.content ) ).to.equal( viewTable( [
						[ '11', '12' ],
						[ { contents: '21', colspan: 2 } ],
						[ '31', '32' ]
					] ) );

					done();
				} );

				viewDocument.fire( 'copy', {
					dataTransfer: createDataTransfer(),
					preventDefault: sinon.spy()
				} );
			} );

			it( 'should trim selected table to a selection rectangle (inner cell with rowspan, no colspan after trim)', done => {
				setModelData( model, modelTable( [
					[ '11[]', '12', '13' ],
					[ '21', { contents: '22', rowspan: 2 }, '23' ],
					[ '31', '32', '33' ]
				] ) );

				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 1, 2 ] ) );

				viewDocument.on( 'clipboardOutput', ( evt, data ) => {
					expect( stringifyView( data.content ) ).to.equal( viewTable( [
						[ '11', '12', '13' ],
						[ '21', '22', '23' ]
					] ) );

					done();
				} );

				viewDocument.fire( 'copy', {
					dataTransfer: createDataTransfer(),
					preventDefault: sinon.spy()
				} );
			} );

			it( 'should trim selected table to a selection rectangle (inner cell with rowspan, has rowspan after trim)', done => {
				setModelData( model, modelTable( [
					[ '11[]', { contents: '12', rowspan: 3 }, '13' ],
					[ '21', '23' ],
					[ '31', '33' ]
				] ) );

				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 1, 1 ] ) );

				viewDocument.on( 'clipboardOutput', ( evt, data ) => {
					expect( stringifyView( data.content ) ).to.equal( viewTable( [
						[ '11', { contents: '12', rowspan: 2 }, '13' ],
						[ '21', '23' ]
					] ) );

					done();
				} );

				viewDocument.fire( 'copy', {
					dataTransfer: createDataTransfer(),
					preventDefault: sinon.spy()
				} );
			} );

			it( 'should prepend spanned columns with empty cells (outside cell with colspan)', done => {
				setModelData( model, modelTable( [
					[ '11[]', '12', '13' ],
					[ { contents: '21', colspan: 2 }, '23' ],
					[ '31', '32', '33' ]
				] ) );

				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 2, 2 ] ) );

				viewDocument.on( 'clipboardOutput', ( evt, data ) => {
					expect( stringifyView( data.content ) ).to.equal( viewTable( [
						[ '12', '13' ],
						[ '', '23' ],
						[ '32', '33' ]
					] ) );

					done();
				} );

				viewDocument.fire( 'copy', {
					dataTransfer: createDataTransfer(),
					preventDefault: sinon.spy()
				} );
			} );

			it( 'should prepend spanned columns with empty cells (outside cell with rowspan)', done => {
				setModelData( model, modelTable( [
					[ '11[]', { contents: '12', rowspan: 2 }, '13' ],
					[ '21', '23' ],
					[ '31', '32', '33' ]
				] ) );

				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 1, 0 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 2, 2 ] ) );

				viewDocument.on( 'clipboardOutput', ( evt, data ) => {
					expect( stringifyView( data.content ) ).to.equal( viewTable( [
						[ '21', '', '23' ],
						[ '31', '32', '33' ]
					] ) );

					done();
				} );

				viewDocument.fire( 'copy', {
					dataTransfer: createDataTransfer(),
					preventDefault: sinon.spy()
				} );
			} );

			it( 'should fix selected table to a selection rectangle (hardcore case)', done => {
				// This test check how previous simple rules run together (mixed prepending and trimming).
				// In the example below a selection is set from cell "32" to "88"
				//
				//                    Input table:                                         Copied table:
				//
				//   +----+----+----+----+----+----+----+----+----+
				//   | 11 | 12 | 13 | 14 | 15      | 17 | 18 | 19 |
				//   +----+----+    +----+         +----+----+----+
				//   | 21 | 22 |    | 24 |         | 27 | 28 | 29 |
				//   +----+----+    +----+         +----+----+----+             +----+----+----+---------+----+----+
				//   | 31 | 32 |    | 34 |         | 37           |             | 32 |    | 34 |    |    | 37 |    |
				//   +----+----+    +----+         +----+----+----+             +----+----+----+----+----+----+----+
				//   | 41 | 42 |    | 44 |         | 47 | 48      |             | 42 |    | 44 |    |    | 47 | 48 |
				//   +----+----+----+----+         +----+----+----+             +----+----+----+----+----+----+----+
				//   | 51                |         | 57 | 58 | 59 |             |    |    |    |    |    | 57 | 58 |
				//   +----+----+----+----+         +----+----+----+     ==>     +----+----+----+----+----+----+----+
				//   | 61 | 62 | 63 | 64 |         | 67 | 68 | 69 |             | 62 | 63 | 64 |    |    | 67 | 68 |
				//   +----+----+----+----+----+----+    +----+----+             +----+----+----+----+----+----+----+
				//   | 71 | 72           | 75 | 76 |    | 78 | 79 |             | 72 |    |    | 75 | 76 |    | 78 |
				//   +----+----+----+----+----+----+    +----+----+             +----+----+----+----+----+----+----+
				//   | 81 | 82 | 83 | 84 | 85 | 86 |    | 88 | 89 |             | 82 | 83 | 84 | 85 | 86 |    | 88 |
				//   +----+    +----+----+----+----+    +----+----+             +----+----+----+----+----+----+----+
				//   | 91 |    | 93 | 94 | 95 | 96 |    | 98 | 99 |
				//   +----+----+----+----+----+----+----+----+----+
				//
				setModelData( model, modelTable( [
					[ '11', '12', { contents: '13', rowspan: 4 }, '14', { contents: '15', colspan: 2, rowspan: 7 }, '17', '18', '19' ],
					[ '21', '22', '24', '27', '28', '29' ],
					[ '31', '32', '34', { contents: '37', colspan: 3 } ],
					[ '41', '42', '44', '47', { contents: '48', colspan: 2 } ],
					[ { contents: '51', colspan: 4 }, '57', '58', '59' ],
					[ '61', '62', '63', '64', { contents: '67', rowspan: 4 }, '68', '69' ],
					[ '71', { contents: '72', colspan: 3 }, '78', '79' ],
					[ '81', { contents: '82', rowspan: 2 }, '83', '84', '85', '86', '88', '89' ],
					[ '91', '93', '94', '95', '96', '98', '99' ]
				] ) );

				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 2, 1 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 7, 6 ] ) );

				viewDocument.on( 'clipboardOutput', ( evt, data ) => {
					expect( stringifyView( data.content ) ).to.equal( viewTable( [
						[ '32', '', '34', '', '', { contents: '37', colspan: 2 } ],
						[ '42', '', '44', '', '', '47', '48' ],
						[ '', '', '', '', '', '57', '58' ],
						[ '62', '63', '64', '', '', { contents: '67', rowspan: 3 }, '68' ],
						[ { contents: '72', colspan: 3 }, '', '', '', '78' ],
						[ '82', '83', '84', '85', '86', '88' ]
					] ) );

					done();
				} );

				viewDocument.fire( 'copy', {
					dataTransfer: createDataTransfer(),
					preventDefault: sinon.spy()
				} );
			} );
		} );

		describe( 'cut', () => {
			it( 'is disabled for multi-range selection over a table', () => {
				const dataTransferMock = createDataTransfer();
				const preventDefaultSpy = sinon.spy();
				const spy = sinon.spy();

				viewDocument.on( 'clipboardOutput', spy );

				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 1, 2 ] ) );

				viewDocument.fire( 'cut', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy
				} );

				sinon.assert.notCalled( spy );
				sinon.assert.calledOnce( preventDefaultSpy );
			} );

			it( 'is not disabled normal selection over a table', () => {
				const dataTransferMock = createDataTransfer();
				const spy = sinon.spy();

				viewDocument.on( 'clipboardOutput', spy );

				viewDocument.fire( 'cut', {
					dataTransfer: dataTransferMock,
					preventDefault: sinon.spy()
				} );

				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

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
