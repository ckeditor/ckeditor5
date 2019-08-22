/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../../src/tableediting';
import { formatTable } from './../_utils/utils';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';

describe( 'Table cell paragraph post-fixer', () => {
	let editor, model, root, postFixerSpy;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ function( editor ) {
					editor.model.schema.register( 'block', { inheritAllFrom: '$block' } );

					// Add a post-fixer spy before any other plugin so it will be always run if other post-fixer returns true.
					// Use spy.resetHistory() before checking a case when post fixer should be run.
					// It should be called once if no other post-fixer fixed the model or more then one if another post-fixer changed model.
					postFixerSpy = sinon.spy();
					editor.model.document.registerPostFixer( postFixerSpy );
				}, TableEditing, Paragraph, UndoEditing ]
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
			writer.insertElement( 'tableRow', writer.createPositionAfter( root.getNodeByPath( [ 0, 0 ] ) ) );
			writer.insertElement( 'tableCell', writer.createPositionAt( root.getNodeByPath( [ 0, 1 ] ), 0 ) );
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
			writer.insertElement( 'tableCell', writer.createPositionAt( root.getNodeByPath( [ 0, 0 ] ), 'end' ) );
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
			writer.remove( writer.createRangeIn( root.getNodeByPath( [ 0, 0, 0 ] ) ) );
		} );

		expect( formatTable( getModelData( model, { withoutSelection: true } ) ) ).to.equal( formatTable(
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		) );
	} );

	it( 'should wrap in paragraph $text nodes placed directly in tableCell (on table cell modification) ', () => {
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

		expect( formatTable( getModelData( model, { withoutSelection: true } ) ) ).to.equal( formatTable(
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
						'<paragraph>bar</paragraph>' +
						'<paragraph>baz</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		) );
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

		expect( formatTable( getModelData( model, { withoutSelection: true } ) ) ).to.equal( formatTable(
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
		) );
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

		expect( formatTable( getModelData( model, { withoutSelection: true } ) ) ).to.equal( formatTable(
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
		) );
	} );

	it( 'should not be run on changing attribute of other element in a table cell', () => {
		setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell><block></block></tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		postFixerSpy.resetHistory();

		// Insert table row with one table cell
		model.change( writer => {
			writer.setAttribute( 'foo', 'bar', root.getNodeByPath( [ 0, 0, 0, 0 ] ) );
		} );

		expect( formatTable( getModelData( model, { withoutSelection: true } ) ) ).to.equal( formatTable(
			'<table>' +
				'<tableRow>' +
					'<tableCell><block foo="bar"></block></tableCell>' +
				'</tableRow>' +
			'</table>'
		) );

		sinon.assert.calledOnce( postFixerSpy );
	} );

	it( 'should be run on changing attribute of a paragraph in a table cell', () => {
		setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		postFixerSpy.resetHistory();

		// Insert table row with one table cell
		model.change( writer => {
			writer.setAttribute( 'foo', 'bar', root.getNodeByPath( [ 0, 0, 0, 0 ] ) );
		} );

		expect( formatTable( getModelData( model, { withoutSelection: true } ) ) ).to.equal( formatTable(
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph foo="bar"></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		) );

		sinon.assert.calledTwice( postFixerSpy );
	} );
} );
