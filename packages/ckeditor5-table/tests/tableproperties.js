/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import TableEditing from '../src/tableediting';
import TableProperties from '../src/tableproperties';
import TablePropertiesEditing from '../src/tableproperties/tablepropertiesediting';

describe( 'table properties', () => {
	describe( 'TableProperties', () => {
		let editor, editorElement;

		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ TableProperties, Paragraph, TableEditing ]
			} );
		} );

		afterEach( async () => {
			editorElement.remove();
			await editor.destroy();
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( TableProperties ) ).to.instanceOf( TableProperties );
		} );

		it( 'should load TablePropertiesEditing plugin', () => {
			expect( editor.plugins.get( TablePropertiesEditing ) ).to.instanceOf( TablePropertiesEditing );
		} );

		it( 'should have pluginName', () => {
			expect( TableProperties.pluginName ).to.equal( 'TableProperties' );
		} );
	} );
} );
