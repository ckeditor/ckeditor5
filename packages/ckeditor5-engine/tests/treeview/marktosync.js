/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import ViewText from '/ckeditor5/core/treeview/text.js';
import ViewElement from '/ckeditor5/core/treeview/element.js';
import RootElement from '/ckeditor5/core/treeview/rootelement.js';

describe( 'Node.markToSync', () => {
	let root, text, img;
	let markToSyncSpy;

	before( () => {
		markToSyncSpy = sinon.spy();
	} );

	beforeEach( () => {
		text = new ViewText( 'foo' );
		img = new ViewElement( 'img' );
		img.setAttr( 'src', 'img.png' );

		root = new RootElement( 'p', { renderer: { markToSync: markToSyncSpy } } );
		root.appendChildren( [ text, img ] );

		markToSyncSpy.reset();
	} );

	describe( 'setAttr', () => {
		it( 'should mark attibutes to sync', () => {
			img.setAttr( 'width', 100 );

			sinon.assert.calledOnce( markToSyncSpy );
			sinon.assert.calledWith( markToSyncSpy, img, 'ATTRIBUTES_NEED_UPDATE' );
		} );
	} );

	describe( 'removeAttr', () => {
		it( 'should mark attibutes to sync', () => {
			img.removeAttr( 'src' );

			sinon.assert.calledOnce( markToSyncSpy );
			sinon.assert.calledWith( markToSyncSpy, img, 'ATTRIBUTES_NEED_UPDATE' );
		} );
	} );

	describe( 'insertChildren', () => {
		it( 'should mark children to sync', () => {
			root.insertChildren( 1, new ViewElement( 'img' ) );

			sinon.assert.calledOnce( markToSyncSpy );
			sinon.assert.calledWith( markToSyncSpy, root, 'CHILDREN_NEED_UPDATE' );
		} );
	} );

	describe( 'appendChildren', () => {
		it( 'should mark children to sync', () => {
			root.appendChildren( new ViewElement( 'img' ) );

			sinon.assert.calledOnce( markToSyncSpy );
			sinon.assert.calledWith( markToSyncSpy, root, 'CHILDREN_NEED_UPDATE' );
		} );
	} );

	describe( 'removeChildren', () => {
		it( 'should mark children to sync', () => {
			root.removeChildren( 1, 1 );

			sinon.assert.calledOnce( markToSyncSpy );
			sinon.assert.calledWith( markToSyncSpy, root, 'CHILDREN_NEED_UPDATE' );
		} );
	} );

	describe( 'removeChildren', () => {
		it( 'should mark children to sync', () => {
			text.setText( 'bar' );

			sinon.assert.calledOnce( markToSyncSpy );
			sinon.assert.calledWith( markToSyncSpy, text, 'TEXT_NEEDS_UPDATE' );
		} );
	} );
} );
