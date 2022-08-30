/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Locale, LabeledFieldView, createLabeledInputText */

const locale = new Locale();

// --- Labeled input options -------------------------------------------------

const labeledInputDisabled = new LabeledFieldView( locale, createLabeledInputText );

labeledInputDisabled.label = 'Read-only input field';
labeledInputDisabled.isEnabled = false;
labeledInputDisabled.render();

document.body.querySelector( '#snippet-input-disabled' ).appendChild( labeledInputDisabled.element );

const labeledInputInfo = new LabeledFieldView( locale, createLabeledInputText );

labeledInputInfo.label = 'Input field with info text';
labeledInputInfo.infoText = 'Info text goes here.';
labeledInputInfo.render();

document.body.querySelector( '#snippet-input-info' ).appendChild( labeledInputInfo.element );

const labeledInputError = new LabeledFieldView( locale, createLabeledInputText );

labeledInputError.label = 'Input field with error text';
labeledInputError.errorText = 'Error text goes here.';
labeledInputError.render();

document.body.querySelector( '#snippet-input-error' ).appendChild( labeledInputError.element );
