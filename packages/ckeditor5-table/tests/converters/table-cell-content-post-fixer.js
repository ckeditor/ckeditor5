/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../../src/tableediting';
import { formatTable } from './../_utils/utils';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';

describe( 'Table cell content post-fixer', () => {
	let editor, model, root;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableEditing, Paragraph, UndoEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				root = model.document.getRoot();
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should add a paragraph to an empty table cell (on table insert)', () => {
		setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell></tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		expect( formatTable( getModelData( model, { withoutSelection: true } ) ) ).to.equal( formatTable(
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		) );
	} );

	it( 'should add a paragraph to an empty table cell (on row insert)', () => {
		setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		// Insert table row with one table cell
		model.change( writer => {
			writer.insertElement( 'tableRow', Position.createAfter( root.getNodeByPath( [ 0, 0 ] ) ) );
			writer.insertElement( 'tableCell', Position.createAt( root.getNodeByPath( [ 0, 1 ] ), 0 ) );
		} );

		expect( formatTable( getModelData( model, { withoutSelection: true } ) ) ).to.equal( formatTable(
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		) );
	} );

	it( 'should add a paragraph to an empty table cell (on table cell insert)', () => {
		setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		// Insert table row with one table cell
		model.change( writer => {
			writer.insertElement( 'tableCell', Position.createAt( root.getNodeByPath( [ 0, 0 ] ), 'end' ) );
		} );

		expect( formatTable( getModelData( model, { withoutSelection: true } ) ) ).to.equal( formatTable(
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		) );
	} );

	it( 'should add a paragraph to an empty table cell (after remove)', () => {
		setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph>foo</paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		// Remove paragraph from table cell.
		model.change( writer => {
			writer.remove( Range.createIn( root.getNodeByPath( [ 0, 0, 0 ] ) ) );
		} );

		expect( formatTable( getModelData( model, { withoutSelection: true } ) ) ).to.equal( formatTable(
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		) );
	} );
} );
