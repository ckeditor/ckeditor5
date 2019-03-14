/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import FontColorEditing from './../../src/fontcolor/fontcolorediting';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'FontColorEditing', () => {
	let editor, doc;

	beforeEach( () => VirtualTestEditor
		.create( {
			plugins: [ FontColorEditing, Paragraph ]
		} )
		.then( newEditor => {
			editor = newEditor;

			doc = editor.document;
		} )
	);

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should set proper schema rules', () => {
		expect( editor.model.schema.checkAttribute( [ '$block', '$text' ], 'fontColor' ) ).to.be.true;
		expect( editor.model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'fontColor' ) ).to.be.true;

		expect( editor.model.schema.checkAttribute( [ '$block' ], 'fontColor' ) ).to.be.false;
	} );

	describe( 'config', () => {
		describe( 'default value', () => {
			it( 'should be set', () => {
				expect( editor.config.get( 'fontColor.options' ) ).to.deep.equal( [
					{
						label: 'Strong Cyan',
						color: '#1ABC9C'
					},
					{
						label: 'Emerald',
						color: '#2ECC71'
					},
					{
						label: 'Bright Blue',
						color: '#3498DB'
					},
					{
						label: 'Amethyst',
						color: '#9B59B6'
					},
					{
						label: 'Grayish Blue',
						color: '#4E5F70'
					},
					{
						label: 'Vivid Yellow',
						color: '#F1C40F'
					},
					{
						label: 'Dark Cyan',
						color: '#16A085'
					},
					{
						label: 'Dark Emerald',
						color: '#27AE60'
					},
					{
						label: 'Strong Blue',
						color: '#2980B9'
					},
					{
						label: 'Dark Violet',
						color: '#8E44AD'
					},
					{
						label: 'Desaturated Blue',
						color: '#2C3E50'
					},
					{
						label: 'Orange',
						color: '#F39C12'
					},
					{
						label: 'Carrot',
						color: '#E67E22'
					},
					{
						label: 'Pale Red',
						color: '#E74C3C'
					},
					{
						label: 'Bright Silver',
						color: '#ECF0F1'
					},
					{
						label: 'Light Grayish Cyan',
						color: '#95A5A6'
					},
					{
						label: 'Light Gray',
						color: '#DDD'
					},
					{
						label: 'White',
						color: '#FFF'
					},
					{
						label: 'Pumpkin',
						color: '#D35400'
					},
					{
						label: 'Strong Red',
						color: '#C0392B'
					},
					{
						label: 'Silver',
						color: '#BDC3C7'
					},
					{
						label: 'Grayish Cyan',
						color: '#7F8C8D'
					},
					{
						label: 'Dark Gray',
						color: '#999'
					},
					{
						label: 'Black',
						color: '#000'
					}
				] );
			} );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		beforeEach( () => VirtualTestEditor
			.create( {
				plugins: [ FontColorEditing, Paragraph ],
				fontColor: {
					options: [
						{
							label: 'Color1',
							color: '#000'
						}, {
							label: 'Color2',
							color: '#123456'
						}, {
							label: 'Color3',
							color: 'rgb( 0, 10, 20 )'
						}, {
							label: 'Color4',
							color: 'hsl( 200,100%,50%)'
						}, {
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
				it( `should convert fontColor attribute: "${ test }" to proper style value.`, () => {
					setModelData( doc, `<paragraph>fo<$text fontColor="${ test }">o b</$text>ar</paragraph>` );

					expect( editor.getData() ).to.equal( `<p>fo<span style="color:${ test };">o b</span>ar</p>` );
				} );
			} );
		} );
	} );
} );
