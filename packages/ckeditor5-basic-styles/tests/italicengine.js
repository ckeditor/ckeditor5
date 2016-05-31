/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ItalicEngine from '/ckeditor5/basic-styles/italicengine.js';
import VirtualTestEditor from '/tests/ckeditor5/_utils/virtualtesteditor.js';
import { getData } from '/tests/engine/_utils/model.js';
import BuildModelConverterFor from '/ckeditor5/engine/conversion/model-converter-builder.js';
import BuildViewConverterFor from '/ckeditor5/engine/conversion/view-converter-builder.js';
import AttributeCommand from '/ckeditor5/command/attributecommand.js';

describe( 'ItalicEngine', () => {
	let editor, document;

	beforeEach( () => {
		return VirtualTestEditor.create( {
				features: [ ItalicEngine ]
			} )
			.then( newEditor => {
				editor = newEditor;

				document = editor.document;

				// Register some block element for tests.
				document.schema.registerItem( 'p', '$block' );

				// Build converter from model to view for data and editing pipelines.
				BuildModelConverterFor( editor.data.modelToView, editor.editing.modelToView )
					.fromElement( 'p' )
					.toElement( 'p' );

				// Build converter from view to model for data and editing pipelines.
				BuildViewConverterFor( editor.data.viewToModel )
					.fromElement( 'p' )
					.toElement( 'p' );
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ItalicEngine ) ).to.be.instanceOf( ItalicEngine );
	} );

	it( 'should set proper schema rules', () => {
		expect( document.schema.check( { name: '$inline', attributes: [ 'italic' ] } ) ).to.be.true;
	} );

	it( 'should register bold command', () => {
		expect( editor.commands.has( 'italic' ) ).to.be.true;

		const command = editor.commands.get( 'italic' );

		expect( command ).to.be.instanceOf( AttributeCommand );
		expect( command.attributeKey ).to.equal( 'italic' );
	} );

	it( 'should convert <em> to italic attribute', () => {
		editor.setData( '<p><em>foobar</em></p>' );

		expect( getData( document, { withoutSelection: true } ) ).to.equal( '<p><$text italic=true>foobar</$text></p>' );
		expect( editor.getData() ).to.equal( '<p><em>foobar</em></p>' );
	} );

	it( 'should convert <i> to italic attribute', () => {
		editor.setData( '<p><i>foobar</i></p>' );

		expect( getData( document, { withoutSelection: true } ) ).to.equal( '<p><$text italic=true>foobar</$text></p>' );
		expect( editor.getData() ).to.equal( '<p><em>foobar</em></p>' );
	} );

	it( 'should convert font-style:italic to italic attribute', () => {
		editor.setData( '<p><span style="font-style: italic;">foobar</span></p>' );

		expect( getData( document, { withoutSelection: true } ) ).to.equal( '<p><$text italic=true>foobar</$text></p>' );
		expect( editor.getData() ).to.equal( '<p><em>foobar</em></p>' );
	} );
} );
