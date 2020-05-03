/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import HighlightEditing from './../src/highlightediting';
import HighlightCommand from './../src/highlightcommand';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

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

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( HighlightEditing.pluginName ).to.equal( 'HighlightEditing' );
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

		it( 'should convert only one defined marker classes', () => {
			editor.setData( '<p>f<mark class="marker-green marker-yellow">o</mark>o</p>' );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]f<$text highlight="greenMarker">o</$text>o</paragraph>' );
			expect( editor.getData() ).to.equal( '<p>f<mark class="marker-green">o</mark>o</p>' );
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
