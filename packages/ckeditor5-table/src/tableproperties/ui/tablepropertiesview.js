/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/ui/tablepropertiesview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';
import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';

import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';

import LabeledFieldView from '@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview';
import { createLabeledDropdown, createLabeledInputText } from '@ckeditor/ckeditor5-ui/src/labeledfield/utils';
import LabelView from '@ckeditor/ckeditor5-ui/src/label/labelview';
import { addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import {
	fillToolbar,
	getBorderStyleDefinitions,
	getBorderStyleLabels,
	getLabeledColorInputCreator
} from '../../ui/utils';
import FormRowView from '../../ui/formrowview';

import FormHeaderView from '@ckeditor/ckeditor5-ui/src/formheader/formheaderview';

import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';
import objectLeftIcon from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import objectRightIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';
import objectCenterIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';

import '../../../theme/form.css';
import '../../../theme/tableform.css';
import '../../../theme/tableproperties.css';

const ALIGNMENT_ICONS = {
	left: objectLeftIcon,
	center: objectCenterIcon,
	right: objectRightIcon
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
		this.backgroundInput = this._createBackgroundField();

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
		 *
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
			children: [
				this.backgroundInput
			]
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
		const colorInputCreator = getLabeledColorInputCreator( {
			colorConfig: this.options.borderColors,
			columns: 5
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

		addListToDropdown( borderStyleDropdown.fieldView, getBorderStyleDefinitions( this ) );

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

		// Reset the border color and width fields when style is "none".
		// https://github.com/ckeditor/ckeditor5/issues/6227
		this.on( 'change:borderStyle', ( evt, name, value ) => {
			if ( !isBorderStyleSet( value ) ) {
				this.borderColor = '';
				this.borderWidth = '';
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
	 * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
	 */
	_createBackgroundField() {
		const backgroundInputCreator = getLabeledColorInputCreator( {
			colorConfig: this.options.backgroundColors,
			columns: 5
		} );
		const locale = this.locale;
		const t = this.t;

		const backgroundInput = new LabeledFieldView( locale, backgroundInputCreator );

		backgroundInput.set( {
			label: t( 'Background' ),
			class: 'ck-table-properties-form__background'
		} );

		backgroundInput.fieldView.bind( 'value' ).to( this, 'backgroundColor' );
		backgroundInput.fieldView.on( 'input', () => {
			this.backgroundColor = backgroundInput.fieldView.value;
		} );

		return backgroundInput;
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
			nameToValue: name => {
				return name === 'center' ? '' : name;
			}
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
			icon: checkIcon,
			class: 'ck-button-save',
			type: 'submit',
			withText: true
		} );

		saveButtonView.bind( 'isEnabled' ).toMany( fieldsThatShouldValidateToSave, 'errorText', ( ...errorTexts ) => {
			return errorTexts.every( errorText => !errorText );
		} );

		cancelButtonView.set( {
			label: t( 'Cancel' ),
			icon: cancelIcon,
			class: 'ck-button-cancel',
			type: 'cancel',
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
	return !!value;
}
