/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import HeadingEngine from '../src/headingengine';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import HeadingCommand from '../src/headingcommand';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import { add } from '@ckeditor/ckeditor5-utils/src/translation-service';
import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

add( 'pl', {
	'Paragraph': 'Akapit',
	'Heading 1': 'Nagłówek 1',
	'Heading 2': 'Nagłówek 2',
	'Heading 3': 'Nagłówek 3',
} );

describe( 'HeadingEngine', () => {
	let editor, document;

	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ Enter, HeadingEngine ]
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

	it( 'should register option command', () => {
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

	it( 'should make enter command insert a defaultOption block if selection ended at the end of heading block', () => {
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

	describe( 'config', () => {
		describe( 'options', () => {
			describe( 'default value', () => {
				it( 'should be set', () => {
					expect( editor.config.get( 'heading.options' ) ).to.deep.equal( [
						{ id: 'paragraph', element: 'p', label: 'Paragraph' },
						{ id: 'heading1', element: 'h2', label: 'Heading 1' },
						{ id: 'heading2', element: 'h3', label: 'Heading 2' },
						{ id: 'heading3', element: 'h4', label: 'Heading 3' }
					] );
				} );

				it( 'should be localized', () => {
					return VirtualTestEditor.create( {
						plugins: [ Enter, HeadingEngine ],
						lang: 'pl',
					} )
					.then( editor => {
						expect( editor.config.get( 'heading.options' ) ).to.deep.equal( [
							{ id: 'paragraph', element: 'p', label: 'Akapit' },
							{ id: 'heading1', element: 'h2', label: 'Nagłówek 1' },
							{ id: 'heading2', element: 'h3', label: 'Nagłówek 2' },
							{ id: 'heading3', element: 'h4', label: 'Nagłówek 3' }
						] );
					} );
				} );
			} );

			it( 'should customize options', () => {
				const options = [
					{ id: 'paragraph', element: 'p', label: 'Paragraph' },
					{ id: 'h4', element: 'h4', label: 'H4' }
				];

				return VirtualTestEditor.create( {
					plugins: [ Enter, HeadingEngine ],
					heading: {
						options: options
					}
				} )
				.then( editor => {
					document = editor.document;

					expect( editor.commands.get( 'heading' ).options ).to.deep.equal( options );

					expect( document.schema.hasItem( 'paragraph' ) ).to.be.true;
					expect( document.schema.hasItem( 'h4' ) ).to.be.true;

					expect( document.schema.hasItem( 'heading1' ) ).to.be.false;
					expect( document.schema.hasItem( 'heading2' ) ).to.be.false;
					expect( document.schema.hasItem( 'heading3' ) ).to.be.false;
				} );
			} );
		} );

		describe( 'defaultOptionId', () => {
			it( 'should have default value', () => {
				expect( editor.config.get( 'heading.defaultOptionId' ) ).to.equal( 'paragraph' );
			} );

			it( 'should customize options', () => {
				return VirtualTestEditor.create( {
					plugins: [ Enter, HeadingEngine ],
					heading: {
						options: [
							{ id: 'foo', element: 'f', label: 'Foo' },
							{ id: 'bar', element: 'b', label: 'Bar' }
						],
						defaultOptionId: 'bar'
					}
				} )
				.then( editor => {
					document = editor.document;

					expect( editor.commands.get( 'heading' ).value ).to.deep.equal( {
						id: 'bar',
						element: 'b',
						label: 'Bar'
					} );

					expect( document.schema.hasItem( 'foo' ) ).to.be.true;
					expect( document.schema.hasItem( 'bar' ) ).to.be.false;
				} );
			} );
		} );
	} );
} );
