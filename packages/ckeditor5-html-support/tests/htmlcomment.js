
/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import HtmlComment from '../src/htmlcomment';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';

describe( 'HtmlComment', () => {
	let model, root, editor, htmlCommentPlugin;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ HtmlComment, Paragraph ]
		} );

		model = editor.model;
		root = model.document.getRoot();

		model.schema.register( 'div' );
		model.schema.extend( '$block', { allowIn: 'div' } );
		model.schema.extend( 'div', { allowIn: '$root' } );
		model.schema.extend( 'div', { allowIn: 'div' } );

		editor.conversion.elementToElement( { model: 'div', view: 'div' } );

		htmlCommentPlugin = editor.plugins.get( HtmlComment );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loadable using its plugin name', () => {
		expect( editor.plugins.get( 'HtmlComment' ) ).to.be.instanceOf( HtmlComment );
	} );

	describe( 'upcast conversion', () => {
		it( 'should convert each comment node to a collapsed marker', () => {
			editor.setData( '<p><!-- comment 1 -->Foo<!-- comment 2 --></p>' );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( commentMarkers ).to.have.length( 2 );

			expect( commentMarkers[ 0 ].getStart().path ).to.deep.equal( [ 0, 0 ] );
			expect( commentMarkers[ 0 ].getEnd().path ).to.deep.equal( [ 0, 0 ] );

			expect( commentMarkers[ 1 ].getStart().path ).to.deep.equal( [ 0, 3 ] );
			expect( commentMarkers[ 1 ].getEnd().path ).to.deep.equal( [ 0, 3 ] );
		} );

		it( 'should convert each comment node located at root\'s boundary to a collapsed marker', () => {
			editor.setData( '<!-- comment 1 --><p>Foo</p><!-- comment 2 -->' );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( commentMarkers ).to.have.length( 2 );

			expect( commentMarkers[ 0 ].getStart().path ).to.deep.equal( [ 0 ] );
			expect( commentMarkers[ 0 ].getEnd().path ).to.deep.equal( [ 0 ] );

			expect( commentMarkers[ 1 ].getStart().path ).to.deep.equal( [ 1 ] );
			expect( commentMarkers[ 1 ].getEnd().path ).to.deep.equal( [ 1 ] );
		} );

		it( 'should convert each comment node from a nested tree to a collapsed marker', () => {
			editor.setData( '<div><div><div><p><!-- comment 1 -->Foo<!-- comment 2 --></p></div></div></div>' );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( commentMarkers ).to.have.length( 2 );

			expect( commentMarkers[ 0 ].getStart().path ).to.deep.equal( [ 0, 0, 0, 0, 0 ] );
			expect( commentMarkers[ 0 ].getEnd().path ).to.deep.equal( [ 0, 0, 0, 0, 0 ] );

			expect( commentMarkers[ 1 ].getStart().path ).to.deep.equal( [ 0, 0, 0, 0, 3 ] );
			expect( commentMarkers[ 1 ].getEnd().path ).to.deep.equal( [ 0, 0, 0, 0, 3 ] );
		} );

		it( 'should set a root attribute containing comment\'s content for each marker', () => {
			editor.setData( '<p><!-- comment 1 -->Foo<!-- comment 2 --></p>' );

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			expect( rootAttributes ).to.have.length( 2 );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( root.getAttribute( commentMarkers[ 0 ].name ) ).to.equal( ' comment 1 ' );
			expect( root.getAttribute( commentMarkers[ 1 ].name ) ).to.equal( ' comment 2 ' );
		} );

		it( 'should set a root attribute containing comment\'s content for each marker located in a nested tree', () => {
			editor.setData( '<div><div><div><p><!-- comment 1 -->Foo<!-- comment 2 --></p></div></div></div>' );

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			expect( rootAttributes ).to.have.length( 2 );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( root.getAttribute( commentMarkers[ 0 ].name ) ).to.equal( ' comment 1 ' );
			expect( root.getAttribute( commentMarkers[ 1 ].name ) ).to.equal( ' comment 2 ' );
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

			addMarker( '$comment:1', paragraph, 1 );
			root._setAttribute( '$comment:1', ' comment 1 ' );

			addMarker( '$comment:2', paragraph, 2 );
			root._setAttribute( '$comment:2', ' comment 2 ' );

			expect( editor.getData() ).to.equal( '<p>F<!-- comment 1 -->o<!-- comment 2 -->o</p>' );
		} );

		it( 'should convert each $comment marker located at root\'s boundary to a comment node', () => {
			editor.setData( '<p>Foo</p>' );

			addMarker( '$comment:1', root, 0 );
			root._setAttribute( '$comment:1', ' comment 1 ' );

			addMarker( '$comment:2', root, 1 );
			root._setAttribute( '$comment:2', ' comment 2 ' );

			expect( editor.getData() ).to.equal( '<!-- comment 1 --><p>Foo</p><!-- comment 2 -->' );
		} );

		it( 'should convert each $comment marker to a comment node inside a nested tree', () => {
			editor.setData( '<div><div><div><p>Foo</p></div></div></div>' );

			const paragraph = root.getNodeByPath( [ 0, 0, 0, 0 ] );

			addMarker( '$comment:1', paragraph, 1 );
			root._setAttribute( '$comment:1', ' comment 1 ' );

			addMarker( '$comment:2', paragraph, 2 );
			root._setAttribute( '$comment:2', ' comment 2 ' );

			expect( editor.getData() ).to.equal( '<div><div><div><p>F<!-- comment 1 -->o<!-- comment 2 -->o</p></div></div></div>' );
		} );
	} );

	describe( 'marker removal post fixer', () => {
		it( 'should remove all non-boundary comment markers and their root attributes when the whole content is removed', () => {
			editor.setData( '<p><!-- comment 1 -->Foo<!-- comment 2 --></p>' );

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
			} );

			expect( editor.getData( { trim: false } ) ).to.equal( '<p>&nbsp;</p>' );

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			expect( rootAttributes ).to.have.length( 0 );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( commentMarkers ).to.have.length( 0 );
		} );

		// Currently, this test fails. Removing all content from the editor does not remove markers located at root's boundary.
		// Since the markers survive, so do comments and their root attributes.
		// See https://github.com/ckeditor/ckeditor5/issues/10117.
		it.skip( 'should remove all boundary comment markers and their root attributes when the whole content is removed', () => {
			editor.setData( '<!-- comment 1 --><p>Foo</p><!-- comment 2 -->' );

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
			} );

			// Currently, the returned data is: <p>&nbsp;</p><!-- comment 2 --><!-- comment 1 -->
			expect( editor.getData( { trim: false } ) ).to.equal( '<p>&nbsp;</p>' );

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			// Currently, there are 2 root attributes associated with markers.
			expect( rootAttributes ).to.have.length( 0 );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			// Currently, there are 2 markers associated with comment nodes.
			expect( commentMarkers ).to.have.length( 0 );
		} );

		it( 'should remove comment markers and their corresponding root attributes when the content including comments is removed', () => {
			editor.setData( '<p><!-- comment 1 -->Foo<!-- comment 2 --></p><p><!-- comment 3 -->Foo<!-- comment 4 --></p>' );

			model.change( writer => {
				const firstParagraph = root.getChild( 0 );

				writer.remove( writer.createRangeOn( firstParagraph ) );
			} );

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			expect( rootAttributes ).to.have.length( 2 );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( commentMarkers ).to.have.length( 2 );

			expect( root.getAttribute( commentMarkers[ 0 ].name ) ).to.equal( ' comment 3 ' );
			expect( root.getAttribute( commentMarkers[ 1 ].name ) ).to.equal( ' comment 4 ' );
		} );
	} );

	describe( 'createHtmlComment()', () => {
		it( 'should create an HTML comment between elements', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 1 ), 'first' );

			expect( editor.getData() ).to.equal( '<p>Foo</p><!--first--><p>Bar</p><p>Baz</p>' );

			htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 2 ), 'second' );

			expect( editor.getData() ).to.equal( '<p>Foo</p><!--first--><p>Bar</p><!--second--><p>Baz</p>' );
		} );

		it( 'should return a comment ID of the comment', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			const firstCommentID = htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 1 ), 'foo' );

			const secondCommentID = htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 1 ), 'bar' );

			expect( firstCommentID ).to.be.a( 'string' );
			expect( secondCommentID ).to.be.a( 'string' );

			expect( firstCommentID ).to.not.equal( secondCommentID );
		} );

		it( 'should allow creating an HTML comment inside the text', () => {
			editor.setData( '<p>Foo</p>' );

			htmlCommentPlugin.createHtmlComment( model.createPositionFromPath( root, [ 0, 1 ] ), 'foo' );

			expect( editor.getData() ).to.equal( '<p>F<!--foo-->oo</p>' );
		} );

		it( 'should allow creating a few HTML comments in the same place', () => {
			editor.setData( '<p>Foo</p>' );

			const position = model.createPositionFromPath( root, [ 0, 1 ] );

			htmlCommentPlugin.createHtmlComment( position, 'foo' );
			htmlCommentPlugin.createHtmlComment( position, 'bar' );

			expect( editor.getData() ).to.equal( '<p>F<!--bar--><!--foo-->oo</p>' );
		} );

		it( 'should allow creating an HTML comment before the first element', () => {
			editor.setData( '<p>Foo</p>' );

			htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 0 ), 'foo' );

			expect( editor.getData() ).to.equal( '<!--foo--><p>Foo</p>' );
		} );

		it( 'should allow creating an HTML comment after the last element', () => {
			editor.setData( '<p>Foo</p>' );

			htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 1 ), 'foo' );

			expect( editor.getData() ).to.equal( '<p>Foo</p><!--foo-->' );
		} );
	} );

	describe( 'removeHtmlComment()', () => {
		it( 'should remove a comment and return true if the comment with the given comment ID exists', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			const firstCommentID = htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 1 ), 'foo' );
			const secondCommentID = htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 1 ), 'bar' );

			const result1 = htmlCommentPlugin.removeHtmlComment( firstCommentID );

			expect( editor.getData() ).to.equal( '<p>Foo</p><!--bar--><p>Bar</p><p>Baz</p>' );

			const result2 = htmlCommentPlugin.removeHtmlComment( secondCommentID );

			expect( editor.getData() ).to.equal( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			expect( result1 ).to.equal( true );
			expect( result2 ).to.equal( true );
		} );

		// Note that the comment could have been removed via the content changes.
		it( 'should do nothing and return `false` if a comment with the given comment ID does not exist', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 1 ), 'bar' );

			const result = htmlCommentPlugin.removeHtmlComment( 'invalid-comment-id' );

			expect( editor.getData() ).to.equal( '<p>Foo</p><!--bar--><p>Bar</p><p>Baz</p>' );

			expect( result ).to.equal( false );
		} );
	} );

	describe( 'getHtmlCommentsInRange()', () => {
		it( 'should return all comment marker IDs present in the specified range', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			htmlCommentPlugin.createHtmlComment(
				model.createPositionFromPath( root, [ 1, 0 ] ),
				'foo'
			);

			htmlCommentPlugin.createHtmlComment(
				model.createPositionFromPath( root, [ 2 ] ),
				'bar'
			);

			const id3 = htmlCommentPlugin.createHtmlComment(
				model.createPositionFromPath( root, [ 2, 1 ] ),
				'foo'
			);

			const id4 = htmlCommentPlugin.createHtmlComment(
				model.createPositionFromPath( root, [ 2, 3 ] ),
				'foo'
			);

			const range = model.createRangeIn( root.getChild( 2 ) );

			expect( htmlCommentPlugin.getHtmlCommentsInRange( range ) ).to.deep.equal( [ id3, id4 ] );
		} );

		it( 'should return all comment marker IDs present in the specified range including comments at range boundaries', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			htmlCommentPlugin.createHtmlComment( model.createPositionFromPath( root, [ 1, 0 ] ), 'foo' );

			htmlCommentPlugin.createHtmlComment( model.createPositionFromPath( root, [ 2 ] ), 'bar' );

			const posStart = model.createPositionFromPath( root, [ 2, 1 ] );
			const posEnd = model.createPositionFromPath( root, [ 2, 3 ] );

			const id3 = htmlCommentPlugin.createHtmlComment( posStart, 'baz' );
			const id4 = htmlCommentPlugin.createHtmlComment( posEnd, 'biz' );

			const range = new Range( posStart, posEnd );

			expect( htmlCommentPlugin.getHtmlCommentsInRange( range ) ).to.deep.equal( [ id3, id4 ] );
		} );

		it( 'should return all comment marker IDs present in the specified collapsed range', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			htmlCommentPlugin.createHtmlComment( model.createPositionFromPath( root, [ 2, 0 ] ), 'foo' );

			htmlCommentPlugin.createHtmlComment( model.createPositionFromPath( root, [ 2, 2 ] ), 'bar' );

			const position = model.createPositionFromPath( root, [ 2, 1 ] );

			const id1 = htmlCommentPlugin.createHtmlComment( position, 'baz' );
			const id2 = htmlCommentPlugin.createHtmlComment( position, 'biz' );

			const range = new Range( position, position );

			expect( htmlCommentPlugin.getHtmlCommentsInRange( range ) ).to.deep.equal( [ id1, id2 ] );
		} );
	} );

	describe( 'getHtmlCommentData()', () => {
		it( 'should return a position and the content for the given comment', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			const id1 = htmlCommentPlugin.createHtmlComment( model.createPositionFromPath( root, [ 0 ] ), 'foo' );
			const id2 = htmlCommentPlugin.createHtmlComment( model.createPositionFromPath( root, [ 2, 2 ] ), 'bar' );

			const commentData1 = htmlCommentPlugin.getHtmlCommentData( id1 );
			const commentData2 = htmlCommentPlugin.getHtmlCommentData( id2 );

			expect( commentData1 ).to.be.an( 'object' );
			expect( commentData1.position.isEqual( model.createPositionFromPath( root, [ 0 ] ) ) ).to.be.true;
			expect( commentData1.content ).to.equal( 'foo' );

			expect( commentData2 ).to.be.an( 'object' );
			expect( commentData2.position.isEqual( model.createPositionFromPath( root, [ 2, 2 ] ) ) ).to.be.true;
			expect( commentData2.content ).to.equal( 'bar' );
		} );

		it( 'should return null if the given comment does not exist', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			expect( htmlCommentPlugin.getHtmlCommentData( 'invalid-id' ) ).to.be.null;
		} );
	} );

	function addMarker( name, element, offset ) {
		model.change( writer => {
			writer.addMarker( name, {
				usingOperation: true,
				affectsData: true,
				range: writer.createRange(
					writer.createPositionAt( element, offset )
				)
			} );
		} );
	}
} );
