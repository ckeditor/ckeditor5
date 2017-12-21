/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import FontSizeCommand from '../../src/fontsize/fontsizecommand';

import Command from '@ckeditor/ckeditor5-core/src/command';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'FontSizeCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				command = new FontSizeCommand( editor );
				editor.commands.add( 'fontSize', command );

				model.schema.registerItem( 'paragraph', '$block' );
				model.schema.allow( { name: '$inline', attributes: 'fontSize', inside: '$block' } );
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'is a command', () => {
		expect( FontSizeCommand.prototype ).to.be.instanceOf( Command );
		expect( command ).to.be.instanceOf( Command );
	} );

	describe( 'value', () => {
		it( 'is set to fontSize value when selection is in text with fontSize attribute', () => {
			setData( model, '<paragraph><$text fontSize="huge">fo[]o</$text></paragraph>' );

			expect( command ).to.have.property( 'value', 'huge' );
		} );

		it( 'is undefined when selection is not in text with fontSize attribute', () => {
			setData( model, '<paragraph>fo[]o</paragraph>' );

			expect( command ).to.have.property( 'value', undefined );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'is true when selection is on text which can have fontSize added', () => {
			setData( model, '<paragraph>fo[]o</paragraph>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should add fontSize attribute on selected text', () => {
			setData( model, '<paragraph>a[bc<$text fontSize="huge">fo]obar</$text>xyz</paragraph>' );

			expect( command.value ).to.be.undefined;

			command.execute( { fontSize: 'huge' } );

			expect( command.value ).to.equal( 'huge' );

			expect( getData( model ) ).to.equal( '<paragraph>a[<$text fontSize="huge">bcfo]obar</$text>xyz</paragraph>' );
		} );

		it( 'should add fontSize attribute on selected nodes (multiple nodes)', () => {
			setData(
				model,
				'<paragraph>abcabc[abc</paragraph>' +
				'<paragraph>foofoofoo</paragraph>' +
				'<paragraph>barbar]bar</paragraph>'
			);

			command.execute( { fontSize: 'huge' } );

			expect( command.value ).to.equal( 'huge' );

			expect( getData( model ) ).to.equal(
				'<paragraph>abcabc[<$text fontSize="huge">abc</$text></paragraph>' +
				'<paragraph><$text fontSize="huge">foofoofoo</$text></paragraph>' +
				'<paragraph><$text fontSize="huge">barbar</$text>]bar</paragraph>'
			);
		} );

		it( 'should change fontSize attribute on selected nodes', () => {
			setData(
				model,
				'<paragraph>abc[abc<$text fontSize="text-small">abc</$text></paragraph>' +
				'<paragraph><$text fontSize="text-small">foofoofoo</$text></paragraph>' +
				'<paragraph><$text fontSize="text-small">bar]bar</$text>bar</paragraph>'
			);

			command.execute( { fontSize: 'huge' } );

			expect( command.value ).to.equal( 'huge' );

			expect( getData( model ) ).to.equal(
				'<paragraph>abc[<$text fontSize="huge">abcabc</$text></paragraph>' +
				'<paragraph><$text fontSize="huge">foofoofoo</$text></paragraph>' +
				'<paragraph><$text fontSize="huge">bar</$text>]<$text fontSize="text-small">bar</$text>bar</paragraph>'
			);
		} );

		it( 'should do nothing on collapsed range', () => {
			setData( model, '<paragraph>abc<$text fontSize="huge">foo[]bar</$text>xyz</paragraph>' );

			expect( command.value ).to.equal( 'huge' );

			command.execute();

			expect( getData( model ) ).to.equal( '<paragraph>abc<$text fontSize="huge">foo[]bar</$text>xyz</paragraph>' );

			expect( command.value ).to.equal( 'huge' );
		} );

		it( 'should remove fontSize attribute on selected nodes when passing undefined fontSize param', () => {
			setData(
				model,
				'<paragraph>abcabc[<$text fontSize="huge">abc</$text></paragraph>' +
				'<paragraph><$text fontSize="huge">foofoofoo</$text></paragraph>' +
				'<paragraph><$text fontSize="huge">barbar</$text>]bar</paragraph>'
			);
			expect( command.value ).to.equal( 'huge' );

			command.execute();

			expect( command.value ).to.be.undefined;

			expect( getData( model ) ).to.equal(
				'<paragraph>abcabc[abc</paragraph>' +
				'<paragraph>foofoofoo</paragraph>' +
				'<paragraph>barbar]bar</paragraph>'
			);
		} );
	} );
} );
