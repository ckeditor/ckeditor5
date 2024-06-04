/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import {
	BalloonPanelView,
	ButtonView,
	DialogView,
	DialogViewPosition,
	Dialog,
	IconView,
	LabeledFieldView,
	ListView,
	ViewModel,
	SearchTextView,
	SpinnerView,
	SplitButtonView,
	SwitchButtonView,
	TextareaView,
	ToolbarSeparatorView,
	ToolbarLineBreakView,
	ToolbarView,
	TooltipManager,
	View,
	addListToDropdown,
	addToolbarToDropdown,
	createDropdown,
	createLabeledInputNumber,
	createLabeledInputText
} from '@ckeditor/ckeditor5-ui';
import { Collection, Locale } from '@ckeditor/ckeditor5-utils';

import italicIcon from '@ckeditor/ckeditor5-basic-styles/theme/icons/italic.svg';
import boldIcon from '@ckeditor/ckeditor5-core/theme/icons/bold.svg';
import { icons as coreIcons } from 'ckeditor5/src/core.js';

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Bold, Italic, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

window.BalloonPanelView = BalloonPanelView;
window.ButtonView = ButtonView;
window.DialogView = DialogView;
window.IconView = IconView;
window.LabeledFieldView = LabeledFieldView;
window.ListView = ListView;
window.Model = ViewModel;
window.SearchTextView = SearchTextView;
window.SpinnerView = SpinnerView;
window.SplitButtonView = SplitButtonView;
window.SwitchButtonView = SwitchButtonView;
window.TextareaView = TextareaView;
window.ToolbarSeparatorView = ToolbarSeparatorView;
window.ToolbarLineBreakView = ToolbarLineBreakView;
window.ToolbarView = ToolbarView;
window.TooltipManager = TooltipManager;
window.View = View;
window.addListToDropdown = addListToDropdown;
window.addToolbarToDropdown = addToolbarToDropdown;
window.createDropdown = createDropdown;
window.createLabeledInputNumber = createLabeledInputNumber;
window.createLabeledInputText = createLabeledInputText;
window.Collection = Collection;
window.Locale = Locale;

window.checkIcon = coreIcons.check;
window.coreIcons = coreIcons;
window.cancelIcon = coreIcons.cancel;
window.boldIcon = boldIcon;
window.italicIcon = italicIcon;

window.DialogViewPosition = DialogViewPosition;
window.Plugin = Plugin;
window.ClassicEditor = ClassicEditor;
window.Essentials = Essentials;
window.Bold = Bold;
window.Italic = Italic;
window.Underline = Underline;
window.Dialog = Dialog;
window.Paragraph = Paragraph;

const balloonButton = new ButtonView();
balloonButton.set( { label: 'Balloon button', withText: true } );
balloonButton.render();

const balloon = new BalloonPanelView();
balloon.render();
balloon.content.add( balloonButton );

document.body.append( balloon.element );

const positions = BalloonPanelView.defaultPositions;
balloon.pin( {
	target: document.querySelector( '.ui-balloon' ),
	positions: [ positions.northArrowSouth ]
} );

document.body.classList.add( 'ck' );
document.body.setAttribute( 'dir', 'ltr' );
