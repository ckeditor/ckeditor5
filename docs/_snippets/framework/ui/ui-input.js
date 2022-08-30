/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Locale, LabeledFieldView, createLabeledInputText, createLabeledInputNumber */
const locale = new Locale();

// --- Labeled input text -------------------------------------------------

const labeledInputView = new LabeledFieldView( locale, createLabeledInputText );

labeledInputView.label = 'Input text field';
labeledInputView.render();

document.body.querySelector( '#snippet-text-input' ).appendChild( labeledInputView.element );

// --- Labeled input number -------------------------------------------------

const labeledNumberView = new LabeledFieldView( locale, createLabeledInputNumber );

labeledNumberView.label = 'Input number field';

labeledNumberView.render();

document.body.querySelector( '#snippet-number-input' ).appendChild( labeledNumberView.element );
