/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { ColorSelectorView } from '@ckeditor/ckeditor5-ui';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import TestColorPlugin from '../_utils/testcolorplugin.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'ColorSelectorView', () => {
	let locale, colorSelectorView;

	const colorDefinitions = [
		{
			color: '#000',
			label: 'Black',
			options: {
				hasBorder: false
			}
		},
		{
			color: 'rgb(255, 255, 255)',
			label: 'White',
			options: {
				hasBorder: true
			}
		},
		{
			color: 'red',
			label: 'Red',
			options: {
				hasBorder: false
			}
		}
	];
	const testColorConfig = {
		colors: [
			'yellow',
			{
				color: '#000'
			},
			{
				color: 'rgb(255, 255, 255)',
				label: 'White',
				hasBorder: true
			},
			{
				color: 'red',
				label: 'Red'
			},
			{
				color: '#00FF00',
				label: 'Green',
				hasBorder: false
			}
		],
		columns: 3
	};

	beforeEach( () => {
		locale = { t() {} };
		colorSelectorView = new ColorSelectorView( locale, {
			colors: colorDefinitions,
			columns: 5,
			removeButtonLabel: 'Remove color',
			documentColorsLabel: 'Document colors',
			documentColorsCount: 4,
			colorPickerViewConfig: {
				format: 'hsl'
			}
		} );
		// Grids rendering is deferred (#6192) therefore render happens before appending grids.
		colorSelectorView.render();
		colorSelectorView._appendColorGridsFragment();

		document.body.appendChild( colorSelectorView.element );
	} );

	afterEach( () => {
		colorSelectorView.destroy();
		colorSelectorView.element.remove();
	} );

	testUtils.createSinonSandbox();

	describe( 'disabled document colors section', () => {
		let editor, element, dropdown, model;

		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Paragraph, TestColorPlugin ],
					testColor: Object.assign( {
						documentColors: 0
					}, testColorConfig )
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					dropdown = editor.ui.componentFactory.create( 'testColor' );

					dropdown.render();
					global.document.body.appendChild( dropdown.element );
				} );
		} );

		afterEach( () => {
			element.remove();
			dropdown.element.remove();
			dropdown.destroy();

			return editor.destroy();
		} );

		it( 'should not create document colors section', () => {
			const colorSelectorView = dropdown.colorSelectorView.colorGridsFragmentView;

			setModelData( model,
				'<paragraph><$text testColor="gold">Bar</$text></paragraph>' +
				'<paragraph><$text testColor="rgb(10,20,30)">Foo</$text></paragraph>' +
				'<paragraph><$text testColor="gold">New Foo</$text></paragraph>' +
				'<paragraph><$text testColor="#FFAACC">Baz</$text></paragraph>'
			);

			dropdown.isOpen = true;

			expect( colorSelectorView.documentColorsCount ).to.equal( 0 );
			expect( colorSelectorView.documentColorsLabel ).to.be.undefined;
		} );
	} );
} );
