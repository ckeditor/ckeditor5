/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, Locale, LabeledFieldView, createLabeledInputText */

const locale = new Locale();

// --- Labeled input options -------------------------------------------------

const labeledInputDisabled = new LabeledFieldView( locale, createLabeledInputText );
labeledInputDisabled.value = 'The value of the input';

labeledInputDisabled.label = 'Read-only input field';
labeledInputDisabled.isEnabled = false;
labeledInputDisabled.render();

document.body.querySelector( '#snippet-input-disabled' ).appendChild( labeledInputDisabled.element );

const labeledInputInfo = new LabeledFieldView( locale, createLabeledInputText );
labeledInputInfo.isEnabled = true;

labeledInputInfo.label = 'Input field with info text';
labeledInputInfo.infoText = 'Info text goes here.';
labeledInputInfo.render();

document.body.querySelector( '#snippet-input-info' ).appendChild( labeledInputInfo.element );

const labeledInputError = new LabeledFieldView( locale, createLabeledInputText );
labeledInputInfo.isEnabled = true;

labeledInputError.label = 'Input field with error text';
labeledInputError.errorText = 'Error text goes here.';
labeledInputError.render();

document.body.querySelector( '#snippet-input-error' ).appendChild( labeledInputError.element );
