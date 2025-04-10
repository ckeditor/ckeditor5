/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Table from '../../../src/table.js';
import TableCellProperties from '../../../src/tablecellproperties.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';

import LabeledFieldView from '@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview.js';
import ColorInputView from '../../../src/ui/colorinputview.js';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview.js';

import {
	getBorderStyleDefinitions,
	getBorderStyleLabels,
	getLocalizedColorErrorText,
	getLocalizedLengthErrorText,
	lengthFieldValidator,
	lineWidthFieldValidator,
	colorFieldValidator,
	fillToolbar,
	getLabeledColorInputCreator
} from '../../../src/utils/ui/table-properties.js';
import Collection from '@ckeditor/ckeditor5-utils/src/collection.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'table utils', () => {
	let editor, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ Table, TableCellProperties, Paragraph, ClipboardPipeline ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'ui - table properties', () => {
		describe( 'getBorderStyleLabels()', () => {
			it( 'should return labels for different border styles', () => {
				const t = string => string;

				expect( getBorderStyleLabels( t ) ).to.deep.equal( {
					none: 'None',
					solid: 'Solid',
					dotted: 'Dotted',
					dashed: 'Dashed',
					double: 'Double',
					groove: 'Groove',
					ridge: 'Ridge',
					inset: 'Inset',
					outset: 'Outset'
				} );
			} );
		} );

		describe( 'getLocalizedColorErrorText()', () => {
			it( 'should return the error text', () => {
				const t = string => string;

				expect( getLocalizedColorErrorText( t ) ).to.match( /^The color is invalid/ );
			} );
		} );

		describe( 'getLocalizedLengthErrorText()', () => {
			it( 'should return the error text', () => {
				const t = string => string;

				expect( getLocalizedLengthErrorText( t ) ).to.match( /^The value is invalid/ );
			} );
		} );

		describe( 'colorFieldValidator()', () => {
			it( 'should pass for an empty value', () => {
				expect( colorFieldValidator( '' ) ).to.be.true;
			} );

			it( 'should pass for white spaces', () => {
				expect( colorFieldValidator( '  ' ) ).to.be.true;
			} );

			it( 'should pass for colors', () => {
				expect( colorFieldValidator( '#FFF' ) ).to.be.true;
				expect( colorFieldValidator( '#FFAA11' ) ).to.be.true;
				expect( colorFieldValidator( 'rgb(255,123,100)' ) ).to.be.true;
				expect( colorFieldValidator( 'RGB(255,123,100)' ) ).to.be.true;
				expect( colorFieldValidator( 'RED' ) ).to.be.true;
				expect( colorFieldValidator( 'red' ) ).to.be.true;
			} );

			it( 'should pass for colors surrounded by white spaces', () => {
				expect( colorFieldValidator( ' #AAA ' ) ).to.be.true;
				expect( colorFieldValidator( ' rgb(255,123,100) ' ) ).to.be.true;
			} );
		} );

		describe( 'lengthFieldValidator()', () => {
			it( 'should pass for an empty value', () => {
				expect( lengthFieldValidator( '' ) ).to.be.true;
			} );

			it( 'should pass for white spaces', () => {
				expect( lengthFieldValidator( '  ' ) ).to.be.true;
			} );

			it( 'should pass for lengths', () => {
				expect( lengthFieldValidator( '1px' ) ).to.be.true;
				expect( lengthFieldValidator( '12em' ) ).to.be.true;
				expect( lengthFieldValidator( ' 12em ' ) ).to.be.true;
				expect( lengthFieldValidator( '45%' ) ).to.be.true;
			} );

			it( 'should pass for number without unit', () => {
				expect( lengthFieldValidator( '1' ) ).to.be.true;
				expect( lengthFieldValidator( '12.1' ) ).to.be.true;
				expect( lengthFieldValidator( '0.125 ' ) ).to.be.true;
			} );

			it( 'should not pass for invalid number values', () => {
				expect( lengthFieldValidator( '.1 ' ) ).to.be.false;
				expect( lengthFieldValidator( '45. ' ) ).to.be.false;
				expect( lengthFieldValidator( '45.1.1 ' ) ).to.be.false;
			} );

			it( 'should pass for lengths surrounded by white spaces', () => {
				expect( lengthFieldValidator( '3px ' ) ).to.be.true;
				expect( lengthFieldValidator( ' 12em ' ) ).to.be.true;
			} );
		} );

		describe( 'lineWidthFieldValidator()', () => {
			it( 'should pass for an empty value', () => {
				expect( lineWidthFieldValidator( '' ) ).to.be.true;
			} );

			it( 'should pass for white spaces', () => {
				expect( lineWidthFieldValidator( '  ' ) ).to.be.true;
			} );

			it( 'should pass for lengths', () => {
				expect( lineWidthFieldValidator( '1px' ) ).to.be.true;
				expect( lineWidthFieldValidator( '12em' ) ).to.be.true;
				expect( lineWidthFieldValidator( ' 12em ' ) ).to.be.true;
			} );

			it( 'should pass for number without unit', () => {
				expect( lineWidthFieldValidator( '1' ) ).to.be.true;
				expect( lineWidthFieldValidator( '12.1' ) ).to.be.true;
				expect( lineWidthFieldValidator( '0.125 ' ) ).to.be.true;
			} );

			it( 'should not pass for invalid number values', () => {
				expect( lineWidthFieldValidator( '.1 ' ) ).to.be.false;
				expect( lineWidthFieldValidator( '45. ' ) ).to.be.false;
				expect( lineWidthFieldValidator( '45.1.1 ' ) ).to.be.false;
				expect( lineWidthFieldValidator( '45%' ) ).to.be.false;
			} );

			it( 'should pass for lengths surrounded by white spaces', () => {
				expect( lineWidthFieldValidator( '3px ' ) ).to.be.true;
				expect( lineWidthFieldValidator( ' 12em ' ) ).to.be.true;
			} );
		} );

		describe( 'getBorderStyleDefinitions()', () => {
			let view, locale, definitions;

			beforeEach( () => {
				locale = { t: val => val };
				view = new View( locale );
				view.set( 'borderStyle', 'none' );

				definitions = getBorderStyleDefinitions( view );
			} );

			it( 'should return a collection', () => {
				expect( definitions ).to.be.instanceOf( Collection );
			} );

			it( 'should create a button definition for each style', () => {
				expect( definitions.map( ( { type } ) => type ).every( item => item === 'button' ) ).to.be.true;
			} );

			it( 'should set label of a button for each style', () => {
				expect( definitions.map( ( { model: { label } } ) => label ) ).to.have.ordered.members( [
					'None',
					'Solid',
					'Dotted',
					'Dashed',
					'Double',
					'Groove',
					'Ridge',
					'Inset',
					'Outset'
				] );
			} );

			it( 'should set type of a button for each style', () => {
				expect( definitions.map( ( { model: { withText } } ) => withText ).every( item => item === true ) ).to.be.true;
			} );

			it( 'should bind button\'s #isOn to the view #borderStyle property', () => {
				view.borderStyle = 'dotted';

				expect( definitions.map( ( { model: { isOn } } ) => isOn ) ).to.have.ordered.members( [
					false,
					false,
					true,
					false,
					false,
					false,
					false,
					false,
					false
				] );

				view.borderStyle = 'inset';

				expect( definitions.map( ( { model: { isOn } } ) => isOn ) ).to.have.ordered.members( [
					false,
					false,
					false,
					false,
					false,
					false,
					false,
					true,
					false
				] );
			} );

			it( 'should set role of a button for each style', () => {
				expect( definitions.map( ( { model: { role } } ) => role ).every( item => item === 'menuitemradio' ) ).to.be.true;
			} );
		} );

		describe( 'fillToolbar()', () => {
			let view, locale, toolbar;

			const labels = {
				first: 'Do something',
				second: 'Do something else',
				third: 'Be default'
			};

			const icons = {
				first: '<svg viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg"><path /></svg>',
				second: '<svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path /></svg>',
				third: '<svg viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg"><path /></svg>'
			};

			beforeEach( () => {
				locale = { t: val => val };
				view = new View( locale );
				view.set( 'someProperty', 'foo' );
				toolbar = new ToolbarView( locale );

				fillToolbar( {
					view, toolbar, icons, labels,
					propertyName: 'someProperty',
					nameToValue: name => name === 'third' ? '' : name
				} );
			} );

			afterEach( () => {
				view.destroy();
			} );

			it( 'should create buttons', () => {
				expect( toolbar.items ).to.have.length( 3 );
				expect( toolbar.items.first ).to.be.instanceOf( ButtonView );
				expect( toolbar.items.get( 1 ) ).to.be.instanceOf( ButtonView );
				expect( toolbar.items.last ).to.be.instanceOf( ButtonView );
			} );

			it( 'should set button labels', () => {
				expect( toolbar.items.first.label ).to.equal( 'Do something' );
				expect( toolbar.items.get( 1 ).label ).to.equal( 'Do something else' );
				expect( toolbar.items.last.label ).to.equal( 'Be default' );
			} );

			it( 'should set button icons', () => {
				expect( toolbar.items.first.icon ).to.equal( icons.first );
				expect( toolbar.items.get( 1 ).icon ).to.equal( icons.second );
				expect( toolbar.items.last.icon ).to.equal( icons.third );
			} );

			it( 'should set button tooltips', () => {
				expect( toolbar.items.first.tooltip ).to.equal( labels.first );
				expect( toolbar.items.get( 1 ).tooltip ).to.equal( labels.second );
				expect( toolbar.items.last.tooltip ).to.equal( labels.third );
			} );

			it( 'should bind button #isOn to an observable property', () => {
				expect( toolbar.items.first.isOn ).to.be.false;
				expect( toolbar.items.get( 1 ).isOn ).to.be.false;
				expect( toolbar.items.last.isOn ).to.be.false;

				view.someProperty = 'first';

				expect( toolbar.items.first.isOn ).to.be.true;
				expect( toolbar.items.get( 1 ).isOn ).to.be.false;
				expect( toolbar.items.last.isOn ).to.be.false;

				view.someProperty = 'second';

				expect( toolbar.items.first.isOn ).to.be.false;
				expect( toolbar.items.get( 1 ).isOn ).to.be.true;
				expect( toolbar.items.last.isOn ).to.be.false;

				view.someProperty = '';

				expect( toolbar.items.first.isOn ).to.be.false;
				expect( toolbar.items.get( 1 ).isOn ).to.be.false;
				expect( toolbar.items.last.isOn ).to.be.true;
			} );

			it( 'should make the buttons change the property value upon execution', () => {
				toolbar.items.first.fire( 'execute' );

				expect( view.someProperty ).to.equal( 'first' );

				toolbar.items.get( 1 ).fire( 'execute' );

				expect( view.someProperty ).to.equal( 'second' );

				toolbar.items.last.fire( 'execute' );

				expect( view.someProperty ).to.equal( '' );
			} );

			it( 'should toggle the property value when an active button is clicked', () => {
				// Set the property to match one of the button values.
				view.someProperty = 'first';
				expect( toolbar.items.first.isOn ).to.be.true;

				// Click the active button.
				toolbar.items.first.fire( 'execute' );

				// The property should be reset to undefined.
				expect( view.someProperty ).to.be.undefined;

				// Clicking the button again should set the value back.
				toolbar.items.first.fire( 'execute' );
				expect( view.someProperty ).to.equal( 'first' );
			} );

			describe( 'skipping "nameToValue" callback', () => {
				let view, locale, toolbar;

				beforeEach( () => {
					locale = { t: val => val };
					view = new View( locale );
					view.set( 'someProperty', 'foo' );
					toolbar = new ToolbarView( locale );

					fillToolbar( {
						view, toolbar, icons, labels,
						propertyName: 'someProperty'
					} );
				} );

				afterEach( () => {
					view.destroy();
				} );

				it( 'should make the buttons change the property value upon execution', () => {
					toolbar.items.first.fire( 'execute' );

					expect( view.someProperty ).to.equal( 'first' );

					toolbar.items.get( 1 ).fire( 'execute' );

					expect( view.someProperty ).to.equal( 'second' );

					toolbar.items.last.fire( 'execute' );

					expect( view.someProperty ).to.equal( 'third' );
				} );
			} );

			describe( 'providing "defaultValue"', () => {
				let view, locale, toolbar;

				beforeEach( () => {
					locale = { t: val => val };
					view = new View( locale );
					view.set( 'someProperty', 'foo' );
					toolbar = new ToolbarView( locale );

					fillToolbar( {
						view, toolbar, icons, labels,
						propertyName: 'someProperty',
						defaultValue: 'third'
					} );
				} );

				afterEach( () => {
					view.destroy();
				} );

				it( 'should bind button #isOn to an observable property', () => {
					view.someProperty = '';

					expect( toolbar.items.first.isOn ).to.be.false;
					expect( toolbar.items.get( 1 ).isOn ).to.be.false;
					expect( toolbar.items.last.isOn ).to.be.true;

					view.someProperty = 'third';

					expect( toolbar.items.first.isOn ).to.be.false;
					expect( toolbar.items.get( 1 ).isOn ).to.be.false;
					expect( toolbar.items.last.isOn ).to.be.true;

					view.someProperty = 'first';

					expect( toolbar.items.first.isOn ).to.be.true;
					expect( toolbar.items.get( 1 ).isOn ).to.be.false;
					expect( toolbar.items.last.isOn ).to.be.false;
				} );
			} );
		} );

		describe( 'getLabeledColorInputCreator()', () => {
			let creator, labeledField;

			const colorConfig = [
				{
					color: 'hsl(180, 75%, 60%)',
					label: 'Turquoise'
				},
				{
					color: 'hsl(210, 75%, 60%)',
					label: 'Light blue'
				}
			];

			beforeEach( () => {
				creator = getLabeledColorInputCreator( {
					colorConfig,
					columns: 3,
					colorPickerConfig: {
						format: 'hex'
					}
				} );

				labeledField = new LabeledFieldView( { t: () => {} }, creator );
			} );

			afterEach( () => {
				labeledField.destroy();
			} );

			it( 'should return a function', () => {
				expect( creator ).to.be.a( 'function' );
			} );

			it( 'should pass the options.colorConfig on', () => {
				expect( labeledField.fieldView.options.colorDefinitions ).to.have.length( 2 );
			} );

			it( 'should pass the options.columns on', () => {
				expect( labeledField.fieldView.options.columns ).to.equal( 3 );
			} );

			it( 'should return a ColorInputView instance', () => {
				expect( labeledField.fieldView ).to.be.instanceOf( ColorInputView );
			} );

			it( 'should set ColorInputView#id', () => {
				expect( labeledField.fieldView.inputView.id ).to.match( /^ck-labeled-field-view-.+/ );
			} );

			it( 'should set ColorInputView#ariaDescribedById', () => {
				expect( labeledField.fieldView.inputView.ariaDescribedById ).to.match( /^ck-labeled-field-view-status-.+/ );
			} );

			it( 'should bind ColorInputView#isReadOnly to LabeledFieldView#isEnabled', () => {
				labeledField.isEnabled = true;
				expect( labeledField.fieldView.isReadOnly ).to.be.false;

				labeledField.isEnabled = false;
				expect( labeledField.fieldView.isReadOnly ).to.be.true;
			} );

			it( 'should bind ColorInputView#hasError to LabeledFieldView#errorText', () => {
				labeledField.errorText = 'foo';
				expect( labeledField.fieldView.hasError ).to.be.true;

				labeledField.errorText = null;
				expect( labeledField.fieldView.hasError ).to.be.false;
			} );

			it( 'should clear labeld field view #errorText upon #input event', () => {
				labeledField.errorText = 'foo';

				labeledField.fieldView.fire( 'input' );

				expect( labeledField.errorText ).to.be.null;
			} );

			it( 'should bind LabeledFieldView#isEmpty to the ColorInputView instance', () => {
				labeledField.fieldView.isEmpty = true;
				expect( labeledField.isEmpty ).to.be.true;

				labeledField.fieldView.isEmpty = false;
				expect( labeledField.isEmpty ).to.be.false;
			} );

			it( 'should bind LabeledFieldView#isFocused to the ColorInputView instance', () => {
				labeledField.fieldView.isFocused = true;
				expect( labeledField.isFocused ).to.be.true;

				labeledField.fieldView.isFocused = false;
				expect( labeledField.isFocused ).to.be.false;
			} );

			it( 'should have proper format in color picker', () => {
				const panelView = labeledField.fieldView.dropdownView.panelView;
				const colorPicker = panelView.children.get( 0 ).colorPickerFragmentView.colorPickerView;

				colorPicker.color = 'hsl(180, 75%, 60%)';
				expect( colorPicker.color ).to.equal( '#4CE6E6' );
			} );
		} );
	} );
} );
