/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import View from '../../../src/view/view.js';
import MutationObserver from '../../../src/view/observer/mutationobserver.js';
import UIElement from '../../../src/view/uielement.js';
import RawElement from '../../../src/view/rawelement.js';
import createViewRoot from '../_utils/createroot.js';
import { parse } from '../../../src/dev-utils/view.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'MutationObserver', () => {
	let view, domRoot, viewDocument, viewRoot, mutationObserver, domWrapper, spyRenderedMarkToSync, spyForceRender, mutationsEventData;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		domWrapper = document.createElement( 'div' );
		domWrapper.innerHTML = '<div contenteditable="true" id="main"></div><div contenteditable="true" id="additional"></div>';
		document.body.appendChild( domWrapper );

		view = new View( new StylesProcessor() );
		viewDocument = view.document;
		viewDocument.selection._setTo( null );
		document.getSelection().removeAllRanges();

		mutationObserver = view.getObserver( MutationObserver );

		( { viewRoot, domRoot } = setupRoot( 'main' ) );

		viewRoot._appendChild( parse( '<container:p>foo</container:p><container:p>bar</container:p>' ) );
		view.forceRender();

		spyRenderedMarkToSync = sinon.spy( view._renderer, 'markToSync' );
		spyForceRender = sinon.spy( view, 'forceRender' );

		viewDocument.on( 'mutations', ( evt, { mutations } ) => {
			mutationsEventData = mutations;
		} );
	} );

	afterEach( () => {
		mutationObserver.disable();

		domWrapper.parentElement.removeChild( domWrapper );
		view.destroy();
	} );

	it( 'should handle typing', () => {
		domRoot.childNodes[ 0 ].childNodes[ 0 ].data = 'foom';

		mutationObserver.flush();

		expectDomEditorNotToChange();
	} );

	it( 'should not observe if disabled', () => {
		mutationObserver.disable();

		const { domRoot: domAdditionalRoot } = setupRoot( 'additional' );

		domAdditionalRoot.textContent = 'foobar';
		mutationObserver.flush();

		expect( domAdditionalRoot.childNodes.length ).to.equal( 1 );
		expect( domAdditionalRoot.childNodes[ 0 ].data ).to.equal( 'foobar' );
	} );

	it( 'should allow to stop observing a DOM element', () => {
		const { domRoot: domAdditionalRoot } = setupRoot( 'additional' );

		mutationObserver.stopObserving( domRoot );

		domAdditionalRoot.innerHTML = 'foobar';
		domRoot.innerHTML = 'abcabc';

		mutationObserver.flush();

		// Explanation:
		// Mutation observer is listening on `domAdditionalRoot`. Because of that, the changes done to it are reverted.
		// Mutation observer was disabled for `domRoot`. Because of that, changes done to it are kept.
		expect( domAdditionalRoot.innerHTML ).to.equal( '<br data-cke-filler="true">' );
		expect( domRoot.innerHTML ).to.equal( 'abcabc' );
	} );

	it( 'should not stop observing a DOM element when observer is disabled', () => {
		const { domRoot: domAdditionalRoot } = setupRoot( 'additional' );

		mutationObserver.disable();
		mutationObserver.stopObserving( domRoot );

		domAdditionalRoot.innerHTML = 'foobar';
		domRoot.innerHTML = 'abcabc';

		mutationObserver.flush();

		expect( domAdditionalRoot.innerHTML ).to.equal( 'foobar' );
		expect( domRoot.innerHTML ).to.equal( 'abcabc' );
	} );

	it( 'should handle bold', () => {
		const domB = document.createElement( 'b' );

		domB.appendChild( document.createTextNode( 'oo' ) );

		domRoot.childNodes[ 0 ].childNodes[ 0 ].data = 'f';
		domRoot.childNodes[ 0 ].appendChild( domB );

		mutationObserver.flush();

		expectDomEditorNotToChange();
	} );

	it( 'should handle unbold', () => {
		viewRoot._removeChildren( 0, viewRoot.childCount );
		viewRoot._appendChild( parse( '<container:p><attribute:b>foo</attribute:b></container:p>' ) );
		view.forceRender();

		const domP = domRoot.childNodes[ 0 ];
		const domB = domP.childNodes[ 0 ];

		domP.removeChild( domB );
		domP.appendChild( document.createTextNode( 'foo' ) );

		mutationObserver.flush();

		// "expectDomEditorNotToChange()".
		expect( domRoot.childNodes.length ).to.equal( 1 );
		expect( domRoot.childNodes[ 0 ].tagName ).to.equal( 'P' );

		expect( domRoot.childNodes[ 0 ].childNodes.length ).to.equal( 1 );
		expect( domRoot.childNodes[ 0 ].childNodes[ 0 ].tagName ).to.equal( 'B' );

		expect( domRoot.childNodes[ 0 ].childNodes[ 0 ].childNodes.length ).to.equal( 1 );
		expect( domRoot.childNodes[ 0 ].childNodes[ 0 ].childNodes[ 0 ].data ).to.equal( 'foo' );
	} );

	it( 'should deduplicate text changes', () => {
		domRoot.childNodes[ 0 ].childNodes[ 0 ].data = 'foox';
		domRoot.childNodes[ 0 ].childNodes[ 0 ].data = 'fooxy';

		mutationObserver.flush();

		expectDomEditorNotToChange();
		sinon.assert.calledOnceWithExactly( spyRenderedMarkToSync, 'text', viewRoot.getChild( 0 ).getChild( 0 ) );
		sinon.assert.calledOnce( spyForceRender );

		expect( mutationsEventData ).to.deep.equal( [
			{ type: 'text', node: viewRoot.getChild( 0 ).getChild( 0 ) }
		] );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/12759.
	it( 'should not handle added attribute mutation', () => {
		domRoot.childNodes[ 0 ].setAttribute( 'foo', 'bar' );

		mutationObserver.flush();

		sinon.assert.notCalled( spyRenderedMarkToSync );
		sinon.assert.notCalled( spyForceRender );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/12759.
	it( 'should not handle removed attribute mutation', () => {
		view.change( writer => {
			writer.setAttribute( 'foo', 'bar', viewRoot.getChild( 0 ) );
		} );
		spyRenderedMarkToSync.resetHistory();

		domRoot.childNodes[ 0 ].removeAttribute( 'foo' );
		mutationObserver.flush();

		sinon.assert.notCalled( spyRenderedMarkToSync );
		sinon.assert.notCalled( spyForceRender );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/12759.
	it( 'should not handle attribute value mutation', () => {
		view.change( writer => {
			writer.setAttribute( 'foo', 'bar', viewRoot.getChild( 0 ) );
		} );
		spyRenderedMarkToSync.resetHistory();

		domRoot.childNodes[ 0 ].setAttribute( 'foo', 'abc' );
		mutationObserver.flush();

		sinon.assert.notCalled( spyRenderedMarkToSync );
		sinon.assert.notCalled( spyForceRender );
	} );

	it( 'should be able to observe multiple roots', () => {
		const { domRoot: domAdditionalRoot, viewRoot: viewAdditionalRoot } = setupRoot( 'additional' );

		viewAdditionalRoot._appendChild(
			parse( '<container:p>foo</container:p><container:p>bar</container:p>' ) );

		// Render additional root (first editor has been rendered in the beforeEach function).
		view.forceRender();
		spyRenderedMarkToSync.resetHistory();
		spyForceRender.resetHistory();

		domRoot.childNodes[ 0 ].childNodes[ 0 ].data = 'foom';
		domAdditionalRoot.childNodes[ 0 ].childNodes[ 0 ].data = 'foom';

		mutationObserver.flush();

		sinon.assert.calledTwice( spyRenderedMarkToSync );
		sinon.assert.calledWithExactly( spyRenderedMarkToSync, 'text', viewRoot.getChild( 0 ).getChild( 0 ) );
		sinon.assert.calledWithExactly( spyRenderedMarkToSync, 'text', viewAdditionalRoot.getChild( 0 ).getChild( 0 ) );
		sinon.assert.calledOnce( spyForceRender );

		expect( mutationsEventData ).to.deep.equal( [
			{ type: 'text', node: viewRoot.getChild( 0 ).getChild( 0 ) },
			{ type: 'text', node: viewAdditionalRoot.getChild( 0 ).getChild( 0 ) }
		] );
	} );

	it( 'should do nothing if there were no mutations', () => {
		mutationObserver.flush();

		expectDomEditorNotToChange();
		sinon.assert.notCalled( spyRenderedMarkToSync );
		sinon.assert.notCalled( spyForceRender );
	} );

	it( 'should handle children mutation if the mutation occurred in the inline filler', () => {
		const { view: viewContainer, selection } = parse(
			'<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>'
		);

		view.change( writer => {
			viewRoot._appendChild( viewContainer );
			writer.setSelection( selection );
		} );

		spyRenderedMarkToSync.resetHistory();

		const inlineFiller = domRoot.childNodes[ 2 ].childNodes[ 1 ].childNodes[ 0 ];

		inlineFiller.data += 'x';
		mutationObserver.flush();

		sinon.assert.calledOnce( spyRenderedMarkToSync );
		sinon.assert.calledWithExactly( spyRenderedMarkToSync, 'children', selection.getFirstPosition().parent );
		sinon.assert.calledOnce( spyForceRender );

		expect( mutationsEventData ).to.deep.equal( [
			{ type: 'children', node: selection.getFirstPosition().parent }
		] );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/692 Scenario 1.
	it( 'should handle space after inline filler at the end of container', () => {
		const { view: viewContainer, selection } = parse(
			'<container:p>foo<attribute:b>[]</attribute:b></container:p>'
		);

		view.change( writer => {
			viewRoot._appendChild( viewContainer );
			writer.setSelection( selection );
		} );

		spyRenderedMarkToSync.resetHistory();

		// Appended container is third in the tree.
		const container = domRoot.childNodes[ 2 ];
		const inlineFiller = container.childNodes[ 1 ].childNodes[ 0 ];

		inlineFiller.data += ' ';

		mutationObserver.flush();

		sinon.assert.calledOnce( spyRenderedMarkToSync );
		sinon.assert.calledWithExactly( spyRenderedMarkToSync, 'children', selection.getFirstPosition().parent );
		sinon.assert.calledOnce( spyForceRender );

		expect( mutationsEventData ).to.deep.equal( [
			{ type: 'children', node: selection.getFirstPosition().parent }
		] );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/692 Scenario 3.
	it( 'should handle space after inline filler at the end of container (typing after bold)', () => {
		const { view: viewContainer, selection } = parse(
			'<container:p>foo<attribute:b>bar</attribute:b>[]</container:p>'
		);

		view.change( writer => {
			viewRoot._appendChild( viewContainer );
			writer.setSelection( selection );
		} );

		spyRenderedMarkToSync.resetHistory();

		// Appended container is third in the tree.
		const container = domRoot.childNodes[ 2 ];
		const inlineFiller = container.childNodes[ 2 ];

		inlineFiller.data += ' ';

		mutationObserver.flush();

		sinon.assert.calledOnce( spyRenderedMarkToSync );
		sinon.assert.calledWithExactly( spyRenderedMarkToSync, 'children', selection.getFirstPosition().parent );
		sinon.assert.calledOnce( spyForceRender );

		expect( mutationsEventData ).to.deep.equal( [
			{ type: 'children', node: selection.getFirstPosition().parent }
		] );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/692 Scenario 2.
	it( 'should handle space after inline filler at the beginning of container', () => {
		const { view: viewContainer, selection } = parse(
			'<container:p><attribute:b>[]</attribute:b>foo</container:p>'
		);

		view.change( writer => {
			viewRoot._appendChild( viewContainer );
			writer.setSelection( selection );
		} );

		spyRenderedMarkToSync.resetHistory();

		// Appended container is third in the tree.
		const container = domRoot.childNodes[ 2 ];
		const inlineFiller = container.childNodes[ 0 ].childNodes[ 0 ];

		inlineFiller.data += ' ';

		mutationObserver.flush();

		sinon.assert.calledOnce( spyRenderedMarkToSync );
		sinon.assert.calledWithExactly( spyRenderedMarkToSync, 'children', selection.getFirstPosition().parent );
		sinon.assert.calledOnce( spyForceRender );

		expect( mutationsEventData ).to.deep.equal( [
			{ type: 'children', node: selection.getFirstPosition().parent }
		] );
	} );

	it( 'should ignore mutation with bogus br inserted on the end of the empty paragraph', () => {
		viewRoot._appendChild( parse( '<container:p></container:p>' ) );

		view.forceRender();
		spyRenderedMarkToSync.resetHistory();
		spyForceRender.resetHistory();

		const domP = domRoot.childNodes[ 2 ];
		domP.appendChild( document.createElement( 'br' ) );

		mutationObserver.flush();

		sinon.assert.notCalled( spyRenderedMarkToSync );
		sinon.assert.notCalled( spyForceRender );
	} );

	it( 'should ignore mutation with bogus br inserted on the end of the paragraph with text', () => {
		viewRoot._appendChild( parse( '<container:p>foo</container:p>' ) );

		view.forceRender();
		spyRenderedMarkToSync.resetHistory();
		spyForceRender.resetHistory();

		const domP = domRoot.childNodes[ 2 ];
		domP.appendChild( document.createElement( 'br' ) );

		mutationObserver.flush();

		sinon.assert.notCalled( spyRenderedMarkToSync );
		sinon.assert.notCalled( spyForceRender );
	} );

	it( 'should ignore mutation with bogus br inserted on the end of the paragraph while processing text mutations', () => {
		viewRoot._appendChild( parse( '<container:p>abc</container:p>' ) );

		view.forceRender();
		spyRenderedMarkToSync.resetHistory();
		spyForceRender.resetHistory();

		const domP = domRoot.childNodes[ 2 ];
		domP.childNodes[ 0 ].data = 'foo ';
		domP.appendChild( document.createElement( 'br' ) );

		mutationObserver.flush();

		sinon.assert.calledOnce( spyRenderedMarkToSync );
		sinon.assert.calledWithExactly( spyRenderedMarkToSync, 'text', viewRoot.getChild( 2 ).getChild( 0 ) );
		sinon.assert.calledOnce( spyForceRender );

		expect( mutationsEventData ).to.deep.equal( [
			{ type: 'text', node: viewRoot.getChild( 2 ).getChild( 0 ) }
		] );
	} );

	it( 'should ignore child mutations which resulted in no changes – when element contains elements', () => {
		viewRoot._appendChild( parse( '<container:p><container:x></container:x></container:p>' ) );

		view.forceRender();
		spyRenderedMarkToSync.resetHistory();
		spyForceRender.resetHistory();

		const domP = domRoot.childNodes[ 2 ];
		const domY = document.createElement( 'y' );
		domP.appendChild( domY );
		domY.remove();

		mutationObserver.flush();

		sinon.assert.notCalled( spyRenderedMarkToSync );
		sinon.assert.notCalled( spyForceRender );
	} );

	// This case is more tricky than the previous one because DOMConverter will return a different
	// instances of view text nodes every time it converts a DOM text node.
	it( 'should ignore child mutations which resulted in no changes – when element contains text nodes', () => {
		const domP = domRoot.childNodes[ 0 ];
		const domText = document.createTextNode( 'x' );
		domP.appendChild( domText );
		domText.remove();

		const domP2 = domRoot.childNodes[ 1 ];
		domP2.appendChild( document.createTextNode( 'x' ) );

		mutationObserver.flush();

		// There was only P2 change. P1 must be ignored.
		const viewP2 = viewRoot.getChild( 1 );

		sinon.assert.calledOnce( spyRenderedMarkToSync );
		sinon.assert.calledWithExactly( spyRenderedMarkToSync, 'children', viewP2 );
		sinon.assert.calledOnce( spyForceRender );

		expect( mutationsEventData ).to.deep.equal( [
			{ type: 'children', node: viewP2 }
		] );
	} );

	it( 'should not ignore mutation with br inserted not on the end of the paragraph', () => {
		viewRoot._appendChild( parse( '<container:p>abc</container:p>' ) );

		view.forceRender();
		spyRenderedMarkToSync.resetHistory();
		spyForceRender.resetHistory();

		const domP = domRoot.childNodes[ 2 ];
		domP.insertBefore( document.createElement( 'br' ), domP.childNodes[ 0 ] );

		mutationObserver.flush();

		sinon.assert.calledOnce( spyRenderedMarkToSync );
		sinon.assert.calledWithExactly( spyRenderedMarkToSync, 'children', viewRoot.getChild( 2 ) );
		sinon.assert.calledOnce( spyForceRender );

		expect( mutationsEventData ).to.deep.equal( [
			{ type: 'children', node: viewRoot.getChild( 2 ) }
		] );
	} );

	it( 'should not ignore mutation inserting element different than br on the end of the empty paragraph', () => {
		viewRoot._appendChild( parse( '<container:p></container:p>' ) );

		view.forceRender();
		spyRenderedMarkToSync.resetHistory();
		spyForceRender.resetHistory();

		const domP = domRoot.childNodes[ 2 ];
		domP.appendChild( document.createElement( 'span' ) );

		mutationObserver.flush();

		sinon.assert.calledOnce( spyRenderedMarkToSync );
		sinon.assert.calledWithExactly( spyRenderedMarkToSync, 'children', viewRoot.getChild( 2 ) );
		sinon.assert.calledOnce( spyForceRender );

		expect( mutationsEventData ).to.deep.equal( [
			{ type: 'children', node: viewRoot.getChild( 2 ) }
		] );
	} );

	it( 'should not ignore mutation inserting element different than br on the end of the paragraph with text', () => {
		viewRoot._appendChild( parse( '<container:p>foo</container:p>' ) );

		view.forceRender();
		spyRenderedMarkToSync.resetHistory();
		spyForceRender.resetHistory();

		const domP = domRoot.childNodes[ 2 ];
		domP.appendChild( document.createElement( 'span' ) );

		mutationObserver.flush();

		sinon.assert.calledOnce( spyRenderedMarkToSync );
		sinon.assert.calledWithExactly( spyRenderedMarkToSync, 'children', viewRoot.getChild( 2 ) );
		sinon.assert.calledOnce( spyForceRender );

		expect( mutationsEventData ).to.deep.equal( [
			{ type: 'children', node: viewRoot.getChild( 2 ) }
		] );
	} );

	describe( 'UIElement integration', () => {
		const renderStub = sinon.stub();

		function createUIElement( name ) {
			const element = new UIElement( viewDocument, name );

			element.render = function( domDocument ) {
				const root = this.toDomElement( domDocument );
				root.innerHTML = 'foo bar';

				return root;
			};

			return element;
		}

		beforeEach( () => {
			const uiElement = createUIElement( 'div' );
			viewRoot._appendChild( uiElement );

			view.forceRender();
			renderStub.reset();
			view.on( 'render', renderStub );
			spyRenderedMarkToSync.resetHistory();
			spyForceRender.resetHistory();
		} );

		it( 'should not collect text mutations from UIElement', () => {
			domRoot.childNodes[ 2 ].childNodes[ 0 ].data = 'foom';

			mutationObserver.flush();

			sinon.assert.notCalled( spyRenderedMarkToSync );
			sinon.assert.notCalled( spyForceRender );
		} );

		it( 'should not cause a render from UIElement', () => {
			domRoot.childNodes[ 2 ].childNodes[ 0 ].data = 'foom';

			mutationObserver.flush();

			expect( renderStub.callCount ).to.equal( 0 );
		} );

		it( 'should not collect child mutations from UIElement', () => {
			const span = document.createElement( 'span' );
			domRoot.childNodes[ 2 ].appendChild( span );

			mutationObserver.flush();

			sinon.assert.notCalled( spyRenderedMarkToSync );
			sinon.assert.notCalled( spyForceRender );
		} );

		it( 'should not cause a render when UIElement gets a child', () => {
			const span = document.createElement( 'span' );
			domRoot.childNodes[ 2 ].appendChild( span );

			mutationObserver.flush();

			expect( renderStub.callCount ).to.equal( 0 );
		} );
	} );

	describe( 'RawElement integration', () => {
		const renderStub = sinon.stub();

		function createRawElement( name ) {
			const element = new RawElement( viewDocument, name );

			element.render = function( domElement ) {
				domElement.innerHTML = 'foo bar';
			};

			return element;
		}

		beforeEach( () => {
			const rawElement = createRawElement( 'div' );
			viewRoot._appendChild( rawElement );

			view.forceRender();
			renderStub.reset();
			view.on( 'render', renderStub );
			spyRenderedMarkToSync.resetHistory();
			spyForceRender.resetHistory();
		} );

		it( 'should not collect text mutations from RawElement', () => {
			domRoot.childNodes[ 2 ].childNodes[ 0 ].data = 'foom';

			mutationObserver.flush();

			sinon.assert.notCalled( spyRenderedMarkToSync );
			sinon.assert.notCalled( spyForceRender );
		} );

		it( 'should not cause a render from RawElement', () => {
			domRoot.childNodes[ 2 ].childNodes[ 0 ].data = 'foom';

			mutationObserver.flush();

			expect( renderStub.callCount ).to.equal( 0 );
		} );

		it( 'should not collect child mutations from RawElement', () => {
			const span = document.createElement( 'span' );
			domRoot.childNodes[ 2 ].appendChild( span );

			mutationObserver.flush();

			sinon.assert.notCalled( spyRenderedMarkToSync );
			sinon.assert.notCalled( spyForceRender );
		} );

		it( 'should not cause a render when RawElement gets a child', () => {
			const span = document.createElement( 'span' );
			domRoot.childNodes[ 2 ].appendChild( span );

			mutationObserver.flush();

			expect( renderStub.callCount ).to.equal( 0 );
		} );
	} );

	function setupRoot( rootName ) {
		const domRoot = document.getElementById( rootName );

		createViewRoot( viewDocument, 'div', rootName );
		view.attachDomRoot( domRoot, rootName );

		const viewRoot = viewDocument.getRoot( rootName );

		return { domRoot, viewRoot };
	}

	function expectDomEditorNotToChange() {
		expect( domRoot.childNodes.length ).to.equal( 2 );
		expect( domRoot.childNodes[ 0 ].tagName ).to.equal( 'P' );
		expect( domRoot.childNodes[ 1 ].tagName ).to.equal( 'P' );

		expect( domRoot.childNodes[ 0 ].childNodes.length ).to.equal( 1 );
		expect( domRoot.childNodes[ 0 ].childNodes[ 0 ].data ).to.equal( 'foo' );

		expect( domRoot.childNodes[ 1 ].childNodes.length ).to.equal( 1 );
		expect( domRoot.childNodes[ 1 ].childNodes[ 0 ].data ).to.equal( 'bar' );
	}
} );
