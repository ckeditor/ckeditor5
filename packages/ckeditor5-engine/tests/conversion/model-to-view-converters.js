/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: conversion */

import ModelDocument from 'ckeditor5/engine/model/document.js';
import ModelElement from 'ckeditor5/engine/model/element.js';
import ModelText from 'ckeditor5/engine/model/text.js';
import ModelRange from 'ckeditor5/engine/model/range.js';
import ModelPosition from 'ckeditor5/engine/model/position.js';
import modelWriter from 'ckeditor5/engine/model/writer.js';

import ViewElement from 'ckeditor5/engine/view/element.js';
import ViewContainerElement from 'ckeditor5/engine/view/containerelement.js';
import ViewAttributeElement from 'ckeditor5/engine/view/attributeelement.js';
import ViewText from 'ckeditor5/engine/view/text.js';

import Mapper from 'ckeditor5/engine/conversion/mapper.js';
import ModelConversionDispatcher from 'ckeditor5/engine/conversion/modelconversiondispatcher.js';
import {
	insertElement,
	insertText,
	setAttribute,
	removeAttribute,
	wrap,
	unwrap,
	wrapMarker,
	unwrapMarker,
	move,
	remove,
	rename
} from 'ckeditor5/engine/conversion/model-to-view-converters.js';

import { createRangeOnElementOnly } from 'tests/engine/model/_utils/utils.js';

let dispatcher, modelDoc, modelRoot, mapper, viewRoot;

beforeEach( () => {
	modelDoc = new ModelDocument();
	modelRoot = modelDoc.createRoot();
	viewRoot = new ViewContainerElement( 'div' );

	mapper = new Mapper();
	mapper.bindElements( modelRoot, viewRoot );

	dispatcher = new ModelConversionDispatcher( { mapper } );
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
		dispatcher.on( 'addAttribute:bold', wrap( viewB ) );
		dispatcher.on( 'removeAttribute:bold', unwrap( viewB ) );

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
		dispatcher.on( 'addAttribute:style', wrap( elementGenerator ) );
		dispatcher.on( 'removeAttribute:style', unwrap( elementGenerator ) );

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
		dispatcher.on( 'addAttribute:link', wrap( elementGenerator ) );
		dispatcher.on( 'changeAttribute:link', wrap( elementGenerator ) );

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
		dispatcher.on( 'addAttribute:bold', wrap( viewB ) );
		dispatcher.on( 'removeAttribute:bold', unwrap( viewB ) );

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
		dispatcher.on( 'addAttribute:bold', wrap( viewB ) );
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
		dispatcher.on( 'addAttribute:bold', wrap( viewB ) );
		dispatcher.on( 'removeAttribute:bold', unwrap( viewB ) );
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
} );

