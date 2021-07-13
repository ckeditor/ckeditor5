/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import HtmlComment from '../src/htmlcomment';

describe( 'HtmlComment', () => {
	let editor, model, root;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ HtmlComment, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				root = model.document.getRoot();

				model.schema.register( 'div' );
				model.schema.extend( '$block', { allowIn: 'div' } );
				model.schema.extend( 'div', { allowIn: '$root' } );
				model.schema.extend( 'div', { allowIn: 'div' } );

				editor.conversion.elementToElement( { model: 'div', view: 'div' } );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( HtmlComment.pluginName ).to.equal( 'HtmlComment' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( HtmlComment ) ).to.be.instanceOf( HtmlComment );
	} );

	describe( 'upcast conversion', () => {
		it( 'should convert each comment node to a collapsed marker', () => {
			editor.setData( '<p><!-- comment 1 -->Foo<!-- comment 2 --></p>' );

			const markers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( markers ).to.have.length( 2 );

			expect( markers[ 0 ].getStart().path ).to.deep.equal( [ 0, 0 ] );
			expect( markers[ 0 ].getEnd().path ).to.deep.equal( [ 0, 0 ] );

			expect( markers[ 1 ].getStart().path ).to.deep.equal( [ 0, 3 ] );
			expect( markers[ 1 ].getEnd().path ).to.deep.equal( [ 0, 3 ] );
		} );

		it( 'should convert each comment node from a nested tree to a collapsed marker', () => {
			editor.setData( '<div><div><div><p><!-- comment 1 -->Foo<!-- comment 2 --></p></div></div></div>' );

			const markers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( markers ).to.have.length( 2 );

			expect( markers[ 0 ].getStart().path ).to.deep.equal( [ 0, 0, 0, 0, 0 ] );
			expect( markers[ 0 ].getEnd().path ).to.deep.equal( [ 0, 0, 0, 0, 0 ] );

			expect( markers[ 1 ].getStart().path ).to.deep.equal( [ 0, 0, 0, 0, 3 ] );
			expect( markers[ 1 ].getEnd().path ).to.deep.equal( [ 0, 0, 0, 0, 3 ] );
		} );

		it( 'should set a $root attribute containing comment\'s content for each marker', () => {
			editor.setData( '<p><!-- comment 1 -->Foo<!-- comment 2 --></p>' );

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			expect( rootAttributes ).to.have.length( 2 );

			const markers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( root.getAttribute( markers[ 0 ].name ) ).to.equal( ' comment 1 ' );
			expect( root.getAttribute( markers[ 1 ].name ) ).to.equal( ' comment 2 ' );
		} );

		it( 'should set a $root attribute containing comment\'s content for each marker located in a nested tree', () => {
			editor.setData( '<div><div><div><p><!-- comment 1 -->Foo<!-- comment 2 --></p></div></div></div>' );

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			expect( rootAttributes ).to.have.length( 2 );

			const markers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( root.getAttribute( markers[ 0 ].name ) ).to.equal( ' comment 1 ' );
			expect( root.getAttribute( markers[ 1 ].name ) ).to.equal( ' comment 2 ' );
		} );

		it( 'should not create a dedicated model element for a comment node', () => {
			editor.setData( '<p><!-- comment 1 -->Foo<!-- comment 2 --></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>Foo</paragraph>' );
		} );
	} );

	describe( 'data downcast conversion', () => {
		it( 'should convert each $comment marker to a comment node', () => {
			editor.setData( '<p>Foo</p>' );

			const paragraph = root.getChild( 0 );

			addMarker( '$comment:1', ' comment 1 ', paragraph, 1 );
			addMarker( '$comment:2', ' comment 2 ', paragraph, 2 );

			expect( editor.getData() ).to.equal( '<p>F<!-- comment 1 -->o<!-- comment 2 -->o</p>' );
		} );

		it( 'should convert each $comment marker to a comment node inside a nested tree', () => {
			editor.setData( '<div><div><div><p>Foo</p></div></div></div>' );

			const paragraph = root.getNodeByPath( [ 0, 0, 0, 0 ] );

			addMarker( '$comment:1', ' comment 1 ', paragraph, 1 );
			addMarker( '$comment:2', ' comment 2 ', paragraph, 2 );

			expect( editor.getData() ).to.equal( '<div><div><div><p>F<!-- comment 1 -->o<!-- comment 2 -->o</p></div></div></div>' );
		} );
	} );

	describe( 'marker removal post fixer', () => {
		it( 'should remove all markers and corresponding $root attributes', () => {
			editor.setData( '<p><!-- comment 1 -->Foo<!-- comment 2 --></p>' );

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
			} );

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			expect( rootAttributes ).to.have.length( 0 );

			const markers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( markers ).to.have.length( 0 );
		} );

		it( 'should remove markers and corresponding $root attributes representing removed comments only', () => {
			editor.setData( '<p><!-- comment 1 -->Foo<!-- comment 2 --></p><p><!-- comment 3 -->Foo<!-- comment 4 --></p>' );

			model.change( writer => {
				const firstParagraph = root.getChild( 0 );

				writer.remove( writer.createRangeOn( firstParagraph ) );
			} );

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			expect( rootAttributes ).to.have.length( 2 );

			const markers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( markers ).to.have.length( 2 );

			expect( root.getAttribute( markers[ 0 ].name ) ).to.equal( ' comment 3 ' );
			expect( root.getAttribute( markers[ 1 ].name ) ).to.equal( ' comment 4 ' );
		} );
	} );

	function addMarker( name, content, element, offset ) {
		model.change( writer => {
			writer.addMarker( name, {
				usingOperation: true,
				affectsData: true,
				range: writer.createRange(
					writer.createPositionAt( element, offset )
				)
			} );

			writer.setAttribute( name, content, root );
		} );
	}
} );
