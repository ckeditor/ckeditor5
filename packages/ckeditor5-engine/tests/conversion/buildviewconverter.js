/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import buildViewConverter from '../../src/conversion/buildviewconverter';

import ModelSchema from '../../src/model/schema';
import ModelDocumentFragment from '../../src/model/documentfragment';
import ModelDocument from '../../src/model/document';
import ModelElement from '../../src/model/element';
import ModelTextProxy from '../../src/model/textproxy';
import ModelRange from '../../src/model/range';
import ModelWalker from '../../src/model/treewalker';

import ViewDocumentFragment from '../../src/view/documentfragment';
import ViewContainerElement from '../../src/view/containerelement';
import ViewAttributeElement from '../../src/view/attributeelement';
import ViewText from '../../src/view/text';
import ViewMatcher from '../../src/view/matcher';

import ViewConversionDispatcher from '../../src/conversion/viewconversiondispatcher';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import { convertToModelFragment, convertText } from '../../src/conversion/view-to-model-converters';
import { stringify } from '../../src/dev-utils/model';

function modelAttributesToString( item ) {
	let result = '';

	for ( const attr of item.getAttributes() ) {
		result += ' ' + attr[ 0 ] + '="' + attr[ 1 ] + '"';
	}

	return result;
}

function modelToString( item ) {
	let result = '';

	if ( item instanceof ModelTextProxy ) {
		const attributes = modelAttributesToString( item );

		result = attributes ? '<$text' + attributes + '>' + item.data + '</$text>' : item.data;
	} else {
		const walker = new ModelWalker( { boundaries: ModelRange.createIn( item ), shallow: true } );

		for ( const value of walker ) {
			result += modelToString( value.item );
		}

		if ( item instanceof ModelElement ) {
			const attributes = modelAttributesToString( item );

			result = '<' + item.name + attributes + '>' + result + '</' + item.name + '>';
		}
	}

	return result;
}

const textAttributes = [ undefined, 'linkHref', 'linkTitle', 'bold', 'italic', 'style' ];
const pAttributes = [ undefined, 'class', 'important', 'theme', 'decorated', 'size' ];

