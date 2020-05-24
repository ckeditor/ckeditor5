/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import SelectAllEditing from '../src/selectallediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ImageEditing from '@ckeditor/ckeditor5-image/src/image/imageediting';
import ImageCaptionEditing from '@ckeditor/ckeditor5-image/src/imagecaption/imagecaptionediting';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'SelectAllCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ SelectAllEditing, Paragraph, ImageEditing, ImageCaptionEditing, TableEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = editor.commands.get( 'selectAll' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should always be "true" because the command is stateless', () => {
			expect( command.isEnabled ).to.be.true;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should select all (collapsed selection in a block with text)', () => {
			setData( model, '<paragraph>f[]oo</paragraph>' );

			editor.execute( 'selectAll' );

			expect( getData( model ) ).to.equal( '<paragraph>[foo]</paragraph>' );
		} );

		it( 'should select all (collapsed selection in a content with an object)', () => {
			setData( model, '<paragraph>fo[]o</paragraph><image src="foo.png"><caption></caption></image>' );

			editor.execute( 'selectAll' );

			expect( getData( model ) ).to.equal( '<paragraph>[foo</paragraph><image src="foo.png"><caption></caption></image>]' );
		} );

		it( 'should select all (selection on an object)', () => {
			setData( model, '<paragraph>foo</paragraph>[<image src="foo.png"><caption></caption></image>]' );

			editor.execute( 'selectAll' );

			expect( getData( model ) ).to.equal( '<paragraph>[foo</paragraph><image src="foo.png"><caption></caption></image>]' );
		} );

		it( 'should select all (collapsed selection in a nested editable)', () => {
			setData( model, '<paragraph>foo</paragraph><image src="foo.png"><caption>b[]ar</caption></image>' );

			editor.execute( 'selectAll' );

			expect( getData( model ) ).to.equal( '<paragraph>foo</paragraph><image src="foo.png"><caption>[bar]</caption></image>' );
		} );

		it( 'should select all (selection in a nested editable)', () => {
			setData( model, '<paragraph>foo</paragraph><image src="foo.png"><caption>b[ar]</caption></image>' );

			editor.execute( 'selectAll' );

			expect( getData( model ) ).to.equal( '<paragraph>foo</paragraph><image src="foo.png"><caption>[bar]</caption></image>' );
		} );

		it( 'should select all (selection within limit element)', () => {
			setData( model,
				'<paragraph>foo</paragraph>' +
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>foo</paragraph>' +
						'</tableCell>' +
						'[<tableCell>' +
							'<paragraph>bar</paragraph>' +
						'</tableCell>]' +
						'[<tableCell>' +
							'<paragraph>baz</paragraph>' +
						'</tableCell>]' +
					'</tableRow>' +
				'</table>'
			);

			editor.execute( 'selectAll' );

			expect( getData( model ) ).to.equal(
				'<paragraph>[foo</paragraph>' +
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>foo</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>bar</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>baz</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>]'
			);
		} );

		it( 'should select all in the closest nested editable (nested editable inside another nested editable)', () => {
			setData( model,
				'<paragraph>foo</paragraph>' +
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>foo</paragraph>' +
							'<image src="foo.png"><caption>b[]ar</caption></image>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			editor.execute( 'selectAll' );

			expect( getData( model ) ).to.equal( '<paragraph>foo</paragraph>' +
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>foo</paragraph>' +
							'<image src="foo.png"><caption>[bar]</caption></image>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);
		} );

		it( 'should select all in the parent select-all-limit element (the entire editable is selected)', () => {
			setData( model, '<paragraph>foo</paragraph><image src="foo.png"><caption>[bar]</caption></image>' );

			editor.execute( 'selectAll' );

			expect( getData( model ) ).to.equal( '<paragraph>[foo</paragraph><image src="foo.png"><caption>bar</caption></image>]' );
		} );

		it( 'should select all in the parent sellect-all-limit element (consecutive execute() on a nested editable)', () => {
			setData( model,
				'<paragraph>foo</paragraph>' +
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>foo</paragraph>' +
							'<image src="foo.png"><caption>b[]ar</caption></image>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			editor.execute( 'selectAll' );
			editor.execute( 'selectAll' );

			expect( getData( model ) ).to.equal( '<paragraph>foo</paragraph>' +
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>[foo</paragraph>' +
							'<image src="foo.png"><caption>bar</caption></image>]' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			editor.execute( 'selectAll' );

			expect( getData( model ) ).to.equal( '<paragraph>[foo</paragraph>' +
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>foo</paragraph>' +
							'<image src="foo.png"><caption>bar</caption></image>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>]'
			);

			// editor.execute( 'selectAll' );
		} );

		it( 'should not change the selection (the entire editor is selected)', () => {
			setData( model,
				'<paragraph>[foo</paragraph>' +
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>foo</paragraph>' +
							'<image src="foo.png"><caption>bar</caption></image>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>]'
			);

			editor.execute( 'selectAll' );

			expect( getData( model ) ).to.equal( '<paragraph>[foo</paragraph>' +
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>foo</paragraph>' +
							'<image src="foo.png"><caption>bar</caption></image>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>]'
			);
		} );
	} );
} );
