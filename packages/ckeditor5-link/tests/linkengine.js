/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import LinkEngine from '../src/linkengine';
import LinkCommand from '../src/linkcommand';
import LinkElement from '../src/linkelement';
import UnlinkCommand from '../src/unlinkcommand';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';

describe( 'LinkEngine', () => {
	let editor, doc;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, LinkEngine ]
			} )
			.then( newEditor => {
				editor = newEditor;

				doc = editor.document;
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( LinkEngine ) ).to.be.instanceOf( LinkEngine );
	} );

	it( 'should set proper schema rules', () => {
		expect( doc.schema.check( { name: '$inline', attributes: 'linkHref', inside: '$root' } ) ).to.be.false;
		expect( doc.schema.check( { name: '$inline', attributes: 'linkHref', inside: '$block' } ) ).to.be.true;
		expect( doc.schema.check( { name: '$inline', attributes: 'linkHref', inside: '$clipboardHolder' } ) ).to.be.true;
	} );

	describe( 'command', () => {
		it( 'should register link command', () => {
			const command = editor.commands.get( 'link' );

			expect( command ).to.be.instanceOf( LinkCommand );
		} );

		it( 'should register unlink command', () => {
			const command = editor.commands.get( 'unlink' );

			expect( command ).to.be.instanceOf( UnlinkCommand );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert `<a href="url">` to `linkHref="url"` attribute', () => {
			editor.setData( '<p><a href="url">foo</a>bar</p>' );

			expect( getModelData( doc, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text linkHref="url">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><a href="url">foo</a>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			// Incorrect results because autoparagraphing works incorrectly (issue in paragraph).
			// https://github.com/ckeditor/ckeditor5-paragraph/issues/10

			editor.setData( '<a href="url">foo</a>bar' );

			expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( '<paragraph>foobar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foobar</p>' );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/500
		it( 'should not pick up `<a name="foo">`', () => {
			editor.setData( '<p><a name="foo">foo</a>bar</p>' );

			expect( getModelData( doc, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foobar</paragraph>' );
		} );

		// CKEditor 4 does. And CKEditor 5's balloon allows creating such links.
		it( 'should pick up `<a href="">`', () => {
			editor.setData( '<p><a href="">foo</a>bar</p>' );

			expect( getModelData( doc, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text linkHref="">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><a href="">foo</a>bar</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( doc, '<paragraph><$text linkHref="url">foo</$text>bar</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p><a href="url">foo</a>bar</p>' );
		} );

		it( 'should convert to `LinkElement` instance', () => {
			setModelData( doc, '<paragraph><$text linkHref="url">foo</$text>bar</paragraph>' );

			expect( editor.editing.view.getRoot().getChild( 0 ).getChild( 0 ) ).to.be.instanceof( LinkElement );
		} );

		// https://github.com/ckeditor/ckeditor5-link/issues/121
		it( 'should should set priority for `linkHref` higher than all other attribute elements', () => {
			editor.document.schema.allow( { name: '$inline', attributes: [ 'foo' ], inside: '$block' } );

			buildModelConverter().for( editor.data.modelToView )
				.fromAttribute( 'foo' )
				.toElement( 'f' );

			setModelData( doc,
				'<paragraph>' +
					'<$text linkHref="url">a</$text><$text foo="true" linkHref="url">b</$text><$text linkHref="url">c</$text>' +
				'</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><a href="url">a<f>b</f>c</a></p>' );
		} );
	} );
} );
