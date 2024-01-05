/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Locale, LabeledFieldView, createLabeledInputText, createLabeledInputNumber, createLabeledInputUrl, ToolbarView, document */

const locale = new Locale();

const textInput = new LabeledFieldView( locale, createLabeledInputText );
textInput.set( { label: 'Text input', value: 'Value of the input' } );
textInput.render();

const numberInput = new LabeledFieldView( locale, createLabeledInputNumber );
numberInput.set( { label: 'Number input', value: 'Value of the input' } );
numberInput.render();

const urlInput = new LabeledFieldView( locale, createLabeledInputUrl );
urlInput.set( { label: 'URL input', value: 'https://ckeditor.com/' } );
urlInput.render();

const inputs = [ textInput, numberInput, urlInput ];

const toolbarInputs = new ToolbarView( locale );
inputs.forEach( input => toolbarInputs.items.add( input ) );
toolbarInputs.render();

document.querySelector( '.ui-input' ).append( toolbarInputs.element );
