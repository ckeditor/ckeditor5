/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _getModelData, ModelRange } from '@ckeditor/ckeditor5-engine';
import { HtmlComment } from '../src/htmlcomment.js';

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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( HtmlComment.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( HtmlComment.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loadable using its plugin name', () => {
		expect( editor.plugins.get( 'HtmlComment' ) ).toBeInstanceOf( HtmlComment );
	} );

	describe( 'schema', () => {
		it( 'should allow root attributes containing comment\'s content in the schema', () => {
			editor.setData( '<p><!-- comment 1 -->Foo<!-- comment 2 --></p>' );

			model.change( writer => {
				model.schema.removeDisallowedAttributes( [ root ], writer );

				expect( editor.getData() ).toBe( '<p><!-- comment 1 -->Foo<!-- comment 2 --></p>' );
			} );
		} );

		it( 'should declare the $comment attribute on $root so custom roots inheriting its attributes pick it up', () => {
			model.schema.register( 'myRoot', {
				inheritAllFrom: '$root'
			} );

			expect( model.schema.checkAttribute( [ 'myRoot' ], '$comment' ) ).toBe( true );
			expect( model.schema.checkAttribute( [ 'myRoot' ], '$comment:abc123' ) ).toBe( true );
		} );

		it( 'should allow the per-comment attribute on a custom root that only opts into $root attributes', () => {
			model.schema.register( 'myAttrRoot', {
				allowAttributesOf: '$root'
			} );

			expect( model.schema.checkAttribute( [ 'myAttrRoot' ], '$comment' ) ).toBe( true );
			expect( model.schema.checkAttribute( [ 'myAttrRoot' ], '$comment:abc123' ) ).toBe( true );
		} );

		it( 'should not allow the $comment attribute on a root that does not opt into $root attributes', () => {
			model.schema.register( 'isolatedRoot', {
				isLimit: true
			} );

			expect( model.schema.checkAttribute( [ 'isolatedRoot' ], '$comment' ) ).toBe( false );
			expect( model.schema.checkAttribute( [ 'isolatedRoot' ], '$comment:abc123' ) ).toBe( false );
		} );
	} );

	describe( '$inlineRoot editor', () => {
		let inlineEditor, inlineRoot;

		beforeEach( async () => {
			inlineEditor = await VirtualTestEditor.create( {
				plugins: [ HtmlComment ],
				root: { modelElement: '$inlineRoot' }
			} );

			inlineRoot = inlineEditor.model.document.getRoot();
		} );

		afterEach( () => {
			return inlineEditor.destroy();
		} );

		it( 'should preserve HTML comments around inline text through a setData/getData round trip', () => {
			inlineEditor.setData( '<!-- start -->Foo<!-- middle -->Bar<!-- end -->' );

			expect( inlineEditor.getData() ).toBe( '<!-- start -->Foo<!-- middle -->Bar<!-- end -->' );
		} );

		it( 'should store each HTML comment content as a $comment:<uid> attribute on the $inlineRoot', () => {
			inlineEditor.setData( '<!-- alpha -->Foo<!-- beta -->' );

			const commentAttributes = [ ...inlineRoot.getAttributeKeys() ]
				.filter( attr => attr.startsWith( '$comment:' ) )
				.map( attr => inlineRoot.getAttribute( attr ) );

			expect( commentAttributes ).toHaveLength( 2 );
			expect( commentAttributes ).toEqual( expect.arrayContaining( [ ' alpha ', ' beta ' ] ) );
		} );

		it( 'should create a $comment marker for each HTML comment upcast inside the $inlineRoot', () => {
			inlineEditor.setData( 'Foo<!-- inline -->Bar' );

			const commentMarkers = [ ...inlineEditor.model.markers ].filter( marker => marker.name.startsWith( '$comment:' ) );

			expect( commentMarkers ).toHaveLength( 1 );
			expect( commentMarkers[ 0 ].getStart().root ).toBe( inlineRoot );
		} );
	} );

	describe( 'upcast conversion', () => {
		it( 'should convert each comment node to a collapsed marker', () => {
			editor.setData( '<p><!-- comment 1 -->Foo<!-- comment 2 --></p>' );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( commentMarkers ).toHaveLength( 2 );

			expect( commentMarkers[ 0 ].getStart().path ).toEqual( [ 0, 0 ] );
			expect( commentMarkers[ 0 ].getEnd().path ).toEqual( [ 0, 0 ] );

			expect( commentMarkers[ 1 ].getStart().path ).toEqual( [ 0, 3 ] );
			expect( commentMarkers[ 1 ].getEnd().path ).toEqual( [ 0, 3 ] );
		} );

		it( 'should convert each comment node located at root\'s boundary to a collapsed marker', () => {
			editor.setData( '<!-- comment 1 --><p>Foo</p><!-- comment 2 -->' );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( commentMarkers ).toHaveLength( 2 );

			expect( commentMarkers[ 0 ].getStart().path ).toEqual( [ 0 ] );
			expect( commentMarkers[ 0 ].getEnd().path ).toEqual( [ 0 ] );

			expect( commentMarkers[ 1 ].getStart().path ).toEqual( [ 1 ] );
			expect( commentMarkers[ 1 ].getEnd().path ).toEqual( [ 1 ] );
		} );

		it( 'should convert each comment node from a nested tree to a collapsed marker', () => {
			editor.setData( '<div><div><div><p><!-- comment 1 -->Foo<!-- comment 2 --></p></div></div></div>' );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( commentMarkers ).toHaveLength( 2 );

			expect( commentMarkers[ 0 ].getStart().path ).toEqual( [ 0, 0, 0, 0, 0 ] );
			expect( commentMarkers[ 0 ].getEnd().path ).toEqual( [ 0, 0, 0, 0, 0 ] );

			expect( commentMarkers[ 1 ].getStart().path ).toEqual( [ 0, 0, 0, 0, 3 ] );
			expect( commentMarkers[ 1 ].getEnd().path ).toEqual( [ 0, 0, 0, 0, 3 ] );
		} );

		it( 'should set a root attribute containing comment\'s content for each marker', () => {
			editor.setData( '<p><!-- comment 1 -->Foo<!-- comment 2 --></p>' );

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			expect( rootAttributes ).toHaveLength( 2 );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( root.getAttribute( commentMarkers[ 0 ].name ) ).toBe( ' comment 1 ' );
			expect( root.getAttribute( commentMarkers[ 1 ].name ) ).toBe( ' comment 2 ' );
		} );

		it( 'should set a root attribute containing comment\'s content for each marker located in a nested tree', () => {
			editor.setData( '<div><div><div><p><!-- comment 1 -->Foo<!-- comment 2 --></p></div></div></div>' );

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			expect( rootAttributes ).toHaveLength( 2 );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( root.getAttribute( commentMarkers[ 0 ].name ) ).toBe( ' comment 1 ' );
			expect( root.getAttribute( commentMarkers[ 1 ].name ) ).toBe( ' comment 2 ' );
		} );

		it( 'should not create a dedicated model element for a comment node', () => {
			editor.setData( '<p><!-- comment 1 -->Foo<!-- comment 2 --></p>' );

			expect( _getModelData( model, { withoutSelection: true } ) ).toBe( '<paragraph>Foo</paragraph>' );
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

			expect( editor.getData() ).toBe( '<p>F<!-- comment 1 -->o<!-- comment 2 -->o</p>' );
		} );

		it( 'should convert each $comment marker located at root\'s boundary to a comment node', () => {
			editor.setData( '<p>Foo</p>' );

			addMarker( '$comment:1', root, 0 );
			root._setAttribute( '$comment:1', ' comment 1 ' );

			addMarker( '$comment:2', root, 1 );
			root._setAttribute( '$comment:2', ' comment 2 ' );

			expect( editor.getData() ).toBe( '<!-- comment 1 --><p>Foo</p><!-- comment 2 -->' );
		} );

		it( 'should convert each $comment marker to a comment node inside a nested tree', () => {
			editor.setData( '<div><div><div><p>Foo</p></div></div></div>' );

			const paragraph = root.getNodeByPath( [ 0, 0, 0, 0 ] );

			addMarker( '$comment:1', paragraph, 1 );
			root._setAttribute( '$comment:1', ' comment 1 ' );

			addMarker( '$comment:2', paragraph, 2 );
			root._setAttribute( '$comment:2', ' comment 2 ' );

			expect( editor.getData() ).toBe( '<div><div><div><p>F<!-- comment 1 -->o<!-- comment 2 -->o</p></div></div></div>' );
		} );
	} );

	describe( 'removing comments when the corresponding content is removed', () => {
		it( 'should remove all non-boundary comments when the whole content is removed', () => {
			editor.setData( '<p><!-- comment 1 -->Foo<!-- comment 2 --></p>' );

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
			} );

			expect( editor.getData( { trim: false } ) ).toBe( '<p>&nbsp;</p>' );

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			expect( rootAttributes ).toHaveLength( 0 );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( commentMarkers ).toHaveLength( 0 );
		} );

		it( 'should remove comments when the content including them is removed', () => {
			editor.setData( '<p><!-- comment 1 -->Foo<!-- comment 2 --></p><p><!-- comment 3 -->Foo<!-- comment 4 --></p>' );

			model.change( writer => {
				const firstParagraph = root.getChild( 0 );

				writer.remove( writer.createRangeOn( firstParagraph ) );
			} );

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			expect( rootAttributes ).toHaveLength( 2 );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( commentMarkers ).toHaveLength( 2 );

			expect( root.getAttribute( commentMarkers[ 0 ].name ) ).toBe( ' comment 3 ' );
			expect( root.getAttribute( commentMarkers[ 1 ].name ) ).toBe( ' comment 4 ' );
		} );

		it( 'should remove all comments when the whole content is removed with editor.setData( \'\' )', () => {
			editor.setData(
				'<!-- comment 1 -->' +
				'<p>F<!-- comment 2 -->oo</p>' +
				'<!-- comment 3 -->' +
				'<p>Bar<!-- comment 4 --></p>' +
				'<!-- comment 5 -->'
			);
			editor.setData( '' );

			expect( editor.getData( { trim: false } ) ).toBe( '<p>&nbsp;</p>' );

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			expect( rootAttributes ).toHaveLength( 0 );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( commentMarkers ).toHaveLength( 0 );
		} );

		it( 'should replace all comments with new comments when the whole content is replaced with editor.setData()', () => {
			editor.setData(
				'<!-- comment 1 -->' +
				'<p>F<!-- comment 2 -->oo</p>' +
				'<!-- comment 3 -->' +
				'<p>Bar<!-- comment 4 --></p>' +
				'<!-- comment 5 -->'
			);

			editor.setData(
				'<!--comment 6 -->' +
				'<p>F<!-- comment 7 -->oo</p>' +
				'<!-- comment 8 -->' +
				'<p>Bar<!-- comment 9 --></p>' +
				'<!-- comment 10 -->'
			);

			expect( editor.getData( { trim: false } ) ).toBe(
				'<!--comment 6 -->' +
				'<p>F<!-- comment 7 -->oo</p>' +
				'<!-- comment 8 -->' +
				'<p>Bar<!-- comment 9 --></p>' +
				'<!-- comment 10 -->'
			);

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			expect( rootAttributes ).toHaveLength( 5 );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( commentMarkers ).toHaveLength( 5 );
		} );

		it( 'should remove all comments when the whole content is removed with model.deleteContent()', () => {
			editor.setData(
				'<!-- comment 1 -->' +
				'<p>F<!-- comment 2 -->oo</p>' +
				'<!-- comment 3 -->' +
				'<p>Bar<!-- comment 4 --></p>' +
				'<!-- comment 5 -->'
			);

			model.deleteContent( model.createSelection( root, 'in' ) );

			expect( editor.getData( { trim: false } ) ).toBe( '<p>&nbsp;</p>' );

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			expect( rootAttributes ).toHaveLength( 0 );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( commentMarkers ).toHaveLength( 0 );
		} );

		it( 'should not remove boundary comments when only the start of the content is removed with model.deleteContent()', () => {
			editor.setData(
				'<!-- comment 1 -->' +
				'<p>F<!-- comment 2 -->oo</p>' +
				'<!-- comment 3 -->' +
				'<p>Bar<!-- comment 4 --></p>' +
				'<!-- comment 5 -->'
			);

			model.deleteContent( model.createSelection( root.getChild( 0 ), 'on' ) );

			expect( editor.getData( { trim: false } ) ).toBe(
				// The order is not perfect.
				'<p>&nbsp;</p>' +
				'<!-- comment 1 -->' +
				'<!-- comment 3 -->' +
				'<p>Bar<!-- comment 4 --></p>' +
				'<!-- comment 5 -->'
			);

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			expect( rootAttributes ).toHaveLength( 4 );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( commentMarkers ).toHaveLength( 4 );
		} );

		it( 'should not remove boundary comments when only the end of the content is removed with model.deleteContent()', () => {
			editor.setData(
				'<!-- comment 1 -->' +
				'<p>F<!-- comment 2 -->oo</p>' +
				'<!-- comment 3 -->' +
				'<p>Bar<!-- comment 4 --></p>' +
				'<!-- comment 5 -->'
			);

			model.deleteContent( model.createSelection( root.getChild( 1 ), 'on' ) );

			expect( editor.getData( { trim: false } ) ).toBe(
				// The order is not perfect.
				'<!-- comment 1 -->' +
				'<p>F<!-- comment 2 -->oo</p>' +
				'<p>&nbsp;</p>' +
				'<!-- comment 3 -->' +
				'<!-- comment 5 -->'
			);

			const rootAttributes = [ ...root.getAttributeKeys() ].filter( attr => attr.startsWith( '$comment' ) );

			expect( rootAttributes ).toHaveLength( 4 );

			const commentMarkers = [ ...editor.model.markers ].filter( marker => marker.name.startsWith( '$comment' ) );

			expect( commentMarkers ).toHaveLength( 4 );
		} );
	} );

	describe( 'createHtmlComment()', () => {
		it( 'should create an HTML comment between elements', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 1 ), 'first' );

			expect( editor.getData() ).toBe( '<p>Foo</p><!--first--><p>Bar</p><p>Baz</p>' );

			htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 2 ), 'second' );

			expect( editor.getData() ).toBe( '<p>Foo</p><!--first--><p>Bar</p><!--second--><p>Baz</p>' );
		} );

		it( 'should return a comment ID of the comment', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			const firstCommentID = htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 1 ), 'foo' );

			const secondCommentID = htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 1 ), 'bar' );

			expect( firstCommentID ).toBeTypeOf( 'string' );
			expect( secondCommentID ).toBeTypeOf( 'string' );

			expect( firstCommentID ).not.toBe( secondCommentID );
		} );

		it( 'should allow creating an HTML comment inside the text', () => {
			editor.setData( '<p>Foo</p>' );

			htmlCommentPlugin.createHtmlComment( model.createPositionFromPath( root, [ 0, 1 ] ), 'foo' );

			expect( editor.getData() ).toBe( '<p>F<!--foo-->oo</p>' );
		} );

		it( 'should allow creating a few HTML comments in the same place', () => {
			editor.setData( '<p>Foo</p>' );

			const position = model.createPositionFromPath( root, [ 0, 1 ] );

			htmlCommentPlugin.createHtmlComment( position, 'foo' );
			htmlCommentPlugin.createHtmlComment( position, 'bar' );

			expect( editor.getData() ).toBe( '<p>F<!--foo--><!--bar-->oo</p>' );
		} );

		it( 'should allow creating an HTML comment before the first element', () => {
			editor.setData( '<p>Foo</p>' );

			htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 0 ), 'foo' );

			expect( editor.getData() ).toBe( '<!--foo--><p>Foo</p>' );
		} );

		it( 'should allow creating an HTML comment after the last element', () => {
			editor.setData( '<p>Foo</p>' );

			htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 1 ), 'foo' );

			expect( editor.getData() ).toBe( '<p>Foo</p><!--foo-->' );
		} );
	} );

	describe( 'removeHtmlComment()', () => {
		it( 'should remove a comment and return true if the comment with the given comment ID exists', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			const firstCommentID = htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 1 ), 'foo' );
			const secondCommentID = htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 1 ), 'bar' );

			const result1 = htmlCommentPlugin.removeHtmlComment( firstCommentID );

			expect( editor.getData() ).toBe( '<p>Foo</p><!--bar--><p>Bar</p><p>Baz</p>' );

			const result2 = htmlCommentPlugin.removeHtmlComment( secondCommentID );

			expect( editor.getData() ).toBe( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			expect( result1 ).toBe( true );
			expect( result2 ).toBe( true );
		} );

		// Note that the comment could have been removed via the content changes.
		it( 'should do nothing and return `false` if a comment with the given comment ID does not exist', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			htmlCommentPlugin.createHtmlComment( model.createPositionAt( root, 1 ), 'bar' );

			const result = htmlCommentPlugin.removeHtmlComment( 'invalid-comment-id' );

			expect( editor.getData() ).toBe( '<p>Foo</p><!--bar--><p>Bar</p><p>Baz</p>' );

			expect( result ).toBe( false );
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

			expect( htmlCommentPlugin.getHtmlCommentsInRange( range ) ).toEqual( [ id3, id4 ] );
		} );

		it( 'should return all comment marker IDs present in the specified range including comments at range boundaries', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			htmlCommentPlugin.createHtmlComment( model.createPositionFromPath( root, [ 1, 0 ] ), 'foo' );
			htmlCommentPlugin.createHtmlComment( model.createPositionFromPath( root, [ 2 ] ), 'bar' );

			const posStart = model.createPositionFromPath( root, [ 2, 1 ] );
			const posEnd = model.createPositionFromPath( root, [ 2, 3 ] );

			const range = new ModelRange( posStart, posEnd );

			// Comments at the range boundaries.
			const id3 = htmlCommentPlugin.createHtmlComment( posStart, 'baz' );
			const id4 = htmlCommentPlugin.createHtmlComment( posEnd, 'biz' );

			expect( htmlCommentPlugin.getHtmlCommentsInRange( range ) ).toEqual( [ id3, id4 ] );
		} );

		it( 'should not return comments at range boundaries when the skipBoundaries option is set to true', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			htmlCommentPlugin.createHtmlComment( model.createPositionFromPath( root, [ 1, 0 ] ), 'foo' );
			htmlCommentPlugin.createHtmlComment( model.createPositionFromPath( root, [ 2 ] ), 'bar' );

			const posStart = model.createPositionFromPath( root, [ 2, 1 ] );
			const posEnd = model.createPositionFromPath( root, [ 2, 3 ] );

			const range = new ModelRange( posStart, posEnd );

			// Comments at the range boundaries.
			htmlCommentPlugin.createHtmlComment( posStart, 'baz' );
			htmlCommentPlugin.createHtmlComment( posEnd, 'biz' );

			expect( htmlCommentPlugin.getHtmlCommentsInRange( range, { skipBoundaries: true } ) ).toEqual( [] );
		} );

		it( 'should return all comment marker IDs present in the specified collapsed range', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			htmlCommentPlugin.createHtmlComment( model.createPositionFromPath( root, [ 2, 0 ] ), 'foo' );
			htmlCommentPlugin.createHtmlComment( model.createPositionFromPath( root, [ 2, 2 ] ), 'bar' );

			const position = model.createPositionFromPath( root, [ 2, 1 ] );

			const range = new ModelRange( position, position );

			// Two comments at the position of the collapsed range.
			const id1 = htmlCommentPlugin.createHtmlComment( position, 'baz' );
			const id2 = htmlCommentPlugin.createHtmlComment( position, 'biz' );

			expect( htmlCommentPlugin.getHtmlCommentsInRange( range ) ).toEqual( [ id1, id2 ] );
		} );
	} );

	describe( 'getHtmlCommentData()', () => {
		it( 'should return a position and the content for the given comment', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			const id1 = htmlCommentPlugin.createHtmlComment( model.createPositionFromPath( root, [ 0 ] ), 'foo' );
			const id2 = htmlCommentPlugin.createHtmlComment( model.createPositionFromPath( root, [ 2, 2 ] ), 'bar' );

			const commentData1 = htmlCommentPlugin.getHtmlCommentData( id1 );
			const commentData2 = htmlCommentPlugin.getHtmlCommentData( id2 );

			expect( commentData1 ).toBeTypeOf( 'object' );
			expect( commentData1.position.isEqual( model.createPositionFromPath( root, [ 0 ] ) ) ).toBe( true );
			expect( commentData1.content ).toBe( 'foo' );

			expect( commentData2 ).toBeTypeOf( 'object' );
			expect( commentData2.position.isEqual( model.createPositionFromPath( root, [ 2, 2 ] ) ) ).toBe( true );
			expect( commentData2.content ).toBe( 'bar' );
		} );

		it( 'should return null if the given comment does not exist', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			expect( htmlCommentPlugin.getHtmlCommentData( 'invalid-id' ) ).toBeNull();
		} );

		it( 'should find comment data when the comment is on a non-first root', () => {
			editor.setData( '<p>Foo</p>' );

			// Create a second root to simulate a multi-root editor scenario.
			let secondRoot;

			model.change( writer => {
				secondRoot = writer.addRoot( 'secondRoot' );
			} );

			// Create a comment at the beginning of the second root.
			const position = model.createPositionAt( secondRoot, 0 );
			const commentId = htmlCommentPlugin.createHtmlComment( position, 'hello' );

			// getHtmlCommentData iterates getRoots(). The first root ('main') does NOT have
			// the commentID attribute, exercising the false branch of if(root.hasAttribute(commentID)).
			// The second root does have it, so the loop finds it there.
			const commentData = htmlCommentPlugin.getHtmlCommentData( commentId );

			expect( commentData ).not.toBeNull();
			expect( commentData.content ).toBe( 'hello' );

			model.change( writer => {
				writer.detachRoot( 'secondRoot' );
			} );
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
