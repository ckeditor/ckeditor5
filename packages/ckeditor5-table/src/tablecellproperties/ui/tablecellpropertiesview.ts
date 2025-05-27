/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellproperties/ui/tablecellpropertiesview
 */

import {
	addListToDropdown,
	ButtonView,
	createLabeledDropdown,
	createLabeledInputText,
	FocusCycler,
	FormRowView,
	FormHeaderView,
	LabeledFieldView,
	LabelView,
	submitHandler,
	ToolbarView,
	View,
	ViewCollection,
	type FocusableView,
	type NormalizedColorOption,
	type ColorPickerConfig
} from 'ckeditor5/src/ui.js';
import {
	KeystrokeHandler,
	FocusTracker,
	type Locale,
	type ObservableChangeEvent
} from 'ckeditor5/src/utils.js';
import {
	IconAlignBottom,
	IconAlignCenter,
	IconAlignJustify,
	IconAlignLeft,
	IconAlignMiddle,
	IconAlignRight,
	IconAlignTop,
	IconCancel,
	IconCheck
} from 'ckeditor5/src/icons.js';

import {
	fillToolbar,
	getBorderStyleDefinitions,
	getBorderStyleLabels,
	getLabeledColorInputCreator
} from '../../utils/ui/table-properties.js';
import type ColorInputView from '../../ui/colorinputview.js';
import type { TableCellPropertiesOptions } from '../../tableconfig.js';

// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/form/form.css';
import '../../../theme/formrow.css';
import '../../../theme/tableform.css';
import '../../../theme/tablecellproperties.css';

export interface TableCellPropertiesViewOptions {
	borderColors: Array<NormalizedColorOption>;
	backgroundColors: Array<NormalizedColorOption>;
	defaultTableCellProperties: TableCellPropertiesOptions;
	colorPickerConfig: false | ColorPickerConfig;
}

/**
 * The class representing a table cell properties form, allowing users to customize
 * certain style aspects of a table cell, for instance, border, padding, text alignment, etc..
 */
export default class TableCellPropertiesView extends View {
	/**
	 * The value of the cell border style.
	 *
	 * @observable
	 * @default ''
	 */
	public declare borderStyle: string;

	/**
	 * The value of the cell border width style.
	 *
	 * @observable
	 * @default ''
	 */
	public declare borderWidth: string;

	/**
	 * The value of the cell border color style.
	 *
	 * @observable
	 * @default ''
	 */
	public declare borderColor: string;

	/**
	 * The value of the cell padding style.
	 *
	 * @observable
	 * @default ''
	 */
	public declare padding: string;

	/**
	 * The value of the cell background color style.
	 *
	 * @observable
	 * @default ''
	 */
	public declare backgroundColor: string;

	/**
	 * The value of the table cell width style.
	 *
	 * @observable
	 * @default ''
	 */
	public declare width: string;

	/**
	 * The value of the table cell height style.
	 *
	 * @observable
	 * @default ''
	 */
	public declare height: string;

	/**
	 * The value of the horizontal text alignment style.
	 *
	 * @observable
	 * @default ''
	 */
	public declare horizontalAlignment: string;

	/**
	 * The value of the vertical text alignment style.
	 *
	 * @observable
	 * @default ''
	 */
	public declare verticalAlignment: string;

	/**
	 * Options passed to the view. See {@link #constructor} to learn more.
	 */
	public readonly options: TableCellPropertiesViewOptions;

	/**
	 * Tracks information about the DOM focus in the form.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * A collection of child views in the form.
	 */
	public readonly children: ViewCollection;

	/**
	 * A dropdown that allows selecting the style of the table cell border.
	 */
	public readonly borderStyleDropdown: LabeledFieldView<FocusableView>;

	/**
	 * An input that allows specifying the width of the table cell border.
	 */
	public readonly borderWidthInput: LabeledFieldView<FocusableView>;

