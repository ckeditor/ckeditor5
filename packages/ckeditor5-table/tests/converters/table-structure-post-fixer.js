/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';
import { modelTable } from '../_utils/utils.js';
import { TableEditing } from '../../src/tableediting.js';

describe( 'Table structure post-fixer', () => {
	let editor, model;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableEditing, Paragraph ]
		} );

		model = editor.model;
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should not change anything if headingRows and footerRows do not overlap', () => {
		_setModelData( model, modelTable( [
			[ 'foo' ],
			[ 'bar' ],
			[ 'baz' ]
		], { headingRows: 1, footerRows: 1 } ) );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
			[ 'foo' ],
			[ 'bar' ],
			[ 'baz' ]
		], { headingRows: 1, footerRows: 1 } ) );
	} );

	it( 'should not change anything if headingRows and footerRows sum up to total rows', () => {
		_setModelData( model, modelTable( [
			[ 'foo' ],
			[ 'bar' ],
			[ 'baz' ]
		], { headingRows: 1, footerRows: 2 } ) );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
			[ 'foo' ],
			[ 'bar' ],
			[ 'baz' ]
		], { headingRows: 1, footerRows: 2 } ) );
	} );

	it( 'should reduce footerRows if headingRows and footerRows overlap', () => {
		_setModelData( model, modelTable( [
			[ 'foo' ],
			[ 'bar' ],
			[ 'baz' ]
		], { headingRows: 2 } ) );

		model.change( writer => {
			const table = model.document.getRoot().getChild( 0 );
			writer.setAttribute( 'footerRows', 2, table );
		} );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
			[ 'foo' ],
			[ 'bar' ],
			[ 'baz' ]
		], { headingRows: 2, footerRows: 1 } ) );
	} );

	it( 'should set footerRows to 0 if headingRows take all rows', () => {
		_setModelData( model, modelTable( [
			[ 'foo' ],
			[ 'bar' ],
			[ 'baz' ]
		], { headingRows: 3 } ) );

		model.change( writer => {
			const table = model.document.getRoot().getChild( 0 );
			writer.setAttribute( 'footerRows', 2, table );
		} );

		// footerRows is removed because it is 0 and 0 is the default value.
		expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
			[ 'foo' ],
			[ 'bar' ],
			[ 'baz' ]
		], { headingRows: 3 } ) );
	} );

	it( 'should reduce footerRows when headingRows is increased', () => {
		_setModelData( model, modelTable( [
			[ 'foo' ],
			[ 'bar' ],
			[ 'baz' ]
		], { headingRows: 1, footerRows: 1 } ) );

		model.change( writer => {
			const table = model.document.getRoot().getChild( 0 );
			writer.setAttribute( 'headingRows', 3, table );
		} );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
			[ 'foo' ],
			[ 'bar' ],
			[ 'baz' ]
		], { headingRows: 3 } ) );
	} );

	it( 'should reduce footerRows when rows are removed', () => {
		_setModelData( model, modelTable( [
			[ 'foo' ],
			[ 'bar' ],
			[ 'baz' ]
		], { headingRows: 1, footerRows: 2 } ) );

		model.change( writer => {
			const table = model.document.getRoot().getChild( 0 );
			writer.remove( table.getChild( 1 ) ); // Remove the middle row
		} );

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
			[ 'foo' ],
			[ 'baz' ]
		], { headingRows: 1, footerRows: 1 } ) );
	} );
} );
