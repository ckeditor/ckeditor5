/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/ui/tablepropertiesview
 */

import {
	ButtonView,
	FocusCycler,
	FormHeaderView,
	LabelView,
	LabeledFieldView,
	ToolbarView,
	View,
	ViewCollection,
	addListToDropdown,
	createLabeledDropdown,
	createLabeledInputText,
	submitHandler
} from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils';
import { icons } from 'ckeditor5/src/core';

import {
	fillToolbar,
	getBorderStyleDefinitions,
	getBorderStyleLabels,
	getLabeledColorInputCreator
} from '../../utils/ui/table-properties';
import FormRowView from '../../ui/formrowview';

import '../../../theme/form.css';
import '../../../theme/tableform.css';
import '../../../theme/tableproperties.css';

const ALIGNMENT_ICONS = {
	left: icons.objectLeft,
	center: icons.objectCenter,
	right: icons.objectRight
};

/**
 * The class representing a table properties form, allowing users to customize
 * certain style aspects of a table, for instance, border, background color, alignment, etc..
 *
 * @extends module:ui/view~View
 */
export default class TablePropertiesView extends View {
	/**
	 * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param {Object} options Additional configuration of the view.
	 * @param {module:table/table~TableColorConfig} options.borderColors A configuration of the border
	 * color palette used by the
	 * {@link module:table/tableproperties/ui/tablepropertiesview~TablePropertiesView#borderColorInput}.
	 * @param {module:table/table~TableColorConfig} options.backgroundColors A configuration of the background
	 * color palette used by the
	 * {@link module:table/tableproperties/ui/tablepropertiesview~TablePropertiesView#backgroundInput}.
	 * @param {module:table/tableproperties~TablePropertiesOptions} options.defaultTableProperties The default table properties.
	 */
	constructor( locale, options ) {
		super( locale );

		this.set( {
			/**
			 * The value of the border style.
			 *
			 * @observable
			 * @default ''
			 * @member #borderStyle
			 */
			borderStyle: '',

			/**
			 * The value of the border width style.
			 *
			 * @observable
			 * @default ''
			 * @member #borderWidth
			 */
			borderWidth: '',

			/**
			 * The value of the border color style.
			 *
			 * @observable
			 * @default ''
			 * @member #borderColor
			 */
			borderColor: '',

			/**
			 * The value of the background color style.
			 *
			 * @observable
			 * @default ''
			 * @member #backgroundColor
			 */
			backgroundColor: '',

			/**
			 * The value of the table width style.
			 *
			 * @observable
			 * @default ''
			 * @member #width
			 */
			width: '',

			/**
			 * The value of the table height style.
			 *
			 * @observable
			 * @default ''
			 * @member #height
			 */
			height: '',

			/**
			 * The value of the table alignment style.
			 *
			 * @observable
			 * @default ''
			 * @member #alignment
			 */
			alignment: ''
		} );

		/**
		 * Options passed to the view. See {@link #constructor} to learn more.
		 *
		 * @protected
		 * @member {Object}
		 */
		this.options = options;

		const { borderStyleDropdown, borderWidthInput, borderColorInput, borderRowLabel } = this._createBorderFields();
		const { backgroundRowLabel, backgroundInput } = this._createBackgroundFields();
		const { widthInput, operatorLabel, heightInput, dimensionsLabel } = this._createDimensionFields();
		const { alignmentToolbar, alignmentLabel } = this._createAlignmentFields();

		/**
		 * Tracks information about the DOM focus in the form.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * A collection of child views in the form.
		 *
		 * @readonly
		 * @type {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();

		/**
		 * A dropdown that allows selecting the style of the table border.
		 *
		 * @readonly
		 * @member {module:ui/dropdown/dropdownview~DropdownView}
		 */
		this.borderStyleDropdown = borderStyleDropdown;

		/**
		 * An input that allows specifying the width of the table border.
		 *
		 * @readonly
		 * @member {module:ui/inputtext/inputtextview~InputTextView}
		 */
		this.borderWidthInput = borderWidthInput;

		/**
		 * An input that allows specifying the color of the table border.
		 *
		 * @readonly
		 * @member {module:table/ui/colorinputview~ColorInputView}
		 */
		this.borderColorInput = borderColorInput;

		/**
		 * An input that allows specifying the table background color.
		 *
		 * @readonly
		 * @member {module:table/ui/colorinputview~ColorInputView}
		 */
		this.backgroundInput = backgroundInput;

		/**
		 * An input that allows specifying the table width.
		 *
		 * @readonly
		 * @member {module:ui/inputtext/inputtextview~InputTextView}
		 */
		this.widthInput = widthInput;

		/**
		 * An input that allows specifying the table height.
		 *
		 * @readonly
		 * @member {module:ui/inputtext/inputtextview~InputTextView}
		 */
		this.heightInput = heightInput;

		/**
		 * A toolbar with buttons that allow changing the alignment of an entire table.
		 * @readonly
		 * @member {module:ui/toolbar/toolbar~ToolbarView}
		 */
		this.alignmentToolbar = alignmentToolbar;

		// Defer creating to make sure other fields are present and the Save button can
		// bind its #isEnabled to their error messages so there's no way to save unless all
		// fields are valid.
		const { saveButtonView, cancelButtonView } = this._createActionButtons();

		/**
		 * The "Save" button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.saveButtonView = saveButtonView;

		/**
		 * The "Cancel" button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.cancelButtonView = cancelButtonView;

		/**
		 * A collection of views that can be focused in the form.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this._focusables = new ViewCollection();

		/**
		 * Helps cycling over {@link #_focusables} in the form.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
				focusNext: 'tab'
			}
		} );

		// Form header.
		this.children.add( new FormHeaderView( locale, {
			label: this.t( 'Table properties' )
		} ) );

		// Border row.
		this.children.add( new FormRowView( locale, {
			labelView: borderRowLabel,
			children: [
				borderRowLabel,
				borderStyleDropdown,
				borderColorInput,
				borderWidthInput
			],
			class: 'ck-table-form__border-row'
		} ) );

		// Background row.
		this.children.add( new FormRowView( locale, {
			labelView: backgroundRowLabel,
			children: [
				backgroundRowLabel,
				backgroundInput
			],
			class: 'ck-table-form__background-row'
		} ) );

		this.children.add( new FormRowView( locale, {
			children: [
				// Dimensions row.
				new FormRowView( locale, {
					labelView: dimensionsLabel,
					children: [
						dimensionsLabel,
						widthInput,
						operatorLabel,
						heightInput
					],
					class: 'ck-table-form__dimensions-row'
				} ),
				// Alignment row.
				new FormRowView( locale, {
					labelView: alignmentLabel,
					children: [
						alignmentLabel,
						alignmentToolbar
					],
					class: 'ck-table-properties-form__alignment-row'
				} )
			]
		} ) );

		// Action row.
		this.children.add( new FormRowView( locale, {
			children: [
				this.saveButtonView,
				this.cancelButtonView
			],
			class: 'ck-table-form__action-row'
		} ) );

		this.setTemplate( {
			tag: 'form',
			attributes: {
				class: [
					'ck',
					'ck-form',
					'ck-table-form',
					'ck-table-properties-form'
				],
				// https://github.com/ckeditor/ckeditor5-link/issues/90
				tabindex: '-1'
			},
			children: this.children
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		// Enable the "submit" event for this view. It can be triggered by the #saveButtonView
		// which is of the "submit" DOM "type".
		submitHandler( {
			view: this
		} );

		[
			this.borderStyleDropdown,
			this.borderColorInput,
			this.borderWidthInput,
			this.backgroundInput,
			this.widthInput,
			this.heightInput,
			this.alignmentToolbar,
			this.saveButtonView,
			this.cancelButtonView
		].forEach( view => {
			// Register the view as focusable.
			this._focusables.add( view );

			// Register the view in the focus tracker.
			this.focusTracker.add( view.element );
		} );

		// Mainly for closing using "Esc" and navigation using "Tab".
		this.keystrokes.listenTo( this.element );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Focuses the fist focusable field in the form.
	 */
	focus() {
		this._focusCycler.focusFirst();
	}

	/**
	 * Creates the following form fields:
	 *
	 * * {@link #borderStyleDropdown},
	 * * {@link #borderWidthInput},
	 * * {@link #borderColorInput}.
	 *
	 * @private
	 * @returns {Object.<String,module:ui/view~View>}
	 */
	_createBorderFields() {
		const defaultTableProperties = this.options.defaultTableProperties;
		const defaultBorder = {
			style: defaultTableProperties.borderStyle,
			width: defaultTableProperties.borderWidth,
			color: defaultTableProperties.borderColor
		};

		const colorInputCreator = getLabeledColorInputCreator( {
			colorConfig: this.options.borderColors,
			columns: 5,
			defaultColorValue: defaultBorder.color
		} );
		const locale = this.locale;
		const t = this.t;

		// -- Group label ---------------------------------------------

		const borderRowLabel = new LabelView( locale );
		borderRowLabel.text = t( 'Border' );

		// -- Style ---------------------------------------------------

		const styleLabels = getBorderStyleLabels( this.t );
		const borderStyleDropdown = new LabeledFieldView( locale, createLabeledDropdown );
		borderStyleDropdown.set( {
			label: t( 'Style' ),
			class: 'ck-table-form__border-style'
		} );

		borderStyleDropdown.fieldView.buttonView.set( {
			isOn: false,
			withText: true,
			tooltip: t( 'Style' )
		} );

		borderStyleDropdown.fieldView.buttonView.bind( 'label' ).to( this, 'borderStyle', value => {
			return styleLabels[ value ? value : 'none' ];
		} );

		borderStyleDropdown.fieldView.on( 'execute', evt => {
			this.borderStyle = evt.source._borderStyleValue;
		} );

		borderStyleDropdown.bind( 'isEmpty' ).to( this, 'borderStyle', value => !value );

		addListToDropdown( borderStyleDropdown.fieldView, getBorderStyleDefinitions( this, defaultBorder.style ) );

		// -- Width ---------------------------------------------------

		const borderWidthInput = new LabeledFieldView( locale, createLabeledInputText );

		borderWidthInput.set( {
			label: t( 'Width' ),
			class: 'ck-table-form__border-width'
		} );

		borderWidthInput.fieldView.bind( 'value' ).to( this, 'borderWidth' );
		borderWidthInput.bind( 'isEnabled' ).to( this, 'borderStyle', isBorderStyleSet );
		borderWidthInput.fieldView.on( 'input', () => {
			this.borderWidth = borderWidthInput.fieldView.element.value;
		} );

		// -- Color ---------------------------------------------------

		const borderColorInput = new LabeledFieldView( locale, colorInputCreator );

		borderColorInput.set( {
			label: t( 'Color' ),
			class: 'ck-table-form__border-color'
		} );

		borderColorInput.fieldView.bind( 'value' ).to( this, 'borderColor' );
		borderColorInput.bind( 'isEnabled' ).to( this, 'borderStyle', isBorderStyleSet );

		borderColorInput.fieldView.on( 'input', () => {
			this.borderColor = borderColorInput.fieldView.value;
		} );

		// Reset the border color and width fields depending on the `border-style` value.
		this.on( 'change:borderStyle', ( evt, name, newValue, oldValue ) => {
			// When removing the border (`border-style:none`), clear the remaining `border-*` properties.
			// See: https://github.com/ckeditor/ckeditor5/issues/6227.
			if ( !isBorderStyleSet( newValue ) ) {
				this.borderColor = '';
				this.borderWidth = '';
			}

			// When setting the `border-style` from `none`, set the default `border-color` and `border-width` properties.
			if ( !isBorderStyleSet( oldValue ) ) {
				this.borderColor = defaultBorder.color;
				this.borderWidth = defaultBorder.width;
			}
		} );

		return {
			borderRowLabel,
			borderStyleDropdown,
			borderColorInput,
			borderWidthInput
		};
	}

	/**
	 * Creates the following form fields:
	 *
	 * * {@link #backgroundInput}.
	 *
	 * @private
	 * @returns {Object.<String,module:ui/view~View>}
	 */
	_createBackgroundFields() {
		const locale = this.locale;
		const t = this.t;

		// -- Group label ---------------------------------------------

		const backgroundRowLabel = new LabelView( locale );
		backgroundRowLabel.text = t( 'Background' );

		// -- Background color input -----------------------------------

		const backgroundInputCreator = getLabeledColorInputCreator( {
			colorConfig: this.options.backgroundColors,
			columns: 5,
			defaultColorValue: this.options.defaultTableProperties.backgroundColor
		} );

		const backgroundInput = new LabeledFieldView( locale, backgroundInputCreator );

		backgroundInput.set( {
			label: t( 'Color' ),
			class: 'ck-table-properties-form__background'
		} );

		backgroundInput.fieldView.bind( 'value' ).to( this, 'backgroundColor' );
		backgroundInput.fieldView.on( 'input', () => {
			this.backgroundColor = backgroundInput.fieldView.value;
		} );

		return {
			backgroundRowLabel,
			backgroundInput
		};
	}

	/**
	 * Creates the following form fields:
	 *
	 * * {@link #widthInput}.
	 * * {@link #heightInput}.
	 *
	 * @private
	 * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
	 */
	_createDimensionFields() {
		const locale = this.locale;
		const t = this.t;

		// -- Label ---------------------------------------------------

		const dimensionsLabel = new LabelView( locale );
		dimensionsLabel.text = t( 'Dimensions' );

		// -- Width ---------------------------------------------------

		const widthInput = new LabeledFieldView( locale, createLabeledInputText );

		widthInput.set( {
			label: t( 'Width' ),
			class: 'ck-table-form__dimensions-row__width'
		} );

		widthInput.fieldView.bind( 'value' ).to( this, 'width' );
		widthInput.fieldView.on( 'input', () => {
			this.width = widthInput.fieldView.element.value;
		} );

		// -- Operator ---------------------------------------------------

		const operatorLabel = new View( locale );
		operatorLabel.setTemplate( {
			tag: 'span',
			attributes: {
				class: [
					'ck-table-form__dimension-operator'
				]
			},
			children: [
				{ text: '×' }
			]
		} );

		// -- Height ---------------------------------------------------

		const heightInput = new LabeledFieldView( locale, createLabeledInputText );

		heightInput.set( {
			label: t( 'Height' ),
			class: 'ck-table-form__dimensions-row__height'
		} );

		heightInput.fieldView.bind( 'value' ).to( this, 'height' );
		heightInput.fieldView.on( 'input', () => {
			this.height = heightInput.fieldView.element.value;
		} );

		return {
			dimensionsLabel,
			widthInput,
			operatorLabel,
			heightInput
		};
	}

	/**
	 * Creates the following form fields:
	 *
	 * * {@link #alignmentToolbar},
	 *
	 * @private
	 * @returns {Object.<String,module:ui/view~View>}
	 */
	_createAlignmentFields() {
		const locale = this.locale;
		const t = this.t;

		// -- Label ---------------------------------------------------

		const alignmentLabel = new LabelView( locale );
		alignmentLabel.text = t( 'Alignment' );

		// -- Toolbar ---------------------------------------------------

		const alignmentToolbar = new ToolbarView( locale );
		alignmentToolbar.set( {
			isCompact: true,
			ariaLabel: t( 'Table alignment toolbar' )
		} );

		fillToolbar( {
			view: this,
			icons: ALIGNMENT_ICONS,
			toolbar: alignmentToolbar,
			labels: this._alignmentLabels,
			propertyName: 'alignment',
			defaultValue: this.options.defaultTableProperties.alignment
		} );

		return {
			alignmentLabel,
			alignmentToolbar
		};
	}

	/**
	 * Creates the following form controls:
	 *
	 * * {@link #saveButtonView},
	 * * {@link #cancelButtonView}.
	 *
	 * @private
	 * @returns {Object.<String,module:ui/view~View>}
	 */
	_createActionButtons() {
		const locale = this.locale;
		const t = this.t;

		const saveButtonView = new ButtonView( locale );
		const cancelButtonView = new ButtonView( locale );
		const fieldsThatShouldValidateToSave = [
			this.borderWidthInput,
			this.borderColorInput,
			this.backgroundInput,
			this.widthInput,
			this.heightInput
		];

		saveButtonView.set( {
			label: t( 'Save' ),
			icon: icons.check,
			class: 'ck-button-save',
			type: 'submit',
			withText: true
		} );

		saveButtonView.bind( 'isEnabled' ).toMany( fieldsThatShouldValidateToSave, 'errorText', ( ...errorTexts ) => {
			return errorTexts.every( errorText => !errorText );
		} );

		cancelButtonView.set( {
			label: t( 'Cancel' ),
			icon: icons.cancel,
			class: 'ck-button-cancel',
			withText: true
		} );

		cancelButtonView.delegate( 'execute' ).to( this, 'cancel' );

		return {
			saveButtonView, cancelButtonView
		};
	}

	/**
	 * Provides localized labels for {@link #alignmentToolbar} buttons.
	 *
	 * @private
	 * @type {Object.<String,String>}
	 */
	get _alignmentLabels() {
		const locale = this.locale;
		const t = this.t;

		const left = t( 'Align table to the left' );
		const center = t( 'Center table' );
		const right = t( 'Align table to the right' );

		// Returns object with a proper order of labels.
		if ( locale.uiLanguageDirection === 'rtl' ) {
			return { right, center, left };
		} else {
			return { left, center, right };
		}
	}
}

function isBorderStyleSet( value ) {
	return value !== 'none';
}
