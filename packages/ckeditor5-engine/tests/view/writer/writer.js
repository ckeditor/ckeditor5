/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Writer from '../../../src/view/writer';
import Document from '../../../src/view/document';
import EditableElement from '../../../src/view/editableelement';
import ViewPosition from '../../../src/view/position';
import ViewRange from '../../../src/view/range';
import createViewRoot from '../_utils/createroot';

describe( 'Writer', () => {
	let writer, attributes, root, doc;

	before( () => {
		attributes = { foo: 'bar', baz: 'quz' };
		doc = new Document();
		root = createViewRoot( doc );
		writer = new Writer( doc );
	} );

	describe( 'setSelection()', () => {
		it( 'should set document view selection', () => {
			const position = ViewPosition.createAt( root );
			writer.setSelection( position );

			const ranges = Array.from( doc.selection.getRanges() );

			expect( ranges.length ).to.equal( 1 );
			expect( ranges[ 0 ].start.compareWith( position ) ).to.equal( 'same' );
			expect( ranges[ 0 ].end.compareWith( position ) ).to.equal( 'same' );
		} );

		it( 'should be able to set fake selection', () => {
			const position = ViewPosition.createAt( root );
			writer.setSelection( position, { fake: true, label: 'foo' } );

			expect( doc.selection.isFake ).to.be.true;
			expect( doc.selection.fakeSelectionLabel ).to.equal( 'foo' );
		} );
	} );

	describe( 'setSelectionFocus()', () => {
		it( 'should use selection._setFocus method internally', () => {
			const spy = sinon.spy( writer.document.selection, '_setFocus' );
			writer.setSelectionFocus( root, 0 );

			sinon.assert.calledWithExactly( spy, root, 0 );
			spy.restore();
		} );
	} );

	describe( 'createText()', () => {
		it( 'should create Text instance', () => {
			const text = writer.createText( 'foo bar' );

			expect( text.is( 'text' ) ).to.be.true;
			expect( text.data ).to.equal( 'foo bar' );
		} );
	} );

	describe( 'createAttributeElement()', () => {
		it( 'should create AttributeElement', () => {
			const element = writer.createAttributeElement( 'foo', attributes );

			expect( element.is( 'attributeElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'foo' );
			assertElementAttributes( element, attributes );
		} );

		it( 'should allow to pass additional options', () => {
			const element = writer.createAttributeElement( 'foo', attributes, { priority: 99, id: 'bar' } );

			expect( element.is( 'attributeElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'foo' );
			expect( element.priority ).to.equal( 99 );
			expect( element.id ).to.equal( 'bar' );
			assertElementAttributes( element, attributes );
		} );
	} );

	describe( 'createContainerElement()', () => {
		it( 'should create ContainerElement', () => {
			const element = writer.createContainerElement( 'foo', attributes );

			expect( element.is( 'containerElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'foo' );
			assertElementAttributes( element, attributes );
		} );
	} );

	describe( 'createEditableElement()', () => {
		it( 'should create EditableElement', () => {
			const element = writer.createEditableElement( 'foo', attributes );

			expect( element ).to.be.instanceOf( EditableElement );
			expect( element.name ).to.equal( 'foo' );
			assertElementAttributes( element, attributes );
		} );
	} );

	describe( 'createEmptyElement()', () => {
		it( 'should create EmptyElement', () => {
			const element = writer.createEmptyElement( 'foo', attributes );

			expect( element.is( 'emptyElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'foo' );
			assertElementAttributes( element, attributes );
		} );
	} );

	describe( 'createUIElement()', () => {
		it( 'should create UIElement', () => {
			const element = writer.createUIElement( 'foo', attributes );

			expect( element.is( 'uiElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'foo' );
			assertElementAttributes( element, attributes );
		} );

		it( 'should allow to pass custom rendering method', () => {
			const renderFn = function() {};
			const element = writer.createUIElement( 'foo', attributes, renderFn );

			expect( element.is( 'uiElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'foo' );
			expect( element.render ).to.equal( renderFn );
			assertElementAttributes( element, attributes );
		} );
	} );

	describe( 'setTextData()', () => {
		it( 'should update the content for text node', () => {
			const textNode = writer.createText( 'foo' );

			writer.setTextData( 'bar', textNode );

			expect( textNode.data ).to.equal( 'bar' );
		} );
	} );

	describe( 'setAttribute()', () => {
		it( 'should set attribute on given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.setAttribute( 'foo', 'bar', element );

			expect( element.getAttribute( 'foo' ) ).to.equal( 'bar' );
		} );
	} );

	describe( 'removeAttribute()', () => {
		it( 'should remove attribute on given element', () => {
			const element = writer.createAttributeElement( 'span', { foo: 'bar' } );

			writer.removeAttribute( 'foo', element );

			expect( element.getAttribute( 'foo' ) ).to.be.undefined;
		} );
	} );

	describe( 'addClass()', () => {
		it( 'should add class to given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.addClass( 'foo', element );

			expect( element.hasClass( 'foo' ) ).to.be.true;
		} );

		it( 'should add multiple classes to given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.addClass( [ 'foo', 'bar' ], element );

			expect( element.hasClass( 'foo' ) ).to.be.true;
			expect( element.hasClass( 'bar' ) ).to.be.true;
		} );
	} );

	describe( 'removeClass()', () => {
		it( 'should remove class from given element', () => {
			const element = writer.createAttributeElement( 'span', { class: 'foo bar' } );

			writer.removeClass( 'foo', element );

			expect( element.hasClass( 'foo' ) ).to.be.false;
			expect( element.hasClass( 'bar' ) ).to.be.true;
		} );

		it( 'should remove multiple classes from given element', () => {
			const element = writer.createAttributeElement( 'span', { class: 'foo bar' } );

			writer.removeClass( [ 'foo', 'bar' ], element );

			expect( element.hasClass( 'foo' ) ).to.be.false;
			expect( element.hasClass( 'bar' ) ).to.be.false;
		} );
	} );

	describe( 'addStyle()', () => {
		it( 'should add style to given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.setStyle( 'foo', 'bar', element );

			expect( element.getStyle( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should allow to add multiple styles to given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.setStyle( {
				foo: 'bar',
				baz: 'quiz'
			}, element );

			expect( element.getStyle( 'foo' ) ).to.equal( 'bar' );
			expect( element.getStyle( 'baz' ) ).to.equal( 'quiz' );
		} );
	} );

	describe( 'removeStyle()', () => {
		it( 'should remove style from given element', () => {
			const element = writer.createAttributeElement( 'span', { style: 'foo:bar;baz:quiz;' } );

			writer.removeStyle( 'foo', element );

			expect( element.hasStyle( 'foo' ) ).to.be.false;
			expect( element.hasStyle( 'baz' ) ).to.be.true;
		} );

		it( 'should remove multiple styles from given element', () => {
			const element = writer.createAttributeElement( 'span', { style: 'foo:bar;baz:quiz;' } );

			writer.removeStyle( [ 'foo', 'bar' ], element );

			expect( element.hasStyle( 'foo' ) ).to.be.false;
			expect( element.hasStyle( 'baz' ) ).to.be.true;
		} );
	} );

	describe( 'setCustomProperty()', () => {
		it( 'should set custom property to given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.setCustomProperty( 'foo', 'bar', element );

			expect( element.getCustomProperty( 'foo' ) ).to.equal( 'bar' );
		} );
	} );

	describe( 'removeCustomProperty()', () => {
		it( 'should remove custom property from given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.setCustomProperty( 'foo', 'bar', element );
			expect( element.getCustomProperty( 'foo' ) ).to.equal( 'bar' );

			writer.removeCustomProperty( 'foo', element );
			expect( element.getCustomProperty( 'foo' ) ).to.be.undefined;
		} );
	} );

	describe( 'getAllBrokenSiblings()', () => {
		it( 'should return all clones of a broken attribute element', () => {
			const container = writer.createContainerElement( 'div' );
			const text = writer.createText( 'abccccde' );

			writer.insert( ViewPosition.createAt( container, 0 ), text );

			const span = writer.createAttributeElement( 'span' );
			span._priority = 20;

			// <div>ab<span>cccc</span>de</div>
			writer.wrap( ViewRange.createFromParentsAndOffsets( text, 2, text, 6 ), span );

			const i = writer.createAttributeElement( 'i' );

			// <div>a<i>b<span>c</span></i><span>cc</span>de</div>
			writer.wrap(
				ViewRange.createFromParentsAndOffsets(
					container.getChild( 0 ), 1,
					container.getChild( 1 ).getChild( 0 ), 1
				),
				i
			);

			// <div>a<i>b<span>c</span></i><span>c</span><i><span>c</span>d</i>e</div>
			writer.wrap(
				ViewRange.createFromParentsAndOffsets(
					container.getChild( 2 ).getChild( 0 ), 1,
					container.getChild( 3 ), 1
				),
				i
			);

			// Find all spans.
			const allSpans = Array.from( ViewRange.createIn( container ).getItems() ).filter( element => element.is( 'span' ) );

			// For each of the spans created above...
			for ( const oneOfAllSpans of allSpans ) {
				// Find all broken siblings of that span...
				const brokenArray = writer.getAllBrokenSiblings( oneOfAllSpans );

				// Convert to set because we don't care about order.
				const brokenSet = new Set( brokenArray );

				// Check if all spans are included.
				for ( const s of allSpans ) {
					expect( brokenSet.has( s ) ).to.be.true;
				}

				expect( brokenArray.length ).to.equal( allSpans.length );
			}
		} );
	} );

	function assertElementAttributes( element, attributes ) {
		for ( const key of Object.keys( attributes ) ) {
			if ( element.getAttribute( key ) !== attributes[ key ] ) {
				throw new Error( 'Attributes in element are different that those passed to the constructor method.' );
			}
		}
	}
} );