describe( 'View converter builder', () => {
	let dispatcher, modelDoc, modelRoot, schema, objWithContext;

	beforeEach( () => {
		// `additionalData` parameter for `.convert` calls.
		objWithContext = { context: [ '$root' ] };

		schema = new ModelSchema();

		schema.registerItem( 'paragraph', '$block' );
		schema.registerItem( 'div', '$block' );
		schema.registerItem( 'customP', 'paragraph' );
		schema.registerItem( 'image', '$inline' );
		schema.registerItem( 'span', '$inline' );
		schema.registerItem( 'MEGATRON', '$inline' ); // Yes, folks, we are building MEGATRON.
		schema.registerItem( 'abcd', '$inline' );
		schema.allow( { name: '$inline', attributes: textAttributes, inside: '$root' } );
		schema.allow( { name: 'image', attributes: [ 'src' ], inside: '$root' } );
		schema.allow( { name: 'image', attributes: [ 'src' ], inside: '$block' } );
		schema.allow( { name: '$text', inside: '$inline' } );
		schema.allow( { name: '$text', attributes: textAttributes, inside: '$block' } );
		schema.allow( { name: '$text', attributes: textAttributes, inside: '$root' } );
		schema.allow( { name: 'paragraph', attributes: pAttributes, inside: '$root' } );
		schema.allow( { name: 'span', attributes: [ 'transformer' ], inside: '$root' } );
		schema.allow( { name: 'div', attributes: [ 'class' ], inside: '$root' } );

		dispatcher = new ViewConversionDispatcher( { schema } );
		dispatcher.on( 'text', convertText() );

		modelDoc = new ModelDocument();
		modelRoot = modelDoc.createRoot();
	} );

	it( 'should convert from view element to model element', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		const conversionResult = dispatcher.convert( new ViewContainerElement( 'p', null, new ViewText( 'foo' ) ), objWithContext );
		modelRoot.appendChildren( conversionResult );

		expect( modelToString( conversionResult ) ).to.equal( '<paragraph>foo</paragraph>' );
	} );

	it( 'should convert from view element to model element using creator function', () => {
		buildViewConverter().for( dispatcher )
			.fromElement( 'img' )
			.toElement( viewElement => new ModelElement( 'image', { src: viewElement.getAttribute( 'src' ) } ) );

		const conversionResult = dispatcher.convert( new ViewContainerElement( 'img', { src: 'foo.jpg' } ), objWithContext );
		modelRoot.appendChildren( conversionResult );

		expect( modelToString( conversionResult ) ).to.equal( '<image src="foo.jpg"></image>' );
	} );

	it( 'should convert from view element to model attribute', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'strong' ).toAttribute( 'bold', true );

		const conversionResult = dispatcher.convert(
			new ViewAttributeElement( 'strong', null, new ViewText( 'foo' ) ), objWithContext
		);
		modelRoot.appendChildren( conversionResult );

		// Have to check root because result is a ModelText.
		expect( modelToString( modelRoot ) ).to.equal( '<$root><$text bold="true">foo</$text></$root>' );
	} );

	it( 'should convert from view element to model attributes using creator function', () => {
		buildViewConverter().for( dispatcher )
			.fromElement( 'a' )
			.toAttribute( viewElement => ( { key: 'linkHref', value: viewElement.getAttribute( 'href' ) } ) );

		const conversionResult = dispatcher.convert(
			new ViewAttributeElement( 'a', { href: 'foo.html' }, new ViewText( 'foo' ) ), objWithContext
		);
		modelRoot.appendChildren( conversionResult );

		// Have to check root because result is a ModelText.
		expect( modelToString( modelRoot ) ).to.equal( '<$root><$text linkHref="foo.html">foo</$text></$root>' );
	} );

	it( 'should convert from view attribute to model attribute', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		buildViewConverter().for( dispatcher )
			.fromAttribute( 'class' )
			.toAttribute( viewElement => ( { key: 'class', value: viewElement.getAttribute( 'class' ) } ) );

		const conversionResult = dispatcher.convert(
			new ViewContainerElement( 'p', { class: 'myClass' }, new ViewText( 'foo' ) ), objWithContext
		);
		modelRoot.appendChildren( conversionResult );

		expect( modelToString( conversionResult ) ).to.equal( '<paragraph class="myClass">foo</paragraph>' );
	} );

	it( 'should convert from view attribute and key to model attribute', () => {
		schema.allow( { name: 'paragraph', attributes: [ 'type' ], inside: '$root' } );

		dispatcher.on( 'documentFragment', convertToModelFragment() );

		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
		buildViewConverter().for( dispatcher ).fromAttribute( 'class', 'important' ).toAttribute( 'important', true );
		buildViewConverter().for( dispatcher ).fromAttribute( 'class', 'theme-nice' ).toAttribute( 'theme', 'nice' );
		buildViewConverter().for( dispatcher ).fromAttribute( 'data-type' ).toAttribute( 'type' );

		const viewStructure = new ViewDocumentFragment( [
			new ViewContainerElement( 'p', { class: 'important' }, new ViewText( 'foo' ) ),
			new ViewContainerElement( 'p', { class: 'important theme-nice' }, new ViewText( 'bar' ) ),
			new ViewContainerElement( 'p', { 'data-type': 'foo' }, new ViewText( 'xyz' ) )
		] );

		const conversionResult = dispatcher.convert( viewStructure, objWithContext );

		expect( modelToString( conversionResult ) ).to.equal(
			'<paragraph important="true">foo</paragraph>' +
			'<paragraph important="true" theme="nice">bar</paragraph>' +
			'<paragraph type="foo">xyz</paragraph>'
		);
	} );

	it( 'should convert from multiple view entities to model attribute', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		buildViewConverter().for( dispatcher )
			.fromElement( 'strong' )
			.fromElement( 'b' )
			.fromAttribute( 'class', 'bold' )
			.fromAttribute( 'style', { 'font-weight': 'bold' } )
			.toAttribute( 'bold', true );

		const viewElement = new ViewContainerElement( 'p', null, [
			new ViewAttributeElement( 'strong', null, new ViewText( 'aaa' ) ),
			new ViewAttributeElement( 'b', null, new ViewText( 'bbb' ) ),
			new ViewContainerElement( 'span', { class: 'bold' }, new ViewText( 'ccc' ) ),
			new ViewContainerElement( 'span', { style: 'font-weight:bold; font-size:20px' }, new ViewText( 'ddd' ) )
		] );

		const conversionResult = dispatcher.convert( viewElement, objWithContext );
		modelRoot.appendChildren( conversionResult );

		expect( modelToString( conversionResult ) ).to.equal( '<paragraph><$text bold="true">aaabbbcccddd</$text></paragraph>' );
	} );

	it( 'should convert from pattern to marker', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
		buildViewConverter().for( dispatcher ).from( { attribute: { 'data-name': 'search' } } ).toMarker();

		const viewElement = new ViewContainerElement( 'p', null, [
			new ViewText( 'Fo' ),
			new ViewAttributeElement( 'marker', { 'data-name': 'search' } ),
			new ViewText( 'o ba' ),
			new ViewAttributeElement( 'marker', { 'data-name': 'search' } ),
			new ViewText( 'r' )
		] );

		const conversionResult = dispatcher.convert( viewElement, objWithContext );

		const markerSearch = conversionResult.markers.get( 'search' );

		expect( conversionResult.markers.size ).to.equal( 1 );
		expect( stringify( conversionResult, markerSearch ) ).to.equal( '<paragraph>Fo[o ba]r</paragraph>' );
	} );

	it( 'should convert from element to marker using creator function', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
		buildViewConverter().for( dispatcher ).fromElement( 'marker' ).toMarker( data => {
			return new ModelElement( '$marker', { 'data-name': data.getAttribute( 'class' ) } );
		} );

		const viewElement = new ViewContainerElement( 'p', null, [
			new ViewText( 'Fo' ),
			new ViewAttributeElement( 'marker', { 'class': 'search' } ),
			new ViewText( 'o ba' ),
			new ViewAttributeElement( 'marker', { 'class': 'search' } ),
			new ViewText( 'r' )
		] );

		const conversionResult = dispatcher.convert( viewElement, objWithContext );

		const markerSearch = conversionResult.markers.get( 'search' );

		expect( conversionResult.markers.size ).to.equal( 1 );
		expect( stringify( conversionResult, markerSearch ) ).to.equal( '<paragraph>Fo[o ba]r</paragraph>' );
	} );

	it( 'should convert from multiple view entities to marker', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
		buildViewConverter().for( dispatcher )
			.from( { attribute: { 'foo': 'marker' } } )
			.from( { attribute: { 'bar': 'marker' } } )
			.from( { attribute: { 'foo': 'marker', 'bar': 'marker' } } )
			.toMarker();

		const viewElement = new ViewContainerElement( 'p', null, [
			new ViewText( 'Fo' ),
			new ViewAttributeElement( 'span', { 'foo': 'marker', 'data-name': 'marker1' } ),
			new ViewText( 'o b' ),
			new ViewAttributeElement( 'span', { 'bar': 'marker', 'data-name': 'marker2' } ),
			new ViewText( 'a' ),
			new ViewAttributeElement( 'span', { 'foo': 'marker', 'bar': 'marker', 'data-name': 'marker3' } ),
			new ViewText( 'r' )
		] );

		const conversionResult = dispatcher.convert( viewElement, objWithContext );

		const marker1 = conversionResult.markers.get( 'marker1' );
		const marker2 = conversionResult.markers.get( 'marker2' );
		const marker3 = conversionResult.markers.get( 'marker3' );

		expect( conversionResult.markers.size ).to.equal( 3 );
		expect( stringify( conversionResult, marker1 ) ).to.equal( '<paragraph>Fo[]o bar</paragraph>' );
		expect( stringify( conversionResult, marker2 ) ).to.equal( '<paragraph>Foo b[]ar</paragraph>' );
		expect( stringify( conversionResult, marker3 ) ).to.equal( '<paragraph>Foo ba[]r</paragraph>' );
	} );

	it( 'should do nothing when there is no element matching to marker pattern', () => {
		buildViewConverter().for( dispatcher ).from( { class: 'color' } ).toMarker();

		const element = new ViewAttributeElement( 'span' );

		const result = dispatcher.convert( element, objWithContext );

		expect( result ).to.be.instanceof( ModelDocumentFragment );
		expect( result.childCount ).to.equal( 0 );
	} );

	it( 'should throw an error when view element in not valid to convert to marker', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'marker' ).toMarker();

		const element = new ViewAttributeElement( 'marker', { class: 'search' } );

		expect( () => {
			dispatcher.convert( element, objWithContext );
		} ).to.throw( CKEditorError, /^build-view-converter-invalid-marker/ );
	} );

	it( 'should throw an error when model element returned by creator has not valid name', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'marker' ).toMarker( () => {
			return new ModelElement( 'element', { 'data-name': 'search' } );
		} );

		const element = new ViewAttributeElement( 'marker', { 'data-name': 'search' } );

		expect( () => {
			dispatcher.convert( element, objWithContext );
		} ).to.throw( CKEditorError, /^build-view-converter-invalid-marker/ );
	} );

	it( 'should throw an error when model element returned by creator has not valid data-name attribute', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'marker' ).toMarker( () => {
			return new ModelElement( '$marker', { 'foo': 'search' } );
		} );

		const element = new ViewAttributeElement( 'marker', { 'data-name': 'search' } );

		expect( () => {
			dispatcher.convert( element, objWithContext );
		} ).to.throw( CKEditorError, /^build-view-converter-invalid-marker/ );
	} );

	it( 'should convert from pattern to model element', () => {
		buildViewConverter().for( dispatcher ).from(
			{ name: 'span', class: 'megatron', attribute: { head: 'megatron', body: 'megatron', legs: 'megatron' } }
		).toElement( 'MEGATRON' );

		// Adding callbacks later so they are called later. MEGATRON callback is more important.
		buildViewConverter().for( dispatcher ).fromElement( 'span' ).toElement( 'span' );
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		let result;

		// Not quite megatron.
		result = dispatcher.convert(
			new ViewContainerElement( 'span', { class: 'megatron' }, new ViewText( 'foo' ) ), objWithContext
		);
		modelRoot.appendChildren( result );
		expect( modelToString( result ) ).to.equal( '<span>foo</span>' );

		// Almost a megatron. Missing a head.
		result = dispatcher.convert(
			new ViewContainerElement( 'span', { class: 'megatron', body: 'megatron', legs: 'megatron' }, new ViewText( 'foo' ) ),
			objWithContext
		);

		modelRoot.appendChildren( result );
		expect( modelToString( result ) ).to.equal( '<span>foo</span>' );

		// This would be a megatron but is a paragraph.
		result = dispatcher.convert(
			new ViewContainerElement(
				'p',
				{ class: 'megatron', body: 'megatron', legs: 'megatron', head: 'megatron' },
				new ViewText( 'foo' )
			),
			objWithContext
		);

		modelRoot.appendChildren( result );
		expect( modelToString( result ) ).to.equal( '<paragraph>foo</paragraph>' );

		// At last we have a megatron!
		result = dispatcher.convert(
			new ViewContainerElement(
				'span',
				{ class: 'megatron', body: 'megatron', legs: 'megatron', head: 'megatron' },
				new ViewText( 'foo' )
			),
			objWithContext
		);

		modelRoot.appendChildren( result );
		expect( modelToString( result ) ).to.equal( '<MEGATRON>foo</MEGATRON>' );
	} );

	it( 'should convert from pattern to model attribute', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'span' ).toElement( 'span' );

		// This time without name so default span converter will convert children.
		buildViewConverter().for( dispatcher )
			.from( { class: 'megatron', attribute: { head: 'megatron', body: 'megatron', legs: 'megatron' } } )
			.toAttribute( 'transformer', 'megatron' );

		const viewElement = new ViewContainerElement(
			'span',
			{ class: 'megatron', body: 'megatron', legs: 'megatron', head: 'megatron' },
			new ViewText( 'foo' )
		);

		const conversionResult = dispatcher.convert( viewElement, objWithContext );

		modelRoot.appendChildren( conversionResult );
		expect( modelToString( conversionResult ) ).to.equal( '<span transformer="megatron">foo</span>' );
	} );

	it( 'should return model document fragment when converting attributes on text', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'strong' ).toAttribute( 'bold', true );

		const viewElement = new ViewAttributeElement( 'strong', null, new ViewText( 'foo' ) );

		const conversionResult = dispatcher.convert( viewElement, objWithContext );

		expect( conversionResult.is( 'documentFragment' ) ).to.be.true;
	} );

	it( 'should set different priorities for `toElement` and `toAttribute` conversion', () => {
		buildViewConverter().for( dispatcher )
			.fromAttribute( 'class' )
			.toAttribute( viewElement => ( { key: 'class', value: viewElement.getAttribute( 'class' ) } ) );
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		const conversionResult = dispatcher.convert(
			new ViewContainerElement( 'p', { class: 'myClass' }, new ViewText( 'foo' ) ), objWithContext
		);
		modelRoot.appendChildren( conversionResult );

		// Element converter was fired first even though attribute converter was added first.
		expect( modelToString( conversionResult ) ).to.equal( '<paragraph class="myClass">foo</paragraph>' );
	} );

	it( 'should overwrite default priorities for converters', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
		buildViewConverter().for( dispatcher )
			.fromAttribute( 'class' )
			.toAttribute( viewElement => ( { key: 'class', value: viewElement.getAttribute( 'class' ) } ) );

		let result;

		result = dispatcher.convert(
			new ViewContainerElement( 'p', { class: 'myClass' }, new ViewText( 'foo' ) ), objWithContext
		);
		modelRoot.appendChildren( result );
		expect( modelToString( result ) ).to.equal( '<paragraph class="myClass">foo</paragraph>' );

		buildViewConverter().for( dispatcher )
			.from( { name: 'p', class: 'myClass' } ).withPriority( 'high' )
			.toElement( 'customP' );

		result = dispatcher.convert(
			new ViewContainerElement( 'p', { class: 'myClass' }, new ViewText( 'foo' ) ), objWithContext
		);
		modelRoot.appendChildren( result );
		expect( modelToString( result ) ).to.equal( '<customP>foo</customP>' );
	} );

	it( 'should overwrite default consumed values', () => {
		// Converter (1).
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		// Converter (2).
		buildViewConverter().for( dispatcher )
			.from( { name: 'p', class: 'decorated' } ).consuming( { class: 'decorated' } )
			.toAttribute( 'decorated', true );

		// Converter (3).
		buildViewConverter().for( dispatcher )
			.fromAttribute( 'class', 'small' ).consuming( { class: 'small' } )
			.toAttribute( 'size', 'small' );

		const viewElement = new ViewContainerElement( 'p', { class: 'decorated small' }, new ViewText( 'foo' ) );

		const conversionResult = dispatcher.convert( viewElement, objWithContext );
		modelRoot.appendChildren( conversionResult );

		// P element and it's children got converted by the converter (1) and the converter (1) got fired
		// because P name was not consumed in converter (2). Converter (3) could consume class="small" because
		// only class="decorated" was consumed in converter (2).
		expect( modelToString( conversionResult ) ).to.equal( '<paragraph decorated="true" size="small">foo</paragraph>' );
	} );

	it( 'should convert from matcher instance to model', () => {
		// Universal class converter, synonymous to .fromAttribute( 'class' ).
		buildViewConverter().for( dispatcher )
			.from( new ViewMatcher( { class: /.*/ } ) )
			.toAttribute( viewElement => ( { key: 'class', value: viewElement.getAttribute( 'class' ) } ) );

		// Universal element converter.
		buildViewConverter().for( dispatcher )
			.from( new ViewMatcher( { name: /.*/ } ) )
			.toElement( viewElement => new ModelElement( viewElement.name ) );

		const viewStructure = new ViewContainerElement( 'div', { class: 'myClass' }, [
			new ViewContainerElement( 'abcd', null, new ViewText( 'foo' ) )
		] );

		const conversionResult = dispatcher.convert( viewStructure, objWithContext );
		modelRoot.appendChildren( conversionResult );

		expect( modelToString( conversionResult ) ).to.equal( '<div class="myClass"><abcd>foo</abcd></div>' );
	} );

	it( 'should filter out structure that is wrong with schema - elements', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'div' ).toElement( 'div' );
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		schema.disallow( { name: 'div', inside: '$root' } );

		dispatcher.on( 'element', convertToModelFragment(), { priority: 'lowest' } );

		const viewElement = new ViewContainerElement( 'div', null,
			new ViewContainerElement( 'p', null,
				new ViewText( 'foo' )
			)
		);

		const conversionResult = dispatcher.convert( viewElement, objWithContext );

		expect( modelToString( conversionResult ) ).to.equal( '<paragraph>foo</paragraph>' );
	} );

	it( 'should filter out structure that is wrong with schema - attributes', () => {
		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
		buildViewConverter().for( dispatcher ).fromElement( 'strong' ).toAttribute( 'bold', true );

		schema.disallow( { name: '$text', attributes: 'bold', inside: 'paragraph' } );

		dispatcher.on( 'element', convertToModelFragment(), { priority: 'lowest' } );

		const viewElement = new ViewContainerElement( 'p', null,
			new ViewAttributeElement( 'strong', null,
				new ViewText( 'foo' )
			)
		);

		const conversionResult = dispatcher.convert( viewElement, objWithContext );

		expect( modelToString( conversionResult ) ).to.equal( '<paragraph>foo</paragraph>' );
	} );

	it( 'should stop to element conversion if creating function returned null', () => {
		buildViewConverter()
			.for( dispatcher )
			.fromElement( 'p' )
			.toElement( viewElement => {
				return viewElement.hasAttribute( 'stop' ) ? null : new ModelElement( 'paragraph' );
			} );

		const viewElement = new ViewContainerElement( 'p' );
		let conversionResult = dispatcher.convert( viewElement, objWithContext );
		expect( modelToString( conversionResult ) ).to.equal( '<paragraph></paragraph>' );

		viewElement.setAttribute( 'stop', true );
		conversionResult = dispatcher.convert( viewElement, objWithContext );

		expect( conversionResult ).to.be.instanceof( ModelDocumentFragment );
		expect( conversionResult.childCount ).to.equal( 0 );
	} );

	it( 'should stop to attribute conversion if creating function returned null', () => {
		schema.allow( { name: 'paragraph', attributes: [ 'type' ], inside: '$root' } );

		buildViewConverter().for( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		buildViewConverter().for( dispatcher ).fromAttribute( 'data-type' ).toAttribute( viewElement => {
			const value = viewElement.getAttribute( 'data-type' );

			return value == 'stop' ? null : { key: 'type', value };
		} );

		const viewElement = new ViewContainerElement( 'p', { 'data-type': 'foo' } );
		let conversionResult = dispatcher.convert( viewElement, objWithContext );
		expect( modelToString( conversionResult ) ).to.equal( '<paragraph type="foo"></paragraph>' );

		viewElement.setAttribute( 'data-type', 'stop' );
		conversionResult = dispatcher.convert( viewElement, objWithContext );
		expect( modelToString( conversionResult ) ).to.equal( '<paragraph></paragraph>' );
	} );
} );
