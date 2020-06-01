/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import TableUtils from '../../src/tableutils';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { defaultConversion, defaultSchema, modelTable } from '../_utils/utils';
import { findAncestor, isHeadingColumnCell } from '../../src/utils/common';

describe( 'table utils', () => {
	let editor, model, modelRoot, tableUtils;
	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ TableUtils ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				modelRoot = model.document.getRoot();
				tableUtils = editor.plugins.get( TableUtils );

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'common', () => {
		describe( 'findAncestor()', () => {
			it( 'should return undefined if not in table', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );

				expect( findAncestor( 'table', model.document.selection.focus ) ).to.be.undefined;
			} );

			it( 'should return table if position is in tableCell', () => {
				setData( model, modelTable( [ [ '[]' ] ] ) );

				const parentTable = findAncestor( 'table', model.document.selection.focus );

				expect( parentTable ).to.not.be.undefined;
				expect( parentTable.is( 'table' ) ).to.be.true;
			} );
		} );

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
	} );
} );
