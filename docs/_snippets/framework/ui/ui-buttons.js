/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import SwitchButtonView from '@ckeditor/ckeditor5-ui/src/button/switchbuttonview';

import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import {
	View, LabeledFieldView, createLabeledInputText, createLabeledInputNumber, BalloonPanelView, createDropdown,
	addToolbarToDropdown, addListToDropdown, Model, ToolbarView, ToolbarSeparatorView, SplitButtonView, IconView
} from '@ckeditor/ckeditor5-ui';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import ToolbarLineBreakView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarlinebreakview';

import { icons as coreIcons } from 'ckeditor5/src/core';

window.Locale = Locale;
window.ButtonView = ButtonView;
window.BalloonPanelView = BalloonPanelView;
window.checkIcon = coreIcons.check;
window.coreIcons = coreIcons;
window.cancelIcon = coreIcons.cancel;
window.SwitchButtonView = SwitchButtonView;
window.SplitButtonView = SplitButtonView;
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
window.IconView = IconView;

const button = new ButtonView();
button.set( {
	label: 'Button',
	withText: true,
	class: 'ck-example-buttons'

} );
button.render();
document.getElementById( 'ui-button' ).appendChild( button.element );

const switchButton = new SwitchButtonView();
switchButton.set( {
	label: 'Switch button',
	withText: true,
	class: 'ck-example-buttons'
} );
switchButton.render();

switchButton.on( 'execute', () => {
	switchButton.isOn ? switchButton.isOn = false : switchButton.isOn = true;
} );

document.getElementById( 'ui-switchButton' ).append( switchButton.element );
