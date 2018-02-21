/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import TablesEditing from '../src/tablesediting';
import TablesUI from '../src/tablesui';

import ClassicTestEditor from '../../ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '../../ckeditor5-core/tests/_utils/utils';
import { _clear as clearTranslations, add as addTranslations } from '../../ckeditor5-utils/src/translation-service';

testUtils.createSinonSandbox();

describe( 'TablesUI', () => {
	let editor, element;

	before( () => {
		addTranslations( 'en', {} );
		addTranslations( 'pl', {} );
	} );

	after( () => {
		clearTranslations();
	} );

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ TablesEditing, TablesUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );
} );
