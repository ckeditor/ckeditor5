/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import View from '@ckeditor/ckeditor5-ui/src/view';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import SwitchButtonView from '@ckeditor/ckeditor5-ui/src/button/switchbuttonview';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview';

import { createDropdown, addListToDropdown, addToolbarToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import ToolbarSeparatorView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarseparatorview';
import ToolbarLineBreakView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarlinebreakview';

import LabeledFieldView from '@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview';
import { createLabeledInputText, createLabeledInputNumber } from '@ckeditor/ckeditor5-ui/src/labeledfield/utils';

import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

import { ContextualBalloon, clickOutsideHandler } from '@ckeditor/ckeditor5-ui';

const locale = new Locale();

// --- Buttons ------------------------------------------------------------

class ButtonsPlugin extends Plugin {
	init() {
		this.editor.ui.componentFactory.add( 'button', () => {
			const button = new ButtonView();
			button.set( {
				label: 'A button',
				withText: true
			} );

			return button;
		} );
		this.editor.ui.componentFactory.add( 'splitButton', () => {
			const splitButton = new SplitButtonView();
			splitButton.set( {
				label: 'A split button',
				withText: true
			} );

			return splitButton;
		} );
		const switchButton = new SwitchButtonView();
		this.editor.ui.componentFactory.add( 'switchButton', () => {
			switchButton.set( {
				label: 'A switch button',
				withText: true
			} );

			return switchButton;
		} );
		this.listenTo( switchButton, 'execute', () => {
			switchButton.isOn ? switchButton.isOn = false : switchButton.isOn = true;
		} );
	}
}

// --- Button options ------------------------------------------------------------

class ButtonsOptionsPlugin extends Plugin {
	init() {
		this.editor.ui.componentFactory.add( 'actionButton', () => {
			const actionButton = new ButtonView();
			actionButton.set( {
				label: 'An action button',
				withText: true,
				class: 'ck-button-action'
			} );

			return actionButton;
		} );
		this.editor.ui.componentFactory.add( 'roundedButton', () => {
			const roundedButton = new ButtonView();
			roundedButton.set( {
				label: 'A button with rounded corners',
				withText: true,
				class: 'ck-rounded-corners'
			} );

			return roundedButton;
		} );
		this.editor.ui.componentFactory.add( 'boldButton', () => {
			const boldButton = new ButtonView();
			boldButton.set( {
				label: 'A bold button',
				withText: true,
				class: 'ck-button-bold'
			} );

			return boldButton;
		} );
		this.editor.ui.componentFactory.add( 'disabledButton', () => {
			const disabledButton = new ButtonView();
			disabledButton.set( {
				isEnabled: false,
				label: 'A disabled button',
				withText: true
			} );

			return disabledButton;
		} );
		this.editor.ui.componentFactory.add( 'onButton', () => {
			const onButton = new ButtonView();
			onButton.set( {
				isOn: true,
				label: 'A pressed button',
				withText: true
			} );

			return onButton;
		} );
	}
}

// --- Buttons with keystrokes ------------------------------------------------------------

class ButtonsIconsKeystrokesPlugin extends Plugin {
	init() {
		this.editor.ui.componentFactory.add( 'keystrokeButton', () => {
			const keystrokeButton = new ButtonView();
			keystrokeButton.set( {
				label: 'A button with a keystroke',
				withText: true,
				withKeystroke: true,
				keystroke: 'Ctrl+A'
			} );

			return keystrokeButton;
		} );
		this.editor.ui.componentFactory.add( 'iconButton', () => {
			const iconButton = new ButtonView();
			iconButton.set( {
				label: 'A button with an icon',
				withText: false,
				icon: checkIcon,
				class: 'ck-button-save'
			} );

			return iconButton;
		} );

		this.editor.ui.componentFactory.add( 'iconKeystrokeButton', () => {
			const iconKeystrokeButton = new ButtonView();
			iconKeystrokeButton.set( {
				label: 'A button with an icon and a keystroke',
				withText: false,
				icon: cancelIcon,
				keystroke: 'Esc',
				withKeystroke: true,
				class: 'ck-button-cancel'
			} );

			return iconKeystrokeButton;
		} );
	}
}

// --- Tooltip ------------------------------------------------------------

class TooltipPlugin extends Plugin {
	init() {
		this.editor.ui.componentFactory.add( 'tooltip1', () => {
			const tooltip1 = new ButtonView();
			tooltip1.set( {
				label: 'This button has a tooltip when hovered (south)',
				withText: true,
				tooltip: 'The content of the tooltip'
			} );

			return tooltip1;
		} );
		this.editor.ui.componentFactory.add( 'tooltip2', () => {
			const tooltip2 = new ButtonView();
			tooltip2.set( {
				label: 'North',
				withText: true,
				tooltip: true,
				tooltipPosition: 'n'
			} );

			return tooltip2;
		} );
		this.editor.ui.componentFactory.add( 'tooltip3', () => {
			const tooltip3 = new ButtonView();
			tooltip3.set( {
				label: 'West',
				withText: true,
				tooltip: true,
				tooltipPosition: 'w'
			} );

			return tooltip3;
		} );
		this.editor.ui.componentFactory.add( 'tooltip4', () => {
			const tooltip4 = new ButtonView();
			tooltip4.set( {
				label: 'East',
				withText: true,
				tooltip: true,
				tooltipPosition: 'e'
			} );

			return tooltip4;
		} );
		this.editor.ui.componentFactory.add( 'tooltip5', () => {
			const tooltip5 = new ButtonView();
			tooltip5.set( {
				label: 'South East',
				withText: true,
				tooltip: true,
				tooltipPosition: 'se'
			} );

			return tooltip5;
		} );
		this.editor.ui.componentFactory.add( 'tooltip6', () => {
			const tooltip6 = new ButtonView();
			tooltip6.set( {
				label: 'South West',
				withText: true,
				tooltip: true,
				tooltipPosition: 'sw'
			} );

			return tooltip6;
		} );
	}
}
// --- Labeled input text -------------------------------------------------

const labeledInputView = new LabeledFieldView( locale, createLabeledInputText );
labeledInputView.isEnabled = true;

labeledInputView.label = 'Input field';
labeledInputView.placeholder = 'Placeholder';
labeledInputView.render();

document.body.querySelector( '#snippet-text-input' ).appendChild( labeledInputView.element );

// --- Labeled input text -------------------------------------------------

const labeledNumberView = new LabeledFieldView( locale, createLabeledInputNumber );
labeledNumberView.isEnabled = true;

labeledNumberView.label = 'Input field';
labeledNumberView.placeholder = 'Placeholder';
labeledNumberView.render();

document.body.querySelector( '#snippet-number-input' ).appendChild( labeledNumberView.element );

// --- Labeled input options -------------------------------------------------

const labeledInputDisabled = new LabeledFieldView( locale, createLabeledInputText );
labeledInputDisabled.value = 'The value of the input';

labeledInputDisabled.label = 'Read-only input field';
labeledInputDisabled.placeholder = 'Placeholder';
labeledInputDisabled.isEnabled = false;
labeledInputDisabled.render();

document.body.querySelector( '#snippet-input-disabled' ).appendChild( labeledInputDisabled.element );

const labeledInputInfo = new LabeledFieldView( locale, createLabeledInputText );
labeledInputInfo.isEnabled = true;

labeledInputInfo.label = 'Input field with info text';
labeledInputInfo.infoText = 'Info text goes here.';
labeledInputInfo.placeholder = 'Placeholder';
labeledInputInfo.render();

document.body.querySelector( '#snippet-input-info' ).appendChild( labeledInputInfo.element );

const labeledInputError = new LabeledFieldView( locale, createLabeledInputText );
labeledInputInfo.isEnabled = true;

labeledInputError.label = 'Input field with error text';
labeledInputError.errorText = 'Error text goes here.';
labeledInputError.placeholder = 'Placeholder';
labeledInputError.render();

document.body.querySelector( '#snippet-input-error' ).appendChild( labeledInputError.element );

// --- Toolbar ------------------------------------------------------------

class ToolbarExample extends Plugin {
	init() {
		const buttons = [];

		const toolbarButton = new ButtonView();
		toolbarButton.set( {
			label: 'A button',
			withText: true
		} );
		const toolbarSwitchButton = new SwitchButtonView();
		toolbarSwitchButton.set( {
			label: 'A switch button ',
			withText: true
		} );
		const toolbarIconButton = new ButtonView();
		toolbarIconButton.set( {
			label: 'An icon button',
			icon: checkIcon,
			tooltip: true
		} );
		buttons.push( toolbarButton, toolbarSwitchButton, toolbarIconButton );

		this.editor.ui.componentFactory.add( 'toolbar', () => {
			const dropdown = createDropdown( locale );

			dropdown.buttonView.set( {
				label: 'Open toolbar',
				withText: true
			} );
			addToolbarToDropdown( dropdown, buttons );

			return dropdown;
		} );

		this.listenTo( toolbarSwitchButton, 'execute', () => {
			toolbarSwitchButton.isOn ? toolbarSwitchButton.isOn = false : toolbarSwitchButton.isOn = true;
		} );
	}
}

// --- Wrapped toolbar  ------------------------------------------------------------

class WrappedToolbarExample extends Plugin {
	init() {
		const buttons = [];

		const toolbarButton = new ButtonView();
		toolbarButton.set( {
			label: 'A button',
			withText: true
		} );
		const toolbarSwitchButton = new SwitchButtonView();
		toolbarSwitchButton.set( {
			label: 'A switch button ',
			withText: true
		} );
		const toolbarIconButton = new ButtonView();
		toolbarIconButton.set( {
			label: 'An icon button',
			icon: checkIcon,
			tooltip: true
		} );
		buttons.push( toolbarButton, toolbarSwitchButton, toolbarIconButton );

		this.editor.ui.componentFactory.add( 'toolbar', () => {
			const dropdown = createDropdown( locale );
			dropdown.buttonView.set( {
				label: 'Open toolbar',
				withText: true
			} );
			addToolbarToDropdown( dropdown, buttons );
			dropdown.toolbarView.element.style.width = '200px';

			return dropdown;
		} );

		this.listenTo( toolbarSwitchButton, 'execute', () => {
			toolbarSwitchButton.isOn ? toolbarSwitchButton.isOn = false : toolbarSwitchButton.isOn = true;
		} );
	}
}

// --- Compact toolbar ------------------------------------------------------------

class CompactToolbarExample extends Plugin {
	init() {
		const buttons = [];

		const toolbarButton = new ButtonView();
		toolbarButton.set( {
			label: 'A button',
			withText: true
		} );
		const toolbarSwitchButton = new SwitchButtonView();
		toolbarSwitchButton.set( {
			label: 'A switch button ',
			withText: true
		} );
		const toolbarIconButton = new ButtonView();
		toolbarIconButton.set( {
			label: 'An icon button',
			icon: checkIcon,
			tooltip: true
		} );
		buttons.push( toolbarButton, toolbarSwitchButton, toolbarIconButton );

		this.editor.ui.componentFactory.add( 'toolbar', () => {
			const dropdown = createDropdown( locale );
			dropdown.buttonView.set( {
				label: 'Open toolbar',
				withText: true
			} );
			addToolbarToDropdown( dropdown, buttons );
			dropdown.toolbarView.isCompact = true;

			return dropdown;
		} );

		this.listenTo( toolbarSwitchButton, 'execute', () => {
			toolbarSwitchButton.isOn ? toolbarSwitchButton.isOn = false : toolbarSwitchButton.isOn = true;
		} );
	}
}// --- Toolbar ------------------------------------------------------------

class OptionsToolbarExample extends Plugin {
	init() {
		const buttons = [];

		const toolbarButton = new ButtonView();
		toolbarButton.set( {
			label: 'A button',
			withText: true
		} );
		const toolbarSwitchButton = new SwitchButtonView();
		toolbarSwitchButton.set( {
			label: 'A switch button ',
			withText: true
		} );
		const toolbarIconButton = new ButtonView();
		toolbarIconButton.set( {
			label: 'An icon button',
			icon: checkIcon,
			tooltip: true
		} );
		const toolbarSeparator = new ToolbarSeparatorView();
		const toolbarLineBreak = new ToolbarLineBreakView();
		buttons.push( toolbarButton, toolbarSeparator, toolbarSwitchButton, toolbarLineBreak, toolbarIconButton );

		this.editor.ui.componentFactory.add( 'toolbar', () => {
			const dropdown = createDropdown( locale );
			dropdown.buttonView.set( {
				label: 'Open toolbar',
				withText: true
			} );
			addToolbarToDropdown( dropdown, buttons );
			dropdown.toolbarView.isCompact = true;

			return dropdown;
		} );

		this.listenTo( toolbarSwitchButton, 'execute', () => {
			toolbarSwitchButton.isOn ? toolbarSwitchButton.isOn = false : toolbarSwitchButton.isOn = true;
		} );
	}
}

// --- Dropdown list ------------------------------------------------------------

class DropdownListExample extends Plugin {
	init() {
		const items = new Collection();

		items.add( {
			type: 'button',
			model: new Model( {
				withText: true,
				label: 'First item',
				labelStyle: 'color: red'
			} )
		} );

		items.add( {
			type: 'button',
			model: new Model( {
				withText: true,
				label: 'Second item',
				labelStyle: 'color: green',
				class: 'foo'
			} )
		} );

		this.editor.ui.componentFactory.add( 'dropdown', () => {
			const dropdown = createDropdown( locale );

			dropdown.buttonView.set( {
				label: 'A dropdown',
				withText: true
			} );
			addListToDropdown( dropdown, items );

			return dropdown;
		} );
	}
}

// --- Dropdown toolbar ------------------------------------------------------------

class DropdownToolbarExample extends Plugin {
	init() {
		const buttons = [];

		const toolbarButton = new ButtonView();
		toolbarButton.set( {
			label: 'A button',
			withText: true
		} );
		const toolbarSwitchButton = new SwitchButtonView();
		toolbarSwitchButton.set( {
			label: 'A switch button ',
			withText: true
		} );
		const toolbarIconButton = new ButtonView();
		toolbarIconButton.set( {
			label: 'An icon button',
			icon: checkIcon,
			tooltip: true
		} );
		buttons.push( toolbarButton, toolbarSwitchButton, toolbarIconButton );

		this.editor.ui.componentFactory.add( 'dropdownToolbar', () => {
			const dropdown = createDropdown( locale );

			dropdown.buttonView.set( {
				label: 'A toolbar dropdown',
				withText: true
			} );
			addToolbarToDropdown( dropdown, buttons );

			return dropdown;
		} );

		const buttonsVertical = [ ];

		const verticalToolbarButton = new ButtonView();
		verticalToolbarButton.set( {
			label: 'A button',
			withText: true
		} );
		const verticalToolbarSwitchButton = new SwitchButtonView();
		verticalToolbarSwitchButton.set( {
			label: 'A switch button ',
			withText: true
		} );
		const verticalToolbarIconButton = new ButtonView();
		verticalToolbarIconButton.set( {
			label: 'An icon button',
			icon: checkIcon,
			tooltip: true
		} );
		buttonsVertical.push( verticalToolbarButton, verticalToolbarSwitchButton, verticalToolbarIconButton );

		this.editor.ui.componentFactory.add( 'dropdownToolbarVertical', () => {
			const verticalDropdown = createDropdown( locale );

			verticalDropdown.buttonView.set( {
				label: 'A vertical toolbar dropdown',
				withText: true
			} );
			addToolbarToDropdown( verticalDropdown, buttonsVertical );
			verticalDropdown.toolbarView.isVertical = true;
			return verticalDropdown;
		} );

		this.listenTo( verticalToolbarSwitchButton, 'execute', () => {
			verticalToolbarSwitchButton.isOn ? verticalToolbarSwitchButton.isOn = false : verticalToolbarSwitchButton.isOn = true;
		} );
		this.listenTo( toolbarSwitchButton, 'execute', () => {
			toolbarSwitchButton.isOn ? toolbarSwitchButton.isOn = false : toolbarSwitchButton.isOn = true;
		} );
	}
}

// --- Contextual Balloon ------------------------------------------------------------

export default class FormView extends View {
	constructor() {
		super();

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

		button.delegate( 'execute' ).to( this, 'cancel' );

		this.childViews = this.createCollection( [
			input, button, labeledInputDisabled, labeledNumberView, labeledInputError, labeledInputInfo
		] );

		this.setTemplate( {
			tag: 'form',
			attributes: {
				class: [ 'ck' ],
				tabindex: '-1',
				style: {
					padding: '15px'
				}
			},
			children: this.childViews
		} );
	}

	render() {
		super.render();
	}
}

class ContextualBalloonExample extends Plugin {
	static get requires() {
		return [ ContextualBalloon ];
	}
	init() {
		const balloon = this.editor.plugins.get( ContextualBalloon );
		const form = new FormView();
		this.editor.ui.componentFactory.add( 'balloonButton', ( ) => {
			const button = new ButtonView();

			button.label = 'Open balloon';
			button.tooltip = true;
			button.withText = true;

			this.listenTo( button, 'execute', () => {
				balloon.add( {
					view: form,
					position: this._getBalloonPositionData()
				} );
			} );

			return button;
		} );

		this.listenTo( form, 'cancel', () => {
			balloon.remove( form );

			this.editor.editing.view.focus();
		} );

		clickOutsideHandler( {
			emitter: form,
			activator: () => balloon.visibleView === form,
			contextElements: [ balloon.view.element ],
			callback: () => balloon.remove( form )

		} );
	}
	_getBalloonPositionData() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;
		let target = null;

		target = () => view.domConverter.viewRangeToDom(
			viewDocument.selection.getFirstRange()
		);

		return {
			target
		};
	}
}

