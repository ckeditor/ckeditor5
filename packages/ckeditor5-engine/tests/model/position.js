/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Model } from '../../src/model/model.js';
import { ModelDocumentFragment } from '../../src/model/documentfragment.js';
import { ModelElement } from '../../src/model/element.js';
import { ModelText } from '../../src/model/text.js';
import { ModelTextProxy } from '../../src/model/textproxy.js';
import {
	ModelPosition,
	getTextNodeAtPosition,
	getNodeAfterPosition,
	getNodeBeforePosition
} from '../../src/model/position.js';
import { ModelRange } from '../../src/model/range.js';
import { MarkerOperation } from '../../src/model/operation/markeroperation.js';
import { AttributeOperation } from '../../src/model/operation/attributeoperation.js';
import { InsertOperation } from '../../src/model/operation/insertoperation.js';
import { MoveOperation } from '../../src/model/operation/moveoperation.js';
import { RenameOperation } from '../../src/model/operation/renameoperation.js';
import { MergeOperation } from '../../src/model/operation/mergeoperation.js';
import { SplitOperation } from '../../src/model/operation/splitoperation.js';

import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { ModelLivePosition } from '../../src/model/liveposition.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'Position', () => {
	let doc, model, root, otherRoot, p, ul, li1, li2, f, o, z, b, a, r, foz, bar;

	testUtils.createSinonSandbox();

	// root
	//  |- p         Before: [ 0 ]       After: [ 1 ]
	//  |- ul        Before: [ 1 ]       After: [ 2 ]
	//     |- li     Before: [ 1, 0 ]    After: [ 1, 1 ]
	//     |  |- f   Before: [ 1, 0, 0 ] After: [ 1, 0, 1 ]
	//     |  |- o   Before: [ 1, 0, 1 ] After: [ 1, 0, 2 ]
	//     |  |- z   Before: [ 1, 0, 2 ] After: [ 1, 0, 3 ]
	//     |- li     Before: [ 1, 1 ]    After: [ 1, 2 ]
	//        |- b   Before: [ 1, 1, 0 ] After: [ 1, 1, 1 ]
	//        |- a   Before: [ 1, 1, 1 ] After: [ 1, 1, 2 ]
	//        |- r   Before: [ 1, 1, 2 ] After: [ 1, 1, 3 ]
	beforeEach( () => {
		model = new Model();

		doc = model.document;
		root = doc.createRoot();
		otherRoot = doc.createRoot( '$root', 'otherRoot' );

		foz = new ModelText( 'foz' );

		li1 = new ModelElement( 'li', [], foz );

		f = new ModelTextProxy( foz, 0, 1 );
		o = new ModelTextProxy( foz, 1, 1 );
		z = new ModelTextProxy( foz, 2, 1 );

		bar = new ModelText( 'bar' );

		li2 = new ModelElement( 'li', [], bar );

		b = new ModelTextProxy( bar, 0, 1 );
		a = new ModelTextProxy( bar, 1, 1 );
		r = new ModelTextProxy( bar, 2, 1 );

		ul = new ModelElement( 'ul', [], [ li1, li2 ] );

		p = new ModelElement( 'p' );

		root._insertChild( 0, [ p, ul ] );
	} );

	describe( 'constructor()', () => {
		it( 'should create a position with path and document', () => {
			const position = new ModelPosition( root, [ 0 ] );

			expect( position ).to.have.property( 'path' ).that.deep.equals( [ 0 ] );
			expect( position ).to.have.property( 'root' ).that.equals( root );
		} );

		it( 'should accept ModelDocumentFragment as a root', () => {
			const frag = new ModelDocumentFragment();
			const pos = new ModelPosition( frag, [ 0 ] );

			expect( pos ).to.have.property( 'root', frag );
		} );

		it( 'should accept detached Element as a root', () => {
			const el = new ModelElement( 'p' );
			const pos = new ModelPosition( el, [ 0 ] );

			expect( pos ).to.have.property( 'root', el );
			expect( pos.path ).to.deep.equal( [ 0 ] );
		} );

		it( 'should normalize attached Element as a root', () => {
			const pos = new ModelPosition( li1, [ 0, 2 ] );

			expect( pos ).to.have.property( 'root', root );
			expect( pos.isEqual( ModelPosition._createAt( li1, 0, 2 ) ) );
		} );

		it( 'should normalize Element from a detached branch as a root', () => {
			const rootEl = new ModelElement( 'p', null, [ new ModelElement( 'a' ) ] );
			const elA = rootEl.getChild( 0 );
			const pos = new ModelPosition( elA, [ 0 ] );

			expect( pos ).to.have.property( 'root', rootEl );
			expect( pos.isEqual( ModelPosition._createAt( elA, 0 ) ) );
		} );

		it( 'should throw error if given path is incorrect', () => {
			expectToThrowCKEditorError( () => {
				new ModelPosition( root, {} ); // eslint-disable-line no-new
			}, /model-position-path-incorrect-format/, model );

			expectToThrowCKEditorError( () => {
				new ModelPosition( root, [] ); // eslint-disable-line no-new
			}, /model-position-path-incorrect-format/, model );
		} );

		it( 'should throw error if given root is invalid', () => {
			expectToThrowCKEditorError( () => {
				new ModelPosition( new ModelText( 'a' ) ); // eslint-disable-line no-new
			}, /model-position-root-invalid/ );

			expect( () => {
				new ModelPosition(); // eslint-disable-line no-new
			} ).to.throw();
		} );
	} );

	describe( 'is()', () => {
		let position;

		beforeEach( () => {
			position = new ModelPosition( root, [ 0 ] );
		} );

		it( 'should return true for "position"', () => {
			expect( position.is( 'position' ) ).to.be.true;
			expect( position.is( 'model:position' ) ).to.be.true;
		} );

		it( 'should return false for incorrect values', () => {
			expect( position.is( 'model' ) ).to.be.false;
			expect( position.is( 'model:node' ) ).to.be.false;
			expect( position.is( '$text' ) ).to.be.false;
			expect( position.is( 'element', 'paragraph' ) ).to.be.false;
		} );
	} );

	describe( 'static creators', () => {
		describe( '_createAt()', () => {
			it( 'should throw if no offset is passed', () => {
				expectToThrowCKEditorError( () => {
					ModelPosition._createAt( ul );
				}, 'model-createpositionat-offset-required', model );
			} );

			it( 'should create positions from positions', () => {
				const position = ModelPosition._createAt( ul, 0 );

				const positionCopy = ModelPosition._createAt( position );

				expect( positionCopy ).to.have.property( 'path' ).that.deep.equals( [ 1, 0 ] );
				expect( positionCopy ).to.have.property( 'root' ).that.equals( position.root );
				expect( positionCopy ).to.not.equal( position );
			} );

			it( 'should create positions from LivePosition', () => {
				const position = new ModelLivePosition( root, [ 0, 0 ] );
				const created = ModelPosition._createAt( position );

				expect( created.isEqual( position ) ).to.be.true;
				expect( created ).to.not.be.equal( position );
				expect( created ).to.be.instanceof( ModelPosition );
				expect( created ).to.not.be.instanceof( ModelLivePosition );
			} );

			it( 'should create positions from node and offset', () => {
				expect( ModelPosition._createAt( root, 0 ) ).to.have.property( 'path' ).that.deep.equals( [ 0 ] );
				expect( ModelPosition._createAt( root, 1 ) ).to.have.property( 'path' ).that.deep.equals( [ 1 ] );
				expect( ModelPosition._createAt( root, 2 ) ).to.have.property( 'path' ).that.deep.equals( [ 2 ] );

				expect( ModelPosition._createAt( p, 0 ) ).to.have.property( 'path' ).that.deep.equals( [ 0, 0 ] );

				expect( ModelPosition._createAt( ul, 0 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0 ] );
				expect( ModelPosition._createAt( ul, 1 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1 ] );
				expect( ModelPosition._createAt( ul, 2 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 2 ] );

				expect( ModelPosition._createAt( li1, 0 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 0 ] );
				expect( ModelPosition._createAt( li1, 1 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 1 ] );
				expect( ModelPosition._createAt( li1, 2 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 2 ] );
				expect( ModelPosition._createAt( li1, 3 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 3 ] );
			} );

			it( 'should create positions from node and flag', () => {
				expect( ModelPosition._createAt( root, 'end' ) ).to.have.property( 'path' ).that.deep.equals( [ 2 ] );

				expect( ModelPosition._createAt( p, 'before' ) ).to.have.property( 'path' ).that.deep.equals( [ 0 ] );
				expect( ModelPosition._createAt( a, 'before' ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 1 ] );

				expect( ModelPosition._createAt( p, 'after' ) ).to.have.property( 'path' ).that.deep.equals( [ 1 ] );
				expect( ModelPosition._createAt( a, 'after' ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 2 ] );

				expect( ModelPosition._createAt( ul, 'end' ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 2 ] );
			} );

			it( 'should set stickiness (if not cloning other position)', () => {
				expect( ModelPosition._createAt( root, 'end', 'toPrevious' ) ).to.have.property( 'stickiness' ).that.equals( 'toPrevious' );
			} );

			it( 'throws when parent is not an element', () => {
				expectToThrowCKEditorError( () => {
					ModelPosition._createAt( b, 0 );
				}, /^model-position-parent-incorrect/, model );
			} );

			it( 'works with a doc frag', () => {
				const frag = new ModelDocumentFragment();

				expect( ModelPosition._createAt( frag, 0 ) ).to.have.property( 'root', frag );
			} );
		} );

		describe( '_createBefore()', () => {
			it( 'should create positions before elements', () => {
				expect( ModelPosition._createBefore( p ) ).to.have.property( 'path' ).that.deep.equals( [ 0 ] );

				expect( ModelPosition._createBefore( ul ) ).to.have.property( 'path' ).that.deep.equals( [ 1 ] );

				expect( ModelPosition._createBefore( li1 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0 ] );

				expect( ModelPosition._createBefore( f ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 0 ] );
				expect( ModelPosition._createBefore( o ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 1 ] );
				expect( ModelPosition._createBefore( z ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 2 ] );

				expect( ModelPosition._createBefore( li2 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1 ] );

				expect( ModelPosition._createBefore( b ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 0 ] );
				expect( ModelPosition._createBefore( a ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 1 ] );
				expect( ModelPosition._createBefore( r ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 2 ] );
			} );

			it( 'should set stickiness', () => {
				expect( ModelPosition._createBefore( p, 'toPrevious' ) ).to.have.property( 'stickiness' ).that.equals( 'toPrevious' );
			} );

			it( 'should throw error if one try to create positions before root', () => {
				expectToThrowCKEditorError( () => {
					ModelPosition._createBefore( root );
				}, /model-position-before-root/, model );
			} );
		} );

		describe( '_createAfter()', () => {
			it( 'should create positions after elements', () => {
				expect( ModelPosition._createAfter( p ) ).to.have.property( 'path' ).that.deep.equals( [ 1 ] );

				expect( ModelPosition._createAfter( ul ) ).to.have.property( 'path' ).that.deep.equals( [ 2 ] );

				expect( ModelPosition._createAfter( li1 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1 ] );

				expect( ModelPosition._createAfter( f ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 1 ] );
				expect( ModelPosition._createAfter( o ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 2 ] );
				expect( ModelPosition._createAfter( z ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 3 ] );

				expect( ModelPosition._createAfter( li2 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 2 ] );

				expect( ModelPosition._createAfter( b ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 1 ] );
				expect( ModelPosition._createAfter( a ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 2 ] );
				expect( ModelPosition._createAfter( r ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 3 ] );
			} );

			it( 'should set stickiness', () => {
				expect( ModelPosition._createAfter( p, 'toPrevious' ) ).to.have.property( 'stickiness' ).that.equals( 'toPrevious' );
			} );

			it( 'should throw error if one try to make positions after root', () => {
				expectToThrowCKEditorError( () => {
					ModelPosition._createAfter( root );
				}, /model-position-after-root/, model );
			} );
		} );
	} );

	describe( '#parent', () => {
		it( 'should have parent', () => {
			expect( new ModelPosition( root, [ 0 ] ) ).to.have.property( 'parent' ).that.equals( root );
			expect( new ModelPosition( root, [ 1 ] ) ).to.have.property( 'parent' ).that.equals( root );
			expect( new ModelPosition( root, [ 2 ] ) ).to.have.property( 'parent' ).that.equals( root );

			expect( new ModelPosition( root, [ 0, 0 ] ) ).to.have.property( 'parent' ).that.equals( p );

			expect( new ModelPosition( root, [ 1, 0 ] ) ).to.have.property( 'parent' ).that.equals( ul );
			expect( new ModelPosition( root, [ 1, 1 ] ) ).to.have.property( 'parent' ).that.equals( ul );
			expect( new ModelPosition( root, [ 1, 2 ] ) ).to.have.property( 'parent' ).that.equals( ul );

			expect( new ModelPosition( root, [ 1, 0, 0 ] ) ).to.have.property( 'parent' ).that.equals( li1 );
			expect( new ModelPosition( root, [ 1, 0, 1 ] ) ).to.have.property( 'parent' ).that.equals( li1 );
			expect( new ModelPosition( root, [ 1, 0, 2 ] ) ).to.have.property( 'parent' ).that.equals( li1 );
			expect( new ModelPosition( root, [ 1, 0, 3 ] ) ).to.have.property( 'parent' ).that.equals( li1 );
		} );

		it( 'should work with positions rooted in document fragment', () => {
			const docFrag = new ModelDocumentFragment();

			expect( new ModelPosition( docFrag, [ 0 ] ) ).to.have.property( 'parent' ).that.equals( docFrag );
		} );

		it( 'should throw when path out of bounds', () => {
			const position = new ModelPosition( root, [ 0, 0 ] );

			expect( position ).to.have.property( 'parent' ).that.equals( p );

			root._removeChildren( 0, 2 );

			expectToThrowCKEditorError( () => {
				position.parent;
			}, 'model-position-path-incorrect', position, { position } );
		} );

		it( 'should throw when based on a path, the parent would be a text node', () => {
			// 1,0,0 points at: <p></p><ul><li>^foz</li>...
			const position = new ModelPosition( root, [ 1, 0, 0, 0 ] );

			expectToThrowCKEditorError( () => {
				position.parent;
			}, 'model-position-path-incorrect', position, { position } );
		} );
	} );

	describe( '#offset', () => {
		it( 'should have offset', () => {
			expect( new ModelPosition( root, [ 0 ] ) ).to.have.property( 'offset' ).that.equals( 0 );
			expect( new ModelPosition( root, [ 1 ] ) ).to.have.property( 'offset' ).that.equals( 1 );
			expect( new ModelPosition( root, [ 2 ] ) ).to.have.property( 'offset' ).that.equals( 2 );

			expect( new ModelPosition( root, [ 0, 0 ] ) ).to.have.property( 'offset' ).that.equals( 0 );

			expect( new ModelPosition( root, [ 1, 0 ] ) ).to.have.property( 'offset' ).that.equals( 0 );
			expect( new ModelPosition( root, [ 1, 1 ] ) ).to.have.property( 'offset' ).that.equals( 1 );
			expect( new ModelPosition( root, [ 1, 2 ] ) ).to.have.property( 'offset' ).that.equals( 2 );

			expect( new ModelPosition( root, [ 1, 0, 0 ] ) ).to.have.property( 'offset' ).that.equals( 0 );
			expect( new ModelPosition( root, [ 1, 0, 1 ] ) ).to.have.property( 'offset' ).that.equals( 1 );
			expect( new ModelPosition( root, [ 1, 0, 2 ] ) ).to.have.property( 'offset' ).that.equals( 2 );
			expect( new ModelPosition( root, [ 1, 0, 3 ] ) ).to.have.property( 'offset' ).that.equals( 3 );
		} );
	} );

	describe( '#index', () => {
		it( 'should have index', () => {
			expect( new ModelPosition( root, [ 0 ] ) ).to.have.property( 'index' ).that.equals( 0 );
			expect( new ModelPosition( root, [ 1 ] ) ).to.have.property( 'index' ).that.equals( 1 );
			expect( new ModelPosition( root, [ 2 ] ) ).to.have.property( 'index' ).that.equals( 2 );

			expect( new ModelPosition( root, [ 0, 0 ] ) ).to.have.property( 'index' ).that.equals( 0 );

			expect( new ModelPosition( root, [ 1, 0 ] ) ).to.have.property( 'index' ).that.equals( 0 );
			expect( new ModelPosition( root, [ 1, 1 ] ) ).to.have.property( 'index' ).that.equals( 1 );
			expect( new ModelPosition( root, [ 1, 2 ] ) ).to.have.property( 'index' ).that.equals( 2 );

			expect( new ModelPosition( root, [ 1, 0, 0 ] ) ).to.have.property( 'index' ).that.equals( 0 );
			expect( new ModelPosition( root, [ 1, 0, 1 ] ) ).to.have.property( 'index' ).that.equals( 0 );
			expect( new ModelPosition( root, [ 1, 0, 2 ] ) ).to.have.property( 'index' ).that.equals( 0 );
			expect( new ModelPosition( root, [ 1, 0, 3 ] ) ).to.have.property( 'index' ).that.equals( 1 );
		} );

		it( 'should be able to set offset', () => {
			const position = new ModelPosition( root, [ 1, 0, 2 ] );
			position.offset = 4;

			expect( position.offset ).to.equal( 4 );
			expect( position.path ).to.deep.equal( [ 1, 0, 4 ] );
		} );

		it( 'should throw when path out of bounds', () => {
			const position = new ModelPosition( root, [ 0, 0 ] );

			expect( position ).to.have.property( 'index' ).that.equals( 0 );

			root._removeChildren( 0, 2 );

			expectToThrowCKEditorError( () => {
				position.index;
			}, 'model-position-path-incorrect', position, { position } );
		} );
	} );

	describe( '#nodeBefore', () => {
		it( 'should have nodeBefore if it is not inside a text node', () => {
			expect( new ModelPosition( root, [ 0 ] ).nodeBefore ).to.be.null;
			expect( new ModelPosition( root, [ 1 ] ).nodeBefore ).to.equal( p );
			expect( new ModelPosition( root, [ 2 ] ).nodeBefore ).to.equal( ul );

			expect( new ModelPosition( root, [ 0, 0 ] ).nodeBefore ).to.null;

			expect( new ModelPosition( root, [ 1, 0 ] ).nodeBefore ).to.be.null;
			expect( new ModelPosition( root, [ 1, 1 ] ).nodeBefore ).to.equal( li1 );
			expect( new ModelPosition( root, [ 1, 2 ] ).nodeBefore ).to.equal( li2 );

			expect( new ModelPosition( root, [ 1, 0, 0 ] ).nodeBefore ).to.be.null;
			expect( new ModelPosition( root, [ 1, 0, 1 ] ).nodeBefore ).to.be.null;
			expect( new ModelPosition( root, [ 1, 0, 2 ] ).nodeBefore ).to.be.null;
			expect( new ModelPosition( root, [ 1, 0, 3 ] ).nodeBefore.data ).to.equal( 'foz' );
		} );

		it( 'should throw when path out of bounds', () => {
			const position = new ModelPosition( root, [ 1, 1 ] );

			expect( position ).to.have.property( 'nodeBefore' ).that.equals( li1 );

			root._removeChildren( 0, 2 );

			expectToThrowCKEditorError( () => {
				position.nodeBefore;
			}, 'model-position-path-incorrect', position );
		} );
	} );

	describe( '#nodeAfter', () => {
		it( 'should have nodeAfter if it is not inside a text node', () => {
			expect( new ModelPosition( root, [ 0 ] ).nodeAfter ).to.equal( p );
			expect( new ModelPosition( root, [ 1 ] ).nodeAfter ).to.equal( ul );
			expect( new ModelPosition( root, [ 2 ] ).nodeAfter ).to.be.null;

			expect( new ModelPosition( root, [ 0, 0 ] ).nodeAfter ).to.be.null;

			expect( new ModelPosition( root, [ 1, 0 ] ).nodeAfter ).to.equal( li1 );
			expect( new ModelPosition( root, [ 1, 1 ] ).nodeAfter ).to.equal( li2 );
			expect( new ModelPosition( root, [ 1, 2 ] ).nodeAfter ).to.be.null;

			expect( new ModelPosition( root, [ 1, 0, 0 ] ).nodeAfter.data ).to.equal( 'foz' );
			expect( new ModelPosition( root, [ 1, 0, 1 ] ).nodeAfter ).to.be.null;
			expect( new ModelPosition( root, [ 1, 0, 2 ] ).nodeAfter ).to.be.null;
			expect( new ModelPosition( root, [ 1, 0, 3 ] ).nodeAfter ).to.be.null;
		} );

		it( 'should throw when path out of bounds', () => {
			const position = new ModelPosition( root, [ 1, 1 ] );

			expect( position ).to.have.property( 'nodeAfter' ).that.equals( li2 );

			root._removeChildren( 0, 2 );

			expectToThrowCKEditorError( () => {
				position.nodeAfter;
			}, 'model-position-path-incorrect', position );
		} );
	} );

	describe( '#textNode', () => {
		it( 'should have a text node property if it is in text node', () => {
			expect( new ModelPosition( root, [ 0 ] ).textNode ).to.be.null;
			expect( new ModelPosition( root, [ 1 ] ).textNode ).to.be.null;
			expect( new ModelPosition( root, [ 2 ] ).textNode ).to.be.null;

			expect( new ModelPosition( root, [ 0, 0 ] ).textNode ).to.be.null;

			expect( new ModelPosition( root, [ 1, 0 ] ).textNode ).to.be.null;
			expect( new ModelPosition( root, [ 1, 1 ] ).textNode ).to.be.null;
			expect( new ModelPosition( root, [ 1, 2 ] ).textNode ).to.be.null;

			expect( new ModelPosition( root, [ 1, 0, 0 ] ).textNode ).to.be.null;
			expect( new ModelPosition( root, [ 1, 0, 1 ] ).textNode ).to.equal( foz );
			expect( new ModelPosition( root, [ 1, 0, 2 ] ).textNode ).to.equal( foz );
			expect( new ModelPosition( root, [ 1, 0, 3 ] ).textNode ).to.be.null;

			expect( new ModelPosition( root, [ 1, 1, 0 ] ).textNode ).to.be.null;
			expect( new ModelPosition( root, [ 1, 1, 1 ] ).textNode ).to.equal( bar );
			expect( new ModelPosition( root, [ 1, 1, 2 ] ).textNode ).to.equal( bar );
			expect( new ModelPosition( root, [ 1, 1, 3 ] ).textNode ).to.be.null;
		} );

		it( 'should throw when path out of bounds', () => {
			const position = new ModelPosition( root, [ 1, 0, 1 ] );

			expect( position ).to.have.property( 'textNode' ).that.equals( foz );

			root._removeChildren( 0, 2 );

			expectToThrowCKEditorError( () => {
				position.textNode;
			}, 'model-position-path-incorrect', position );
		} );
	} );

	describe( 'isValid()', () => {
		it( 'should return true for a position that points to a place that exists in current model tree', () => {
			const p1 = new ModelPosition( root, [ 0 ] );
			const p2 = new ModelPosition( root, [ 2 ] );
			const p3 = new ModelPosition( root, [ 1, 0, 2 ] );

			expect( p1.isValid() ).to.be.true;
			expect( p2.isValid() ).to.be.true;
			expect( p3.isValid() ).to.be.true;
		} );

		it( 'should return false for a position that points to a place that exists in current model tree', () => {
			const p1 = new ModelPosition( root, [ -1 ] );
			const p2 = new ModelPosition( root, [ 3 ] );
			const p3 = new ModelPosition( root, [ 1, 4, 0 ] );
			const p4 = new ModelPosition( root, [ 1, 0, 0, 0 ] );

			expect( p1.isValid() ).to.be.false;
			expect( p2.isValid() ).to.be.false;
			expect( p3.isValid() ).to.be.false;
			expect( p4.isValid() ).to.be.false;
		} );
	} );

	describe( 'getParentPath()', () => {
		it( 'should have proper parent path', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );

			expect( position.getParentPath() ).to.deep.equal( [ 1, 2 ] );
		} );
	} );

	describe( 'isBefore()', () => {
		it( 'should return true if given position has same root and is before this position', () => {
			const position = new ModelPosition( root, [ 1, 1, 2 ] );
			const beforePosition = new ModelPosition( root, [ 1, 0 ] );

			expect( position.isAfter( beforePosition ) ).to.be.true;
		} );

		it( 'should return false if given position has same root and is not before this position', () => {
			const position = new ModelPosition( root, [ 1, 1, 2 ] );
			const afterPosition = new ModelPosition( root, [ 1, 2 ] );

			expect( position.isAfter( afterPosition ) ).to.be.false;
		} );

		it( 'should return false if given position has different root', () => {
			const position = new ModelPosition( root, [ 1, 1, 2 ] );
			const differentPosition = new ModelPosition( otherRoot, [ 1, 0 ] );

			expect( position.isAfter( differentPosition ) ).to.be.false;
		} );
	} );

	describe( 'isEqual()', () => {
		it( 'should return true if given position has same path and root', () => {
			const position = new ModelPosition( root, [ 1, 1, 2 ] );
			const samePosition = new ModelPosition( root, [ 1, 1, 2 ] );

			expect( position.isEqual( samePosition ) ).to.be.true;
		} );

		it( 'should return false if given position has different path', () => {
			const position = new ModelPosition( root, [ 1, 1, 1 ] );
			const differentPosition = new ModelPosition( root, [ 1, 2, 2 ] );

			expect( position.isEqual( differentPosition ) ).to.be.false;
		} );

		it( 'should return false if given position has different root', () => {
			const position = new ModelPosition( root, [ 1, 1, 1 ] );
			const differentPosition = new ModelPosition( otherRoot, [ 1, 1, 1 ] );

			expect( position.isEqual( differentPosition ) ).to.be.false;
		} );
	} );

	describe( 'isAfter()', () => {
		it( 'should return true if given position has same root and is after this position', () => {
			const position = new ModelPosition( root, [ 1, 1, 2 ] );
			const afterPosition = new ModelPosition( root, [ 1, 2 ] );

			expect( position.isBefore( afterPosition ) ).to.be.true;
		} );

		it( 'should return false if given position has same root and is not after this position', () => {
			const position = new ModelPosition( root, [ 1, 1, 2 ] );
			const beforePosition = new ModelPosition( root, [ 1, 0 ] );

			expect( position.isBefore( beforePosition ) ).to.be.false;
		} );

		it( 'should return false if given position has different root', () => {
			const position = new ModelPosition( root, [ 1, 1, 2 ] );
			const differentPosition = new ModelPosition( otherRoot, [ 1, 2 ] );

			expect( position.isBefore( differentPosition ) ).to.be.false;
		} );
	} );

	describe( 'isTouching()', () => {
		it( 'should return true if positions are same', () => {
			const position = new ModelPosition( root, [ 1, 1, 1 ] );
			const result = position.isTouching( new ModelPosition( root, [ 1, 1, 1 ] ) );

			expect( result ).to.be.true;
		} );

		it( 'should return true if given position is in next node and there are no whole nodes before it', () => {
			const positionA = new ModelPosition( root, [ 1 ] );
			const positionB = new ModelPosition( root, [ 1, 0, 0 ] );

			expect( positionA.isTouching( positionB ) ).to.be.true;
			expect( positionB.isTouching( positionA ) ).to.be.true;
		} );

		it( 'should return true if given position is in previous node and there are no whole nodes after it', () => {
			const positionA = new ModelPosition( root, [ 2 ] );
			const positionB = new ModelPosition( root, [ 1, 1, 3 ] );

			expect( positionA.isTouching( positionB ) ).to.be.true;
			expect( positionB.isTouching( positionA ) ).to.be.true;
		} );

		it( 'should return true if positions are in different sub-trees but there are no whole nodes between them', () => {
			const positionA = new ModelPosition( root, [ 1, 0, 3 ] );
			const positionB = new ModelPosition( root, [ 1, 1, 0 ] );

			expect( positionA.isTouching( positionB ) ).to.be.true;
			expect( positionB.isTouching( positionA ) ).to.be.true;
		} );

		it( 'should return false if there are whole nodes between positions - same level', () => {
			const positionA = new ModelPosition( root, [ 0 ] );
			const positionB = new ModelPosition( root, [ 2 ] );

			expect( positionA.isTouching( positionB ) ).to.be.false;
			expect( positionB.isTouching( positionA ) ).to.be.false;
		} );

		it( 'should return false if there are whole nodes between positions - different levels', () => {
			const positionA = new ModelPosition( root, [ 2 ] );
			const positionB = new ModelPosition( root, [ 1, 0, 3 ] );

			expect( positionA.isTouching( positionB ) ).to.be.false;
			expect( positionB.isTouching( positionA ) ).to.be.false;
		} );

		it( 'should return false if there are whole nodes between positions (same depth)', () => {
			const positionA = new ModelPosition( root, [ 1, 0 ] );
			const positionB = new ModelPosition( root, [ 1, 1 ] );

			expect( positionA.isTouching( positionB ) ).to.be.false;
			expect( positionB.isTouching( positionA ) ).to.be.false;
		} );

		it( 'should return false if there are whole nodes between positions (same depth, but deeper)', () => {
			const positionA = new ModelPosition( root, [ 1, 0, 3 ] );
			const positionB = new ModelPosition( root, [ 1, 1, 1 ] );

			expect( positionA.isTouching( positionB ) ).to.be.false;
			expect( positionB.isTouching( positionA ) ).to.be.false;
		} );

		it( 'should return false if positions are in different roots', () => {
			const positionA = new ModelPosition( root, [ 1, 0, 3 ] );
			const positionB = new ModelPosition( otherRoot, [ 1, 1, 0 ] );

			expect( positionA.isTouching( positionB ) ).to.be.false;
			expect( positionB.isTouching( positionA ) ).to.be.false;
		} );
	} );

	describe( 'hasSameParentAs()', () => {
		it( 'should return false if positions have different roots', () => {
			const posA = new ModelPosition( root, [ 1, 2 ] );
			const posB = new ModelPosition( doc.graveyard, [ 1, 0 ] );

			expect( posA.hasSameParentAs( posB ) ).to.be.false;
			expect( posB.hasSameParentAs( posA ) ).to.be.false;
		} );

		it( 'should return false if positions have different parents', () => {
			const posA = new ModelPosition( root, [ 0, 1 ] );
			const posB = new ModelPosition( root, [ 1, 1 ] );

			expect( posA.hasSameParentAs( posB ) ).to.be.false;
			expect( posB.hasSameParentAs( posA ) ).to.be.false;
		} );

		it( 'should return true if positions have same parent', () => {
			const posA = new ModelPosition( root, [ 0, 4, 8 ] );
			const posB = new ModelPosition( root, [ 0, 4, 2 ] );

			expect( posA.hasSameParentAs( posB ) ).to.be.true;
			expect( posB.hasSameParentAs( posA ) ).to.be.true;
		} );
	} );

	describe( 'isAtStart()', () => {
		it( 'should return true if position is at the beginning of its parent', () => {
			expect( new ModelPosition( root, [ 0 ] ).isAtStart ).to.be.true;
			expect( new ModelPosition( root, [ 1 ] ).isAtStart ).to.be.false;
		} );
	} );

	describe( 'isAtEnd()', () => {
		it( 'should return true if position is at the end of its parent', () => {
			expect( new ModelPosition( root, [ root.maxOffset ] ).isAtEnd ).to.be.true;
			expect( new ModelPosition( root, [ 0 ] ).isAtEnd ).to.be.false;
		} );
	} );

	describe( 'getAncestors()', () => {
		it( 'should return position parent element and it\'s ancestors', () => {
			expect( new ModelPosition( root, [ 1, 1, 1 ] ).getAncestors() ).to.deep.equal( [ root, ul, li2 ] );
		} );

		it( 'should return ModelDocumentFragment if position is directly in document fragment', () => {
			const docFrag = new ModelDocumentFragment();

			expect( new ModelPosition( docFrag, [ 0 ] ).getAncestors() ).to.deep.equal( [ docFrag ] );
		} );
	} );

	describe( 'findAncestor()', () => {
		it( 'should return position parent element', () => {
			expect( new ModelPosition( root, [ 1, 1, 1 ] ).findAncestor( 'li' ) ).to.equal( li2 );
		} );

		it( 'should return deeper ancestor element', () => {
			expect( new ModelPosition( root, [ 1, 1, 1 ] ).findAncestor( 'ul' ) ).to.equal( ul );
		} );

		it( 'should return null if ancestor is not found', () => {
			expect( new ModelPosition( root, [ 1, 1, 1 ] ).findAncestor( 'p' ) ).to.be.null;
		} );

		it( 'should return null if position is not in an element', () => {
			const docFrag = new ModelDocumentFragment();

			expect( new ModelPosition( docFrag, [ 0 ] ).findAncestor( 'li' ) ).to.be.null;
		} );
	} );

	describe( 'getCommonPath()', () => {
		it( 'returns the common part', () => {
			const pos1 = new ModelPosition( root, [ 1, 0, 0 ] );
			const pos2 = new ModelPosition( root, [ 1, 0, 1 ] );

			expect( pos1.getCommonPath( pos2 ) ).to.deep.equal( [ 1, 0 ] );
		} );

		it( 'returns the common part when paths are equal', () => {
			const pos1 = new ModelPosition( root, [ 1, 0, 1 ] );
			const pos2 = new ModelPosition( root, [ 1, 0, 1 ] );
			const commonPath = pos1.getCommonPath( pos2 );

			// Ensure that we have a clone
			expect( commonPath ).to.not.equal( pos1.path );
			expect( commonPath ).to.not.equal( pos2.path );

			expect( commonPath ).to.deep.equal( [ 1, 0, 1 ] );
		} );

		it( 'returns empty array when paths totally differ', () => {
			const pos1 = new ModelPosition( root, [ 1, 1 ] );
			const pos2 = new ModelPosition( root, [ 0 ] );

			expect( pos1.getCommonPath( pos2 ) ).to.deep.equal( [] );
		} );

		it( 'returns empty array when roots differ, but paths are the same', () => {
			const pos1 = new ModelPosition( root, [ 1, 1 ] );
			const pos2 = new ModelPosition( otherRoot, [ 1, 1 ] );

			expect( pos1.getCommonPath( pos2 ) ).to.deep.equal( [] );
		} );
	} );

	describe( 'compareWith()', () => {
		it( 'should return same if positions are same', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const compared = new ModelPosition( root, [ 1, 2, 3 ] );

			expect( position.compareWith( compared ) ).to.equal( 'same' );
		} );

		it( 'should return before if the position is before compared one', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const compared = new ModelPosition( root, [ 1, 3 ] );

			expect( position.compareWith( compared ) ).to.equal( 'before' );
		} );

		it( 'should return after if the position is after compared one', () => {
			const position = new ModelPosition( root, [ 1, 2, 3, 4 ] );
			const compared = new ModelPosition( root, [ 1, 2, 3 ] );

			expect( position.compareWith( compared ) ).to.equal( 'after' );
		} );

		it( 'should return different if positions are in different roots', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const compared = new ModelPosition( otherRoot, [ 1, 2, 3 ] );

			expect( position.compareWith( compared ) ).to.equal( 'different' );
		} );
	} );

	describe( 'getLastMatchingPosition()', () => {
		it( 'should skip forward', () => {
			let position = new ModelPosition( root, [ 1, 0, 0 ] );

			position = position.getLastMatchingPosition( value => value.type == 'text' );

			expect( position.path ).to.deep.equal( [ 1, 0, 3 ] );
		} );

		it( 'should skip backward', () => {
			let position = new ModelPosition( root, [ 1, 0, 2 ] );

			position = position.getLastMatchingPosition( value => value.type == 'text', { direction: 'backward' } );

			expect( position.path ).to.deep.equal( [ 1, 0, 0 ] );
		} );
	} );

	describe( 'clone()', () => {
		it( 'should return new instance of position', () => {
			const position = ModelPosition._createAt( ul, 0 );

			const positionCopy = position.clone();

			expect( positionCopy ).to.have.property( 'path' ).that.deep.equals( [ 1, 0 ] );
			expect( positionCopy ).to.have.property( 'root' ).that.equals( position.root );
			expect( positionCopy ).to.not.equal( position );
		} );
	} );

	// Note: We don't create model element structure in these tests because this method
	// is used by OT so it must not check the structure.
	describe( 'getTransformedByOperation()', () => {
		let pos;

		beforeEach( () => {
			pos = new ModelPosition( root, [ 3, 2 ] );
		} );

		describe( 'by AttributeOperation', () => {
			it( 'nothing should change', () => {
				const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 6 ) );
				const op = new AttributeOperation( range, 'key', true, false, 1 );
				const transformed = pos.getTransformedByOperation( op );

				expect( transformed.path ).to.deep.equal( [ 3, 2 ] );
			} );
		} );

		describe( 'by InsertOperation', () => {
			it( 'should use _getTransformedByInsertion', () => {
				sinon.spy( pos, '_getTransformedByInsertion' );

				const op = new InsertOperation( new ModelPosition( root, [ 1 ] ), [ new ModelElement( 'paragraph' ) ], 1 );
				pos.getTransformedByOperation( op );

				expect( pos._getTransformedByInsertion.calledWithExactly( op.position, op.howMany ) ).to.be.true;
			} );
		} );

		describe( 'by MarkerOperation', () => {
			it( 'nothing should change', () => {
				const op = new MarkerOperation(
					'marker', null,
					new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 6 ) ), model.markers, true, 1
				);
				const transformed = pos.getTransformedByOperation( op );

				expect( transformed.path ).to.deep.equal( [ 3, 2 ] );
			} );
		} );

		describe( 'by MoveOperation', () => {
			it( 'should use _getTransformedByMove', () => {
				sinon.spy( pos, '_getTransformedByMove' );

				const op = new MoveOperation( new ModelPosition( root, [ 1 ] ), 2, new ModelPosition( root, [ 5 ] ), 1 );
				pos.getTransformedByOperation( op );

				expect( pos._getTransformedByMove.calledWithExactly( op.sourcePosition, op.targetPosition, op.howMany ) ).to.be.true;
			} );
		} );

		describe( 'by RenameOperation', () => {
			it( 'nothing should change', () => {
				const op = new RenameOperation( new ModelPosition( root, [ 3 ] ), 'old', 'new', 1 );
				const transformed = pos.getTransformedByOperation( op );

				expect( transformed.path ).to.deep.equal( [ 3, 2 ] );
			} );
		} );

		describe( 'by SplitOperation', () => {
			it( 'transformed position is at the split position', () => {
				const splitPosition = new ModelPosition( root, [ 3, 2 ] );
				const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

				const op = new SplitOperation( splitPosition, 3, insertionPosition, null, 1 );
				const transformed = pos.getTransformedByOperation( op );

				expect( transformed.path ).to.deep.equal( [ 3, 2 ] );
			} );

			it( 'transformed position is after the split position', () => {
				const splitPosition = new ModelPosition( root, [ 3, 1 ] );
				const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

				const op = new SplitOperation( splitPosition, 3, insertionPosition, null, 1 );
				const transformed = pos.getTransformedByOperation( op );

				expect( transformed.path ).to.deep.equal( [ 4, 1 ] );
			} );

			it( 'transformed position is before the split position', () => {
				const splitPosition = new ModelPosition( root, [ 3, 3 ] );
				const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

				const op = new SplitOperation( splitPosition, 3, insertionPosition, null, 1 );
				const transformed = pos.getTransformedByOperation( op );

				expect( transformed.path ).to.deep.equal( [ 3, 2 ] );
			} );

			it( 'transformed position is after the split element', () => {
				const splitPosition = new ModelPosition( root, [ 3, 1, 5 ] );
				const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

				const op = new SplitOperation( splitPosition, 3, insertionPosition, null, 1 );
				const transformed = pos.getTransformedByOperation( op );

				expect( transformed.path ).to.deep.equal( [ 3, 3 ] );
			} );

			it( 'transformed position is before the split element', () => {
				const splitPosition = new ModelPosition( root, [ 3, 3, 5 ] );
				const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

				const op = new SplitOperation( splitPosition, 3, insertionPosition, null, 1 );
				const transformed = pos.getTransformedByOperation( op );

				expect( transformed.path ).to.deep.equal( [ 3, 2 ] );
			} );

			it( 'transformed position is in graveyard and split position uses graveyard element', () => {
				pos = new ModelPosition( doc.graveyard, [ 1 ] );

				const splitPosition = new ModelPosition( root, [ 3, 2 ] );
				const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

				const op = new SplitOperation( splitPosition, 3, insertionPosition, new ModelPosition( doc.graveyard, [ 0 ] ), 1 );
				const transformed = pos.getTransformedByOperation( op );

				expect( transformed.path ).to.deep.equal( [ 0 ] );
			} );
		} );

		describe( 'by MergeOperation', () => {
			it( 'position is inside merged element', () => {
				const op = new MergeOperation(
					new ModelPosition( root, [ 3, 0 ] ),
					3,
					new ModelPosition( root, [ 2, 2 ] ),
					new ModelPosition( doc.graveyard, [ 0 ] ), 1
				);

				const transformed = pos.getTransformedByOperation( op );

				expect( transformed.path ).to.deep.equal( [ 2, 4 ] );
			} );

			it( 'position is inside merged-to element', () => {
				const op = new MergeOperation(
					new ModelPosition( root, [ 4, 0 ] ),
					3,
					new ModelPosition( root, [ 3, 5 ] ),
					new ModelPosition( doc.graveyard, [ 0 ] ), 1
				);

				const transformed = pos.getTransformedByOperation( op );

				expect( transformed.path ).to.deep.equal( [ 3, 2 ] );
			} );

			it( 'position is before merged element', () => {
				const op = new MergeOperation(
					new ModelPosition( root, [ 3, 2, 0 ] ),
					3,
					new ModelPosition( root, [ 3, 1, 2 ] ),
					new ModelPosition( doc.graveyard, [ 0 ] ), 1
				);

				const transformed = pos.getTransformedByOperation( op );

				expect( transformed.path ).to.deep.equal( [ 3, 2 ] );
			} );

			it( 'position is after merged element', () => {
				const op = new MergeOperation(
					new ModelPosition( root, [ 3, 1, 0 ] ),
					3,
					new ModelPosition( root, [ 3, 0, 2 ] ),
					new ModelPosition( doc.graveyard, [ 0 ] ),
					1
				);

				const transformed = pos.getTransformedByOperation( op );

				expect( transformed.path ).to.deep.equal( [ 3, 1 ] );
			} );

			it( 'position is inside graveyard', () => {
				pos = new ModelPosition( doc.graveyard, [ 0 ] );

				const op = new MergeOperation(
					new ModelPosition( root, [ 3, 1, 0 ] ),
					3,
					new ModelPosition( root, [ 3, 0, 2 ] ),
					new ModelPosition( doc.graveyard, [ 0 ] ),
					1
				);

				const transformed = pos.getTransformedByOperation( op );

				expect( transformed.path ).to.deep.equal( [ 1 ] );
			} );

			it( 'merge source position is before merge target position and position is in merged element', () => {
				const op = new MergeOperation(
					new ModelPosition( root, [ 3, 0 ] ),
					3,
					new ModelPosition( root, [ 4, 5 ] ),
					new ModelPosition( doc.graveyard, [ 0 ] ),
					1
				);

				const transformed = pos.getTransformedByOperation( op );

				expect( transformed.path ).to.deep.equal( [ 3, 7 ] );
			} );
		} );
	} );

	describe( '_getTransformedByInsertion()', () => {
		it( 'should return a new Position instance', () => {
			const position = new ModelPosition( root, [ 0 ] );
			const transformed = position._getTransformedByInsertion( new ModelPosition( root, [ 2 ] ), 4 );

			expect( transformed ).not.to.equal( position );
			expect( transformed ).to.be.instanceof( ModelPosition );
		} );

		it( 'should increment offset if insertion is in the same parent and closer offset', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const transformed = position._getTransformedByInsertion( new ModelPosition( root, [ 1, 2, 2 ] ), 2 );

			expect( transformed.offset ).to.equal( 5 );
		} );

		it( 'should not increment offset if insertion position is in different root', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const transformed = position._getTransformedByInsertion( new ModelPosition( otherRoot, [ 1, 2, 2 ] ), 2 );

			expect( transformed.offset ).to.equal( 3 );
		} );

		it( 'should increment offset if insertion is in the same parent and the same offset', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const transformed = position._getTransformedByInsertion( new ModelPosition( root, [ 1, 2, 3 ] ), 2 );

			expect( transformed.offset ).to.equal( 5 );
		} );

		it( 'should increment offset if insertion is in the same parent and the same offset and it is inserted before', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			position.stickiness = 'toNext';
			const transformed = position._getTransformedByInsertion( new ModelPosition( root, [ 1, 2, 3 ] ), 2 );

			expect( transformed.offset ).to.equal( 5 );
		} );

		it( 'should not increment offset if insertion is in the same parent and further offset', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const transformed = position._getTransformedByInsertion( new ModelPosition( root, [ 1, 2, 4 ] ), 2 );

			expect( transformed.offset ).to.equal( 3 );
		} );

		it( 'should update path if insertion position parent is a node from that path and offset is before next node on that path', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const transformed = position._getTransformedByInsertion( new ModelPosition( root, [ 1, 2 ] ), 2 );

			expect( transformed.path ).to.deep.equal( [ 1, 4, 3 ] );
		} );

		it( 'should not update path if insertion position parent is a node from that path and offset is ' +
			'after next node on that path', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const transformed = position._getTransformedByInsertion( new ModelPosition( root, [ 1, 3 ] ), 2 );

			expect( transformed.path ).to.deep.equal( [ 1, 2, 3 ] );
		} );

		it( 'should not update if insertion is in different path', () => {
			const position = new ModelPosition( root, [ 1, 1 ] );
			const transformed = position._getTransformedByInsertion( new ModelPosition( root, [ 2, 0 ] ), 2 );

			expect( transformed.path ).to.deep.equal( [ 1, 1 ] );
		} );
	} );

	describe( '_getTransformedByDeletion()', () => {
		it( 'should return a new Position instance', () => {
			const position = new ModelPosition( root, [ 0 ] );
			const transformed = position._getTransformedByDeletion( new ModelPosition( root, [ 2 ] ), 4 );

			expect( transformed ).not.to.equal( position );
			expect( transformed ).to.be.instanceof( ModelPosition );
		} );

		it( 'should return null if original position is inside one of removed nodes', () => {
			const position = new ModelPosition( root, [ 1, 2 ] );
			const transformed = position._getTransformedByDeletion( new ModelPosition( root, [ 0 ] ), 2 );

			expect( transformed ).to.be.null;
		} );

		it( 'should decrement offset if deletion is in the same parent and closer offset', () => {
			const position = new ModelPosition( root, [ 1, 2, 7 ] );
			const transformed = position._getTransformedByDeletion( new ModelPosition( root, [ 1, 2, 2 ] ), 2 );

			expect( transformed.offset ).to.equal( 5 );
		} );

		it( 'should return null if original position is between removed nodes', () => {
			const position = new ModelPosition( root, [ 1, 2, 4 ] );
			const transformed = position._getTransformedByDeletion( new ModelPosition( root, [ 1, 2, 3 ] ), 5 );

			expect( transformed ).to.be.null;
		} );

		it( 'should not decrement offset if deletion position is in different root', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const transformed = position._getTransformedByDeletion( new ModelPosition( otherRoot, [ 1, 2, 1 ] ), 2 );

			expect( transformed.offset ).to.equal( 3 );
		} );

		it( 'should not decrement offset if deletion is in the same parent and further offset', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const transformed = position._getTransformedByDeletion( new ModelPosition( root, [ 1, 2, 4 ] ), 2 );

			expect( transformed.offset ).to.equal( 3 );
		} );

		it( 'should update path if deletion position parent is a node from that path and offset is before next node on that path', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const transformed = position._getTransformedByDeletion( new ModelPosition( root, [ 1, 0 ] ), 2 );

			expect( transformed.path ).to.deep.equal( [ 1, 0, 3 ] );
		} );

		it( 'should not update path if deletion position parent is a node from that path and ' +
		'offset is after next node on that path', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const transformed = position._getTransformedByDeletion( new ModelPosition( root, [ 1, 3 ] ), 2 );

			expect( transformed.path ).to.deep.equal( [ 1, 2, 3 ] );
		} );
	} );

	describe( '_getTransformedByMove()', () => {
		it( 'should increment offset if a range was moved to the same parent and closer offset', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const transformed = position._getTransformedByMove(
				new ModelPosition( root, [ 2 ] ),
				new ModelPosition( root, [ 1, 2, 0 ] ),
				3, false
			);

			expect( transformed.path ).to.deep.equal( [ 1, 2, 6 ] );
		} );

		it( 'should decrement offset if a range was moved from the same parent and closer offset', () => {
			const position = new ModelPosition( root, [ 1, 2, 6 ] );
			const transformed = position._getTransformedByMove(
				new ModelPosition( root, [ 1, 2, 0 ] ),
				new ModelPosition( root, [ 2 ] ),
				3, false
			);

			expect( transformed.path ).to.deep.equal( [ 1, 2, 3 ] );
		} );

		it( 'should decrement offset if position was at the end of a range and move was not sticky', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const transformed = position._getTransformedByMove(
				new ModelPosition( root, [ 1, 2, 0 ] ),
				new ModelPosition( root, [ 2 ] ),
				3, false
			);

			expect( transformed.path ).to.deep.equal( [ 1, 2, 0 ] );
		} );

		it( 'should update path if position was at the end of a range and move was sticky', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			position.stickiness = 'toPrevious';
			const transformed = position._getTransformedByMove(
				new ModelPosition( root, [ 1, 2, 0 ] ),
				new ModelPosition( root, [ 2 ] ),
				3, false
			);

			expect( transformed.path ).to.deep.equal( [ 5 ] );
		} );

		it( 'should update path if a range contained this position', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const transformed = position._getTransformedByMove(
				new ModelPosition( root, [ 1, 1 ] ),
				new ModelPosition( root, [ 2, 1 ] ),
				3, false
			);

			expect( transformed.path ).to.deep.equal( [ 2, 2, 3 ] );
		} );

		it( 'should not update if targetPosition is equal to sourcePosition (because nothing is really moving)', () => {
			const position = new ModelPosition( root, [ 3 ] );
			const transformed = position._getTransformedByMove(
				new ModelPosition( root, [ 3 ] ),
				new ModelPosition( root, [ 3 ] ),
				3, false
			);

			expect( transformed.path ).to.deep.equal( [ 3 ] );
		} );

		it( 'should update if position is before moved range and sticks to next node', () => {
			const position = new ModelPosition( root, [ 2, 1 ] );
			position.stickiness = 'toNext';

			const transformed = position._getTransformedByMove(
				new ModelPosition( root, [ 2, 1 ] ),
				new ModelPosition( root, [ 3, 3 ] ),
				2, false
			);

			expect( transformed.path ).to.deep.equal( [ 3, 3 ] );
		} );
	} );

	describe( '_getCombined()', () => {
		it( 'should return correct combination of this and given positions', () => {
			const position = new ModelPosition( root, [ 1, 3, 4, 2 ] );
			const sourcePosition = new ModelPosition( root, [ 1, 1 ] );
			const targetPosition = new ModelPosition( root, [ 2, 5 ] );

			const combined = position._getCombined( sourcePosition, targetPosition );

			expect( combined.path ).to.deep.equal( [ 2, 7, 4, 2 ] );
		} );
	} );

	describe( 'getShiftedBy()', () => {
		it( 'should return a new instance of Position with offset changed by shift value', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const shifted = position.getShiftedBy( 2 );

			expect( shifted ).to.be.instanceof( ModelPosition );
			expect( shifted ).to.not.equal( position );
			expect( shifted.path ).to.deep.equal( [ 1, 2, 5 ] );
		} );

		it( 'should accept negative values', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const shifted = position.getShiftedBy( -2 );

			expect( shifted.path ).to.deep.equal( [ 1, 2, 1 ] );
		} );

		it( 'should not let setting offset lower than zero', () => {
			const position = new ModelPosition( root, [ 1, 2, 3 ] );
			const shifted = position.getShiftedBy( -7 );

			expect( shifted.path ).to.deep.equal( [ 1, 2, 0 ] );
		} );
	} );

	describe( 'toJSON()', () => {
		it( 'should serialize position', () => {
			const position = new ModelPosition( root, [ 0 ] );

			const serialized = position.toJSON();

			expect( serialized ).to.deep.equal( { root: 'main', path: [ 0 ], stickiness: 'toNone' } );
		} );

		it( 'should serialize position from graveyard', () => {
			const position = new ModelPosition( doc.graveyard, [ 0 ] );
			position.stickiness = 'toPrevious';

			const serialized = position.toJSON();

			expect( serialized ).to.deep.equal( { root: '$graveyard', path: [ 0 ], stickiness: 'toPrevious' } );
		} );
	} );

	describe( 'fromJSON()', () => {
		it( 'should create object with given document', () => {
			const deserialized = ModelPosition.fromJSON( { root: 'main', path: [ 0, 1, 2 ] }, doc );

			expect( deserialized.root ).to.equal( root );
			expect( deserialized.path ).to.deep.equal( [ 0, 1, 2 ] );
		} );

		it( 'should create object from graveyard', () => {
			const deserialized = ModelPosition.fromJSON( { root: '$graveyard', path: [ 0, 1, 2 ] }, doc );

			expect( deserialized.root ).to.equal( doc.graveyard );
			expect( deserialized.path ).to.deep.equal( [ 0, 1, 2 ] );
		} );

		it( 'should throw error when creating object in document that does not have provided root', () => {
			expectToThrowCKEditorError( () => {
				ModelPosition.fromJSON( { root: 'noroot', path: [ 0 ] }, doc );
			}, /model-position-fromjson-no-root/, model );
		} );
	} );

	describe( 'getCommonAncestor()', () => {
		it( 'returns null when roots of both positions are not the same', () => {
			const pos1 = new ModelPosition( root, [ 0 ] );
			const pos2 = new ModelPosition( otherRoot, [ 0 ] );

			testAncestor( pos1, pos2, null );
		} );

		it( 'for two the same positions returns the parent element #1', () => {
			const fPosition = new ModelPosition( root, [ 1, 0, 0 ] );
			const otherPosition = new ModelPosition( root, [ 1, 0, 0 ] );

			testAncestor( fPosition, otherPosition, li1 );
		} );

		it( 'for two the same positions returns the parent element #2', () => {
			const model = new Model();
			const doc = model.document;
			const root = doc.createRoot();

			const p = new ModelElement( 'p', null, 'foobar' );

			root._appendChild( p );

			const position = new ModelPosition( root, [ 0, 3 ] ); // <p>foo^bar</p>

			testAncestor( position, position, p );
		} );

		it( 'for two positions in the same element returns the element', () => {
			const fPosition = new ModelPosition( root, [ 1, 0, 0 ] );
			const zPosition = new ModelPosition( root, [ 1, 0, 2 ] );

			testAncestor( fPosition, zPosition, li1 );
		} );

		it( 'works when one positions is nested deeper than the other', () => {
			const zPosition = new ModelPosition( root, [ 1, 0, 2 ] );
			const liPosition = new ModelPosition( root, [ 1, 1 ] );

			testAncestor( liPosition, zPosition, ul );
		} );

		// Checks if by mistake someone didn't use getCommonPath() + getNodeByPath().
		it( 'works if position is located before an element', () => {
			const model = new Model();
			const doc = model.document;
			const root = doc.createRoot();

			const p = new ModelElement( 'p', null, new ModelElement( 'a' ) );

			root._appendChild( p );

			const position = new ModelPosition( root, [ 0, 0 ] ); // <p>^<a></a></p>

			testAncestor( position, position, p );
		} );

		it( 'works fine with positions located in ModelDocumentFragment', () => {
			const docFrag = new ModelDocumentFragment( [ p, ul ] );
			const zPosition = new ModelPosition( docFrag, [ 1, 0, 2 ] );
			const afterLiPosition = new ModelPosition( docFrag, [ 1, 2 ] );

			testAncestor( zPosition, afterLiPosition, ul );
		} );

		function testAncestor( positionA, positionB, lca ) {
			expect( positionA.getCommonAncestor( positionB ) ).to.equal( lca );
			expect( positionB.getCommonAncestor( positionA ) ).to.equal( lca );
		}
	} );

	describe( 'getTextNodeAtPosition() util', () => {
		it( 'returns a text node at the given position', () => {
			const position = new ModelPosition( root, [ 1, 0, 1 ] );
			const positionParent = position.parent;

			expect( getTextNodeAtPosition( position, positionParent ) ).to.equal( foz );
		} );

		// This util is covered with tests by Position#textNode tests.
	} );

	describe( 'getNodeAfterPosition() util', () => {
		it( 'returns a node after the position', () => {
			const position = new ModelPosition( root, [ 1, 0 ] );
			const positionParent = position.parent;
			const textNode = getTextNodeAtPosition( position, positionParent );

			expect( getNodeAfterPosition( position, positionParent, textNode ) ).to.equal( li1 );
		} );

		// This util is covered with tests by Position#nodeAfter tests.
	} );

	describe( 'getNodeBeforePosition() util', () => {
		it( 'returns a node before the position', () => {
			const position = new ModelPosition( root, [ 1, 1 ] );
			const positionParent = position.parent;
			const textNode = getTextNodeAtPosition( position, positionParent );

			expect( getNodeBeforePosition( position, positionParent, textNode ) ).to.equal( li1 );
		} );

		// This util is covered with tests by Position#nodeBefore tests.
	} );
} );
