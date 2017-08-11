/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, window, NodeFilter */

import ViewDocument from '../../src/view/document';
import ViewElement from '../../src/view/element';
import ViewContainerElement from '../../src/view/containerelement';
import ViewAttributeElement from '../../src/view/attributeelement';
import ViewText from '../../src/view/text';
import ViewRange from '../../src/view/range';
import ViewPosition from '../../src/view/position';
import Selection from '../../src/view/selection';
import DomConverter from '../../src/view/domconverter';
import Renderer from '../../src/view/renderer';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import { parse, setData as setViewData, getData as getViewData } from '../../src/dev-utils/view';
import { INLINE_FILLER, INLINE_FILLER_LENGTH, isBlockFiller, BR_FILLER } from '../../src/view/filler';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';
import log from '@ckeditor/ckeditor5-utils/src/log';
import { unwrap, insert, remove } from '../../src/view/writer';
import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';

testUtils.createSinonSandbox();

describe( 'Renderer', () => {
	let selection, domConverter, renderer;

	beforeEach( () => {
		selection = new Selection();
		domConverter = new DomConverter();
		renderer = new Renderer( domConverter, selection );
		renderer.domDocuments.add( document );
	} );

	describe( 'markToSync', () => {
		let viewRoot;

		beforeEach( () => {
			viewRoot = new ViewElement( 'p' );

			const domRoot = document.createElement( 'p' );
			domConverter.bindElements( domRoot, viewRoot );
			viewRoot.appendChildren( new ViewText( 'foo' ) );

			renderer.markedTexts.clear();
			renderer.markedAttributes.clear();
			renderer.markedChildren.clear();
		} );

		it( 'should mark attributes which need update', () => {
			viewRoot.setAttribute( 'class', 'foo' );

			renderer.markToSync( 'attributes', viewRoot );

			expect( renderer.markedAttributes.has( viewRoot ) ).to.be.true;
		} );

		it( 'should mark children which need update', () => {
			viewRoot.appendChildren( new ViewText( 'foo' ) );

			renderer.markToSync( 'children', viewRoot );

			expect( renderer.markedChildren.has( viewRoot ) ).to.be.true;
		} );

		it( 'should not mark children if element has no corresponding node', () => {
			// Overwrite viewRoot with node without coresponding DOM node.
			viewRoot = new ViewElement( 'p' );

			viewRoot.appendChildren( new ViewText( 'foo' ) );

			renderer.markToSync( 'children', viewRoot );

			expect( renderer.markedTexts.has( viewRoot ) ).to.be.false;
		} );

		it( 'should mark text which need update', () => {
			const viewText = new ViewText( 'foo' );
			viewRoot.appendChildren( viewText );
			viewText.data = 'bar';

			renderer.markToSync( 'text', viewText );

			expect( renderer.markedTexts.has( viewText ) ).to.be.true;
		} );

		it( 'should not mark text if parent has no corresponding node', () => {
			const viewText = new ViewText( 'foo' );
			// Overwrite viewRoot with node without coresponding DOM node.
			viewRoot = new ViewElement( 'p' );

			viewRoot.appendChildren( viewText );
			viewText.data = 'bar';

			renderer.markToSync( 'text', viewText );

			expect( renderer.markedTexts.has( viewText ) ).to.be.false;
		} );

		it( 'should throw if the type is unknown', () => {
			expect( () => {
				renderer.markToSync( 'UNKNOWN', viewRoot );
			} ).to.throw( CKEditorError, /^view-renderer-unknown-type/ );
		} );
	} );

	describe( 'render', () => {
		let viewRoot, domRoot, selectionEditable;

		beforeEach( () => {
			viewRoot = new ViewElement( 'div' );
			domRoot = document.createElement( 'div' );
			document.body.appendChild( domRoot );

			domConverter.bindElements( domRoot, viewRoot );

			renderer.markedTexts.clear();
			renderer.markedAttributes.clear();
			renderer.markedChildren.clear();

			selection.removeAllRanges();
			selection.setFake( false );

			selectionEditable = viewRoot;

			renderer.isFocused = true;

			// Fake selection editable - it is needed to render selection properly.
			Object.defineProperty( selection, 'editableElement', {
				get() {
					return selectionEditable;
				}
			} );
		} );

		it( 'should update attributes', () => {
			viewRoot.setAttribute( 'class', 'foo' );

			renderer.markToSync( 'attributes', viewRoot );
			renderer.render();

			expect( domRoot.getAttribute( 'class' ) ).to.equal( 'foo' );

			expect( renderer.markedAttributes.size ).to.equal( 0 );
		} );

		it( 'should remove attributes', () => {
			viewRoot.setAttribute( 'class', 'foo' );
			domRoot.setAttribute( 'id', 'bar' );
			domRoot.setAttribute( 'class', 'bar' );

			renderer.markToSync( 'attributes', viewRoot );
			renderer.render();

			expect( domRoot.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( domRoot.getAttribute( 'id' ) ).to.be.not.ok;

			expect( renderer.markedAttributes.size ).to.equal( 0 );
		} );

		it( 'should add children', () => {
			viewRoot.appendChildren( new ViewText( 'foo' ) );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'foo' );

			expect( renderer.markedChildren.size ).to.equal( 0 );
		} );

		it( 'should remove children', () => {
			viewRoot.appendChildren( new ViewText( 'foo' ) );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'foo' );

			viewRoot.removeChildren( 0, 1 );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 0 );

			expect( renderer.markedChildren.size ).to.equal( 0 );
		} );

		it( 'should update text', () => {
			const viewText = new ViewText( 'foo' );
			viewRoot.appendChildren( viewText );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'foo' );

			viewText.data = 'bar';

			renderer.markToSync( 'text', viewText );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'bar' );

			expect( renderer.markedTexts.size ).to.equal( 0 );
		} );

		it( 'should not update text parent child list changed', () => {
			const viewImg = new ViewElement( 'img' );
			const viewText = new ViewText( 'foo' );
			viewRoot.appendChildren( [ viewImg, viewText ] );

			renderer.markToSync( 'children', viewRoot );
			renderer.markToSync( 'text', viewText );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 2 );
			expect( domRoot.childNodes[ 0 ].tagName ).to.equal( 'IMG' );
			expect( domRoot.childNodes[ 1 ].data ).to.equal( 'foo' );
		} );

		it( 'should not change text if it is the same during text rendering', () => {
			const viewText = new ViewText( 'foo' );
			viewRoot.appendChildren( viewText );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			// This should not be changed during the render.
			const domText = domRoot.childNodes[ 0 ];

			renderer.markToSync( 'text', viewText );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ] ).to.equal( domText );
		} );

		it( 'should not change text if it is the same during children rendering', () => {
			const viewText = new ViewText( 'foo' );
			viewRoot.appendChildren( viewText );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			// This should not be changed during the render.
			const domText = domRoot.childNodes[ 0 ];

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ] ).to.equal( domText );
		} );

		it( 'should not change element if it is the same', () => {
			const viewImg = new ViewElement( 'img' );
			viewRoot.appendChildren( viewImg );

			// This should not be changed during the render.
			const domImg = document.createElement( 'img' );
			domRoot.appendChild( domImg );

			domConverter.bindElements( domImg, viewImg );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ] ).to.equal( domImg );
		} );

		it( 'should change element if it is different', () => {
			const viewImg = new ViewElement( 'img' );
			viewRoot.appendChildren( viewImg );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const viewP = new ViewElement( 'p' );
			viewRoot.removeChildren( 0, 1 );
			viewRoot.appendChildren( viewP );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].tagName ).to.equal( 'P' );
		} );

		it( 'should update removed item when it is reinserted', () => {
			const viewFoo = new ViewText( 'foo' );
			const viewP = new ViewElement( 'p', null, viewFoo );
			const viewDiv = new ViewElement( 'div', null, viewP );

			viewRoot.appendChildren( viewDiv );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			viewDiv.removeChildren( 0, 1 );
			renderer.markToSync( 'children', viewDiv );
			renderer.render();

			viewP.removeChildren( 0, 1 );

			viewDiv.appendChildren( viewP );
			renderer.markToSync( 'children', viewDiv );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );

			const domDiv = domRoot.childNodes[ 0 ];

			expect( domDiv.tagName ).to.equal( 'DIV' );
			expect( domDiv.childNodes.length ).to.equal( 1 );

			const domP = domDiv.childNodes[ 0 ];

			expect( domP.tagName ).to.equal( 'P' );
			expect( domP.childNodes.length ).to.equal( 0 );
		} );

		it( 'should update removed item when it is reinserted #2', () => {
			// Prepare view: root -> div "outer" -> div "inner" -> p.
			const viewP = new ViewElement( 'p' );
			const viewDivInner = new ViewElement( 'div', null, viewP );
			const viewDivOuter = new ViewElement( 'div', null, viewDivInner );
			viewRoot.appendChildren( viewDivOuter );

			// Render view tree to DOM.
			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			// Remove div "outer" from root and render it.
			viewDivOuter.remove();
			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			// Remove p from div "child" -- div "inner" won't be marked because it is in document fragment not view root.
			viewP.remove();
			// Add div "outer" back to root.
			viewRoot.appendChildren( viewDivOuter );
			renderer.markToSync( 'children', viewRoot );

			// Render changes, view is: root -> div "outer" -> div "inner".
			renderer.render();

			// Same is expected in DOM.
			expect( domRoot.childNodes.length ).to.equal( 1 );

			const domDivOuter = domRoot.childNodes[ 0 ];
			expect( renderer.domConverter.viewToDom( viewDivOuter, domRoot.document ) ).to.equal( domDivOuter );
			expect( domDivOuter.tagName ).to.equal( 'DIV' );
			expect( domDivOuter.childNodes.length ).to.equal( 1 );

			const domDivInner = domDivOuter.childNodes[ 0 ];
			expect( renderer.domConverter.viewToDom( viewDivInner, domRoot.document ) ).to.equal( domDivInner );
			expect( domDivInner.tagName ).to.equal( 'DIV' );
			expect( domDivInner.childNodes.length ).to.equal( 0 );
		} );

		it( 'should not throw when trying to update children of view element that got removed and lost its binding', () => {
			const viewFoo = new ViewText( 'foo' );
			const viewP = new ViewElement( 'p', null, viewFoo );
			const viewDiv = new ViewElement( 'div', null, viewP );

			viewRoot.appendChildren( viewDiv );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			viewRoot.removeChildren( 0, 1 );
			renderer.markToSync( 'children', viewRoot );

			viewDiv.removeChildren( 0, 1 );
			renderer.markToSync( 'children', viewDiv );

			viewP.removeChildren( 0, 1 );
			renderer.markToSync( 'children', viewP );

			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 0 );
		} );

		it( 'should not care about filler if there is no DOM', () => {
			selectionEditable = null;

			const { view: viewP, selection: newSelection } = parse(
				'<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>' );

			const viewRoot = new ViewElement( 'p' );
			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			// Expect no error on render.
			expect( viewRoot ).to.be.ok;
		} );

		it( 'should add and remove inline filler in case <p>foo<b>[]</b>bar</p>', () => {
			const domSelection = document.getSelection();

			// Step 1: <p>foo<b>"FILLER{}"</b></p>
			const { view: viewP, selection: newSelection } = parse(
				'<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].tagName.toLowerCase() ).to.equal( 'p' );

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.childNodes.length ).to.equal( 3 );
			expect( domP.childNodes[ 0 ].data ).to.equal( 'foo' );
			expect( domP.childNodes[ 2 ].data ).to.equal( 'bar' );
			expect( domP.childNodes[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 1 ].childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 1 ].childNodes[ 0 ].data ).to.equal( INLINE_FILLER );

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP.childNodes[ 1 ].childNodes[ 0 ] );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( INLINE_FILLER_LENGTH );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;

			// Step 2: No mutation on second render
			renderer.markToSync( 'children', viewRoot );
			renderer.markToSync( 'children', viewP );

			renderAndExpectNoChanges( renderer, domRoot );

			// Step 3: <p>foo{}<b></b></p>
			selection.removeAllRanges();
			selection.addRange( ViewRange.createFromParentsAndOffsets( viewP.getChild( 0 ), 3, viewP.getChild( 0 ), 3 ) );

			renderer.render();

			expect( domP.childNodes.length ).to.equal( 3 );
			expect( domP.childNodes[ 0 ].data ).to.equal( 'foo' );
			expect( domP.childNodes[ 2 ].data ).to.equal( 'bar' );
			expect( domP.childNodes[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 1 ].childNodes.length ).to.equal( 0 );

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP.childNodes[ 0 ] );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 3 );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;

			// Step 4: No mutation on second render
			renderer.markToSync( 'children', viewRoot );
			renderer.markToSync( 'children', viewP );

			renderAndExpectNoChanges( renderer, domRoot );
		} );

		it( 'should add and remove inline filler in case <p>[]<b>foo</b></p>', () => {
			const domSelection = document.getSelection();

			// Step 1: <p>"FILLER{}"<b>foo</b></p>
			const { view: viewP, selection: newSelection } = parse(
				'<container:p>[]<attribute:b>foo</attribute:b></container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.childNodes.length ).to.equal( 2 );
			expect( domP.childNodes[ 0 ].data ).to.equal( INLINE_FILLER );
			expect( domP.childNodes[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 1 ].childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 1 ].childNodes[ 0 ].data ).to.equal( 'foo' );

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP.childNodes[ 0 ] );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( INLINE_FILLER_LENGTH );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;

			// Step 2: No mutation on second render
			renderer.markToSync( 'children', viewP );
			renderAndExpectNoChanges( renderer, domRoot );

			// Step 3: <p><b>{}foo</b></p>
			selection.removeAllRanges();
			selection.addRange( ViewRange.createFromParentsAndOffsets(
				viewP.getChild( 0 ).getChild( 0 ), 0, viewP.getChild( 0 ).getChild( 0 ), 0 ) );

			renderer.render();

			expect( domP.childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 0 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 0 ].childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 0 ].childNodes[ 0 ].data ).to.equal( 'foo' );

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP.childNodes[ 0 ].childNodes[ 0 ] );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 0 );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;

			// Step 4: No mutation on second render
			renderer.markToSync( 'children', viewP );
			renderAndExpectNoChanges( renderer, domRoot );
		} );

		it( 'should add and remove inline filler in case <p><b>foo</b>[]</p>', () => {
			const domSelection = document.getSelection();

			// Step 1: <p>"FILLER{}"<b>foo</b></p>
			const { view: viewP, selection: newSelection } = parse(
				'<container:p><attribute:b>foo</attribute:b>[]</container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.childNodes.length ).to.equal( 2 );
			expect( domP.childNodes[ 0 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 0 ].childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 0 ].childNodes[ 0 ].data ).to.equal( 'foo' );
			expect( domP.childNodes[ 1 ].data ).to.equal( INLINE_FILLER );

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP.childNodes[ 1 ] );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( INLINE_FILLER_LENGTH );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;

			// Step 2: No mutation on second render
			renderer.markToSync( 'children', viewP );
			renderAndExpectNoChanges( renderer, domRoot );

			// Step 3: <p><b>foo{}</b></p>
			selection.removeAllRanges();
			selection.addRange( ViewRange.createFromParentsAndOffsets(
				viewP.getChild( 0 ).getChild( 0 ), 3, viewP.getChild( 0 ).getChild( 0 ), 3 ) );

			renderer.render();

			expect( domP.childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 0 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 0 ].childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 0 ].childNodes[ 0 ].data ).to.equal( 'foo' );

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP.childNodes[ 0 ].childNodes[ 0 ] );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 3 );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;

			// Step 4: No mutation on second render
			renderer.markToSync( 'children', viewP );
			renderAndExpectNoChanges( renderer, domRoot );
		} );

		it( 'should add and remove inline filler in case <p><b>foo</b>[]<b>bar</b></p>', () => {
			const domSelection = document.getSelection();

			const { view: viewP, selection: newSelection } = parse(
				'<container:p><attribute:b>foo</attribute:b>[]<attribute:b>bar</attribute:b></container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.childNodes.length ).to.equal( 3 );
			expect( domP.childNodes[ 0 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 0 ].childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 0 ].childNodes[ 0 ].data ).to.equal( 'foo' );
			expect( domP.childNodes[ 1 ].data ).to.equal( INLINE_FILLER );
			expect( domP.childNodes[ 2 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 2 ].childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 2 ].childNodes[ 0 ].data ).to.equal( 'bar' );

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP.childNodes[ 1 ] );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( INLINE_FILLER_LENGTH );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;
		} );

		it( 'should move filler when selection is moved', () => {
			// Step 1: <p>foo<b>"FILLER{}"</b></p>
			const { view: viewP, selection: newSelection } = parse(
				'<container:p>foo<attribute:b>[]</attribute:b><attribute:i></attribute:i></container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );

			renderer.render();

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.childNodes.length ).to.equal( 3 );
			expect( domP.childNodes[ 0 ].data ).to.equal( 'foo' );
			expect( domP.childNodes[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 1 ].childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 1 ].childNodes[ 0 ].data ).to.equal( INLINE_FILLER );
			expect( domP.childNodes[ 2 ].tagName.toLowerCase() ).to.equal( 'i' );
			expect( domP.childNodes[ 2 ].childNodes.length ).to.equal( 0 );

			// Step 2: <p>foo<b></b><i>"FILLER{}"</i></p>
			selection.removeAllRanges();
			const viewI = viewP.getChild( 2 );
			selection.addRange( ViewRange.createFromParentsAndOffsets( viewI, 0, viewI, 0 ) );

			renderer.render();

			expect( domP.childNodes.length ).to.equal( 3 );
			expect( domP.childNodes[ 0 ].data ).to.equal( 'foo' );
			expect( domP.childNodes[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 1 ].childNodes.length ).to.equal( 0 );
			expect( domP.childNodes[ 2 ].tagName.toLowerCase() ).to.equal( 'i' );
			expect( domP.childNodes[ 2 ].childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 2 ].childNodes[ 0 ].data ).to.equal( INLINE_FILLER );
		} );

		it( 'should remove filler when text is added and selection removed', () => {
			// Step 1: <p>foo<b>"FILLER{}"</b></p>
			const { view: viewP, selection: newSelection } = parse( '<container:p>foo<attribute:b>[]</attribute:b></container:p>' );
			const viewB = viewP.getChild( 1 );
			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];
			expect( domP.childNodes.length ).to.equal( 2 );
			expect( domP.childNodes[ 0 ].data ).to.equal( 'foo' );
			expect( domP.childNodes[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 1 ].childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 1 ].childNodes[ 0 ].data ).to.equal( INLINE_FILLER );

			// Step 2: Add text node.
			const viewText = new ViewText( 'x' );
			viewB.appendChildren( viewText );
			selection.removeAllRanges();
			selection.addRange( ViewRange.createFromParentsAndOffsets( viewText, 1, viewText, 1 ) );

			renderer.markToSync( 'children', viewB );
			renderer.render();

			// Step 3: Remove selection from the view.
			selection.removeAllRanges();

			renderer.render();

			expect( domP.childNodes.length ).to.equal( 2 );
			expect( domP.childNodes[ 0 ].data ).to.equal( 'foo' );
			expect( domP.childNodes[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 1 ].childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 1 ].childNodes[ 0 ].data ).to.equal( 'x' );
		} );

		// #659
		// The element before the filler is removed so the position of the filler
		// cannot be remembered as parent+offset.
		it( 'should remove filler from a modified DOM in case <p>bar<b>foo</b>[]</p>', () => {
			// Step 1: <p>bar<b>foo</b>"FILLER{}"</p>
			const { view: viewP, selection: newSelection } = parse( '<container:p>bar<attribute:b>foo</attribute:b>[]</container:p>' );
			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];
			expect( domP.childNodes.length ).to.equal( 3 );
			expect( domP.childNodes[ 2 ].data ).to.equal( INLINE_FILLER );

			// Step 2: Remove the <b> and update the selection (<p>bar[]</p>).
			viewP.removeChildren( 1 );

			selection.removeAllRanges();
			selection.addRange( ViewRange.createFromParentsAndOffsets( viewP, 1, viewP, 1 ) );

			renderer.markToSync( 'children', viewP );
			renderer.render();

			// Step 3: Check whether there's no filler in the DOM.
			expect( domP.childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 0 ].data ).to.equal( 'bar' );
		} );

		// #659
		it( 'should remove filler from a modified DOM when children moved', () => {
			// Step 1: <p><b>foo</b>"FILLER{}"<b>bar</b></p><p></p>
			const { view: viewFragment, selection: newSelection } = parse(
				'<container:p><attribute:b>foo</attribute:b>[]<attribute:b>bar</attribute:b></container:p><container:p></container:p>'
			);
			viewRoot.appendChildren( viewFragment );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 2 );

			const domP = domRoot.childNodes[ 0 ];
			const domP2 = domRoot.childNodes[ 1 ];
			expect( domP.childNodes.length ).to.equal( 3 );
			expect( domP.childNodes[ 1 ].data ).to.equal( INLINE_FILLER );

			// Step 2: Move <b>foo</b><b>bar</b> to the second paragraph and leave collapsed selection in the first one.
			// <p>[]</p><p><b>foo</b><b>bar</b></p>
			const viewP = viewRoot.getChild( 0 );
			const viewP2 = viewRoot.getChild( 1 );
			const removedChildren = viewP.removeChildren( 0, 2 );

			viewP2.appendChildren( removedChildren );

			selection.removeAllRanges();
			selection.addRange( ViewRange.createFromParentsAndOffsets( viewP, 0, viewP, 0 ) );

			renderer.markToSync( 'children', viewP );
			renderer.markToSync( 'children', viewP2 );
			renderer.render();

			// Step 3: Check whether in the first paragraph there's a <br> filler and that
			// in the second one there are two <b> tags.
			expect( domP.childNodes.length ).to.equal( 1 );
			expect( isBlockFiller( domP.childNodes[ 0 ], BR_FILLER ) ).to.be.true;

			expect( domP2.childNodes.length ).to.equal( 2 );
			expect( domP2.childNodes[ 0 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP2.childNodes[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
		} );

		// Test for an edge case in the _isSelectionInInlineFiller which can be triggered like
		// in one of ckeditor/ckeditor5-typing#59 automated tests.
		it( 'should not break when selection is moved to a new element, when filler exists', () => {
			// Step 1: <p>bar<b>"FILLER{}"</b></p>
			const { view: viewP, selection: newSelection } = parse( '<container:p>bar<attribute:b>[]</attribute:b></container:p>' );
			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];
			expect( domP.childNodes.length ).to.equal( 2 );
			expect( domP.childNodes[ 1 ].childNodes[ 0 ].data ).to.equal( INLINE_FILLER );

			// Step 2: Move selection to a new attribute element and remove the previous one
			viewP.removeChildren( 1 ); // Remove <b>.

			const viewI = parse( '<attribute:i></attribute:i>' );
			viewP.appendChildren( viewI );

			selection.removeAllRanges();
			selection.addRange( ViewRange.createFromParentsAndOffsets( viewI, 0, viewI, 0 ) );

			renderer.markToSync( 'children', viewP );
			renderer.render();

			// Step 3: Check whether new filler was created in the <i> element.
			expect( domP.childNodes.length ).to.equal( 2 );
			expect( domP.childNodes[ 1 ].tagName.toLowerCase() ).to.equal( 'i' );
			expect( domP.childNodes[ 1 ].childNodes[ 0 ].data ).to.equal( INLINE_FILLER );
		} );

		// Test for an edge case in the _isSelectionInInlineFiller, when selection is before a view element
		// that has not been yet rendered/bound to DOM.
		it( 'should remove inline filler if selection is before a view element not bound to dom', () => {
			// Step 1: <p>bar<b>abc</b>"FILLER"{}</p>
			const { view: viewP, selection: newSelection } = parse( '<container:p>bar<attribute:b>abc</attribute:b>[]</container:p>' );
			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];
			expect( domP.childNodes.length ).to.equal( 3 );
			expect( domP.childNodes[ 2 ].data ).to.equal( INLINE_FILLER );

			// Step 2: Move selection to a new attribute element.
			const viewAbc = parse( 'abc' );
			viewP.appendChildren( viewAbc );

			selection.removeAllRanges();
			selection.addRange( ViewRange.createFromParentsAndOffsets( viewP, 3, viewP, 3 ) );

			renderer.markToSync( 'children', viewP );
			renderer.render();

			// Step 3: Check whether old filler was removed.
			expect( domP.childNodes.length ).to.equal( 3 );
			expect( domP.textContent.indexOf( INLINE_FILLER ) ).to.equal( -1 );
		} );

		it( 'should handle typing in empty block, do nothing if changes are already applied', () => {
			const domSelection = document.getSelection();

			const { view: viewP, selection: newSelection } = parse( '<container:p>[]</container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.childNodes.length ).to.equal( 1 );
			expect( isBlockFiller( domP.childNodes[ 0 ], BR_FILLER ) ).to.be.true;

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 0 );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;

			// Remove filler and add text node to both DOM and View <p>x{}</p>
			domP.removeChild( domP.childNodes[ 0 ] );
			domP.appendChild( document.createTextNode( 'x' ) );

			domSelection.removeAllRanges();
			const domRange = document.createRange();
			domRange.setStart( domP.childNodes[ 0 ], 1 );
			domRange.collapse( true );
			domSelection.addRange( domRange );

			const viewText = new ViewText( 'x' );
			viewP.appendChildren( viewText );
			selection.removeAllRanges();
			selection.addRange( ViewRange.createFromParentsAndOffsets( viewText, 1, viewText, 1 ) );

			renderer.markToSync( 'children', viewP );
			renderAndExpectNoChanges( renderer, domRoot );
		} );

		it( 'should handle typing in empty block, render if needed', () => {
			const domSelection = document.getSelection();

			const { view: viewP, selection: newSelection } = parse( '<container:p>[]</container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.childNodes.length ).to.equal( 1 );
			expect( isBlockFiller( domP.childNodes[ 0 ], BR_FILLER ) ).to.be.true;

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 0 );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;

			// Add text node only in View <p>x{}</p>
			const viewText = new ViewText( 'x' );
			viewP.appendChildren( viewText );
			selection.removeAllRanges();
			selection.addRange( ViewRange.createFromParentsAndOffsets( viewText, 1, viewText, 1 ) );

			renderer.markToSync( 'children', viewP );
			renderer.render();

			expect( domP.childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 0 ].data ).to.equal( 'x' );

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP.childNodes[ 0 ] );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;
		} );

		it( 'should handle removing last character', () => {
			const domSelection = document.getSelection();

			const { view: viewP, selection: newSelection } = parse( '<container:p>x{}</container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 0 ].data ).to.equal( 'x' );

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP.childNodes[ 0 ] );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;

			// Remove text and add filler to both DOM and View <p>{}</p>
			domP.removeChild( domP.childNodes[ 0 ] );
			domP.appendChild( BR_FILLER( document ) ); // eslint-disable-line new-cap

			domSelection.removeAllRanges();
			const domRange = document.createRange();
			domRange.setStart( domP.childNodes[ 0 ], 0 );
			domRange.collapse( true );
			domSelection.addRange( domRange );

			viewP.removeChildren( 0 );

			selection.removeAllRanges();
			selection.addRange( ViewRange.createFromParentsAndOffsets( viewP, 0, viewP, 0 ) );

			renderer.markToSync( 'children', viewP );
			renderAndExpectNoChanges( renderer, domRoot );
		} );

		it( 'should handle typing in empty attribute, do nothing if changes are already applied', () => {
			const domSelection = document.getSelection();

			// 1. Render <p><b>FILLER{}</b>foo</p>.

			const { view: viewP, selection: newSelection } = parse(
				'<container:p><attribute:b>[]</attribute:b>foo</container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			// 2. Check the DOM.

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.childNodes.length ).to.equal( 2 );
			expect( domP.childNodes[ 0 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 1 ].data ).to.equal( 'foo' );

			const domB = domP.childNodes[ 0 ];
			const viewB = viewP.getChild( 0 );

			expect( domB.childNodes.length ).to.equal( 1 );
			expect( domB.childNodes[ 0 ].data ).to.equal( INLINE_FILLER );

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domB.childNodes[ 0 ] );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( INLINE_FILLER_LENGTH );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;

			// 3. Add text node to both the DOM and the view: <p><b>FILLERx</b>foo</p>.

			domB.childNodes[ 0 ].data += 'x';

			domSelection.removeAllRanges();
			const domRange = document.createRange();
			domRange.setStart( domB.childNodes[ 0 ], INLINE_FILLER_LENGTH + 1 );
			domRange.collapse( true );
			domSelection.addRange( domRange );

			const viewText = new ViewText( 'x' );
			viewB.appendChildren( viewText );
			selection.removeAllRanges();
			selection.addRange( ViewRange.createFromParentsAndOffsets( viewText, 1, viewText, 1 ) );

			renderer.markToSync( 'children', viewP );
			renderAndExpectNoChanges( renderer, domRoot );
		} );

		it( 'should handle typing in empty attribute as a children change, render if needed', () => {
			const domSelection = document.getSelection();

			// 1. Render <p><b>FILLER{}</b>foo</p>.

			const { view: viewP, selection: newSelection } = parse(
				'<container:p><attribute:b>[]</attribute:b>foo</container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			// 2. Check the DOM.

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.childNodes.length ).to.equal( 2 );
			expect( domP.childNodes[ 0 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 1 ].data ).to.equal( 'foo' );

			const domB = domP.childNodes[ 0 ];
			const viewB = viewP.getChild( 0 );

			expect( domB.childNodes.length ).to.equal( 1 );
			expect( domB.childNodes[ 0 ].data ).to.equal( INLINE_FILLER );

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domB.childNodes[ 0 ] );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( INLINE_FILLER_LENGTH );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;

			// 3. Add text node only to the view: <p><b>x{}</b>foo</p>.

			const viewText = new ViewText( 'x' );
			viewB.appendChildren( viewText );
			selection.removeAllRanges();
			selection.addRange( ViewRange.createFromParentsAndOffsets( viewText, 1, viewText, 1 ) );

			renderer.markToSync( 'children', viewB );
			renderer.render();

			expect( domB.childNodes.length ).to.equal( 1 );
			expect( domB.childNodes[ 0 ].data ).to.equal( INLINE_FILLER + 'x' );

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domB.childNodes[ 0 ] );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( INLINE_FILLER_LENGTH + 1 );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;
		} );

		it( 'should handle typing in empty attribute as a text change, render if needed', () => {
			const domSelection = document.getSelection();

			// 1. Render <p><b>FILLER{}</b>foo</p>.

			const { view: viewP, selection: newSelection } = parse(
				'<container:p><attribute:b>[]</attribute:b>foo</container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			// 2. Check the DOM.

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.childNodes.length ).to.equal( 2 );
			expect( domP.childNodes[ 0 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 1 ].data ).to.equal( 'foo' );

			const domB = domP.childNodes[ 0 ];
			const viewB = viewP.getChild( 0 );

			expect( domB.childNodes.length ).to.equal( 1 );
			expect( domB.childNodes[ 0 ].data ).to.equal( INLINE_FILLER );

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domB.childNodes[ 0 ] );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( INLINE_FILLER_LENGTH );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;

			// 3. Add text node only to the view: <p><b>x{}</b>foo</p>.

			const viewText = new ViewText( 'x' );
			viewB.appendChildren( viewText );
			selection.removeAllRanges();
			selection.addRange( ViewRange.createFromParentsAndOffsets( viewText, 1, viewText, 1 ) );

			renderer.markToSync( 'text', viewText );
			renderer.render();

			// 4. Check the DOM.

			expect( domB.childNodes.length ).to.equal( 1 );
			expect( domB.childNodes[ 0 ].data ).to.equal( INLINE_FILLER + 'x' );

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domB.childNodes[ 0 ] );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( INLINE_FILLER_LENGTH + 1 );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;
		} );

		it( 'should handle not collapsed range', () => {
			const domSelection = document.getSelection();

			const { view: viewP, selection: newSelection } = parse(
				'<container:p>fo{o<attribute:b>b}ar</attribute:b></container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.childNodes.length ).to.equal( 2 );
			expect( domP.childNodes[ 0 ].data ).to.equal( 'foo' );
			expect( domP.childNodes[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 1 ].childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 1 ].childNodes[ 0 ].data ).to.equal( 'bar' );

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP.childNodes[ 0 ] );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 2 );
			expect( domSelection.getRangeAt( 0 ).endContainer ).to.equal( domP.childNodes[ 1 ].childNodes[ 0 ] );
			expect( domSelection.getRangeAt( 0 ).endOffset ).to.equal( 1 );

			renderer.markToSync( 'children', viewP );
			renderAndExpectNoChanges( renderer, domRoot );
		} );

		it( 'should not change selection if there is no editable with selection', () => {
			const domDiv = createElement( document, 'div', null, 'not editable' );
			document.body.appendChild( domDiv );

			const domSelection = document.getSelection();

			domSelection.removeAllRanges();
			const domRange = document.createRange();
			domRange.setStart( domDiv, 0 );
			domRange.collapse( true );
			domSelection.addRange( domRange );

			selectionEditable = null;

			const { view: viewP, selection: newSelection } = parse( '<container:p>fo{o}</container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.render();

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domDiv );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 0 );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.equal( true );
		} );

		it( 'should not change selection if there is no focus', () => {
			const domDiv = createElement( document, 'div', null, 'not editable' );
			document.body.appendChild( domDiv );

			const domSelection = document.getSelection();

			domSelection.removeAllRanges();
			const domRange = document.createRange();
			domRange.setStart( domDiv, 0 );
			domRange.collapse( true );
			domSelection.addRange( domRange );

			renderer.isFocused = false;

			const { view: viewP, selection: newSelection } = parse( '<container:p>fo{o}</container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.render();

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domDiv );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 0 );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.equal( true );
		} );

		it( 'should not add inline filler after text node', () => {
			const { view: viewP, selection: newSelection } = parse( '<container:p>foo[]</container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.innerHTML.indexOf( INLINE_FILLER ) ).to.equal( -1 );
		} );

		it( 'should throw if there is no filler in expected position', () => {
			const { view: viewP, selection: newSelection } = parse(
				'<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domB = domRoot.childNodes[ 0 ].childNodes[ 1 ];
			const viewB = viewP.getChild( 1 );

			expect( domB.childNodes[ 0 ].data ).to.equal( INLINE_FILLER );

			// Remove filler.
			domB.childNodes[ 0 ].data = '';

			selection.removeAllRanges();
			renderer.markToSync( 'children', viewB );

			expect( () => {
				renderer.render();
			} ).to.throw( CKEditorError, /^view-renderer-filler-was-lost/ );
		} );

		// #1014.
		it( 'should create inline filler in newly created dom nodes', () => {
			// 1. Create the view structure which needs inline filler.
			const inputView =
				'<container:ul>' +
					'<container:li>Foobar.</container:li>' +
					'<container:li>[]<container:div></container:div></container:li>' +
				'</container:ul>';

			const { view: view, selection: newSelection } = parse( inputView );

			viewRoot.appendChildren( view );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			// 2. Check if filler element has been (correctly) created.
			expect( domRoot.innerHTML.indexOf( INLINE_FILLER ) ).not.to.equal( -1 );

			// 3. Move the inline filler parent to a newly created element.
			const viewLi = view.getChild( 0 );
			const viewLiIndented = view.removeChildren( 1, 1 ); // Array with one element.
			const viewUl = new ViewContainerElement( 'ul', null, viewLiIndented );
			viewLi.appendChildren( viewUl );

			// 4. Mark changed items and render the view.
			renderer.markToSync( 'children', view );
			renderer.markToSync( 'children', viewLi );
			renderer.render();

			expect( domRoot.innerHTML.indexOf( INLINE_FILLER ) ).not.to.equal( -1 );

			const domSelection = document.getSelection();

			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 7 ); // After inline filler.
		} );

		it( 'should handle focusing element', () => {
			const domFocusSpy = testUtils.sinon.spy( domRoot, 'focus' );
			const editable = selection.editableElement;

			renderer.render();

			expect( editable ).to.equal( viewRoot );
			expect( domFocusSpy.calledOnce ).to.be.true;
		} );

		it( 'should not focus editable if isFocues is set to false', () => {
			const domFocusSpy = testUtils.sinon.spy( domRoot, 'focus' );

			renderer.isFocused = false;
			renderer.render();

			expect( domFocusSpy.calledOnce ).to.be.false;
		} );

		it( 'should not focus already focused DOM element', () => {
			domRoot.setAttribute( 'contentEditable', true );
			domRoot.focus();
			const domFocusSpy = testUtils.sinon.spy( domRoot, 'focus' );

			renderer.render();

			expect( domFocusSpy.called ).to.be.false;
		} );

		describe( 'fake selection', () => {
			beforeEach( () => {
				const { view: viewP, selection: newSelection } = parse(
					'<container:p>[foo bar]</container:p>'
				);
				viewRoot.appendChildren( viewP );
				selection.setTo( newSelection );
				renderer.markToSync( 'children', viewRoot );
				renderer.render();
			} );

			it( 'should render fake selection', () => {
				const label = 'fake selection label';
				selection.setFake( true, { label } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const container = domRoot.childNodes[ 1 ];
				expect( domConverter.mapDomToView( container ) ).to.be.undefined;
				expect( container.childNodes.length ).to.equal( 1 );

				const textNode = container.childNodes[ 0 ];
				expect( textNode.textContent ).to.equal( label );

				const domSelection = domRoot.ownerDocument.getSelection();
				assertDomSelectionContents( domSelection, container, /^fake selection label$/ );
			} );

			it( 'should render &nbsp; if no selection label is provided', () => {
				selection.setFake( true );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const container = domRoot.childNodes[ 1 ];
				expect( container.childNodes.length ).to.equal( 1 );

				const textNode = container.childNodes[ 0 ];
				expect( textNode.textContent ).to.equal( '\u00A0' );

				const domSelection = domRoot.ownerDocument.getSelection();
				assertDomSelectionContents( domSelection, container, /^[ \u00A0]$/ );
			} );

			it( 'should remove fake selection container when selection is no longer fake', () => {
				selection.setFake( true );
				renderer.render();

				selection.setFake( false );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 1 );

				const domParagraph = domRoot.childNodes[ 0 ];
				expect( domParagraph.childNodes.length ).to.equal( 1 );
				expect( domParagraph.tagName.toLowerCase() ).to.equal( 'p' );

				const domSelection = domRoot.ownerDocument.getSelection();
				assertDomSelectionContents( domSelection, domParagraph, /^foo bar$/ );
			} );

			it( 'should reuse fake selection container #1', () => {
				const label = 'fake selection label';

				selection.setFake( true, { label } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const container = domRoot.childNodes[ 1 ];

				selection.setFake( true, { label } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const newContainer = domRoot.childNodes[ 1 ];
				expect( newContainer ).equals( container );
				expect( newContainer.childNodes.length ).to.equal( 1 );

				const textNode = newContainer.childNodes[ 0 ];
				expect( textNode.textContent ).to.equal( label );
			} );

			it( 'should reuse fake selection container #2', () => {
				selection.setFake( true, { label: 'label 1' } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const container = domRoot.childNodes[ 1 ];

				selection.setFake( false );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 1 );

				selection.setFake( true, { label: 'label 2' } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const newContainer = domRoot.childNodes[ 1 ];
				expect( newContainer ).equals( container );
				expect( newContainer.childNodes.length ).to.equal( 1 );

				const textNode = newContainer.childNodes[ 0 ];
				expect( textNode.textContent ).to.equal( 'label 2' );
			} );

			it( 'should reuse fake selection container #3', () => {
				selection.setFake( true, { label: 'label 1' } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const container = domRoot.childNodes[ 1 ];

				selection.setFake( true, { label: 'label 2' } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const newContainer = domRoot.childNodes[ 1 ];
				expect( newContainer ).equals( container );
				expect( newContainer.childNodes.length ).to.equal( 1 );

				const textNode = newContainer.childNodes[ 0 ];
				expect( textNode.textContent ).to.equal( 'label 2' );
			} );

			it( 'should style fake selection container properly', () => {
				selection.setFake( true, { label: 'fake selection' } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const container = domRoot.childNodes[ 1 ];

				expect( container.style.position ).to.equal( 'fixed' );
				expect( container.style.top ).to.equal( '0px' );
				expect( container.style.left ).to.equal( '-9999px' );
			} );

			it( 'should bind fake selection container to view selection', () => {
				selection.setFake( true, { label: 'fake selection' } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const container = domRoot.childNodes[ 1 ];

				const bindSelection = renderer.domConverter.fakeSelectionToView( container );
				expect( bindSelection ).to.not.be.undefined;
				expect( bindSelection.isEqual( selection ) ).to.be.true;
			} );

			// Use a forgiving way of checking what the selection contains
			// because Safari normalizes the selection ranges so precise checking is troublesome.
			// Also, Edge returns a normal space instead of nbsp so we need to use even more alternatives.
			function assertDomSelectionContents( domSelection, expectedContainer, expectedText ) {
				const domSelectionContainer = domSelection.getRangeAt( 0 ).commonAncestorContainer;

				expect( domSelection.toString() ).to.match( expectedText );
				expect(
					domSelectionContainer == expectedContainer.firstChild || domSelectionContainer == expectedContainer
				).to.be.true;
			}
		} );

		// #887
		describe( 'similar selection', () => {
			// Use spies to check selection updates. Some selection positions are not achievable in some
			// browsers (e.g. <p>Foo<b>{}Bar</b></p> in Chrome) so asserting dom selection after rendering would fail.
			let selectionCollapseSpy, selectionExtendSpy, logWarnStub;

			before( () => {
				logWarnStub = sinon.stub( log, 'warn' );
			} );

			afterEach( () => {
				if ( selectionCollapseSpy ) {
					selectionCollapseSpy.restore();
					selectionCollapseSpy = null;
				}

				if ( selectionExtendSpy ) {
					selectionExtendSpy.restore();
					selectionExtendSpy = null;
				}
				logWarnStub.reset();
			} );

			after( () => {
				logWarnStub.restore();
			} );

			it( 'should always render collapsed selection even if it is similar', () => {
				const domSelection = document.getSelection();

				const { view: viewP, selection: newSelection } = parse(
					'<container:p>foo{}<attribute:b>bar</attribute:b></container:p>' );

				viewRoot.appendChildren( viewP );
				selection.setTo( newSelection );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				const domP = domRoot.childNodes[ 0 ];
				const domB = domP.childNodes[ 1 ];
				const viewB = viewRoot.getChild( 0 ).getChild( 1 );

				expect( domSelection.isCollapsed ).to.true;
				expect( domSelection.rangeCount ).to.equal( 1 );
				expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP.childNodes[ 0 ] );
				expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 3 );
				expect( domSelection.getRangeAt( 0 ).endContainer ).to.equal( domP.childNodes[ 0 ] );
				expect( domSelection.getRangeAt( 0 ).endOffset ).to.equal( 3 );

				selectionCollapseSpy = sinon.spy( window.Selection.prototype, 'collapse' );
				selectionExtendSpy = sinon.spy( window.Selection.prototype, 'extend' );

				// <container:p>foo<attribute:b>{}bar</attribute:b></container:p>
				selection.setRanges( [
					new ViewRange( new ViewPosition( viewB.getChild( 0 ), 0 ), new ViewPosition( viewB.getChild( 0 ), 0 ) )
				] );

				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( selectionCollapseSpy.calledOnce ).to.true;
				expect( selectionCollapseSpy.calledWith( domB.childNodes[ 0 ], 0 ) ).to.true;
				expect( selectionExtendSpy.calledOnce ).to.true;
				expect( selectionExtendSpy.calledWith( domB.childNodes[ 0 ], 0 ) ).to.true;
				expect( logWarnStub.notCalled ).to.true;
			} );

			it( 'should always render collapsed selection even if it is similar (with empty element)', () => {
				const domSelection = document.getSelection();

				const { view: viewP, selection: newSelection } = parse(
					'<container:p>foo<attribute:b>[]</attribute:b></container:p>' );

				viewRoot.appendChildren( viewP );
				selection.setTo( newSelection );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				const domP = domRoot.childNodes[ 0 ];
				const domB = domP.childNodes[ 1 ];

				expect( domSelection.isCollapsed ).to.true;
				expect( domSelection.rangeCount ).to.equal( 1 );
				expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domB.childNodes[ 0 ] );
				expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( INLINE_FILLER_LENGTH );
				expect( domSelection.getRangeAt( 0 ).endContainer ).to.equal( domB.childNodes[ 0 ] );
				expect( domSelection.getRangeAt( 0 ).endOffset ).to.equal( INLINE_FILLER_LENGTH );

				selectionCollapseSpy = sinon.spy( window.Selection.prototype, 'collapse' );
				selectionExtendSpy = sinon.spy( window.Selection.prototype, 'extend' );

				// <container:p>foo{}<attribute:b></attribute:b></container:p>
				selection.setRanges( [
					new ViewRange( new ViewPosition( viewP.getChild( 0 ), 3 ), new ViewPosition( viewP.getChild( 0 ), 3 ) )
				] );

				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( selectionCollapseSpy.calledOnce ).to.true;
				expect( selectionCollapseSpy.calledWith( domP.childNodes[ 0 ], 3 ) ).to.true;
				expect( selectionExtendSpy.calledOnce ).to.true;
				expect( selectionExtendSpy.calledWith( domP.childNodes[ 0 ], 3 ) ).to.true;
				expect( logWarnStub.notCalled ).to.true;
			} );

			it( 'should always render non-collapsed selection if it not is similar', () => {
				const domSelection = document.getSelection();

				const { view: viewP, selection: newSelection } = parse(
					'<container:p>fo{o}<attribute:b>bar</attribute:b></container:p>' );

				viewRoot.appendChildren( viewP );
				selection.setTo( newSelection );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				const domP = domRoot.childNodes[ 0 ];
				const domB = domP.childNodes[ 1 ];
				const viewB = viewRoot.getChild( 0 ).getChild( 1 );

				expect( domSelection.isCollapsed ).to.false;
				expect( domSelection.rangeCount ).to.equal( 1 );
				expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP.childNodes[ 0 ] );
				expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 2 );
				expect( domSelection.getRangeAt( 0 ).endContainer ).to.equal( domP.childNodes[ 0 ] );
				expect( domSelection.getRangeAt( 0 ).endOffset ).to.equal( 3 );

				selectionCollapseSpy = sinon.spy( window.Selection.prototype, 'collapse' );
				selectionExtendSpy = sinon.spy( window.Selection.prototype, 'extend' );

				// <container:p>fo{o<attribute:b>b}ar</attribute:b></container:p>
				selection.setRanges( [
					new ViewRange( new ViewPosition( viewP.getChild( 0 ), 2 ), new ViewPosition( viewB.getChild( 0 ), 1 ) )
				] );

				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( selectionCollapseSpy.calledOnce ).to.true;
				expect( selectionCollapseSpy.calledWith( domP.childNodes[ 0 ], 2 ) ).to.true;
				expect( selectionExtendSpy.calledOnce ).to.true;
				expect( selectionExtendSpy.calledWith( domB.childNodes[ 0 ], 1 ) ).to.true;
				expect( logWarnStub.notCalled ).to.true;
			} );

			it( 'should always render selection (even if it is same in view) if current dom selection is in incorrect place', () => {
				const domSelection = document.getSelection();

				const { view: viewP, selection: newSelection } = parse( '<container:p>foo[]<ui:span></ui:span></container:p>' );

				viewRoot.appendChildren( viewP );
				selection.setTo( newSelection );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				// In DOM, set position to: <p>foo<span>[]</span></p>. This is incorrect DOM selection (it is in view ui element).
				// Do not change view selection.
				// When renderer will check if the DOM selection changed, it will convert DOM selection to a view selection.
				// Selections (current view selection and view-from-dom selection) will be equal but we will still expect re-render
				// because DOM selection is in incorrect place.
				const domP = domRoot.childNodes[ 0 ];
				const domSpan = domP.childNodes[ 1 ];
				domSelection.collapse( domSpan, 0 );

				renderer.render();

				// Expect that after calling `renderer.render()` the DOM selection was re-rendered (and set at correct position).
				expect( domSelection.anchorNode ).to.equal( domP );
				expect( domSelection.anchorOffset ).to.equal( 1 );
				expect( domSelection.focusNode ).to.equal( domP );
				expect( domSelection.focusOffset ).to.equal( 1 );
			} );

			it( 'should not render non-collapsed selection it is similar (element start)', () => {
				const domSelection = document.getSelection();

				const { view: viewP, selection: newSelection } = parse(
					'<container:p>foo<attribute:b>{ba}r</attribute:b></container:p>' );

				viewRoot.appendChildren( viewP );
				selection.setTo( newSelection );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				const domP = domRoot.childNodes[ 0 ];
				const domB = domP.childNodes[ 1 ];
				const viewB = viewRoot.getChild( 0 ).getChild( 1 );

				expect( domSelection.isCollapsed ).to.false;
				expect( domSelection.rangeCount ).to.equal( 1 );
				expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domB.childNodes[ 0 ] );
				expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 0 );
				expect( domSelection.getRangeAt( 0 ).endContainer ).to.equal( domB.childNodes[ 0 ] );
				expect( domSelection.getRangeAt( 0 ).endOffset ).to.equal( 2 );

				selectionCollapseSpy = sinon.spy( window.Selection.prototype, 'collapse' );
				selectionExtendSpy = sinon.spy( window.Selection.prototype, 'extend' );

				// <container:p>foo{<attribute:b>ba}r</attribute:b></container:p>
				selection.setRanges( [
					new ViewRange( new ViewPosition( viewP.getChild( 0 ), 3 ), new ViewPosition( viewB.getChild( 0 ), 2 ) )
				] );

				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( selectionCollapseSpy.notCalled ).to.true;
				expect( selectionExtendSpy.notCalled ).to.true;
				expect( logWarnStub.called ).to.true;
			} );

			it( 'should not render non-collapsed selection it is similar (element end)', () => {
				const domSelection = document.getSelection();

				const { view: viewP, selection: newSelection } = parse(
					'<container:p>foo<attribute:b>b{ar}</attribute:b>baz</container:p>' );

				viewRoot.appendChildren( viewP );
				selection.setTo( newSelection );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				const domP = domRoot.childNodes[ 0 ];
				const domB = domP.childNodes[ 1 ];
				const viewB = viewRoot.getChild( 0 ).getChild( 1 );

				expect( domSelection.isCollapsed ).to.false;
				expect( domSelection.rangeCount ).to.equal( 1 );
				expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domB.childNodes[ 0 ] );
				expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 1 );
				expect( domSelection.getRangeAt( 0 ).endContainer ).to.equal( domB.childNodes[ 0 ] );
				expect( domSelection.getRangeAt( 0 ).endOffset ).to.equal( 3 );

				selectionCollapseSpy = sinon.spy( window.Selection.prototype, 'collapse' );
				selectionExtendSpy = sinon.spy( window.Selection.prototype, 'extend' );

				// <container:p>foo<attribute:b>b{ar</attribute:b>}baz</container:p>
				selection.setRanges( [
					new ViewRange( new ViewPosition( viewB.getChild( 0 ), 1 ), new ViewPosition( viewP.getChild( 2 ), 0 ) )
				] );

				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( selectionCollapseSpy.notCalled ).to.true;
				expect( selectionExtendSpy.notCalled ).to.true;
				expect( logWarnStub.called ).to.true;
			} );

			it( 'should not render non-collapsed selection it is similar (element start - nested)', () => {
				const domSelection = document.getSelection();

				const { view: viewP, selection: newSelection } = parse(
					'<container:p>foo<attribute:b><attribute:i>{ba}r</attribute:i></attribute:b></container:p>' );

				viewRoot.appendChildren( viewP );
				selection.setTo( newSelection );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				const domP = domRoot.childNodes[ 0 ];
				const domB = domP.childNodes[ 1 ];
				const viewI = viewRoot.getChild( 0 ).getChild( 1 ).getChild( 0 );

				expect( domSelection.isCollapsed ).to.false;
				expect( domSelection.rangeCount ).to.equal( 1 );
				expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domB.childNodes[ 0 ].childNodes[ 0 ] );
				expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 0 );
				expect( domSelection.getRangeAt( 0 ).endContainer ).to.equal( domB.childNodes[ 0 ].childNodes[ 0 ] );
				expect( domSelection.getRangeAt( 0 ).endOffset ).to.equal( 2 );

				selectionCollapseSpy = sinon.spy( window.Selection.prototype, 'collapse' );
				selectionExtendSpy = sinon.spy( window.Selection.prototype, 'extend' );

				// <container:p>foo{<attribute:b><attribute:i>ba}r</attribute:i></attribute:b></container:p>
				selection.setRanges( [
					new ViewRange( new ViewPosition( viewP.getChild( 0 ), 3 ), new ViewPosition( viewI.getChild( 0 ), 2 ) )
				] );

				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( selectionCollapseSpy.notCalled ).to.true;
				expect( selectionExtendSpy.notCalled ).to.true;
				expect( logWarnStub.called ).to.true;
			} );

			it( 'should not render non-collapsed selection it is similar (element end - nested)', () => {
				const domSelection = document.getSelection();

				const { view: viewP, selection: newSelection } = parse(
					'<container:p>f{oo<attribute:b><attribute:i>bar}</attribute:i></attribute:b>baz</container:p>' );

				viewRoot.appendChildren( viewP );
				selection.setTo( newSelection );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				const domP = domRoot.childNodes[ 0 ];
				const domB = domP.childNodes[ 1 ];

				expect( domSelection.isCollapsed ).to.false;
				expect( domSelection.rangeCount ).to.equal( 1 );
				expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP.childNodes[ 0 ] );
				expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 1 );
				expect( domSelection.getRangeAt( 0 ).endContainer ).to.equal( domB.childNodes[ 0 ].childNodes[ 0 ] );
				expect( domSelection.getRangeAt( 0 ).endOffset ).to.equal( 3 );

				selectionCollapseSpy = sinon.spy( window.Selection.prototype, 'collapse' );
				selectionExtendSpy = sinon.spy( window.Selection.prototype, 'extend' );

				// <container:p>f{oo<attribute:b><attribute:i>bar</attribute:i></attribute:b>}baz</container:p>
				selection.setRanges( [
					new ViewRange( new ViewPosition( viewP.getChild( 0 ), 1 ), new ViewPosition( viewP.getChild( 2 ), 0 ) )
				] );

				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( selectionCollapseSpy.notCalled ).to.true;
				expect( selectionExtendSpy.notCalled ).to.true;
				expect( logWarnStub.called ).to.true;
			} );
		} );
	} );

	describe( '#922', () => {
		let viewDoc, viewRoot, domRoot, converter;

		beforeEach( () => {
			viewDoc = new ViewDocument();
			domRoot = document.createElement( 'div' );
			document.body.appendChild( domRoot );
			viewRoot = viewDoc.createRoot( domRoot );
			converter = viewDoc.domConverter;
		} );

		it( 'should properly render unwrapped attributes #1', () => {
			setViewData( viewDoc,
				'<container:p>' +
					'[<attribute:italic>' +
						'<attribute:strong>f</attribute:strong>' +
					'</attribute:italic>]' +
					'<attribute:strong>oo</attribute:strong>' +
				'</container:p>'
			);

			// Render it to DOM to create initial DOM <-> view mappings.
			viewDoc.render();

			// Unwrap italic attribute element.
			unwrap( viewDoc.selection.getFirstRange(), new ViewAttributeElement( 'italic' ) );
			expect( getViewData( viewDoc ) ).to.equal( '<p>[<strong>foo</strong>]</p>' );

			// Re-render changes in view to DOM.
			viewDoc.render();

			// Check if DOM is rendered correctly.
			expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( '<p><strong>foo</strong></p>' );
			expect( checkMappings() ).to.be.true;
		} );

		it( 'should properly render unwrapped attributes #2', () => {
			setViewData( viewDoc,
				'<container:p>' +
					'[<attribute:italic>' +
						'<attribute:strong>foo</attribute:strong>' +
					'</attribute:italic>]' +
				'</container:p>' );

			// Render it to DOM to create initial DOM <-> view mappings.
			viewDoc.render();

			// Unwrap italic attribute element and change text inside.
			unwrap( viewDoc.selection.getFirstRange(), new ViewAttributeElement( 'italic' ) );
			viewRoot.getChild( 0 ).getChild( 0 ).getChild( 0 ).data = 'bar';
			expect( getViewData( viewDoc ) ).to.equal( '<p>[<strong>bar</strong>]</p>' );

			// Re-render changes in view to DOM.
			viewDoc.render();

			// Check if DOM is rendered correctly.
			expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( '<p><strong>bar</strong></p>' );
			expect( checkMappings() ).to.be.true;
		} );

		it( 'should properly render if text is changed and element is inserted into same node #1', () => {
			setViewData( viewDoc,
				'<container:p>foo</container:p>'
			);

			// Render it to DOM to create initial DOM <-> view mappings.
			viewDoc.render();

			// Change text and insert new element into paragraph.
			const textNode = viewRoot.getChild( 0 ).getChild( 0 );
			textNode.data = 'foobar';
			insert( ViewPosition.createAfter( textNode ), new ViewAttributeElement( 'img' ) );
			expect( getViewData( viewDoc ) ).to.equal( '<p>foobar<img></img></p>' );

			// Re-render changes in view to DOM.
			viewDoc.render();

			// Check if DOM is rendered correctly.
			expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( '<p>foobar<img></img></p>' );
			expect( checkMappings() ).to.be.true;
		} );

		it( 'should properly render if text is changed and element is inserted into same node #2', () => {
			setViewData( viewDoc,
				'<container:p>foo</container:p>'
			);

			// Render it to DOM to create initial DOM <-> view mappings.
			viewDoc.render();

			// Change text and insert new element into paragraph.
			const textNode = viewRoot.getChild( 0 ).getChild( 0 );
			textNode.data = 'foobar';
			insert( ViewPosition.createBefore( textNode ), new ViewAttributeElement( 'img' ) );
			expect( getViewData( viewDoc ) ).to.equal( '<p><img></img>foobar</p>' );

			// Re-render changes in view to DOM.
			viewDoc.render();

			// Check if DOM is rendered correctly.
			expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( '<p><img></img>foobar</p>' );
			expect( checkMappings() ).to.be.true;
		} );

		it( 'should not unbind elements that are removed and reinserted to DOM', () => {
			setViewData( viewDoc,
				'<container:p>' +
					'<attribute:b></attribute:b>' +
					'<attribute:i></attribute:i>' +
					'<attribute:span></attribute:span>' +
				'</container:p>'
			);

			// Render it to DOM to create initial DOM <-> view mappings.
			viewDoc.render();

			// Remove first element and reinsert it at the end.
			const container = viewRoot.getChild( 0 );
			const firstElement = container.getChild( 0 );

			remove( ViewRange.createOn( firstElement ) );
			insert( new ViewPosition( container, 2 ), firstElement );
			expect( getViewData( viewDoc ) ).to.equal( '<p><i></i><span></span><b></b></p>' );

			// Re-render changes in view to DOM.
			viewDoc.render();

			// Check if DOM is rendered correctly.
			expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( '<p><i></i><span></span><b></b></p>' );
			expect( checkMappings() ).to.be.true;
		} );

		// Checks if every node in DOM tree is mapped to the view.
		function checkMappings() {
			const domWalker = document.createTreeWalker( domRoot, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT );

			while ( domWalker.nextNode() ) {
				const node = domWalker.currentNode;

				if ( !converter.mapDomToView( node ) && !converter.findCorrespondingViewText( node ) ) {
					return false;
				}
			}

			return true;
		}
	} );
} );

function renderAndExpectNoChanges( renderer, domRoot ) {
	const config = {
		childList: true,
		characterData: true,
		characterDataOldValue: true,
		subtree: true
	};

	const mutationObserver = new window.MutationObserver( () => {
		throw 'There should be not mutations';
	} );
	mutationObserver.observe( domRoot, config );

	renderer.render();

	const records = mutationObserver.takeRecords();
	mutationObserver.disconnect();
	expect( records.length ).to.equal( 0 );
}
