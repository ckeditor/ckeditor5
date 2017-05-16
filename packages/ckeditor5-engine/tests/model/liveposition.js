/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../src/model/document';
import DocumentFragment from '../../src/model/documentfragment';
import Element from '../../src/model/element';
import Text from '../../src/model/text';
import Position from '../../src/model/position';
import LivePosition from '../../src/model/liveposition';
import Range from '../../src/model/range';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'LivePosition', () => {
	let doc, root, ul, p, li1, li2;

	before( () => {
		doc = new Document();
		root = doc.createRoot();

		li1 = new Element( 'li', [], new Text( 'abcdef' ) );
		li2 = new Element( 'li', [], new Text( 'foobar' ) );
		ul = new Element( 'ul', [], [ li1, li2 ] );
		p = new Element( 'p', [], new Text( 'qwerty' ) );

		root.insertChildren( 0, [ p, ul ] );
	} );

	it( 'should be an instance of Position', () => {
		const live = new LivePosition( root, [ 0 ] );
		live.detach();

		expect( live ).to.be.instanceof( Position );
	} );

	it( 'should throw if given root is not a RootElement', () => {
		expect( () => {
			new LivePosition( new DocumentFragment(), [ 1 ] ); // eslint-disable-line no-new
		} ).to.throw( CKEditorError, /model-liveposition-root-not-rootelement/ );
	} );

	it( 'should listen to a change event of the document that owns this position root', () => {
		sinon.spy( LivePosition.prototype, 'listenTo' );

		const live = new LivePosition( root, [ 0 ] );
		live.detach();

		expect( live.listenTo.calledWith( doc, 'change' ) ).to.be.true;

		LivePosition.prototype.listenTo.restore();
	} );

	it( 'should stop listening when detached', () => {
		sinon.spy( LivePosition.prototype, 'stopListening' );

		const live = new LivePosition( root, [ 0 ] );
		live.detach();

		expect( live.stopListening.called ).to.be.true;

		LivePosition.prototype.stopListening.restore();
	} );

	it( 'createFromPosition should return LivePosition', () => {
		const position = LivePosition.createFromPosition( new Position( root, [ 0 ] ) );
		expect( position ).to.be.instanceof( LivePosition );
		position.detach();
	} );

	it( 'createFromParentAndOffset should return LivePosition', () => {
		const position = LivePosition.createFromParentAndOffset( ul, 0 );
		expect( position ).to.be.instanceof( LivePosition );
		position.detach();
	} );

	it( 'createBefore should return LivePosition', () => {
		const position = LivePosition.createBefore( ul );
		expect( position ).to.be.instanceof( LivePosition );
		position.detach();
	} );

	it( 'createAfter should return LivePosition', () => {
		const position = LivePosition.createAfter( ul );
		expect( position ).to.be.instanceof( LivePosition );
		position.detach();
	} );

	describe( 'should get transformed if', () => {
		let live, spy;

		beforeEach( () => {
			live = new LivePosition( root, [ 1, 4, 6 ] );

			spy = sinon.spy();
			live.on( 'change', spy );
		} );

		afterEach( () => {
			live.detach();
		} );

		describe( 'insertion', () => {
			it( 'is in the same parent and closer offset', () => {
				const insertRange = new Range( new Position( root, [ 1, 4, 0 ] ), new Position( root, [ 1, 4, 3 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.path ).to.deep.equal( [ 1, 4, 9 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is at the same position and live position is sticking to right side', () => {
				const insertRange = new Range( new Position( root, [ 1, 4, 6 ] ), new Position( root, [ 1, 4, 9 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.path ).to.deep.equal( [ 1, 4, 9 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is before a node from the live position path', () => {
				const insertRange = new Range( new Position( root, [ 1, 0 ] ), new Position( root, [ 1, 2 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.path ).to.deep.equal( [ 1, 6, 6 ] );
				expect( spy.calledOnce ).to.be.true;
			} );
		} );

		describe( 'range move', () => {
			it( 'is at the same parent and closer offset', () => {
				const moveSource = new Position( root, [ 2 ] );
				const moveRange = new Range( new Position( root, [ 1, 4, 0 ] ), new Position( root, [ 1, 4, 3 ] ) );

				const changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( [ 1, 4, 9 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is at the same position and live position is sticking to right side', () => {
				const moveSource = new Position( root, [ 2 ] );
				const moveRange = new Range( new Position( root, [ 1, 4, 6 ] ), new Position( root, [ 1, 4, 9 ] ) );

				const changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( [ 1, 4, 9 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is at a position before a node from the live position path', () => {
				const moveSource = new Position( root, [ 2 ] );
				const moveRange = new Range( new Position( root, [ 1, 0 ] ), new Position( root, [ 1, 2 ] ) );

				const changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( [ 1, 6, 6 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is from the same parent and closer offset', () => {
				const moveSource = new Position( root, [ 1, 4, 0 ] );
				const moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				const changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( [ 1, 4, 2 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is from a position before a node from the live position path', () => {
				const moveSource = new Position( root, [ 1, 0 ] );
				const moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				const changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( [ 1, 0, 6 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'contains live position (same level)', () => {
				const moveSource = new Position( root, [ 1, 4, 4 ] );
				const moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				const changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( [ 2, 2 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'contains live position (deep)', () => {
				const moveSource = new Position( root, [ 1, 3 ] );
				const moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				const changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( [ 2, 1, 6 ] );
				expect( spy.calledOnce ).to.be.true;
			} );
		} );
	} );

	describe( 'should not get transformed if', () => {
		let path, otherRoot, spy, live;

		before( () => {
			path = [ 1, 4, 6 ];
			otherRoot = doc.createRoot( '$root', 'otherRoot' );
		} );

		beforeEach( () => {
			live = new LivePosition( root, path );

			spy = sinon.spy();
			live.on( 'change', spy );
		} );

		afterEach( () => {
			live.detach();
		} );

		describe( 'insertion', () => {
			it( 'is in the same parent and further offset', () => {
				const insertRange = new Range( new Position( root, [ 1, 4, 7 ] ), new Position( root, [ 1, 4, 9 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;
			} );

			it( 'is at the same position and live position is sticking to left side', () => {
				const newLive = new LivePosition( root, path, 'sticksToPrevious' );
				spy = sinon.spy();
				newLive.on( 'change', spy );

				const insertRange = new Range( new Position( root, [ 1, 4, 6 ] ), new Position( root, [ 1, 4, 9 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( newLive.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;

				newLive.detach();
			} );

			it( 'is after a node from the position path', () => {
				const insertRange = new Range( new Position( root, [ 1, 5 ] ), new Position( root, [ 1, 7 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;
			} );

			it( 'is in different root', () => {
				const insertRange = new Range( new Position( otherRoot, [ 1, 4, 0 ] ), new Position( otherRoot, [ 1, 4, 4 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;
			} );
		} );

		describe( 'range move', () => {
			it( 'is at the same parent and further offset', () => {
				const moveSource = new Position( root, [ 2 ] );
				const moveRange = new Range( new Position( root, [ 1, 4, 7 ] ), new Position( root, [ 1, 4, 9 ] ) );

				const changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;
			} );

			it( 'is at the same position and live position is sticking to left side', () => {
				const newLive = new LivePosition( root, path, 'sticksToPrevious' );
				spy = sinon.spy();
				newLive.on( 'change', spy );

				const moveSource = new Position( root, [ 2 ] );
				const moveRange = new Range( new Position( root, [ 1, 4, 6 ] ), new Position( root, [ 1, 4, 9 ] ) );

				const changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( newLive.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;

				newLive.detach();
			} );

			it( 'is at a position after a node from the live position path', () => {
				const moveSource = new Position( root, [ 2 ] );
				const moveRange = new Range( new Position( root, [ 1, 5 ] ), new Position( root, [ 1, 7 ] ) );

				const changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;
			} );

			it( 'is from the same parent and further offset', () => {
				const moveSource = new Position( root, [ 1, 4, 7 ] );
				const moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				const changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;
			} );

			it( 'is from a position after a node from the live position path', () => {
				const moveSource = new Position( root, [ 1, 5 ] );
				const moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				const changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;
			} );

			it( 'is to different root', () => {
				const moveSource = new Position( root, [ 2, 0 ] );
				const moveRange = new Range( new Position( otherRoot, [ 1, 0 ] ), new Position( otherRoot, [ 1, 4 ] ) );

				const changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;
			} );

			it( 'is from different root', () => {
				const moveSource = new Position( otherRoot, [ 1, 0 ] );
				const moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				const changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;
			} );
		} );

		it( 'attributes changed', () => {
			const changes = {
				range: new Range( new Position( root, [ 1, 4, 0 ] ), new Position( root, [ 1, 4, 10 ] ) ),
				key: 'foo',
				oldValue: null,
				newValue: 'bar'
			};

			doc.fire( 'change', 'setAttribute', changes, null );

			expect( live.path ).to.deep.equal( path );
			expect( spy.called ).to.be.false;
		} );
	} );
} );
