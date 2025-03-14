/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import TableEditing from '../../../src/tableediting.js';
import TableCaptionEditing from '../../../src/tablecaption/tablecaptionediting.js';
import TableLayoutEditing from '../../../src/tablelayout/tablelayoutediting.js';
import TableTypeCommand from '../../../src/tablelayout/commands/tabletypecommand.js';

import { modelTable } from '../../_utils/utils.js';

describe( 'TableTypeCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ Paragraph, TableEditing, TableCaptionEditing, TableLayoutEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new TableTypeCommand( editor );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		describe( 'collapsed selection', () => {
			it( 'should be false if selection does not have table', () => {
				setModelData( model, '<paragraph>foo[]</paragraph>' );
				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true if selection has table', () => {
				setModelData( model, modelTable( [ [ '[]foo' ] ] ) );
				expect( command.isEnabled ).to.be.true;
			} );
		} );

		describe( 'non-collapsed selection', () => {
			it( 'should be false if selection does not have table', () => {
				setModelData( model, '<paragraph>f[oo]</paragraph>' );
				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true if selection is inside table', () => {
				setModelData( model, modelTable( [ [ 'f[o]o' ] ] ) );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if selection is over table', () => {
				setModelData( model, '[' + modelTable( [ [ 'foo' ] ] ) + ']' );
				expect( command.isEnabled ).to.be.true;
			} );
		} );
	} );

	describe( 'execute()', () => {
		// it( 'should remove width from a selected table if passed the default value', () => {
		// 	setData( model, modelTable( [ [ '[foo]' ] ], { tableWidth: '100px' } ) );

		// 	command.execute( { value: '300px' } );

		// 	assertTableStyle( editor, '' );
		// } );

		it( 'should change table attribute from `layout` to `content`', () => {
			editor.setData(
				'<table class="table layout-table">' +
					'<tr><td>1</td></tr>' +
				'</table>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="layout">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
				'</table>'
			);

			command.execute( 'content' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="content">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'should change table attribute from `content` to `layout`', () => {
			editor.setData(
				'<table class="table content-table">' +
					'<tr><td>1</td></tr>' +
				'</table>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="content">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
				'</table>'
			);

			command.execute( 'layout' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="layout">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'should not changed the table attribute when existing and proposed are the same', () => {
			editor.setData(
				'<table class="table layout-table">' +
					'<tr><td>1</td></tr>' +
				'</table>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="layout">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
				'</table>'
			);

			command.execute( 'layout' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="layout">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'should remove not allowed attributes while changing table type from `content` to `layout`', () => {
			editor.setData(
				'<table class="table content-table">' +
					'<thead>' +
						'<tr><th>1</th></tr>' +
					'</thead>' +
					'<tbody>' +
						'<tr><td>2</td></tr>' +
					'</tbody>' +
				'</table>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table headingRows="1" tableType="content">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
				'</table>'
			);

			command.execute( 'layout' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="layout">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'should remove not allowed elements while changing table type from `content` to `layout`', () => {
			editor.setData(
				'<table class="table content-table">' +
					'<caption>foobar</caption>' +
					'<tbody>' +
						'<tr><td>1</td></tr>' +
					'</tbody>' +
				'</table>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="content">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
					'<caption>foobar</caption>' +
				'</table>'
			);

			command.execute( 'layout' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="layout">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );
	} );
} );
