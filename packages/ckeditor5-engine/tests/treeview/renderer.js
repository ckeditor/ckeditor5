/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Renderer from '/ckeditor5/core/treeview/renderer.js';
import ViewElement from '/ckeditor5/core/treeview/element.js';
import ViewText from '/ckeditor5/core/treeview/text.js';
import Converter from '/ckeditor5/core/treeview/converter.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

describe( 'Renderer', () => {
	let converter, renderer;

	before( () => {
		converter = new Converter();
		renderer = new Renderer( converter );
	} );

	describe( 'markToSync', () => {
		let viewNode;

		beforeEach( () => {
			viewNode = new ViewElement( 'p' );

			const domNode = document.createElement( 'p' );
			converter.bindElements( domNode, viewNode );
			viewNode.appendChildren( new ViewText( 'foo' ) );

			renderer.markedTexts.clear();
			renderer.markedAttrs.clear();
			renderer.markedChildren.clear();
		} );

		it( 'should mark attributes which need update', () => {
			viewNode.setAttr( 'class', 'foo' );

			renderer.markToSync( viewNode, 'ATTRIBUTES_NEED_UPDATE' );

			expect( renderer.markedAttrs.has( viewNode ) ).to.be.true;
		} );

		it( 'should mark children which need update', () => {
			viewNode.appendChildren( new ViewText( 'foo' ) );

			renderer.markToSync( viewNode, 'CHILDREN_NEED_UPDATE' );

			expect( renderer.markedChildren.has( viewNode ) ).to.be.true;
		} );

		it( 'should not mark children if element has no corresponding node', () => {
			// Overwrite viewNode with node without coresponding DOM node.
			viewNode = new ViewElement( 'p' );

			viewNode.appendChildren( new ViewText( 'foo' ) );

			renderer.markToSync( viewNode, 'CHILDREN_NEED_UPDATE' );

			expect( renderer.markedTexts.has( viewNode ) ).to.be.false;
		} );

		it( 'should mark text which need update', () => {
			const viewText = new ViewText( 'foo' );
			viewNode.appendChildren( viewText );
			viewText.setText( 'bar' );

			renderer.markToSync( viewText, 'TEXT_NEEDS_UPDATE' );

			expect( renderer.markedTexts.has( viewText ) ).to.be.true;
		} );

		it( 'should not mark text if parent has no corresponding node', () => {
			const viewText = new ViewText( 'foo' );
			// Overwrite viewNode with node without coresponding DOM node.
			viewNode = new ViewElement( 'p' );

			viewNode.appendChildren( viewText );
			viewText.setText( 'bar' );

			renderer.markToSync( viewText, 'TEXT_NEEDS_UPDATE' );

			expect( renderer.markedTexts.has( viewText ) ).to.be.false;
		} );

		it( 'should throw if the type is unknown', () => {
			expect( () => {
				renderer.markToSync( viewNode, 'UNKNOWN' );
			} ).to.throw( CKEditorError, /^renderer-unknown-type/ );
		} );
	} );

	describe( 'render', () => {
		let viewNode, domNode;

		beforeEach( () => {
			viewNode = new ViewElement( 'p' );
			domNode = document.createElement( 'p' );

			converter.bindElements( domNode, viewNode );

			renderer.markedTexts.clear();
			renderer.markedAttrs.clear();
			renderer.markedChildren.clear();
		} );

		it( 'should update attributes', () => {
			viewNode.setAttr( 'class', 'foo' );

			renderer.markToSync( viewNode, 'ATTRIBUTES_NEED_UPDATE' );
			renderer.render();

			expect( domNode.getAttribute( 'class' ) ).to.equal( 'foo' );

			expect( renderer.markedAttrs.size ).to.equal( 0 );
		} );

		it( 'should remove attributes', () => {
			viewNode.setAttr( 'class', 'foo' );
			domNode.setAttribute( 'id', 'bar' );
			domNode.setAttribute( 'class', 'bar' );

			renderer.markToSync( viewNode, 'ATTRIBUTES_NEED_UPDATE' );
			renderer.render();

			expect( domNode.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( domNode.getAttribute( 'id' ) ).to.be.not.ok;

			expect( renderer.markedAttrs.size ).to.equal( 0 );
		} );

		it( 'should add children', () => {
			viewNode.appendChildren( new ViewText( 'foo' ) );

			renderer.markToSync( viewNode, 'CHILDREN_NEED_UPDATE' );
			renderer.render();

			expect( domNode.childNodes.length ).to.equal( 1 );
			expect( domNode.childNodes[ 0 ].data ).to.equal( 'foo' );

			expect( renderer.markedChildren.size ).to.equal( 0 );
		} );

		it( 'should remove children', () => {
			viewNode.appendChildren( new ViewText( 'foo' ) );

			renderer.markToSync( viewNode, 'CHILDREN_NEED_UPDATE' );
			renderer.render();

			expect( domNode.childNodes.length ).to.equal( 1 );
			expect( domNode.childNodes[ 0 ].data ).to.equal( 'foo' );

			viewNode.removeChildren( 0, 1 );

			renderer.markToSync( viewNode, 'CHILDREN_NEED_UPDATE' );
			renderer.render();

			expect( domNode.childNodes.length ).to.equal( 0 );

			expect( renderer.markedChildren.size ).to.equal( 0 );
		} );

		it( 'should update text', () => {
			const viewText = new ViewText( 'foo' );
			viewNode.appendChildren( viewText );

			renderer.markToSync( viewNode, 'CHILDREN_NEED_UPDATE' );
			renderer.render();

			expect( domNode.childNodes.length ).to.equal( 1 );
			expect( domNode.childNodes[ 0 ].data ).to.equal( 'foo' );

			viewText.setText( 'bar' );

			renderer.markToSync( viewText, 'TEXT_NEEDS_UPDATE' );
			renderer.render();

			expect( domNode.childNodes.length ).to.equal( 1 );
			expect( domNode.childNodes[ 0 ].data ).to.equal( 'bar' );

			expect( renderer.markedTexts.size ).to.equal( 0 );
		} );

		it( 'should not update text parent child list changed', () => {
			const viewImg = new ViewElement( 'img' );
			const viewText = new ViewText( 'foo' );
			viewNode.appendChildren( [ viewImg, viewText ] );

			renderer.markToSync( viewNode, 'CHILDREN_NEED_UPDATE' );
			renderer.markToSync( viewText, 'TEXT_NEEDS_UPDATE' );
			renderer.render();

			expect( domNode.childNodes.length ).to.equal( 2 );
			expect( domNode.childNodes[ 0 ].tagName.toLowerCase() ).to.equal( 'img' );
			expect( domNode.childNodes[ 1 ].data ).to.equal( 'foo' );
		} );

		it( 'should not change text if it is the same during text rendering', () => {
			const viewText = new ViewText( 'foo' );
			viewNode.appendChildren( viewText );

			renderer.markToSync( viewNode, 'CHILDREN_NEED_UPDATE' );
			renderer.render();

			// This should not be changed during the render.
			const domText = domNode.childNodes[ 0 ];

			renderer.markToSync( viewText, 'TEXT_NEEDS_UPDATE' );
			renderer.render();

			expect( domNode.childNodes.length ).to.equal( 1 );
			expect( domNode.childNodes[ 0 ] ).to.equal( domText );
		} );

		it( 'should not change text if it is the same during children rendering', () => {
			const viewText = new ViewText( 'foo' );
			viewNode.appendChildren( viewText );

			renderer.markToSync( viewNode, 'CHILDREN_NEED_UPDATE' );
			renderer.render();

			// This should not be changed during the render.
			const domText = domNode.childNodes[ 0 ];

			renderer.markToSync( viewNode, 'CHILDREN_NEED_UPDATE' );
			renderer.render();

			expect( domNode.childNodes.length ).to.equal( 1 );
			expect( domNode.childNodes[ 0 ] ).to.equal( domText );
		} );

		it( 'should not change element if it is the same', () => {
			const viewImg = new ViewElement( 'img' );
			viewNode.appendChildren( viewImg );

			// This should not be changed during the render.
			const domImg = document.createElement( 'img' );
			domNode.appendChild( domImg );

			converter.bindElements( domImg, viewImg );

			renderer.markToSync( viewNode, 'CHILDREN_NEED_UPDATE' );
			renderer.render();

			expect( domNode.childNodes.length ).to.equal( 1 );
			expect( domNode.childNodes[ 0 ] ).to.equal( domImg );
		} );

		it( 'should change element if it is different', () => {
			const viewImg = new ViewElement( 'img' );
			viewNode.appendChildren( viewImg );

			renderer.markToSync( viewNode, 'CHILDREN_NEED_UPDATE' );
			renderer.render();

			const viewP = new ViewElement( 'p' );
			viewNode.removeChildren( 0, 1 );
			viewNode.appendChildren( viewP );

			renderer.markToSync( viewNode, 'CHILDREN_NEED_UPDATE' );
			renderer.render();

			expect( domNode.childNodes.length ).to.equal( 1 );
			expect( domNode.childNodes[ 0 ].tagName.toLowerCase() ).to.equal( 'p' );
		} );
	} );
} );