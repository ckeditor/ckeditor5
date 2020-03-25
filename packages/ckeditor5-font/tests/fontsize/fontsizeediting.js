/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import FontSizeEditing from './../../src/fontsize/fontsizeediting';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

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

	it( 'should have pluginName', () => {
		expect( FontSizeEditing.pluginName ).to.equal( 'FontSizeEditing' );
	} );

	it( 'should set proper schema rules', () => {
		expect( editor.model.schema.checkAttribute( [ '$block', '$text' ], 'fontSize' ) ).to.be.true;
		expect( editor.model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'fontSize' ) ).to.be.true;

		expect( editor.model.schema.checkAttribute( [ '$block' ], 'fontSize' ) ).to.be.false;
	} );

	it( 'should be marked with a formatting property', () => {
		expect( editor.model.schema.getAttributeProperties( 'fontSize' ) ).to.include( {
			isFormatting: true
		} );
	} );

	it( 'its attribute is marked with a copOnEnter property', () => {
		expect( editor.model.schema.getAttributeProperties( 'fontSize' ) ).to.include( {
			copyOnEnter: true
		} );
	} );

	describe( 'config', () => {
		describe( 'default value', () => {
			it( 'should be set', () => {
				expect( editor.config.get( 'fontSize.options' ) ).to.deep.equal( [ 'tiny', 'small', 'default', 'big', 'huge' ] );
				expect( editor.config.get( 'fontSize.supportAllValues' ) ).to.equal( false );
			} );
		} );

		describe( 'supportAllValues=true', () => {
			let editor, doc;

			beforeEach( () => {
				return VirtualTestEditor
					.create( {
						plugins: [ FontSizeEditing, Paragraph ],
						fontSize: {
							supportAllValues: true
						}
					} )
					.then( newEditor => {
						editor = newEditor;

						doc = editor.model;
					} );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			describe( 'editing pipeline conversion', () => {
				it( 'should pass fontSize to data', () => {
					setModelData( doc, '<paragraph>f<$text fontSize="10px">o</$text>o</paragraph>' );

					expect( editor.getData() ).to.equal( '<p>f<span style="font-size:10px;">o</span>o</p>' );
				} );
			} );

			describe( 'data pipeline conversions', () => {
				it( 'should convert from an element with defined style when with other styles', () => {
					const data = '<p>f<span style="font-family: Other;font-size: 18px">o</span>o</p>';

					editor.setData( data );

					expect( getModelData( doc ) ).to.equal( '<paragraph>[]f<$text fontSize="18px">o</$text>o</paragraph>' );

					expect( editor.getData() ).to.equal( '<p>f<span style="font-size:18px;">o</span>o</p>' );
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
						options: [
							'tiny',
							'default',
							18,
							{
								title: 'My setting',
								model: 'my',
								view: {
									name: 'mark',
									styles: { 'font-size': '30px' },
									classes: 'my-style'
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
			setModelData( doc, '<paragraph>f<$text fontSize="tiny">o</$text>o</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>f<span class="text-tiny">o</span>o</p>' );
		} );

		it( 'should convert fontSize attribute to predefined pixel size preset', () => {
			setModelData( doc, '<paragraph>f<$text fontSize="18px">o</$text>o</paragraph>' );

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
						options: [
							'tiny',
							'default',
							18,
							{
								title: 'My setting',
								model: 'my',
								view: {
									name: 'mark',
									styles: { 'font-size': '30px' },
									classes: 'my-style'
								}
							},
							{
								title: 'Big multiple classes',
								model: 'big-multiple',
								view: {
									name: 'span',
									classes: [ 'foo', 'foo-big' ]
								}
							},
							{
								title: 'Hybrid',
								model: 'complex',
								view: {
									name: 'span',
									classes: [ 'text-complex' ]
								},
								upcastAlso: [
									{ name: 'span', styles: { 'font-size': '77em' } },
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

			expect( getModelData( doc ) ).to.equal( '<paragraph>[]f<$text fontSize="tiny">o</$text>o</paragraph>' );

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

			expect( getModelData( doc ) ).to.equal( '<paragraph>[]f<$text fontSize="18px">o</$text>o</paragraph>' );

			expect( editor.getData() ).to.equal( data );
		} );

		it( 'should convert from element with defined style when with other styles', () => {
			const data = '<p>f<span style="font-family: serif;font-size: 18px">o</span>o</p>';

			editor.setData( data );

			expect( getModelData( doc ) ).to.equal( '<paragraph>[]f<$text fontSize="18px">o</$text>o</paragraph>' );

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
