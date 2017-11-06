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

	describe.skip( 'execute()', () => {
		describe( 'applying highlight', () => {
			it( 'adds highlight to selected text element', () => {
				setModelData( doc, '<paragraph>f[o]o</paragraph>' );

				editor.execute( 'highlight', { class: 'marker' } );

				expect( getModelData( doc ) ).to.equal( '<paragraph>f<$text highlight="marker">[o]</$text>o</paragraph>' );
			} );
		} );
	} );
} );
