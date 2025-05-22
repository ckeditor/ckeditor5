/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import BlockQuoteEditing from '../src/blockquoteediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ListEditing from '@ckeditor/ckeditor5-list/src/list/listediting.js';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import BlockQuoteCommand from '../src/blockquotecommand.js';

describe( 'BlockQuoteEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ BlockQuoteEditing, Paragraph, BoldEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( BlockQuoteEditing.pluginName ).to.equal( 'BlockQuoteEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( BlockQuoteEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( BlockQuoteEditing.isPremiumPlugin ).to.be.false;
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

	it( 'allows for blockQuote in blockQuote', () => {
		expect( model.schema.checkChild( [ '$root', 'blockQuote' ], 'blockQuote' ) ).to.be.true;
	} );

	it( 'does not break when checking an unregisterd item', () => {
		expect( model.schema.checkChild( [ '$root', 'blockQuote' ], 'foo' ) ).to.be.false;
	} );

	it( 'inherits attributes from $container', () => {
		model.schema.extend( '$container', {
			allowAttributes: 'foo'
		} );

		expect( model.schema.checkAttribute( 'blockQuote', 'foo' ) ).to.be.true;
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

				expect( editor.getData( { skipListItemIds: true } ) ).to.equal( '<blockquote><ul><li>xx</li></ul></blockquote>' );

				return editor.destroy();
			} );
	} );

	it( 'should remove empty blockQuote elements', () => {
		setModelData( model, '<blockQuote></blockQuote><paragraph>Foo</paragraph>' );

		expect( editor.getData() ).to.equal( '<p>Foo</p>' );
	} );

	it( 'should remove blockQuotes which became empty', () => {
		setModelData( model, '<blockQuote><paragraph>Foo</paragraph></blockQuote>' );

		model.change( writer => {
			const root = model.document.getRoot();
			const bq = root.getChild( 0 );

			writer.remove( writer.createRangeIn( bq ) );
		} );

		expect( editor.getData( { trim: 'none' } ) ).to.equal( '<p>&nbsp;</p>' ); // Autoparagraphed.
	} );

	it( 'should not unwrap a blockQuote if it was inserted into another blockQuote', () => {
		setModelData( model, '<blockQuote><paragraph>Foo</paragraph></blockQuote>' );

		model.change( writer => {
			const root = model.document.getRoot();
			const bq = writer.createElement( 'blockQuote' );
			const p = writer.createElement( 'paragraph' );

			writer.insertText( 'Bar', p, 0 ); // <p>Bar</p>.
			writer.insert( p, bq, 0 ); // <blockquote><p>Bar</p></blockquote>.
			writer.insert( bq, root.getChild( 0 ), 1 ); // Insert after <p>Foo</p>.
		} );

		expect( editor.getData() ).to.equal( '<blockquote><p>Foo</p><blockquote><p>Bar</p></blockquote></blockquote>' );
	} );

	it( 'should not unwrap nested blockQuote if it was wrapped into another blockQuote', () => {
		setModelData( model, '<blockQuote><paragraph>Foo</paragraph></blockQuote><paragraph>Bar</paragraph>' );

		model.change( writer => {
			const root = model.document.getRoot();

			writer.wrap( writer.createRangeIn( root ), 'blockQuote' );
		} );

		expect( editor.getData() ).to.equal( '<blockquote><blockquote><p>Foo</p></blockquote><p>Bar</p></blockquote>' );
	} );

	it( 'postfixer should do nothing on attribute change', () => {
		// This is strictly a 100% CC test.
		setModelData( model, '<blockQuote><paragraph>Foo</paragraph></blockQuote>' );

		model.change( writer => {
			const root = model.document.getRoot();
			const p = root.getChild( 0 ).getChild( 0 );

			writer.setAttribute( 'bold', true, writer.createRangeIn( p ) );
		} );

		expect( editor.getData() ).to.equal( '<blockquote><p><strong>Foo</strong></p></blockquote>' );
	} );

	describe( 'nested blockQuote forbidden by custom rule', () => {
		// Nested block quotes are supported since https://github.com/ckeditor/ckeditor5/issues/9210, so let's check
		// if the editor will not blow up in case nested block quotes are forbidden by custom scheme rule.
		beforeEach( () => {
			model.schema.addChildCheck( ( ctx, childDef ) => {
				if ( ctx.endsWith( 'blockQuote' ) && childDef.name == 'blockQuote' ) {
					return false;
				}
			} );
		} );

		it( 'should unwrap a blockQuote if it was inserted into another blockQuote', () => {
			setModelData( model, '<blockQuote><paragraph>Foo</paragraph></blockQuote>' );

			model.change( writer => {
				const root = model.document.getRoot();
				const bq = writer.createElement( 'blockQuote' );
				const p = writer.createElement( 'paragraph' );

				writer.insertText( 'Bar', p, 0 ); // <p>Bar</p>.
				writer.insert( p, bq, 0 ); // <blockquote><p>Bar</p></blockquote>.
				writer.insert( bq, root.getChild( 0 ), 1 ); // Insert after <p>Foo</p>.
			} );

			expect( editor.getData() ).to.equal( '<blockquote><p>Foo</p><p>Bar</p></blockquote>' );
		} );

		it( 'should unwrap nested blockQuote if it was wrapped into another blockQuote', () => {
			setModelData( model, '<blockQuote><paragraph>Foo</paragraph></blockQuote><paragraph>Bar</paragraph>' );

			model.change( writer => {
				const root = model.document.getRoot();

				writer.wrap( writer.createRangeIn( root ), 'blockQuote' );
			} );

			expect( editor.getData() ).to.equal( '<blockquote><p>Foo</p><p>Bar</p></blockquote>' );
		} );
	} );
} );
