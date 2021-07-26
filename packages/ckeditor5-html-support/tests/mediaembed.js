/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
*/

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import GeneralHtmlSupport from '../src/generalhtmlsupport';
import { getModelDataWithAttributes } from './_utils/utils';
import { range } from 'lodash-es';

/* global document */

describe.only( 'MediaEmbedElementSupport', () => {
	let editor, model, editorElement, dataFilter;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Table, TableCaption, Paragraph, GeneralHtmlSupport, MediaEmbed ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				dataFilter = editor.plugins.get( 'DataFilter' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should allow attributes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|oembed)$/,
			attributes: /^data-.*$/
		} ] );

		const expectedHtml =
		'<figure class="media" data-figure="data-figure-value">' +
			'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-oembed="data-oembed-value"></oembed>' +
		'</figure>';

		editor.setData( expectedHtml );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
				'<media htmlAttributes="(1)" htmlFigureAttributes="(2)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
			attributes: {
				1: {
					attributes: {
						'data-oembed': 'data-oembed-value'
					}
				},
				2: {
					attributes: {
						'data-figure': 'data-figure-value'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal( expectedHtml );
	} );

	it( 'should allow classes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|oembed)$/,
			classes: 'foobar'
		} ] );

		const expectedHtml =
		'<figure class="media foobar">' +
			'<oembed class="foobar" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
		'</figure>';

		editor.setData( expectedHtml );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
			'<media htmlAttributes="(1)" htmlFigureAttributes="(2)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
			attributes: range( 1, 3 ).reduce( ( attributes, index ) => {
				attributes[ index ] = {
					classes: [ 'foobar' ]
				};
				return attributes;
			}, {} )
		} );

		expect( editor.getData() ).to.equal( expectedHtml );
	} );

	it( 'should allow styles', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|oembed)$/,
			styles: 'color'
		} ] );

		const expectedHtml =
		'<figure class="media" style="color:red;">' +
			'<oembed style="color:red;" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
		'</figure>';

		editor.setData( expectedHtml );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
			'<media htmlAttributes="(1)" htmlFigureAttributes="(2)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
			attributes: range( 1, 3 ).reduce( ( attributes, index ) => {
				attributes[ index ] = {
					styles: {
						color: 'red'
					}
				};
				return attributes;
			}, {} )
		} );

		expect( editor.getData() ).to.equal( expectedHtml );
	} );

	it( 'should disallow attributes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|oembed)$/,
			attributes: /^data-.*$/
		} ] );

		dataFilter.loadDisallowedConfig( [ {
			name: /^(figure|oembed)$/,
			attributes: /^data-.*$/
		} ] );

		editor.setData(
			'<figure class="media" data-figure="data-figure-value">' +
				'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-oembed="data-oembed-value"></oembed>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
			'<media url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal(
			'<figure class="media">' +
				'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
			'</figure>'
		);
	} );

	it( 'should disallow classes', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|oembed)$/,
			classes: 'foobar'
		} ] );

		dataFilter.loadDisallowedConfig( [ {
			name: /^(figure|oembed)$/,
			classes: 'foobar'
		} ] );

		editor.setData(
			'<figure class="media foobar">' +
				'<oembed class="foobar" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
			'<media url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal(
			'<figure class="media">' +
				'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
			'</figure>'
		);
	} );

	it( 'should disallow styles', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|oembed)$/,
			styles: 'color'
		} ] );

		dataFilter.loadDisallowedConfig( [ {
			name: /^(figure|oembed)$/,
			styles: 'color'
		} ] );

		editor.setData(
			'<figure class="media" style="color:red;">' +
				'<oembed style="color:red;" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
			'</figure>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
			'<media url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal(
			'<figure class="media">' +
				'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
			'</figure>'
		);
	} );

	it( 'should not set attributes on non existing figure', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|oembed)$/,
			attributes: true
		} ] );

		editor.setData(
			'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></oembed>'
		);

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
			'<media htmlAttributes="(1)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
			attributes: {
				1: {
					attributes: {
						'data-foo': 'foo',
						'url': 'https://www.youtube.com/watch?v=ZVv7UMQPEWk'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal(
			'<figure class="media">' +
				'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></oembed>' +
			'</figure>'
		);
	} );

	it( 'should not break figure integration for other features', () => {
		dataFilter.loadAllowedConfig( [ {
			name: /^(figure|figcaption|oembed)$/,
			attributes: /^data-.*$/
		} ] );

		const expectedHtml =
			'<figure class="media" data-figure="oembed">' +
				'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
			'</figure>' +
			'<figure data-figure="standalone">' +
				'<figcaption data-figcaption="figcaption">foobar</figcaption>' +
			'</figure>';

		editor.setData( expectedHtml );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data:
			'<media htmlFigureAttributes="(1)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>' +
			'<htmlFigure htmlAttributes="(2)">' +
				'<htmlFigcaption htmlAttributes="(3)">foobar</htmlFigcaption>' +
			'</htmlFigure>',
			attributes: {
				1: {
					attributes: {
						'data-figure': 'oembed'
					}
				},
				2: {
					attributes: {
						'data-figure': 'standalone'
					}
				},
				3: {
					attributes: {
						'data-figcaption': 'figcaption'
					}
				}
			}
		} );

		expect( editor.getData() ).to.equal( expectedHtml );
	} );

	it( 'should not consume attributes already consumed (downcast)', () => {
		[
			'htmlAttributes',
			'htmlFigureAttributes'
		].forEach( attributeName => {
			editor.conversion.for( 'downcast' )
				.add( dispatcher => {
					dispatcher.on( `attribute:${ attributeName }:media`, ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, evt.name );
					}, { priority: 'high' } );
				} );
		} );

		dataFilter.allowElement( /^(figure|oembed)$/ );
		dataFilter.allowAttributes( {
			name: /^(figure|oembed)$/,
			attributes: { 'data-foo': true }
		} );

		editor.setData(
			'<figure class="media" data-foo="foo">' +
				'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></oembed>' +
			'</figure>'
		);

		expect( editor.getData() ).to.equal(
			'<figure class="media">' +
				'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
			'</figure>'
		);
	} );
} );
