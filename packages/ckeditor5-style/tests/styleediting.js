/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import StyleEditing from '../src/styleediting.js';
import StyleCommand from '../src/stylecommand.js';
import StyleUtils from '../src/styleutils.js';
import ListStyleSupport from '../src/integrations/list.js';
import TableStyleSupport from '../src/integrations/table.js';
import LinkStyleSupport from '../src/integrations/link.js';

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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( StyleEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( StyleEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should soft-require the GHS plugin, and require utils, and integrations', () => {
		expect( StyleEditing.requires ).to.deep.equal( [
			'GeneralHtmlSupport', StyleUtils, ListStyleSupport, TableStyleSupport, LinkStyleSupport
		] );
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
