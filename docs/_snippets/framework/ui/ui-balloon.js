/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import SwitchButtonView from '@ckeditor/ckeditor5-ui/src/button/switchbuttonview';

import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import {
	View,
	LabeledFieldView,
	createLabeledInputText,
	createLabeledInputNumber,
	BalloonPanelView,
	createDropdown,
	addToolbarToDropdown,
	addListToDropdown,
	Model,
	ToolbarView,
	ToolbarSeparatorView,
	SplitButtonView,
	IconView,
	TooltipManager
} from '@ckeditor/ckeditor5-ui';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import ToolbarLineBreakView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarlinebreakview';

import { icons as coreIcons } from 'ckeditor5/src/core';
import boldIcon from '@ckeditor/ckeditor5-core/theme/icons/bold.svg';
import italicIcon from '@ckeditor/ckeditor5-basic-styles/theme/icons/italic.svg';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';

window.Locale = Locale;
window.ButtonView = ButtonView;
window.BalloonPanelView = BalloonPanelView;
window.checkIcon = coreIcons.check;
window.coreIcons = coreIcons;
window.cancelIcon = coreIcons.cancel;
window.boldIcon = boldIcon;
window.italicIcon = italicIcon;
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
window.ClassicEditor = ClassicEditor;
window.TooltipManager = TooltipManager;
window.Essentials = Essentials;

const balloonButton = new ButtonView();
balloonButton.set( { label: 'Balloon button', withText: true } );
balloonButton.render();

const balloon = new BalloonPanelView();
balloon.render();
balloon.content.add( balloonButton );

document.querySelector( '.ui-balloon' ).append( balloon.element );

const positions = BalloonPanelView.defaultPositions;
balloon.pin( {
	target: document.querySelector( '.ui-balloon' ),
	positions: [ positions.northArrowSouth ]
} );

document.body.classList.add( 'ck' );
document.body.setAttribute( 'dir', 'ltr' );
