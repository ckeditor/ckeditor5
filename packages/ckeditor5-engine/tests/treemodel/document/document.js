/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import Document from '/ckeditor5/core/treemodel/document.js';
import RootElement from '/ckeditor5/core/treemodel/rootelement.js';
import Batch from '/ckeditor5/core/treemodel/batch.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';
import Text from '/ckeditor5/core/treemodel/text.js';
import Element from '/ckeditor5/core/treemodel/element.js';
import Range from '/ckeditor5/core/treemodel/range.js';
import Position from '/ckeditor5/core/treemodel/position.js';

describe( 'Document', () => {
	let doc;

	beforeEach( () => {
		doc = new Document();
	} );

	describe( 'constructor', () => {
		it( 'should create Document with no data, empty graveyard and empty selection', () => {
			expect( doc ).to.have.property( 'roots' ).that.is.instanceof( Map );
			expect( doc.roots.size ).to.equal( 1 );
			expect( doc.graveyard ).to.be.instanceof( RootElement );
			expect( doc.graveyard.getChildCount() ).to.equal( 0 );
			expect( doc.selection.getRanges().length ).to.equal( 0 );
		} );
	} );

	describe( 'createRoot', () => {
		it( 'should create a new RootElement, add it to roots map and return it', () => {
			let root = doc.createRoot( 'root', 'root' );

			expect( doc.roots.size ).to.equal( 2 );
			expect( root ).to.be.instanceof( RootElement );
			expect( root.getChildCount() ).to.equal( 0 );
		} );

		it( 'should throw an error when trying to create a second root with the same id', () => {
			doc.createRoot( 'root', 'root' );

			expect(
				() => {
					doc.createRoot( 'root', 'root' );
				}
			).to.throw( CKEditorError, /document-createRoot-id-exists/ );
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return a RootElement previously created with given id', () => {
			let newRoot = doc.createRoot( 'root' );
			let getRoot = doc.getRoot( 'root' );

			expect( getRoot ).to.equal( newRoot );
		} );

		it( 'should throw an error when trying to get non-existent root', () => {
			expect(
				() => {
					doc.getRoot( 'root' );
				}
			).to.throw( CKEditorError, /document-getRoot-root-not-exist/ );
		} );
	} );

	describe( 'applyOperation', () => {
		it( 'should increase document version, execute operation and fire event with proper data', () => {
			const changeCallback = sinon.spy();
			const type = 't';
			const data = { data: 'x' };
			const batch = 'batch';

			let operation = {
				type: type,
				delta: { batch: batch },
				baseVersion: 0,
				_execute: sinon.stub().returns( data )
			};

			doc.on( 'change', changeCallback );
			doc.applyOperation( operation );

			expect( doc.version ).to.equal( 1 );
			sinon.assert.calledOnce( operation._execute );

			sinon.assert.calledOnce( changeCallback );
			expect( changeCallback.args[ 0 ][ 1 ] ).to.equal( type );
			expect( changeCallback.args[ 0 ][ 2 ] ).to.equal( data );
			expect( changeCallback.args[ 0 ][ 3 ] ).to.equal( batch );
		} );

		it( 'should throw an error on the operation base version and the document version is different', () => {
			let operation = {
				baseVersion: 1
			};

			expect(
				() => {
					doc.applyOperation( operation );
				}
			).to.throw( CKEditorError, /document-applyOperation-wrong-version/ );
		} );
	} );

	describe( 'batch', () => {
		it( 'should create a new batch with the document property', () => {
			const batch = doc.batch();

			expect( batch ).to.be.instanceof( Batch );
			expect( batch ).to.have.property( 'doc' ).that.equals( doc );
		} );
	} );

	describe( 'enqueue', () => {
		it( 'should be executed immediately and fire changesDone event', () => {
			let order = [];

			doc.on( 'changesDone', () => order.push( 'done' ) );

			doc.enqueueChanges( () => order.push( 'enqueue1' ) );

			expect( order ).to.have.length( 2 );
			expect( order[ 0 ] ).to.equal( 'enqueue1' );
			expect( order[ 1 ] ).to.equal( 'done' );
		} );

		it( 'should fire done every time queue is empty', () => {
			let order = [];

			doc.on( 'changesDone', () => order.push( 'done' ) );

			doc.enqueueChanges( () => order.push( 'enqueue1' ) );
			doc.enqueueChanges( () => order.push( 'enqueue2' ) );

			expect( order ).to.have.length( 4 );
			expect( order[ 0 ] ).to.equal( 'enqueue1' );
			expect( order[ 1 ] ).to.equal( 'done' );
			expect( order[ 2 ] ).to.equal( 'enqueue2' );
			expect( order[ 3 ] ).to.equal( 'done' );
		} );

		it( 'should put callbacks in the proper order', () => {
			let order = [];

			doc.on( 'changesDone', () => order.push( 'done' ) );

			doc.enqueueChanges( () => {
				order.push( 'enqueue1 start' );
				doc.enqueueChanges( () => {
					order.push( 'enqueue2 start' );
					doc.enqueueChanges( () => order.push( 'enqueue4' ) );
					order.push( 'enqueue2 end' );
				} );

				doc.enqueueChanges( () => order.push( 'enqueue3' ) );

				order.push( 'enqueue1 end' );
			} );

			expect( order ).to.have.length( 7 );
			expect( order[ 0 ] ).to.equal( 'enqueue1 start' );
			expect( order[ 1 ] ).to.equal( 'enqueue1 end' );
			expect( order[ 2 ] ).to.equal( 'enqueue2 start' );
			expect( order[ 3 ] ).to.equal( 'enqueue2 end' );
			expect( order[ 4 ] ).to.equal( 'enqueue3' );
			expect( order[ 5 ] ).to.equal( 'enqueue4' );
			expect( order[ 6 ] ).to.equal( 'done' );
		} );
	} );

	describe( '_updateSelectionAttributes', () => {
		let root;
		beforeEach( () => {
			root = doc.createRoot( 'root' );
			root.insertChildren( 0, [
				new Element( 'p', { p: true } ),
				new Text( 'a', { a: true } ),
				new Element( 'p', { p: true } ),
				new Text( 'b', { b: true } ),
				new Text( 'c', { c: true } ),
				new Element( 'p', [], [
					new Text( 'd', { d: true } )
				] ),
				new Element( 'p', { p: true } ),
				new Text( 'e', { e: true } )
			] );
		} );

		it( 'should be fired whenever selection gets updated', () => {
			sinon.spy( doc, '_updateSelectionAttributes' );

			doc.selection.fire( 'update' );

			expect( doc._updateSelectionAttributes.called ).to.be.true;
		} );

		it( 'should be fired whenever changes to Tree Model are applied', () => {
			sinon.spy( doc, '_updateSelectionAttributes' );

			doc.fire( 'changesDone' );

			expect( doc._updateSelectionAttributes.called ).to.be.true;
		} );

		it( 'if selection is a range, should find first character in it and copy it\'s attributes', () => {
			doc.selection.setRanges( [ new Range( new Position( root, [ 2 ] ), new Position( root, [ 5 ] ) ) ] );

			expect( Array.from( doc.selection.getAttributes() ) ).to.deep.equal( [ [ 'b', true ] ] );

			// Step into elements when looking for first character:
			doc.selection.setRanges( [ new Range( new Position( root, [ 5 ] ), new Position( root, [ 7 ] ) ) ] );

			expect( Array.from( doc.selection.getAttributes() ) ).to.deep.equal( [ [ 'd', true ] ] );
		} );

		it( 'if selection is collapsed it should seek a character to copy that character\'s attributes', () => {
			// Take styles from character before selection.
			doc.selection.setRanges( [ new Range( new Position( root, [ 2 ] ), new Position( root, [ 2 ] ) ) ] );
			expect( Array.from( doc.selection.getAttributes() ) ).to.deep.equal( [ [ 'a', true ] ] );

			// If there are none,
			// Take styles from character after selection.
			doc.selection.setRanges( [ new Range( new Position( root, [ 3 ] ), new Position( root, [ 3 ] ) ) ] );
			expect( Array.from( doc.selection.getAttributes() ) ).to.deep.equal( [ [ 'b', true ] ] );

			// If there are none,
			// Look from the selection position to the beginning of node looking for character to take attributes from.
			doc.selection.setRanges( [ new Range( new Position( root, [ 6 ] ), new Position( root, [ 6 ] ) ) ] );
			expect( Array.from( doc.selection.getAttributes() ) ).to.deep.equal( [ [ 'c', true ] ] );

			// If there are none,
			// Look from the selection position to the end of node looking for character to take attributes from.
			doc.selection.setRanges( [ new Range( new Position( root, [ 0 ] ), new Position( root, [ 0 ] ) ) ] );
			expect( Array.from( doc.selection.getAttributes() ) ).to.deep.equal( [ [ 'a', true ] ] );

			// If there are no characters to copy attributes from, clear selection attributes.
			doc.selection.setRanges( [ new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 0, 0 ] ) ) ] );
			expect( Array.from( doc.selection.getAttributes() ) ).to.deep.equal( [] );
		} );
	} );
} );
