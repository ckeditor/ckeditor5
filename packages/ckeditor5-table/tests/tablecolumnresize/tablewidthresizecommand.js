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
		setModelData( model, modelTable( [
			[ '11', '12' ],
			[ '21', '22' ]
		] ) );

		command.execute( { tableWidth: '40%' } );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<table tableWidth="40%">' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>11</paragraph>' +
					'</tableCell>' +
					'<tableCell>' +
						'<paragraph>12</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>21</paragraph>' +
					'</tableCell>' +
					'<tableCell>' +
						'<paragraph>22</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );

	it( 'should remove the attribute if new value was not passed', () => {
		setModelData( model, modelTable( [
			[ '11', '12' ],
			[ '21', '22' ]
		], { tableWidth: '40%' } ) );

		command.execute();

		expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>11</paragraph>' +
					'</tableCell>' +
					'<tableCell>' +
						'<paragraph>12</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>21</paragraph>' +
					'</tableCell>' +
					'<tableCell>' +
						'<paragraph>22</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );
} );
