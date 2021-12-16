/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import View from '../../../src/view/view';
import MutationObserver from '../../../src/view/observer/mutationobserver';
import UIElement from '../../../src/view/uielement';
import RawElement from '../../../src/view/rawelement';
import createViewRoot from '../_utils/createroot';
import { parse } from '../../../src/dev-utils/view';
import { StylesProcessor } from '../../../src/view/stylesmap';

describe( 'MutationObserver', () => {
	let view, domEditor, viewDocument, viewRoot, mutationObserver, lastMutations, domRoot;

	beforeEach( () => {
		domRoot = document.createElement( 'div' );
		domRoot.innerHTML = '<div contenteditable="true" id="main"></div><div contenteditable="true" id="additional"></div>';
		document.body.appendChild( domRoot );

		view = new View( new StylesProcessor() );
		viewDocument = view.document;
		domEditor = document.getElementById( 'main' );
		lastMutations = null;

		createViewRoot( viewDocument );
		view.attachDomRoot( domEditor );
		viewDocument.selection._setTo( null );
		document.getSelection().removeAllRanges();

		mutationObserver = view.getObserver( MutationObserver );

		viewDocument.on( 'mutations', ( evt, mutations ) => {
			lastMutations = mutations;
		} );

		viewRoot = viewDocument.getRoot();

		viewRoot._appendChild( parse( '<container:p>foo</container:p><container:p>bar</container:p>' ) );

		view.forceRender();
	} );

	afterEach( () => {
		mutationObserver.disable();

		domRoot.parentElement.removeChild( domRoot );
		view.destroy();
	} );

	it( 'should handle typing', () => {
		domEditor.childNodes[ 0 ].childNodes[ 0 ].data = 'foom';

		mutationObserver.flush();

		expectDomEditorNotToChange();
		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'text' );
		expect( lastMutations[ 0 ].node ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
		expect( lastMutations[ 0 ].newText ).to.equal( 'foom' );
		expect( lastMutations[ 0 ].oldText ).to.equal( 'foo' );
	} );

	it( 'should not observe if disabled', () => {
		const additional = document.getElementById( 'additional' );
		mutationObserver.disable();
		createViewRoot( viewDocument, 'div', 'additional' );
		view.attachDomRoot( additional, 'additional' );

		additional.textContent = 'foobar';
		mutationObserver.flush();

		expect( lastMutations ).to.be.null;
	} );

	it( 'should handle bold', () => {
		domEditor.childNodes[ 0 ].childNodes[ 0 ].data = 'f';
		const domB = document.createElement( 'b' );
		domB.appendChild( document.createTextNode( 'oo' ) );
		domEditor.childNodes[ 0 ].appendChild( domB );

		mutationObserver.flush();

		expectDomEditorNotToChange();
		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'children' );
		expect( lastMutations[ 0 ].node ).to.equal( viewRoot.getChild( 0 ) );

		expect( lastMutations[ 0 ].newChildren.length ).to.equal( 2 );
		expect( lastMutations[ 0 ].newChildren[ 0 ].data ).to.equal( 'f' );
		expect( lastMutations[ 0 ].newChildren[ 1 ].name ).to.equal( 'b' );

		expect( lastMutations[ 0 ].oldChildren.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].oldChildren[ 0 ].data ).to.equal( 'foo' );
	} );

	it( 'should handle unbold', () => {
		viewRoot._removeChildren( 0, viewRoot.childCount );
		viewRoot._appendChild( parse( '<container:p><attribute:b>foo</attribute:b></container:p>' ) );
		view.forceRender();

		const domP = domEditor.childNodes[ 0 ];
		const domB = domP.childNodes[ 0 ];
		domP.removeChild( domB );
		domP.appendChild( document.createTextNode( 'foo' ) );

		mutationObserver.flush();

		// "expectDomEditorNotToChange()".
		expect( domEditor.childNodes.length ).to.equal( 1 );
		expect( domEditor.childNodes[ 0 ].tagName ).to.equal( 'P' );

		expect( domEditor.childNodes[ 0 ].childNodes.length ).to.equal( 1 );
		expect( domEditor.childNodes[ 0 ].childNodes[ 0 ].tagName ).to.equal( 'B' );

		expect( domEditor.childNodes[ 0 ].childNodes[ 0 ].childNodes.length ).to.equal( 1 );
		expect( domEditor.childNodes[ 0 ].childNodes[ 0 ].childNodes[ 0 ].data ).to.equal( 'foo' );

		// Check mutations.
		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'children' );
		expect( lastMutations[ 0 ].node ).to.equal( viewRoot.getChild( 0 ) );

		expect( lastMutations[ 0 ].newChildren.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].newChildren[ 0 ].data ).to.equal( 'foo' );

		expect( lastMutations[ 0 ].oldChildren.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].oldChildren[ 0 ].name ).to.equal( 'b' );
	} );

	it( 'should deduplicate text changes', () => {
		domEditor.childNodes[ 0 ].childNodes[ 0 ].data = 'foox';
		domEditor.childNodes[ 0 ].childNodes[ 0 ].data = 'fooxy';

		mutationObserver.flush();

		expectDomEditorNotToChange();
		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'text' );
		expect( lastMutations[ 0 ].node ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
		expect( lastMutations[ 0 ].newText ).to.equal( 'fooxy' );
		expect( lastMutations[ 0 ].oldText ).to.equal( 'foo' );
	} );

	it( 'should ignore changes in elements not attached to tree view', () => {
		const domP = document.createElement( 'p' );
		const domB = document.createElement( 'b' );
		const domText = document.createTextNode( 'bom' );

		domEditor.appendChild( domP );
		domP.appendChild( domB );
		domB.appendChild( domText );

		mutationObserver.flush();

		expectDomEditorNotToChange();
		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'children' );
		expect( lastMutations[ 0 ].node ).to.equal( viewRoot );
	} );

	it( 'should fire mutations event with view selection instance, if dom selection can be mapped to view', done => {
		const textNode = domEditor.childNodes[ 0 ].childNodes[ 0 ];
		textNode.data = 'foom';

		const domSelection = document.getSelection();
		domSelection.collapse( textNode, 4 );

		viewDocument.on( 'mutations', ( evt, viewMutations, viewSelection ) => {
			expect( viewSelection.anchor.parent ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
			expect( viewSelection.anchor.offset ).to.equal( 4 );

			done();
		} );

		mutationObserver.flush();

		expectDomEditorNotToChange();
	} );

	it( 'should fire mutations event with viewSelection param set to null, if dom selection cannot be mapped to view', done => {
		const textNode = domEditor.ownerDocument.createTextNode( 'foo' );
		domEditor.childNodes[ 0 ].appendChild( textNode );

		const domSelection = document.getSelection();
		domSelection.collapse( textNode, 3 );

		viewDocument.on( 'mutations', ( evt, viewMutations, viewSelection ) => {
			expect( viewSelection ).to.be.null;
			done();
		} );

		mutationObserver.flush();

		expectDomEditorNotToChange();
	} );

	it( 'should be able to observe multiple roots', () => {
		const domAdditionalEditor = document.getElementById( 'additional' );

		// Prepare AdditionalEditor
		createViewRoot( viewDocument, 'div', 'additional' );
		view.attachDomRoot( domAdditionalEditor, 'additional' );

		viewDocument.getRoot( 'additional' )._appendChild(
			parse( '<container:p>foo</container:p><container:p>bar</container:p>' ) );

		// Render AdditionalEditor (first editor has been rendered in the beforeEach function)
		view.forceRender();

		domEditor.childNodes[ 0 ].childNodes[ 0 ].data = 'foom';
		domAdditionalEditor.childNodes[ 0 ].childNodes[ 0 ].data = 'foom';

		mutationObserver.flush();

		expect( lastMutations.length ).to.equal( 2 );
	} );

	it( 'should fire nothing if there were no mutations', () => {
		mutationObserver.flush();

		expectDomEditorNotToChange();
		expect( lastMutations ).to.be.null;
	} );

	it( 'should fire children mutation if the mutation occurred in the inline filler', () => {
		const { view: viewContainer, selection } = parse(
			'<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>'
		);

		view.change( writer => {
			viewRoot._appendChild( viewContainer );
			writer.setSelection( selection );
		} );

		const inlineFiller = domEditor.childNodes[ 2 ].childNodes[ 1 ].childNodes[ 0 ];
		inlineFiller.data += 'x';

		mutationObserver.flush();

		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'children' );
		expect( lastMutations[ 0 ].node ).to.equal( selection.getFirstPosition().parent );
	} );

	it( 'should have no inline filler in mutation', () => {
		const { view: viewContainer, selection } = parse(
			'<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>'
		);

		view.change( writer => {
			viewRoot._appendChild( viewContainer );
			writer.setSelection( selection );
		} );

		let inlineFiller = domEditor.childNodes[ 2 ].childNodes[ 1 ].childNodes[ 0 ];
		inlineFiller.data += 'x';

		view.change( () => {
			viewContainer.getChild( 1 )._appendChild( parse( 'x' ) );
			mutationObserver.flush();
		} );

		inlineFiller = domEditor.childNodes[ 2 ].childNodes[ 1 ].childNodes[ 0 ];
		inlineFiller.data += 'y';

		mutationObserver.flush();

		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'text' );
		expect( lastMutations[ 0 ].oldText ).to.equal( 'x' );
		expect( lastMutations[ 0 ].newText ).to.equal( 'xy' );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/692 Scenario 1.
	it( 'should handle space after inline filler at the end of container', () => {
		const { view: viewContainer, selection } = parse(
			'<container:p>' +
				'foo' +
				'<attribute:b>[]</attribute:b>' +
			'</container:p>'
		);

		view.change( writer => {
			viewRoot._appendChild( viewContainer );
			writer.setSelection( selection );
		} );

		// Appended container is third in the tree.
		const container = domEditor.childNodes[ 2 ];
		const inlineFiller = container.childNodes[ 1 ].childNodes[ 0 ];

		inlineFiller.data += ' ';

		mutationObserver.flush();

		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'children' );
		expect( lastMutations[ 0 ].oldChildren.length ).to.equal( 0 );
		expect( lastMutations[ 0 ].newChildren.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].newChildren[ 0 ].is( '$text' ) ).to.be.true;
		expect( lastMutations[ 0 ].newChildren[ 0 ].data ).to.equal( ' ' );
		expect( lastMutations[ 0 ].node ).to.equal( selection.getFirstPosition().parent );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/692 Scenario 3.
	it( 'should handle space after inline filler at the end of container #2', () => {
		const { view: viewContainer, selection } = parse(
			'<container:p>' +
				'foo' +
				'<attribute:b>bar</attribute:b>' +
				'[]' +
			'</container:p>'
		);

		view.change( writer => {
			viewRoot._appendChild( viewContainer );
			writer.setSelection( selection );
		} );

		// Appended container is third in the tree.
		const container = domEditor.childNodes[ 2 ];
		const inlineFiller = container.childNodes[ 2 ];

		inlineFiller.data += ' ';

		mutationObserver.flush();

		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'children' );
		expect( lastMutations[ 0 ].oldChildren.length ).to.equal( 2 );
		expect( lastMutations[ 0 ].newChildren.length ).to.equal( 3 );

		// Foo and attribute is removed and reinserted.
		expect( lastMutations[ 0 ].oldChildren[ 0 ].is( '$text' ) ).to.be.true;
		expect( lastMutations[ 0 ].oldChildren[ 0 ].data ).to.equal( 'foo' );
		expect( lastMutations[ 0 ].newChildren[ 0 ].is( '$text' ) ).to.be.true;
		expect( lastMutations[ 0 ].newChildren[ 0 ].data ).to.equal( 'foo' );

		expect( lastMutations[ 0 ].oldChildren[ 1 ].is( 'attributeElement' ) ).to.be.true;
		expect( lastMutations[ 0 ].oldChildren[ 1 ].name ).to.equal( 'b' );
		expect( lastMutations[ 0 ].newChildren[ 1 ].is( 'attributeElement' ) ).to.be.true;
		expect( lastMutations[ 0 ].newChildren[ 1 ].name ).to.equal( 'b' );

		expect( lastMutations[ 0 ].newChildren[ 2 ].is( '$text' ) ).to.be.true;
		expect( lastMutations[ 0 ].newChildren[ 2 ].data ).to.equal( ' ' );
		expect( lastMutations[ 0 ].node ).to.equal( selection.getFirstPosition().parent );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/692 Scenario 2.
	it( 'should handle space after inline filler at the beginning of container', () => {
		const { view: viewContainer, selection } = parse(
			'<container:p>' +
				'<attribute:b>[]</attribute:b>' +
				'foo' +
			'</container:p>'
		);

		view.change( writer => {
			viewRoot._appendChild( viewContainer );
			writer.setSelection( selection );
		} );

		// Appended container is third in the tree.
		const container = domEditor.childNodes[ 2 ];
		const inlineFiller = container.childNodes[ 0 ].childNodes[ 0 ];

		inlineFiller.data += ' ';

		mutationObserver.flush();

		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'children' );
		expect( lastMutations[ 0 ].oldChildren.length ).to.equal( 0 );
		expect( lastMutations[ 0 ].newChildren.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].newChildren[ 0 ].is( '$text' ) ).to.be.true;
		expect( lastMutations[ 0 ].newChildren[ 0 ].data ).to.equal( ' ' );
		expect( lastMutations[ 0 ].node ).to.equal( selection.getFirstPosition().parent );
	} );

	it( 'should have no block filler in mutation', () => {
		viewRoot._appendChild( parse( '<container:p></container:p>' ) );

		view.forceRender();

		const domP = domEditor.childNodes[ 2 ];
		domP.removeChild( domP.childNodes[ 0 ] );
		domP.appendChild( document.createTextNode( 'foo' ) );

		mutationObserver.flush();

		expect( lastMutations.length ).to.equal( 1 );

		expect( lastMutations[ 0 ].newChildren.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].newChildren[ 0 ].data ).to.equal( 'foo' );

		expect( lastMutations[ 0 ].oldChildren.length ).to.equal( 0 );
	} );

	it( 'should ignore mutation with bogus br inserted on the end of the empty paragraph', () => {
		viewRoot._appendChild( parse( '<container:p></container:p>' ) );

		view.forceRender();

		const domP = domEditor.childNodes[ 2 ];
		domP.appendChild( document.createElement( 'br' ) );

		mutationObserver.flush();

		expect( lastMutations ).to.be.null;
	} );

	it( 'should ignore mutation with bogus br inserted on the end of the paragraph with text', () => {
		viewRoot._appendChild( parse( '<container:p>foo</container:p>' ) );

		view.forceRender();

		const domP = domEditor.childNodes[ 2 ];
		domP.appendChild( document.createElement( 'br' ) );

		mutationObserver.flush();

		expect( lastMutations ).to.be.null;
	} );

	it( 'should ignore mutation with bogus br inserted on the end of the paragraph while processing text mutations', () => {
		viewRoot._appendChild( parse( '<container:p>foo</container:p>' ) );

		view.forceRender();

		const domP = domEditor.childNodes[ 2 ];
		domP.childNodes[ 0 ].data = 'foo ';
		domP.appendChild( document.createElement( 'br' ) );

		mutationObserver.flush();

		expect( lastMutations.length ).to.equal( 1 );

		expect( lastMutations[ 0 ].oldText ).to.equal( 'foo' );
		expect( lastMutations[ 0 ].newText ).to.equal( 'foo ' );
	} );

	it( 'should ignore child mutations which resulted in no changes – when element contains elements', () => {
		viewRoot._appendChild( parse( '<container:p><container:x></container:x></container:p>' ) );

		view.forceRender();

		const domP = domEditor.childNodes[ 2 ];
		const domY = document.createElement( 'y' );
		domP.appendChild( domY );
		domY.remove();

		mutationObserver.flush();

		expect( lastMutations ).to.be.null;
	} );

	// This case is more tricky than the previous one because DOMConverter will return a different
	// instances of view text nodes every time it converts a DOM text node.
	it( 'should ignore child mutations which resulted in no changes – when element contains text nodes', () => {
		const domP = domEditor.childNodes[ 0 ];
		const domText = document.createTextNode( 'x' );
		domP.appendChild( domText );
		domText.remove();

		const domP2 = domEditor.childNodes[ 1 ];
		domP2.appendChild( document.createTextNode( 'x' ) );

		mutationObserver.flush();

		// There was only P2 change. P1 must be ignored.
		const viewP2 = viewRoot.getChild( 1 );
		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].node ).to.equal( viewP2 );
	} );

	it( 'should not ignore mutation with br inserted not on the end of the paragraph', () => {
		viewRoot._appendChild( parse( '<container:p>foo</container:p>' ) );

		view.forceRender();

		const domP = domEditor.childNodes[ 2 ];
		domP.insertBefore( document.createElement( 'br' ), domP.childNodes[ 0 ] );

		mutationObserver.flush();

		expect( lastMutations.length ).to.equal( 1 );

		expect( lastMutations[ 0 ].newChildren.length ).to.equal( 2 );
		expect( lastMutations[ 0 ].newChildren[ 0 ].name ).to.equal( 'br' );
		expect( lastMutations[ 0 ].newChildren[ 1 ].data ).to.equal( 'foo' );

		expect( lastMutations[ 0 ].oldChildren.length ).to.equal( 1 );
	} );

	it( 'should not ignore mutation inserting element different than br on the end of the empty paragraph', () => {
		viewRoot._appendChild( parse( '<container:p></container:p>' ) );

		view.forceRender();

		const domP = domEditor.childNodes[ 2 ];
		domP.appendChild( document.createElement( 'span' ) );

		mutationObserver.flush();

		expect( lastMutations.length ).to.equal( 1 );

		expect( lastMutations[ 0 ].newChildren.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].newChildren[ 0 ].name ).to.equal( 'span' );

		expect( lastMutations[ 0 ].oldChildren.length ).to.equal( 0 );
	} );

	it( 'should not ignore mutation inserting element different than br on the end of the paragraph with text', () => {
		viewRoot._appendChild( parse( '<container:p>foo</container:p>' ) );

		view.forceRender();

		const domP = domEditor.childNodes[ 2 ];
		domP.appendChild( document.createElement( 'span' ) );

		mutationObserver.flush();

		expect( lastMutations.length ).to.equal( 1 );

		expect( lastMutations[ 0 ].newChildren.length ).to.equal( 2 );
		expect( lastMutations[ 0 ].newChildren[ 0 ].data ).to.equal( 'foo' );
		expect( lastMutations[ 0 ].newChildren[ 1 ].name ).to.equal( 'span' );

		expect( lastMutations[ 0 ].oldChildren.length ).to.equal( 1 );
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
		} );

		it( 'should not collect text mutations from UIElement', () => {
			domEditor.childNodes[ 2 ].childNodes[ 0 ].data = 'foom';

			mutationObserver.flush();

			expect( lastMutations ).to.be.null;
		} );

		it( 'should not cause a render from UIElement', () => {
			domEditor.childNodes[ 2 ].childNodes[ 0 ].data = 'foom';

			mutationObserver.flush();

			expect( renderStub.callCount ).to.equal( 0 );
		} );

		it( 'should not collect child mutations from UIElement', () => {
			const span = document.createElement( 'span' );
			domEditor.childNodes[ 2 ].appendChild( span );

			mutationObserver.flush();

			expect( lastMutations ).to.be.null;
		} );

		it( 'should not cause a render when UIElement gets a child', () => {
			const span = document.createElement( 'span' );
			domEditor.childNodes[ 2 ].appendChild( span );

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
		} );

		it( 'should not collect text mutations from RawElement', () => {
			domEditor.childNodes[ 2 ].childNodes[ 0 ].data = 'foom';

			mutationObserver.flush();

			expect( lastMutations ).to.be.null;
		} );

		it( 'should not cause a render from RawElement', () => {
			domEditor.childNodes[ 2 ].childNodes[ 0 ].data = 'foom';

			mutationObserver.flush();

			expect( renderStub.callCount ).to.equal( 0 );
		} );

		it( 'should not collect child mutations from RawElement', () => {
			const span = document.createElement( 'span' );
			domEditor.childNodes[ 2 ].appendChild( span );

			mutationObserver.flush();

			expect( lastMutations ).to.be.null;
		} );

		it( 'should not cause a render when RawElement gets a child', () => {
			const span = document.createElement( 'span' );
			domEditor.childNodes[ 2 ].appendChild( span );

			mutationObserver.flush();

			expect( renderStub.callCount ).to.equal( 0 );
		} );
	} );

	function expectDomEditorNotToChange() {
		expect( domEditor.childNodes.length ).to.equal( 2 );
		expect( domEditor.childNodes[ 0 ].tagName ).to.equal( 'P' );
		expect( domEditor.childNodes[ 1 ].tagName ).to.equal( 'P' );

		expect( domEditor.childNodes[ 0 ].childNodes.length ).to.equal( 1 );
		expect( domEditor.childNodes[ 0 ].childNodes[ 0 ].data ).to.equal( 'foo' );

		expect( domEditor.childNodes[ 1 ].childNodes.length ).to.equal( 1 );
		expect( domEditor.childNodes[ 1 ].childNodes[ 0 ].data ).to.equal( 'bar' );
	}
} );
