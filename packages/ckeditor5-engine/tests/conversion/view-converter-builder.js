/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: conversion */

'use strict';

import BuildViewConverterFor from '/ckeditor5/engine/conversion/view-converter-builder.js';

import ModelSchema from '/ckeditor5/engine/model/schema.js';
import ModelDocument from '/ckeditor5/engine/model/document.js';
import ModelElement from '/ckeditor5/engine/model/element.js';
import ModelTextProxy from '/ckeditor5/engine/model/textproxy.js';
import ModelRange from '/ckeditor5/engine/model/range.js';
import ModelWalker from '/ckeditor5/engine/model/treewalker.js';

import ViewDocumentFragment from '/ckeditor5/engine/view/documentfragment.js';
import ViewContainerElement from '/ckeditor5/engine/view/containerelement.js';
import ViewAttributeElement from '/ckeditor5/engine/view/attributeelement.js';
import ViewText from '/ckeditor5/engine/view/text.js';
import ViewMatcher from '/ckeditor5/engine/view/matcher.js';

import ViewConversionDispatcher from '/ckeditor5/engine/conversion/viewconversiondispatcher.js';

import { convertToModelFragment, convertText } from '/ckeditor5/engine/conversion/view-to-model-converters.js';

function modelAttributesToString( item ) {
	let result = '';

	for ( let attr of item.getAttributes() ) {
		result += ' ' + attr[ 0 ] + '="' + attr[ 1 ] + '"';
	}

	return result;
}