// --- Editors ------------------------------------------------------------

ClassicEditor
	.create( document.querySelector( '#snippet-buttons' ), {
		cloudServices: CS_CONFIG,
		plugins: [ Essentials, Paragraph, ButtonsPlugin ],
		toolbar: [ 'button', 'splitButton', 'switchButton' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );

ClassicEditor
	.create( document.querySelector( '#snippet-button-options' ), {
		cloudServices: CS_CONFIG,
		plugins: [ Essentials, Paragraph, ButtonsOptionsPlugin ],
		toolbar: [ 'actionButton', 'roundedButton', 'boldButton', 'disabledButton', 'onButton' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );

ClassicEditor
	.create( document.querySelector( '#snippet-button-icons' ), {
		cloudServices: CS_CONFIG,
		plugins: [ Essentials, Paragraph, ButtonsIconsKeystrokesPlugin ],
		toolbar: [ 'iconButton', 'keystrokeButton', 'iconKeystrokeButton' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );

ClassicEditor
	.create( document.querySelector( '#snippet-button-tooltip' ), {
		cloudServices: CS_CONFIG,
		plugins: [ Essentials, Paragraph, TooltipPlugin ],
		toolbar: [ 'tooltip1', 'tooltip2', 'tooltip3', 'tooltip4', 'tooltip5', 'tooltip6' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );

ClassicEditor
	.create( document.querySelector( '#snippet-toolbar' ), {
		cloudServices: CS_CONFIG,
		plugins: [ Essentials, Paragraph, ToolbarExample ],
		toolbar: [ 'toolbar' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );

ClassicEditor
	.create( document.querySelector( '#snippet-toolbar-wrapped' ), {
		cloudServices: CS_CONFIG,
		plugins: [ Essentials, Paragraph, WrappedToolbarExample ],
		toolbar: [ 'toolbar' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );

ClassicEditor
	.create( document.querySelector( '#snippet-toolbar-compact' ), {
		cloudServices: CS_CONFIG,
		plugins: [ Essentials, Paragraph, CompactToolbarExample ],
		toolbar: [ 'toolbar' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );

ClassicEditor
	.create( document.querySelector( '#snippet-toolbar-options' ), {
		cloudServices: CS_CONFIG,
		plugins: [ Essentials, Paragraph, OptionsToolbarExample ],
		toolbar: [ 'toolbar' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );

ClassicEditor
	.create( document.querySelector( '#snippet-list-dropdown' ), {
		cloudServices: CS_CONFIG,
		plugins: [ Essentials, Paragraph, DropdownListExample ],
		toolbar: [ 'dropdown' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );

ClassicEditor
	.create( document.querySelector( '#snippet-toolbar-dropdown' ), {
		cloudServices: CS_CONFIG,
		plugins: [ Essentials, Paragraph, DropdownToolbarExample ],
		toolbar: [ 'dropdownToolbar', 'dropdownToolbarVertical' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );

ClassicEditor
	.create( document.querySelector( '#snippet-contextual-balloon' ), {
		cloudServices: CS_CONFIG,
		plugins: [ Essentials, Paragraph, ContextualBalloonExample ],
		toolbar: [ 'balloonButton' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
