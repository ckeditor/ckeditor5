/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';

import TableEditing from '../src/tableediting';
import { formatModelTable, formattedModelTable, modelTable } from './_utils/utils';

describe( 'TableEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should set proper schema rules', () => {
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should create tbody section', () => {
				setModelData( model, '<table><tableRow><tableCell>foo[]</tableCell></tableRow></table>' );

				expect( editor.getData() ).to.equal( '<table><tbody><tr><td>foo</td></tr></tbody></table>' );
			} );

			it( 'should create thead section', () => {
				setModelData( model, '<table headingRows="1"><tableRow><tableCell>foo[]</tableCell></tableRow></table>' );

				expect( editor.getData() ).to.equal( '<table><thead><tr><th>foo</th></tr></thead></table>' );
			} );

			it( 'should create thead and tbody sections in proper order', () => {
				setModelData( model, '<table headingRows="1">' +
					'<tableRow><tableCell>foo</tableCell></tableRow>' +
					'<tableRow><tableCell>bar</tableCell></tableRow>' +
					'<tableRow><tableCell>baz[]</tableCell></tableRow>' +
					'</table>'
				);

				expect( editor.getData() ).to.equal( '<table>' +
					'<thead><tr><th>foo</th></tr></thead>' +
					'<tbody><tr><td>bar</td></tr><tr><td>baz</td></tr></tbody>' +
					'</table>'
				);
			} );

			it( 'should convert rowspan on tableCell', () => {
				setModelData( model, '<table><tableRow><tableCell rowspan="2">foo[]</tableCell></tableRow></table>' );

				expect( editor.getData() ).to.equal( '<table><tbody><tr><td rowspan="2">foo</td></tr></tbody></table>' );
			} );

			it( 'should convert colspan on tableCell', () => {
				setModelData( model, '<table><tableRow><tableCell colspan="2">foo[]</tableCell></tableRow></table>' );

				expect( editor.getData() ).to.equal( '<table><tbody><tr><td colspan="2">foo</td></tr></tbody></table>' );
			} );
		} );

		describe( 'view to model', () => {
			it( 'should convert table', () => {
				editor.setData( '<table><tbody><tr><td>foo</td></tr></tbody></table>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<table><tableRow><tableCell>foo</tableCell></tableRow></table>' );
			} );
		} );
	} );

	describe( 'caret movement', () => {
		let domEvtDataStub;

		beforeEach( () => {
			domEvtDataStub = {
				keyCode: getCode( 'Tab' ),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
		} );

		it( 'should do nothing if not tab pressed', () => {
			setModelData( model, modelTable( [
				[ '11', '12[]' ]
			] ) );

			domEvtDataStub.keyCode = getCode( 'a' );

			editor.editing.view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.notCalled( domEvtDataStub.preventDefault );
			sinon.assert.notCalled( domEvtDataStub.stopPropagation );
			expect( formatModelTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ '11', '12[]' ]
			] ) );
		} );

		it( 'should do nothing if Ctrl+Tab is pressed', () => {
			setModelData( model, modelTable( [
				[ '11', '12[]' ]
			] ) );

			domEvtDataStub.ctrlKey = true;

			editor.editing.view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.notCalled( domEvtDataStub.preventDefault );
			sinon.assert.notCalled( domEvtDataStub.stopPropagation );
			expect( formatModelTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ '11', '12[]' ]
			] ) );
		} );

		describe( 'on TAB', () => {
			it( 'should do nothing if selection is not in a table', () => {
				setModelData( model, '[]' + modelTable( [
					[ '11', '12' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.notCalled( domEvtDataStub.preventDefault );
				sinon.assert.notCalled( domEvtDataStub.stopPropagation );
				expect( formatModelTable( getModelData( model ) ) ).to.equal( '[]' + formattedModelTable( [
					[ '11', '12' ]
				] ) );
			} );

			it( 'should move to next cell', () => {
				setModelData( model, modelTable( [
					[ '11[]', '12' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
				expect( formatModelTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '[12]' ]
				] ) );
			} );

			it( 'should create another row and move to first cell in new row', () => {
				setModelData( model, modelTable( [
					[ '11', '[12]' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( formatModelTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '12' ],
					[ '[]', '' ]
				] ) );
			} );

			it( 'should move to the first cell of next row if on end of a row', () => {
				setModelData( model, modelTable( [
					[ '11', '12[]' ],
					[ '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( formatModelTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '12' ],
					[ '[21]', '22' ]
				] ) );
			} );

			describe( 'on table widget selected', () => {
				it( 'should move caret to the first table cell on TAB', () => {
					const spy = sinon.spy();

					editor.editing.view.document.on( 'keydown', spy );

					setModelData( model, '[' + modelTable( [
						[ '11', '12' ]
					] ) + ']' );

					editor.editing.view.document.fire( 'keydown', domEvtDataStub );

					sinon.assert.calledOnce( domEvtDataStub.preventDefault );
					sinon.assert.calledOnce( domEvtDataStub.stopPropagation );

					expect( formatModelTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
						[ '[11]', '12' ]
					] ) );

					// Should cancel event - so no other tab handler is called.
					sinon.assert.notCalled( spy );
				} );

				it( 'shouldn\' do anything on other blocks', () => {
					const spy = sinon.spy();

					editor.editing.view.document.on( 'keydown', spy );

					setModelData( model, '[<paragraph>foo</paragraph>]' );

					editor.editing.view.document.fire( 'keydown', domEvtDataStub );

					sinon.assert.notCalled( domEvtDataStub.preventDefault );
					sinon.assert.notCalled( domEvtDataStub.stopPropagation );

					expect( formatModelTable( getModelData( model ) ) ).to.equal( '[<paragraph>foo</paragraph>]' );

					// Should not cancel event.
					sinon.assert.calledOnce( spy );
				} );
			} );
		} );

		describe( 'on SHIFT+TAB', () => {
			beforeEach( () => {
				domEvtDataStub.shiftKey = true;
			} );

			it( 'should do nothing if selection is not in a table', () => {
				setModelData( model, '[]' + modelTable( [
					[ '11', '12' ]
				] ) );

				domEvtDataStub.keyCode = getCode( 'Tab' );
				domEvtDataStub.shiftKey = true;

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.notCalled( domEvtDataStub.preventDefault );
				sinon.assert.notCalled( domEvtDataStub.stopPropagation );
				expect( formatModelTable( getModelData( model ) ) ).to.equal( '[]' + formattedModelTable( [
					[ '11', '12' ]
				] ) );
			} );

			it( 'should move to previous cell', () => {
				setModelData( model, modelTable( [
					[ '11', '12[]' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
				expect( formatModelTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
					[ '[11]', '12' ]
				] ) );
			} );

			it( 'should not move if caret is in first table cell', () => {
				setModelData( model, '<paragraph>foo</paragraph>' + modelTable( [
					[ '[]11', '12' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( formatModelTable( getModelData( model ) ) ).to.equal(
					'<paragraph>foo</paragraph>' + formattedModelTable( [ [ '[]11', '12' ] ] )
				);
			} );

			it( 'should move to the last cell of previous row if on beginning of a row', () => {
				setModelData( model, modelTable( [
					[ '11', '12' ],
					[ '[]21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( formatModelTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '[12]' ],
					[ '21', '22' ]
				] ) );
			} );
		} );
	} );
} );
