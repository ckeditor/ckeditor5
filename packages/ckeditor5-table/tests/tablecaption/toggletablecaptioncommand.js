/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import TableSelection from '../../src/tableselection.js';
import TableEditing from '../../src/tableediting.js';
import { modelTable } from '../_utils/utils.js';

import ToggleTableCaptionCommand from '../../src/tablecaption/toggletablecaptioncommand.js';
import TableCaptionEditing from '../../src/tablecaption/tablecaptionediting.js';
import { BoldEditing } from '@ckeditor/ckeditor5-basic-styles';

describe( 'ToggleTableCaptionCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ Paragraph, TableEditing, TableCaptionEditing, TableSelection, BoldEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new ToggleTableCaptionCommand( editor );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be false if wrong node', () => {
			setData( model, '<paragraph>foo[]</paragraph>' );
			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true if in a table', () => {
			setData( model, modelTable( [ [ '[]' ] ] ) );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if on a table', () => {
			setData( model,
				'[<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>]'
			);
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if it is in a table that does not allow captions', () => {
			editor.model.schema.extend( 'table', { disallowChildren: 'caption' } );

			setData( model, modelTable( [ [ '[]' ] ] ) );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should insert caption while the cell\'s content is focused', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ]
			] ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>11[]</paragraph>' +
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
					'<caption></caption>' +
				'</table>'
			);
		} );

		it( 'should hide caption while the cell\'s content is focused', () => {
			setData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>11[]</paragraph>' +
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
					'<caption></caption>' +
				'</table>'
			);

			command.execute();

			expect( getData( model ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>11[]</paragraph>' +
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

		it( 'should insert caption while the table is focused', () => {
			setData( model,
				'[<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>]'
			);

			command.execute();

			expect( getData( model ) ).to.equalMarkup(
				'[<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<caption></caption>' +
				'</table>]'
			);
		} );

		it( 'should hide caption while the table is focused', () => {
			setData( model,
				'[<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<caption></caption>' +
				'</table>]'
			);

			command.execute();

			expect( getData( model ) ).to.equalMarkup(
				'[<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>]'
			);
		} );

		it( 'should insert caption in given table while the table is focused and move focus to caption', () => {
			setData( model,
				'[<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>]'
			);

			command.execute( { focusCaptionOnShow: true } );

			expect( getData( model ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<caption>[]</caption>' +
				'</table>'
			);
		} );

		it( 'should keep caption content even when caption is hidden', () => {
			setData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>[]</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<caption>Foo<$text bold="true">bar</$text></caption>' +
				'</table>'
			);

			command.execute();

			expect( getData( model ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>[]</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			command.execute();

			expect( getData( model ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>[]</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<caption>Foo<$text bold="true">bar</$text></caption>' +
				'</table>'
			);
		} );

		it( 'should overwrite caption with an empty one', () => {
			setData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>A[]bc</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<caption>Foo</caption>' +
				'</table>'
			);

			// Hide the caption.
			command.execute();

			expect( getData( model ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>A[]bc</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			// Show the caption.
			command.execute();

			// Remove the caption content.
			model.change( writer => {
				const caption = model.document.getRoot().getNodeByPath( [ 0, 1 ] );
				const range = writer.createRangeIn( caption );

				writer.remove( range );
			} );

			// Hide and then show the caption.
			command.execute();
			command.execute();

			expect( getData( model ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>A[]bc</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +

					// Caption should be empty.
					'<caption></caption>' +
				'</table>'
			);
		} );
	} );
} );
