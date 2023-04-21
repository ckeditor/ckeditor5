/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import StyleEditing from '../src/styleediting';
import StyleCommand from '../src/stylecommand';
import StyleUtils from '../src/styleutils';

describe( 'StyleEditing', () => {
	let editor, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, GeneralHtmlSupport, StyleEditing ],
			style: {
				definitions: [
					{
						name: 'Marker',
						element: 'span',
						classes: [ 'marker' ]
					},
					{
						name: 'Typewriter',
						element: 'span',
						classes: [ 'typewriter' ]
					},
					{
						name: 'Deleted text',
						element: 'span',
						classes: [ 'deleted' ]
					},
					{
						name: 'Multiple classes',
						element: 'span',
						classes: [ 'class-one', 'class-two' ]
					},
					{
						name: 'Big heading',
						element: 'h2',
						classes: [ 'big-heading' ]
					},
					{
						name: 'Red heading',
						element: 'h2',
						classes: [ 'red-heading' ]
					}
				]
			}
		} );
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should have a name', () => {
		expect( StyleEditing.pluginName ).to.equal( 'StyleEditing' );
	} );

	it( 'should soft-require the GHS plugin and require utils', () => {
		expect( StyleEditing.requires ).to.deep.equal( [ 'GeneralHtmlSupport', StyleUtils ] );
	} );

	it( 'should register the "style" command', () => {
		expect( editor.commands.get( 'style' ) ).to.be.instanceOf( StyleCommand );
	} );

	describe( 'integration with the GHS DataFilter', () => {
		it( 'should allow block styles configuration', () => {
			const data = '<h2 class="big-heading red-heading">foo</h2>';

			editor.setData( data );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'should allow inline styles configuration', () => {
			const data = '<p>foo<span class="marker typewriter deleted class-one class-two">bar</span></p>';

			editor.setData( data );
			expect( editor.getData() ).to.equal( data );
		} );
	} );
} );
