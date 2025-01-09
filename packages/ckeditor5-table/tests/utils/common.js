/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { setData as setModelData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import TableEditing from '../../src/tableediting.js';
import { modelTable } from '../_utils/utils.js';

import { getSelectionAffectedTable, isHeadingColumnCell } from '../../src/utils/common.js';
import Selection from '@ckeditor/ckeditor5-engine/src/model/selection.js';

describe( 'table utils', () => {
	let editor, model, modelRoot, tableUtils;
	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ Paragraph, TableEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				modelRoot = model.document.getRoot();
				tableUtils = editor.plugins.get( 'TableUtils' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'common', () => {
		describe( 'isHeadingColumnCell()', () => {
			it( 'should return "true" for a heading column cell', () => {
				setData( model, modelTable( [
					[ '00', '01', '02', '03' ]
				], { headingColumns: 2 } ) );

				const tableCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );

				expect( isHeadingColumnCell( tableUtils, tableCell ) ).to.be.true;
			} );

			it( 'should return "true" for a heading column cell with colspan', () => {
				setData( model, modelTable( [
					[ { colspan: 2, contents: '00' }, '01', '02', '03' ]
				], { headingColumns: 2 } ) );

				const tableCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );

				expect( isHeadingColumnCell( tableUtils, tableCell ) ).to.be.true;
			} );

			it( 'should return "false" for a regular column cell', () => {
				setData( model, modelTable( [
					[ '00', '01', '02', '03' ]
				], { headingColumns: 2 } ) );

				const tableCell = modelRoot.getNodeByPath( [ 0, 0, 2 ] );

				expect( isHeadingColumnCell( tableUtils, tableCell ) ).to.be.false;
			} );

			it( 'should return "false" for a regular column cell with colspan', () => {
				setData( model, modelTable( [
					[ '00', { colspan: 2, contents: '01' }, '02', '03' ]
				], { headingColumns: 1 } ) );

				const tableCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );

				expect( isHeadingColumnCell( tableUtils, tableCell ) ).to.be.false;
			} );
		} );

		describe( 'getSelectionAffectedTable', () => {
			it( 'should return null if table is not present', () => {
				setModelData( model, '<paragraph>Foo[]</paragraph>' );
				const selection = new Selection( model.createPositionFromPath( modelRoot, [ 0 ] ) );

				const tableElement = getSelectionAffectedTable( selection );

				expect( tableElement ).to.be.null;
			} );

			it( 'should return table if present higher in the model tree', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] ) );

				const selection = new Selection( model.createPositionFromPath( modelRoot, [ 0, 0, 0 ] ) );
				const tableElement = getSelectionAffectedTable( selection );

				expect( tableElement ).to.equal( modelRoot.getNodeByPath( [ 0 ] ) );
			} );

			it( 'should return table if selected', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] ) );

				const selection = new Selection( model.createRangeOn( modelRoot.getChild( 0 ) ) );
				const tableElement = getSelectionAffectedTable( selection );

				expect( tableElement ).to.equal( modelRoot.getNodeByPath( [ 0 ] ) );
			} );

			it( 'should return selected table if selected inside other table', () => {
				const innerTable = modelTable( [
					[ 'a', 'b' ],
					[ 'c', 'd' ]
				] );
				setModelData( model, modelTable( [
					[ innerTable, '01' ],
					[ '10', '11' ]
				] ) );

				const selection = new Selection( model.createRangeOn( modelRoot.getNodeByPath( [ 0, 0, 0, 0 ] ) ) );
				const tableElement = getSelectionAffectedTable( selection );

				expect( tableElement ).to.equal( modelRoot.getNodeByPath( [ 0, 0, 0, 0 ] ) );
			} );
		} );
	} );
} );
