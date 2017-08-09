/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BlockQuoteEngine from '../src/blockquoteengine';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ListEngine from '@ckeditor/ckeditor5-list/src/listengine';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import BlockQuoteCommand from '../src/blockquotecommand';

describe( 'BlockQuoteEngine', () => {
	let editor, doc;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ BlockQuoteEngine, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;

				doc = editor.document;
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'adds a blockQuote command', () => {
		expect( editor.commands.get( 'blockQuote' ) ).to.be.instanceOf( BlockQuoteCommand );
	} );

	it( 'allows for blockQuote in the $root', () => {
		expect( doc.schema.check( { name: 'blockQuote', inside: '$root' } ) ).to.be.true;
	} );

	it( 'allows for $block in blockQuote', () => {
		expect( doc.schema.check( { name: '$block', inside: 'blockQuote' } ) ).to.be.true;
		expect( doc.schema.check( { name: 'paragraph', inside: 'blockQuote' } ) ).to.be.true;
	} );

	it( 'adds converters to the data pipeline', () => {
		const data = '<blockquote><p>x</p></blockquote>';

		editor.setData( data );

		expect( getModelData( doc ) ).to.equal( '<blockQuote><paragraph>[]x</paragraph></blockQuote>' );
		expect( editor.getData() ).to.equal( data );
	} );

	it( 'adds a converter to the view pipeline', () => {
		setModelData( doc, '<blockQuote><paragraph>x</paragraph></blockQuote>' );

		expect( editor.getData() ).to.equal( '<blockquote><p>x</p></blockquote>' );
	} );

	it( 'allows list items inside blockQuote', () => {
		return VirtualTestEditor
			.create( {
				plugins: [ BlockQuoteEngine, Paragraph, ListEngine ]
			} )
			.then( editor => {
				editor.setData( '<blockquote><ul><li>xx</li></ul></blockquote>' );

				expect( editor.getData() ).to.equal( '<blockquote><ul><li>xx</li></ul></blockquote>' );
			} );
	} );
} );
