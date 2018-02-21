/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import Tables from '../src/tables';
import TablesEditing from '../src/tablesediting';
import TablesUI from '../src/tablesui';

import ClassicTestEditor from '../../ckeditor5-core/tests/_utils/classictesteditor';
import { getData as getModelData, setData as setModelData } from '../../ckeditor5-engine/src/dev-utils/model';
import normalizeHtml from '../../ckeditor5-utils/tests/_utils/normalizehtml';

describe( 'Tables', () => {
	let editor, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Tables ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'requires TablesEditing and TablesUI', () => {
		expect( Tables.requires ).to.deep.equal( [ TablesEditing, TablesUI ] );
	} );
} );
