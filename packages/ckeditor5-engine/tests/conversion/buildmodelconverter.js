/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: conversion */

import buildModelConverter from '/ckeditor5/engine/conversion/buildmodelconverter.js';

import ModelDocument from '/ckeditor5/engine/model/document.js';
import ModelElement from '/ckeditor5/engine/model/element.js';
import ModelText from '/ckeditor5/engine/model/text.js';
import ModelRange from '/ckeditor5/engine/model/range.js';
import ModelPosition from '/ckeditor5/engine/model/position.js';
import modelWriter from '/ckeditor5/engine/model/writer.js';

import ViewDocument from '/ckeditor5/engine/view/document.js';
import ViewElement from '/ckeditor5/engine/view/element.js';
import ViewContainerElement from '/ckeditor5/engine/view/containerelement.js';
import ViewAttributeElement from '/ckeditor5/engine/view/attributeelement.js';
import ViewText from '/ckeditor5/engine/view/text.js';

import Mapper from '/ckeditor5/engine/conversion/mapper.js';
import ModelConversionDispatcher from '/ckeditor5/engine/conversion/modelconversiondispatcher.js';

import {
	insertText,
	move,
	remove
} from '/ckeditor5/engine/conversion/model-to-view-converters.js';

import {
	convertCollapsedSelection,
	clearAttributes
} from '/ckeditor5/engine/conversion/model-selection-to-view-converters.js';

import { createRangeOnElementOnly } from '/tests/engine/model/_utils/utils.js';

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

