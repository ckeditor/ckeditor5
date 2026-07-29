/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Table } from '../../../src/table.js';
import { TableCellProperties } from '../../../src/tablecellproperties.js';
import { global, Collection } from '@ckeditor/ckeditor5-utils';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { View, ButtonView, LabeledFieldView, ToolbarView } from '@ckeditor/ckeditor5-ui';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';

import { ColorInputView } from '../../../src/ui/colorinputview.js';

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
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe( 'table utils', () => {
	let editor, editorElement;

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

				expect( getBorderStyleLabels( t ) ).toEqual( {
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

				expect( getLocalizedColorErrorText( t ) ).toMatch( /^The color is invalid/ );
			} );
		} );

		describe( 'getLocalizedLengthErrorText()', () => {
			it( 'should return the error text', () => {
				const t = string => string;

				expect( getLocalizedLengthErrorText( t ) ).toMatch( /^The value is invalid/ );
			} );
		} );

		describe( 'colorFieldValidator()', () => {
			it( 'should pass for an empty value', () => {
				expect( colorFieldValidator( '' ) ).toBe( true );
			} );

			it( 'should pass for white spaces', () => {
				expect( colorFieldValidator( '  ' ) ).toBe( true );
			} );

			it( 'should pass for colors', () => {
				expect( colorFieldValidator( '#FFF' ) ).toBe( true );
				expect( colorFieldValidator( '#FFAA11' ) ).toBe( true );
				expect( colorFieldValidator( 'rgb(255,123,100)' ) ).toBe( true );
				expect( colorFieldValidator( 'RGB(255,123,100)' ) ).toBe( true );
				expect( colorFieldValidator( 'RED' ) ).toBe( true );
				expect( colorFieldValidator( 'red' ) ).toBe( true );
			} );

			it( 'should pass for colors surrounded by white spaces', () => {
				expect( colorFieldValidator( ' #AAA ' ) ).toBe( true );
				expect( colorFieldValidator( ' rgb(255,123,100) ' ) ).toBe( true );
			} );
		} );

		describe( 'lengthFieldValidator()', () => {
			it( 'should pass for an empty value', () => {
				expect( lengthFieldValidator( '' ) ).toBe( true );
			} );

			it( 'should pass for white spaces', () => {
				expect( lengthFieldValidator( '  ' ) ).toBe( true );
			} );

			it( 'should pass for lengths', () => {
				expect( lengthFieldValidator( '1px' ) ).toBe( true );
				expect( lengthFieldValidator( '12em' ) ).toBe( true );
				expect( lengthFieldValidator( ' 12em ' ) ).toBe( true );
				expect( lengthFieldValidator( '45%' ) ).toBe( true );
			} );

			it( 'should pass for number without unit', () => {
				expect( lengthFieldValidator( '1' ) ).toBe( true );
				expect( lengthFieldValidator( '12.1' ) ).toBe( true );
				expect( lengthFieldValidator( '0.125 ' ) ).toBe( true );
			} );

			it( 'should not pass for invalid number values', () => {
				expect( lengthFieldValidator( '.1 ' ) ).toBe( false );
				expect( lengthFieldValidator( '45. ' ) ).toBe( false );
				expect( lengthFieldValidator( '45.1.1 ' ) ).toBe( false );
			} );

			it( 'should pass for lengths surrounded by white spaces', () => {
				expect( lengthFieldValidator( '3px ' ) ).toBe( true );
				expect( lengthFieldValidator( ' 12em ' ) ).toBe( true );
			} );
		} );

		describe( 'lineWidthFieldValidator()', () => {
			it( 'should pass for an empty value', () => {
				expect( lineWidthFieldValidator( '' ) ).toBe( true );
			} );

			it( 'should pass for white spaces', () => {
				expect( lineWidthFieldValidator( '  ' ) ).toBe( true );
			} );

			it( 'should pass for lengths', () => {
				expect( lineWidthFieldValidator( '1px' ) ).toBe( true );
				expect( lineWidthFieldValidator( '12em' ) ).toBe( true );
				expect( lineWidthFieldValidator( ' 12em ' ) ).toBe( true );
			} );

			it( 'should pass for number without unit', () => {
				expect( lineWidthFieldValidator( '1' ) ).toBe( true );
				expect( lineWidthFieldValidator( '12.1' ) ).toBe( true );
				expect( lineWidthFieldValidator( '0.125 ' ) ).toBe( true );
			} );

			it( 'should not pass for invalid number values', () => {
				expect( lineWidthFieldValidator( '.1 ' ) ).toBe( false );
				expect( lineWidthFieldValidator( '45. ' ) ).toBe( false );
				expect( lineWidthFieldValidator( '45.1.1 ' ) ).toBe( false );
				expect( lineWidthFieldValidator( '45%' ) ).toBe( false );
			} );

			it( 'should pass for lengths surrounded by white spaces', () => {
				expect( lineWidthFieldValidator( '3px ' ) ).toBe( true );
				expect( lineWidthFieldValidator( ' 12em ' ) ).toBe( true );
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
				expect( definitions ).toBeInstanceOf( Collection );
			} );

			it( 'should create a button definition for each style', () => {
				expect( definitions.map( ( { type } ) => type ).every( item => item === 'button' ) ).toBe( true );
			} );

			it( 'should set label of a button for each style', () => {
				expect( definitions.map( ( { model: { label } } ) => label ) ).toEqual( [
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
				expect( definitions.map( ( { model: { withText } } ) => withText ).every( item => item === true ) ).toBe( true );
			} );

			it( 'should bind button\'s #isOn to the view #borderStyle property', () => {
				view.borderStyle = 'dotted';

				expect( definitions.map( ( { model: { isOn } } ) => isOn ) ).toEqual( [
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

				expect( definitions.map( ( { model: { isOn } } ) => isOn ) ).toEqual( [
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
				expect( definitions.map( ( { model: { role } } ) => role ).every( item => item === 'menuitemradio' ) ).toBe( true );
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
				expect( toolbar.items ).toHaveLength( 3 );
				expect( toolbar.items.first ).toBeInstanceOf( ButtonView );
				expect( toolbar.items.get( 1 ) ).toBeInstanceOf( ButtonView );
				expect( toolbar.items.last ).toBeInstanceOf( ButtonView );
			} );

			it( 'should set button labels', () => {
				expect( toolbar.items.first.label ).toBe( 'Do something' );
				expect( toolbar.items.get( 1 ).label ).toBe( 'Do something else' );
				expect( toolbar.items.last.label ).toBe( 'Be default' );
			} );

			it( 'should set button icons', () => {
				expect( toolbar.items.first.icon ).toBe( icons.first );
				expect( toolbar.items.get( 1 ).icon ).toBe( icons.second );
				expect( toolbar.items.last.icon ).toBe( icons.third );
			} );

			it( 'should set button tooltips', () => {
				expect( toolbar.items.first.tooltip ).toBe( labels.first );
				expect( toolbar.items.get( 1 ).tooltip ).toBe( labels.second );
				expect( toolbar.items.last.tooltip ).toBe( labels.third );
			} );

			it( 'should bind button #isOn to an observable property', () => {
				expect( toolbar.items.first.isOn ).toBe( false );
				expect( toolbar.items.get( 1 ).isOn ).toBe( false );
				expect( toolbar.items.last.isOn ).toBe( false );

				view.someProperty = 'first';

				expect( toolbar.items.first.isOn ).toBe( true );
				expect( toolbar.items.get( 1 ).isOn ).toBe( false );
				expect( toolbar.items.last.isOn ).toBe( false );

				view.someProperty = 'second';

				expect( toolbar.items.first.isOn ).toBe( false );
				expect( toolbar.items.get( 1 ).isOn ).toBe( true );
				expect( toolbar.items.last.isOn ).toBe( false );

				view.someProperty = '';

				expect( toolbar.items.first.isOn ).toBe( false );
				expect( toolbar.items.get( 1 ).isOn ).toBe( false );
				expect( toolbar.items.last.isOn ).toBe( true );
			} );

			it( 'should make the buttons change the property value upon execution', () => {
				toolbar.items.first.fire( 'execute' );

				expect( view.someProperty ).toBe( 'first' );

				toolbar.items.get( 1 ).fire( 'execute' );

				expect( view.someProperty ).toBe( 'second' );

				toolbar.items.last.fire( 'execute' );

				expect( view.someProperty ).toBe( '' );
			} );

			it( 'should toggle the property value when an active button is clicked', () => {
				// Set the property to match one of the button values.
				view.someProperty = 'first';
				expect( toolbar.items.first.isOn ).toBe( true );

				// Click the active button.
				toolbar.items.first.fire( 'execute' );

				// The property should be reset to undefined.
				expect( view.someProperty ).toBeUndefined();

				// Clicking the button again should set the value back.
				toolbar.items.first.fire( 'execute' );
				expect( view.someProperty ).toBe( 'first' );
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

					expect( view.someProperty ).toBe( 'first' );

					toolbar.items.get( 1 ).fire( 'execute' );

					expect( view.someProperty ).toBe( 'second' );

					toolbar.items.last.fire( 'execute' );

					expect( view.someProperty ).toBe( 'third' );
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

					expect( toolbar.items.first.isOn ).toBe( false );
					expect( toolbar.items.get( 1 ).isOn ).toBe( false );
					expect( toolbar.items.last.isOn ).toBe( true );

					view.someProperty = 'third';

					expect( toolbar.items.first.isOn ).toBe( false );
					expect( toolbar.items.get( 1 ).isOn ).toBe( false );
					expect( toolbar.items.last.isOn ).toBe( true );

					view.someProperty = 'first';

					expect( toolbar.items.first.isOn ).toBe( true );
					expect( toolbar.items.get( 1 ).isOn ).toBe( false );
					expect( toolbar.items.last.isOn ).toBe( false );
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
				expect( creator ).toBeTypeOf( 'function' );
			} );

			it( 'should pass the options.colorConfig on', () => {
				expect( labeledField.fieldView.options.colorDefinitions ).toHaveLength( 2 );
			} );

			it( 'should pass the options.columns on', () => {
				expect( labeledField.fieldView.options.columns ).toBe( 3 );
			} );

			it( 'should return a ColorInputView instance', () => {
				expect( labeledField.fieldView ).toBeInstanceOf( ColorInputView );
			} );

			it( 'should set ColorInputView#id', () => {
				expect( labeledField.fieldView.inputView.id ).toMatch( /^ck-labeled-field-view-.+/ );
			} );

			it( 'should set ColorInputView#ariaDescribedById', () => {
				expect( labeledField.fieldView.inputView.ariaDescribedById ).toMatch( /^ck-labeled-field-view-status-.+/ );
			} );

			it( 'should bind ColorInputView#isReadOnly to LabeledFieldView#isEnabled', () => {
				labeledField.isEnabled = true;
				expect( labeledField.fieldView.isReadOnly ).toBe( false );

				labeledField.isEnabled = false;
				expect( labeledField.fieldView.isReadOnly ).toBe( true );
			} );

			it( 'should bind ColorInputView#hasError to LabeledFieldView#errorText', () => {
				labeledField.errorText = 'foo';
				expect( labeledField.fieldView.hasError ).toBe( true );

				labeledField.errorText = null;
				expect( labeledField.fieldView.hasError ).toBe( false );
			} );

			it( 'should clear labeld field view #errorText upon #input event', () => {
				labeledField.errorText = 'foo';

				labeledField.fieldView.fire( 'input' );

				expect( labeledField.errorText ).toBeNull();
			} );

			it( 'should bind LabeledFieldView#isEmpty to the ColorInputView instance', () => {
				labeledField.fieldView.isEmpty = true;
				expect( labeledField.isEmpty ).toBe( true );

				labeledField.fieldView.isEmpty = false;
				expect( labeledField.isEmpty ).toBe( false );
			} );

			it( 'should bind LabeledFieldView#isFocused to the ColorInputView instance', () => {
				labeledField.fieldView.isFocused = true;
				expect( labeledField.isFocused ).toBe( true );

				labeledField.fieldView.isFocused = false;
				expect( labeledField.isFocused ).toBe( false );
			} );

			it( 'should have proper format in color picker', () => {
				const panelView = labeledField.fieldView.dropdownView.panelView;
				const colorPicker = panelView.children.get( 0 ).colorPickerFragmentView.colorPickerView;

				colorPicker.color = 'hsl(180, 75%, 60%)';
				expect( colorPicker.color ).toBe( '#4CE6E6' );
			} );
		} );
	} );
} );
