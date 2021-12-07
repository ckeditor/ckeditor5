/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../../src/tableediting';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';

describe( 'Table cell paragraph post-fixer', () => {
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

	it( 'should omit elements that are not table rows (on table insert)', () => {
		model.schema.register( 'foo', {
			allowIn: 'table',
			allowContentOf: '$block'
		} );
		editor.conversion.elementToElement( {
			model: 'foo',
			view: 'foo'
		} );

		setModelData( model,
			'<table>' +
				'<foo>' +
					'bar' +
				'</foo>' +
			'</table>'
		);

		expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
			'<table><foo>bar</foo></table>'
		);
	} );

	it( 'should add a paragraph to an empty table cell (on table insert)', () => {
		setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell></tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		);
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
			writer.insertElement( 'tableRow', writer.createPositionAfter( root.getNodeByPath( [ 0, 0 ] ) ) );
			writer.insertElement( 'tableCell', writer.createPositionAt( root.getNodeByPath( [ 0, 1 ] ), 0 ) );
		} );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		);
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
			writer.insertElement( 'tableCell', writer.createPositionAt( root.getNodeByPath( [ 0, 0 ] ), 'end' ) );
		} );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		);
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
			writer.remove( writer.createRangeIn( root.getNodeByPath( [ 0, 0, 0 ] ) ) );
		} );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );

	it( 'should wrap in a paragraph $text nodes placed directly in tableCell (on table cell modification) ', () => {
		setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		// Remove paragraph from table cell & insert: $text<paragraph>$text</paragraph>$text.
		model.change( writer => {
			writer.remove( writer.createRangeIn( root.getNodeByPath( [ 0, 0, 0 ] ) ) );

			const paragraph = writer.createElement( 'paragraph' );

			writer.insertText( 'foo', root.getNodeByPath( [ 0, 0, 0 ] ) );
			writer.insert( paragraph, root.getNodeByPath( [ 0, 0, 0 ] ), 'end' );
			writer.insertText( 'bar', paragraph );
			writer.insertText( 'baz', root.getNodeByPath( [ 0, 0, 0 ] ), 'end' );
		} );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
						'<paragraph>bar</paragraph>' +
						'<paragraph>baz</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );

	it( 'should wrap in paragraph $text nodes placed directly in tableCell (on inserting table cell)', () => {
		setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		// Insert new tableCell with $text.
		model.change( writer => {
			const tableCell = writer.createElement( 'tableCell' );

			writer.insertText( 'foo', tableCell );
			writer.insert( tableCell, writer.createPositionAt( root.getNodeByPath( [ 0, 0 ] ), 'end' ) );
		} );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph></paragraph>' +
					'</tableCell>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );

	it( 'should wrap in paragraph $text nodes placed directly in tableCell (on inserting table rows)', () => {
		setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		// Insert new tableRow with tableCell with $text.
		model.change( writer => {
			const tableRow = writer.createElement( 'tableRow' );
			const tableCell = writer.createElement( 'tableCell' );

			writer.insertText( 'foo', tableCell );
			writer.insert( tableCell, tableRow );
			writer.insert( tableRow, writer.createPositionAt( root.getNodeByPath( [ 0 ] ), 'end' ) );
		} );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph></paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );
} );
