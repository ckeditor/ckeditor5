/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import FontBackgroundColorEditing from './../../src/fontbackgroundcolor/fontbackgroundcolorediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import {
	getData as getModelData,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'FontBackgroundColorEditing', () => {
	let editor, doc;

	beforeEach( () => VirtualTestEditor
		.create( {
			plugins: [ FontBackgroundColorEditing, Paragraph ]
		} )
		.then( newEditor => {
			editor = newEditor;

			doc = editor.document;
		} )
	);

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( FontBackgroundColorEditing.pluginName ).to.equal( 'FontBackgroundColorEditing' );
	} );

	it( 'should set proper schema rules', () => {
		expect( editor.model.schema.checkAttribute( [ '$block', '$text' ], 'fontBackgroundColor' ) ).to.be.true;
		expect( editor.model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'fontBackgroundColor' ) ).to.be.true;

		expect( editor.model.schema.checkAttribute( [ '$block' ], 'fontBackgroundColor' ) ).to.be.false;
	} );

	it( 'has the attribute marked with the isFormatting property', () => {
		expect( editor.model.schema.getAttributeProperties( 'fontBackgroundColor' ) ).to.include( {
			isFormatting: true
		} );
	} );

	it( 'its attribute is marked with a copOnEnter property', () => {
		expect( editor.model.schema.getAttributeProperties( 'fontBackgroundColor' ) ).to.include( {
			copyOnEnter: true
		} );
	} );

	describe( 'config', () => {
		describe( 'default value', () => {
			it( 'should be set', () => {
				expect( editor.config.get( 'fontBackgroundColor.colors' ) ).to.deep.equal( [
					{
						color: 'hsl(0, 0%, 0%)',
						label: 'Black'
					},
					{
						color: 'hsl(0, 0%, 30%)',
						label: 'Dim grey'
					},
					{
						color: 'hsl(0, 0%, 60%)',
						label: 'Grey'
					},
					{
						color: 'hsl(0, 0%, 90%)',
						label: 'Light grey'
					},
					{
						color: 'hsl(0, 0%, 100%)',
						label: 'White',
						hasBorder: true
					},
					{
						color: 'hsl(0, 75%, 60%)',
						label: 'Red'
					},
					{
						color: 'hsl(30, 75%, 60%)',
						label: 'Orange'
					},
					{
						color: 'hsl(60, 75%, 60%)',
						label: 'Yellow'
					},
					{
						color: 'hsl(90, 75%, 60%)',
						label: 'Light green'
					},
					{
						color: 'hsl(120, 75%, 60%)',
						label: 'Green'
					},
					{
						color: 'hsl(150, 75%, 60%)',
						label: 'Aquamarine'
					},
					{
						color: 'hsl(180, 75%, 60%)',
						label: 'Turquoise'
					},
					{
						color: 'hsl(210, 75%, 60%)',
						label: 'Light blue'
					},
					{
						color: 'hsl(240, 75%, 60%)',
						label: 'Blue'
					},
					{
						color: 'hsl(270, 75%, 60%)',
						label: 'Purple'
					}
				] );
				expect( editor.config.get( 'fontBackgroundColor.columns' ) ).to.equal( 5 );
			} );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		beforeEach( () => VirtualTestEditor
			.create( {
				plugins: [ FontBackgroundColorEditing, Paragraph ],
				fontBackgroundColor: {
					colors: [
						{
							label: 'Color1',
							color: '#000'
						},
						{
							label: 'Color2',
							color: '#123456'
						},
						{
							label: 'Color3',
							color: 'rgb( 0, 10, 20 )'
						},
						'hsl( 200,100%,50%)',
						{
							label: 'Color5 - Light Green',
							color: 'lightgreen'
						}
					]
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.model;
			} )
		);

		describe( 'convert different color version', () => {
			const tests = [
				'#000',
				'green',
				'rgb( 0, 10, 20 )',
				'rgba( 20, 30, 50, 0.4)',
				'hsl( 10, 20%, 30%)',
				'hsla( 300, 50%, 100%, .3)',
				'rgb( 20%, 30%, 40% )',
				'#345678'
			];

			tests.forEach( test => {
				it( `should convert fontBackgroundColor attribute: "${ test }" to proper style value.`, () => {
					setModelData( doc, `<paragraph>fo<$text fontBackgroundColor="${ test }">o b</$text>ar</paragraph>` );

					expect( editor.getData() ).to.equal( `<p>fo<span style="background-color:${ test };">o b</span>ar</p>` );
				} );
			} );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ FontBackgroundColorEditing, Paragraph ],
					fontBackgroundColor: {
						colors: [
							{
								label: 'Color1',
								color: '#000'
							},
							{
								label: 'Color2',
								color: '#123456'
							},
							{
								label: 'Color3',
								color: 'rgb( 0, 10, 20 )'
							},
							'hsl( 200,100%,50%)',
							{
								label: 'Color5 - Light Green',
								color: 'lightgreen'
							}
						]
					}
				} )
				.then( newEditor => {
					editor = newEditor;

					doc = editor.model;
				} );
		} );

		it( 'should convert from element with defined style when with other styles', () => {
			const data = '<p>f<span style="font-size: 18px;background-color: rgb(10, 20, 30);">o</span>o</p>';

			editor.setData( data );

			expect( getModelData( doc ) ).to.equal( '<paragraph>[]f<$text fontBackgroundColor="rgb(10,20,30)">o</$text>o</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>f<span style="background-color:rgb(10,20,30);">o</span>o</p>' );
		} );

		describe( 'should convert from different color versions', () => {
			const tests = [
				'#000',
				'green',
				'rgb( 0, 10, 20 )',
				'rgba( 20, 30, 50, 0.4)',
				'hsl( 10, 20%, 30%)',
				'hsla( 300, 50%, 100%, .3)',
				'rgb( 20%, 30%, 40% )',
				'#345678'
			];

			tests.forEach( test => {
				it( `should convert fontBackgroundColor attribute: "${ test }" to proper style value.`, () => {
					const data = `<p>f<span style="background-color: ${ test }">o</span>o</p>`;
					editor.setData( data );

					expect( getModelData( doc ) )
						.to.equal( `<paragraph>[]f<$text fontBackgroundColor="${ test.replace( / /g, '' ) }">o</$text>o</paragraph>` );

					expect( editor.getData() )
						.to.equal( `<p>f<span style="background-color:${ test.replace( / /g, '' ) };">o</span>o</p>` );
				} );
			} );
		} );

		it( 'should convert from complex definition', () => {
			editor.setData(
				'<p>f<span style="background-color: lightgreen;">o</span>o</p>' +
				'<p>f<span style="background-color: hsl( 200, 100%, 50% );">o</span>o</p>' +
				'<p>b<span style="background-color: rgba(1,2,3,.4);">a</span>r</p>' +
				'<p>b<span style="background-color:#fff;">a</span>z</p>'
			);

			expect( getModelData( doc ) ).to.equal(
				'<paragraph>[]f<$text fontBackgroundColor="lightgreen">o</$text>o</paragraph>' +
				'<paragraph>f<$text fontBackgroundColor="hsl(200,100%,50%)">o</$text>o</paragraph>' +
				'<paragraph>b<$text fontBackgroundColor="rgba(1,2,3,.4)">a</$text>r</paragraph>' +
				'<paragraph>b<$text fontBackgroundColor="#fff">a</$text>z</paragraph>'
			);

			expect( editor.getData() ).to.equal(
				'<p>f<span style="background-color:lightgreen;">o</span>o</p>' +
				'<p>f<span style="background-color:hsl(200,100%,50%);">o</span>o</p>' +
				'<p>b<span style="background-color:rgba(1,2,3,.4);">a</span>r</p>' +
				'<p>b<span style="background-color:#fff;">a</span>z</p>'
			);
		} );
	} );
} );
