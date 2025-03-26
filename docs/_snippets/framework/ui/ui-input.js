/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	LabeledFieldView,
	ToolbarView,
	createLabeledInputNumber,
	createLabeledInputText,
	Locale
} from 'ckeditor5';

const locale = new Locale();

const textInput = new LabeledFieldView( locale, createLabeledInputText );
textInput.set( { label: 'Text input', value: 'Value of the input' } );
textInput.render();

const numberInput = new LabeledFieldView( locale, createLabeledInputNumber );
numberInput.set( { label: 'Number input', value: 'Value of the input' } );
numberInput.render();

const inputs = [ textInput, numberInput ];

const toolbarInputs = new ToolbarView( locale );
inputs.forEach( input => toolbarInputs.items.add( input ) );
toolbarInputs.render();

document.querySelector( '.ui-input' ).append( toolbarInputs.element );
