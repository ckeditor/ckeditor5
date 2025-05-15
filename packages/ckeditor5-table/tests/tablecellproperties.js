/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import TableEditing from '../src/tableediting.js';
import TableCellProperties from '../src/tablecellproperties.js';
import TableCellPropertiesEditing from '../src/tablecellproperties/tablecellpropertiesediting.js';
import TableCellPropertiesUI from '../src/tablecellproperties/tablecellpropertiesui.js';

describe( 'table cell properties', () => {
	let editor, editorElement;

	describe( 'TableCellProperties', () => {
		beforeEach( async () => {
			editorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( editorElement );

			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ TableCellProperties, Paragraph, TableEditing ]
			} );
		} );

		afterEach( async () => {
			editorElement.remove();
			await editor.destroy();
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( TableCellProperties ) ).to.instanceOf( TableCellProperties );
		} );

		it( 'should load TableCellPropertiesUI plugin', () => {
			expect( editor.plugins.get( TableCellPropertiesUI ) ).to.instanceOf( TableCellPropertiesUI );
		} );

		it( 'should load TableCellPropertiesEditing plugin', () => {
			expect( editor.plugins.get( TableCellPropertiesEditing ) ).to.instanceOf( TableCellPropertiesEditing );
		} );

		it( 'should have pluginName', () => {
			expect( TableCellProperties.pluginName ).to.equal( 'TableCellProperties' );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( TableCellProperties.isOfficialPlugin ).to.be.true;
		} );

		it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
			expect( TableCellProperties.isPremiumPlugin ).to.be.false;
		} );
	} );
} );
