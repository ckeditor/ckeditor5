/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import DataSchema from '../src/dataschema';
import DataFilter from '../src/datafilter';

import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'DataFilter', () => {
	let editor, model, dataFilter, dataSchema;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				dataSchema = new DataSchema();
				dataFilter = new DataFilter( editor, dataSchema );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should allow element', () => {
		dataFilter.allowElement( { name: 'article' } );

		editor.setData( '<article>' +
			'<section><paragraph>section1</paragraph></section>' +
			'<section><paragraph>section2</paragraph></section></article>'
		);

		expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<ghsArticle><paragraph>section1section2</paragraph></ghsArticle>'
		);

		expect( editor.getData() ).to.equal(
			'<article><p>section1section2</p></article>'
		);

		dataFilter.allowElement( { name: 'section' } );

		editor.setData( '<article>' +
			'<section><paragraph>section1</paragraph></section>' +
			'<section><paragraph>section2</paragraph></section></article>'
		);

		expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<ghsArticle>' +
			'<ghsSection><paragraph>section1</paragraph></ghsSection>' +
			'<ghsSection><paragraph>section2</paragraph></ghsSection></ghsArticle>'
		);

		expect( editor.getData() ).to.equal(
			'<article>' +
			'<section><p>section1</p></section>' +
			'<section><p>section2</p></section></article>'
		);
	} );

	it( 'should allow deeply nested structure', () => {
		dataFilter.allowElement( { name: 'section' } );

		editor.setData(
			'<section><p>1</p>' +
			'<section><p>2</p>' +
			'<section><p>3</p>' +
			'</section></section></section>'
		);

		expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<ghsSection><paragraph>1</paragraph>' +
			'<ghsSection><paragraph>2</paragraph>' +
			'<ghsSection><paragraph>3</paragraph>' +
			'</ghsSection></ghsSection></ghsSection>'
		);

		expect( editor.getData() ).to.equal(
			'<section><p>1</p>' +
			'<section><p>2</p>' +
			'<section><p>3</p>' +
			'</section></section></section>'
		);
	} );

	it( 'should allow attributes', () => {
		dataFilter.allowElement( { name: 'section' } );
		dataFilter.allowAttributes( { name: 'section', attributes: {
			'data-foo': 'foobar'
		} } );

		editor.setData( '<section data-foo="foobar"><p>foobar</p></section>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<ghsSection ghsAttributes="(1)"><paragraph>foobar</paragraph></ghsSection>',
			attributes: {
				1: {
					attributes: {
						'data-foo': 'foobar'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal(
			'<section data-foo="foobar"><p>foobar</p></section>'
		);
	} );

	it( 'should allow attributes (styles)', () => {
		dataFilter.allowElement( { name: 'section' } );
		dataFilter.allowAttributes( { name: 'section', styles: {
			'color': 'red',
			'background-color': 'blue'
		} } );

		editor.setData( '<section style="background-color:blue;color:red;"><p>foobar</p></section>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<ghsSection ghsAttributes="(1)"><paragraph>foobar</paragraph></ghsSection>',
			attributes: {
				1: {
					styles: {
						'background-color': 'blue',
						color: 'red'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal(
			'<section style="background-color:blue;color:red;"><p>foobar</p></section>'
		);
	} );

	it( 'should allow attributes (classes)', () => {
		dataFilter.allowElement( { name: 'section' } );
		dataFilter.allowAttributes( { name: 'section', classes: [ 'foo', 'bar' ] } );

		editor.setData( '<section class="foo bar"><p>foobar</p></section>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<ghsSection ghsAttributes="(1)"><paragraph>foobar</paragraph></ghsSection>',
			attributes: {
				1: { classes: [ 'foo', 'bar' ] }
			}
		} );

		expect( editor.getData() ).to.equal(
			'<section class="foo bar"><p>foobar</p></section>'
		);
	} );

	it( 'should allow nested attributes', () => {
		dataFilter.allowElement( { name: /article|section/ } );
		dataFilter.allowAttributes( { name: /[^]/, attributes: { 'data-foo': /foo|bar/ } } );

		editor.setData( '<article data-foo="foo">' +
			'<section data-foo="bar"><p>section1</p></section>' +
			'<section data-foo="foo"><p>section2</p></section>' +
			'</article>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<ghsArticle ghsAttributes="(1)">' +
				'<ghsSection ghsAttributes="(2)"><paragraph>section1</paragraph></ghsSection>' +
				'<ghsSection ghsAttributes="(3)"><paragraph>section2</paragraph></ghsSection>' +
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

		editor.setData(
			'<section data-foo="foo"><p>foo</p></section>' +
			'<article data-bar="bar"><p>bar</p></article>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<ghsSection ghsAttributes="(1)"><paragraph>foo</paragraph></ghsSection>' +
				'<ghsArticle ghsAttributes="(2)"><paragraph>bar</paragraph></ghsArticle>',
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

		expect( editor.getData() ).to.equal(
			'<section data-foo="foo"><p>foo</p></section>' +
			'<article data-bar="bar"><p>bar</p></article>'
		);
	} );

	it( 'should disallow attributes', () => {
		dataFilter.allowElement( { name: 'section' } );
		dataFilter.allowAttributes( { name: 'section', attributes: { 'data-foo': /[^]/ } } );
		dataFilter.disallowAttributes( { name: 'section', attributes: { 'data-foo': 'bar' } } );

		editor.setData(
			'<section data-foo="foo"><p>foo</p></section>' +
			'<section data-foo="bar"><p>bar</p></section>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<ghsSection ghsAttributes="(1)"><paragraph>foo</paragraph></ghsSection>' +
				'<ghsSection><paragraph>bar</paragraph></ghsSection>',
			attributes: {
				1: {
					attributes: {
						'data-foo': 'foo'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal(
			'<section data-foo="foo"><p>foo</p></section>' +
			'<section><p>bar</p></section>'
		);
	} );

	it( 'should disallow attributes (styles)', () => {
		dataFilter.allowElement( { name: 'section' } );
		dataFilter.allowAttributes( { name: 'section', styles: { color: /[^]/ } } );
		dataFilter.disallowAttributes( { name: 'section', styles: { color: 'red' } } );

		editor.setData(
			'<section style="color:blue;"><p>foo</p></section>' +
			'<section style="color:red"><p>bar</p></section>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<ghsSection ghsAttributes="(1)"><paragraph>foo</paragraph></ghsSection>' +
				'<ghsSection><paragraph>bar</paragraph></ghsSection>',
			attributes: {
				1: {
					styles: {
						color: 'blue'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal(
			'<section style="color:blue;"><p>foo</p></section>' +
			'<section><p>bar</p></section>'
		);
	} );

	it( 'should disallow attributes (classes)', () => {
		dataFilter.allowElement( { name: 'section' } );
		dataFilter.allowAttributes( { name: 'section', classes: [ 'foo', 'bar' ] } );
		dataFilter.disallowAttributes( { name: 'section', classes: [ 'bar' ] } );

		editor.setData(
			'<section class="foo bar"><p>foo</p></section>' +
			'<section class="bar"><p>bar</p></section>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<ghsSection><paragraph>foo</paragraph></ghsSection>' +
				'<ghsSection><paragraph>bar</paragraph></ghsSection>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal(
			'<section><p>foo</p></section>' +
			'<section><p>bar</p></section>'
		);
	} );

	it( 'should extend allowed children only if specified model schema exists', () => {
		dataSchema.register( {
			view: 'xyz',
			model: 'ghsXyz',
			allowChildren: 'not-exists',
			schema: {
				inheritAllFrom: '$ghsBlock'
			}
		} );

		expect( () => {
			dataFilter.allowElement( { name: 'xyz' } );
		} ).to.not.throw();
	} );

	it( 'should not consume attribute already consumed (upcast)', () => {
		editor.conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( 'element:section', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.viewItem, { attributes: [ 'data-foo' ] } );
			} );
		} );

		dataFilter.allowElement( { name: 'section' } );
		dataFilter.allowAttributes( { name: 'section', attributes: { 'data-foo': true } } );

		editor.setData( '<section data-foo><p>foo</p></section>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<ghsSection><paragraph>foo</paragraph></ghsSection>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal( '<section><p>foo</p></section>' );
	} );

	it( 'should not consume attribute already consumed (downcast)', () => {
		editor.conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( 'attribute:ghsAttributes:ghsSection', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, evt.name );
			}, { priority: 'high' } );
		} );

		dataFilter.allowElement( { name: 'section' } );
		dataFilter.allowAttributes( { name: 'section', attributes: { 'data-foo': true } } );

		editor.setData( '<section data-foo><p>foo</p></section>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<ghsSection ghsAttributes="(1)"><paragraph>foo</paragraph></ghsSection>',
			// At this point, attribute should still be in the model, as we are testing downcast conversion.
			attributes: {
				1: {
					attributes: {
						'data-foo': ''
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal( '<section><p>foo</p></section>' );
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
