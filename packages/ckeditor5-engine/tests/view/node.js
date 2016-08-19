/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view */

import Element from '/ckeditor5/engine/view/element.js';
import Text from '/ckeditor5/engine/view/text.js';
import DocumentFragment from '/ckeditor5/engine/view/documentfragment.js';
import RootEditableElement from '/ckeditor5/engine/view/rooteditableelement.js';

import createDocumentMock from '/tests/engine/view/_utils/createdocumentmock.js';

describe( 'Node', () => {
	let root;
	let one, two, three;
	let charB, charA, charR, img;

	before( () => {
		charB = new Text( 'b' );
		charA = new Text( 'a' );
		img = new Element( 'img' );
		charR = new Text( 'r' );

		one = new Element( 'one' );
		two = new Element( 'two', null, [ charB, charA, img, charR ] );
		three = new Element( 'three' );

		root = new Element( null, null, [ one, two, three ] );
	} );

	describe( 'getNextSibling/getPreviousSibling', () => {
		it( 'should return next sibling', () => {
			expect( root.nextSibling ).to.be.null;

			expect( one.nextSibling ).to.equal( two );
			expect( two.nextSibling ).to.equal( three );
			expect( three.nextSibling ).to.be.null;

			expect( charB.nextSibling ).to.equal( charA );
			expect( charA.nextSibling ).to.equal( img );
			expect( img.nextSibling ).to.equal( charR );
			expect( charR.nextSibling ).to.be.null;
		} );

		it( 'should return previous sibling', () => {
			expect( root.previousSibling ).to.be.null;

			expect( one.previousSibling ).to.be.null;
			expect( two.previousSibling ).to.equal( one );
			expect( three.previousSibling ).to.equal( two );

			expect( charB.previousSibling ).to.be.null;
			expect( charA.previousSibling ).to.equal( charB );
			expect( img.previousSibling ).to.equal( charA );
			expect( charR.previousSibling ).to.equal( img );
		} );
	} );

	describe( 'getAncestors', () => {
		it( 'should return empty array for node without ancestors', () => {
			const result = root.getAncestors();
			expect( result ).to.be.an( 'array' );
			expect( result.length ).to.equal( 0 );
		} );

		it( 'should return array including node itself if requested', () => {
			const result = root.getAncestors( { includeNode: true } );
			expect( result ).to.be.an( 'array' );
			expect( result.length ).to.equal( 1 );
			expect( result[ 0 ] ).to.equal( root );
		} );

		it( 'should return array of ancestors', () => {
			const result = charR.getAncestors();
			expect( result.length ).to.equal( 2 );
			expect( result[ 0 ] ).to.equal( root );
			expect( result[ 1 ] ).to.equal( two );

			const result2 = charR.getAncestors( { includeNode: true } );
			expect( result2.length ).to.equal( 3 );
			expect( result2[ 0 ] ).to.equal( root );
			expect( result2[ 1 ] ).to.equal( two );
			expect( result2[ 2 ] ).to.equal( charR );
		} );

		it( 'should return array of ancestors starting from parent', () => {
			const result = charR.getAncestors( { parentFirst: true } );
			expect( result.length ).to.equal( 2 );
			expect( result[ 0 ] ).to.equal( two );
			expect( result[ 1 ] ).to.equal( root );

			const result2 = charR.getAncestors( { includeNode: true, parentFirst: true } );
			expect( result2.length ).to.equal( 3 );
			expect( result2[ 2 ] ).to.equal( root );
			expect( result2[ 1 ] ).to.equal( two );
			expect( result2[ 0 ] ).to.equal( charR );
		} );

		it( 'should return ancestors including DocumentFragment', () => {
			const fragment = new DocumentFragment( root );
			const result = img.getAncestors();
			root.remove();

			expect( result.length ).to.equal( 3 );
			expect( result[ 0 ] ).to.equal( fragment );
			expect( result[ 1 ] ).to.equal( root );
			expect( result[ 2 ] ).to.equal( two );
		} );
	} );

	describe( 'getIndex', () => {
		it( 'should return null if the parent is null', () => {
			expect( root.index ).to.be.null;
		} );

		it( 'should return index in the parent', () => {
			expect( one.index ).to.equal( 0 );
			expect( two.index ).to.equal( 1 );
			expect( three.index ).to.equal( 2 );

			expect( charB.index ).to.equal( 0 );
			expect( charA.index ).to.equal( 1 );
			expect( img.index ).to.equal( 2 );
			expect( charR.index ).to.equal( 3 );
		} );

		it( 'should throw an error if parent does not contain element', () => {
			let f = new Text( 'f' );
			let bar = new Element( 'bar', [], [] );

			f.parent = bar;

			expect(
				() => {
					f.index;
				}
			).to.throwCKEditorError( /view-node-not-found-in-parent/ );
		} );
	} );

	describe( 'getDocument', () => {
		it( 'should return null if any parent has not set Document', () => {
			expect( charA.document ).to.be.null;
		} );

		it( 'should return Document attached to the parent element', () => {
			const docMock = createDocumentMock();
			const parent = new RootEditableElement( docMock, 'div' );
			const child = new Element( 'p' );

			child.parent = parent;

			expect( parent.document ).to.equal( docMock );
			expect( child.document ).to.equal( docMock );
		} );

		it( 'should return null if element is inside DocumentFragment', () => {
			const child = new Element( 'p' );
			new DocumentFragment( [ child ] );

			expect( child.document ).to.be.null;
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return this element if it has no parent', () => {
			const child = new Element( 'p' );

			expect( child.root ).to.equal( child );
		} );

		it( 'should return root element', () => {
			const parent = new RootEditableElement( createDocumentMock(), 'div' );
			const child = new Element( 'p' );

			child.parent = parent;

			expect( parent.root ).to.equal( parent );
			expect( child.root ).to.equal( parent );
		} );
	} );

	describe( 'remove', () => {
		it( 'should remove node from its parent', () => {
			const char = new Text( 'a' );
			const parent = new Element( 'p', null, [ char ] );
			char.remove();

			expect( parent.getChildIndex( char ) ).to.equal( -1 );
		} );

		it( 'uses parent.removeChildren method', () => {
			const char = new Text( 'a' );
			const parent = new Element( 'p', null, [ char ] );
			const removeChildrenSpy = sinon.spy( parent, 'removeChildren' );
			const index = char.index;
			char.remove();
			removeChildrenSpy.restore();
			sinon.assert.calledOnce( removeChildrenSpy );
			sinon.assert.calledWithExactly( removeChildrenSpy, index );
		} );
	} );

	describe( 'change event', () => {
		let root, text, img;
		let rootChangeSpy;

		before( () => {
			rootChangeSpy = sinon.spy();
		} );

		beforeEach( () => {
			text = new Text( 'foo' );
			img = new Element( 'img' );
			img.setAttribute( 'src', 'img.png' );

			root = new Element( 'p', { renderer: { markToSync: rootChangeSpy } } );
			root.appendChildren( [ text, img ] );

			root.on( 'change:children', ( evt, node ) => rootChangeSpy( 'children', node ) );
			root.on( 'change:attributes', ( evt, node ) => rootChangeSpy( 'attributes', node ) );
			root.on( 'change:text', ( evt, node ) => rootChangeSpy( 'text', node ) );

			rootChangeSpy.reset();
		} );

		it( 'should be fired on the node', () => {
			const imgChangeSpy = sinon.spy();

			img.on( 'change:attributes', ( evt, node ) => {
				imgChangeSpy( 'attributes', node );
			} );

			img.setAttribute( 'width', 100 );

			sinon.assert.calledOnce( imgChangeSpy );
			sinon.assert.calledWith( imgChangeSpy, 'attributes', img );
		} );

		it( 'should be fired on the parent', () => {
			img.setAttribute( 'width', 100 );

			sinon.assert.calledOnce( rootChangeSpy );
			sinon.assert.calledWith( rootChangeSpy, 'attributes', img );
		} );

		describe( 'setAttribute', () => {
			it( 'should fire change event', () => {
				img.setAttribute( 'width', 100 );

				sinon.assert.calledOnce( rootChangeSpy );
				sinon.assert.calledWith( rootChangeSpy, 'attributes', img );
			} );
		} );

		describe( 'removeAttribute', () => {
			it( 'should fire change event', () => {
				img.removeAttribute( 'src' );

				sinon.assert.calledOnce( rootChangeSpy );
				sinon.assert.calledWith( rootChangeSpy, 'attributes', img );
			} );
		} );

		describe( 'insertChildren', () => {
			it( 'should fire change event', () => {
				root.insertChildren( 1, new Element( 'img' ) );

				sinon.assert.calledOnce( rootChangeSpy );
				sinon.assert.calledWith( rootChangeSpy, 'children', root );
			} );
		} );

		describe( 'appendChildren', () => {
			it( 'should fire change event', () => {
				root.appendChildren( new Element( 'img' ) );

				sinon.assert.calledOnce( rootChangeSpy );
				sinon.assert.calledWith( rootChangeSpy, 'children', root );
			} );
		} );

		describe( 'removeChildren', () => {
			it( 'should fire change event', () => {
				root.removeChildren( 1, 1 );

				sinon.assert.calledOnce( rootChangeSpy );
				sinon.assert.calledWith( rootChangeSpy, 'children', root );
			} );
		} );

		describe( 'removeChildren', () => {
			it( 'should fire change event', () => {
				text.data = 'bar';

				sinon.assert.calledOnce( rootChangeSpy );
				sinon.assert.calledWith( rootChangeSpy, 'text', text );
			} );
		} );
	} );
} );