	/**
	 * An input that allows specifying the color of the table cell border.
	 */
	public readonly borderColorInput: LabeledFieldView<ColorInputView>;

	/**
	 * An input that allows specifying the table cell background color.
	 */
	public readonly backgroundInput: LabeledFieldView<ColorInputView>;

	/**
	 * An input that allows specifying the table cell padding.
	 */
	public readonly paddingInput: LabeledFieldView;

	/**
	 * An input that allows specifying the table cell width.
	 */
	public readonly widthInput: LabeledFieldView<FocusableView>;

	/**
	 * An input that allows specifying the table cell height.
	 */
	public readonly heightInput: LabeledFieldView<FocusableView>;

	/**
	 * A toolbar with buttons that allow changing the horizontal text alignment in a table cell.
	 */
	public readonly horizontalAlignmentToolbar: ToolbarView;

	/**
	 * A toolbar with buttons that allow changing the vertical text alignment in a table cell.
	 */
	public readonly verticalAlignmentToolbar: ToolbarView;

	/**
	 * The "Save" button view.
	 */
	public saveButtonView: ButtonView;

	/**
	 * The "Cancel" button view.
	 */
	public cancelButtonView: ButtonView;

	/**
	 * A collection of views that can be focused in the form.
	 */
	protected readonly _focusables: ViewCollection<FocusableView>;

	/**
	 * Helps cycling over {@link #_focusables} in the form.
	 */
	protected readonly _focusCycler: FocusCycler;

