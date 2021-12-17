/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, parse, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../../src/tableediting';
import TableCaptionEditing from '../../src/tablecaption/tablecaptionediting';
import TableWalker from '../../src/tablewalker';

describe( 'Table caption post-fixer', () => {
	let editor, model, root;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableEditing, TableCaptionEditing, Paragraph ]
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

	describe( 'on insert table', () => {
		it( 'should merge many captions into one', () => {
			const modelTable =
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>00</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>01</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<caption>caption 0</caption>' +
					'<caption>caption 1</caption>' +
				'</table>';
			const parsed = parse( modelTable, model.schema );

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
				writer.insert( parsed, root );
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>00</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>01</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<caption>caption 0caption 1</caption>' +
				'</table>'
			);
		} );

		it( 'should merge all captions in between the rows', () => {
			const modelTable =
				'<table>' +
					'<caption>caption 0</caption>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>00</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>01</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<caption>caption 1</caption>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>10</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>11</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<caption>caption 2</caption>' +
				'</table>';
			const parsed = parse( modelTable, model.schema );

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
				writer.insert( parsed, root );
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>00</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>01</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>10</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>11</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<caption>caption 0caption 1caption 2</caption>' +
				'</table>'
			);
		} );

		it( 'should merge all captions in between the rows (and TableWalker should still provide valid rows)', () => {
			const modelTable =
				'<table>' +
					'<caption>caption 0</caption>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>00</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>01</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<caption>caption 1</caption>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>10</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>11</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<caption>caption 2</caption>' +
				'</table>';
			const parsed = parse( modelTable, model.schema );

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
				writer.insert( parsed, root );

				const slots = Array.from( new TableWalker( root.getChild( 0 ) ) );

				expect( slots.length ).to.equal( 4 );
				expect( slots[ 0 ].row ).to.equal( 0 );
				expect( slots[ 0 ].column ).to.equal( 0 );
				expect( slots[ 1 ].row ).to.equal( 0 );
				expect( slots[ 1 ].column ).to.equal( 1 );
				expect( slots[ 2 ].row ).to.equal( 1 );
				expect( slots[ 2 ].column ).to.equal( 0 );
				expect( slots[ 3 ].row ).to.equal( 1 );
				expect( slots[ 3 ].column ).to.equal( 1 );
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>00</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>01</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>10</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>11</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<caption>caption 0caption 1caption 2</caption>' +
				'</table>'
			);
		} );

		it( 'should move final caption at the end of the table', () => {
			const modelTable =
				'<table>' +
					'<caption>caption 0</caption>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>00</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>01</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>';
			const parsed = parse( modelTable, model.schema );

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
				writer.insert( parsed, root );
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>00</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>01</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<caption>caption 0</caption>' +
				'</table>'
			);
		} );

		it( 'should place new caption at the end of the table model', () => {
			setModelData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>xyz</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			model.change( writer => {
				const caption = writer.createElement( 'caption' );

				writer.insertText( 'foobar', caption, 'end' );

				// Insert new caption at the beginning of the table (before first row).
				writer.insert( caption, writer.createPositionFromPath( editor.model.document.getRoot(), [ 0, 0 ] ) );
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>xyz</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<caption>foobar</caption>' +
				'</table>'
			);
		} );
	} );
} );
