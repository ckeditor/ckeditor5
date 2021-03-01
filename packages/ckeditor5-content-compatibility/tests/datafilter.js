/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import DataSchema from '../src/dataschema';
import DataFilter from '../src/datafilter';

import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'DataFilter', () => {
	let editor, model, dataFilter;

	beforeEach( () => {
		return VirtualTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				dataFilter = new DataFilter( editor, new DataSchema() );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should allow element', () => {
		dataFilter.allowElement( { name: 'article' } );

		editor.setData( '<article><section>section1</section><section>section2</section></article>' );

		expect( getModelData( model, { withoutSelection: true } ) ).to.eq(
			'<ghsArticle>section1section2</ghsArticle>'
		);

		expect( editor.getData() ).to.eq(
			'<article>section1section2</article>'
		);

		dataFilter.allowElement( { name: 'section' } );

		editor.setData( '<article><section>section1</section><section>section2</section></article>' );

		expect( getModelData( model, { withoutSelection: true } ) ).to.eq(
			'<ghsArticle><ghsSection>section1</ghsSection><ghsSection>section2</ghsSection></ghsArticle>'
		);

		expect( editor.getData() ).to.eq(
			'<article><section>section1</section><section>section2</section></article>'
		);
	} );

	it( 'should allow deeply nested structure', () => {
		dataFilter.allowElement( { name: 'section' } );

		editor.setData( '<section>1<section>2<section>3</section></section></section>' );

		expect( getModelData( model, { withoutSelection: true } ) ).to.eq(
			'<ghsSection>1<ghsSection>2<ghsSection>3</ghsSection></ghsSection></ghsSection>'
		);

		expect( editor.getData() ).to.eq(
			'<section>1<section>2<section>3</section></section></section>'
		);
	} );

	it( 'should allow attributes', () => {
		dataFilter.allowElement( { name: 'section' } );
		dataFilter.allowAttributes( { name: 'section', attributes: {
			'data-foo': 'foobar'
		} } );

		editor.setData( '<section data-foo="foobar">foobar</section>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.eq( {
			data: '<ghsSection ghsAttributes="(1)">foobar</ghsSection>',
			attributes: {
				1: {
					attributes: {
						'data-foo': 'foobar'
					}
				}
			}
		} );

		expect( editor.getData() ).to.eq(
			'<section data-foo="foobar">foobar</section>'
		);
	} );

	it( 'should allow attributes (styles)', () => {
		dataFilter.allowElement( { name: 'section' } );
		dataFilter.allowAttributes( { name: 'section', styles: {
			'color': 'red',
			'background-color': 'blue'
		} } );

		editor.setData( '<section style="background-color:blue;color:red;">foobar</section>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.eq( {
			data: '<ghsSection ghsAttributes="(1)">foobar</ghsSection>',
			attributes: {
				1: {
					styles: {
						'background-color': 'blue',
						color: 'red'
					}
				}
			}
		} );

		expect( editor.getData() ).to.eq(
			'<section style="background-color:blue;color:red;">foobar</section>'
		);
	} );

	it( 'should allow attributes (classes)', () => {
		dataFilter.allowElement( { name: 'section' } );
		dataFilter.allowAttributes( { name: 'section', classes: [ 'foo', 'bar' ] } );

		editor.setData( '<section class="foo bar">foobar</section>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.eq( {
			data: '<ghsSection ghsAttributes="(1)">foobar</ghsSection>',
			attributes: {
				1: { classes: [ 'foo', 'bar' ] }
			}
		} );

		expect( editor.getData() ).to.eq(
			'<section class="foo bar">foobar</section>'
		);
	} );

	it( 'should allow nested attributes', () => {
		dataFilter.allowElement( { name: /article|section/ } );
		dataFilter.allowAttributes( { name: /[^]/, attributes: { 'data-foo': /foo|bar/ } } );

		editor.setData( '<article data-foo="foo">' +
				'<section data-foo="bar">section1</section>' +
				'<section data-foo="foo">section2</section>' +
			'</article>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.eq( {
			data: '<ghsArticle ghsAttributes="(1)">' +
				'<ghsSection ghsAttributes="(2)">section1</ghsSection>' +
				'<ghsSection ghsAttributes="(3)">section2</ghsSection>' +
			'</ghsArticle>',
			attributes: {
				1: {
					attributes: {
						'data-foo': 'foo'
					}
				},
				2: {
					attributes: {
						'data-foo': 'bar'
					}
				},
				3: {
					attributes: {
						'data-foo': 'foo'
					}
				}
			}
		} );
	} );

	it( 'should allow attributes for all allowed definitions', () => {
		dataFilter.allowElement( { name: /section|article/ } );

		dataFilter.allowAttributes( { name: /section|article/, attributes: { 'data-foo': 'foo' } } );
		dataFilter.allowAttributes( { name: /section|article/, attributes: { 'data-bar': 'bar' } } );

		editor.setData( '<section data-foo="foo">foo</section><article data-bar="bar">bar</article>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.eq( {
			data: '<ghsSection ghsAttributes="(1)">foo</ghsSection><ghsArticle ghsAttributes="(2)">bar</ghsArticle>',
			attributes: {
				1: {
					attributes: {
						'data-foo': 'foo'
					}
				},
				2: {
					attributes: {
						'data-bar': 'bar'
					}
				}
			}
		} );

		expect( editor.getData() ).to.eq(
			'<section data-foo="foo">foo</section><article data-bar="bar">bar</article>'
		);
	} );

	it( 'should disallow attributes', () => {
		dataFilter.allowElement( { name: 'section' } );
		dataFilter.allowAttributes( { name: 'section', attributes: { 'data-foo': /[^]/ } } );
		dataFilter.disallowAttributes( { name: 'section', attributes: { 'data-foo': 'bar' } } );

		editor.setData( '<section data-foo="foo">foo</section><section data-foo="bar">bar</section>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.eq( {
			data: '<ghsSection ghsAttributes="(1)">foo</ghsSection><ghsSection>bar</ghsSection>',
			attributes: {
				1: {
					attributes: {
						'data-foo': 'foo'
					}
				}
			}
		} );

		expect( editor.getData() ).to.eq(
			'<section data-foo="foo">foo</section><section>bar</section>'
		);
	} );

	it( 'should disallow attributes (styles)', () => {
		dataFilter.allowElement( { name: 'section' } );
		dataFilter.allowAttributes( { name: 'section', styles: { color: /[^]/ } } );
		dataFilter.disallowAttributes( { name: 'section', styles: { color: 'red' } } );

		editor.setData( '<section style="color:blue;">foo</section><section style="color:red">bar</section>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.eq( {
			data: '<ghsSection ghsAttributes="(1)">foo</ghsSection><ghsSection>bar</ghsSection>',
			attributes: {
				1: {
					styles: {
						color: 'blue'
					}
				}
			}
		} );

		expect( editor.getData() ).to.eq(
			'<section style="color:blue;">foo</section><section>bar</section>'
		);
	} );

	it( 'should disallow attributes (classes)', () => {
		dataFilter.allowElement( { name: 'section' } );
		dataFilter.allowAttributes( { name: 'section', classes: [ 'foo', 'bar' ] } );
		dataFilter.disallowAttributes( { name: 'section', classes: [ 'bar' ] } );

		editor.setData( '<section class="foo bar">foo</section><section class="bar">bar</section>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.eq( {
			data: '<ghsSection>foo</ghsSection><ghsSection>bar</ghsSection>',
			attributes: {}
		} );

		expect( editor.getData() ).to.eq(
			'<section>foo</section><section>bar</section>'
		);
	} );
} );

function getModelDataWithAttributes( model, options ) {
	// Simplify GHS attributes as they are not very readable at this point due to object structure.
	let counter = 1;
	const data = getModelData( model, options ).replace( /ghsAttributes="{(.*?)}"/g, () => {
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
