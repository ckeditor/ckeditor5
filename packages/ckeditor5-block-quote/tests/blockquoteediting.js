/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BlockQuoteEditing from '../src/blockquoteediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ListEditing from '@ckeditor/ckeditor5-list/src/listediting';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import BlockQuoteCommand from '../src/blockquotecommand';

describe( 'BlockQuoteEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ BlockQuoteEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'adds a blockQuote command', () => {
		expect( editor.commands.get( 'blockQuote' ) ).to.be.instanceOf( BlockQuoteCommand );
	} );

	it( 'allows for blockQuote in the $root', () => {
		expect( model.schema.checkChild( [ '$root' ], 'blockQuote' ) ).to.be.true;
	} );

	it( 'allows for $block in blockQuote', () => {
		expect( model.schema.checkChild( [ '$root', 'blockQuote' ], '$block' ) ).to.be.true;
		expect( model.schema.checkChild( [ '$root', 'blockQuote' ], 'paragraph' ) ).to.be.true;
	} );

	it( 'does not allow for blockQuote in blockQuote', () => {
		expect( model.schema.checkChild( [ '$root', 'blockQuote' ], 'blockQuote' ) ).to.be.false;
	} );

	it( 'does not break when checking an unregisterd item', () => {
		expect( model.schema.checkChild( [ '$root', 'blockQuote' ], 'foo' ) ).to.be.false;
	} );

	it( 'adds converters to the data pipeline', () => {
		const data = '<blockquote><p>x</p></blockquote>';

		editor.setData( data );

		expect( getModelData( model ) ).to.equal( '<blockQuote><paragraph>[]x</paragraph></blockQuote>' );
		expect( editor.getData() ).to.equal( data );
	} );

	it( 'adds a converter to the view pipeline', () => {
		setModelData( model, '<blockQuote><paragraph>x</paragraph></blockQuote>' );

		expect( editor.getData() ).to.equal( '<blockquote><p>x</p></blockquote>' );
	} );

	it( 'allows list items inside blockQuote', () => {
		return VirtualTestEditor
			.create( {
				plugins: [ BlockQuoteEditing, Paragraph, ListEditing ]
			} )
			.then( editor => {
				editor.setData( '<blockquote><ul><li>xx</li></ul></blockquote>' );

				expect( editor.getData() ).to.equal( '<blockquote><ul><li>xx</li></ul></blockquote>' );
			} );
	} );
} );
