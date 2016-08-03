/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

import ViewElement from '/ckeditor5/engine/view/element.js';
import ViewText from '/ckeditor5/engine/view/text.js';
import ViewRange from '/ckeditor5/engine/view/range.js';
import Selection from '/ckeditor5/engine/view/selection.js';
import DomConverter from '/ckeditor5/engine/view/domconverter.js';
import Renderer from '/ckeditor5/engine/view/renderer.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import { parse } from '/tests/engine/_utils/view.js';
import { INLINE_FILLER, INLINE_FILLER_LENGTH, isBlockFiller, BR_FILLER } from '/ckeditor5/engine/view/filler.js';
import testUtils from '/tests/core/_utils/utils.js';
import createElement from '/ckeditor5/utils/dom/createelement.js';

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

			selectionEditable = viewRoot;

			renderer.isFocused = true;

			// Fake selection editable - it is needed to render selection properly.
			Object.defineProperty( selection, 'editableElement', {
				get: function() {
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

		it( 'should not care about filler if there is no DOM', () => {
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
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP.childNodes[ 0 ] .childNodes[ 0 ] );
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
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP.childNodes[ 0 ] .childNodes[ 0 ] );
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
			const domRange = new Range();
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
			domP.appendChild( BR_FILLER( document ) );

			domSelection.removeAllRanges();
			const domRange = new Range();
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

			const { view: viewP, selection: newSelection } = parse(
				'<container:p><attribute:b>[]</attribute:b>foo</container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

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

			// Add text node to both DOM and View <p><b>x</b>foo</p>
			domB.childNodes[ 0 ].data += 'x';

			domSelection.removeAllRanges();
			const domRange = new Range();
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

			const { view: viewP, selection: newSelection } = parse(
				'<container:p><attribute:b>[]</attribute:b>foo</container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

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

			// Add text node only to View <p><b>x</b>foo</p>
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

			const { view: viewP, selection: newSelection } = parse(
				'<container:p><attribute:b>[]</attribute:b>foo</container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

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

			// Add text node only to View <p><b>x</b>foo</p>
			const viewText = new ViewText( 'x' );
			viewB.appendChildren( viewText );
			selection.removeAllRanges();
			selection.addRange( ViewRange.createFromParentsAndOffsets( viewText, 1, viewText, 1 ) );

			renderer.markToSync( 'text', viewText );
			renderer.render();

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
			const domRange = new Range();
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
			const domRange = new Range();
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

		it( 'should not add ranges if different editable is selected', () => {
			const domHeader = document.createElement( 'h1' );
			const viewHeader = new ViewElement( 'h1' );
			document.body.appendChild( domHeader );

			domConverter.bindElements( domHeader, viewHeader );

			selectionEditable = viewHeader;

			const { view: viewP, selection: newSelection } = parse( '<container:p>fo{o}</container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.render();

			const domSelection = document.getSelection();
			expect( domSelection.rangeCount ).to.equal( 0 );
		} );

		it( 'should not add inline filler after text node', () => {
			const domSelection = document.getSelection();

			const { view: viewP, selection: newSelection } = parse( '<container:p>foo[]</container:p>' );

			viewRoot.appendChildren( viewP );
			selection.setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 0 ].data ).to.equal( 'foo' );

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;
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
			} ).to.throw();
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
