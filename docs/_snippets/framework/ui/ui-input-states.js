/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { LabeledFieldView, ToolbarView, createLabeledInputText, Locale } from 'ckeditor5';

const locale = new Locale();

const enabledInput = new LabeledFieldView( locale, createLabeledInputText );
enabledInput.set( { label: 'Enabled state', isEnabled: true } );
enabledInput.render();

const disabledInput = new LabeledFieldView( locale, createLabeledInputText );
disabledInput.set( { label: 'Disabled state', isEnabled: false } );
disabledInput.render();

const inputStates = [ enabledInput, disabledInput ];

const toolbarInputStates = new ToolbarView( locale );
inputStates.forEach( input => toolbarInputStates.items.add( input ) );
toolbarInputStates.render();

document.querySelector( '.ui-input-states' ).append( toolbarInputStates.element );