	/**
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param options Additional configuration of the view.
	 * @param options.borderColors A configuration of the border color palette used by the
	 * {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView#borderColorInput}.
	 * @param options.backgroundColors A configuration of the background color palette used by the
	 * {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView#backgroundInput}.
	 * @param options.defaultTableCellProperties The default table cell properties.
	 */
	constructor( locale: Locale, options: TableCellPropertiesViewOptions ) {
		super( locale );

		this.set( {
			borderStyle: '',
			borderWidth: '',
			borderColor: '',
			padding: '',
			backgroundColor: '',
			width: '',
			height: '',
			horizontalAlignment: '',
			verticalAlignment: ''
		} );

		this.options = options;

		const { borderStyleDropdown, borderWidthInput, borderColorInput, borderRowLabel } = this._createBorderFields();
		const { backgroundRowLabel, backgroundInput } = this._createBackgroundFields();
		const { widthInput, operatorLabel, heightInput, dimensionsLabel } = this._createDimensionFields();
		const { horizontalAlignmentToolbar, verticalAlignmentToolbar, alignmentLabel } = this._createAlignmentFields();

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this.children = this.createCollection();
		this.borderStyleDropdown = borderStyleDropdown;
		this.borderWidthInput = borderWidthInput;
		this.borderColorInput = borderColorInput;
		this.backgroundInput = backgroundInput;
		this.paddingInput = this._createPaddingField();
		this.widthInput = widthInput;
		this.heightInput = heightInput;
		this.horizontalAlignmentToolbar = horizontalAlignmentToolbar;
		this.verticalAlignmentToolbar = verticalAlignmentToolbar;

		// Defer creating to make sure other fields are present and the Save button can
		// bind its #isEnabled to their error messages so there's no way to save unless all
		// fields are valid.
		const { saveButtonView, cancelButtonView } = this._createActionButtons();

		this.saveButtonView = saveButtonView;
		this.cancelButtonView = cancelButtonView;
		this._focusables = new ViewCollection();

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
			label: this.t!( 'Cell properties' )
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

		// Background.
		this.children.add( new FormRowView( locale, {
			labelView: backgroundRowLabel,
			children: [
				backgroundRowLabel,
				backgroundInput
			],
			class: 'ck-table-form__background-row'
		} ) );

		// Dimensions row and padding.
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
				// Padding row.
				new FormRowView( locale, {
					children: [
						this.paddingInput
					],
					class: 'ck-table-cell-properties-form__padding-row'
				} )
			]
		} ) );

		// Text alignment row.
		this.children.add( new FormRowView( locale, {
			labelView: alignmentLabel,
			children: [
				alignmentLabel,
				horizontalAlignmentToolbar,
				verticalAlignmentToolbar
			],
			class: 'ck-table-cell-properties-form__alignment-row'
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
					'ck-table-cell-properties-form'
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
	public override render(): void {
		super.render();

		// Enable the "submit" event for this view. It can be triggered by the #saveButtonView
		// which is of the "submit" DOM "type".
		submitHandler( {
			view: this
		} );

		// Maintain continuous focus cycling over views that have focusable children and focus cyclers themselves.
		[ this.borderColorInput, this.backgroundInput ].forEach( view => {
			this._focusCycler.chain( view.fieldView.focusCycler );
		} );

		[
			this.borderStyleDropdown,
			this.borderColorInput,
			this.borderWidthInput,
			this.backgroundInput,
			this.widthInput,
			this.heightInput,
			this.paddingInput,
			this.horizontalAlignmentToolbar,
			this.verticalAlignmentToolbar,
			this.saveButtonView,
			this.cancelButtonView
		].forEach( view => {
			// Register the view as focusable.
			this._focusables.add( view );

			// Register the view in the focus tracker.
			this.focusTracker.add( view.element! );
		} );

		// Mainly for closing using "Esc" and navigation using "Tab".
		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Focuses the fist focusable field in the form.
	 */
	public focus(): void {
		this._focusCycler.focusFirst();
	}

	/**
	 * Creates the following form fields:
	 *
	 * * {@link #borderStyleDropdown},
	 * * {@link #borderWidthInput},
	 * * {@link #borderColorInput}.
	 */
	private _createBorderFields(): {
		borderRowLabel: LabelView;
		borderStyleDropdown: LabeledFieldView;
		borderColorInput: LabeledFieldView<ColorInputView>;
		borderWidthInput: LabeledFieldView;
	} {
		const defaultTableCellProperties = this.options.defaultTableCellProperties;
		const defaultBorder = {
			style: defaultTableCellProperties.borderStyle,
			width: defaultTableCellProperties.borderWidth,
			color: defaultTableCellProperties.borderColor
		};

		const colorInputCreator = getLabeledColorInputCreator( {
			colorConfig: this.options.borderColors,
			columns: 5,
			defaultColorValue: defaultBorder.color,
			colorPickerConfig: this.options.colorPickerConfig
		} );
		const locale = this.locale;
		const t = this.t!;
		const accessibleLabel = t( 'Style' );

		// -- Group label ---------------------------------------------

		const borderRowLabel = new LabelView( locale );
		borderRowLabel.text = t( 'Border' );

		// -- Style ---------------------------------------------------

		const styleLabels = getBorderStyleLabels( t );
		const borderStyleDropdown = new LabeledFieldView( locale, createLabeledDropdown );
		borderStyleDropdown.set( {
			label: accessibleLabel,
			class: 'ck-table-form__border-style'
		} );

		borderStyleDropdown.fieldView.buttonView.set( {
			ariaLabel: accessibleLabel,
			ariaLabelledBy: undefined,
			isOn: false,
			withText: true,
			tooltip: accessibleLabel
		} );

		borderStyleDropdown.fieldView.buttonView.bind( 'label' ).to( this, 'borderStyle', value => {
			return styleLabels[ value ? value : 'none' ];
		} );

		borderStyleDropdown.fieldView.on( 'execute', evt => {
			this.borderStyle = ( evt.source as Record<string, unknown> )._borderStyleValue as string;
		} );

		borderStyleDropdown.bind( 'isEmpty' ).to( this, 'borderStyle', value => !value );

		addListToDropdown( borderStyleDropdown.fieldView, getBorderStyleDefinitions( this, defaultBorder.style! ), {
			role: 'menu',
			ariaLabel: accessibleLabel
		} );

		// -- Width ---------------------------------------------------

		const borderWidthInput = new LabeledFieldView( locale, createLabeledInputText );

		borderWidthInput.set( {
			label: t( 'Width' ),
			class: 'ck-table-form__border-width'
		} );

		borderWidthInput.fieldView.bind( 'value' ).to( this, 'borderWidth' );
		borderWidthInput.bind( 'isEnabled' ).to( this, 'borderStyle', isBorderStyleSet );
		borderWidthInput.fieldView.on( 'input', () => {
			this.borderWidth = borderWidthInput.fieldView.element!.value;
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
		this.on<ObservableChangeEvent<string>>( 'change:borderStyle', ( evt, name, newValue, oldValue ) => {
			// When removing the border (`border-style:none`), clear the remaining `border-*` properties.
			// See: https://github.com/ckeditor/ckeditor5/issues/6227.
			if ( !isBorderStyleSet( newValue ) ) {
				this.borderColor = '';
				this.borderWidth = '';
			}

			// When setting the `border-style` from `none`, set the default `border-color` and `border-width` properties.
			if ( !isBorderStyleSet( oldValue ) ) {
				this.borderColor = defaultBorder.color!;
				this.borderWidth = defaultBorder.width!;
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
	 */
	private _createBackgroundFields() {
		const locale = this.locale;
		const t = this.t!;

		// -- Group label ---------------------------------------------

		const backgroundRowLabel = new LabelView( locale );
		backgroundRowLabel.text = t( 'Background' );

		// -- Background color input -----------------------------------

		const colorInputCreator = getLabeledColorInputCreator( {
			colorConfig: this.options.backgroundColors,
			columns: 5,
			defaultColorValue: this.options.defaultTableCellProperties.backgroundColor,
			colorPickerConfig: this.options.colorPickerConfig
		} );

		const backgroundInput = new LabeledFieldView( locale, colorInputCreator );

		backgroundInput.set( {
			label: t( 'Color' ),
			class: 'ck-table-cell-properties-form__background'
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
	 */
	private _createDimensionFields(): {
		dimensionsLabel: LabelView;
		widthInput: LabeledFieldView;
		operatorLabel: View;
		heightInput: LabeledFieldView;
	} {
		const locale = this.locale;
		const t = this.t!;

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
			this.width = widthInput.fieldView.element!.value;
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
			this.height = heightInput.fieldView.element!.value;
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
	 * * {@link #paddingInput}.
	 */
	private _createPaddingField(): LabeledFieldView {
		const locale = this.locale;
		const t = this.t!;

		const paddingInput = new LabeledFieldView( locale, createLabeledInputText );

		paddingInput.set( {
			label: t( 'Padding' ),
			class: 'ck-table-cell-properties-form__padding'
		} );

		paddingInput.fieldView.bind( 'value' ).to( this, 'padding' );
		paddingInput.fieldView.on( 'input', () => {
			this.padding = paddingInput.fieldView.element!.value;
		} );

		return paddingInput;
	}

	/**
	 * Creates the following form fields:
	 *
	 * * {@link #horizontalAlignmentToolbar},
	 * * {@link #verticalAlignmentToolbar}.
	 */
	private _createAlignmentFields() {
		const locale = this.locale!;
		const t = this.t!;

		const alignmentLabel = new LabelView( locale );

		const ALIGNMENT_ICONS = {
			left: IconAlignLeft,
			center: IconAlignCenter,
			right: IconAlignRight,
			justify: IconAlignJustify,
			top: IconAlignTop,
			middle: IconAlignMiddle,
			bottom: IconAlignBottom
		};

		alignmentLabel.text = t( 'Table cell text alignment' );

		// -- Horizontal ---------------------------------------------------

		const horizontalAlignmentToolbar = new ToolbarView( locale );
		const isContentRTL = locale.contentLanguageDirection === 'rtl';

		horizontalAlignmentToolbar.set( {
			isCompact: true,
			role: 'radiogroup',
			ariaLabel: t( 'Horizontal text alignment toolbar' )
		} );

		fillToolbar( {
			view: this,
			icons: ALIGNMENT_ICONS,
			toolbar: horizontalAlignmentToolbar,
			labels: this._horizontalAlignmentLabels,
			propertyName: 'horizontalAlignment',
			nameToValue: name => {
				// For the RTL content, we want to swap the buttons "align to the left" and "align to the right".
				if ( isContentRTL ) {
					if ( name === 'left' ) {
						return 'right';
					} else if ( name === 'right' ) {
						return 'left';
					}
				}

				return name;
			},
			defaultValue: this.options.defaultTableCellProperties.horizontalAlignment
		} );

		// -- Vertical -----------------------------------------------------

		const verticalAlignmentToolbar = new ToolbarView( locale );

		verticalAlignmentToolbar.set( {
			isCompact: true,
			role: 'radiogroup',
			ariaLabel: t( 'Vertical text alignment toolbar' )
		} );

		fillToolbar( {
			view: this,
			icons: ALIGNMENT_ICONS,
			toolbar: verticalAlignmentToolbar,
			labels: this._verticalAlignmentLabels,
			propertyName: 'verticalAlignment',
			defaultValue: this.options.defaultTableCellProperties.verticalAlignment
		} );

		return {
			horizontalAlignmentToolbar,
			verticalAlignmentToolbar,
			alignmentLabel
		};
	}

	/**
	 * Creates the following form controls:
	 *
	 * * {@link #saveButtonView},
	 * * {@link #cancelButtonView}.
	 */
	private _createActionButtons() {
		const locale = this.locale;
		const t = this.t!;
		const saveButtonView = new ButtonView( locale );
		const cancelButtonView = new ButtonView( locale );
		const fieldsThatShouldValidateToSave = [
			this.borderWidthInput,
			this.borderColorInput,
			this.backgroundInput,
			this.paddingInput
		];

		saveButtonView.set( {
			label: t( 'Save' ),
			icon: IconCheck,
			class: 'ck-button-save',
			type: 'submit',
			withText: true
		} );

		saveButtonView.bind( 'isEnabled' ).toMany( fieldsThatShouldValidateToSave, 'errorText', ( ...errorTexts ) => {
			return errorTexts.every( errorText => !errorText );
		} );

		cancelButtonView.set( {
			label: t( 'Cancel' ),
			icon: IconCancel,
			class: 'ck-button-cancel',
			withText: true
		} );

		cancelButtonView.delegate( 'execute' ).to( this, 'cancel' );

		return {
			saveButtonView, cancelButtonView
		};
	}

	/**
	 * Provides localized labels for {@link #horizontalAlignmentToolbar} buttons.
	 */
	private get _horizontalAlignmentLabels(): Record<string, string> {
		const locale = this.locale!;
		const t = this.t!;

		const left = t( 'Align cell text to the left' );
		const center = t( 'Align cell text to the center' );
		const right = t( 'Align cell text to the right' );
		const justify = t( 'Justify cell text' );

		// Returns object with a proper order of labels.
		if ( locale.uiLanguageDirection === 'rtl' ) {
			return { right, center, left, justify };
		} else {
			return { left, center, right, justify };
		}
	}

	/**
	 * Provides localized labels for {@link #verticalAlignmentToolbar} buttons.
	 */
	private get _verticalAlignmentLabels(): Record<string, string> {
		const t = this.t!;

		return {
			top: t( 'Align cell text to the top' ),
			middle: t( 'Align cell text to the middle' ),
			bottom: t( 'Align cell text to the bottom' )
		};
	}
}

function isBorderStyleSet( value: string ) {
	return value !== 'none';
}
