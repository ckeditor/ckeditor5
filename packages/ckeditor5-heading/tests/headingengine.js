/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import HeadingEngine from '../src/headingengine';
import HeadingCommand from '../src/headingcommand';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ParagraphCommand from '@ckeditor/ckeditor5-paragraph/src/paragraphcommand';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'HeadingEngine', () => {
	let editor, document;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ HeadingEngine ]
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

	it( 'should register #commands', () => {
		expect( editor.commands.get( 'paragraph' ) ).to.be.instanceOf( ParagraphCommand );
		expect( editor.commands.get( 'heading1' ) ).to.be.instanceOf( HeadingCommand );
		expect( editor.commands.get( 'heading2' ) ).to.be.instanceOf( HeadingCommand );
		expect( editor.commands.get( 'heading3' ) ).to.be.instanceOf( HeadingCommand );
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

	it( 'should not blow up if there\'s no enter command in the editor', () => {
		return VirtualTestEditor
			.create( {
				plugins: [ HeadingEngine ]
			} );
	} );

	describe( 'config', () => {
		describe( 'options', () => {
			describe( 'default value', () => {
				it( 'should be set', () => {
					expect( editor.config.get( 'heading.options' ) ).to.deep.equal( [
						{ modelElement: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
						{ modelElement: 'heading1', viewElement: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
						{ modelElement: 'heading2', viewElement: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
						{ modelElement: 'heading3', viewElement: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' }
					] );
				} );
			} );

			it( 'should customize options', () => {
				const options = [
					{ modelElement: 'paragraph', title: 'Paragraph' },
					{ modelElement: 'h4', viewElement: 'h4', title: 'H4' }
				];

				return VirtualTestEditor
					.create( {
						plugins: [ HeadingEngine ],
						heading: {
							options
						}
					} )
					.then( editor => {
						document = editor.document;

						expect( editor.commands.get( 'h4' ) ).to.be.instanceOf( HeadingCommand );
						expect( editor.commands.get( 'paragraph' ) ).to.be.instanceOf( ParagraphCommand );

						expect( document.schema.hasItem( 'paragraph' ) ).to.be.true;
						expect( document.schema.hasItem( 'h4' ) ).to.be.true;

						expect( document.schema.hasItem( 'heading1' ) ).to.be.false;
						expect( document.schema.hasItem( 'heading2' ) ).to.be.false;
						expect( document.schema.hasItem( 'heading3' ) ).to.be.false;
					} );
			} );
		} );
	} );
} );
