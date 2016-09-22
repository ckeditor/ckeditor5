/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import LinkEngine from '/ckeditor5/link/linkengine.js';
import LinkCommand from '/ckeditor5/link/linkcommand.js';
import LinkElement from '/ckeditor5/link/linkelement.js';
import UnlinkCommand from '/ckeditor5/link/unlinkcommand.js';
import VirtualTestEditor from '/tests/core/_utils/virtualtesteditor.js';
import { getData as getModelData, setData as setModelData } from '/ckeditor5/engine/dev-utils/model.js';
import { getData as getViewData } from '/ckeditor5/engine/dev-utils/view.js';

describe( 'LinkEngine', () => {
	let editor, doc;

	beforeEach( () => {
		return VirtualTestEditor.create( {
				features: [ LinkEngine ]
			} )
			.then( newEditor => {
				editor = newEditor;

				doc = editor.document;

				doc.schema.allow( { name: '$text', inside: '$root' } );
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( LinkEngine ) ).to.be.instanceOf( LinkEngine );
	} );

	it( 'should set proper schema rules', () => {
		expect( doc.schema.check( { name: '$inline', attributes: [ 'linkHref' ] } ) ).to.be.true;
	} );

	describe( 'command', () => {
		it( 'should register link command', () => {
			expect( editor.commands.has( 'link' ) ).to.be.true;

			const command = editor.commands.get( 'link' );

			expect( command ).to.be.instanceOf( LinkCommand );
		} );

		it( 'should register unlink command', () => {
			expect( editor.commands.has( 'unlink' ) ).to.be.true;

			const command = editor.commands.get( 'unlink' );

			expect( command ).to.be.instanceOf( UnlinkCommand );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert `<a href="url">` to `linkHref="url"` attribute', () => {
			editor.setData( '<a href="url">foo</a>bar' );

			expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( '<$text linkHref="url">foo</$text>bar' );
			expect( editor.getData() ).to.equal( '<a href="url">foo</a>bar' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( doc, '<$text linkHref="url">foo</$text>bar' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<a href="url">foo</a>bar' );
		} );

		it( 'should convert to `LinkElement` instance', () => {
			setModelData( doc, '<$text linkHref="url">foo</$text>bar' );

			expect( editor.editing.view.getRoot().getChild( 0 ) ).to.be.instanceof( LinkElement );
		} );
	} );
} );
