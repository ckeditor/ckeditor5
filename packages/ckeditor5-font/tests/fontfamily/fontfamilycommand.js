/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import FontFamilyCommand from '../../src/fontfamily/fontfamilycommand';

import Command from '@ckeditor/ckeditor5-core/src/command';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'FontFamilyCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				command = new FontFamilyCommand( editor, 'arial' );
				editor.commands.add( 'fontFamily', command );

				model.schema.registerItem( 'paragraph', '$block' );
				model.schema.allow( { name: '$inline', attributes: 'fontFamily', inside: '$block' } );
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'is a command', () => {
		expect( FontFamilyCommand.prototype ).to.be.instanceOf( Command );
		expect( command ).to.be.instanceOf( Command );
	} );

	describe( 'value', () => {
		it( 'is set to true when selection is in text with fontFamily attribute', () => {
			setData( model, '<paragraph><$text fontFamily="arial">fo[]o</$text></paragraph>' );

			expect( command ).to.have.property( 'value', true );
		} );

		it( 'is undefined when selection is not in text with fontFamily attribute', () => {
			setData( model, '<paragraph>fo[]o</paragraph>' );

			expect( command ).to.have.property( 'value', false );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'is true when selection is on text which can have fontFamily added', () => {
			setData( model, '<paragraph>fo[]o</paragraph>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should add fontFamily attribute on selected text', () => {
			setData( model, '<paragraph>a[bc<$text fontFamily="arial">fo]obar</$text>xyz</paragraph>' );

			expect( command.value ).to.be.false;

			command.execute();

			expect( command.value ).to.be.true;

			expect( getData( model ) ).to.equal( '<paragraph>a[<$text fontFamily="arial">bcfo]obar</$text>xyz</paragraph>' );
		} );

		it( 'should add fontFamily attribute on selected nodes (multiple nodes)', () => {
			setData(
				model,
				'<paragraph>abcabc[abc</paragraph>' +
				'<paragraph>foofoofoo</paragraph>' +
				'<paragraph>barbar]bar</paragraph>'
			);

			command.execute();

			expect( command.value ).to.be.true;

			expect( getData( model ) ).to.equal(
				'<paragraph>abcabc[<$text fontFamily="arial">abc</$text></paragraph>' +
				'<paragraph><$text fontFamily="arial">foofoofoo</$text></paragraph>' +
				'<paragraph><$text fontFamily="arial">barbar</$text>]bar</paragraph>'
			);
		} );

		it( 'should change fontFamily attribute on selected nodes', () => {
			setData(
				model,
				'<paragraph>abc[abc<$text fontFamily="text-small">abc</$text></paragraph>' +
				'<paragraph><$text fontFamily="text-small">foofoofoo</$text></paragraph>' +
				'<paragraph><$text fontFamily="text-small">bar]bar</$text>bar</paragraph>'
			);

			command.execute();

			expect( command.value ).to.be.true;

			expect( getData( model ) ).to.equal(
				'<paragraph>abc[<$text fontFamily="arial">abcabc</$text></paragraph>' +
				'<paragraph><$text fontFamily="arial">foofoofoo</$text></paragraph>' +
				'<paragraph><$text fontFamily="arial">bar</$text>]<$text fontFamily="text-small">bar</$text>bar</paragraph>'
			);
		} );

		it( 'should do nothing on collapsed range', () => {
			setData( model, '<paragraph>abc<$text fontFamily="arial">foo[]bar</$text>xyz</paragraph>' );

			expect( command.value ).to.be.true;

			command.execute();

			expect( getData( model ) ).to.equal( '<paragraph>abc<$text fontFamily="arial">foo[]bar</$text>xyz</paragraph>' );

			expect( command.value ).to.be.true;
		} );
	} );
} );
