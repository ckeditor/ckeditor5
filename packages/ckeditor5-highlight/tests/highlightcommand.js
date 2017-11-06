/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import HighlightCommand from './../src/highlightcommand';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import Command from '@ckeditor/ckeditor5-core/src/command';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';

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

				doc.schema.allow( { name: '$block', inside: '$root', attributes: 'highlight' } );
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
		it( 'is true when selection is in block with commend type highlight', () => {
			setModelData( doc, '<paragraph highlight="center"><$text highlight="true">fo[]o</$text></paragraph>' );

			expect( command ).to.have.property( 'value', true );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'is true when selection is in a block which can have added highlight', () => {
			setModelData( doc, '<paragraph highlight="center"><$text highlight="true">fo[]o</$text></paragraph>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );
	} );

	describe.skip( 'execute()', () => {
		describe( 'applying highlight', () => {
			it( 'adds highlight to selected text element', () => {
				setModelData( doc, '<paragraph>f[o]o</paragraph>' );

				editor.execute( 'highlight' );

				expect( getModelData( doc ) ).to.equal( '<paragraph>f<$text highlight="true">[o]</$text>o</paragraph>' );
			} );
		} );
	} );
} );
