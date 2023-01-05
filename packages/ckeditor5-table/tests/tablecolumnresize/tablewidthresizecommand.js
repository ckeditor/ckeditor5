/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import TableWidthResizeCommand from '../../src/tablecolumnresize/tablewidthresizecommand';
import TableColumnResizeEditing from '../../src/tablecolumnresize/tablecolumnresizeediting';
import TableColumnResize from '../../src/tablecolumnresize';
import Table from '../../src/table';
import { modelTable } from '../_utils/utils';

describe( 'TableWidthResizeCommand', () => {
	let model, editor, editorElement, command;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			plugins: [ Table, TableColumnResize, TableColumnResizeEditing, Paragraph ]
		} ).then( newEditor => {
			editor = newEditor;
			model = editor.model;
			command = new TableWidthResizeCommand( editor );
		} );
	} );

	afterEach( async () => {
		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor ) {
			await editor.destroy();
		}
	} );

	it( 'should work on the currently selected table if it was not passed to execute()', () => {
		const data = [ [ '11', '12' ], [ '21', '22' ] ];
		const attributesBefore = {};
		setModelData( model, modelTable( data, attributesBefore ) );

		command.execute( { tableWidth: '40%' } );

		const attributesAfter = { tableWidth: '40%' };
		expect( getModelData( model, { withoutSelection: true } ) ).to.equal( modelTable( data, attributesAfter ) );
	} );

	it( 'should remove the attributes if new value was not passed', () => {
		const data = [ [ '11', '12' ], [ '21', '22' ] ];
		const attributesBefore = { tableWidth: '40%', columnWidths: '40%,60%' };
		setModelData( model, modelTable( data, attributesBefore ) );

		command.execute();

		const attributesAfter = {};
		expect( getModelData( model, { withoutSelection: true } ) ).to.equal( modelTable( data, attributesAfter ) );
	} );

	it( 'should work when only columnWidths is provided', () => {
		const data = [ [ '11', '12' ], [ '21', '22' ] ];
		const attributesBefore = { tableWidth: '40%', columnWidths: '40%,60%' };
		setModelData( model, modelTable( data, attributesBefore ) );

		command.execute( { columnWidths: '40%,60%' } );

		const attributesAfter = { columnWidths: '40%,60%' };
		expect( getModelData( model, { withoutSelection: true } ) ).to.equal( modelTable( data, attributesAfter ) );
	} );

	it( 'should work when only tableWidth is provided', () => {
		const data = [ [ '11', '12' ], [ '21', '22' ] ];
		const attributesBefore = { tableWidth: '40%', columnWidths: '40%,60%' };
		setModelData( model, modelTable( data, attributesBefore ) );

		command.execute( { tableWidth: '40%' } );

		const attributesAfter = { tableWidth: '40%' };
		expect( getModelData( model, { withoutSelection: true } ) ).to.equal( modelTable( data, attributesAfter ) );
	} );

	it( 'should add attributes when they are provided, but were not present before', () => {
		const data = [ [ '11', '12' ], [ '21', '22' ] ];
		const attributesBefore = {};
		setModelData( model, modelTable( data, attributesBefore ) );

		command.execute( { tableWidth: '40%', columnWidths: '40%,60%' } );

		const attributesAfter = { tableWidth: '40%', columnWidths: '40%,60%' };
		expect( getModelData( model, { withoutSelection: true } ) ).to.equal( modelTable( data, attributesAfter ) );
	} );

	it( 'should change attributes when they were present before', () => {
		const data = [ [ '11', '12' ], [ '21', '22' ] ];
		const attributesBefore = { tableWidth: '40%', columnWidths: '40%,60%' };
		setModelData( model, modelTable( data, attributesBefore ) );

		command.execute( { tableWidth: '30%', columnWidths: '30%,70%' } );

		const attributesAfter = { tableWidth: '30%', columnWidths: '30%,70%' };
		expect( getModelData( model, { withoutSelection: true } ) ).to.equal( modelTable( data, attributesAfter ) );
	} );
} );
