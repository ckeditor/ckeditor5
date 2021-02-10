/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import DataSchema from '../src/dataschema';

import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'DataSchema', () => {
	let editor, model, dataSchema;

	beforeEach( () => {
		return VirtualTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				dataSchema = new DataSchema( editor );

				// Define some made up type definitions for testing purposes.
				dataSchema.register( { view: 'div', model: 'ghsDiv', schema: {
					inheritAllFrom: '$block',
					allowIn: 'ghsDiv'
				} } );
				dataSchema.register( { view: 'article', model: 'ghsArticle', schema: '$block' } );
				dataSchema.register( { view: 'section', model: 'ghsSection', schema: {
					inheritAllFrom: '$block',
					allowIn: 'ghsArticle'
				} } );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should allow element', () => {
		dataSchema.allowElement( { name: 'article' } );

		editor.setData( '<article><section>section1</section><section>section2</section></article>' );

		expect( getModelData( model, { withoutSelection: true } ) ).to.eq(
			'<ghsArticle>section1section2</ghsArticle>'
		);

		expect( editor.getData() ).to.eq(
			'<article>section1section2</article>'
		);

		dataSchema.allowElement( { name: 'section' } );

		editor.setData( '<article><section>section1</section><section>section2</section></article>' );

		expect( getModelData( model, { withoutSelection: true } ) ).to.eq(
			'<ghsArticle><ghsSection>section1</ghsSection><ghsSection>section2</ghsSection></ghsArticle>'
		);

		expect( editor.getData() ).to.eq(
			'<article><section>section1</section><section>section2</section></article>'
		);
	} );

	it( 'should allow deeply nested structure', () => {
		dataSchema.allowElement( { name: 'div' } );

		editor.setData( '<div>1<div>2<div>3</div></div></div>' );

		expect( getModelData( model, { withoutSelection: true } ) ).to.eq(
			'<ghsDiv>1<ghsDiv>2<ghsDiv>3</ghsDiv></ghsDiv></ghsDiv>'
		);

		expect( editor.getData() ).to.eq(
			'<div>1<div>2<div>3</div></div></div>'
		);
	} );

	it( 'should allow attributes', () => {
		dataSchema.allowElement( { name: 'div' } );
		dataSchema.allowAttributes( { name: 'div', attributes: {
			'data-foo': 'foobar'
		} } );

		editor.setData( '<div data-foo="foobar">foobar</div>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.eq( {
			data: '<ghsDiv ghsAttributes="(1)">foobar</ghsDiv>',
			attributes: {
				1: [ [ 'data-foo', 'foobar' ] ]
			}
		} );

		expect( editor.getData() ).to.eq(
			'<div data-foo="foobar">foobar</div>'
		);
	} );

	it( 'should allow attributes (styles)', () => {
		dataSchema.allowElement( { name: 'div' } );
		dataSchema.allowAttributes( { name: 'div', styles: {
			'color': 'red'
		} } );

		editor.setData( '<div style="color:red;">foobar</div>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.eq( {
			data: '<ghsDiv ghsAttributes="(1)">foobar</ghsDiv>',
			attributes: {
				1: [ [ 'style', { color: 'red' } ] ]
			}
		} );

		expect( editor.getData() ).to.eq(
			'<div style="color:red;">foobar</div>'
		);
	} );

	it( 'should allow attributes (classes)', () => {
		dataSchema.allowElement( { name: 'div' } );
		dataSchema.allowAttributes( { name: 'div', classes: [ 'foo', 'bar' ] } );

		editor.setData( '<div class="foo bar">foobar</div>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.eq( {
			data: '<ghsDiv ghsAttributes="(1)">foobar</ghsDiv>',
			attributes: {
				1: [ [ 'class', [ 'foo', 'bar' ] ] ]
			}
		} );

		expect( editor.getData() ).to.eq(
			'<div class="foo bar">foobar</div>'
		);
	} );

	it( 'should allow nested attributes', () => {
		dataSchema.allowElement( { name: /article|section/ } );
		dataSchema.allowAttributes( { attributes: { 'data-foo': /foo|bar/ } } );

		editor.setData( '<article data-foo="foo">' +
				'<section data-foo="bar">section1</secton>' +
				'<section data-foo="foo">section2</section>' +
			'</article>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.eq( {
			data: '<ghsArticle ghsAttributes="(1)">' +
				'<ghsSection ghsAttributes="(2)">section1</ghsSection>' +
				'<ghsSection ghsAttributes="(3)">section2</ghsSection>' +
			'</ghsArticle>',
			attributes: {
				1: [ [ 'data-foo', 'foo' ] ],
				2: [ [ 'data-foo', 'bar' ] ],
				3: [ [ 'data-foo', 'foo' ] ]
			}
		} );
	} );

	it( 'should allow attributes for all allowed definitions', () => {
		dataSchema.allowElement( { name: 'div' } );
		dataSchema.allowElement( { name: 'article' } );
		// We skip name purposely to allow attribute on every data schema element.
		dataSchema.allowAttributes( { attributes: { 'data-foo': 'foo' } } );
		dataSchema.allowAttributes( { attributes: { 'data-bar': 'bar' } } );

		editor.setData( '<div data-foo="foo">foo</div><article data-bar="bar">bar</article>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.eq( {
			data: '<ghsDiv ghsAttributes="(1)">foo</ghsDiv><ghsArticle ghsAttributes="(2)">bar</ghsArticle>',
			attributes: {
				1: [ [ 'data-foo', 'foo' ] ],
				2: [ [ 'data-bar', 'bar' ] ]
			}
		} );

		expect( editor.getData() ).to.eq(
			'<div data-foo="foo">foo</div><article data-bar="bar">bar</article>'
		);
	} );

	it( 'should disallow attributes', () => {
		dataSchema.allowElement( { name: 'div' } );
		dataSchema.allowAttributes( { name: 'div', attributes: { 'data-foo': /[^]/ } } );
		dataSchema.disallowAttributes( { name: 'div', attributes: { 'data-foo': 'bar' } } );

		editor.setData( '<div data-foo="foo">foo</div><div data-foo="bar">bar</div>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.eq( {
			data: '<ghsDiv ghsAttributes="(1)">foo</ghsDiv><ghsDiv>bar</ghsDiv>',
			attributes: {
				1: [ [ 'data-foo', 'foo' ] ]
			}
		} );

		expect( editor.getData() ).to.eq(
			'<div data-foo="foo">foo</div><div>bar</div>'
		);
	} );

	it( 'should disallow attributes (styles)', () => {
		dataSchema.allowElement( { name: 'div' } );
		dataSchema.allowAttributes( { name: 'div', styles: { color: /[^]/ } } );
		dataSchema.disallowAttributes( { name: 'div', styles: { color: 'red' } } );

		editor.setData( '<div style="color:blue;">foo</div><div style="color:red">bar</div>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.eq( {
			data: '<ghsDiv ghsAttributes="(1)">foo</ghsDiv><ghsDiv>bar</ghsDiv>',
			attributes: {
				1: [ [ 'style', { color: 'blue' } ] ]
			}
		} );

		expect( editor.getData() ).to.eq(
			'<div style="color:blue;">foo</div><div>bar</div>'
		);
	} );

	it( 'should disallow attributes (classes)', () => {
		dataSchema.allowElement( { name: 'div' } );
		dataSchema.allowAttributes( { name: 'div', classes: [ 'foo', 'bar' ] } );
		dataSchema.disallowAttributes( { name: 'div', classes: [ 'bar' ] } );

		editor.setData( '<div class="foo bar">foo</div><div class="bar">bar</div>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.eq( {
			data: '<ghsDiv ghsAttributes="(1)">foo</ghsDiv><ghsDiv>bar</ghsDiv>',
			attributes: {
				1: [ [ 'class', [ 'foo' ] ] ]
			}
		} );

		expect( editor.getData() ).to.eq(
			'<div class="foo">foo</div><div>bar</div>'
		);
	} );
} );

function getModelDataWithAttributes( model, options ) {
	// Simplify GHS attributes as they are not readable at this point due to complex structure.
	let counter = 1;
	const data = getModelData( model, options ).replace( /ghsAttributes="(.*?)"/g, () => {
		return `ghsAttributes="(${ counter++ })"`;
	} );

	const range = model.createRangeIn( model.document.getRoot() );

	let attributes = [];
	for ( const item of range.getItems() ) {
		if ( item.hasAttribute && item.hasAttribute( 'ghsAttributes' ) ) {
			attributes.push( item.getAttribute( 'ghsAttributes' ) );
		}
	}

	attributes = attributes.reduce( ( prev, cur, index ) => {
		prev[ index + 1 ] = cur;
		return prev;
	}, {} );

	return { data, attributes };
}
