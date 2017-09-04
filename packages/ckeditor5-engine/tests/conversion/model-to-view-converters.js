/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelDocument from '../../src/model/document';
import ModelElement from '../../src/model/element';
import ModelText from '../../src/model/text';
import ModelRange from '../../src/model/range';
import ModelPosition from '../../src/model/position';
import modelWriter from '../../src/model/writer';

import ViewElement from '../../src/view/element';
import ViewContainerElement from '../../src/view/containerelement';
import ViewAttributeElement from '../../src/view/attributeelement';
import ViewUIElement from '../../src/view/uielement';
import ViewText from '../../src/view/text';

import Mapper from '../../src/conversion/mapper';
import ModelConversionDispatcher from '../../src/conversion/modelconversiondispatcher';
import {
	insertElement,
	insertText,
	insertUIElement,
	setAttribute,
	removeAttribute,
	wrapItem,
	unwrapItem,
	remove,
	removeUIElement,
	highlightText,
	highlightElement,
	createViewElementFromHighlightDescriptor
} from '../../src/conversion/model-to-view-converters';

import { createRangeOnElementOnly } from '../../tests/model/_utils/utils';

describe( 'model-to-view-converters', () => {
	let dispatcher, modelDoc, modelRoot, mapper, viewRoot;

	beforeEach( () => {
		modelDoc = new ModelDocument();
		modelRoot = modelDoc.createRoot();
		viewRoot = new ViewContainerElement( 'div' );

		mapper = new Mapper();
		mapper.bindElements( modelRoot, viewRoot );

		dispatcher = new ModelConversionDispatcher( modelDoc, { mapper } );
	} );

	function viewAttributesToString( item ) {
		let result = '';

		for ( const key of item.getAttributeKeys() ) {
			const value = item.getAttribute( key );

			if ( value ) {
				result += ' ' + key + '="' + value + '"';
			}
		}

		return result;
	}

	function viewToString( item ) {
		let result = '';

		if ( item instanceof ViewText ) {
			result = item.data;
		} else {
			// ViewElement or ViewDocumentFragment.
			for ( const child of item.getChildren() ) {
				result += viewToString( child );
			}

			if ( item instanceof ViewElement ) {
				result = '<' + item.name + viewAttributesToString( item ) + '>' + result + '</' + item.name + '>';
			}
		}

		return result;
	}

	describe( 'highlightText()', () => {
		let modelElement1, modelElement2, markerRange;
		const highlightDescriptor = {
			class: 'highlight-class',
			priority: 7,
			attributes: { title: 'title' }
		};

		beforeEach( () => {
			const modelText1 = new ModelText( 'foo' );
			modelElement1 = new ModelElement( 'paragraph', null, modelText1 );
			const modelText2 = new ModelText( 'bar' );
			modelElement2 = new ModelElement( 'paragraph', null, modelText2 );

			modelRoot.appendChildren( modelElement1 );
			modelRoot.appendChildren( modelElement2 );
			dispatcher.on( 'insert:paragraph', insertElement( () => new ViewContainerElement( 'p' ) ) );
			dispatcher.on( 'insert:$text', insertText() );

			markerRange = ModelRange.createIn( modelRoot );
		} );

		it( 'should wrap and unwrap text nodes', () => {
			dispatcher.on( 'addMarker:marker', highlightText( highlightDescriptor ) );
			dispatcher.on( 'removeMarker:marker', highlightText( highlightDescriptor ) );
			dispatcher.convertInsertion( markerRange );

			modelDoc.markers.set( 'marker', markerRange );
			dispatcher.convertMarker( 'addMarker', 'marker', markerRange );

			expect( viewToString( viewRoot ) ).to.equal(
				'<div>' +
					'<p>' +
						'<span class="highlight-class" title="title">foo</span>' +
					'</p>' +
					'<p>' +
						'<span class="highlight-class" title="title">bar</span>' +
					'</p>' +
				'</div>'
			);

			dispatcher.convertMarker( 'removeMarker', 'marker', markerRange );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );
		} );

		it( 'should not convert marker on elements already consumed', () => {
			const newDescriptor = { class: 'override-class' };

			dispatcher.on( 'addMarker:marker', highlightText( highlightDescriptor ) );
			dispatcher.on( 'addMarker:marker', highlightText( newDescriptor ), { priority: 'high' } );
			dispatcher.on( 'removeMarker:marker', highlightText( highlightDescriptor ) );
			dispatcher.on( 'removeMarker:marker', highlightText( newDescriptor ), { priority: 'high' } );
			dispatcher.convertInsertion( markerRange );

			modelDoc.markers.set( 'marker', markerRange );
			dispatcher.convertMarker( 'addMarker', 'marker', markerRange );

			expect( viewToString( viewRoot ) ).to.equal(
				'<div>' +
					'<p>' +
						'<span class="override-class">foo</span>' +
					'</p>' +
					'<p>' +
						'<span class="override-class">bar</span>' +
					'</p>' +
				'</div>'
			);

			dispatcher.convertMarker( 'removeMarker', 'marker', markerRange );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );
		} );

		it( 'should do nothing if descriptor is not provided', () => {
			dispatcher.on( 'addMarker:marker', highlightText( () => null ) );
			dispatcher.on( 'removeMarker:marker', highlightText( () => null ) );

			dispatcher.convertInsertion( markerRange );

			modelDoc.markers.set( 'marker', markerRange );
			dispatcher.convertMarker( 'addMarker', 'marker', markerRange );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );
			dispatcher.convertMarker( 'removeMarker', 'marker', markerRange );
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );
		} );
	} );

	describe( 'highlightElement()', () => {
		let modelElement1, modelElement2, markerRange;
		const highlightDescriptor = {
			class: 'highlight-class',
			priority: 7,
			attributes: { title: 'title' },
			id: 'customId'
		};

		beforeEach( () => {
			const modelText1 = new ModelText( 'foo' );
			modelElement1 = new ModelElement( 'paragraph', null, modelText1 );
			const modelText2 = new ModelText( 'bar' );
			modelElement2 = new ModelElement( 'paragraph', null, modelText2 );

			modelRoot.appendChildren( modelElement1 );
			modelRoot.appendChildren( modelElement2 );
			dispatcher.on( 'insert:paragraph', insertElement( () => new ViewContainerElement( 'p' ) ) );
			dispatcher.on( 'insert:$text', insertText() );

			markerRange = ModelRange.createIn( modelRoot );
		} );

		it( 'should use addHighlight and removeHighlight on elements and not convert children nodes', () => {
			dispatcher.on( 'addMarker:marker', highlightElement( highlightDescriptor ) );
			dispatcher.on( 'removeMarker:marker', highlightElement( highlightDescriptor ) );
			dispatcher.on( 'insert:paragraph', insertElement( data => {
				// Use special converter only for first paragraph.
				if ( data.item == modelElement2 ) {
					return;
				}

				const viewContainer = new ViewContainerElement( 'p' );

				viewContainer.setCustomProperty( 'addHighlight', ( element, descriptor ) => {
					element.addClass( 'highlight-own-class' );

					expect( descriptor ).to.equal( highlightDescriptor );
				} );

				viewContainer.setCustomProperty( 'removeHighlight', ( element, descriptor ) => {
					element.removeClass( 'highlight-own-class' );

					expect( descriptor ).to.equal( highlightDescriptor );
				} );

				return viewContainer;
			} ), { priority: 'high' } );

			dispatcher.convertInsertion( markerRange );
			modelDoc.markers.set( 'marker', markerRange );
			dispatcher.convertMarker( 'addMarker', 'marker', markerRange );

			expect( viewToString( viewRoot ) ).to.equal(
				'<div>' +
					'<p class="highlight-own-class">' +
						'foo' +
					'</p>' +
					'<p>' +
						'bar' +
					'</p>' +
				'</div>'
			);

			dispatcher.convertMarker( 'removeMarker', 'marker', markerRange );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );
		} );

		it( 'should not convert marker on elements already consumed', () => {
			const newDescriptor = { class: 'override-class' };

			dispatcher.on( 'addMarker:marker', highlightElement( highlightDescriptor ) );
			dispatcher.on( 'removeMarker:marker', highlightElement( highlightDescriptor ) );

			dispatcher.on( 'addMarker:marker', highlightElement( newDescriptor ), { priority: 'high' } );
			dispatcher.on( 'removeMarker:marker', highlightElement( newDescriptor ), { priority: 'high' } );

			dispatcher.on( 'insert:paragraph', insertElement( () => {
				const element = new ViewContainerElement( 'p' );
				element.setCustomProperty( 'addHighlight', ( element, data ) => element.addClass( data.class ) );
				element.setCustomProperty( 'removeHighlight', ( element, data ) => element.removeClass( data.class ) );

				return element;
			} ), { priority: 'high' } );

			dispatcher.convertInsertion( markerRange );
			modelDoc.markers.set( 'marker', markerRange );
			dispatcher.convertMarker( 'addMarker', 'marker', markerRange );

			expect( viewToString( viewRoot ) ).to.equal(
				'<div>' +
					'<p class="override-class">' +
						'foo' +
					'</p>' +
					'<p class="override-class">' +
						'bar' +
					'</p>' +
				'</div>'
			);

			dispatcher.convertMarker( 'removeMarker', 'marker', markerRange );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );
		} );

		it( 'should use provide default priority and id if not provided', () => {
			const highlightDescriptor = { class: 'highlight-class' };

			dispatcher.on( 'addMarker:marker', highlightElement( highlightDescriptor ) );
			dispatcher.on( 'removeMarker:marker', highlightElement( highlightDescriptor ) );
			dispatcher.on( 'insert:paragraph', insertElement( data => {
				// Use special converter only for first paragraph.
				if ( data.item == modelElement2 ) {
					return;
				}

				const viewContainer = new ViewContainerElement( 'p' );

				viewContainer.setCustomProperty( 'addHighlight', ( element, descriptor ) => {
					expect( descriptor.priority ).to.equal( 10 );
					expect( descriptor.id ).to.equal( 'marker:foo-bar-baz' );
				} );

				viewContainer.setCustomProperty( 'removeHighlight', ( element, descriptor ) => {
					expect( descriptor.priority ).to.equal( 10 );
					expect( descriptor.id ).to.equal( 'marker:foo-bar-baz' );
				} );

				return viewContainer;
			} ), { priority: 'high' } );

			dispatcher.convertInsertion( markerRange );
			modelDoc.markers.set( 'marker', markerRange );
			dispatcher.convertMarker( 'addMarker', 'marker:foo-bar-baz', markerRange );
		} );

		it( 'should do nothing if descriptor is not provided', () => {
			dispatcher.on( 'addMarker:marker', highlightElement( () => null ) );
			dispatcher.on( 'removeMarker:marker', highlightElement( () => null ) );

			dispatcher.convertInsertion( markerRange );

			modelDoc.markers.set( 'marker', markerRange );
			dispatcher.convertMarker( 'addMarker', 'marker', markerRange );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );
			dispatcher.convertMarker( 'removeMarker', 'marker', markerRange );
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo</p><p>bar</p></div>' );
		} );
	} );

	describe( 'insertText', () => {
		it( 'should convert text insertion in model to view text', () => {
			modelRoot.appendChildren( new ModelText( 'foobar' ) );
			dispatcher.on( 'insert:$text', insertText() );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div>foobar</div>' );
		} );

		it( 'should support unicode', () => {
			modelRoot.appendChildren( new ModelText( 'நிலைக்கு' ) );
			dispatcher.on( 'insert:$text', insertText() );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div>நிலைக்கு</div>' );
		} );

		it( 'should be possible to override it', () => {
			modelRoot.appendChildren( new ModelText( 'foobar' ) );
			dispatcher.on( 'insert:$text', insertText() );
			dispatcher.on( 'insert:$text', ( evt, data, consumable ) => {
				consumable.consume( data.item, 'insert' );
			}, { priority: 'high' } );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div></div>' );
		} );
	} );

	describe( 'insertElement', () => {
		it( 'should convert element insertion in model to and map positions for future converting', () => {
			const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar' ) );
			const viewElement = new ViewContainerElement( 'p' );

			modelRoot.appendChildren( modelElement );
			dispatcher.on( 'insert:paragraph', insertElement( viewElement ) );
			dispatcher.on( 'insert:$text', insertText() );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should take view element function generator as a parameter', () => {
			const elementGenerator = ( data, consumable ) => {
				if ( consumable.consume( data.item, 'addAttribute:nice' ) ) {
					return new ViewContainerElement( 'div' );
				} else {
					return new ViewContainerElement( 'p' );
				}
			};
			const niceP = new ModelElement( 'myParagraph', { nice: true }, new ModelText( 'foo' ) );
			const badP = new ModelElement( 'myParagraph', null, new ModelText( 'bar' ) );

			modelRoot.appendChildren( [ niceP, badP ] );

			dispatcher.on( 'insert:myParagraph', insertElement( elementGenerator ) );
			dispatcher.on( 'insert:$text', insertText() );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><div>foo</div><p>bar</p></div>' );
		} );

		it( 'should not convert and not consume if creator function returned null', () => {
			const elementGenerator = () => null;

			const modelP = new ModelElement( 'paragraph', null, new ModelText( 'foo' ) );

			modelRoot.appendChildren( [ modelP ] );

			sinon.spy( dispatcher, 'fire' );

			dispatcher.on( 'insert:paragraph', insertElement( elementGenerator ) );
			dispatcher.on( 'insert:paragraph', ( evt, data, consumable ) => {
				expect( consumable.test( data.item, 'insert' ) ).to.be.true;
			} );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div></div>' );
			expect( dispatcher.fire.calledWith( 'insert:paragraph' ) ).to.be.true;
		} );
	} );

	describe( 'setAttribute/removeAttribute', () => {
		it( 'should convert attribute insert/change/remove on a model node', () => {
			const modelElement = new ModelElement( 'paragraph', { class: 'foo' }, new ModelText( 'foobar' ) );
			const viewElement = new ViewContainerElement( 'p' );

			modelRoot.appendChildren( modelElement );
			dispatcher.on( 'insert:paragraph', insertElement( viewElement ) );
			dispatcher.on( 'insert:$text', insertText() );
			dispatcher.on( 'addAttribute:class', setAttribute() );
			dispatcher.on( 'changeAttribute:class', setAttribute() );
			dispatcher.on( 'removeAttribute:class', removeAttribute() );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p class="foo">foobar</p></div>' );

			modelElement.setAttribute( 'class', 'bar' );
			dispatcher.convertAttribute( 'changeAttribute', createRangeOnElementOnly( modelElement ), 'class', 'foo', 'bar' );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p class="bar">foobar</p></div>' );

			modelElement.removeAttribute( 'class' );
			dispatcher.convertAttribute( 'removeAttribute', createRangeOnElementOnly( modelElement ), 'class', 'bar', null );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should convert insert/change/remove with attribute generating function as a parameter', () => {
			const modelParagraph = new ModelElement( 'paragraph', { theme: 'nice' }, new ModelText( 'foobar' ) );
			const modelDiv = new ModelElement( 'div', { theme: 'nice' } );

			const themeConverter = ( value, key, data ) => {
				if ( data.item instanceof ModelElement && data.item.childCount > 0 ) {
					value += ' fix-content';
				}

				return { key: 'class', value };
			};

			modelRoot.appendChildren( [ modelParagraph, modelDiv ] );
			dispatcher.on( 'insert:paragraph', insertElement( new ViewContainerElement( 'p' ) ) );
			dispatcher.on( 'insert:div', insertElement( new ViewContainerElement( 'div' ) ) );
			dispatcher.on( 'insert:$text', insertText() );
			dispatcher.on( 'addAttribute:theme', setAttribute( themeConverter ) );
			dispatcher.on( 'changeAttribute:theme', setAttribute( themeConverter ) );
			dispatcher.on( 'removeAttribute:theme', removeAttribute( themeConverter ) );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p class="nice fix-content">foobar</p><div class="nice"></div></div>' );

			modelParagraph.setAttribute( 'theme', 'awesome' );
			dispatcher.convertAttribute( 'changeAttribute', createRangeOnElementOnly( modelParagraph ), 'theme', 'nice', 'awesome' );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p class="awesome fix-content">foobar</p><div class="nice"></div></div>' );

			modelParagraph.removeAttribute( 'theme' );
			dispatcher.convertAttribute( 'removeAttribute', createRangeOnElementOnly( modelParagraph ), 'theme', 'awesome', null );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p><div class="nice"></div></div>' );
		} );

		it( 'should be possible to override setAttribute', () => {
			const modelElement = new ModelElement( 'paragraph', { class: 'foo' }, new ModelText( 'foobar' ) );
			const viewElement = new ViewContainerElement( 'p' );

			modelRoot.appendChildren( modelElement );
			dispatcher.on( 'insert:paragraph', insertElement( viewElement ) );
			dispatcher.on( 'insert:$text', insertText() );
			dispatcher.on( 'addAttribute:class', setAttribute() );
			dispatcher.on( 'addAttribute:class', ( evt, data, consumable ) => {
				consumable.consume( data.item, 'addAttribute:class' );
			}, { priority: 'high' } );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			// No attribute set.
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should be possible to override removeAttribute', () => {
			const modelElement = new ModelElement( 'paragraph', { class: 'foo' }, new ModelText( 'foobar' ) );
			const viewElement = new ViewContainerElement( 'p' );

			modelRoot.appendChildren( modelElement );
			dispatcher.on( 'insert:paragraph', insertElement( viewElement ) );
			dispatcher.on( 'insert:$text', insertText() );
			dispatcher.on( 'addAttribute:class', setAttribute() );
			dispatcher.on( 'removeAttribute:class', removeAttribute() );
			dispatcher.on( 'removeAttribute:class', ( evt, data, consumable ) => {
				consumable.consume( data.item, 'removeAttribute:class' );
			}, { priority: 'high' } );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p class="foo">foobar</p></div>' );

			modelElement.removeAttribute( 'class' );
			dispatcher.convertAttribute( 'removeAttribute', createRangeOnElementOnly( modelElement ), 'class', 'bar', null );

			// Nothing changed.
			expect( viewToString( viewRoot ) ).to.equal( '<div><p class="foo">foobar</p></div>' );
		} );
	} );

	describe( 'wrap/unwrap', () => {
		it( 'should convert insert/change/remove of attribute in model into wrapping element in a view', () => {
			const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar', { bold: true } ) );
			const viewP = new ViewContainerElement( 'p' );
			const viewB = new ViewAttributeElement( 'b' );

			modelRoot.appendChildren( modelElement );
			dispatcher.on( 'insert:paragraph', insertElement( viewP ) );
			dispatcher.on( 'insert:$text', insertText() );
			dispatcher.on( 'addAttribute:bold', wrapItem( viewB ) );
			dispatcher.on( 'removeAttribute:bold', unwrapItem( viewB ) );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p><b>foobar</b></p></div>' );

			modelWriter.removeAttribute( ModelRange.createIn( modelElement ), 'bold' );

			dispatcher.convertAttribute( 'removeAttribute', ModelRange.createIn( modelElement ), 'bold', true, null );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should convert insert/remove of attribute in model with wrapping element generating function as a parameter', () => {
			const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar', { style: 'bold' } ) );
			const viewP = new ViewContainerElement( 'p' );

			const elementGenerator = value => {
				if ( value == 'bold' ) {
					return new ViewAttributeElement( 'b' );
				}
			};

			modelRoot.appendChildren( modelElement );
			dispatcher.on( 'insert:paragraph', insertElement( viewP ) );
			dispatcher.on( 'insert:$text', insertText() );
			dispatcher.on( 'addAttribute:style', wrapItem( elementGenerator ) );
			dispatcher.on( 'removeAttribute:style', unwrapItem( elementGenerator ) );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p><b>foobar</b></p></div>' );

			modelWriter.removeAttribute( ModelRange.createIn( modelElement ), 'style' );

			dispatcher.convertAttribute( 'removeAttribute', ModelRange.createIn( modelElement ), 'style', 'bold', null );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should update range on re-wrapping attribute (#475)', () => {
			const modelElement = new ModelElement( 'paragraph', null, [
				new ModelText( 'x' ),
				new ModelText( 'foo', { link: 'http://foo.com' } ),
				new ModelText( 'x' )
			] );

			const viewP = new ViewContainerElement( 'p' );

			const elementGenerator = href => new ViewAttributeElement( 'a', { href } );

			modelRoot.appendChildren( modelElement );
			dispatcher.on( 'insert:paragraph', insertElement( viewP ) );
			dispatcher.on( 'insert:$text', insertText() );
			dispatcher.on( 'addAttribute:link', wrapItem( elementGenerator ) );
			dispatcher.on( 'changeAttribute:link', wrapItem( elementGenerator ) );

			dispatcher.convertInsertion(
				ModelRange.createIn( modelRoot )
			);

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>x<a href="http://foo.com">foo</a>x</p></div>' );

			modelWriter.setAttribute( ModelRange.createIn( modelElement ), 'link', 'http://foobar.com' );

			dispatcher.convertAttribute(
				'changeAttribute',
				ModelRange.createIn( modelElement ),
				'link',
				'http://foo.com',
				'http://foobar.com'
			);

			expect( viewToString( viewRoot ) ).to.equal( '<div><p><a href="http://foobar.com">xfoox</a></p></div>' );
		} );

		it( 'should support unicode', () => {
			const modelElement = new ModelElement( 'paragraph', null, [ 'நி', new ModelText( 'லைக்', { bold: true } ), 'கு' ] );
			const viewP = new ViewContainerElement( 'p' );
			const viewB = new ViewAttributeElement( 'b' );

			modelRoot.appendChildren( modelElement );
			dispatcher.on( 'insert:paragraph', insertElement( viewP ) );
			dispatcher.on( 'insert:$text', insertText() );
			dispatcher.on( 'addAttribute:bold', wrapItem( viewB ) );
			dispatcher.on( 'removeAttribute:bold', unwrapItem( viewB ) );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>நி<b>லைக்</b>கு</p></div>' );

			modelWriter.removeAttribute( ModelRange.createIn( modelElement ), 'bold' );

			dispatcher.convertAttribute( 'removeAttribute', ModelRange.createIn( modelElement ), 'bold', true, null );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>நிலைக்கு</p></div>' );
		} );

		it( 'should be possible to override wrap', () => {
			const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar', { bold: true } ) );
			const viewP = new ViewContainerElement( 'p' );
			const viewB = new ViewAttributeElement( 'b' );

			modelRoot.appendChildren( modelElement );
			dispatcher.on( 'insert:paragraph', insertElement( viewP ) );
			dispatcher.on( 'insert:$text', insertText() );
			dispatcher.on( 'addAttribute:bold', wrapItem( viewB ) );
			dispatcher.on( 'addAttribute:bold', ( evt, data, consumable ) => {
				consumable.consume( data.item, 'addAttribute:bold' );
			}, { priority: 'high' } );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should be possible to override unwrap', () => {
			const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar', { bold: true } ) );
			const viewP = new ViewContainerElement( 'p' );
			const viewB = new ViewAttributeElement( 'b' );

			modelRoot.appendChildren( modelElement );
			dispatcher.on( 'insert:paragraph', insertElement( viewP ) );
			dispatcher.on( 'insert:$text', insertText() );
			dispatcher.on( 'addAttribute:bold', wrapItem( viewB ) );
			dispatcher.on( 'removeAttribute:bold', unwrapItem( viewB ) );
			dispatcher.on( 'removeAttribute:bold', ( evt, data, consumable ) => {
				consumable.consume( data.item, 'removeAttribute:bold' );
			}, { priority: 'high' } );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p><b>foobar</b></p></div>' );

			modelWriter.removeAttribute( ModelRange.createIn( modelElement ), 'bold' );

			dispatcher.convertAttribute( 'removeAttribute', ModelRange.createIn( modelElement ), 'bold', true, null );

			// Nothing changed.
			expect( viewToString( viewRoot ) ).to.equal( '<div><p><b>foobar</b></p></div>' );
		} );

		it( 'should not convert and not consume if creator function returned null', () => {
			const elementGenerator = () => null;

			const modelText = new ModelText( 'foo', { bold: true } );

			modelRoot.appendChildren( [ modelText ] );

			sinon.spy( dispatcher, 'fire' );

			dispatcher.on( 'insert:$text', insertText() );
			dispatcher.on( 'addAttribute:bold', wrapItem( elementGenerator ) );
			dispatcher.on( 'removeAttribute:bold', unwrapItem( elementGenerator ) );

			dispatcher.on( 'addAttribute:bold', ( evt, data, consumable ) => {
				expect( consumable.test( data.item, 'addAttribute:bold' ) ).to.be.true;
			} );
			dispatcher.on( 'removeAttribute:bold', ( evt, data, consumable ) => {
				expect( consumable.test( data.item, 'removeAttribute:bold' ) ).to.be.true;
			} );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div>foo</div>' );
			expect( dispatcher.fire.calledWith( 'addAttribute:bold:$text' ) ).to.be.true;

			modelText.removeAttribute( 'bold' );
			dispatcher.convertAttribute( 'removeAttribute', ModelRange.createIn( modelRoot ), 'bold', true, null );
			expect( dispatcher.fire.calledWith( 'removeAttribute:bold:$text' ) ).to.be.true;
		} );
	} );

	describe( 'insertUIElement/removeUIElement', () => {
		let modelText, range, modelElement;

		beforeEach( () => {
			modelText = new ModelText( 'foobar' );
			modelElement = new ModelElement( 'paragraph', null, modelText );
			modelRoot.appendChildren( modelElement );

			const viewText = new ViewText( 'foobar' );
			const viewElement = new ViewContainerElement( 'p', null, viewText );
			viewRoot.appendChildren( viewElement );

			mapper.bindElements( modelElement, viewElement );

			range = ModelRange.createFromParentsAndOffsets( modelElement, 3, modelElement, 3 );
		} );

		it( 'should insert and remove ui element - element as a creator', () => {
			const viewUi = new ViewUIElement( 'span', { 'class': 'marker' } );

			dispatcher.on( 'addMarker:marker', insertUIElement( viewUi ) );
			dispatcher.on( 'removeMarker:marker', removeUIElement( viewUi ) );

			dispatcher.convertMarker( 'addMarker', 'marker', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo<span class="marker"></span>bar</p></div>' );

			dispatcher.convertMarker( 'removeMarker', 'marker', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should insert and remove ui element - function as a creator', () => {
			const viewUi = data => new ViewUIElement( 'span', { 'class': data.markerName } );

			dispatcher.on( 'addMarker:marker', insertUIElement( viewUi ) );
			dispatcher.on( 'removeMarker:marker', removeUIElement( viewUi ) );

			dispatcher.convertMarker( 'addMarker', 'marker', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foo<span class="marker"></span>bar</p></div>' );

			dispatcher.convertMarker( 'removeMarker', 'marker', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should not convert or consume if generator function returned null', () => {
			const viewUi = () => null;

			sinon.spy( dispatcher, 'fire' );

			dispatcher.on( 'addMarker:marker', insertUIElement( viewUi ) );
			dispatcher.on( 'removeMarker:marker', removeUIElement( viewUi ) );

			dispatcher.on( 'addMarker:marker', ( evt, data, consumable ) => {
				expect( consumable.test( data.markerRange, 'addMarker:marker' ) ).to.be.true;
			} );

			dispatcher.on( 'removeMarker:marker', ( evt, data, consumable ) => {
				expect( consumable.test( data.markerRange, 'removeMarker:marker' ) ).to.be.true;
			} );

			dispatcher.convertMarker( 'addMarker', 'marker', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			expect( dispatcher.fire.calledWith( 'addMarker:marker' ) );

			dispatcher.convertMarker( 'removeMarker', 'marker', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			expect( dispatcher.fire.calledWith( 'removeMarker:marker' ) );
		} );

		it( 'should be possible to overwrite', () => {
			const viewUi = new ViewUIElement( 'span', { 'class': 'marker' } );

			sinon.spy( dispatcher, 'fire' );

			dispatcher.on( 'addMarker:marker', insertUIElement( viewUi ) );
			dispatcher.on( 'removeMarker:marker', removeUIElement( viewUi ) );

			dispatcher.on( 'addMarker:marker', ( evt, data, consumable ) => {
				consumable.consume( data.markerRange, 'addMarker:marker' );
			}, { priority: 'high' } );

			dispatcher.on( 'removeMarker:marker', ( evt, data, consumable ) => {
				consumable.consume( data.markerRange, 'removeMarker:marker' );
			}, { priority: 'high' } );

			dispatcher.convertMarker( 'addMarker', 'marker', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			expect( dispatcher.fire.calledWith( 'addMarker:marker' ) );

			dispatcher.convertMarker( 'removeMarker', 'marker', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			expect( dispatcher.fire.calledWith( 'removeMarker:marker' ) );
		} );

		it( 'should not convert or consume if generator function returned null', () => {
			const viewUi = () => null;

			sinon.spy( dispatcher, 'fire' );

			dispatcher.on( 'addMarker:marker', insertUIElement( viewUi ) );
			dispatcher.on( 'removeMarker:marker', removeUIElement( viewUi ) );

			dispatcher.on( 'addMarker:marker', ( evt, data, consumable ) => {
				expect( consumable.test( data.markerRange, 'addMarker:marker' ) ).to.be.true;
			} );

			dispatcher.on( 'removeMarker:marker', ( evt, data, consumable ) => {
				expect( consumable.test( data.markerRange, 'removeMarker:marker' ) ).to.be.true;
			} );

			dispatcher.convertMarker( 'addMarker', 'marker', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			expect( dispatcher.fire.calledWith( 'addMarker:marker' ) );

			dispatcher.convertMarker( 'removeMarker', 'marker', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			expect( dispatcher.fire.calledWith( 'removeMarker:marker' ) );
		} );

		it( 'should be possible to overwrite', () => {
			const viewUi = new ViewUIElement( 'span', { 'class': 'marker' } );

			sinon.spy( dispatcher, 'fire' );

			dispatcher.on( 'addMarker:marker', insertUIElement( viewUi ) );
			dispatcher.on( 'removeMarker:marker', removeUIElement( viewUi ) );

			dispatcher.on( 'addMarker:marker', ( evt, data, consumable ) => {
				consumable.consume( data.markerRange, 'addMarker:marker' );
			}, { priority: 'high' } );

			dispatcher.on( 'removeMarker:marker', ( evt, data, consumable ) => {
				consumable.consume( data.markerRange, 'removeMarker:marker' );
			}, { priority: 'high' } );

			dispatcher.convertMarker( 'addMarker', 'marker', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			expect( dispatcher.fire.calledWith( 'addMarker:marker' ) );

			dispatcher.convertMarker( 'removeMarker', 'marker', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			expect( dispatcher.fire.calledWith( 'removeMarker:marker' ) );
		} );

		describe( 'non-collapsed range', () => {
			beforeEach( () => {
				range = ModelRange.createFromParentsAndOffsets( modelElement, 2, modelElement, 5 );
			} );

			it( 'should insert and remove ui element - element as a creator', () => {
				const viewUi = new ViewUIElement( 'span', { 'class': 'marker' } );

				dispatcher.on( 'addMarker:marker', insertUIElement( viewUi ) );
				dispatcher.on( 'removeMarker:marker', removeUIElement( viewUi ) );

				dispatcher.convertMarker( 'addMarker', 'marker', range );

				expect( viewToString( viewRoot ) )
					.to.equal( '<div><p>fo<span class="marker"></span>oba<span class="marker"></span>r</p></div>' );

				dispatcher.convertMarker( 'removeMarker', 'marker', range );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			} );

			it( 'should insert and remove ui element - function as a creator', () => {
				const viewUi = data => new ViewUIElement( 'span', { 'class': data.markerName } );

				dispatcher.on( 'addMarker:marker', insertUIElement( viewUi ) );
				dispatcher.on( 'removeMarker:marker', removeUIElement( viewUi ) );

				dispatcher.convertMarker( 'addMarker', 'marker', range );

				expect( viewToString( viewRoot ) )
					.to.equal( '<div><p>fo<span class="marker"></span>oba<span class="marker"></span>r</p></div>' );

				dispatcher.convertMarker( 'removeMarker', 'marker', range );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			} );

			it( 'should insert and remove different opening and ending element', () => {
				function creator( data ) {
					if ( data.isOpening ) {
						return new ViewUIElement( 'span', { 'class': data.markerName, 'data-start': true } );
					}

					return new ViewUIElement( 'span', { 'class': data.markerName, 'data-end': true } );
				}

				dispatcher.on( 'addMarker:marker', insertUIElement( creator ) );
				dispatcher.on( 'removeMarker:marker', removeUIElement( creator ) );

				dispatcher.convertMarker( 'addMarker', 'marker', range );

				expect( viewToString( viewRoot ) ).to.equal(
					'<div><p>fo<span class="marker" data-start="true"></span>oba<span class="marker" data-end="true"></span>r</p></div>'
				);

				dispatcher.convertMarker( 'removeMarker', 'marker', range );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			} );

			it( 'should be possible to overwrite', () => {
				const viewUi = new ViewUIElement( 'span', { 'class': 'marker' } );

				sinon.spy( dispatcher, 'fire' );

				dispatcher.on( 'addMarker:marker', insertUIElement( viewUi ) );
				dispatcher.on( 'removeMarker:marker', removeUIElement( viewUi ) );

				dispatcher.on( 'addMarker:marker', ( evt, data, consumable ) => {
					consumable.consume( data.item, 'addMarker:marker' );
				}, { priority: 'high' } );

				dispatcher.on( 'removeMarker:marker', ( evt, data, consumable ) => {
					consumable.consume( data.item, 'removeMarker:marker' );
				}, { priority: 'high' } );

				dispatcher.convertMarker( 'addMarker', 'marker', range );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
				expect( dispatcher.fire.calledWith( 'addMarker:marker' ) );

				dispatcher.convertMarker( 'removeMarker', 'marker', range );

				expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
				expect( dispatcher.fire.calledWith( 'removeMarker:marker' ) );
			} );
		} );
	} );

	describe( 'remove', () => {
		it( 'should remove items from view accordingly to changes in model #1', () => {
			const modelDiv = new ModelElement( 'div', null, [
				new ModelText( 'foo' ),
				new ModelElement( 'image' ),
				new ModelText( 'bar' )
			] );

			modelRoot.appendChildren( modelDiv );
			dispatcher.on( 'insert:div', insertElement( new ViewContainerElement( 'div' ) ) );
			dispatcher.on( 'insert:image', insertElement( new ViewContainerElement( 'img' ) ) );
			dispatcher.on( 'insert:$text', insertText() );
			dispatcher.on( 'remove', remove() );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			const removedNodes = modelDiv.removeChildren( 0, 2 );
			modelDoc.graveyard.insertChildren( 0, removedNodes );

			dispatcher.convertRemove(
				ModelPosition.createFromParentAndOffset( modelDiv, 0 ),
				ModelRange.createFromParentsAndOffsets( modelDoc.graveyard, 0, modelDoc.graveyard, 4 )
			);

			expect( viewToString( viewRoot ) ).to.equal( '<div><div>bar</div></div>' );
		} );

		it( 'should not execute if value was already consumed', () => {
			const modelDiv = new ModelElement( 'div', null, new ModelText( 'foo' ) );

			modelRoot.appendChildren( modelDiv );
			dispatcher.on( 'insert:div', insertElement( new ViewContainerElement( 'div' ) ) );
			dispatcher.on( 'insert:$text', insertText() );
			dispatcher.on( 'remove', remove() );
			dispatcher.on( 'remove', ( evt, data, consumable ) => {
				consumable.consume( data.item, 'remove' );
			}, { priority: 'high' } );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><div>foo</div></div>' );

			const removedNodes = modelDiv.removeChildren( 0, 1 );
			modelDoc.graveyard.insertChildren( 0, removedNodes );

			dispatcher.convertRemove(
				ModelPosition.createFromParentAndOffset( modelDiv, 0 ),
				ModelRange.createFromParentsAndOffsets( modelDoc.graveyard, 0, modelDoc.graveyard, 3 )
			);

			expect( viewToString( viewRoot ) ).to.equal( '<div><div>foo</div></div>' );
		} );

		it( 'should support unicode', () => {
			const modelDiv = new ModelElement( 'div', null, 'நிலைக்கு' );

			modelRoot.appendChildren( modelDiv );
			dispatcher.on( 'insert:div', insertElement( new ViewContainerElement( 'div' ) ) );
			dispatcher.on( 'insert:$text', insertText() );
			dispatcher.on( 'remove', remove() );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			modelWriter.move(
				ModelRange.createFromParentsAndOffsets( modelDiv, 0, modelDiv, 6 ),
				ModelPosition.createAt( modelDoc.graveyard, 'end' )
			);

			dispatcher.convertRemove(
				ModelPosition.createFromParentAndOffset( modelDiv, 0 ),
				ModelRange.createFromParentsAndOffsets( modelDoc.graveyard, 0, modelDoc.graveyard, 6 )
			);

			expect( viewToString( viewRoot ) ).to.equal( '<div><div>கு</div></div>' );
		} );

		it( 'should not remove view ui elements that are placed next to removed content', () => {
			modelRoot.appendChildren( new ModelText( 'foobar' ) );
			viewRoot.appendChildren( [
				new ViewText( 'foo' ),
				new ViewUIElement( 'span' ),
				new ViewText( 'bar' )
			] );

			dispatcher.on( 'remove', remove() );

			// Remove 'b'.
			modelWriter.move(
				ModelRange.createFromParentsAndOffsets( modelRoot, 3, modelRoot, 4 ),
				ModelPosition.createAt( modelDoc.graveyard, 'end' )
			);

			dispatcher.convertRemove(
				ModelPosition.createFromParentAndOffset( modelRoot, 3 ),
				ModelRange.createFromParentsAndOffsets( modelDoc.graveyard, 0, modelDoc.graveyard, 1 )
			);

			expect( viewToString( viewRoot ) ).to.equal( '<div>foo<span></span>ar</div>' );
		} );

		it( 'should remove correct amount of text when it is split by view ui element', () => {
			modelRoot.appendChildren( new ModelText( 'foobar' ) );
			viewRoot.appendChildren( [
				new ViewText( 'foo' ),
				new ViewUIElement( 'span' ),
				new ViewText( 'bar' )
			] );

			dispatcher.on( 'remove', remove() );

			// Remove 'o<span></span>b'.
			modelWriter.move(
				ModelRange.createFromParentsAndOffsets( modelRoot, 2, modelRoot, 4 ),
				ModelPosition.createAt( modelDoc.graveyard, 'end' )
			);

			dispatcher.convertRemove(
				ModelPosition.createFromParentAndOffset( modelRoot, 2 ),
				ModelRange.createFromParentsAndOffsets( modelDoc.graveyard, 0, modelDoc.graveyard, 2 )
			);

			expect( viewToString( viewRoot ) ).to.equal( '<div>foar</div>' );
		} );

		it( 'should not unbind element that has not been moved to graveyard', () => {
			const modelElement = new ModelElement( 'paragraph' );
			const viewElement = new ViewContainerElement( 'p' );

			modelRoot.appendChildren( [ modelElement, new ModelText( 'b' ) ] );
			viewRoot.appendChildren( [ viewElement, new ViewText( 'b' ) ] );

			mapper.bindElements( modelElement, viewElement );

			dispatcher.on( 'remove', remove() );

			// Move <a></a> after "b". Can be e.g. a part of an unwrap delta (move + remove).
			modelWriter.move(
				ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 1 ),
				ModelPosition.createAt( modelRoot, 'end' )
			);

			dispatcher.convertRemove(
				ModelPosition.createFromParentAndOffset( modelRoot, 0 ),
				ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 2 )
			);

			expect( viewToString( viewRoot ) ).to.equal( '<div>b</div>' );

			expect( mapper.toModelElement( viewElement ) ).to.equal( modelElement );
			expect( mapper.toViewElement( modelElement ) ).to.equal( viewElement );
		} );

		it( 'should unbind elements if model element was moved to graveyard', () => {
			const modelElement = new ModelElement( 'paragraph' );
			const viewElement = new ViewContainerElement( 'p' );

			modelRoot.appendChildren( [ modelElement, new ModelText( 'b' ) ] );
			viewRoot.appendChildren( [ viewElement, new ViewText( 'b' ) ] );

			mapper.bindElements( modelElement, viewElement );

			dispatcher.on( 'remove', remove() );

			// Move <a></a> to graveyard.
			modelWriter.move(
				ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 1 ),
				ModelPosition.createAt( modelDoc.graveyard, 'end' )
			);

			dispatcher.convertRemove(
				ModelPosition.createFromParentAndOffset( modelRoot, 0 ),
				ModelRange.createFromParentsAndOffsets( modelDoc.graveyard, 0, modelDoc.graveyard, 1 )
			);

			expect( viewToString( viewRoot ) ).to.equal( '<div>b</div>' );

			expect( mapper.toModelElement( viewElement ) ).to.be.undefined;
			expect( mapper.toViewElement( modelElement ) ).to.be.undefined;
		} );

		// TODO move to conversion/integration.js one day.
		it( 'should not break when remove() is used as part of unwrapping', () => {
			// The whole process looks like this:
			// <w><a></a></w> => <a></a><w><a></a></w> => <a></a><w></w> => <a></a>
			// The <a> is duplicated for a while in the view.

			const modelAElement = new ModelElement( 'a' );
			const modelWElement = new ModelElement( 'w' );
			const viewAElement = new ViewContainerElement( 'a' );
			const viewA2Element = new ViewContainerElement( 'a2' );
			const viewWElement = new ViewContainerElement( 'w' );

			modelRoot.appendChildren( modelWElement );
			viewRoot.appendChildren( viewWElement );

			modelWElement.appendChildren( modelAElement );
			viewWElement.appendChildren( viewAElement );

			mapper.bindElements( modelWElement, viewWElement );
			mapper.bindElements( modelAElement, viewAElement );

			dispatcher.on( 'remove', remove() );
			dispatcher.on( 'insert', insertElement( () => viewA2Element ) );

			modelDoc.on( 'change', ( evt, type, changes ) => {
				dispatcher.convertChange( type, changes );
			} );

			modelDoc.batch().unwrap( modelWElement );

			expect( viewToString( viewRoot ) ).to.equal( '<div><a2></a2></div>' );

			expect( mapper.toModelElement( viewA2Element ) ).to.equal( modelAElement );
			expect( mapper.toViewElement( modelAElement ) ).to.equal( viewA2Element );

			// This is a bit unfortunate, but we think we can live with this.
			// The viewAElement is not in the tree and there's a high chance that all reference to it are gone.
			expect( mapper.toModelElement( viewAElement ) ).to.equal( modelAElement );

			expect( mapper.toModelElement( viewWElement ) ).to.be.undefined;
			expect( mapper.toViewElement( modelWElement ) ).to.be.undefined;
		} );

		it( 'should work correctly if container element after ui element is removed', () => {
			const modelP1 = new ModelElement( 'paragraph' );
			const modelP2 = new ModelElement( 'paragraph' );

			const viewP1 = new ViewContainerElement( 'p' );
			const viewUi1 = new ViewUIElement( 'span' );
			const viewUi2 = new ViewUIElement( 'span' );
			const viewP2 = new ViewContainerElement( 'p' );

			modelRoot.appendChildren( [ modelP1, modelP2 ] );
			viewRoot.appendChildren( [ viewP1, viewUi1, viewUi2, viewP2 ] );

			mapper.bindElements( modelP1, viewP1 );
			mapper.bindElements( modelP2, viewP2 );

			dispatcher.on( 'remove', remove() );

			modelWriter.move(
				ModelRange.createFromParentsAndOffsets( modelRoot, 1, modelRoot, 2 ),
				ModelPosition.createAt( modelDoc.graveyard, 'end' )
			);

			dispatcher.convertRemove(
				ModelPosition.createFromParentAndOffset( modelRoot, 1 ),
				ModelRange.createFromParentsAndOffsets( modelDoc.graveyard, 0, modelDoc.graveyard, 1 )
			);

			expect( viewToString( viewRoot ) ).to.equal( '<div><p></p><span></span><span></span></div>' );
		} );

		it( 'should work correctly if container element after text node is removed', () => {
			const modelText = new ModelText( 'foo' );
			const modelP = new ModelElement( 'paragraph' );

			const viewText = new ViewText( 'foo' );
			const viewP = new ViewContainerElement( 'p' );

			modelRoot.appendChildren( [ modelText, modelP ] );
			viewRoot.appendChildren( [ viewText, viewP ] );

			mapper.bindElements( modelP, viewP );

			dispatcher.on( 'remove', remove() );

			modelWriter.move(
				ModelRange.createFromParentsAndOffsets( modelRoot, 3, modelRoot, 4 ),
				ModelPosition.createAt( modelDoc.graveyard, 'end' )
			);

			dispatcher.convertRemove(
				ModelPosition.createFromParentAndOffset( modelRoot, 3 ),
				ModelRange.createFromParentsAndOffsets( modelDoc.graveyard, 0, modelDoc.graveyard, 1 )
			);

			expect( viewToString( viewRoot ) ).to.equal( '<div>foo</div>' );
		} );
	} );

	describe( 'createViewElementFromHighlightDescriptor()', () => {
		it( 'should return attribute element from descriptor object', () => {
			const descriptor = {
				class: 'foo-class',
				attributes: { one: 1, two: 2 },
				priority: 7,
			};
			const element = createViewElementFromHighlightDescriptor( descriptor );

			expect( element.is( 'attributeElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'span' );
			expect( element.priority ).to.equal( 7 );
			expect( element.hasClass( 'foo-class' ) ).to.be.true;

			for ( const key of Object.keys( descriptor.attributes ) ) {
				expect( element.getAttribute( key ) ).to.equal( descriptor.attributes[ key ] );
			}
		} );

		it( 'should return attribute element from descriptor object - array with classes', () => {
			const descriptor = {
				class: [ 'foo-class', 'bar-class' ],
				attributes: { one: 1, two: 2 },
				priority: 7,
			};
			const element = createViewElementFromHighlightDescriptor( descriptor );

			expect( element.is( 'attributeElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'span' );
			expect( element.priority ).to.equal( 7 );
			expect( element.hasClass( 'foo-class' ) ).to.be.true;
			expect( element.hasClass( 'bar-class' ) ).to.be.true;

			for ( const key of Object.keys( descriptor.attributes ) ) {
				expect( element.getAttribute( key ) ).to.equal( descriptor.attributes[ key ] );
			}
		} );

		it( 'should create element without class', () => {
			const descriptor = {
				attributes: { one: 1, two: 2 },
				priority: 7,
			};
			const element = createViewElementFromHighlightDescriptor( descriptor );

			expect( element.is( 'attributeElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'span' );
			expect( element.priority ).to.equal( 7 );

			for ( const key of Object.keys( descriptor.attributes ) ) {
				expect( element.getAttribute( key ) ).to.equal( descriptor.attributes[ key ] );
			}
		} );

		it( 'should create element without priority', () => {
			const descriptor = {
				class: 'foo-class',
				attributes: { one: 1, two: 2 },
			};
			const element = createViewElementFromHighlightDescriptor( descriptor );

			expect( element.is( 'attributeElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'span' );
			expect( element.priority ).to.equal( 10 );
			expect( element.hasClass( 'foo-class' ) ).to.be.true;

			for ( const key of Object.keys( descriptor.attributes ) ) {
				expect( element.getAttribute( key ) ).to.equal( descriptor.attributes[ key ] );
			}
		} );

		it( 'should create element without attributes', () => {
			const descriptor = {
				class: 'foo-class',
				priority: 7
			};
			const element = createViewElementFromHighlightDescriptor( descriptor );

			expect( element.is( 'attributeElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'span' );
			expect( element.priority ).to.equal( 7 );
			expect( element.hasClass( 'foo-class' ) ).to.be.true;
		} );

		it( 'should create similar elements if they are created using same descriptor id', () => {
			const a = createViewElementFromHighlightDescriptor( {
				id: 'id',
				class: 'classA',
				priority: 1
			} );

			const b = createViewElementFromHighlightDescriptor( {
				id: 'id',
				class: 'classB',
				priority: 2
			} );

			expect( a.isSimilar( b ) ).to.be.true;
		} );

		it( 'should create non-similar elements if they have different descriptor id', () => {
			const a = createViewElementFromHighlightDescriptor( {
				id: 'a',
				class: 'foo',
				priority: 1
			} );

			const b = createViewElementFromHighlightDescriptor( {
				id: 'b',
				class: 'foo',
				priority: 1
			} );

			expect( a.isSimilar( b ) ).to.be.false;
		} );
	} );
} );
