/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import HighlightCommand from './../src/highlightcommand';

import Command from '@ckeditor/ckeditor5-core/src/command';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'HighlightCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				command = new HighlightCommand( newEditor );
				editor.commands.add( 'highlight', command );

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				model.schema.extend( '$text', { allowAttributes: 'highlight' } );
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'is a command', () => {
		expect( HighlightCommand.prototype ).to.be.instanceOf( Command );
		expect( command ).to.be.instanceOf( Command );
	} );

	describe( 'value', () => {
		it( 'is set to highlight attribute value when selection is in text with highlight attribute', () => {
			setData( model, '<paragraph><$text highlight="marker">fo[o]</$text></paragraph>' );

			expect( command ).to.have.property( 'value', 'marker' );
		} );

		it( 'is undefined when selection is not in text with highlight attribute', () => {
			setData( model, '<paragraph>fo[]o</paragraph>' );

			expect( command ).to.have.property( 'value', undefined );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'is true when selection is on text which can have highlight added', () => {
			setData( model, '<paragraph>fo[]o</paragraph>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should add highlight attribute on selected nodes nodes when passed as parameter', () => {
			setData( model, '<paragraph>a[bc<$text highlight="marker">fo]obar</$text>xyz</paragraph>' );

			expect( command.value ).to.be.undefined;

			command.execute( { value: 'marker' } );

			expect( command.value ).to.equal( 'marker' );

			expect( getData( model ) ).to.equal( '<paragraph>a[<$text highlight="marker">bcfo]obar</$text>xyz</paragraph>' );
		} );

		it( 'should add highlight attribute on selected nodes nodes when passed as parameter (multiple nodes)', () => {
			setData(
				model,
				'<paragraph>abcabc[abc</paragraph>' +
				'<paragraph>foofoofoo</paragraph>' +
				'<paragraph>barbar]bar</paragraph>'
			);

			command.execute( { value: 'marker' } );

			expect( command.value ).to.equal( 'marker' );

			expect( getData( model ) ).to.equal(
				'<paragraph>abcabc[<$text highlight="marker">abc</$text></paragraph>' +
				'<paragraph><$text highlight="marker">foofoofoo</$text></paragraph>' +
				'<paragraph><$text highlight="marker">barbar</$text>]bar</paragraph>'
			);
		} );

		it( 'should set highlight attribute on selected nodes when passed as parameter', () => {
			setData( model, '<paragraph>abc[<$text highlight="marker">foo]bar</$text>xyz</paragraph>' );

			expect( command.value ).to.equal( 'marker' );

			command.execute( { value: 'foo' } );

			expect( getData( model ) ).to.equal(
				'<paragraph>abc[<$text highlight="foo">foo</$text>]<$text highlight="marker">bar</$text>xyz</paragraph>'
			);

			expect( command.value ).to.equal( 'foo' );
		} );

		it( 'should remove highlight attribute on selected nodes nodes when undefined passed as parameter', () => {
			setData( model, '<paragraph>abc[<$text highlight="marker">foo]bar</$text>xyz</paragraph>' );

			expect( command.value ).to.equal( 'marker' );

			command.execute();

			expect( getData( model ) ).to.equal( '<paragraph>abc[foo]<$text highlight="marker">bar</$text>xyz</paragraph>' );

			expect( command.value ).to.be.undefined;
		} );

		it( 'should do nothing on collapsed range', () => {
			setData( model, '<paragraph>abc<$text highlight="marker">foo[]bar</$text>xyz</paragraph>' );

			expect( command.value ).to.equal( 'marker' );

			command.execute();

			expect( getData( model ) ).to.equal( '<paragraph>abc<$text highlight="marker">foo[]bar</$text>xyz</paragraph>' );

			expect( command.value ).to.equal( 'marker' );
		} );
	} );
} );
