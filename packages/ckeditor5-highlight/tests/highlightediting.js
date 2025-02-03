/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import HighlightEditing from './../src/highlightediting.js';
import HighlightCommand from './../src/highlightcommand.js';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'HighlightEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ HighlightEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( HighlightEditing.pluginName ).to.equal( 'HighlightEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( HighlightEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( HighlightEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should set proper schema rules', () => {
		expect( editor.model.schema.checkAttribute( [ '$block', '$text' ], 'highlight' ) ).to.be.true;
		expect( editor.model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'highlight' ) ).to.be.true;

		expect( editor.model.schema.checkAttribute( [ '$block' ], 'highlight' ) ).to.be.false;
	} );

	it( 'adds highlight command', () => {
		expect( editor.commands.get( 'highlight' ) ).to.be.instanceOf( HighlightCommand );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert defined marker classes', () => {
			const data = '<p>f<mark class="marker-yellow">o</mark>o</p>';
			editor.setData( data );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]f<$text highlight="yellowMarker">o</$text>o</paragraph>' );
			expect( editor.getData() ).to.equal( data );
		} );

		// After closing #8921, converted will be the last class in the alphabetical order that matches the configuration options.
		it( 'should convert only one class even if the marker has a few of them', () => {
			editor.setData( '<p>f<mark class="marker-yellow marker-green">o</mark>o</p>' );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]f<$text highlight="yellowMarker">o</$text>o</paragraph>' );
			expect( editor.getData() ).to.equal( '<p>f<mark class="marker-yellow">o</mark>o</p>' );
		} );

		it( 'should not convert undefined marker classes', () => {
			editor.setData( '<p>f<mark class="some-unknown-marker">o</mark>o</p>' );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]foo</paragraph>' );
			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		it( 'should not convert marker without class', () => {
			editor.setData( '<p>f<mark>o</mark>o</p>' );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]foo</paragraph>' );
			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert mark element with defined class', () => {
			setModelData( model, '<paragraph>f<$text highlight="yellowMarker">o</$text>o</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>f<mark class="marker-yellow">o</mark>o</p>' );
		} );
	} );

	describe( 'config', () => {
		describe( 'default value', () => {
			it( 'should be set', () => {
				expect( editor.config.get( 'highlight' ) ).to.deep.equal( {
					options: [
						{
							model: 'yellowMarker',
							class: 'marker-yellow',
							title: 'Yellow marker',
							color: 'var(--ck-highlight-marker-yellow)',
							type: 'marker'
						},
						{
							model: 'greenMarker',
							class: 'marker-green',
							title: 'Green marker',
							color: 'var(--ck-highlight-marker-green)',
							type: 'marker'
						},
						{
							model: 'pinkMarker',
							class: 'marker-pink',
							title: 'Pink marker',
							color: 'var(--ck-highlight-marker-pink)',
							type: 'marker'
						},
						{
							model: 'blueMarker',
							class: 'marker-blue',
							title: 'Blue marker',
							color: 'var(--ck-highlight-marker-blue)',
							type: 'marker'
						},
						{
							model: 'redPen',
							class: 'pen-red',
							title: 'Red pen',
							color: 'var(--ck-highlight-pen-red)',
							type: 'pen'
						},
						{
							model: 'greenPen',
							class: 'pen-green',
							title: 'Green pen',
							color: 'var(--ck-highlight-pen-green)',
							type: 'pen'
						}
					]
				} );
			} );
		} );
	} );
} );
