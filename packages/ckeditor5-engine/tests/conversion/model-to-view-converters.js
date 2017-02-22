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
	wrapRange,
	unwrapRange,
	remove,
	removeUIElement
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

		for ( let key of item.getAttributeKeys() ) {
			let value = item.getAttribute( key );

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
			for ( let child of item.getChildren() ) {
				result += viewToString( child );
			}

			if ( item instanceof ViewElement ) {
				result = '<' + item.name + viewAttributesToString( item ) + '>' + result + '</' + item.name + '>';
			}
		}

		return result;
	}

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
					value += ' ' + 'fix-content';
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

			const elementGenerator = ( value ) => {
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

			const elementGenerator = ( href ) => new ViewAttributeElement( 'a', { href } );

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

	describe( 'wrapRange/unwrapRange', () => {
		let modelText, range, modelElement;

		beforeEach( () => {
			modelText = new ModelText( 'foobar' );
			modelElement = new ModelElement( 'paragraph', null, modelText );
			modelRoot.appendChildren( modelElement );

			const viewText = new ViewText( 'foobar' );
			const viewElement = new ViewContainerElement( 'p', null, viewText );
			viewRoot.appendChildren( viewElement );

			mapper.bindElements( modelElement, viewElement );

			range = ModelRange.createFromParentsAndOffsets( modelElement, 2, modelElement, 4 );
		} );

		it( 'should convert adding/removing of marker into wrapping element in a view', () => {
			const viewSpan = new ViewAttributeElement( 'span', { class: 'name' } );

			dispatcher.on( 'addMarker:name', wrapRange( viewSpan ) );
			dispatcher.on( 'removeMarker:name', unwrapRange( viewSpan ) );

			dispatcher.convertMarker( 'addMarker', 'name', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>fo<span class="name">ob</span>ar</p></div>' );

			dispatcher.convertMarker( 'removeMarker', 'name', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should convert insert/remove of attribute in model with wrapping element generating function as a parameter', () => {
			const converterCallback = ( data ) => {
				const name = data.name.split( ':' )[ 1 ];

				return new ViewAttributeElement( 'span', { class: name } );
			};

			dispatcher.on( 'addMarker:name', wrapRange( converterCallback ) );
			dispatcher.on( 'removeMarker:name', unwrapRange( converterCallback ) );

			dispatcher.convertMarker( 'addMarker', 'name:john', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>fo<span class="john">ob</span>ar</p></div>' );

			dispatcher.convertMarker( 'removeMarker', 'name:john', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should support non-flat markers', () => {
			const modelElement2 = new ModelElement( 'paragraph', null, new ModelText( '22' ) );
			modelRoot.appendChildren( modelElement2 );

			const modelElement3 = new ModelElement( 'paragraph', null, new ModelText( '333' ) );
			modelRoot.appendChildren( modelElement3 );

			const viewElement2 = new ViewContainerElement( 'p', null, new ViewText( '22' ) );
			viewRoot.appendChildren( viewElement2 );

			const viewElement3 = new ViewContainerElement( 'p', null, new ViewText( '333' ) );
			viewRoot.appendChildren( viewElement3 );

			mapper.bindElements( modelElement2, viewElement2 );
			mapper.bindElements( modelElement3, viewElement3 );

			const range = ModelRange.createFromParentsAndOffsets( modelElement, 2, modelElement3, 1 );
			const viewSpan = new ViewAttributeElement( 'span', { class: 'name' } );

			dispatcher.on( 'addMarker:name', wrapRange( viewSpan ) );
			dispatcher.on( 'removeMarker:name', unwrapRange( viewSpan ) );

			dispatcher.convertMarker( 'addMarker', 'name', range );

			expect( viewToString( viewRoot ) ).to.equal(
				'<div><p>fo<span class="name">obar</span></p><p><span class="name">22</span></p><p><span class="name">3</span>33</p></div>'
			);

			dispatcher.convertMarker( 'removeMarker', 'name', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p><p>22</p><p>333</p></div>' );
		} );

		it( 'should be possible to override wrapRange', () => {
			const converterCallback = ( data ) => {
				const name = data.name.split( ':' )[ 1 ];

				return new ViewAttributeElement( 'span', { class: name } );
			};

			dispatcher.on( 'addMarker:name', wrapRange( converterCallback ) );
			dispatcher.on( 'addMarker:name:john', ( evt, data, consumable ) => {
				consumable.consume( data.range, 'addMarker' );
			}, { priority: 'high' } );

			dispatcher.convertMarker( 'addMarker', 'name:john', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'should be possible to override unwrapRange', () => {
			const converterCallback = ( data ) => {
				const name = data.name.split( ':' )[ 1 ];

				return new ViewAttributeElement( 'span', { class: name } );
			};

			dispatcher.on( 'addMarker:name', wrapRange( converterCallback ) );
			dispatcher.on( 'removeMarker:name', unwrapRange( converterCallback ) );
			dispatcher.on( 'removeMarker:name:john', ( evt, data, consumable ) => {
				consumable.consume( data.range, 'removeMarker' );
			}, { priority: 'high' } );

			dispatcher.convertMarker( 'addMarker', 'name:john', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>fo<span class="john">ob</span>ar</p></div>' );

			dispatcher.convertMarker( 'removeMarker', 'name:john', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>fo<span class="john">ob</span>ar</p></div>' );
		} );

		it( 'should not convert or consume if view element is not returned by element generating function', () => {
			const converterCallback = () => null;

			sinon.spy( dispatcher, 'fire' );

			dispatcher.on( 'addMarker:name', wrapRange( converterCallback ) );
			dispatcher.on( 'addMarker:name', ( evt, data, consumable ) => {
				// Check whether value was not consumed from `consumable`.
				expect( consumable.test( data.range, 'addMarker' ) ).to.be.true;
			} );

			dispatcher.on( 'removeMarker:name', unwrapRange( converterCallback ) );
			dispatcher.on( 'removeMarker:name', ( evt, data, consumable ) => {
				// Check whether value was not consumed from `consumable`.
				expect( consumable.test( data.range, 'removeMarker' ) ).to.be.true;
			} );

			dispatcher.convertMarker( 'addMarker', 'name', range );

			expect( dispatcher.fire.calledWith( 'addMarker:name' ) ).to.be.true;
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );

			dispatcher.convertMarker( 'removeMarker', 'name', range );

			expect( dispatcher.fire.calledWith( 'removeMarker:name' ) ).to.be.true;
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'multiple overlapping non-collapsed markers', () => {
			const converterCallbackName = ( data ) => {
				const name = data.name.split( ':' )[ 1 ];
				const element = new ViewAttributeElement( 'span', { class: name } );
				element.priority = name.charCodeAt( 0 );

				return element;
			};
			const converterCallbackSearch = () => new ViewAttributeElement( 'em', { class: 'search' } );

			dispatcher.on( 'addMarker:name', wrapRange( converterCallbackName ) );
			dispatcher.on( 'removeMarker:name', unwrapRange( converterCallbackName ) );
			dispatcher.on( 'addMarker:search', wrapRange( converterCallbackSearch ) );
			dispatcher.on( 'removeMarker:search', unwrapRange( converterCallbackSearch ) );

			dispatcher.convertMarker( 'addMarker', 'name:a', range );
			dispatcher.convertMarker( 'addMarker', 'name:b', range );
			dispatcher.convertMarker( 'addMarker', 'search', range );

			expect( viewToString( viewRoot ) ).to.equal(
				'<div><p>fo<em class="search"><span class="a"><span class="b">ob</span></span></em>ar</p></div>'
			);

			dispatcher.convertMarker( 'removeMarker', 'name:b', range );
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>fo<em class="search"><span class="a">ob</span></em>ar</p></div>' );

			dispatcher.convertMarker( 'removeMarker', 'search', range );
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>fo<span class="a">ob</span>ar</p></div>' );

			dispatcher.convertMarker( 'removeMarker', 'name:a', range );
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'multiple overlapping non-collapsed markers intersecting with same priority', () => {
			const converterCallbackSearch = () => new ViewAttributeElement( 'em', { class: 'search' } );

			dispatcher.on( 'addMarker:search', wrapRange( converterCallbackSearch ) );
			dispatcher.on( 'removeMarker:search', unwrapRange( converterCallbackSearch ) );

			const range1 = ModelRange.createFromParentsAndOffsets( modelElement, 1, modelElement, 3 );
			const range2 = ModelRange.createFromParentsAndOffsets( modelElement, 2, modelElement, 4 );
			const range3 = ModelRange.createFromParentsAndOffsets( modelElement, 4, modelElement, 6 );

			dispatcher.convertMarker( 'addMarker', 'search', range1 );
			dispatcher.convertMarker( 'addMarker', 'search', range2 );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>f<em class="search">oob</em>ar</p></div>' );

			dispatcher.convertMarker( 'addMarker', 'search', range3 );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>f<em class="search">oobar</em></p></div>' );

			dispatcher.convertMarker( 'removeMarker', 'search', range2 );
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>f<em class="search">o</em>ob<em class="search">ar</em></p></div>' );

			dispatcher.convertMarker( 'removeMarker', 'search', range3 );
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>f<em class="search">o</em>obar</p></div>' );

			dispatcher.convertMarker( 'removeMarker', 'search', range1 );
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
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
			const viewUi = ( data ) => new ViewUIElement( 'span', { 'class': data.name } );

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
				expect( consumable.test( data.range, 'addMarker' ) ).to.be.true;
			} );

			dispatcher.on( 'removeMarker:marker', ( evt, data, consumable ) => {
				expect( consumable.test( data.range, 'removeMarker' ) ).to.be.true;
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
				consumable.consume( data.range, 'addMarker' );
			}, { priority: 'high' } );

			dispatcher.on( 'removeMarker:marker', ( evt, data, consumable ) => {
				consumable.consume( data.range, 'removeMarker' );
			}, { priority: 'high' } );

			dispatcher.convertMarker( 'addMarker', 'marker', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			expect( dispatcher.fire.calledWith( 'addMarker:marker' ) );

			dispatcher.convertMarker( 'removeMarker', 'marker', range );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
			expect( dispatcher.fire.calledWith( 'removeMarker:marker' ) );
		} );
	} );

	describe( 'remove', () => {
		it( 'should remove items from view accordingly to changes in model', () => {
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
	} );
} );
