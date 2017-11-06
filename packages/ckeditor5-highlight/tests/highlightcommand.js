/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import HighlightCommand from './../src/highlightcommand';

import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import Command from '@ckeditor/ckeditor5-core/src/command';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '../../ckeditor5-engine/src/dev-utils/model';

describe( 'HighlightCommand', () => {
	let editor, doc, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				doc = newEditor.document;
				command = new HighlightCommand( newEditor );
				editor = newEditor;

				editor.commands.add( 'highlight', command );

				doc.schema.registerItem( 'paragraph', '$block' );

				doc.schema.allow( { name: '$inline', attributes: 'highlight', inside: '$block' } );
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
			setModelData( doc, '<paragraph><$text highlight="marker">fo[]o</$text></paragraph>' );

			expect( command ).to.have.property( 'value', 'marker' );
		} );

		it( 'is undefined when selection is not in text with highlight attribute', () => {
			setModelData( doc, '<paragraph>fo[]o</paragraph>' );

			expect( command ).to.have.property( 'value', undefined );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'is true when selection is on text which can have highlight added', () => {
			setModelData( doc, '<paragraph>fo[]o</paragraph>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should add highlight attribute on selected nodes nodes when passed as parameter', () => {
			setData( doc, '<paragraph>a[bc<$text highlight="marker">fo]obar</$text>xyz</paragraph>' );

			expect( command.value ).to.be.undefined;

			command.execute( { class: 'marker' } );

			expect( command.value ).to.equal( 'marker' );

			expect( getData( doc ) ).to.equal( '<paragraph>a[<$text highlight="marker">bcfo]obar</$text>xyz</paragraph>' );
		} );

		it( 'should set highlight attribute on selected nodes when passed as parameter', () => {
			setData( doc, '<paragraph>abc[<$text highlight="marker">foo]bar</$text>xyz</paragraph>' );

			expect( command.value ).to.equal( 'marker' );

			command.execute( { class: 'foo' } );

			expect( getData( doc ) ).to.equal(
				'<paragraph>abc[<$text highlight="foo">foo</$text>]<$text highlight="marker">bar</$text>xyz</paragraph>'
			);

			expect( command.value ).to.equal( 'foo' );
		} );

		it( 'should remove highlight attribute on selected nodes nodes when undefined passed as parameter', () => {
			setData( doc, '<paragraph>abc[<$text highlight="marker">foo]bar</$text>xyz</paragraph>' );

			expect( command.value ).to.equal( 'marker' );

			command.execute();

			expect( getData( doc ) ).to.equal( '<paragraph>abc[foo]<$text highlight="marker">bar</$text>xyz</paragraph>' );

			expect( command.value ).to.be.undefined;
		} );
	} );
} );