function modelToString( item ) {
	let result = '';

	if ( item instanceof ModelTextProxy ) {
		let attributes = modelAttributesToString( item );

		result = attributes ? '<$text' + attributes + '>' + item.text + '</$text>' : item.text;
	} else {
		let walker = new ModelWalker( { boundaries: ModelRange.createFromElement( item ), shallow: true } );

		for ( let value of walker ) {
			result += modelToString( value.item );
		}

		if ( item instanceof ModelElement ) {
			let attributes = modelAttributesToString( item );

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
		BuildViewConverterFor( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		const result = dispatcher.convert( new ViewContainerElement( 'p', null, new ViewText( 'foo' ) ), objWithContext );
		modelRoot.appendChildren( result );

		expect( modelToString( result ) ).to.equal( '<paragraph>foo</paragraph>' );
	} );

	it( 'should convert from view element to model element using creator function', () => {
		BuildViewConverterFor( dispatcher )
			.fromElement( 'img' )
			.toElement( ( viewElement ) => new ModelElement( 'image', { src: viewElement.getAttribute( 'src' ) } ) );

		const result = dispatcher.convert( new ViewContainerElement( 'img', { src: 'foo.jpg' } ), objWithContext );
		modelRoot.appendChildren( result );

		expect( modelToString( result ) ).to.equal( '<image src="foo.jpg"></image>' );
	} );

	it( 'should convert from view element to model attribute', () => {
		BuildViewConverterFor( dispatcher ).fromElement( 'strong' ).toAttribute( 'bold', true );

		const result = dispatcher.convert( new ViewAttributeElement( 'strong', null, new ViewText( 'foo' ) ), objWithContext );
		modelRoot.appendChildren( result );

		// Have to check root because result is a ModelText.
		expect( modelToString( modelRoot ) ).to.equal( '<$root><$text bold="true">foo</$text></$root>' );
	} );

	it( 'should convert from view element to model attributes using creator function', () => {
		BuildViewConverterFor( dispatcher )
			.fromElement( 'a' )
			.toAttribute( ( viewElement ) => ( { key: 'linkHref', value: viewElement.getAttribute( 'href' ) } ) );

		const result = dispatcher.convert( new ViewAttributeElement( 'a', { href: 'foo.html' }, new ViewText( 'foo' ) ), objWithContext );
		modelRoot.appendChildren( result );

		// Have to check root because result is a ModelText.
		expect( modelToString( modelRoot ) ).to.equal( '<$root><$text linkHref="foo.html">foo</$text></$root>' );
	} );

	it( 'should convert from view attribute to model attribute', () => {
		BuildViewConverterFor( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		BuildViewConverterFor( dispatcher )
			.fromAttribute( 'class' )
			.toAttribute( ( viewElement ) => ( { key: 'class', value: viewElement.getAttribute( 'class' ) } ) );

		const result = dispatcher.convert( new ViewContainerElement( 'p', { class: 'myClass' }, new ViewText( 'foo' ) ), objWithContext );
		modelRoot.appendChildren( result );

		expect( modelToString( result ) ).to.equal( '<paragraph class="myClass">foo</paragraph>' );
	} );

	it( 'should convert from view attribute and key to model attribute', () => {
		dispatcher.on( 'documentFragment', convertToModelFragment() );

		BuildViewConverterFor( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
		BuildViewConverterFor( dispatcher ).fromAttribute( 'class', 'important' ).toAttribute( 'important', true );
		BuildViewConverterFor( dispatcher ).fromAttribute( 'class', 'theme-nice' ).toAttribute( 'theme', 'nice' );

		const viewStructure = new ViewDocumentFragment( [
			new ViewContainerElement( 'p', { class: 'important' }, new ViewText( 'foo' ) ),
			new ViewContainerElement( 'p', { class: 'important theme-nice' }, new ViewText( 'bar' ) )
		] );

		const result = dispatcher.convert( viewStructure, objWithContext );

		expect( modelToString( result ) )
			.to.equal( '<paragraph important="true">foo</paragraph><paragraph important="true" theme="nice">bar</paragraph>' );
	} );

	it( 'should convert from multiple view entities to model attribute', () => {
		BuildViewConverterFor( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		BuildViewConverterFor( dispatcher )
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

		const result = dispatcher.convert( viewElement, objWithContext );
		modelRoot.appendChildren( result );

		expect( modelToString( result ) ).to.equal( '<paragraph><$text bold="true">aaabbbcccddd</$text></paragraph>' );
	} );

	it( 'should convert from pattern to model element', () => {
		BuildViewConverterFor( dispatcher ).from(
			{ name: 'span', class: 'megatron', attribute: { head: 'megatron', body: 'megatron', legs: 'megatron' } }
		).toElement( 'MEGATRON' );

		// Adding callbacks later so they are called later. MEGATRON callback is more important.
		BuildViewConverterFor( dispatcher ).fromElement( 'span' ).toElement( 'span' );
		BuildViewConverterFor( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		let result;

		// Not quite megatron.
		result = dispatcher.convert( new ViewContainerElement( 'span', { class: 'megatron' }, new ViewText( 'foo' ) ), objWithContext );
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
		BuildViewConverterFor( dispatcher ).fromElement( 'span' ).toElement( 'span' );

		// This time without name so default span converter will convert children.
		BuildViewConverterFor( dispatcher )
			.from( { class: 'megatron', attribute: { head: 'megatron', body: 'megatron', legs: 'megatron' } } )
			.toAttribute( 'transformer', 'megatron' );

		let viewElement = new ViewContainerElement(
			'span',
			{ class: 'megatron', body: 'megatron', legs: 'megatron', head: 'megatron' },
			new ViewText( 'foo' )
		);

		let result = dispatcher.convert( viewElement, objWithContext );

		modelRoot.appendChildren( result );
		expect( modelToString( result ) ).to.equal( '<span transformer="megatron">foo</span>' );
	} );

	it( 'should set different priorities for `toElement` and `toAttribute` conversion', () => {
		BuildViewConverterFor( dispatcher )
			.fromAttribute( 'class' )
			.toAttribute( ( viewElement ) => ( { key: 'class', value: viewElement.getAttribute( 'class' ) } ) );
		BuildViewConverterFor( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		let result = dispatcher.convert( new ViewContainerElement( 'p', { class: 'myClass' }, new ViewText( 'foo' ) ), objWithContext );
		modelRoot.appendChildren( result );

		// Element converter was fired first even though attribute converter was added first.
		expect( modelToString( result ) ).to.equal( '<paragraph class="myClass">foo</paragraph>' );
	} );

	it( 'should overwrite default priorities for converters', () => {
		BuildViewConverterFor( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );
		BuildViewConverterFor( dispatcher )
			.fromAttribute( 'class' )
			.toAttribute( ( viewElement ) => ( { key: 'class', value: viewElement.getAttribute( 'class' ) } ) );

		let result;

		result = dispatcher.convert( new ViewContainerElement( 'p', { class: 'myClass' }, new ViewText( 'foo' ) ), objWithContext );
		modelRoot.appendChildren( result );
		expect( modelToString( result ) ).to.equal( '<paragraph class="myClass">foo</paragraph>' );

		BuildViewConverterFor( dispatcher )
			.from( { name: 'p', class: 'myClass' } ).withPriority( -1 ) // Default for `toElement` is 0.
			.toElement( 'customP' );

		result = dispatcher.convert( new ViewContainerElement( 'p', { class: 'myClass' }, new ViewText( 'foo' ) ), objWithContext );
		modelRoot.appendChildren( result );
		expect( modelToString( result ) ).to.equal( '<customP>foo</customP>' );
	} );

	it( 'should overwrite default consumed values', () => {
		// Converter (1).
		BuildViewConverterFor( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		// Converter (2).
		BuildViewConverterFor( dispatcher )
			.from( { name: 'p', class: 'decorated' } ).consuming( { class: 'decorated' } )
			.toAttribute( 'decorated', true );

		// Converter (3).
		BuildViewConverterFor( dispatcher )
			.fromAttribute( 'class', 'small' ).consuming( { class: 'small' } )
			.toAttribute( 'size', 'small' );

		const viewElement = new ViewContainerElement( 'p', { class: 'decorated small' }, new ViewText( 'foo' ) );

		const result = dispatcher.convert( viewElement, objWithContext );
		modelRoot.appendChildren( result );

		// P element and it's children got converted by the converter (1) and the converter (1) got fired
		// because P name was not consumed in converter (2). Converter (3) could consume class="small" because
		// only class="decorated" was consumed in converter (2).
		expect( modelToString( result ) ).to.equal( '<paragraph decorated="true" size="small">foo</paragraph>' );
	} );

	it( 'should convert from matcher instance to model', () => {
		// Universal class converter, synonymous to .fromAttribute( 'class' ).
		BuildViewConverterFor( dispatcher )
			.from( new ViewMatcher( { class: /.*/ } ) )
			.toAttribute( ( viewElement ) => ( { key: 'class', value: viewElement.getAttribute( 'class' ) } ) );

		// Universal element converter.
		BuildViewConverterFor( dispatcher )
			.from( new ViewMatcher( { name: /.*/ } ) )
			.toElement( ( viewElement ) => new ModelElement( viewElement.name ) );

		let viewStructure = new ViewContainerElement( 'div', { class: 'myClass' }, [
			new ViewContainerElement( 'abcd', null, new ViewText( 'foo' ) )
		] );

		let result = dispatcher.convert( viewStructure, objWithContext );
		modelRoot.appendChildren( result );

		expect( modelToString( result ) ).to.equal( '<div class="myClass"><abcd>foo</abcd></div>' );
	} );

	it( 'should filter out structure that is wrong with schema', () => {
		BuildViewConverterFor( dispatcher ).fromElement( 'strong' ).toAttribute( 'bold', true );
		BuildViewConverterFor( dispatcher ).fromElement( 'div' ).toElement( 'div' );
		BuildViewConverterFor( dispatcher ).fromElement( 'p' ).toElement( 'paragraph' );

		schema.disallow( { name: '$text', attributes: 'bold', inside: 'paragraph' } );
		schema.disallow( { name: 'div', inside: '$root' } );

		dispatcher.on( 'element', convertToModelFragment() );

		let viewElement = new ViewContainerElement( 'div', null,
			new ViewContainerElement( 'p', null,
				new ViewAttributeElement( 'strong', null,
					new ViewText( 'foo' )
				)
			)
		);

		let result = dispatcher.convert( viewElement, objWithContext );

		expect( modelToString( result ) ).to.equal( '<paragraph>foo</paragraph>' );
	} );
} );