describe( 'wrapMarker/unwrapMarker', () => {
	let modelText, rangeJohn, rangeAlice, modelElement;

	beforeEach( () => {
		modelText = new ModelText( 'foobar' );
		modelElement = new ModelElement( 'paragraph', null, modelText );
		modelRoot.appendChildren( modelElement );

		const viewText = new ViewText( 'foobar' );
		const viewElement = new ViewContainerElement( 'p', null, viewText );
		viewRoot.appendChildren( viewElement );

		mapper.bindElements( modelElement, viewElement );

		rangeJohn = ModelRange.createFromParentsAndOffsets( modelElement, 2, modelElement, 4 );
		rangeAlice = ModelRange.createFromParentsAndOffsets( modelElement, 1, modelElement, 1 );
	} );

	it( 'should convert adding/removing of marker into wrapping element in a view', () => {
		const viewSpan = new ViewAttributeElement( 'span', { class: 'name' } );

		dispatcher.on( 'addMarker:name', wrapMarker( viewSpan ) );
		dispatcher.on( 'removeMarker:name', unwrapMarker( viewSpan ) );

		dispatcher.convertMarker( 'addMarker', 'name', rangeJohn );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p>fo<span class="name">ob</span>ar</p></div>' );

		dispatcher.convertMarker( 'removeMarker', 'name', rangeJohn );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
	} );

	it( 'should support collapsed markers', () => {
		const viewSpan = new ViewAttributeElement( 'span' );

		dispatcher.on( 'addMarker:name', wrapMarker( viewSpan ) );
		dispatcher.on( 'removeMarker:name', unwrapMarker( viewSpan ) );

		const rangeP = ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 0 );

		dispatcher.convertMarker( 'addMarker', 'name', rangeP );
		dispatcher.convertMarker( 'addMarker', 'name', rangeAlice );

		expect( viewToString( viewRoot ) ).to.equal( '<div><span></span><p>f<span></span>oobar</p></div>' );

		dispatcher.convertMarker( 'removeMarker', 'name', rangeP );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p>f<span></span>oobar</p></div>' );

		dispatcher.convertMarker( 'removeMarker', 'name', rangeAlice );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
	} );

	it( 'should convert insert/remove of attribute in model with wrapping element generating function as a parameter', () => {
		const converterCallback = ( data ) => {
			const name = data.name.split( ':' )[ 1 ];

			return new ViewAttributeElement( 'span', { class: name } );
		};

		dispatcher.on( 'addMarker:name', wrapMarker( converterCallback ) );
		dispatcher.on( 'removeMarker:name', unwrapMarker( converterCallback ) );

		dispatcher.convertMarker( 'addMarker', 'name:john', rangeJohn );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p>fo<span class="john">ob</span>ar</p></div>' );

		dispatcher.convertMarker( 'addMarker', 'name:alice', rangeAlice );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p>f<span class="alice"></span>o<span class="john">ob</span>ar</p></div>' );

		dispatcher.convertMarker( 'removeMarker', 'name:john', rangeJohn );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p>f<span class="alice"></span>oobar</p></div>' );

		dispatcher.convertMarker( 'removeMarker', 'name:alice', rangeAlice );

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

		dispatcher.on( 'addMarker:name', wrapMarker( viewSpan ) );
		dispatcher.on( 'removeMarker:name', unwrapMarker( viewSpan ) );

		dispatcher.convertMarker( 'addMarker', 'name', range );

		expect( viewToString( viewRoot ) ).to.equal(
			'<div><p>fo<span class="name">obar</span></p><p><span class="name">22</span></p><p><span class="name">3</span>33</p></div>'
		);

		dispatcher.convertMarker( 'removeMarker', 'name', range );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p><p>22</p><p>333</p></div>' );
	} );

	it( 'should be possible to override wrapMarker', () => {
		const converterCallback = ( data ) => {
			const name = data.name.split( ':' )[ 1 ];

			return new ViewAttributeElement( 'span', { class: name } );
		};

		dispatcher.on( 'addMarker:name', wrapMarker( converterCallback ) );
		dispatcher.on( 'addMarker:name:alice', ( evt, data, consumable ) => {
			consumable.consume( data.range, 'range' );
		}, { priority: 'high' } );

		dispatcher.convertMarker( 'addMarker', 'name:john', rangeJohn );
		dispatcher.convertMarker( 'addMarker', 'name:alice', rangeAlice );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p>fo<span class="john">ob</span>ar</p></div>' );
	} );

	it( 'should be possible to override unwrapMarker', () => {
		const converterCallback = ( data ) => {
			const name = data.name.split( ':' )[ 1 ];

			return new ViewAttributeElement( 'span', { class: name } );
		};

		dispatcher.on( 'addMarker:name', wrapMarker( converterCallback ) );
		dispatcher.on( 'removeMarker:name', unwrapMarker( converterCallback ) );
		dispatcher.on( 'removeMarker:name:john', ( evt, data, consumable ) => {
			consumable.consume( data.range, 'range' );
		}, { priority: 'high' } );

		dispatcher.convertMarker( 'addMarker', 'name:john', rangeJohn );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p>fo<span class="john">ob</span>ar</p></div>' );

		dispatcher.convertMarker( 'removeMarker', 'name:john', rangeJohn );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p>fo<span class="john">ob</span>ar</p></div>' );
	} );

	it( 'should not convert if view element is not returned by element generating function', () => {
		const converterCallback = () => null;

		dispatcher.on( 'addMarker:name', wrapMarker( converterCallback ) );
		dispatcher.on( 'addMarker:name', ( evt, data, consumable ) => {
			// Check whether value was not consumed from `consumable`.
			expect( consumable.test( data.range, 'range' ) ).to.be.true;
		} );

		dispatcher.convertMarker( 'addMarker', 'name', rangeJohn );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
	} );

	describe( 'multiple overlapping markers', () => {
		it( 'collapsed markers', () => {
			const converterCallbackName = ( data ) => new ViewAttributeElement( 'span', { class: data.name.split( ':' )[ 1 ] } );
			const converterCallbackSearch = () => new ViewAttributeElement( 'em', { class: 'search' } );

			dispatcher.on( 'addMarker:name', wrapMarker( converterCallbackName ) );
			dispatcher.on( 'removeMarker:name', unwrapMarker( converterCallbackName ) );
			dispatcher.on( 'addMarker:search', wrapMarker( converterCallbackSearch ) );
			dispatcher.on( 'removeMarker:search', unwrapMarker( converterCallbackSearch ) );

			const range = rangeAlice;

			dispatcher.convertMarker( 'addMarker', 'name:a', range );
			dispatcher.convertMarker( 'addMarker', 'name:b', range );
			dispatcher.convertMarker( 'addMarker', 'search', range );

			expect( viewToString( viewRoot ) ).to.equal(
				'<div><p>f<em class="search"></em><span class="b"></span><span class="a"></span>oobar</p></div>'
			);

			dispatcher.convertMarker( 'removeMarker', 'name:b', range );
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>f<em class="search"></em><span class="a"></span>oobar</p></div>' );

			dispatcher.convertMarker( 'removeMarker', 'search', range );
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>f<span class="a"></span>oobar</p></div>' );

			dispatcher.convertMarker( 'removeMarker', 'name:a', range );
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'non-collapsed markers', () => {
			const converterCallbackName = ( data ) => {
				const name = data.name.split( ':' )[ 1 ];
				const element = new ViewAttributeElement( 'span', { class: name } );
				element.priority = name.charCodeAt( 0 );

				return element;
			};
			const converterCallbackSearch = () => new ViewAttributeElement( 'em', { class: 'search' } );

			dispatcher.on( 'addMarker:name', wrapMarker( converterCallbackName ) );
			dispatcher.on( 'removeMarker:name', unwrapMarker( converterCallbackName ) );
			dispatcher.on( 'addMarker:search', wrapMarker( converterCallbackSearch ) );
			dispatcher.on( 'removeMarker:search', unwrapMarker( converterCallbackSearch ) );

			const range = rangeJohn;

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

		it( 'non-collapsed markers intersecting with same priority', () => {
			const converterCallbackSearch = () => new ViewAttributeElement( 'em', { class: 'search' } );

			dispatcher.on( 'addMarker:search', wrapMarker( converterCallbackSearch ) );
			dispatcher.on( 'removeMarker:search', unwrapMarker( converterCallbackSearch ) );

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

		it( 'collapsed and non-collapsed markers', () => {
			const converterCallbackName = ( data ) => {
				const name = data.name.split( ':' )[ 1 ];
				const element = new ViewAttributeElement( 'span', { class: name } );
				element.priority = name.charCodeAt( 0 );

				return element;
			};

			dispatcher.on( 'addMarker:name', wrapMarker( converterCallbackName ) );
			dispatcher.on( 'removeMarker:name', unwrapMarker( converterCallbackName ) );

			const range1 = ModelRange.createFromParentsAndOffsets( modelElement, 1, modelElement, 5 );
			const range2 = ModelRange.createFromParentsAndOffsets( modelElement, 2, modelElement, 2 );
			const range3 = ModelRange.createFromParentsAndOffsets( modelElement, 2, modelElement, 4 );

			dispatcher.convertMarker( 'addMarker', 'name:a', range1 );
			dispatcher.convertMarker( 'addMarker', 'name:b', range2 );
			dispatcher.convertMarker( 'addMarker', 'name:c', range3 );

			expect( viewToString( viewRoot ) ).to.equal(
				'<div><p>f<span class="a">o<span class="b"></span><span class="c">ob</span>a</span>r</p></div>'
			);

			dispatcher.convertMarker( 'removeMarker', 'name:c', range3 );
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>f<span class="a">o<span class="b"></span>oba</span>r</p></div>' );

			dispatcher.convertMarker( 'removeMarker', 'name:b', range2 );
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>f<span class="a">ooba</span>r</p></div>' );

			dispatcher.convertMarker( 'removeMarker', 'name:a', range1 );
			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );
	} );
} );

describe( 'move', () => {
	it( 'should move items in view accordingly to changes in model', () => {
		const modelDivA = new ModelElement( 'div', null, [
			new ModelText( 'foo' ),
			new ModelElement( 'image' ),
			new ModelText( 'bar' )
		] );

		const modelDivB = new ModelElement( 'div', null, new ModelText( 'xxyy' ) );

		modelRoot.appendChildren( [ modelDivA, modelDivB ] );
		dispatcher.on( 'insert:div', insertElement( new ViewContainerElement( 'div' ) ) );
		dispatcher.on( 'insert:image', insertElement( new ViewContainerElement( 'img' ) ) );
		dispatcher.on( 'insert:$text', insertText() );
		dispatcher.on( 'move', move() );

		dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

		const removedNodes = modelDivA.removeChildren( 0, 2 );
		modelDivB.insertChildren( 0, removedNodes );

		dispatcher.convertMove(
			ModelPosition.createFromParentAndOffset( modelDivA, 0 ),
			ModelRange.createFromParentsAndOffsets( modelDivB, 0, modelDivB, 4 )
		);

		expect( viewToString( viewRoot ) ).to.equal( '<div><div>bar</div><div>foo<img></img>xxyy</div></div>' );
	} );

	it( 'should not execute if value was already consumed', () => {
		const modelDivA = new ModelElement( 'div', null, new ModelText( 'foo' ) );
		const modelDivB = new ModelElement( 'div', null, new ModelText( 'xxyy' ) );

		modelRoot.appendChildren( [ modelDivA, modelDivB ] );
		dispatcher.on( 'insert:div', insertElement( new ViewContainerElement( 'div' ) ) );
		dispatcher.on( 'insert:$text', insertText() );
		dispatcher.on( 'move', move() );
		dispatcher.on( 'move', ( evt, data, consumable ) => {
			consumable.consume( data.item, 'move' );
		}, { priority: 'high' } );

		dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

		expect( viewToString( viewRoot ) ).to.equal( '<div><div>foo</div><div>xxyy</div></div>' );

		const removedNodes = modelDivA.removeChildren( 0, 1 );
		modelDivB.insertChildren( 0, removedNodes );

		dispatcher.convertMove(
			ModelPosition.createFromParentAndOffset( modelDivA, 0 ),
			ModelRange.createFromParentsAndOffsets( modelDivB, 0, modelDivB, 3 )
		);

		expect( viewToString( viewRoot ) ).to.equal( '<div><div>foo</div><div>xxyy</div></div>' );
	} );

	it( 'should support unicode', () => {
		const modelDivA = new ModelElement( 'div', null, 'நிலைக்கு' );
		const modelDivB = new ModelElement( 'div' );

		modelRoot.appendChildren( [ modelDivA, modelDivB ] );
		dispatcher.on( 'insert:div', insertElement( new ViewContainerElement( 'div' ) ) );
		dispatcher.on( 'insert:$text', insertText() );
		dispatcher.on( 'move', move() );

		dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

		modelWriter.move(
			ModelRange.createFromParentsAndOffsets( modelDivA, 2, modelDivA, 6 ),
			ModelPosition.createAt( modelDivB, 'end' )
		);

		dispatcher.convertMove(
			ModelPosition.createFromParentAndOffset( modelDivA, 2 ),
			ModelRange.createFromParentsAndOffsets( modelDivB, 0, modelDivB, 4 )
		);

		expect( viewToString( viewRoot ) ).to.equal( '<div><div>நிகு</div><div>லைக்</div></div>' );
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

describe( 'rename', () => {
	const oldName = 'oldName';
	const newName = 'newName';

	let element, converters;

	beforeEach( () => {
		converters = {
			insertText: insertText(),
			insert:	insertElement( ( data ) => new ViewContainerElement( data.item.name ) ),
			move: move(),
			remove: remove(),
			rename: rename()
		};

		sinon.spy( converters, 'insert' );
		sinon.spy( converters, 'move' );
		sinon.spy( converters, 'remove' );

		element = new ModelElement( oldName, null, new ModelText( 'foo' ) );
		modelRoot.appendChildren( element );

		dispatcher.on( 'insert:$text', converters.insertText );
		dispatcher.on( 'insert', converters.insert );
		dispatcher.on( 'move', converters.move );
		dispatcher.on( 'remove', converters.remove );
		dispatcher.on( 'rename', converters.rename );

		dispatcher.convertInsertion( ModelRange.createOn( element ) );

		element.name = newName;
	} );

	afterEach( () => {
		converters.insert.restore();
		converters.move.restore();
		converters.remove.restore();
	} );

	it( 'should enable default rename conversion, that uses already registered callbacks', () => {
		const insertCallCount = converters.insert.callCount;

		expect( viewRoot.getChild( 0 ).name ).to.equal( 'oldName' );
		dispatcher.convertRename( element, oldName );

		expect( converters.insert.callCount - insertCallCount ).to.equal( 1 );
		expect( converters.move.calledOnce ).to.be.true;
		expect( converters.remove.calledOnce ).to.be.true;

		expect( viewRoot.getChild( 0 ).name ).to.equal( 'newName' );
		expect( viewRoot.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo' );
	} );

	it( 'should not execute if converted value was already consumed', () => {
		dispatcher.on( 'rename', ( evt, data, consumable ) => {
			consumable.consume( data.element, 'rename' );
		}, { priority: 'high' } );

		dispatcher.on( 'rename', ( evt, data ) => {
			expect( data.fakeElement ).to.be.undefined;
		} );

		dispatcher.convertRename( element, oldName );
	} );
} );
