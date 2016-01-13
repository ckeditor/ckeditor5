/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

/* bender-include: ../_tools/tools.js */

'use strict';

const modules = bender.amd.require(
	'core/treeview/element',
	'core/treeview/rootelement',
	'core/treeview/text'
);

describe( 'Node.markToSync', () => {
	let ViewElement, ViewText, RootElement;

	let root, text, img;
	let markToSyncSpy;

	before( () => {
		ViewElement = modules[ 'core/treeview/element' ];
		ViewText = modules[ 'core/treeview/text' ];
		RootElement = modules[ 'core/treeview/rootelement' ];

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

	describe( 'cloneDomAttrs', () => {
		it( 'should mark attibutes to sync', () => {
			const domImg = document.createElement( 'img' );
			domImg.setAttribute( 'width', '10' );
			domImg.setAttribute( 'height', '10' );

			img.cloneDomAttrs( domImg );

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
