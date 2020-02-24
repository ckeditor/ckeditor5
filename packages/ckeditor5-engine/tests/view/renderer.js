/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, window, NodeFilter, MutationObserver */

import View from '../../src/view/view';
import ViewElement from '../../src/view/element';
import ViewEditableElement from '../../src/view/editableelement';
import ViewContainerElement from '../../src/view/containerelement';
import ViewAttributeElement from '../../src/view/attributeelement';
import ViewText from '../../src/view/text';
import ViewRange from '../../src/view/range';
import ViewPosition from '../../src/view/position';
import UIElement from '../../src/view/uielement';
import Renderer from '../../src/view/renderer';
import DocumentFragment from '../../src/view/documentfragment';
import DowncastWriter from '../../src/view/downcastwriter';

import { parse, stringify, setData as setViewData, getData as getViewData } from '../../src/dev-utils/view';
import { BR_FILLER, INLINE_FILLER, INLINE_FILLER_LENGTH } from '../../src/view/filler';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import createViewRoot from './_utils/createroot';
import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';
import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';
import env from '@ckeditor/ckeditor5-utils/src/env';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { StylesProcessor } from '../../src/view/stylesmap';

describe( 'Renderer', () => {
	let view, selection, domConverter, renderer, viewDocument;
	let stylesProcessor;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		stylesProcessor = new StylesProcessor();

		view = new View( stylesProcessor );
		viewDocument = view.document;

		renderer = new Renderer( view );
		domConverter = renderer.domConverter;
		selection = renderer.selection;

		renderer.domDocuments.add( document );
	} );

	describe( 'markToSync', () => {
		let viewRoot;

		beforeEach( () => {
			viewRoot = new ViewElement( viewDocument, 'p' );

			const domRoot = document.createElement( 'p' );
			domConverter.bindElements( domRoot, viewRoot );
			viewRoot._appendChild( new ViewText( viewDocument, 'foo' ) );

			renderer.markedTexts.clear();
			renderer.markedAttributes.clear();
			renderer.markedChildren.clear();
		} );

		it( 'should mark attributes which need update', () => {
			viewRoot._setAttribute( 'class', 'foo' );

			renderer.markToSync( 'attributes', viewRoot );

			expect( renderer.markedAttributes.has( viewRoot ) ).to.be.true;
		} );

		it( 'should mark children which need update', () => {
			viewRoot._appendChild( new ViewText( viewDocument, 'foo' ) );

			renderer.markToSync( 'children', viewRoot );

			expect( renderer.markedChildren.has( viewRoot ) ).to.be.true;
		} );

		it( 'should not mark children if element has no corresponding node', () => {
			// Overwrite viewRoot with node without coresponding DOM node.
			viewRoot = new ViewElement( viewDocument, 'p' );

			viewRoot._appendChild( new ViewText( viewDocument, 'foo' ) );

			renderer.markToSync( 'children', viewRoot );

			expect( renderer.markedTexts.has( viewRoot ) ).to.be.false;
		} );

		it( 'should mark text which need update', () => {
			const viewText = new ViewText( viewDocument, 'foo' );
			viewRoot._appendChild( viewText );
			viewText._data = 'bar';

			renderer.markToSync( 'text', viewText );

			expect( renderer.markedTexts.has( viewText ) ).to.be.true;
		} );

		it( 'should not mark text if parent has no corresponding node', () => {
			const viewText = new ViewText( viewDocument, 'foo' );
			// Overwrite viewRoot with node without coresponding DOM node.
			viewRoot = new ViewElement( viewDocument, 'p' );

			viewRoot._appendChild( viewText );
			viewText._data = 'bar';

			renderer.markToSync( 'text', viewText );

			expect( renderer.markedTexts.has( viewText ) ).to.be.false;
		} );

		it( 'should throw if the type is unknown', () => {
			expectToThrowCKEditorError( () => {
				renderer.markToSync( 'UNKNOWN', viewRoot );
			}, /^view-renderer-unknown-type/, selection );
		} );
	} );

	describe( 'render', () => {
		let viewRoot, domRoot;

		beforeEach( () => {
			viewRoot = new ViewEditableElement( viewDocument, 'div' );
			viewRoot.getFillerOffset = () => null;

			domRoot = document.createElement( 'div' );
			document.body.appendChild( domRoot );

			domConverter.bindElements( domRoot, viewRoot );

			renderer.markedTexts.clear();
			renderer.markedAttributes.clear();
			renderer.markedChildren.clear();

			selection._setTo( null );

			renderer.isFocused = true;
		} );

		afterEach( () => {
			domRoot.remove();
		} );

		it( 'should update attributes', () => {
			viewRoot._setAttribute( 'class', 'foo' );

			renderer.markToSync( 'attributes', viewRoot );
			renderer.render();

			expect( domRoot.getAttribute( 'class' ) ).to.equal( 'foo' );

			expect( renderer.markedAttributes.size ).to.equal( 0 );
		} );

		it( 'should remove attributes', () => {
			viewRoot._setAttribute( 'class', 'foo' );
			domRoot.setAttribute( 'id', 'bar' );
			domRoot.setAttribute( 'class', 'bar' );

			renderer.markToSync( 'attributes', viewRoot );
			renderer.render();

			expect( domRoot.getAttribute( 'class' ) ).to.equal( 'foo' );
			expect( domRoot.getAttribute( 'id' ) ).to.be.not.ok;

			expect( renderer.markedAttributes.size ).to.equal( 0 );
		} );

		it( 'should add children', () => {
			viewRoot._appendChild( new ViewText( viewDocument, 'foo' ) );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'foo' );

			expect( renderer.markedChildren.size ).to.equal( 0 );
		} );

		it( 'should remove children', () => {
			viewRoot._appendChild( new ViewText( viewDocument, 'foo' ) );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'foo' );

			viewRoot._removeChildren( 0, 1 );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 0 );

			expect( renderer.markedChildren.size ).to.equal( 0 );
		} );

		it( 'should update text', () => {
			const viewText = new ViewText( viewDocument, 'foo' );
			viewRoot._appendChild( viewText );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'foo' );

			viewText._data = 'bar';

			renderer.markToSync( 'text', viewText );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'bar' );

			expect( renderer.markedTexts.size ).to.equal( 0 );
		} );

		it( 'should not update same text', () => {
			const viewText = new ViewText( viewDocument, 'foo' );
			viewRoot._appendChild( viewText );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'foo' );

			viewText._data = 'foo';

			renderer.markToSync( 'text', viewText );

			renderAndExpectNoChanges( renderer, domRoot );

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'foo' );

			expect( renderer.markedTexts.size ).to.equal( 0 );
		} );

		it( 'should not update text parent child list changed', () => {
			const viewImg = new ViewElement( viewDocument, 'img' );
			const viewText = new ViewText( viewDocument, 'foo' );
			viewRoot._appendChild( [ viewImg, viewText ] );

			renderer.markToSync( 'children', viewRoot );
			renderer.markToSync( 'text', viewText );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 2 );
			expect( domRoot.childNodes[ 0 ].tagName ).to.equal( 'IMG' );
			expect( domRoot.childNodes[ 1 ].data ).to.equal( 'foo' );
		} );

		it( 'should not change text if it is the same during text rendering', () => {
			const viewText = new ViewText( viewDocument, 'foo' );
			viewRoot._appendChild( viewText );

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
			const viewText = new ViewText( viewDocument, 'foo' );
			viewRoot._appendChild( viewText );

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
			const viewImg = new ViewElement( viewDocument, 'img' );
			viewRoot._appendChild( viewImg );

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
			const viewImg = new ViewElement( viewDocument, 'img' );
			viewRoot._appendChild( viewImg );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const viewP = new ViewElement( viewDocument, 'p' );
			viewRoot._removeChildren( 0, 1 );
			viewRoot._appendChild( viewP );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].tagName ).to.equal( 'P' );
		} );

		it( 'should update removed item when it is reinserted', () => {
			const viewFoo = new ViewText( viewDocument, 'foo' );
			const viewP = new ViewElement( viewDocument, 'p', null, viewFoo );
			const viewDiv = new ViewElement( viewDocument, 'div', null, viewP );

			viewRoot._appendChild( viewDiv );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			viewDiv._removeChildren( 0, 1 );
			renderer.markToSync( 'children', viewDiv );
			renderer.render();

			viewP._removeChildren( 0, 1 );

			viewDiv._appendChild( viewP );
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
			const viewP = new ViewElement( viewDocument, 'p' );
			const viewDivInner = new ViewElement( viewDocument, 'div', null, viewP );
			const viewDivOuter = new ViewElement( viewDocument, 'div', null, viewDivInner );
			viewRoot._appendChild( viewDivOuter );

			// Render view tree to DOM.
			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			// Remove div "outer" from root and render it.
			viewDivOuter._remove();
			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			// Remove p from div "child" -- div "inner" won't be marked because it is in document fragment not view root.
			viewP._remove();
			// Add div "outer" back to root.
			viewRoot._appendChild( viewDivOuter );
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
			const viewFoo = new ViewText( viewDocument, 'foo' );
			const viewP = new ViewElement( viewDocument, 'p', null, viewFoo );
			const viewDiv = new ViewElement( viewDocument, 'div', null, viewP );

			viewRoot._appendChild( viewDiv );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			viewRoot._removeChildren( 0, 1 );
			renderer.markToSync( 'children', viewRoot );

			viewDiv._removeChildren( 0, 1 );
			renderer.markToSync( 'children', viewDiv );

			viewP._removeChildren( 0, 1 );
			renderer.markToSync( 'children', viewP );

			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 0 );
		} );

		it( 'should not care about filler if there is no DOM', () => {
			const { view: viewP, selection: newSelection } = parse(
				'<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>' );

			const viewRoot = new ViewElement( viewDocument, 'p' );
			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			// Expect no error on render.
			expect( viewRoot ).to.be.ok;
		} );

		it( 'should not add filler when inside contenteditable=false parent', () => {
			const { view: viewP, selection: newSelection } = parse(
				'<container:p>foo<attribute:b contenteditable="false">[]</attribute:b>bar</container:p>' );

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].tagName.toLowerCase() ).to.equal( 'p' );

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.childNodes.length ).to.equal( 3 );
			expect( domP.childNodes[ 0 ].data ).to.equal( 'foo' );
			expect( domP.childNodes[ 2 ].data ).to.equal( 'bar' );
			expect( domP.childNodes[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 1 ].childNodes.length ).to.equal( 0 );
		} );

		it( 'should not add filler when inside contenteditable=false ancestor', () => {
			const { view: viewP, selection: newSelection } = parse(
				'<container:p contenteditable="false">foo<attribute:b>[]</attribute:b>bar</container:p>' );

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].tagName.toLowerCase() ).to.equal( 'p' );

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.childNodes.length ).to.equal( 3 );
			expect( domP.childNodes[ 0 ].data ).to.equal( 'foo' );
			expect( domP.childNodes[ 2 ].data ).to.equal( 'bar' );
			expect( domP.childNodes[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 1 ].childNodes.length ).to.equal( 0 );
		} );

		it( 'should add and remove inline filler in case <p>foo<b>[]</b>bar</p>', () => {
			const domSelection = document.getSelection();

			// Step 1: <p>foo<b>"FILLER{}"</b></p>
			const { view: viewP, selection: newSelection } = parse(
				'<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>' );

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

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
			selection._setTo( ViewRange._createFromParentsAndOffsets( viewP.getChild( 0 ), 3, viewP.getChild( 0 ), 3 ) );

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

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

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
			selection._setTo( ViewRange._createFromParentsAndOffsets(
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

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

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
			selection._setTo( ViewRange._createFromParentsAndOffsets(
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

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

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

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

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
			const viewI = viewP.getChild( 2 );
			selection._setTo( ViewRange._createFromParentsAndOffsets( viewI, 0, viewI, 0 ) );

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
			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];
			expect( domP.childNodes.length ).to.equal( 2 );
			expect( domP.childNodes[ 0 ].data ).to.equal( 'foo' );
			expect( domP.childNodes[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP.childNodes[ 1 ].childNodes.length ).to.equal( 1 );
			expect( domP.childNodes[ 1 ].childNodes[ 0 ].data ).to.equal( INLINE_FILLER );

			// Step 2: Add text node.
			const viewText = new ViewText( viewDocument, 'x' );
			viewB._appendChild( viewText );
			selection._setTo( ViewRange._createFromParentsAndOffsets( viewText, 1, viewText, 1 ) );

			renderer.markToSync( 'children', viewB );
			renderer.render();

			// Step 3: Remove selection from the view.
			selection._setTo( null );

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
			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];
			expect( domP.childNodes.length ).to.equal( 3 );
			expect( domP.childNodes[ 2 ].data ).to.equal( INLINE_FILLER );

			// Step 2: Remove the <b> and update the selection (<p>bar[]</p>).
			viewP._removeChildren( 1 );

			selection._setTo( ViewRange._createFromParentsAndOffsets( viewP, 1, viewP, 1 ) );

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
			viewRoot._appendChild( viewFragment );
			selection._setTo( newSelection );

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
			const removedChildren = viewP._removeChildren( 0, 2 );

			viewP2._appendChild( removedChildren );

			selection._setTo( ViewRange._createFromParentsAndOffsets( viewP, 0, viewP, 0 ) );

			renderer.markToSync( 'children', viewP );
			renderer.markToSync( 'children', viewP2 );
			renderer.render();

			// Step 3: Check whether in the first paragraph there's a <br> filler and that
			// in the second one there are two <b> tags.
			expect( domP.childNodes.length ).to.equal( 1 );
			expect( domConverter.isBlockFiller( domP.childNodes[ 0 ] ) ).to.be.true;

			expect( domP2.childNodes.length ).to.equal( 2 );
			expect( domP2.childNodes[ 0 ].tagName.toLowerCase() ).to.equal( 'b' );
			expect( domP2.childNodes[ 1 ].tagName.toLowerCase() ).to.equal( 'b' );
		} );

		// Test for an edge case in the _isSelectionInInlineFiller which can be triggered like
		// in one of ckeditor/ckeditor5-typing#59 automated tests.
		it( 'should not break when selection is moved to a new element, when filler exists', () => {
			// Step 1: <p>bar<b>"FILLER{}"</b></p>
			const { view: viewP, selection: newSelection } = parse( '<container:p>bar<attribute:b>[]</attribute:b></container:p>' );
			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];
			expect( domP.childNodes.length ).to.equal( 2 );
			expect( domP.childNodes[ 1 ].childNodes[ 0 ].data ).to.equal( INLINE_FILLER );

			// Step 2: Move selection to a new attribute element and remove the previous one
			viewP._removeChildren( 1 ); // Remove <b>.

			const viewI = parse( '<attribute:i></attribute:i>' );
			viewP._appendChild( viewI );

			selection._setTo( ViewRange._createFromParentsAndOffsets( viewI, 0, viewI, 0 ) );

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
			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];
			expect( domP.childNodes.length ).to.equal( 3 );
			expect( domP.childNodes[ 2 ].data ).to.equal( INLINE_FILLER );

			// Step 2: Move selection to a new attribute element.
			const viewAbc = parse( 'abc' );
			viewP._appendChild( viewAbc );

			selection._setTo( ViewRange._createFromParentsAndOffsets( viewP, 3, viewP, 3 ) );

			renderer.markToSync( 'children', viewP );
			renderer.render();

			// Step 3: Check whether old filler was removed.
			expect( domP.childNodes.length ).to.equal( 3 );
			expect( domP.textContent.indexOf( INLINE_FILLER ) ).to.equal( -1 );
		} );

		it( 'should handle typing in empty block, do nothing if changes are already applied', () => {
			const domSelection = document.getSelection();

			const { view: viewP, selection: newSelection } = parse( '<container:p>[]</container:p>' );

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.childNodes.length ).to.equal( 1 );
			expect( domConverter.isBlockFiller( domP.childNodes[ 0 ] ) ).to.be.true;

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

			const viewText = new ViewText( viewDocument, 'x' );
			viewP._appendChild( viewText );
			selection._setTo( ViewRange._createFromParentsAndOffsets( viewText, 1, viewText, 1 ) );

			renderer.markToSync( 'children', viewP );
			renderAndExpectNoChanges( renderer, domRoot );
		} );

		it( 'should handle typing in empty block, render if needed', () => {
			const domSelection = document.getSelection();

			const { view: viewP, selection: newSelection } = parse( '<container:p>[]</container:p>' );

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.childNodes.length ).to.equal( 1 );
			expect( domConverter.isBlockFiller( domP.childNodes[ 0 ] ) ).to.be.true;

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.getRangeAt( 0 ).startContainer ).to.equal( domP );
			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 0 );
			expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;

			// Add text node only in View <p>x{}</p>
			const viewText = new ViewText( viewDocument, 'x' );
			viewP._appendChild( viewText );
			selection._setTo( ViewRange._createFromParentsAndOffsets( viewText, 1, viewText, 1 ) );

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

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

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

			viewP._removeChildren( 0 );

			selection._setTo( ViewRange._createFromParentsAndOffsets( viewP, 0, viewP, 0 ) );

			renderer.markToSync( 'children', viewP );
			renderAndExpectNoChanges( renderer, domRoot );
		} );

		it( 'should handle typing in empty attribute, do nothing if changes are already applied', () => {
			const domSelection = document.getSelection();

			// 1. Render <p><b>FILLER{}</b>foo</p>.

			const { view: viewP, selection: newSelection } = parse(
				'<container:p><attribute:b>[]</attribute:b>foo</container:p>' );

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

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

			const viewText = new ViewText( viewDocument, 'x' );
			viewB._appendChild( viewText );
			selection._setTo( ViewRange._createFromParentsAndOffsets( viewText, 1, viewText, 1 ) );

			renderer.markToSync( 'children', viewP );
			renderAndExpectNoChanges( renderer, domRoot );
		} );

		it( 'should handle typing in empty attribute as a children change, render if needed', () => {
			const domSelection = document.getSelection();

			// 1. Render <p><b>FILLER{}</b>foo</p>.

			const { view: viewP, selection: newSelection } = parse(
				'<container:p><attribute:b>[]</attribute:b>foo</container:p>' );

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

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

			domSelection.removeAllRanges();
			// 3. Add text node only to the view: <p><b>x{}</b>foo</p>.

			const viewText = new ViewText( viewDocument, 'x' );
			viewB._appendChild( viewText );
			selection._setTo( ViewRange._createFromParentsAndOffsets( viewText, 1, viewText, 1 ) );

			renderer.markToSync( 'children', viewB );
			renderer.render();

			expect( domB.childNodes.length ).to.equal( 1 );
			expect( domB.childNodes[ 0 ].data ).to.equal( INLINE_FILLER + 'x' );

			expect( domSelection.rangeCount ).to.equal( 1 );

			// Depending on the browser selection may end up at the end of the text node or after the text node.
			const firstRange = domSelection.getRangeAt( 0 );

			const assertSelectionAtEndOfTextNode = () => {
				expect( firstRange.startOffset ).to.equal( INLINE_FILLER_LENGTH + 1 );
			};

			const assertSelectionInsideTextNode = () => {
				expect( firstRange.startContainer ).to.equal( domB );
				expect( firstRange.startOffset ).to.equal( 1 );
			};

			testUtils.checkAssertions( assertSelectionAtEndOfTextNode, assertSelectionInsideTextNode );
			expect( firstRange.collapsed ).to.be.true;
		} );

		it( 'should handle typing in empty attribute as a text change, render if needed', () => {
			const domSelection = document.getSelection();

			// 1. Render <p><b>FILLER{}</b>foo</p>.

			const { view: viewP, selection: newSelection } = parse(
				'<container:p><attribute:b>[]</attribute:b>foo</container:p>' );

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

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

			const viewText = new ViewText( viewDocument, 'x' );
			viewB._appendChild( viewText );
			selection._setTo( ViewRange._createFromParentsAndOffsets( viewText, 1, viewText, 1 ) );

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

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

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
			const domDiv = createElement( document, 'div', { contenteditable: true }, 'not editable' );
			document.body.appendChild( domDiv );
			domDiv.focus();

			const domSelection = document.getSelection();

			domSelection.removeAllRanges();
			domSelection.collapse( domDiv, 0 );

			const viewDiv = new ViewElement( viewDocument, 'div' );
			const { view: viewP, selection: newSelection } = parse( '<container:p>fo{o}</container:p>' );

			viewDiv._appendChild( viewP );
			selection._setTo( newSelection );

			renderer.render();

			expect( domSelection.rangeCount ).to.equal( 1 );

			// Depending on the browser selection may end up before the text node or at the beginning of it.
			const domRange = domSelection.getRangeAt( 0 );

			const assertSelectionAtEndOfTextNode = () => {
				expect( domRange.startContainer ).to.equal( domDiv );
			};

			const assertSelectionInsideTextNode = () => {
				expect( domRange.startContainer ).to.equal( domDiv.childNodes[ 0 ] );
			};

			testUtils.checkAssertions( assertSelectionAtEndOfTextNode, assertSelectionInsideTextNode );

			expect( domRange.startOffset ).to.equal( 0 );
			expect( domRange.collapsed ).to.be.true;

			domDiv.remove();
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

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

			renderer.render();

			expect( domSelection.rangeCount ).to.equal( 1 );

			// Depending on the browser selection may end up before the text node or at the beginning of it.
			const domSelectionRange = domSelection.getRangeAt( 0 );

			const assertSelectionAtEndOfTextNode = () => {
				expect( domSelectionRange.startContainer ).to.equal( domDiv );
			};

			const assertSelectionInsideTextNode = () => {
				expect( domSelectionRange.startContainer ).to.equal( domDiv.childNodes[ 0 ] );
			};

			testUtils.checkAssertions( assertSelectionAtEndOfTextNode, assertSelectionInsideTextNode );

			expect( domSelectionRange.startOffset ).to.equal( 0 );
			expect( domSelectionRange.collapsed ).to.be.true;

			domDiv.remove();
		} );

		it( 'should not add inline filler after text node', () => {
			const { view: viewP, selection: newSelection } = parse( '<container:p>foo[]</container:p>' );

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];

			expect( domP.innerHTML.indexOf( INLINE_FILLER ) ).to.equal( -1 );
		} );

		it( 'should throw if there is no filler in expected position', () => {
			const { view: viewP, selection: newSelection } = parse(
				'<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>' );

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domB = domRoot.childNodes[ 0 ].childNodes[ 1 ];
			const viewB = viewP.getChild( 1 );

			expect( domB.childNodes[ 0 ].data ).to.equal( INLINE_FILLER );

			// Remove filler.
			domB.childNodes[ 0 ].data = '';

			selection._setTo( null );
			renderer.markToSync( 'children', viewB );

			expectToThrowCKEditorError( () => {
				renderer.render();
			}, /^view-renderer-filler-was-lost/, selection );
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

			viewRoot._appendChild( view );
			selection._setTo( newSelection );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			// 2. Check if filler element has been (correctly) created.
			expect( domRoot.innerHTML.indexOf( INLINE_FILLER ) ).not.to.equal( -1 );

			// 3. Move the inline filler parent to a newly created element.
			const viewLi = view.getChild( 0 );
			const viewLiIndented = view._removeChildren( 1, 1 ); // Array with one element.
			const viewUl = new ViewContainerElement( viewDocument, 'ul', null, viewLiIndented );
			viewLi._appendChild( viewUl );

			// 4. Mark changed items and render the view.
			renderer.markToSync( 'children', view );
			renderer.markToSync( 'children', viewLi );
			renderer.render();

			expect( domRoot.innerHTML.indexOf( INLINE_FILLER ) ).not.to.equal( -1 );

			const domSelection = document.getSelection();

			expect( domSelection.getRangeAt( 0 ).startOffset ).to.equal( 7 ); // After inline filler.
		} );

		it( 'should handle focusing element', () => {
			selection._setTo( viewRoot, 0 );

			const domFocusSpy = testUtils.sinon.spy( domRoot, 'focus' );

			renderer.render();

			expect( domFocusSpy.called ).to.be.true;
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

		it( 'should render NBSP as last space in the previous inline element', () => {
			const viewP = parse( '<container:p>x <attribute:b>y</attribute:b></container:p>' );

			viewRoot._appendChild( viewP );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];
			const domB = domP.childNodes[ 1 ];

			expect( domP.childNodes[ 0 ].data ).to.equal( 'x ' );
			expect( domB.childNodes[ 0 ].data ).to.equal( 'y' );
			expect( domP.innerHTML ).to.equal( 'x <b>y</b>' );

			// Insert space resulting in '<p>x <b> y</b></p>'.
			const viewB = viewP.getChild( 1 );
			viewB._removeChildren( 0 );
			viewB._appendChild( new ViewText( viewDocument, ' y' ) );

			renderer.markToSync( 'children', viewP );
			renderer.render();

			expect( domP.childNodes[ 0 ].data ).to.equal( 'x\u00A0' );
			expect( domB.childNodes[ 0 ].data ).to.equal( ' y' );
			expect( domP.innerHTML ).to.equal( 'x&nbsp;<b> y</b>' );
		} );

		it( 'should update sibling after, when node before is removed', () => {
			const viewP = parse( '<container:p>x<attribute:b> y</attribute:b></container:p>' );

			viewRoot._appendChild( viewP );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];
			const domB = domP.childNodes[ 1 ];

			expect( domP.childNodes[ 0 ].data ).to.equal( 'x' );
			expect( domB.childNodes[ 0 ].data ).to.equal( ' y' );
			expect( domP.innerHTML ).to.equal( 'x<b> y</b>' );

			// Remove 'x' resulting in '<p><b> y</b></p>'.
			viewP._removeChildren( 0 );

			renderer.markToSync( 'children', viewP );
			renderer.render();

			expect( domB.childNodes[ 0 ].data ).to.equal( '\u00A0y' );
			expect( domP.innerHTML ).to.equal( '<b>&nbsp;y</b>' );
		} );

		it( 'should update sibling before, when node after is removed', () => {
			const viewP = parse( '<container:p>x <attribute:b>y</attribute:b></container:p>' );

			viewRoot._appendChild( viewP );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];
			const domB = domP.childNodes[ 1 ];

			expect( domP.childNodes[ 0 ].data ).to.equal( 'x ' );
			expect( domB.childNodes[ 0 ].data ).to.equal( 'y' );
			expect( domP.innerHTML ).to.equal( 'x <b>y</b>' );

			// Remove '<b>y</b>' resulting in '<p>x </p>'.
			viewP._removeChildren( 1 );

			renderer.markToSync( 'children', viewP );
			renderer.render();

			expect( domP.childNodes[ 0 ].data ).to.equal( 'x\u00A0' );
			expect( domP.innerHTML ).to.equal( 'x&nbsp;' );
		} );

		// #1093
		it( 'should update siblings after space is inserted in element before - text-element', () => {
			const viewP = parse( '<container:p>x<attribute:b> y</attribute:b></container:p>' );

			viewRoot._appendChild( viewP );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];
			const domB = domP.childNodes[ 1 ];

			expect( domP.childNodes[ 0 ].data ).to.equal( 'x' );
			expect( domB.childNodes[ 0 ].data ).to.equal( ' y' );
			expect( domP.innerHTML ).to.equal( 'x<b> y</b>' );

			// Insert space resulting in '<p>x <b> y</b></p>'.
			viewP._removeChildren( 0 );
			viewP._insertChild( 0, new ViewText( viewDocument, 'x ' ) );

			renderer.markToSync( 'children', viewP );
			renderer.render();

			expect( domP.childNodes[ 0 ].data ).to.equal( 'x\u00A0' );
			expect( domB.childNodes[ 0 ].data ).to.equal( ' y' );
			expect( domP.innerHTML ).to.equal( 'x&nbsp;<b> y</b>' );
		} );

		// #1093
		it( 'should update siblings after space is inserted in element before - element-text', () => {
			const viewP = parse( '<container:p><attribute:b>x</attribute:b> y</container:p>' );

			viewRoot._appendChild( viewP );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];
			const domB = domP.childNodes[ 0 ];

			expect( domB.childNodes[ 0 ].data ).to.equal( 'x' );
			expect( domP.childNodes[ 1 ].data ).to.equal( ' y' );
			expect( domP.innerHTML ).to.equal( '<b>x</b> y' );

			// Insert space resulting in '<p><b>x </b> y</p>'.
			const viewB = viewP.getChild( 0 );
			viewB._removeChildren( 0 );
			viewB._insertChild( 0, new ViewText( viewDocument, 'x ' ) );

			renderer.markToSync( 'children', viewP );
			renderer.render();

			expect( domB.childNodes[ 0 ].data ).to.equal( 'x\u00A0' );
			expect( domP.childNodes[ 1 ].data ).to.equal( ' y' );
			expect( domP.innerHTML ).to.equal( '<b>x&nbsp;</b> y' );
		} );

		// #1093
		it( 'should update siblings after space is inserted in element before - element-element', () => {
			const viewP = parse( '<container:p><attribute:b>x</attribute:b><attribute:i> y</attribute:i></container:p>' );

			viewRoot._appendChild( viewP );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const domP = domRoot.childNodes[ 0 ];
			const domB = domP.childNodes[ 0 ];
			const domI = domP.childNodes[ 1 ];

			expect( domB.childNodes[ 0 ].data ).to.equal( 'x' );
			expect( domI.childNodes[ 0 ].data ).to.equal( ' y' );
			expect( domP.innerHTML ).to.equal( '<b>x</b><i> y</i>' );

			// Insert space resulting in '<p><b>x </b><i> y</i></p>'.
			const viewB = viewP.getChild( 0 );
			viewB._removeChildren( 0 );
			viewB._insertChild( 0, new ViewText( viewDocument, 'x ' ) );

			renderer.markToSync( 'children', viewP );
			renderer.render();

			expect( domB.childNodes[ 0 ].data ).to.equal( 'x\u00A0' );
			expect( domI.childNodes[ 0 ].data ).to.equal( ' y' );
			expect( domP.innerHTML ).to.equal( '<b>x&nbsp;</b><i> y</i>' );
		} );

		// #1125
		it( 'should properly rerender many changes done in one batch', () => {
			// This test transforms:
			//
			//		<h2>He<strong>ding 1</strong></h2>
			//		<p>Ph <strong>Bold</strong> <i>It<strong>alic</strong></i> <a><strong>Lin</strong>k</a></p>
			//		<blockquote><ul><li>Quoted <strong>item 1</strong></li></ul></blockquote>
			//
			// into:
			//
			//		<h2>Heading 2</h2>
			//		<p>Ph <i><strong>Italic</strong></i> <a><strong>L</strong>ink 1</a></p>
			//		<blockquote><p>Qu<strong>ote</strong></p><ul><li><strong>Quoted item 1</strong></li></ul></blockquote>
			//
			// during one rerender to check if complex structure changes are rerendered correctly.
			const viewContent = parse( '' +
				'<container:h2>He' +
					'<attribute:i>ading 1</attribute:i>' +
				'</container:h2>' +
				'<container:p>Ph ' +
					'<attribute:strong>Bold</attribute:strong> ' +
					'<attribute:i>It' +
						'<attribute:strong>alic</attribute:strong>' +
					'</attribute:i> ' +
					'<attribute:a href="https://ckeditor.com">' +
						'<attribute:strong>Lin</attribute:strong>' +
					'k</attribute:a>' +
				'</container:p>' +
				'<container:blockquote>' +
					'<container:ul>' +
						'<container:li>Quoted <attribute:strong>item 1</attribute:strong></container:li>' +
					'</container:ul>' +
				'</container:blockquote>' );

			viewRoot._appendChild( viewContent );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			// '<h2>He<i>ading 1</i></h2>' -> '<h2>Heading 2</h2>'
			const viewHeading = viewRoot.getChild( 0 );
			viewHeading._removeChildren( 0, viewHeading.childCount );
			viewHeading._insertChild( 0, new ViewText( viewDocument, 'Heading 2' ) );

			// Usually whole subtree is marked to sync so we mark root, changed element and all its direct children.
			renderer.markToSync( 'children', viewRoot );
			renderer.markToSync( 'children', viewHeading );
			renderer.markToSync( 'text', viewHeading.getChild( 0 ) );

			// '<p>Ph <strong>Bold</strong> <i>It<strong>alic</strong></i> <a><strong>Lin</strong>k</a></p>'
			// ->
			// '<p>Ph <i><strong>Italic</strong></i> <a><strong>L</strong>ink 1</a></p>'
			const viewP = viewRoot.getChild( 1 );
			viewP._removeChildren( 0, viewP.childCount );
			viewP._insertChild(
				0,
				parse(
					'Ph <attribute:i><attribute:strong>Italic</attribute:strong></attribute:i> ' +
					'<attribute:a href="https://ckeditor.com"><attribute:strong>L</attribute:strong>ink 1</attribute:a>'
				)
			);

			renderer.markToSync( 'children', viewRoot );
			renderer.markToSync( 'children', viewP );
			renderer.markToSync( 'children', viewP.getChild( 1 ) );
			renderer.markToSync( 'children', viewP.getChild( 3 ) );
			renderer.markToSync( 'text', viewP.getChild( 0 ) );
			renderer.markToSync( 'text', viewP.getChild( 2 ) );

			// '<blockquote><ul><li>Quoted <strong>item 1</strong></li></ul></blockquote>'
			// -> '<blockquote><p>Qu<strong>ote</strong></p><ul><li><strong>Quoted item 1</strong></li></ul></blockquote>'
			const viewBq = viewRoot.getChild( 2 );
			viewBq._removeChildren( 0, viewBq.childCount );
			viewBq._insertChild(
				0,
				parse(
					'<container:p>Qu<attribute:strong>ote</attribute:strong></container:p>' +
					'<container:ul><container:li><attribute:strong>Quoted item 1</attribute:strong></container:li></container:ul>'
				)
			);

			renderer.markToSync( 'children', viewRoot );
			renderer.markToSync( 'children', viewBq );
			renderer.markToSync( 'children', viewBq.getChild( 0 ) );
			renderer.markToSync( 'children', viewBq.getChild( 1 ) );

			renderer.render();

			expect( normalizeHtml( domRoot.innerHTML ) ).to.equal(
				'<h2>Heading 2</h2>' +
				'<p>Ph <i><strong>Italic</strong></i> <a href="https://ckeditor.com"><strong>L</strong>ink 1</a></p>' +
				'<blockquote><p>Qu<strong>ote</strong></p><ul><li><strong>Quoted item 1</strong></li></ul></blockquote>'
			);
		} );

		// #1125
		it( 'should properly rerender changes when whole content replaced at once', () => {
			// This test replaces:
			//
			//		<h1>Header</h1>
			//		<blockquote><ul><li>Quoted <strong>item 1</strong></li><li>Item 2</li></ul></blockquote>
			//
			// with:
			//
			//		<h2>Header</h2>
			//		<p>Not Quoted <strong>item 1</strong> and item 2</p>
			//
			// during one rerender to check if complex structure changes are rerendered correctly.
			const viewContent = parse(
				'<container:h1>Header</container:h1>' +
				'<container:blockquote>' +
					'<container:ul>' +
						'<container:li>Quoted <attribute:strong>item 1</attribute:strong></container:li>' +
						'<container:li>Item 2</container:li>' +
					'</container:ul>' +
				'</container:blockquote>'
			);

			viewRoot._appendChild( viewContent );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			const newViewContent = parse(
				'<container:h2>Header</container:h2>' +
				'<container:p>Not Quoted <attribute:strong>item 1</attribute:strong> and item 2</container:p>'
			);

			viewRoot._removeChildren( 0, viewRoot.childCount );
			viewRoot._appendChild( newViewContent );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( normalizeHtml( domRoot.innerHTML ) ).to.equal(
				'<h2>Header</h2><p>Not Quoted <strong>item 1</strong> and item 2</p>'
			);
		} );

		// #1451
		it( 'should correctly render changed children even if direct parent is not marked to sync', () => {
			const inputView =
				'<container:ul>' +
					'<container:li>Foo</container:li>' +
					'<container:li><attribute:b>Bar</attribute:b></container:li>' +
				'</container:ul>';

			const view = parse( inputView );

			viewRoot._appendChild( view );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.innerHTML ).to.equal( '<ul><li>Foo</li><li><b>Bar</b></li></ul>' );

			const viewLi = view.getChild( 0 );
			const viewLiIndented = view._removeChildren( 1, 1 ); // Array with one element.
			viewLiIndented[ 0 ]._appendChild( parse( '<attribute:i>Baz</attribute:i>' ) );
			const viewUl = new ViewContainerElement( viewDocument, 'ul', null, viewLiIndented );
			viewLi._appendChild( viewUl );

			renderer.markToSync( 'children', view );
			renderer.markToSync( 'children', viewLi );
			renderer.render();

			expect( domRoot.innerHTML ).to.equal( '<ul><li>Foo<ul><li><b>Bar</b><i>Baz</i></li></ul></li></ul>' );
		} );

		// #1439
		it( 'should not force–refresh the selection in non–Gecko browsers after a soft break', () => {
			const domSelection = domRoot.ownerDocument.defaultView.getSelection();

			testUtils.sinon.stub( env, 'isGecko' ).get( () => false );
			const spy = testUtils.sinon.stub( domSelection, 'addRange' );

			// <p>foo<br/>[]</p>
			const { view: viewP, selection: newSelection } = parse(
				'<container:p>' +
					'foo[]' +
					'<empty:br></empty:br>[]' +
				'</container:p>' );

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );
			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			sinon.assert.notCalled( spy );
		} );

		// #1439
		it( 'should force–refresh the selection in Gecko browsers after a soft break to nudge the caret', () => {
			const domSelection = domRoot.ownerDocument.defaultView.getSelection();

			testUtils.sinon.stub( env, 'isGecko' ).get( () => true );
			const spy = testUtils.sinon.stub( domSelection, 'addRange' );

			// <p>foo[]<b>bar</b></p>
			let { view: viewP, selection: newSelection } = parse(
				'<container:p>' +
					'foo[]' +
					'<attribute:b>bar</attribute:b>' +
				'</container:p>' );

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );
			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			sinon.assert.notCalled( spy );

			// <p>foo<b>bar</b></p><p>foo[]<br/></p>
			( { view: viewP, selection: newSelection } = parse(
				'<container:p>' +
					'foo[]' +
					'<empty:br></empty:br>' +
				'</container:p>' ) );

			viewRoot._appendChild( viewP );
			selection._setTo( newSelection );
			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			sinon.assert.notCalled( spy );

			// <p>foo<b>bar</b></p><p>foo<br/>[]</p>
			selection._setTo( [
				new ViewRange( new ViewPosition( viewP, 2 ), new ViewPosition( viewP, 2 ) )
			] );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			sinon.assert.calledOnce( spy );
		} );

		describe( 'fake selection', () => {
			beforeEach( () => {
				const { view: viewP, selection: newSelection } = parse(
					'<container:p>[foo bar]</container:p>'
				);
				viewRoot._appendChild( viewP );
				selection._setTo( newSelection );
				renderer.markToSync( 'children', viewRoot );
				renderer.render();
			} );

			it( 'should render fake selection', () => {
				const label = 'fake selection label';
				selection._setTo( selection.getRanges(), { fake: true, label } );
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

			describe( 'subsequent call optimization', () => {
				// https://github.com/ckeditor/ckeditor5-engine/issues/1791
				it( 'doesn\'t render the same selection multiple times', () => {
					const createRangeSpy = sinon.spy( document, 'createRange' );
					const label = 'subsequent fake selection calls';

					selection._setTo( selection.getRanges(), { fake: true, label } );
					renderer.render();
					selection._setTo( selection.getRanges(), { fake: true, label } );
					renderer.render();

					expect( createRangeSpy.callCount ).to.be.equal( 1 );
				} );

				it( 'different subsequent fake selections sets do change native selection', () => {
					const createRangeSpy = sinon.spy( document, 'createRange' );

					selection._setTo( selection.getRanges(), { fake: true, label: 'selection 1' } );
					renderer.render();
					selection._setTo( selection.getRanges(), { fake: true, label: 'selection 2' } );
					renderer.render();

					expect( createRangeSpy.callCount ).to.be.equal( 2 );
				} );

				it( 'rerenders selection if disturbed externally', () => {
					const interruptingRange = document.createRange();
					interruptingRange.setStartBefore( domRoot.children[ 0 ] );
					interruptingRange.setEndAfter( domRoot.children[ 0 ] );

					const createRangeSpy = sinon.spy( document, 'createRange' );
					const label = 'selection 1';

					selection._setTo( selection.getRanges(), { fake: true, label } );
					renderer.render();

					document.getSelection().removeAllRanges();
					document.getSelection().addRange( interruptingRange );

					selection._setTo( selection.getRanges(), { fake: true, label } );
					renderer.render();

					expect( createRangeSpy.callCount ).to.be.equal( 2 );
				} );

				it( 'correctly maps fake selection ', () => {
					// See https://github.com/ckeditor/ckeditor5-engine/pull/1792#issuecomment-529814641
					const label = 'subsequent fake selection calls';
					const { view: newParagraph, selection: newSelection } = parse( '<container:p>[baz]</container:p>' );

					viewRoot._appendChild( newParagraph );

					selection._setTo( selection.getRanges(), { fake: true, label } );
					renderer.render();

					selection._setTo( newSelection.getRanges(), { fake: true, label } );
					renderer.render();

					const fakeSelectionContainer = domRoot.childNodes[ 1 ];
					const mappedSelection = renderer.domConverter.fakeSelectionToView( fakeSelectionContainer );

					expect( stringify( viewRoot, mappedSelection ) ).to.be.equal( '<div><p>foo bar</p><p>[baz]</p></div>' );
				} );
			} );

			it( 'should render &nbsp; if no selection label is provided', () => {
				selection._setTo( selection.getRanges(), { fake: true } );
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
				selection._setTo( selection.getRanges(), { fake: true } );
				renderer.render();

				selection._setTo( selection.getRanges(), { fake: false } );
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

				selection._setTo( selection.getRanges(), { fake: true, label } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const container = domRoot.childNodes[ 1 ];

				selection._setTo( selection.getRanges(), { fake: true, label } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const newContainer = domRoot.childNodes[ 1 ];
				expect( newContainer ).equals( container );
				expect( newContainer.childNodes.length ).to.equal( 1 );

				const textNode = newContainer.childNodes[ 0 ];
				expect( textNode.textContent ).to.equal( label );
			} );

			it( 'should reuse fake selection container #2', () => {
				selection._setTo( selection.getRanges(), { fake: true, label: 'label 1' } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const container = domRoot.childNodes[ 1 ];

				selection._setTo( selection.getRanges(), { fake: false } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 1 );

				selection._setTo( selection.getRanges(), { fake: true, label: 'label 2' } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const newContainer = domRoot.childNodes[ 1 ];
				expect( newContainer ).equals( container );
				expect( newContainer.childNodes.length ).to.equal( 1 );

				const textNode = newContainer.childNodes[ 0 ];
				expect( textNode.textContent ).to.equal( 'label 2' );
			} );

			it( 'should reuse fake selection container #3', () => {
				selection._setTo( selection.getRanges(), { fake: true, label: 'label 1' } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const container = domRoot.childNodes[ 1 ];

				selection._setTo( selection.getRanges(), { fake: true, label: 'label 2' } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const newContainer = domRoot.childNodes[ 1 ];
				expect( newContainer ).equals( container );
				expect( newContainer.childNodes.length ).to.equal( 1 );

				const textNode = newContainer.childNodes[ 0 ];
				expect( textNode.textContent ).to.equal( 'label 2' );
			} );

			it( 'should style fake selection container properly', () => {
				selection._setTo( selection.getRanges(), { fake: true, label: 'fake selection' } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const container = domRoot.childNodes[ 1 ];

				expect( container.style.position ).to.equal( 'fixed' );
				expect( container.style.top ).to.equal( '0px' );
				expect( container.style.left ).to.equal( '-9999px' );
			} );

			it( 'should move fake selection container between editables', () => {
				const viewEditable = new ViewEditableElement( viewDocument, 'div' );
				viewEditable._appendChild( parse( '<container:p>abc xyz</container:p>' ) );

				const domEditable = document.createElement( 'div' );

				document.body.appendChild( domEditable );

				domConverter.bindElements( domEditable, viewEditable );

				renderer.markToSync( 'children', viewEditable );
				selection._setTo( selection.getRanges(), { fake: true, label: 'fake selection' } );
				renderer.render();

				let container = document.getSelection().anchorNode;

				expect( domRoot.contains( container ) ).to.be.true;

				selection._setTo( viewEditable, 'in', { fake: true, label: 'fake selection' } );
				renderer.render();

				container = document.getSelection().anchorNode;

				expect( domEditable.contains( container ) ).to.be.true;

				domEditable.remove();
			} );

			it( 'should bind fake selection container to view selection', () => {
				selection._setTo( selection.getRanges(), { fake: true, label: 'fake selection' } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const container = domRoot.childNodes[ 1 ];

				const bindSelection = renderer.domConverter.fakeSelectionToView( container );
				expect( bindSelection ).to.not.be.undefined;
				expect( bindSelection.isEqual( selection ) ).to.be.true;
			} );

			// https://github.com/ckeditor/ckeditor5-engine/issues/1714.
			it( 'should handle situation when label got removed from the fake selection container', () => {
				const label = 'fake selection label';
				selection._setTo( selection.getRanges(), { fake: true, label } );
				renderer.render();

				expect( domRoot.childNodes.length ).to.equal( 2 );

				const container = domRoot.childNodes[ 1 ];
				expect( domConverter.mapDomToView( container ) ).to.be.undefined;
				expect( container.childNodes.length ).to.equal( 1 );

				const textNode = container.childNodes[ 0 ];
				expect( textNode.textContent ).to.equal( label );

				// Remove a text node (label) from the fake selection container.
				// It can be done by pressing backspace while the delete command is disabled and selection is on the widget.
				textNode.remove();

				renderer.render();

				const domSelection = domRoot.ownerDocument.getSelection();
				assertDomSelectionContents( domSelection, container, /^fake selection label$/ );
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
			let selectionCollapseSpy, selectionExtendSpy;

			afterEach( () => {
				if ( selectionCollapseSpy ) {
					selectionCollapseSpy.restore();
					selectionCollapseSpy = null;
				}

				if ( selectionExtendSpy ) {
					selectionExtendSpy.restore();
					selectionExtendSpy = null;
				}
			} );

			it( 'should always render collapsed selection even if it is similar', () => {
				const domSelection = document.getSelection();

				const { view: viewP, selection: newSelection } = parse(
					'<container:p>foo{}<attribute:b>bar</attribute:b></container:p>' );

				viewRoot._appendChild( viewP );
				selection._setTo( newSelection );

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
				selection._setTo( [
					new ViewRange( new ViewPosition( viewB.getChild( 0 ), 0 ), new ViewPosition( viewB.getChild( 0 ), 0 ) )
				] );

				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( selectionCollapseSpy.calledOnce ).to.true;
				expect( selectionCollapseSpy.calledWith( domB.childNodes[ 0 ], 0 ) ).to.true;
				expect( selectionExtendSpy.calledOnce ).to.true;
				expect( selectionExtendSpy.calledWith( domB.childNodes[ 0 ], 0 ) ).to.true;
			} );

			it( 'should always render collapsed selection even if it is similar (with empty element)', () => {
				const domSelection = document.getSelection();

				const { view: viewP, selection: newSelection } = parse(
					'<container:p>foo<attribute:b>[]</attribute:b></container:p>' );

				viewRoot._appendChild( viewP );
				selection._setTo( newSelection );

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
				selection._setTo( [
					new ViewRange( new ViewPosition( viewP.getChild( 0 ), 3 ), new ViewPosition( viewP.getChild( 0 ), 3 ) )
				] );

				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( selectionCollapseSpy.calledOnce ).to.true;
				expect( selectionCollapseSpy.calledWith( domP.childNodes[ 0 ], 3 ) ).to.true;
				expect( selectionExtendSpy.calledOnce ).to.true;
				expect( selectionExtendSpy.calledWith( domP.childNodes[ 0 ], 3 ) ).to.true;
			} );

			it( 'should always render non-collapsed selection if it not is similar', () => {
				const domSelection = document.getSelection();

				const { view: viewP, selection: newSelection } = parse(
					'<container:p>fo{o}<attribute:b>bar</attribute:b></container:p>' );

				viewRoot._appendChild( viewP );
				selection._setTo( newSelection );

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
				selection._setTo( [
					new ViewRange( new ViewPosition( viewP.getChild( 0 ), 2 ), new ViewPosition( viewB.getChild( 0 ), 1 ) )
				] );

				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( selectionCollapseSpy.calledOnce ).to.true;
				expect( selectionCollapseSpy.calledWith( domP.childNodes[ 0 ], 2 ) ).to.true;
				expect( selectionExtendSpy.calledOnce ).to.true;
				expect( selectionExtendSpy.calledWith( domB.childNodes[ 0 ], 1 ) ).to.true;
			} );

			it( 'should always render selection (even if it is same in view) if current dom selection is in incorrect place', () => {
				const domSelection = document.getSelection();

				const { view: viewP, selection: newSelection } = parse( '<container:p>foo[]<ui:span></ui:span></container:p>' );

				viewRoot._appendChild( viewP );
				selection._setTo( newSelection );

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
				// Depending on the browser selection may end up at the end of the text node or after the text node.

				const assertSelectionAtEndOfTextNode = () => {
					expect( domSelection.anchorNode ).to.equal( domP );
					expect( domSelection.anchorOffset ).to.equal( 1 );
				};

				const assertSelectionInsideTextNode = () => {
					const textNode = domP.childNodes[ 0 ];
					expect( domSelection.anchorNode ).to.equal( textNode );
					expect( domSelection.anchorOffset ).to.equal( 3 );
				};

				testUtils.checkAssertions( assertSelectionAtEndOfTextNode, assertSelectionInsideTextNode );

				expect( domSelection.getRangeAt( 0 ).collapsed ).to.be.true;
			} );

			it( 'should not render non-collapsed selection it is similar (element start)', () => {
				const domSelection = document.getSelection();

				const { view: viewP, selection: newSelection } = parse(
					'<container:p>foo<attribute:b>{ba}r</attribute:b></container:p>' );

				viewRoot._appendChild( viewP );
				selection._setTo( newSelection );

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
				selection._setTo( [
					new ViewRange( new ViewPosition( viewP.getChild( 0 ), 3 ), new ViewPosition( viewB.getChild( 0 ), 2 ) )
				] );

				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( selectionCollapseSpy.notCalled ).to.true;
				expect( selectionExtendSpy.notCalled ).to.true;
			} );

			it( 'should not render non-collapsed selection it is similar (element end)', () => {
				const domSelection = document.getSelection();

				const { view: viewP, selection: newSelection } = parse(
					'<container:p>foo<attribute:b>b{ar}</attribute:b>baz</container:p>' );

				viewRoot._appendChild( viewP );
				selection._setTo( newSelection );

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
				selection._setTo( [
					new ViewRange( new ViewPosition( viewB.getChild( 0 ), 1 ), new ViewPosition( viewP.getChild( 2 ), 0 ) )
				] );

				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( selectionCollapseSpy.notCalled ).to.true;
				expect( selectionExtendSpy.notCalled ).to.true;
			} );

			it( 'should not render non-collapsed selection it is similar (element start - nested)', () => {
				const domSelection = document.getSelection();

				const { view: viewP, selection: newSelection } = parse(
					'<container:p>foo<attribute:b><attribute:i>{ba}r</attribute:i></attribute:b></container:p>' );

				viewRoot._appendChild( viewP );
				selection._setTo( newSelection );

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
				selection._setTo( [
					new ViewRange( new ViewPosition( viewP.getChild( 0 ), 3 ), new ViewPosition( viewI.getChild( 0 ), 2 ) )
				] );

				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( selectionCollapseSpy.notCalled ).to.true;
				expect( selectionExtendSpy.notCalled ).to.true;
			} );

			it( 'should not render non-collapsed selection it is similar (element end - nested)', () => {
				const domSelection = document.getSelection();

				const { view: viewP, selection: newSelection } = parse(
					'<container:p>f{oo<attribute:b><attribute:i>bar}</attribute:i></attribute:b>baz</container:p>' );

				viewRoot._appendChild( viewP );
				selection._setTo( newSelection );

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
				selection._setTo( [
					new ViewRange( new ViewPosition( viewP.getChild( 0 ), 1 ), new ViewPosition( viewP.getChild( 2 ), 0 ) )
				] );

				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( selectionCollapseSpy.notCalled ).to.true;
				expect( selectionExtendSpy.notCalled ).to.true;
			} );
		} );

		// #1417
		describe( 'optimal rendering – reusing existing nodes', () => {
			it( 'should render inline element replacement (before text)', () => {
				viewRoot._appendChild( parse( '<container:p><attribute:i>A</attribute:i>1</container:p>' ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p><i>A</i>1</p>' );

				const viewP = viewRoot.getChild( 0 );
				viewP._removeChildren( 0, 2 );
				viewP._insertChild( 0, parse( '<attribute:i>B</attribute:i>2' ) );

				const domI = domRoot.childNodes[ 0 ].childNodes[ 0 ];

				renderer.markToSync( 'children', viewRoot );
				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p><i>B</i>2</p>' );
				expect( domI ).to.equal( domRoot.childNodes[ 0 ].childNodes[ 0 ] );
			} );

			it( 'should render inline element replacement (after text)', () => {
				viewRoot._appendChild( parse( '<container:p>1<attribute:i>A</attribute:i></container:p>' ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p>1<i>A</i></p>' );

				const viewP = viewRoot.getChild( 0 );
				viewP._removeChildren( 0, 2 );
				viewP._insertChild( 0, parse( '2<attribute:i>B</attribute:i>' ) );

				const domI = domRoot.childNodes[ 0 ].childNodes[ 1 ];

				renderer.markToSync( 'children', viewRoot );
				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p>2<i>B</i></p>' );
				expect( domI ).to.equal( domRoot.childNodes[ 0 ].childNodes[ 1 ] );
			} );

			it( 'should render inline element replacement (before text swapped order)', () => {
				viewRoot._appendChild( parse( '<container:p><attribute:i>A</attribute:i>1</container:p>' ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p><i>A</i>1</p>' );

				const viewP = viewRoot.getChild( 0 );
				viewP._removeChildren( 0, 2 );
				viewP._insertChild( 0, parse( '2<attribute:i>B</attribute:i>' ) );

				const domI = domRoot.childNodes[ 0 ].childNodes[ 0 ];

				renderer.markToSync( 'children', viewRoot );
				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p>2<i>B</i></p>' );
				expect( domI ).to.equal( domRoot.childNodes[ 0 ].childNodes[ 1 ] );
			} );

			it( 'should render inline element replacement (after text swapped order)', () => {
				viewRoot._appendChild( parse( '<container:p>1<attribute:i>A</attribute:i></container:p>' ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p>1<i>A</i></p>' );

				const viewP = viewRoot.getChild( 0 );
				viewP._removeChildren( 0, 2 );
				viewP._insertChild( 0, parse( '<attribute:i>B</attribute:i>2' ) );

				const domI = domRoot.childNodes[ 0 ].childNodes[ 1 ];

				renderer.markToSync( 'children', viewRoot );
				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p><i>B</i>2</p>' );
				expect( domI ).to.equal( domRoot.childNodes[ 0 ].childNodes[ 0 ] );
			} );

			it( 'should render single replacement in p group', () => {
				const content = '' +
					'<container:p>1</container:p>' +
					'<container:p>2</container:p>' +
					'<container:p>3</container:p>';

				viewRoot._appendChild( parse( content ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p>1</p><p>2</p><p>3</p>' );

				viewRoot._removeChildren( 1 );
				viewRoot._insertChild( 1, parse( '<container:p>4</container:p>' ) );

				const domP = domRoot.childNodes[ 1 ];

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p>1</p><p>4</p><p>3</p>' );
				expect( domP ).to.equal( domRoot.childNodes[ 1 ] );
			} );

			it( 'should render replacement and insertion in p group', () => {
				const content = '' +
					'<container:p>1<attribute:i>A</attribute:i></container:p>' +
					'<container:p>2<attribute:i>B</attribute:i></container:p>' +
					'<container:p>3<attribute:i>C</attribute:i></container:p>';

				const replacement = '' +
					'<container:p><attribute:i>D</attribute:i></container:p>' +
					'<container:p>5<attribute:i>E</attribute:i></container:p>';

				viewRoot._appendChild( parse( content ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p>1<i>A</i></p><p>2<i>B</i></p><p>3<i>C</i></p>' );

				viewRoot._removeChildren( 1 );
				viewRoot._insertChild( 1, parse( replacement ) );

				const domP2 = domRoot.childNodes[ 1 ];
				const domP3 = domRoot.childNodes[ 2 ];

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p>1<i>A</i></p><p><i>D</i></p><p>5<i>E</i></p><p>3<i>C</i></p>' );
				expect( domP2 ).to.equal( domRoot.childNodes[ 1 ] );
				expect( domP3 ).to.equal( domRoot.childNodes[ 3 ] );
			} );

			it( 'should render replacement and deletion in p group', () => {
				const content = '' +
					'<container:p><attribute:i>A</attribute:i>1</container:p>' +
					'<container:p><attribute:i>B</attribute:i>2</container:p>' +
					'<container:p><attribute:i>C</attribute:i>3</container:p>';

				viewRoot._appendChild( parse( content ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p><i>A</i>1</p><p><i>B</i>2</p><p><i>C</i>3</p>' );

				viewRoot._removeChildren( 0, 2 );
				viewRoot._insertChild( 0, parse( '<container:p>4</container:p>' ) );

				const domP0 = domRoot.childNodes[ 0 ];
				const domP2 = domRoot.childNodes[ 2 ];

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p>4</p><p><i>C</i>3</p>' );
				expect( domP0 ).to.equal( domRoot.childNodes[ 0 ] );
				expect( domP2 ).to.equal( domRoot.childNodes[ 1 ] );
			} );

			it( 'should render multiple continuous replacement in p group', () => {
				const content = '' +
					'<container:p>1</container:p>' +
					'<container:p>2</container:p>' +
					'<container:p>3</container:p>' +
					'<container:p>4</container:p>' +
					'<container:p>5</container:p>';

				viewRoot._appendChild( parse( content ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p>' );

				viewRoot._removeChildren( 0, 3 );
				viewRoot._insertChild( 0, parse( '<container:p>6<attribute:i>A</attribute:i></container:p><container:p>7</container:p>' ) );

				const domP1 = domRoot.childNodes[ 0 ];
				const domP2 = domRoot.childNodes[ 1 ];
				const domP4 = domRoot.childNodes[ 3 ];
				const domP5 = domRoot.childNodes[ 4 ];

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p>6<i>A</i></p><p>7</p><p>4</p><p>5</p>' );
				expect( domP1 ).to.equal( domRoot.childNodes[ 0 ] );
				expect( domP2 ).to.equal( domRoot.childNodes[ 1 ] );
				expect( domP4 ).to.equal( domRoot.childNodes[ 2 ] );
				expect( domP5 ).to.equal( domRoot.childNodes[ 3 ] );
			} );

			it( 'should render multiple replacement in p group', () => {
				const content = '' +
					'<container:p>1</container:p>' +
					'<container:p>2</container:p>' +
					'<container:p>3</container:p>' +
					'<container:p>4</container:p>' +
					'<container:p>5</container:p>';

				viewRoot._appendChild( parse( content ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p>' );

				viewRoot._removeChildren( 4 );
				viewRoot._removeChildren( 1, 2 );
				viewRoot._insertChild( 2, parse( '<container:p>6</container:p>' ) );
				viewRoot._insertChild( 1, parse( '<container:p><attribute:i>A</attribute:i>7</container:p>' ) );

				const domP1 = domRoot.childNodes[ 0 ];
				const domP2 = domRoot.childNodes[ 1 ];
				const domP4 = domRoot.childNodes[ 3 ];
				const domP5 = domRoot.childNodes[ 4 ];

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p>1</p><p><i>A</i>7</p><p>4</p><p>6</p>' );
				expect( domP1 ).to.equal( domRoot.childNodes[ 0 ] );
				expect( domP2 ).to.equal( domRoot.childNodes[ 1 ] );
				expect( domP4 ).to.equal( domRoot.childNodes[ 2 ] );
				expect( domP5 ).to.equal( domRoot.childNodes[ 3 ] );
			} );

			it( 'should not rerender DOM when view replaced with the same structure', () => {
				const content = '' +
					'<container:h2>He' +
						'<attribute:i>ading 1</attribute:i>' +
					'</container:h2>' +
					'<container:p>Ph ' +
						'<attribute:strong>Bold</attribute:strong>' +
						'<attribute:a href="https://ckeditor.com">' +
							'<attribute:strong>Lin<attribute:i>k</attribute:i></attribute:strong>' +
						'</attribute:a>' +
					'</container:p>' +
					'<container:blockquote>' +
						'<container:ul>' +
							'<container:li>Quoted <attribute:strong>item 1</attribute:strong></container:li>' +
						'</container:ul>' +
					'</container:blockquote>';

				viewRoot._appendChild( parse( content ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<h2>He<i>ading 1</i></h2><p>Ph <strong>Bold</strong>' +
					'<a href="https://ckeditor.com"><strong>Lin<i>k</i></strong></a></p><blockquote><ul><li>' +
					'Quoted <strong>item 1</strong></li></ul></blockquote>' );

				viewRoot._removeChildren( 0, viewRoot.childCount );
				viewRoot._appendChild( parse( content ) );

				const viewH = viewRoot.getChild( 0 );
				const viewP = viewRoot.getChild( 1 );
				const viewQ = viewRoot.getChild( 2 );

				const domH = domRoot.childNodes[ 0 ];
				const domHI = domH.childNodes[ 1 ];
				const domP = domRoot.childNodes[ 1 ];
				const domPT = domP.childNodes[ 0 ];
				const domPABI = domP.childNodes[ 2 ].childNodes[ 0 ].childNodes[ 1 ];
				const domQ = domRoot.childNodes[ 2 ];
				const domQULB = domQ.childNodes[ 0 ].childNodes[ 0 ].childNodes[ 1 ];

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				// Assert content.
				expect( domRoot.innerHTML ).to.equal( '<h2>He<i>ading 1</i></h2><p>Ph <strong>Bold</strong>' +
					'<a href="https://ckeditor.com"><strong>Lin<i>k</i></strong></a></p><blockquote><ul><li>' +
					'Quoted <strong>item 1</strong></li></ul></blockquote>' );

				// Assert if DOM elements did not change.
				expect( domRoot.childNodes[ 0 ] ).to.equal( domH );
				expect( domH.childNodes[ 1 ] ).to.equal( domHI );
				expect( domRoot.childNodes[ 1 ] ).to.equal( domP );
				expect( domP.childNodes[ 0 ] ).to.equal( domPT );
				expect( domP.childNodes[ 2 ].childNodes[ 0 ].childNodes[ 1 ] ).to.equal( domPABI );
				expect( domRoot.childNodes[ 2 ] ).to.equal( domQ );
				expect( domQ.childNodes[ 0 ].childNodes[ 0 ].childNodes[ 1 ] ).to.equal( domQULB );

				// Assert mappings.
				const mappings = renderer.domConverter._domToViewMapping;
				expect( mappings.get( domH ) ).to.equal( viewH );
				expect( mappings.get( domHI ) ).to.equal( viewH.getChild( 1 ) );
				expect( mappings.get( domP ) ).to.equal( viewP );
				expect( mappings.get( domPABI ) ).to.equal( viewP.getChild( 2 ).getChild( 0 ).getChild( 1 ) );
				expect( mappings.get( domQ ) ).to.equal( viewQ );
				expect( mappings.get( domQULB ) ).to.equal( viewQ.getChild( 0 ).getChild( 0 ).getChild( 1 ) );
			} );

			it( 'should not rerender DOM when view replaced with the same structure without first node', () => {
				const content = '' +
					'<container:h2>He' +
						'<attribute:i>ading 1</attribute:i>' +
					'</container:h2>' +
					'<container:p>Ph ' +
						'<attribute:strong>Bold</attribute:strong>' +
						'<attribute:a href="https://ckeditor.com">' +
							'<attribute:strong>Lin<attribute:i>k</attribute:i></attribute:strong>' +
						'</attribute:a>' +
					'</container:p>' +
					'<container:blockquote>' +
						'<container:ul>' +
							'<container:li>Quoted <attribute:strong>item 1</attribute:strong></container:li>' +
						'</container:ul>' +
					'</container:blockquote>';

				const content2 = '' +
					'<container:p>Ph ' +
						'<attribute:strong>Bold</attribute:strong>' +
						'<attribute:a href="https://ckeditor.com">' +
							'<attribute:strong>Lin<attribute:i>k</attribute:i></attribute:strong>' +
						'</attribute:a>' +
					'</container:p>' +
					'<container:blockquote>' +
						'<container:ul>' +
							'<container:li>Quoted <attribute:strong>item 1</attribute:strong></container:li>' +
						'</container:ul>' +
					'</container:blockquote>';

				viewRoot._appendChild( parse( content ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<h2>He<i>ading 1</i></h2><p>Ph <strong>Bold</strong>' +
					'<a href="https://ckeditor.com"><strong>Lin<i>k</i></strong></a></p><blockquote><ul><li>' +
					'Quoted <strong>item 1</strong></li></ul></blockquote>' );

				viewRoot._removeChildren( 0, viewRoot.childCount );
				viewRoot._appendChild( parse( content2 ) );

				const viewP = viewRoot.getChild( 0 );
				const viewQ = viewRoot.getChild( 1 );

				const domP = domRoot.childNodes[ 1 ];
				const domPT = domP.childNodes[ 0 ];
				const domPABI = domP.childNodes[ 2 ].childNodes[ 0 ].childNodes[ 1 ];
				const domQ = domRoot.childNodes[ 2 ];
				const domQULB = domQ.childNodes[ 0 ].childNodes[ 0 ].childNodes[ 1 ];

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				// Assert content.
				expect( domRoot.innerHTML ).to.equal( '<p>Ph <strong>Bold</strong>' +
					'<a href="https://ckeditor.com"><strong>Lin<i>k</i></strong></a></p><blockquote><ul><li>' +
					'Quoted <strong>item 1</strong></li></ul></blockquote>' );

				// Assert if DOM elements did not change.
				expect( domRoot.childNodes[ 0 ] ).to.equal( domP );
				expect( domP.childNodes[ 0 ] ).to.equal( domPT );
				expect( domP.childNodes[ 2 ].childNodes[ 0 ].childNodes[ 1 ] ).to.equal( domPABI );
				expect( domRoot.childNodes[ 1 ] ).to.equal( domQ );
				expect( domQ.childNodes[ 0 ].childNodes[ 0 ].childNodes[ 1 ] ).to.equal( domQULB );

				// Assert mappings.
				const mappings = renderer.domConverter._domToViewMapping;
				expect( mappings.get( domP ) ).to.equal( viewP );
				expect( mappings.get( domPABI ) ).to.equal( viewP.getChild( 2 ).getChild( 0 ).getChild( 1 ) );
				expect( mappings.get( domQ ) ).to.equal( viewQ );
				expect( mappings.get( domQULB ) ).to.equal( viewQ.getChild( 0 ).getChild( 0 ).getChild( 1 ) );
			} );

			it( 'should not rerender DOM when typing inside empty inline element', () => {
				const view = parse( '<container:p>Foo Bar<attribute:strong></attribute:strong></container:p>' );

				viewRoot._appendChild( view );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p>Foo Bar<strong></strong></p>' );

				const viewP = viewRoot.getChild( 0 );
				viewP._removeChildren( 1 );
				viewP._insertChild( 1, parse( '<attribute:strong>a</attribute:strong>' ) );

				const domP = domRoot.childNodes[ 0 ];
				const domText = domP.childNodes[ 0 ];
				const domB = domP.childNodes[ 1 ];

				domB.innerHTML = 'a';

				renderer.markToSync( 'children', viewRoot );
				renderer.markToSync( 'children', viewRoot.getChild( 0 ) );
				renderer.render();

				// Assert content.
				expect( domRoot.innerHTML ).to.equal( '<p>Foo Bar<strong>a</strong></p>' );

				// Assert if DOM elements did not change.
				expect( domRoot.childNodes[ 0 ] ).to.equal( domP );
				expect( domRoot.childNodes[ 0 ].childNodes[ 0 ] ).to.equal( domText );
				expect( domRoot.childNodes[ 0 ].childNodes[ 1 ] ).to.equal( domB );

				// Assert mappings.
				const mappings = renderer.domConverter._domToViewMapping;
				expect( mappings.get( domP ) ).to.equal( viewP );
				expect( mappings.get( domB ) ).to.equal( viewP.getChild( 1 ) );
			} );

			it( 'should handle complex view duplication', () => {
				const content = '' +
					'<container:blockquote>' +
						'<container:ul>' +
							'<container:li>Quoted <attribute:strong>item 1</attribute:strong></container:li>' +
							'<container:li>Item 2</container:li>' +
							'<container:li>' +
								'<attribute:a href="https://cksource.com">Li<attribute:strong>nk</attribute:strong></attribute:a>' +
							'</container:li>' +
						'</container:ul>' +
					'</container:blockquote>';

				const expected = '' +
					'<blockquote>' +
						'<ul>' +
							'<li>Quoted <strong>item 1</strong></li>' +
							'<li>Item 2</li>' +
							'<li><a href="https://cksource.com">Li<strong>nk</strong></a></li>' +
						'</ul>' +
					'</blockquote>';

				viewRoot._appendChild( parse( content ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( expected );

				viewRoot._removeChildren( 0, viewRoot.childCount );
				viewRoot._appendChild( parse( content + content ) );

				const domBQ = domRoot.childNodes[ 0 ];
				const domUL = domBQ.childNodes[ 0 ];
				const domLI1 = domUL.childNodes[ 0 ];
				const domLI2 = domUL.childNodes[ 1 ];
				const domLI3 = domUL.childNodes[ 2 ];

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				// Assert content.
				expect( domRoot.innerHTML ).to.equal( expected + expected );

				// Assert if DOM elements did not change.
				expect( domRoot.childNodes[ 0 ] ).to.equal( domBQ );
				expect( domBQ.childNodes[ 0 ] ).to.equal( domUL );
				expect( domUL.childNodes[ 0 ] ).to.equal( domLI1 );
				expect( domUL.childNodes[ 1 ] ).to.equal( domLI2 );
				expect( domUL.childNodes[ 2 ] ).to.equal( domLI3 );

				// Assert mappings.
				const domMappings = renderer.domConverter._domToViewMapping;
				expect( domMappings.get( domBQ ) ).to.equal( viewRoot.getChild( 0 ) );
				expect( domMappings.get( domUL ) ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
				expect( domMappings.get( domLI1 ) ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ).getChild( 0 ) );
				expect( domMappings.get( domLI2 ) ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ).getChild( 1 ) );
				expect( domMappings.get( domLI3 ) ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ).getChild( 2 ) );

				// Assert if new view elements are bind to new DOM elements.
				const viewMappings = renderer.domConverter._domToViewMapping;
				expect( viewMappings.get( viewRoot.getChild( 1 ) ) ).not.equal( domBQ );
				expect( viewMappings.get( viewRoot.getChild( 1 ).getChild( 0 ) ) ).not.equal( domUL );
				expect( viewMappings.get( viewRoot.getChild( 1 ).getChild( 0 ).getChild( 0 ) ) ).not.equal( domLI1 );
				expect( viewMappings.get( viewRoot.getChild( 1 ).getChild( 0 ).getChild( 1 ) ) ).not.equal( domLI2 );
				expect( viewMappings.get( viewRoot.getChild( 1 ).getChild( 0 ).getChild( 2 ) ) ).not.equal( domLI3 );
			} );

			it( 'should handle complex view replace', () => {
				const content = '' +
					'<container:h2>He' +
						'<attribute:i>ading 1</attribute:i>' +
					'</container:h2>' +
					'<container:p>Ph ' +
						'<attribute:strong>Bold</attribute:strong>' +
						'<attribute:a href="https://ckeditor.com">' +
							'<attribute:strong>Lin<attribute:i>k</attribute:i></attribute:strong>' +
						'</attribute:a>' +
					'</container:p>' +
					'<container:blockquote>' +
						'<container:ul>' +
							'<container:li>Quoted <attribute:strong>item 1</attribute:strong></container:li>' +
							'<container:li>Item 2</container:li>' +
							'<container:li>' +
								'<attribute:a href="https://cksource.com">Li<attribute:strong>nk</attribute:strong></attribute:a>' +
							'</container:li>' +
						'</container:ul>' +
					'</container:blockquote>';

				const replacement = '' +
					'<container:p>' +
						'1' +
						'<attribute:i>A</attribute:i>' +
					'</container:p>' +
					'<container:p>' +
						'<attribute:a href="https://cksource.com">' +
							'Li' +
							'<attribute:strong>nk</attribute:strong>' +
						'</attribute:a>' +
					'</container:p>' +
					'<container:h1>' +
						'Heading ' +
						'<attribute:strong>1</attribute:strong>' +
					'</container:h1>' +
					'<container:h2>' +
						'<attribute:a href="https://ckeditor.com">Heading 2</attribute:a>' +
					'</container:h2>' +
					'<container:h3>' +
						'Heading' +
						'<attribute:i> 3</attribute:i>' +
					'</container:h3>' +
					'<container:blockquote>' +
						'Foo Bar Baz' +
					'</container:blockquote>' +
					'<container:ul>' +
						'<container:li>' +
							'Item ' +
							'<attribute:strong>1</attribute:strong>' +
						'</container:li>' +
						'<container:li>' +
							'<attribute:a href="https://ckeditor.com">Item</attribute:a>' +
							' 2' +
						'</container:li>' +
					'</container:ul>';

				viewRoot._appendChild( parse( content ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '' +
					'<h2>He<i>ading 1</i></h2>' +
					'<p>Ph <strong>Bold</strong><a href="https://ckeditor.com"><strong>Lin<i>k</i></strong></a></p>' +
					'<blockquote><ul>' +
						'<li>Quoted <strong>item 1</strong></li>' +
						'<li>Item 2</li><li><a href="https://cksource.com">Li<strong>nk</strong></a></li>' +
					'</ul></blockquote>' );

				viewRoot._removeChildren( 0, viewRoot.childCount );
				viewRoot._appendChild( parse( replacement ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				// Here we just check if new DOM structure was properly rendered.
				expect( domRoot.innerHTML ).to.equal( '' +
					'<p>1<i>A</i></p>' +
					'<p><a href="https://cksource.com">Li<strong>nk</strong></a></p>' +
					'<h1>Heading <strong>1</strong></h1>' +
					'<h2><a href="https://ckeditor.com">Heading 2</a></h2>' +
					'<h3>Heading<i> 3</i></h3>' +
					'<blockquote>Foo Bar Baz</blockquote>' +
					'<ul><li>Item <strong>1</strong></li><li><a href="https://ckeditor.com">Item</a> 2</li></ul>' );
			} );

			it( 'should handle br elements while refreshing bindings', () => {
				const expected = `<p>Foo Bar</p><p>${ BR_FILLER( document ).outerHTML }</p>`; // eslint-disable-line new-cap

				viewRoot._appendChild( parse( '<container:p>Foo Bar</container:p><container:p></container:p>' ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( expected );

				// There is a case in Safari that during accent panel navigation on macOS our 'BR_FILLER' is replaced with
				// just '<br>' element which breaks accent composition in an empty paragraph. It also throws an error while
				// refreshing mappings in a renderer. Simulate such behaviour (#1354).
				domRoot.childNodes[ 1 ].innerHTML = '<br>';

				viewRoot._removeChildren( 1 );
				viewRoot._insertChild( 1, parse( '<container:p></container:p>' ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( expected );
			} );

			it( 'should handle list to paragraph conversion', () => {
				const view = '' +
					'<container:ol>' +
						'<container:li>Item 1' +
							'<container:ol>' +
								'<container:li>Item 2</container:li>' +
							'</container:ol>' +
						'</container:li>' +
					'</container:ol>' +
					'<container:p>Paragraph</container:p>' +
					'<container:ol>' +
						'<container:li>Item 3' +
							'<container:ol>' +
								'<container:li>Item 4</container:li>' +
							'</container:ol>' +
						'</container:li>' +
					'</container:ol>';

				viewRoot._appendChild( parse( view ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal(
					'<ol><li>Item 1<ol><li>Item 2</li></ol></li></ol><p>Paragraph</p><ol><li>Item 3<ol><li>Item 4</li></ol></li></ol>' );

				const viewOL1 = viewRoot.getChild( 0 );
				viewOL1.getChild( 0 )._removeChildren( 1 );
				viewRoot._removeChildren( 2 );
				viewRoot._insertChild( 1, parse( '<container:p>Item 2</container:p>' ) );
				viewRoot._insertChild( 3, parse( '<container:p>Item 3</container:p>' ) );
				viewRoot._insertChild( 4, parse( '<container:ol><container:li>Item 4</container:li></container:ol>' ) );

				const domOL1 = domRoot.childNodes[ 0 ];
				const domOL2 = domRoot.childNodes[ 2 ];
				const domP = domRoot.childNodes[ 1 ];

				renderer.markToSync( 'children', viewRoot );
				renderer.markToSync( 'children', viewOL1.getChild( 0 ) );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal(
					'<ol><li>Item 1</li></ol><p>Item 2</p><p>Paragraph</p><p>Item 3</p><ol><li>Item 4</li></ol>' );

				expect( domRoot.childNodes[ 0 ] ).to.equal( domOL1 );
				expect( domRoot.childNodes[ 2 ] ).to.equal( domP );
				expect( domRoot.childNodes[ 4 ] ).to.equal( domOL2 );
			} );

			it( 'should handle attributes change in replaced elements', () => {
				const view = '' +
					'<container:ol>' +
						'<container:li data-index="1" align="left">Item 1</container:li>' +
					'</container:ol>' +
					'<container:p>Paragraph ' +
						'<attribute:a href="123">Link</attribute:a>' +
					'</container:p>' +
					'<container:p id="p1"><attribute:i>Bar</attribute:i>Baz</container:p>';

				viewRoot._appendChild( parse( view ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( normalizeHtml(
					'<ol><li data-index="1" align="left">Item 1</li></ol>' +
					'<p>Paragraph <a href="123">Link</a></p><p id="p1"><i>Bar</i>Baz</p>' ) );

				const viewOL = viewRoot.getChild( 0 );
				viewOL._removeChildren( 0 );
				viewOL._insertChild( 0, parse( '<container:li data-index="2" data-attr="foo">Item 1</container:li>' ) );

				const viewP1 = viewRoot.getChild( 1 );
				viewP1._removeChildren( 1 );
				viewP1._insertChild( 1, parse( '<attribute:a href="456" class="cke">Foo</attribute:a>' ) );

				viewRoot._removeChildren( 2 );
				viewRoot._insertChild( 2, parse( '<container:p>Bar</container:p>' ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.markToSync( 'children', viewOL );
				renderer.markToSync( 'children', viewP1 );
				renderer.render();

				expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( normalizeHtml(
					'<ol><li data-index="2" data-attr="foo">Item 1</li></ol>' +
					'<p>Paragraph <a href="456" class="cke">Foo</a></p><p>Bar</p>' ) );
			} );

			it( 'should handle classes change in replaced elements', () => {
				const view = '' +
					'<container:ol>' +
						'<container:li class="foo1 bar2 baz3">Item 1</container:li>' +
					'</container:ol>' +
					'<container:p><attribute:i class="i1 i2">Bar</attribute:i>Baz</container:p>';

				viewRoot._appendChild( parse( view ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( normalizeHtml(
					'<ol><li class="foo1 bar2 baz3">Item 1</li></ol><p><i class="i1 i2">Bar</i>Baz</p>' ) );

				const viewOL = viewRoot.getChild( 0 );
				const oldViewLI = viewOL.getChild( 0 );
				viewOL._removeChildren( 0 );
				viewOL._insertChild( 0, parse( '<container:li class="bar2 baz4 bax5">Item 1</container:li>' ) );

				const oldViewP = viewRoot.getChild( 1 );
				viewRoot._removeChildren( 1 );
				viewRoot._insertChild( 1, parse( '<container:p class="p1 p2"><attribute:i>Foo</attribute:i></container:p>' ) );

				renderer.markToSync( 'attributes', oldViewLI );
				renderer.markToSync( 'attributes', oldViewP );
				renderer.markToSync( 'children', viewRoot );
				renderer.markToSync( 'children', viewOL );
				renderer.render();

				expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( normalizeHtml(
					'<ol><li class="bar2 baz4 bax5">Item 1</li></ol><p class="p1 p2"><i>Foo</i></p>' ) );
			} );

			it( 'should handle styles change in replaced elements', () => {
				const view = '' +
					'<container:ol>' +
						'<container:li style="color:#000;font-weight:bold;">Foo</container:li>' +
						'<container:li>Bar ' +
							'<attribute:i>' +
								'<attribute:b style="color:#00F;background-color:#000;font-size:12px;">Baz</attribute:b>' +
							' Bax</attribute:i>' +
						'</container:li>' +
					'</container:ol>';

				viewRoot._appendChild( parse( view, { stylesProcessor } ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( normalizeHtml(
					'<ol><li style="color:#000;font-weight:bold;">Foo</li>' +
					'<li>Bar <i><b style="color:#00F;background-color:#000;font-size:12px;">Baz</b> Bax</i></li></ol>' ) );

				const viewOL = viewRoot.getChild( 0 );
				const viewLI1 = viewOL.getChild( 0 );
				const viewLI2 = viewOL.getChild( 1 );

				viewLI1._removeStyle( 'font-weight' );
				viewLI1._setStyle( { color: '#FFF' } );
				viewLI2._setStyle( { 'font-weight': 'bold' } );

				viewLI2._removeChildren( 0, viewLI2.childCount );
				viewLI2._insertChild( 0, parse( 'Ba1 <attribute:i style="color:#000;border-width:1px;">Ba3 ' +
					'<attribute:b style="font-size:15px;">Ba2</attribute:b></attribute:i>' ) );

				renderer.markToSync( 'attributes', viewLI1 );
				renderer.markToSync( 'attributes', viewLI2 );
				renderer.markToSync( 'children', viewRoot );
				renderer.markToSync( 'children', viewLI2 );
				renderer.render();

				expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( normalizeHtml(
					'<ol><li style="color:#FFF;">Foo</li>' +
					'<li style="font-weight:bold;">Ba1 <i style="color:#000;border-width:1px;">Ba3 ' +
					'<b style="font-size:15px;">Ba2</b></i></li></ol>' ) );
			} );

			it( 'should handle uiElement rendering', () => {
				function createUIElement( id, text ) {
					const element = new UIElement( viewDocument, 'span' );
					element.render = function( domDocument ) {
						const domElement = this.toDomElement( domDocument );
						domElement.innerText = `<span id="${ id }"><b>${ text }</b></span>`;
						return domElement;
					};

					return element;
				}

				const ui1 = createUIElement( 'id1', 'UI1' );
				const ui2 = createUIElement( 'id2', 'UI2' );
				const viewP = new ViewContainerElement( viewDocument, 'p', null, [
					new ViewText( viewDocument, 'Foo ' ),
					ui1,
					new ViewText( viewDocument, 'Bar' )
				] );
				viewRoot._appendChild( viewP );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( normalizeHtml(
					'<p>Foo <span><span id="id1"><b>UI1</b></span></span>Bar</p>' ) );

				viewP._removeChildren( 0, viewP.childCount );
				viewP._insertChild( 0, [ new ViewText( viewDocument, 'Foo' ), ui2, new ViewText( viewDocument, ' Bar' ) ] );

				renderer.markToSync( 'children', viewRoot );
				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( normalizeHtml(
					'<p>Foo<span><span id="id2"><b>UI2</b></span></span> Bar</p>' ) );
			} );

			it( 'should handle linking entire content', () => {
				viewRoot._appendChild( parse( '<container:p>Foo<attribute:i>Bar</attribute:i></container:p>' ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p>Foo<i>Bar</i></p>' );

				const viewP = viewRoot.getChild( 0 );
				// While linking, the existing DOM children are moved to a new `a` element during binding
				// inside the `domConverter.viewToDom()` method. It happens because of a modified view structure
				// where view elements were moved to a newly created link view element.
				const viewA = new ViewAttributeElement( viewDocument, 'a', { href: '#href' }, [
					new ViewText( viewDocument, 'Foo' ),
					viewP.getChild( 1 )
				] );

				viewP._removeChildren( 0, viewP.childCount );
				viewP._insertChild( 0, viewA );

				renderer.markToSync( 'children', viewRoot );
				renderer.markToSync( 'children', viewP );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p><a href="#href">Foo<i>Bar</i></a></p>' );
			} );
		} );

		describe( 'optimal (minimal) rendering – minimal children changes', () => {
			let observer;

			beforeEach( () => {
				observer = new MutationObserver( () => {} );

				observer.observe( domRoot, {
					childList: true,
					attributes: false,
					subtree: false
				} );
			} );

			afterEach( () => {
				observer.disconnect();
			} );

			it( 'should add only one child (at the beginning)', () => {
				viewRoot._appendChild( parse( '<container:p>1</container:p>' ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();
				cleanObserver( observer );

				viewRoot._insertChild( 0, parse( '<container:p>2</container:p>' ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( getMutationStats( observer.takeRecords() ) ).to.deep.equal( [
					'added: 1, removed: 0'
				] );
			} );

			it( 'should add only one child (at the end)', () => {
				viewRoot._appendChild( parse( '<container:p>1</container:p>' ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();
				cleanObserver( observer );

				viewRoot._appendChild( parse( '<container:p>2</container:p>' ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( getMutationStats( observer.takeRecords() ) ).to.deep.equal( [
					'added: 1, removed: 0'
				] );
			} );

			it( 'should add only one child (in the middle)', () => {
				viewRoot._appendChild( parse( '<container:p>1</container:p><container:p>2</container:p>' ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();
				cleanObserver( observer );

				viewRoot._insertChild( 1, parse( '<container:p>3</container:p>' ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( getMutationStats( observer.takeRecords() ) ).to.deep.equal( [
					'added: 1, removed: 0'
				] );
			} );

			it( 'should not touch elements at all (rendering texts is enough)', () => {
				viewRoot._appendChild( parse( '<container:p>1</container:p><container:p>2</container:p>' ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();
				cleanObserver( observer );

				viewRoot._insertChild( 1, parse( '<container:p>3</container:p>' ) );
				viewRoot._removeChildren( 0, 1 );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( getMutationStats( observer.takeRecords() ) ).to.be.empty;
			} );

			it( 'should add and remove one', () => {
				viewRoot._appendChild( parse( '<container:p>1</container:p><container:p>2</container:p>' ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();
				cleanObserver( observer );

				viewRoot._insertChild( 1, parse( '<container:h1>3</container:h1>' ) );
				viewRoot._removeChildren( 0, 1 );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( getMutationStats( observer.takeRecords() ) ).to.deep.equal( [
					'added: 1, removed: 0',
					'added: 0, removed: 1'
				] );
			} );

			it( 'should not touch the FSC when rendering children', () => {
				viewRoot._appendChild( parse( '<container:p>1</container:p><container:p>2</container:p>' ) );

				// Set fake selection on the second paragraph.
				selection._setTo( viewRoot.getChild( 1 ), 'on', { fake: true } );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();
				cleanObserver( observer );

				// Remove the second paragraph.
				viewRoot._removeChildren( 1, 1 );
				// And set the fake selection on the first one.
				selection._setTo( viewRoot.getChild( 0 ), 'on', { fake: true } );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( getMutationStats( observer.takeRecords() ) ).to.deep.equal( [
					'added: 0, removed: 1'
				] );
			} );

			it( 'should not incorrectly remove element which is not a FSC when rendering children', () => {
				// This test's purpose is mostly reaching 100% CC.
				observer = new MutationObserver( () => {} );

				viewRoot._appendChild( parse( '<container:div><container:p>1</container:p><container:p>2</container:p></container:div>' ) );

				const viewDiv = viewRoot.getChild( 0 );

				// Set fake selection on the second paragraph.
				selection._setTo( viewDiv.getChild( 1 ), 'on', { fake: true } );

				renderer.markToSync( 'children', viewDiv );
				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				observer.observe( domRoot.childNodes[ 0 ], {
					childList: true,
					attributes: false,
					subtree: false
				} );

				// Remove the second paragraph.
				viewDiv._removeChildren( 1, 1 );
				// And set the fake selection on the first one.
				selection._setTo( viewDiv.getChild( 0 ), 'on', { fake: true } );

				renderer.markToSync( 'children', viewDiv );
				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( getMutationStats( observer.takeRecords() ) ).to.deep.equal( [
					'added: 0, removed: 1'
				] );

				observer.disconnect();
			} );

			describe( 'using fastDiff() - significant number of nodes in the editor', () => {
				it( 'should add only one child (at the beginning)', () => {
					viewRoot._appendChild( parse( makeContainers( 151 ) ) );

					renderer.markToSync( 'children', viewRoot );
					renderer.render();
					cleanObserver( observer );

					viewRoot._insertChild( 0, parse( '<container:p>x</container:p>' ) );

					renderer.markToSync( 'children', viewRoot );
					renderer.render();

					expect( getMutationStats( observer.takeRecords() ) ).to.deep.equal( [
						'added: 1, removed: 0'
					] );
				} );

				it( 'should add only one child (at the end)', () => {
					viewRoot._appendChild( parse( makeContainers( 151 ) ) );

					renderer.markToSync( 'children', viewRoot );
					renderer.render();
					cleanObserver( observer );

					viewRoot._appendChild( parse( '<container:p>x</container:p>' ) );

					renderer.markToSync( 'children', viewRoot );
					renderer.render();

					expect( getMutationStats( observer.takeRecords() ) ).to.deep.equal( [
						'added: 1, removed: 0'
					] );
				} );

				it( 'should add only one child (in the middle)', () => {
					viewRoot._appendChild( parse( makeContainers( 151 ) ) );

					renderer.markToSync( 'children', viewRoot );
					renderer.render();
					cleanObserver( observer );

					viewRoot._insertChild( 75, parse( '<container:p>x</container:p>' ) );

					renderer.markToSync( 'children', viewRoot );
					renderer.render();

					expect( getMutationStats( observer.takeRecords() ) ).to.deep.equal( [
						'added: 1, removed: 0'
					] );
				} );

				it( 'should not touch elements at all (rendering texts is enough)', () => {
					viewRoot._appendChild( parse( makeContainers( 151 ) ) );

					renderer.markToSync( 'children', viewRoot );
					renderer.render();
					cleanObserver( observer );

					viewRoot._insertChild( 1, parse( '<container:p>x</container:p>' ) );
					viewRoot._removeChildren( 0, 1 );

					renderer.markToSync( 'children', viewRoot );
					renderer.render();

					expect( getMutationStats( observer.takeRecords() ) ).to.be.empty;
				} );

				it( 'should add and remove one', () => {
					viewRoot._appendChild( parse( makeContainers( 151 ) ) );

					renderer.markToSync( 'children', viewRoot );
					renderer.render();
					cleanObserver( observer );

					viewRoot._insertChild( 1, parse( '<container:h1>x</container:h1>' ) );
					viewRoot._removeChildren( 0, 1 );

					renderer.markToSync( 'children', viewRoot );
					renderer.render();

					expect( getMutationStats( observer.takeRecords() ) ).to.deep.equal( [
						'added: 1, removed: 0',
						'added: 0, removed: 1'
					] );
				} );

				it( 'should not touch the FSC when rendering children', () => {
					viewRoot._appendChild( parse( makeContainers( 151 ) ) );

					// Set fake selection on the second paragraph.
					selection._setTo( viewRoot.getChild( 1 ), 'on', { fake: true } );

					renderer.markToSync( 'children', viewRoot );
					renderer.render();
					cleanObserver( observer );

					// Remove the second paragraph.
					viewRoot._removeChildren( 1, 1 );
					// And set the fake selection on the first one.
					selection._setTo( viewRoot.getChild( 0 ), 'on', { fake: true } );

					renderer.markToSync( 'children', viewRoot );
					renderer.render();

					expect( getMutationStats( observer.takeRecords() ) ).to.deep.equal( [
						'added: 0, removed: 1'
					] );
				} );
			} );

			function getMutationStats( mutationList ) {
				return mutationList.map( mutation => {
					return `added: ${ mutation.addedNodes.length }, removed: ${ mutation.removedNodes.length }`;
				} );
			}

			function cleanObserver( observer ) {
				observer.takeRecords();
			}

			function makeContainers( howMany ) {
				const containers = [];

				for ( let i = 1; i <= howMany; i++ ) {
					containers.push( `<container:p>${ i }</container:p>` );
				}

				return containers.join( '' );
			}
		} );

		// #1560
		describe( 'attributes manipulation on replaced element', () => {
			it( 'should rerender element if it was removed after having its attributes removed (attribute)', () => {
				const writer = new DowncastWriter( viewDocument );

				// 1. Setup initial view/DOM.
				viewRoot._appendChild( parse( '<container:p>1</container:p>' ) );

				const viewP = viewRoot.getChild( 0 );

				writer.setAttribute( 'data-placeholder', 'Body', viewP );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p data-placeholder="Body">1</p>' );

				// 2. Modify view.
				writer.removeAttribute( 'data-placeholder', viewP );

				viewRoot._removeChildren( 0, viewRoot.childCount );

				viewRoot._appendChild( parse( '<container:p>1</container:p><container:p>2</container:p>' ) );

				renderer.markToSync( 'attributes', viewP );
				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p>1</p><p>2</p>' );
			} );

			it( 'should rerender element if it was removed after having its attributes removed (classes)', () => {
				const writer = new DowncastWriter( viewDocument );

				// 1. Setup initial view/DOM.
				viewRoot._appendChild( parse( '<container:h1>h1</container:h1><container:p>p</container:p>' ) );

				const viewP = viewRoot.getChild( 1 );

				writer.addClass( [ 'cke-test1', 'cke-test2' ], viewP );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<h1>h1</h1><p class="cke-test1 cke-test2">p</p>' );

				// 2. Modify view.
				writer.removeClass( 'cke-test2', viewP );

				viewRoot._removeChildren( 0, viewRoot.childCount );

				viewRoot._appendChild( parse( '<container:h1>h1</container:h1>' +
					'<container:p class="cke-test1">p</container:p><container:p>p2</container:p>' ) );

				renderer.markToSync( 'attributes', viewP );
				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<h1>h1</h1><p class="cke-test1">p</p><p>p2</p>' );
			} );

			it( 'should rerender element if it was removed and have its attributes removed after', () => {
				const writer = new DowncastWriter( viewDocument );

				// 1. Setup initial view/DOM.
				viewRoot._appendChild( parse( '<container:p>1</container:p>' ) );

				const viewP = viewRoot.getChild( 0 );

				writer.setAttribute( 'data-placeholder', 'Body', viewP );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p data-placeholder="Body">1</p>' );

				// 2. Modify view.
				viewRoot._removeChildren( 0, viewRoot.childCount );

				writer.removeAttribute( 'data-placeholder', viewP );

				viewRoot._appendChild( parse( '<container:p>1</container:p><container:p>2</container:p>' ) );

				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				expect( domRoot.innerHTML ).to.equal( '<p>1</p><p>2</p>' );
			} );
		} );

		// ckeditor/ckeditor5-utils#269
		// The expected times has a significant margin above the usual execution time (which is around 40-50%
		// of the expected time) because it depends on the browser and environment in which tests are run.
		// However, for larger data sets the difference between using `diff()` and `fastDiff()` (see above issue for context)
		// is more than 10x in execution time so it is clearly visible in these tests when something goes wrong.
		describe( 'rendering performance', () => {
			before( function() {
				// Ignore on Edge browser where performance is quite poor.
				if ( env.isEdge ) {
					this.skip();
				}
			} );

			it( 'should not take more than 350ms to render around 300 element nodes (same html)', () => {
				const renderingTime = measureRenderingTime( viewRoot, generateViewData1( 65 ), generateViewData1( 55 ) );
				expect( renderingTime ).to.be.within( 0, 350 );
			} );

			it( 'should not take more than 350ms to render around 300 element nodes (different html)', () => {
				const renderingTime = measureRenderingTime( viewRoot, generateViewData1( 55 ), generateViewData2( 65 ) );
				expect( renderingTime ).to.be.within( 0, 350 );
			} );

			it( 'should not take more than 350ms to render around 500 element nodes (same html)', () => {
				const renderingTime = measureRenderingTime( viewRoot, generateViewData1( 105 ), generateViewData1( 95 ) );
				expect( renderingTime ).to.be.within( 0, 350 );
			} );

			it( 'should not take more than 350ms to render around 500 element nodes (different html)', () => {
				const renderingTime = measureRenderingTime( viewRoot, generateViewData1( 95 ), generateViewData2( 105 ) );
				expect( renderingTime ).to.be.within( 0, 350 );
			} );

			it( 'should not take more than 350ms to render around 1000 element nodes (same html)', () => {
				const renderingTime = measureRenderingTime( viewRoot, generateViewData1( 195 ), generateViewData1( 205 ) );
				expect( renderingTime ).to.be.within( 0, 350 );
			} );

			it( 'should not take more than 350ms to render around 1000 element nodes (different html)', () => {
				const renderingTime = measureRenderingTime( viewRoot, generateViewData1( 205 ), generateViewData2( 195 ) );
				expect( renderingTime ).to.be.within( 0, 350 );
			} );

			function measureRenderingTime( viewRoot, initialData, newData ) {
				// Set initial data.
				const initialView = parse( initialData );
				viewRoot._appendChild( initialView );
				renderer.markToSync( 'children', viewRoot );
				renderer.render();

				// Set new data.
				const newView = parse( newData );
				viewRoot._removeChildren( 0, viewRoot.childCount );
				viewRoot._appendChild( newView );
				renderer.markToSync( 'children', viewRoot );

				// Measure render time.
				const start = Date.now();

				renderer.render();

				return Date.now() - start;
			}

			function generateViewData1( repeat = 1 ) {
				const viewData = '' +
					'<container:h1>' +
						'CKEditor 5 <attribute:strong>h1</attribute:strong> heading!' +
					'</container:h1>' +
					'<container:p>' +
						'Foo <attribute:strong>Bar</attribute:strong> Baz and some text' +
					'</container:p>' +
					'<container:ul>' +
						'<container:li>Item 1</container:li>' +
					'</container:ul>' +
					'<container:ul>' +
						'<container:li>Item 2</container:li>' +
					'</container:ul>' +
					'<container:ul>' +
						'<container:li>Item 3</container:li>' +
					'</container:ul>';

				return viewData.repeat( repeat );
			}

			function generateViewData2( repeat = 1 ) {
				const viewData = '' +
					'<container:ol>' +
						'<container:li>' +
							'<attribute:strong>Foo</attribute:strong>' +
						'</container:li>' +
					'</container:ol>' +
					'<container:ol>' +
						'<container:li>Item 1</container:li>' +
					'</container:ol>' +
					'<container:h1>Heading 1</container:h1>' +
					'<container:h2>' +
						'<attribute:strong>Heading</attribute:strong> 2' +
					'</container:h2>' +
					'<container:h3>Heading 4</container:h3>';

				return viewData.repeat( repeat );
			}
		} );
	} );

	describe( '#922', () => {
		let view, viewDoc, viewRoot, domRoot, converter;

		beforeEach( () => {
			view = new View( stylesProcessor );
			viewDoc = view.document;
			domRoot = document.createElement( 'div' );
			document.body.appendChild( domRoot );
			viewRoot = createViewRoot( viewDoc );
			view.attachDomRoot( domRoot );
			converter = view.domConverter;
		} );

		afterEach( () => {
			view.destroy();
			domRoot.remove();
		} );

		it( 'should properly render unwrapped attributes #1', () => {
			setViewData( view,
				'<container:p>' +
					'[<attribute:italic>' +
						'<attribute:strong>f</attribute:strong>' +
					'</attribute:italic>]' +
					'<attribute:strong>oo</attribute:strong>' +
				'</container:p>'
			);

			// Render it to DOM to create initial DOM <-> view mappings.
			view.forceRender();

			// Unwrap italic attribute element.
			view.change( writer => {
				writer.unwrap( viewDoc.selection.getFirstRange(), new ViewAttributeElement( viewDocument, 'italic' ) );
			} );

			expect( getViewData( view ) ).to.equal( '<p>[<strong>foo</strong>]</p>' );

			// Re-render changes in view to DOM.
			view.forceRender();

			// Check if DOM is rendered correctly.
			expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( '<p><strong>foo</strong></p>' );
			expect( checkMappings() ).to.be.true;
		} );

		it( 'should properly render unwrapped attributes #2', () => {
			setViewData( view,
				'<container:p>' +
					'[<attribute:italic>' +
						'<attribute:strong>foo</attribute:strong>' +
					'</attribute:italic>]' +
				'</container:p>' );

			// Render it to DOM to create initial DOM <-> view mappings.
			view.forceRender();

			// Unwrap italic attribute element and change text inside.
			view.change( writer => {
				writer.unwrap( viewDoc.selection.getFirstRange(), new ViewAttributeElement( viewDocument, 'italic' ) );
			} );

			viewRoot.getChild( 0 ).getChild( 0 ).getChild( 0 )._data = 'bar';
			expect( getViewData( view ) ).to.equal( '<p>[<strong>bar</strong>]</p>' );

			// Re-render changes in view to DOM.
			view.forceRender();

			// Check if DOM is rendered correctly.
			expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( '<p><strong>bar</strong></p>' );
			expect( checkMappings() ).to.be.true;
		} );

		it( 'should properly render if text is changed and element is inserted into same node #1', () => {
			setViewData( view,
				'<container:p>foo</container:p>'
			);

			// Render it to DOM to create initial DOM <-> view mappings.
			view.forceRender();

			// Change text and insert new element into paragraph.
			const textNode = viewRoot.getChild( 0 ).getChild( 0 );
			textNode._data = 'foobar';

			view.change( writer => {
				writer.insert( ViewPosition._createAfter( textNode ), new ViewAttributeElement( viewDocument, 'img' ) );
			} );

			expect( getViewData( view ) ).to.equal( '<p>foobar<img></img></p>' );

			// Re-render changes in view to DOM.
			view.forceRender();

			// Check if DOM is rendered correctly.
			expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( '<p>foobar<img></img></p>' );
			expect( checkMappings() ).to.be.true;
		} );

		it( 'should properly render if text is changed and element is inserted into same node #2', () => {
			setViewData( view,
				'<container:p>foo</container:p>'
			);

			// Render it to DOM to create initial DOM <-> view mappings.
			view.forceRender();

			// Change text and insert new element into paragraph.
			const textNode = viewRoot.getChild( 0 ).getChild( 0 );
			textNode._data = 'foobar';

			view.change( writer => {
				writer.insert( ViewPosition._createBefore( textNode ), new ViewAttributeElement( viewDocument, 'img' ) );
			} );

			expect( getViewData( view ) ).to.equal( '<p><img></img>foobar</p>' );

			// Re-render changes in view to DOM.
			view.forceRender();

			// Check if DOM is rendered correctly.
			expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( '<p><img></img>foobar</p>' );
			expect( checkMappings() ).to.be.true;
		} );

		it( 'should not unbind elements that are removed and reinserted to DOM', () => {
			setViewData( view,
				'<container:p>' +
					'<attribute:b></attribute:b>' +
					'<attribute:i></attribute:i>' +
					'<attribute:span></attribute:span>' +
				'</container:p>'
			);

			// Render it to DOM to create initial DOM <-> view mappings.
			view.forceRender();

			// Remove first element and reinsert it at the end.
			const container = viewRoot.getChild( 0 );
			const firstElement = container.getChild( 0 );

			view.change( writer => {
				writer.remove( ViewRange._createOn( firstElement ) );
				writer.insert( new ViewPosition( container, 2 ), firstElement );
			} );

			expect( getViewData( view ) ).to.equal( '<p><i></i><span></span><b></b></p>' );

			// Re-render changes in view to DOM.
			view.forceRender();

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

	describe( '_markDescendantTextToSync', () => {
		let viewRoot;

		beforeEach( () => {
			viewRoot = new ViewElement( viewDocument, 'div' );

			renderer.markedTexts.clear();
			renderer.markedAttributes.clear();
			renderer.markedChildren.clear();
		} );

		it( 'should handle null values', () => {
			// Such situation occurs when renderer encounters inline filler in 'renderer._updateChildren'.
			renderer._markDescendantTextToSync( null );

			expect( renderer.markedChildren.size ).to.equal( 0 );
			expect( renderer.markedAttributes.size ).to.equal( 0 );
			expect( renderer.markedTexts.size ).to.equal( 0 );
		} );

		it( 'should handle element nodes', () => {
			const viewP = parse( '<container:p>foo<attribute:b>bar<attribute:i>baz</attribute:i></attribute:b></container:p>' );

			viewRoot._appendChild( viewP );

			renderer._markDescendantTextToSync( viewP );

			expect( renderer.markedChildren.size ).to.equal( 0 );
			expect( renderer.markedAttributes.size ).to.equal( 0 );
			expect( renderer.markedTexts.size ).to.equal( 3 );
		} );

		it( 'should handle text nodes', () => {
			const viewP = parse( '<container:p><attribute:b>bar<attribute:i>baz</attribute:i></attribute:b></container:p>' );

			viewRoot._appendChild( viewP );

			renderer._markDescendantTextToSync( viewP.getChild( 0 ).getChild( 0 ) );

			expect( renderer.markedChildren.size ).to.equal( 0 );
			expect( renderer.markedAttributes.size ).to.equal( 0 );
			expect( renderer.markedTexts.size ).to.equal( 1 );
		} );

		it( 'should handle document fragment', () => {
			const fragment = new DocumentFragment();

			renderer._markDescendantTextToSync( fragment );

			expect( renderer.markedChildren.size ).to.equal( 0 );
			expect( renderer.markedAttributes.size ).to.equal( 0 );
			expect( renderer.markedTexts.size ).to.equal( 0 );
		} );

		it( 'should handle empty element nodes', () => {
			const viewP = parse( '<container:p></container:p>' );

			viewRoot._appendChild( viewP );

			renderer._markDescendantTextToSync( viewP );

			expect( renderer.markedChildren.size ).to.equal( 0 );
			expect( renderer.markedAttributes.size ).to.equal( 0 );
			expect( renderer.markedTexts.size ).to.equal( 0 );
		} );
	} );

	describe( '_updateText', () => {
		let viewRoot, domRoot;

		beforeEach( () => {
			viewRoot = new ViewElement( viewDocument, 'div' );
			domRoot = document.createElement( 'div' );
			document.body.appendChild( domRoot );

			domConverter.bindElements( domRoot, viewRoot );

			renderer.markedTexts.clear();
			renderer.markedAttributes.clear();
			renderer.markedChildren.clear();

			renderer.isFocused = true;
		} );

		afterEach( () => {
			domRoot.remove();
		} );

		it( 'should update text - change on end', () => {
			const viewText = new ViewText( viewDocument, 'foo' );
			viewRoot._appendChild( viewText );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'foo' );

			viewText._data = 'fobar';

			renderer._updateText( viewText, {} );

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'fobar' );
		} );

		it( 'should update text - change on start', () => {
			const viewText = new ViewText( viewDocument, 'foo' );
			viewRoot._appendChild( viewText );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'foo' );

			viewText._data = 'baro';

			renderer._updateText( viewText, {} );

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'baro' );
		} );

		it( 'should update text - change in the middle', () => {
			const viewText = new ViewText( viewDocument, 'foobar' );
			viewRoot._appendChild( viewText );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'foobar' );

			viewText._data = 'fobazr';

			renderer._updateText( viewText, {} );

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'fobazr' );
		} );

		it( 'should update text - empty expected', () => {
			const viewText = new ViewText( viewDocument, 'foo' );
			viewRoot._appendChild( viewText );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'foo' );

			viewText._data = '';

			renderer._updateText( viewText, {} );

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( '' );
		} );

		it( 'should update text - empty actual', () => {
			const viewText = new ViewText( viewDocument, '' );
			viewRoot._appendChild( viewText );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( '' );

			viewText._data = 'fobar';

			renderer._updateText( viewText, {} );

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'fobar' );
		} );

		it( 'should handle filler during text modifications', () => {
			const viewText = new ViewText( viewDocument, 'foo' );
			viewRoot._appendChild( viewText );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'foo' );

			// 1. Insert filler.
			renderer._updateText( viewText, {
				inlineFillerPosition: {
					parent: viewText.parent,
					offset: 0
				}
			} );

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( INLINE_FILLER + 'foo' );

			// 2. Edit text - filler should be preserved.
			viewText._data = 'barfoo';

			renderer._updateText( viewText, {
				inlineFillerPosition: {
					parent: viewText.parent,
					offset: 0
				}
			} );

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( INLINE_FILLER + 'barfoo' );

			// 3. Remove filler.
			renderer._updateText( viewText, {} );

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( 'barfoo' );
		} );

		it( 'should handle filler during text modifications - empty text', () => {
			const viewText = new ViewText( viewDocument, '' );
			viewRoot._appendChild( viewText );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( '' );

			// 1. Insert filler.
			renderer._updateText( viewText, {
				inlineFillerPosition: {
					parent: viewText.parent,
					offset: 0
				}
			} );

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( INLINE_FILLER );

			// 2. Edit text - filler should be preserved.
			viewText._data = 'foo';

			renderer._updateText( viewText, {
				inlineFillerPosition: {
					parent: viewText.parent,
					offset: 0
				}
			} );

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( INLINE_FILLER + 'foo' );

			// 3. Remove filler.
			viewText._data = '';

			renderer._updateText( viewText, {} );

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].data ).to.equal( '' );
		} );

		it( 'should handle filler during text modifications inside inline element', () => {
			const viewB = new ViewElement( viewDocument, 'b' );
			const viewText = new ViewText( viewDocument, 'foo' );

			viewB._appendChild( viewText );
			viewRoot._appendChild( viewB );

			renderer.markToSync( 'children', viewRoot );
			renderer.render();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].tagName ).to.equal( 'B' );
			expect( domRoot.childNodes[ 0 ].childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].childNodes[ 0 ].data ).to.equal( 'foo' );

			// 1. Insert filler.
			renderer._updateText( viewText, {
				inlineFillerPosition: {
					parent: viewText.parent,
					offset: 0
				}
			} );

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].tagName ).to.equal( 'B' );
			expect( domRoot.childNodes[ 0 ].childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].childNodes[ 0 ].data ).to.equal( INLINE_FILLER + 'foo' );

			// 2. Edit text - filler should be preserved.
			viewText._data = 'bar';

			renderer._updateText( viewText, {
				inlineFillerPosition: {
					parent: viewText.parent,
					offset: 0
				}
			} );

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].tagName ).to.equal( 'B' );
			expect( domRoot.childNodes[ 0 ].childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].childNodes[ 0 ].data ).to.equal( INLINE_FILLER + 'bar' );

			// 3. Remove filler.
			viewText._data = 'bar';

			renderer._updateText( viewText, {} );

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].tagName ).to.equal( 'B' );
			expect( domRoot.childNodes[ 0 ].childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].childNodes[ 0 ].data ).to.equal( 'bar' );
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
