/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import View from '../../../src/view/view';
import UIElement from '../../../src/view/uielement';
import ViewContainerElement from '../../../src/view/containerelement';
import ViewAttribtueElement from '../../../src/view/attributeelement';
import ViewText from '../../../src/view/text';
import ViewRange from '../../../src/view/range';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';
import createViewRoot from '../_utils/createroot';
import { setData as setViewData } from '../../../src/dev-utils/view';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'View', () => {
	let view, viewDocument, domRoot, domSelection, viewRoot, foo, bar, ui, ui2;

	function createUIElement( name, contents ) {
		const element = new UIElement( viewDocument, name );

		element.render = function( domDocument ) {
			const domElement = this.toDomElement( domDocument );
			domElement.innerText = contents;

			return domElement;
		};

		return element;
	}

	beforeEach( () => {
		domRoot = createElement( document, 'div', {
			contenteditable: 'true'
		} );
		document.body.appendChild( domRoot );

		view = new View();
		viewDocument = view.document;
		viewRoot = createViewRoot( viewDocument );
		view.attachDomRoot( domRoot );

		domSelection = document.getSelection();
		domSelection.removeAllRanges();

		viewDocument.isFocused = true;

		foo = new ViewText( viewDocument, 'foo' );
		bar = new ViewText( viewDocument, 'bar' );
		ui = createUIElement( 'span', 'xxx' );
		ui2 = createUIElement( 'span', 'yyy' );
	} );

	afterEach( () => {
		view.destroy();

		domRoot.parentElement.removeChild( domRoot );
	} );

	function renderAndFireKeydownEvent( options ) {
		view.forceRender();

		const eventData = Object.assign( { keyCode: keyCodes.arrowright, domTarget: view.domRoots.get( 'main' ) }, options );
		viewDocument.fire( 'keydown', eventData );
	}

	function check( anchorNode, anchorOffset, focusNode, focusOffset ) {
		const anchor = domSelection.anchorNode.data ? domSelection.anchorNode.data : domSelection.anchorNode.nodeName.toUpperCase();

		expect( anchor, 'anchorNode' ).to.equal( anchorNode );
		expect( domSelection.anchorOffset, 'anchorOffset' ).to.equal( anchorOffset );

		if ( focusNode ) {
			const focus = domSelection.focusNode.data ? domSelection.focusNode.data : domSelection.focusNode.nodeName.toUpperCase();

			expect( focus, 'focusNode' ).to.equal( focusNode );
			expect( domSelection.focusOffset, 'focusOffset' ).to.equal( focusOffset );
		} else {
			expect( domSelection.isCollapsed, 'isCollapsed' ).to.be.true;
		}
	}

	describe( 'jump over ui element handler', () => {
		describe( 'collapsed selection', () => {
			it( 'do nothing when another key is pressed', () => {
				// <container:p>foo<ui:span>xxx</ui:span>{}bar</container:p>
				const p = new ViewContainerElement( viewDocument, 'p', null, [ foo, ui, bar ] );
				viewRoot._appendChild( p );

				view.change( writer => {
					writer.setSelection( [ ViewRange._createFromParentsAndOffsets( bar, 0, bar, 0 ) ] );
				} );

				renderAndFireKeydownEvent( { keyCode: keyCodes.arrowleft } );

				testUtils.checkAssertions(
					() => check( 'bar', 0 ),
					// Safari renders selection at the end of the text node.
					() => check( 'xxx', 3 )
				);
			} );

			it( 'jump over ui element when right arrow is pressed before ui element - directly before ui element', () => {
				// <container:p>foo[]<ui:span>xxx</ui:span>bar</container:p>
				const p = new ViewContainerElement( viewDocument, 'p', null, [ foo, ui, bar ] );
				viewRoot._appendChild( p );

				view.change( writer => {
					writer.setSelection( [ ViewRange._createFromParentsAndOffsets( p, 1, p, 1 ) ] );
				} );

				renderAndFireKeydownEvent();

				testUtils.checkAssertions(
					// <p>foo<span>xxx</span>[]bar</p>
					() => check( 'P', 2 ),
					// Safari renders selection at the end of the text node.
					// <p>foo<span>xxx{}</span>bar</p>
					() => check( 'xxx', 3 )
				);
			} );

			it( 'jump over ui element when right arrow is pressed before ui element - not directly before ui element', () => {
				// <container:p>foo{}<ui:span>xxx</ui:span>bar</container:p>
				const p = new ViewContainerElement( viewDocument, 'p', null, [ foo, ui, bar ] );
				viewRoot._appendChild( p );

				view.change( writer => {
					writer.setSelection( [ ViewRange._createFromParentsAndOffsets( foo, 3, foo, 3 ) ] );
				} );

				renderAndFireKeydownEvent();

				testUtils.checkAssertions(
					// <p>foo<span>xxx</span>[]bar</p>
					() => check( 'P', 2 ),
					// Safari renders selection at the end of the text node.
					// <p>foo<span>xxx{}</span>bar</p>
					() => check( 'xxx', 3 )
				);
			} );

			it( 'jump over multiple ui elements when right arrow is pressed before ui element', () => {
				// <container:p>foo{}<ui:span>xxx</ui:span><ui:span>yyy</ui:span>bar</container:p>'
				const p = new ViewContainerElement( viewDocument, 'p', null, [ foo, ui, ui2, bar ] );
				viewRoot._appendChild( p );

				view.change( writer => {
					writer.setSelection( [ ViewRange._createFromParentsAndOffsets( foo, 3, foo, 3 ) ] );
				} );

				renderAndFireKeydownEvent();

				testUtils.checkAssertions(
					// <p>foo<span>xxx</span><span>yyy</span>[]bar</p>
					() => check( 'P', 3 ),
					// Safari renders selection at the end of the text node.
					// <p>foo<span>xxx</span><span>yyy{}</span>bar</p>
					() => check( 'yyy', 3 )
				);
			} );

			it( 'jump over ui elements at the end of container element', () => {
				// <container:p>foo{}<ui:span>xxx</ui:span><ui:span>yyy</ui:span></container:p><container:div></container:div>
				const p = new ViewContainerElement( viewDocument, 'p', null, [ foo, ui, ui2 ] );
				const div = new ViewContainerElement( viewDocument, 'div' );

				view.change( writer => {
					viewRoot._appendChild( p );
					viewRoot._appendChild( div );
					writer.setSelection( [ ViewRange._createFromParentsAndOffsets( foo, 3, foo, 3 ) ] );
				} );

				renderAndFireKeydownEvent();

				testUtils.checkAssertions(
					// <p>foo<span>xxx</span><span>yyy</span>[]</p><div></div>
					() => check( 'P', 3 ),
					// Safari renders selection at the end of the text node.
					// <p>foo<span>xxx</span><span>yyy{}</span></p><div></div>
					() => check( 'yyy', 3 )
				);
			} );

			it( 'jump over ui element if selection is in attribute element - case 1', () => {
				// <container:p><attribute:b>foo{}</attribute:b><ui:span>xxx</ui:span>bar</container:p>
				const b = new ViewAttribtueElement( viewDocument, 'b', null, foo );
				const p = new ViewContainerElement( viewDocument, 'p', null, [ b, ui, bar ] );
				viewRoot._appendChild( p );

				view.change( writer => {
					writer.setSelection( ViewRange._createFromParentsAndOffsets( foo, 3, foo, 3 ) );
				} );

				renderAndFireKeydownEvent();

				testUtils.checkAssertions(
					// <p><b>foo</b><span>xxx</span>[]bar</p>
					() => check( 'P', 2 ),
					// Safari renders selection at the end of the text node.
					// <p><b>foo</b><span>xxx{}</span>bar</p>
					() => check( 'xxx', 3 )
				);
			} );

			it( 'jump over ui element if selection is in attribute element - case 2', () => {
				// <container:p><attribute:b>foo[]</attribute:b><ui:span>xxx</ui:span>bar</container:p>
				const b = new ViewAttribtueElement( viewDocument, 'b', null, foo );
				const p = new ViewContainerElement( viewDocument, 'p', null, [ b, ui, bar ] );
				viewRoot._appendChild( p );

				view.change( writer => {
					writer.setSelection( ViewRange._createFromParentsAndOffsets( b, 1, b, 1 ) );
				} );

				renderAndFireKeydownEvent();

				testUtils.checkAssertions(
					// <p><b>foo</b><span>xxx</span>[]bar</p>
					() => check( 'P', 2 ),
					// Safari renders selection at the end of the text node.
					// <p><b>foo</b><span>xxx{}</span>bar</p>
					() => check( 'xxx', 3 )
				);
			} );

			it( 'jump over ui element if selection is in multiple attribute elements', () => {
				// <container:p>
				// 		<attribute:i>
				// 			<attribute:b>foo{}</attribute:b>
				// 		</attribute:i>
				// 		<ui:span>
				//			xxx
				// 		</ui:span>
				// 		bar
				// </container:p>
				const b = new ViewAttribtueElement( viewDocument, 'b', null, foo );
				const i = new ViewAttribtueElement( viewDocument, 'i', null, b );
				const p = new ViewContainerElement( viewDocument, 'p', null, [ i, ui, bar ] );

				viewRoot._appendChild( p );

				view.change( writer => {
					writer.setSelection( ViewRange._createFromParentsAndOffsets( foo, 3, foo, 3 ) );
				} );

				renderAndFireKeydownEvent();

				testUtils.checkAssertions(
					// <p><i><b>foo</b></i><span>xxx</span>[]bar</p>
					() => check( 'P', 2 ),
					// Safari renders selection at the end of the text node.
					// <p><i><b>foo</b></i><span>xxx{}</span>bar</p>
					() => check( 'xxx', 3 )
				);
			} );

			it( 'jump over empty attribute elements and ui elements', () => {
				// <container:p>' +
				// 		foo{}
				// 		<attribute:b></attribute:b>
				// 		<ui:span>xxx</ui:span>
				// 		<ui:span>yyy</ui:span>
				// 		<attribute:b></attribute:b>
				// 		bar
				// </container:p>
				const b1 = new ViewAttribtueElement( viewDocument, 'b' );
				const b2 = new ViewAttribtueElement( viewDocument, 'b' );
				const p = new ViewContainerElement( viewDocument, 'p', null, [ foo, b1, ui, ui2, b2, bar ] );

				viewRoot._appendChild( p );

				view.change( writer => {
					writer.setSelection( ViewRange._createFromParentsAndOffsets( foo, 3, foo, 3 ) );
				} );

				renderAndFireKeydownEvent();

				testUtils.checkAssertions(
					// <p>foo<b></b><span>xxx</span><span>yyy</span>[]bar</p>
					() => check( 'P', 5 ),
					// Safari renders selection at the end of the text node.
					// <p>foo<b></b><span>xxx</span><span>yyy{}</span>bar</p>
					() => check( 'yyy', 3 )
				);
			} );

			it( 'jump over empty attribute elements and ui elements if shift key is pressed', () => {
				// <container:p>
				// 		foo{}
				// 		<attribute:b></attribute:b>
				// 		<ui:span>xxx</ui:span>
				// 		<ui:span>yyy</ui:span>
				// 		<attribute:b></attribute:b>
				// 		bar
				// </container:p>

				const b1 = new ViewAttribtueElement( viewDocument, 'b' );
				const b2 = new ViewAttribtueElement( viewDocument, 'b' );
				const p = new ViewContainerElement( viewDocument, 'p', null, [ foo, b1, ui, ui2, b2, bar ] );

				viewRoot._appendChild( p );

				view.change( writer => {
					writer.setSelection( ViewRange._createFromParentsAndOffsets( foo, 3, foo, 3 ) );
				} );

				renderAndFireKeydownEvent( { shiftKey: true } );

				testUtils.checkAssertions(
					// <p>foo<b></b><span>xxx</span><span>yyy</span><b><b>[]bar</p>
					() => check( 'P', 5 ),
					// Safari renders selection at the end of the text node.
					// <p>foo<b></b><span>xxx</span><span>yyy{}</span><b><b>bar</p>
					() => check( 'yyy', 3 )
				);
			} );

			it( 'do nothing if selection is not directly before ui element', () => {
				setViewData( view, '<container:p>fo{}o<ui:span></ui:span>bar</container:p>' );
				renderAndFireKeydownEvent();

				check( 'foo', 2 );
			} );

			it( 'do nothing if selection is in attribute element but not before ui element', () => {
				setViewData( view, '<container:p><attribute:b>foo{}</attribute:b>bar</container:p>' );
				renderAndFireKeydownEvent();

				check( 'foo', 3 );
			} );

			it( 'do nothing if selection is before non-empty attribute element', () => {
				setViewData( view, '<container:p>fo{}<attribute:b>o</attribute:b><ui:span></ui:span>bar</container:p>' );
				renderAndFireKeydownEvent();

				check( 'fo', 2 );
			} );

			it( 'do nothing if selection is before container element - case 1', () => {
				setViewData( view, '<container:p>foo{}</container:p><ui:span></ui:span><container:div>bar</container:div>' );
				renderAndFireKeydownEvent();

				check( 'foo', 3 );
			} );

			it( 'do nothing if selection is before container element - case 2', () => {
				setViewData( view, '<container:div>foo{}<container:p></container:p><ui:span></ui:span></container:div>' );
				renderAndFireKeydownEvent();

				check( 'foo', 3 );
			} );

			it( 'do nothing if selection is at the end of last container element', () => {
				setViewData( view, '<container:p>foo{}</container:p>' );
				renderAndFireKeydownEvent();

				check( 'foo', 3 );
			} );
		} );

		describe( 'non-collapsed selection', () => {
			it( 'should do nothing', () => {
				setViewData( view, '<container:p>f{oo}<ui:span></ui:span>bar</container:p>' );
				renderAndFireKeydownEvent();

				check( 'foo', 1, 'foo', 3 );
			} );

			it( 'should do nothing if selection is not before ui element - shift key pressed', () => {
				setViewData( view, '<container:p>f{o}o<ui:span></ui:span>bar</container:p>' );
				renderAndFireKeydownEvent( { shiftKey: true } );

				check( 'foo', 1, 'foo', 2 );
			} );

			it( 'jump over ui element if shift key is pressed', () => {
				// <container:p>fo{o}<ui:span>xxx</ui:span>bar</container:p>
				const p = new ViewContainerElement( viewDocument, 'p', null, [ foo, ui, bar ] );

				viewRoot._appendChild( p );

				view.change( writer => {
					writer.setSelection( ViewRange._createFromParentsAndOffsets( foo, 2, foo, 3 ) );
				} );

				renderAndFireKeydownEvent( { shiftKey: true } );

				testUtils.checkAssertions(
					// <p>fo{o<span>xxx</span>]bar</p>
					() => check( 'foo', 2, 'P', 2 ),
					// Safari renders selection at the end of the previous text node.
					// <p>fo{o<span>xxx}</span>bar</p>
					() => check( 'foo', 2, 'xxx', 3 )
				);
			} );

			it( 'jump over ui element if selection is in multiple attribute elements', () => {
				// <container:p>
				// 		<attribute:i>
				// 			<attribute:b>fo{o}</attribute:b>
				// 		</attribute:i>
				// 		<ui:span>xxx</ui:span>
				// 		bar
				// </container:p>
				const b = new ViewAttribtueElement( viewDocument, 'b', null, foo );
				const i = new ViewAttribtueElement( viewDocument, 'i', null, b );
				const p = new ViewContainerElement( viewDocument, 'p', null, [ i, ui, bar ] );
				viewRoot._appendChild( p );

				view.change( writer => {
					writer.setSelection( ViewRange._createFromParentsAndOffsets( foo, 2, foo, 3 ) );
				} );

				renderAndFireKeydownEvent( { shiftKey: true } );

				testUtils.checkAssertions(
					// <p><i><b>fo{o</b></i><span>xxx</span>]bar</p>
					() => check( 'foo', 2, 'P', 2 ),
					// Safari renders selection at the end of the previous text node.
					// <p><i><b>fo{o</b></i><span>xxx}</span>bar</p>
					() => check( 'foo', 2, 'xxx', 3 )
				);
			} );

			it( 'jump over empty attribute elements and ui elements if shift key is pressed', () => {
				// <container:p>
				// 		fo{o}
				// 		<attribute:b></attribute:b>
				// 		<ui:span>xxx</ui:span>
				// 		<ui:span>yyy</ui:span>
				// 		<attribute:b></attribute:b>
				// 		bar
				// </container:p>
				const b1 = new ViewAttribtueElement( viewDocument, 'b' );
				const b2 = new ViewAttribtueElement( viewDocument, 'b' );
				const p = new ViewContainerElement( viewDocument, 'p', null, [ foo, b1, ui, ui2, b2, bar ] );
				viewRoot._appendChild( p );

				view.change( writer => {
					writer.setSelection( ViewRange._createFromParentsAndOffsets( foo, 2, foo, 3 ) );
				} );

				renderAndFireKeydownEvent( { shiftKey: true } );

				testUtils.checkAssertions(
					// <p>fo{o<b></b><span>xxx</span><span>yyy</span><b></b>]bar</p>
					() => check( 'foo', 2, 'P', 5 ),
					// Safari renders selection at the end of the previous text node.
					// <p>fo{o<b></b><span>xxx</span><span>yyy}</span><b></b>bar</p>
					() => check( 'foo', 2, 'yyy', 3 )
				);
			} );
		} );

		it( 'should do nothing if DOM position cannot be converted to view position', () => {
			const newDiv = document.createElement( 'div' );
			const domSelection = document.getSelection();

			document.body.appendChild( newDiv );
			domSelection.collapse( newDiv, 0 );

			viewDocument.fire( 'keydown', { keyCode: keyCodes.arrowright, domTarget: view.domRoots.get( 'main' ) } );

			newDiv.remove();
		} );
	} );
} );
