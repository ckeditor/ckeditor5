/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import FontCommand from '../src/fontcommand';

import Command from '@ckeditor/ckeditor5-core/src/command';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'FontCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				command = new FontCommand( editor, 'font' );
				editor.commands.add( 'font', command );

				model.schema.registerItem( 'paragraph', '$block' );
				model.schema.allow( { name: '$inline', attributes: 'font', inside: '$block' } );
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'is a command', () => {
		expect( FontCommand.prototype ).to.be.instanceOf( Command );
		expect( command ).to.be.instanceOf( Command );
	} );

	describe( 'value', () => {
		it( 'is set to font value when selection is in text with font attribute', () => {
			setData( model, '<paragraph><$text font="foo">fo[]o</$text></paragraph>' );

			expect( command ).to.have.property( 'value', 'foo' );
		} );

		it( 'is undefined when selection is not in text with font attribute', () => {
			setData( model, '<paragraph>fo[]o</paragraph>' );

			expect( command ).to.have.property( 'value', undefined );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'is true when selection is on text which can have font added', () => {
			setData( model, '<paragraph>fo[]o</paragraph>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should add font attribute on selected text', () => {
			setData( model, '<paragraph>a[bc<$text font="foo">fo]obar</$text>xyz</paragraph>' );

			expect( command.value ).to.be.undefined;

			command.execute( { value: 'foo' } );

			expect( command.value ).to.equal( 'foo' );

			expect( getData( model ) ).to.equal( '<paragraph>a[<$text font="foo">bcfo]obar</$text>xyz</paragraph>' );
		} );

		it( 'should add font attribute on selected nodes (multiple nodes)', () => {
			setData(
				model,
				'<paragraph>abcabc[abc</paragraph>' +
				'<paragraph>foofoofoo</paragraph>' +
				'<paragraph>barbar]bar</paragraph>'
			);

			command.execute( { value: 'foo' } );

			expect( command.value ).to.equal( 'foo' );

			expect( getData( model ) ).to.equal(
				'<paragraph>abcabc[<$text font="foo">abc</$text></paragraph>' +
				'<paragraph><$text font="foo">foofoofoo</$text></paragraph>' +
				'<paragraph><$text font="foo">barbar</$text>]bar</paragraph>'
			);
		} );

		it( 'should change font attribute on selected nodes', () => {
			setData(
				model,
				'<paragraph>abc[abc<$text font="text-small">abc</$text></paragraph>' +
				'<paragraph><$text font="text-small">foofoofoo</$text></paragraph>' +
				'<paragraph><$text font="text-small">bar]bar</$text>bar</paragraph>'
			);

			command.execute( { value: 'foo' } );

			expect( command.value ).to.equal( 'foo' );

			expect( getData( model ) ).to.equal(
				'<paragraph>abc[<$text font="foo">abcabc</$text></paragraph>' +
				'<paragraph><$text font="foo">foofoofoo</$text></paragraph>' +
				'<paragraph><$text font="foo">bar</$text>]<$text font="text-small">bar</$text>bar</paragraph>'
			);
		} );

		it( 'should do nothing on collapsed range', () => {
			setData( model, '<paragraph>abc<$text font="foo">foo[]bar</$text>xyz</paragraph>' );

			expect( command.value ).to.equal( 'foo' );

			command.execute( { value: 'foo' } );

			expect( getData( model ) ).to.equal( '<paragraph>abc<$text font="foo">foo[]bar</$text>xyz</paragraph>' );

			expect( command.value ).to.equal( 'foo' );
		} );

		it( 'should remove font attribute on selected nodes when passing undefined font param', () => {
			setData(
				model,
				'<paragraph>abcabc[<$text font="foo">abc</$text></paragraph>' +
				'<paragraph><$text font="foo">foofoofoo</$text></paragraph>' +
				'<paragraph><$text font="foo">barbar</$text>]bar</paragraph>'
			);
			expect( command.value ).to.equal( 'foo' );

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