describe( 'Model converter builder', () => {
	let dispatcher, mapper;
	let modelDoc, modelRoot;
	let viewDoc, viewRoot, viewSelection;

	beforeEach( () => {
		modelDoc = new ModelDocument();
		modelRoot = modelDoc.createRoot( 'root', 'root' );

		viewDoc = new ViewDocument();
		viewRoot = viewDoc.createRoot( 'div' );
		viewSelection = viewDoc.selection;

		mapper = new Mapper();
		mapper.bindElements( modelRoot, viewRoot );

		dispatcher = new ModelConversionDispatcher( { mapper, viewSelection } );

		dispatcher.on( 'insert:$text', insertText() );
		dispatcher.on( 'move', move() );
		dispatcher.on( 'remove', remove() );
	} );

	describe( 'model element to view element conversion', () => {
		it( 'using passed view element name', () => {
			buildModelConverter().for( dispatcher ).fromElement( 'paragraph' ).toElement( 'p' );

			let modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foobar' ) );
			modelRoot.appendChildren( modelElement );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'using passed view element', () => {
			buildModelConverter().for( dispatcher ).fromElement( 'image' ).toElement( new ViewContainerElement( 'img' ) );

			let modelElement = new ModelElement( 'image' );
			modelRoot.appendChildren( modelElement );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><img></img></div>' );
		} );

		it( 'using passed creator function', () => {
			buildModelConverter().for( dispatcher )
				.fromElement( 'header' )
				.toElement( ( data ) => new ViewContainerElement( 'h' + data.item.getAttribute( 'level' ) ) );

			let modelElement = new ModelElement( 'header', { level: 2 }, new ModelText( 'foobar' ) );
			modelRoot.appendChildren( modelElement );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><h2>foobar</h2></div>' );
		} );
	} );

	describe( 'model attribute to view element conversion', () => {
		beforeEach( () => {
			buildModelConverter().for( dispatcher ).fromElement( 'paragraph' ).toElement( 'p' );
		} );

		it( 'using passed view element name', () => {
			buildModelConverter().for( dispatcher ).fromAttribute( 'bold' ).toElement( 'strong' );

			let modelElement = new ModelText( 'foo', { bold: true } );
			modelRoot.appendChildren( modelElement );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><strong>foo</strong></div>' );

			modelWriter.removeAttribute( ModelRange.createIn( modelRoot ), 'bold' );

			dispatcher.convertAttribute( 'removeAttribute', ModelRange.createIn( modelRoot ), 'bold', true, null );

			expect( viewToString( viewRoot ) ).to.equal( '<div>foo</div>' );
		} );

		it( 'using passed view element', () => {
			buildModelConverter().for( dispatcher ).fromAttribute( 'bold' ).toElement( new ViewAttributeElement( 'strong' ) );

			let modelElement = new ModelText( 'foo', { bold: true } );
			modelRoot.appendChildren( modelElement );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><strong>foo</strong></div>' );

			modelWriter.removeAttribute( ModelRange.createIn( modelRoot ), 'bold' );

			dispatcher.convertAttribute( 'removeAttribute', ModelRange.createIn( modelRoot ), 'bold', true, null );

			expect( viewToString( viewRoot ) ).to.equal( '<div>foo</div>' );
		} );

		it( 'using passed creator function', () => {
			buildModelConverter().for( dispatcher ).fromAttribute( 'italic' ).toElement( ( value ) => new ViewAttributeElement( value ) );

			let modelElement = new ModelText( 'foo', { italic: 'em' } );
			modelRoot.appendChildren( modelElement );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><em>foo</em></div>' );

			modelWriter.setAttribute( ModelRange.createIn( modelRoot ), 'italic', 'i' );

			dispatcher.convertAttribute( 'changeAttribute', ModelRange.createIn( modelRoot ), 'italic', 'em', 'i' );

			expect( viewToString( viewRoot ) ).to.equal( '<div><i>foo</i></div>' );

			modelWriter.removeAttribute( ModelRange.createIn( modelRoot ), 'italic' );

			dispatcher.convertAttribute( 'removeAttribute', ModelRange.createIn( modelRoot ), 'italic', 'i', null );

			expect( viewToString( viewRoot ) ).to.equal( '<div>foo</div>' );
		} );

		it( 'selection conversion', () => {
			// This test requires collapsed range selection converter (breaking attributes)  and clearing "artifacts".
			dispatcher.on( 'selection', clearAttributes() );
			dispatcher.on( 'selection', convertCollapsedSelection() );

			// Model converter builder should add selection converter.
			buildModelConverter().for( dispatcher ).fromAttribute( 'italic' ).toElement( ( value ) => new ViewAttributeElement( value ) );

			modelRoot.appendChildren( new ModelText( 'foo', { italic: 'em' } ) );

			// Set collapsed selection after "f".
			const position = new ModelPosition( modelRoot, [ 1 ] );
			modelDoc.selection.setRanges( [ new ModelRange( position, position ) ] );
			modelDoc.selection._updateAttributes();

			// Convert stuff.
			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );
			dispatcher.convertSelection( modelDoc.selection );

			// Check if view structure is ok.
			expect( viewToString( viewRoot ) ).to.equal( '<div><em>foo</em></div>' );

			// Check if view selection is collapsed after "f" letter.
			let ranges = Array.from( viewSelection.getRanges() );
			expect( ranges.length ).to.equal( 1 );
			expect( ranges[ 0 ].start.isEqual( ranges[ 0 ].end ) ).to.be.true;
			expect( ranges[ 0 ].start.parent ).to.be.instanceof( ViewText ); // "foo".
			expect( ranges[ 0 ].start.offset ).to.equal( 1 );

			// Change selection attribute, convert it.
			modelDoc.selection.setAttribute( 'italic', 'i' );
			dispatcher.convertSelection( modelDoc.selection );

			// Check if view structure has changed.
			expect( viewToString( viewRoot ) ).to.equal( '<div><em>f</em><i></i><em>oo</em></div>' );

			// Check if view selection is inside new <em> element.
			ranges = Array.from( viewSelection.getRanges() );
			expect( ranges.length ).to.equal( 1 );
			expect( ranges[ 0 ].start.isEqual( ranges[ 0 ].end ) ).to.be.true;
			expect( ranges[ 0 ].start.parent.name ).to.equal( 'i' );
			expect( ranges[ 0 ].start.offset ).to.equal( 0 );

			// Some more tests checking how selection attributes changes are converted:
			modelDoc.selection.removeAttribute( 'italic' );
			dispatcher.convertSelection( modelDoc.selection );

			expect( viewToString( viewRoot ) ).to.equal( '<div><em>f</em><em>oo</em></div>' );
			ranges = Array.from( viewSelection.getRanges() );
			expect( ranges[ 0 ].start.parent.name ).to.equal( 'div' );
			expect( ranges[ 0 ].start.offset ).to.equal( 1 );

			modelDoc.selection.setAttribute( 'italic', 'em' );
			dispatcher.convertSelection( modelDoc.selection );

			expect( viewToString( viewRoot ) ).to.equal( '<div><em>foo</em></div>' );
			ranges = Array.from( viewSelection.getRanges() );
			expect( ranges.length ).to.equal( 1 );
			expect( ranges[ 0 ].start.isEqual( ranges[ 0 ].end ) ).to.be.true;
			expect( ranges[ 0 ].start.parent ).to.be.instanceof( ViewText ); // "foo".
			expect( ranges[ 0 ].start.offset ).to.equal( 1 );
		} );
	} );

	describe( 'model attribute to view attribute conversion', () => {
		beforeEach( () => {
			buildModelConverter().for( dispatcher ).fromElement( 'paragraph' ).toElement( 'p' );
		} );

		it( 'using default 1-to-1 conversion', () => {
			buildModelConverter().for( dispatcher ).fromAttribute( 'class' ).toAttribute();

			let modelElement = new ModelElement( 'paragraph', { class: 'myClass' }, new ModelText( 'foobar' ) );
			modelRoot.appendChildren( modelElement );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p class="myClass">foobar</p></div>' );

			modelElement.setAttribute( 'class', 'newClass' );
			dispatcher.convertAttribute( 'changeAttribute', createRangeOnElementOnly( modelElement ), 'class', 'myClass', 'newClass' );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p class="newClass">foobar</p></div>' );

			modelElement.removeAttribute( 'class' );
			dispatcher.convertAttribute( 'removeAttribute', createRangeOnElementOnly( modelElement ), 'class', 'newClass', null );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'using passed attribute key', () => {
			buildModelConverter().for( dispatcher ).fromAttribute( 'theme' ).toAttribute( 'class' );

			let modelElement = new ModelElement( 'paragraph', { theme: 'abc' }, new ModelText( 'foobar' ) );
			modelRoot.appendChildren( modelElement );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p class="abc">foobar</p></div>' );

			modelElement.setAttribute( 'theme', 'xyz' );
			dispatcher.convertAttribute( 'changeAttribute', createRangeOnElementOnly( modelElement ), 'theme', 'abc', 'xyz' );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p class="xyz">foobar</p></div>' );

			modelElement.removeAttribute( 'theme' );
			dispatcher.convertAttribute( 'removeAttribute', createRangeOnElementOnly( modelElement ), 'theme', 'xyz', null );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'using passed attribute key and value', () => {
			buildModelConverter().for( dispatcher ).fromAttribute( 'highlighted' ).toAttribute( 'style', 'background:yellow' );

			let modelElement = new ModelElement( 'paragraph', { 'highlighted': true }, new ModelText( 'foobar' ) );
			modelRoot.appendChildren( modelElement );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p style="background:yellow;">foobar</p></div>' );

			modelElement.removeAttribute( 'highlighted' );
			dispatcher.convertAttribute( 'removeAttribute', createRangeOnElementOnly( modelElement ), 'highlighted', true, null );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );

		it( 'using passed attribute creator function', () => {
			buildModelConverter().for( dispatcher )
				.fromAttribute( 'theme' )
				.toAttribute( ( value ) => ( { key: 'class', value: value + '-theme' } ) );

			let modelElement = new ModelElement( 'paragraph', { theme: 'nice' }, new ModelText( 'foobar' ) );
			modelRoot.appendChildren( modelElement );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p class="nice-theme">foobar</p></div>' );

			modelElement.setAttribute( 'theme', 'good' );
			dispatcher.convertAttribute( 'changeAttribute', createRangeOnElementOnly( modelElement ), 'theme', 'nice', 'good' );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p class="good-theme">foobar</p></div>' );

			modelElement.removeAttribute( 'theme' );
			dispatcher.convertAttribute( 'removeAttribute', createRangeOnElementOnly( modelElement ), 'theme', 'good', null );

			expect( viewToString( viewRoot ) ).to.equal( '<div><p>foobar</p></div>' );
		} );
	} );

	describe( 'withPriority', () => {
		it( 'should change default converters priority', () => {
			buildModelConverter().for( dispatcher ).fromElement( 'custom' ).toElement( 'custom' );
			buildModelConverter().for( dispatcher ).fromElement( 'custom' ).withPriority( 'high' ).toElement( 'other' );

			let modelElement = new ModelElement( 'custom', null, new ModelText( 'foobar' ) );
			modelRoot.appendChildren( modelElement );

			dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

			expect( viewToString( viewRoot ) ).to.equal( '<div><other>foobar</other></div>' );
		} );
	} );

	it( 'should do nothing on model element to view attribute conversion', () => {
		buildModelConverter().for( dispatcher ).fromElement( 'div' ).toElement( 'div' );
		// Should do nothing:
		buildModelConverter().for( dispatcher ).fromElement( 'paragraph' ).toAttribute( 'paragraph', true );
		// If above would do something this one would not be fired:
		buildModelConverter().for( dispatcher ).fromElement( 'paragraph' ).toElement( 'p' );

		let modelElement = new ModelElement( 'div', null, new ModelElement( 'paragraph', null, new ModelText( 'foobar' ) ) );
		modelRoot.appendChildren( modelElement );

		dispatcher.convertInsertion( ModelRange.createIn( modelRoot ) );

		expect( viewToString( viewRoot ) ).to.equal( '<div><div><p>foobar</p></div></div>' );
	} );
} );
