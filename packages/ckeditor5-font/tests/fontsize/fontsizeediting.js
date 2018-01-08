/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import FontSizeEditing from './../../src/fontsize/fontsizeediting';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '../../../ckeditor5-engine/src/dev-utils/model';

describe( 'FontSizeEditing', () => {
	let editor, doc;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ FontSizeEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;

				doc = editor.document;
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should set proper schema rules', () => {
		expect( editor.model.schema.checkAttribute( [ '$block', '$text' ], 'fontSize' ) ).to.be.true;
		expect( editor.model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'fontSize' ) ).to.be.true;

		expect( editor.model.schema.checkAttribute( [ '$block' ], 'fontSize' ) ).to.be.false;
	} );

	describe( 'config', () => {
		describe( 'default value', () => {
			it( 'should be set', () => {
				expect( editor.config.get( 'fontSize.items' ) ).to.deep.equal( [ 'tiny', 'small', 'normal', 'big', 'huge' ] );
			} );
		} );
	} );

	describe( 'configuredItems', () => {
		it( 'should discard unsupported values', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ FontSizeEditing ],
					fontSize: {
						items: [ () => {}, 'normal', 'unknown' ]
					}
				} )
				.then( newEditor => {
					editor = newEditor;

					const plugin = editor.plugins.get( FontSizeEditing );

					expect( plugin.configuredItems ).to.deep.equal( [ { title: 'Normal', model: undefined } ] );
				} );
		} );

		it( 'should pass through object definition', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ FontSizeEditing ],
					fontSize: {
						items: [ { title: 'My Size', model: 'my-size', view: { name: 'span', style: 'font-size: 12em;' } } ]
					}
				} )
				.then( newEditor => {
					editor = newEditor;

					const plugin = editor.plugins.get( FontSizeEditing );

					expect( plugin.configuredItems ).to.deep.equal( [
						{
							title: 'My Size',
							model: 'my-size',
							view: { name: 'span', style: 'font-size: 12em;' }
						}
					] );
				} );
		} );

		describe( 'named presets', () => {
			it( 'should return defined presets', () => {
				return VirtualTestEditor
					.create( {
						plugins: [ FontSizeEditing ],
						fontSize: {
							items: [ 'tiny', 'small', 'normal', 'big', 'huge' ]
						}
					} )
					.then( newEditor => {
						editor = newEditor;

						const plugin = editor.plugins.get( FontSizeEditing );

						expect( plugin.configuredItems ).to.deep.equal( [
							{ title: 'Tiny', model: 'text-tiny', view: { name: 'span', class: 'text-tiny' } },
							{ title: 'Small', model: 'text-small', view: { name: 'span', class: 'text-small' } },
							{ title: 'Normal', model: undefined },
							{ title: 'Big', model: 'text-big', view: { name: 'span', class: 'text-big' } },
							{ title: 'Huge', model: 'text-huge', view: { name: 'span', class: 'text-huge' } }
						] );
					} );
			} );
		} );

		describe( 'numeric presets', () => {
			it( 'should return generated presets', () => {
				return VirtualTestEditor
					.create( {
						plugins: [ FontSizeEditing ],
						fontSize: {
							items: [ '10', 12, 'normal', '14.1', 18.3 ]
						}
					} )
					.then( newEditor => {
						editor = newEditor;

						const plugin = editor.plugins.get( FontSizeEditing );

						expect( plugin.configuredItems ).to.deep.equal( [
							{ title: '10', model: '10', view: { name: 'span', style: { 'font-size': '10px' } } },
							{ title: '12', model: '12', view: { name: 'span', style: { 'font-size': '12px' } } },
							{ title: 'Normal', model: undefined },
							{ title: '14', model: '14', view: { name: 'span', style: { 'font-size': '14px' } } },
							{ title: '18', model: '18', view: { name: 'span', style: { 'font-size': '18px' } } }
						] );
					} );
			} );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ FontSizeEditing, Paragraph ],
					fontSize: {
						items: [
							'tiny',
							'normal',
							18,
							{
								title: 'My setting',
								model: 'my',
								view: {
									name: 'mark',
									style: { 'font-size': '30px' },
									class: 'my-style'
								}
							}
						]
					}
				} )
				.then( newEditor => {
					editor = newEditor;

					doc = editor.model;
				} );
		} );

		it( 'should discard unknown fontSize attribute values', () => {
			setModelData( doc, '<paragraph>f<$text fontSize="foo-bar">o</$text>o</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		it( 'should convert fontSize attribute to predefined named preset', () => {
			setModelData( doc, '<paragraph>f<$text fontSize="text-tiny">o</$text>o</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>f<span class="text-tiny">o</span>o</p>' );
		} );

		it( 'should convert fontSize attribute to predefined pixel size preset', () => {
			setModelData( doc, '<paragraph>f<$text fontSize="18">o</$text>o</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>f<span style="font-size:18px;">o</span>o</p>' );
		} );

		it( 'should convert fontSize attribute from user defined settings', () => {
			setModelData( doc, '<paragraph>f<$text fontSize="my">o</$text>o</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>f<mark class="my-style" style="font-size:30px;">o</mark>o</p>' );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ FontSizeEditing, Paragraph ],
					fontSize: {
						items: [
							'tiny',
							'normal',
							18,
							{
								title: 'My setting',
								model: 'my',
								view: {
									name: 'mark',
									style: { 'font-size': '30px' },
									class: 'my-style'
								}
							},
							{
								title: 'Big multiple classes',
								model: 'big-multiple',
								view: {
									name: 'span',
									class: [ 'foo', 'foo-big' ]
								}
							},
							{
								title: 'Hybrid',
								model: 'complex',
								view: {
									name: 'span',
									class: [ 'text-complex' ]
								},
								acceptsAlso: [
									{ name: 'span', style: { 'font-size': '77em' } },
									{ name: 'span', attributes: { 'data-size': '77em' } }
								]
							}
						]
					}
				} )
				.then( newEditor => {
					editor = newEditor;

					doc = editor.model;
				} );
		} );

		it( 'should convert from element with defined class', () => {
			const data = '<p>f<span class="text-tiny foo bar">o</span>o</p>';

			editor.setData( data );

			expect( getModelData( doc ) ).to.equal( '<paragraph>[]f<$text fontSize="text-tiny">o</$text>o</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>f<span class="text-tiny">o</span>o</p>' );
		} );

		it( 'should convert from element with defined multiple classes', () => {
			const data = '<p>f<span class="foo foo-big bar">o</span>o</p>';

			editor.setData( data );

			expect( getModelData( doc ) ).to.equal( '<paragraph>[]f<$text fontSize="big-multiple">o</$text>o</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>f<span class="foo foo-big">o</span>o</p>' );
		} );

		it( 'should convert from element with defined style', () => {
			const data = '<p>f<span style="font-size:18px;">o</span>o</p>';

			editor.setData( data );

			expect( getModelData( doc ) ).to.equal( '<paragraph>[]f<$text fontSize="18">o</$text>o</paragraph>' );

			expect( editor.getData() ).to.equal( data );
		} );

		it( 'should convert from element with defined style when with other styles', () => {
			const data = '<p>f<span style="font-family: serif;font-size: 18px">o</span>o</p>';

			editor.setData( data );

			expect( getModelData( doc ) ).to.equal( '<paragraph>[]f<$text fontSize="18">o</$text>o</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>f<span style="font-size:18px;">o</span>o</p>' );
		} );

		it( 'should convert from user defined element', () => {
			const data = '<p>f<mark class="my-style" style="font-size:30px;">o</mark>o</p>';

			editor.setData( data );

			expect( getModelData( doc ) ).to.equal( '<paragraph>[]f<$text fontSize="my">o</$text>o</paragraph>' );

			expect( editor.getData() ).to.equal( data );
		} );

		it( 'should convert from complex definitions', () => {
			editor.setData(
				'<p>f<span style="font-size: 77em;">o</span>o</p>' +
				'<p>b<span data-size="77em">a</span>r</p>' +
				'<p>b<span class="text-complex">a</span>z</p>'
			);

			expect( getModelData( doc ) ).to.equal(
				'<paragraph>[]f<$text fontSize="complex">o</$text>o</paragraph>' +
				'<paragraph>b<$text fontSize="complex">a</$text>r</paragraph>' +
				'<paragraph>b<$text fontSize="complex">a</$text>z</paragraph>'
			);

			expect( editor.getData() ).to.equal(
				'<p>f<span class="text-complex">o</span>o</p>' +
				'<p>b<span class="text-complex">a</span>r</p>' +
				'<p>b<span class="text-complex">a</span>z</p>'
			);
		} );
	} );
} );
