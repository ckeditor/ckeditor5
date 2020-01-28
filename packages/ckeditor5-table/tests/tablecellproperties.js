/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import TableEditing from '../src/tableediting';
import TableCellProperties from '../src/tablecellproperties';
import TableCellPropertiesEditing from '../src/tablecellproperties/tablecellpropertiesediting';
import TableCellPropertiesUI from '../src/tablecellproperties/tablecellpropertiesui';

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
	} );
} );
