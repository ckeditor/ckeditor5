/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import HeadingEngine from '/ckeditor5/heading/headingengine.js';
import Paragraph from '/ckeditor5/paragraph/paragraph.js';
import VirtualTestEditor from '/tests/core/_utils/virtualtesteditor.js';
import HeadingCommand from '/ckeditor5/heading/headingcommand.js';
import Enter from '/ckeditor5/enter/enter.js';
import { getData } from '/ckeditor5/engine/dev-utils/model.js';

describe( 'HeadingEngine', () => {
	let editor, document;

	beforeEach( () => {
		return VirtualTestEditor.create( {
			features: [ Enter, HeadingEngine ]
		} )
		.then( newEditor => {
			editor = newEditor;
			document = editor.document;
		} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( HeadingEngine ) ).to.be.instanceOf( HeadingEngine );
	} );

	it( 'should load paragraph feature', () => {
		expect( editor.plugins.get( Paragraph ) ).to.be.instanceOf( Paragraph );
	} );

	it( 'should set proper schema rules', () => {
		expect( document.schema.hasItem( 'heading1' ) ).to.be.true;
		expect( document.schema.hasItem( 'heading2' ) ).to.be.true;
		expect( document.schema.hasItem( 'heading3' ) ).to.be.true;

		expect( document.schema.check( { name: 'heading1', inside: '$root' } ) ).to.be.true;
		expect( document.schema.check( { name: '$inline', inside: 'heading1' } ) ).to.be.true;

		expect( document.schema.check( { name: 'heading2', inside: '$root' } ) ).to.be.true;
		expect( document.schema.check( { name: '$inline', inside: 'heading2' } ) ).to.be.true;

		expect( document.schema.check( { name: 'heading3', inside: '$root' } ) ).to.be.true;
		expect( document.schema.check( { name: '$inline', inside: 'heading3' } ) ).to.be.true;
	} );

	it( 'should register format command', () => {
		expect( editor.commands.has( 'heading' ) ).to.be.true;
		const command = editor.commands.get( 'heading' );

		expect( command ).to.be.instanceOf( HeadingCommand );
	} );

	it( 'should convert heading1', () => {
		editor.setData( '<h2>foobar</h2>' );

		expect( getData( document, { withoutSelection: true } ) ).to.equal( '<heading1>foobar</heading1>' );
		expect( editor.getData() ).to.equal( '<h2>foobar</h2>' );
	} );

	it( 'should convert heading2', () => {
		editor.setData( '<h3>foobar</h3>' );

		expect( getData( document, { withoutSelection: true } ) ).to.equal( '<heading2>foobar</heading2>' );
		expect( editor.getData() ).to.equal( '<h3>foobar</h3>' );
	} );

	it( 'should convert heading3', () => {
		editor.setData( '<h4>foobar</h4>' );

		expect( getData( document, { withoutSelection: true } ) ).to.equal( '<heading3>foobar</heading3>' );
		expect( editor.getData() ).to.equal( '<h4>foobar</h4>' );
	} );

	it( 'should make enter command insert a defaultFormat block if selection ended at the end of heading block', () => {
		editor.setData( '<h2>foobar</h2>' );
		document.selection.collapse( document.getRoot().getChild( 0 ), 'end' );

		editor.execute( 'enter' );

		expect( getData( document ) ).to.equal( '<heading1>foobar</heading1><paragraph>[]</paragraph>' );
	} );

	it( 'should not alter enter command if selection not ended at the end of heading block', () => {
		// This test is to fill code coverage.
		editor.setData( '<h2>foobar</h2>' );
		document.selection.collapse( document.getRoot().getChild( 0 ), 3 );

		editor.execute( 'enter' );

		expect( getData( document ) ).to.equal( '<heading1>foo</heading1><heading1>[]bar</heading1>' );
	} );
} );
