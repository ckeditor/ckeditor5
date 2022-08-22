/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import SwitchButtonView from '@ckeditor/ckeditor5-ui/src/button/switchbuttonview';

import Locale from '@ckeditor/ckeditor5-utils/src/locale';

import {
	View, LabeledFieldView, createLabeledInputText, createLabeledInputNumber, BalloonPanelView, createDropdown,
	addToolbarToDropdown, addListToDropdown, Model, ToolbarView, ToolbarSeparatorView
} from '@ckeditor/ckeditor5-ui';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import ToolbarLineBreakView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarlinebreakview';

import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

const locale = new Locale();
window.Locale = Locale;
window.ButtonView = ButtonView;
window.BalloonPanelView = BalloonPanelView;
window.checkIcon = checkIcon;
window.SwitchButtonView = SwitchButtonView;
window.createDropdown = createDropdown;
window.addToolbarToDropdown = addToolbarToDropdown;
window.addListToDropdown = addListToDropdown;
window.Collection = Collection;
window.Model = Model;
window.LabeledFieldView = LabeledFieldView;
window.createLabeledInputText = createLabeledInputText;
window.createLabeledInputNumber = createLabeledInputNumber;
window.ToolbarView = ToolbarView;
window.ToolbarSeparatorView = ToolbarSeparatorView;
window.ToolbarLineBreakView = ToolbarLineBreakView;
window.View = View;

const button = new ButtonView();
button.set( {
	label: 'A button',
	withText: true,
	class: 'ck-example-buttons'

} );
button.render();
document.getElementById( 'ui-button' ).appendChild( button.element );

const switchButton = new SwitchButtonView();
switchButton.set( {
	label: 'A switch button',
	withText: true,
	class: 'ck-example-buttons'
} );
switchButton.render();

switchButton.on( 'execute', () => {
	switchButton.isOn ? switchButton.isOn = false : switchButton.isOn = true;
} );

document.getElementById( 'ui-switchButton' ).append( switchButton.element );

// --- Contextual Balloon ------------------------------------------------------------

export default class FormView extends View {
	constructor() {
		super();
		console.log( this.setTemplate );
		const input = new LabeledFieldView( this.locale, createLabeledInputText );
		input.label = 'Input field';

		// --- Labeled input text -------------------------------------------------

		const labeledNumberView = new LabeledFieldView( locale, createLabeledInputNumber );
		labeledNumberView.label = 'Input field';

		// --- Labeled input options -------------------------------------------------

		const labeledInputDisabled = new LabeledFieldView( locale, createLabeledInputText );
		labeledInputDisabled.value = 'The value of the input';

		labeledInputDisabled.label = 'Read-only input field';
		labeledInputDisabled.isEnabled = false;

		const labeledInputInfo = new LabeledFieldView( locale, createLabeledInputText );

		labeledInputInfo.label = 'Input field with info text';
		labeledInputInfo.infoText = 'Info text goes here.';

		const labeledInputError = new LabeledFieldView( locale, createLabeledInputText );

		labeledInputError.label = 'Input field with error text';
		labeledInputError.errorText = 'Error text goes here.';

		const button = new ButtonView();
		button.set( {
			label: 'Close the balloon',
			icon: cancelIcon,
			withText: true,
			tooltip: true,
			class: 'ck-button-cancel'
		} );

		const childViews = [
			input, button, labeledInputDisabled, labeledNumberView, labeledInputError, labeledInputInfo
		];

		this.setTemplate( {
			tag: 'form',
			attributes: {
				class: [ 'ck' ],
				tabindex: '-1',
				style: {
					padding: '15px'
				}
			},
			children: childViews
		} );
	}

	render() {
		super.render();
	}
}

