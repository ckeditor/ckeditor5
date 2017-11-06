/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import HighlightEditing from './../src/highlightediting';
import HighlightCommand from './../src/highlightcommand';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'HighlightEditing', () => {
	let editor, doc;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ HighlightEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;

				doc = editor.document;
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'adds highlight commands', () => {
		expect( editor.commands.get( 'highlight' ) ).to.be.instanceOf( HighlightCommand );
	} );

	it.skip( 'allows for highlight in $blocks', () => {
		expect( doc.schema.check( { name: '$text', inside: '$root', attributes: 'highlight' } ) ).to.be.true;
	} );

	describe.skip( 'integration', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ HighlightEditing, Paragraph ]
				} )
				.then( newEditor => {
					editor = newEditor;

					doc = editor.document;
				} );
		} );

		it( 'is allowed inside paragraph', () => {
			expect( doc.schema.check( { name: 'paragraph', attributes: 'highlight' } ) ).to.be.true;
		} );
	} );

	describe.skip( 'highlight', () => {
		it( 'adds converters to the data pipeline', () => {
			const data = '<p>f<mark>o</mark>o</p>';

			editor.setData( data );

			expect( getModelData( doc ) ).to.equal( '<paragraph>f<$text highlight="">o</$text>o</paragraph>' );
			expect( editor.getData() ).to.equal( '<p>x</p>' );
		} );

		it( 'adds a converter to the view pipeline for removing attribute', () => {
			setModelData( doc, '<paragraph>f<$text highlight="">o</$text>o</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>f<mark>o</mark>o</p>' );

			const command = editor.commands.get( 'highlight' );

			command.execute();

			expect( editor.getData() ).to.equal( '<p>x</p>' );
		} );
	} );

	describe.skip( 'config', () => {
		describe( 'styles', () => {
			describe( 'default value', () => {
				it( 'should be set', () => {
					expect( editor.config.get( 'highlight.styles' ) ).to.deep.equal( {} );
				} );
			} );
		} );
	} );
} );
