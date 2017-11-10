/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import HighlightEditing from './../src/highlightediting';
import HighlightCommand from './../src/highlightcommand';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'HighlightEditing', () => {
	let editor, doc;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ HighlightEditing, Paragraph ]
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
		expect( doc.schema.check( { name: '$inline', attributes: 'highlight', inside: '$block' } ) ).to.be.true;
		expect( doc.schema.check( { name: '$inline', attributes: 'highlight', inside: '$clipboardHolder' } ) ).to.be.true;
	} );

	it( 'adds highlight commands', () => {
		expect( editor.commands.get( 'highlight' ) ).to.be.instanceOf( HighlightCommand );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert defined marker classes', () => {
			const data = '<p>f<mark class="marker">o</mark>o</p>';

			editor.setData( data );

			expect( getModelData( doc ) ).to.equal( '<paragraph>[]f<$text highlight="marker">o</$text>o</paragraph>' );
			expect( editor.getData() ).to.equal( data );
		} );
		it( 'should convert only one defined marker classes', () => {
			editor.setData( '<p>f<mark class="marker-green marker">o</mark>o</p>' );

			expect( getModelData( doc ) ).to.equal( '<paragraph>[]f<$text highlight="marker-green">o</$text>o</paragraph>' );
			expect( editor.getData() ).to.equal( '<p>f<mark class="marker-green">o</mark>o</p>' );
		} );

		it( 'should not convert undefined marker classes', () => {
			editor.setData( '<p>f<mark class="some-unknown-marker">o</mark>o</p>' );

			expect( getModelData( doc ) ).to.equal( '<paragraph>[]foo</paragraph>' );
			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		it( 'should not convert marker without class', () => {
			editor.setData( '<p>f<mark>o</mark>o</p>' );

			expect( getModelData( doc ) ).to.equal( '<paragraph>[]foo</paragraph>' );
			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert mark element with defined class', () => {
			setModelData( doc, '<paragraph>f<$text highlight="marker">o</$text>o</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>f<mark class="marker">o</mark>o</p>' );
		} );
	} );

	describe( 'config', () => {
		describe( 'default value', () => {
			it( 'should be set', () => {
				expect( editor.config.get( 'highlight' ) ).to.deep.equal( [
					{ class: 'marker', title: 'Marker', color: '#ffff66', type: 'marker' },
					{ class: 'marker-green', title: 'Green Marker', color: '#66ff00', type: 'marker' },
					{ class: 'marker-pink', title: 'Pink Marker', color: '#ff6fff', type: 'marker' },
					{ class: 'pen-red', title: 'Red Pen', color: '#ff0000', type: 'pen' },
					{ class: 'pen-blue', title: 'Blue Pen', color: '#0000ff', type: 'pen' }
				] );
			} );
		} );
	} );
} );
