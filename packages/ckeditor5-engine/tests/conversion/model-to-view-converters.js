/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: conversion */

import ModelDocument from '/ckeditor5/engine/model/document.js';
import ModelElement from '/ckeditor5/engine/model/element.js';
import ModelText from '/ckeditor5/engine/model/text.js';
import ModelRange from '/ckeditor5/engine/model/range.js';
import ModelPosition from '/ckeditor5/engine/model/position.js';
import modelWriter from '/ckeditor5/engine/model/writer.js';

import ViewElement from '/ckeditor5/engine/view/element.js';
import ViewContainerElement from '/ckeditor5/engine/view/containerelement.js';
import ViewAttributeElement from '/ckeditor5/engine/view/attributeelement.js';
import ViewText from '/ckeditor5/engine/view/text.js';

import Mapper from '/ckeditor5/engine/conversion/mapper.js';
import ModelConversionDispatcher from '/ckeditor5/engine/conversion/modelconversiondispatcher.js';
import {
	insertElement,
	insertText,
	setAttribute,
	removeAttribute,
	wrap,
	unwrap,
	move,
	remove
} from '/ckeditor5/engine/conversion/model-to-view-converters.js';

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

		dispatcher.convertInsert( ModelRange.createFromElement( modelRoot ) );

		expect( viewToString( viewRoot ) ).to.equal( '<div>foobar</div>' );
	} );

	it( 'should support unicode', () => {
		modelRoot.appendChildren( new ModelText( 'நிலைக்கு' ) );
		dispatcher.on( 'insert:$text', insertText() );

		dispatcher.convertInsert( ModelRange.createFromElement( modelRoot ) );

		expect( viewToString( viewRoot ) ).to.equal( '<div>நிலைக்கு</div>' );
	} );
} );

describe( 'insertElement', () => {
	it( 'should convert element insertion in model to and map positions for future converting', () => {
		const modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar' ) );
		const viewElement = new ViewContainerElement( 'p' );

		modelRoot.appendChildren( modelElement );
		dispatcher.on( 'insert:paragraph', insertElement( viewElement ) );
		dispatcher.on( 'insert:$text', insertText() );

		dispatcher.convertInsert( ModelRange.createFromElement( modelRoot ) );

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

		dispatcher.convertInsert( ModelRange.createFromElement( modelRoot ) );

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

		dispatcher.convertInsert( ModelRange.createFromElement( modelRoot ) );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p class="foo">foobar</p></div>' );

		modelElement.setAttribute( 'class', 'bar' );
		dispatcher.convertAttribute( 'changeAttribute', ModelRange.createOnElement( modelElement ), 'class', 'foo', 'bar' );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p class="bar">foobar</p></div>' );

		modelElement.removeAttribute( 'class' );
		dispatcher.convertAttribute( 'removeAttribute', ModelRange.createOnElement( modelElement ), 'class', 'bar', null );

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

		dispatcher.convertInsert( ModelRange.createFromElement( modelRoot ) );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p class="nice fix-content">foobar</p><div class="nice"></div></div>' );

		modelParagraph.setAttribute( 'theme', 'awesome' );
		dispatcher.convertAttribute( 'changeAttribute', ModelRange.createOnElement( modelParagraph ), 'theme', 'nice', 'awesome' );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p class="awesome fix-content">foobar</p><div class="nice"></div></div>' );

		modelParagraph.removeAttribute( 'theme' );
		dispatcher.convertAttribute( 'removeAttribute', ModelRange.createOnElement( modelParagraph ), 'theme', 'awesome', null );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p><div class="nice"></div></div>' );
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

		dispatcher.convertInsert( ModelRange.createFromElement( modelRoot ) );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p><b>foobar</b></p></div>' );

		modelWriter.removeAttribute( ModelRange.createFromElement( modelElement ), 'bold' );

		dispatcher.convertAttribute( 'removeAttribute', ModelRange.createFromElement( modelElement ), 'bold', true, null );

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

		dispatcher.convertInsert( ModelRange.createFromElement( modelRoot ) );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p><b>foobar</b></p></div>' );

		modelWriter.removeAttribute( ModelRange.createFromElement( modelElement ), 'style' );

		dispatcher.convertAttribute( 'removeAttribute', ModelRange.createFromElement( modelElement ), 'style', 'bold', null );

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

		dispatcher.convertInsert(
			ModelRange.createFromElement( modelRoot )
		);

		expect( viewToString( viewRoot ) ).to.equal( '<div><p>x<a href="http://foo.com">foo</a>x</p></div>' );

		modelWriter.setAttribute( ModelRange.createFromElement( modelElement ), 'link', 'http://foobar.com' );

		dispatcher.convertAttribute(
			'changeAttribute',
			ModelRange.createFromElement( modelElement ),
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

		dispatcher.convertInsert( ModelRange.createFromElement( modelRoot ) );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p>நி<b>லைக்</b>கு</p></div>' );

		modelWriter.removeAttribute( ModelRange.createFromElement( modelElement ), 'bold' );

		dispatcher.convertAttribute( 'removeAttribute', ModelRange.createFromElement( modelElement ), 'bold', true, null );

		expect( viewToString( viewRoot ) ).to.equal( '<div><p>நிலைக்கு</p></div>' );
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

		dispatcher.convertInsert( ModelRange.createFromElement( modelRoot ) );

		const removedNodes = modelDivA.removeChildren( 0, 2 );
		modelDivB.insertChildren( 0, removedNodes );

		dispatcher.convertMove(
			ModelPosition.createFromParentAndOffset( modelDivA, 0 ),
			ModelRange.createFromParentsAndOffsets( modelDivB, 0, modelDivB, 4 )
		);

		expect( viewToString( viewRoot ) ).to.equal( '<div><div>bar</div><div>foo<img></img>xxyy</div></div>' );
	} );

	it( 'should support unicode', () => {
		const modelDivA = new ModelElement( 'div', null, 'நிலைக்கு' );
		const modelDivB = new ModelElement( 'div' );

		modelRoot.appendChildren( [ modelDivA, modelDivB ] );
		dispatcher.on( 'insert:div', insertElement( new ViewContainerElement( 'div' ) ) );
		dispatcher.on( 'insert:$text', insertText() );
		dispatcher.on( 'move', move() );

		dispatcher.convertInsert( ModelRange.createFromElement( modelRoot ) );

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

		dispatcher.convertInsert( ModelRange.createFromElement( modelRoot ) );

		const removedNodes = modelDiv.removeChildren( 0, 2 );
		modelDoc.graveyard.insertChildren( 0, removedNodes );

		dispatcher.convertRemove(
			ModelPosition.createFromParentAndOffset( modelDiv, 0 ),
			ModelRange.createFromParentsAndOffsets( modelDoc.graveyard, 0, modelDoc.graveyard, 4 )
		);

		expect( viewToString( viewRoot ) ).to.equal( '<div><div>bar</div></div>' );
	} );

	it( 'should support unicode', () => {
		const modelDiv = new ModelElement( 'div', null, 'நிலைக்கு' );

		modelRoot.appendChildren( modelDiv );
		dispatcher.on( 'insert:div', insertElement( new ViewContainerElement( 'div' ) ) );
		dispatcher.on( 'insert:$text', insertText() );
		dispatcher.on( 'remove', remove() );

		dispatcher.convertInsert( ModelRange.createFromElement( modelRoot ) );

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
