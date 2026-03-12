/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellproperties/ui/tablecellpropertiesviewexperimental
 */

/* istanbul ignore file -- @preserve */

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
	UIModel,
	View,
	ViewCollection,
	type FocusableView,
	type ListDropdownItemDefinition,
	type NormalizedColorOption,
	type ColorPickerConfig
} from 'ckeditor5/src/ui.js';
import {
	Collection,
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
	IconPreviousArrow
} from 'ckeditor5/src/icons.js';

import {
	fillToolbar,
	getBorderStyleDefinitions,
	getBorderStyleLabels,
	getLabeledColorInputCreator
} from '../../utils/ui/table-propertiesexperimental.js';
import { type ColorInputView } from '../../ui/colorinputview.js';
import type { TableCellPropertiesOptions } from '../../tableconfig.js';

// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/form/form.css';
import '../../../theme/formrow-experimental.css';
import '../../../theme/tableform-experimental.css';
import '../../../theme/tablecellproperties-experimental.css';

export interface TableCellPropertiesViewOptionsExperimental {
	borderColors: Array<NormalizedColorOption>;
	backgroundColors: Array<NormalizedColorOption>;
	defaultTableCellProperties: TableCellPropertiesOptions;
	colorPickerConfig: false | ColorPickerConfig;
	isTableCellTypeSupported: boolean;
}

/**
 * The class representing a table cell properties form, allowing users to customize
 * certain style aspects of a table cell, for instance, border, padding, text alignment, etc..
 */
export class TableCellPropertiesViewExperimental extends View {
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
	 * The type of the table cell ('data' or 'header').
	 *
	 * @observable
	 * @default ''
	 */
	public declare cellType: string;

	/**
	 * Options passed to the view. See {@link #constructor} to learn more.
	 */
	public readonly options: TableCellPropertiesViewOptionsExperimental;

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
	 * A dropdown that allows selecting the type of the table cell (data or header).
	 */
	public readonly cellTypeDropdown: LabeledFieldView<FocusableView>;

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
	 * The "Back" button view.
	 */
	public backButtonView: ButtonView;

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
	 * @param options.isTableCellTypeSupported A flag indicating whether the table cell type is supported.
	 */
	constructor( locale: Locale, options: TableCellPropertiesViewOptionsExperimental ) {
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
			verticalAlignment: '',
			cellType: ''
		} );

		this.options = options;

		const { borderStyleDropdown, borderWidthInput, borderColorInput, borderRowLabel } = this._createBorderFields();
		const { backgroundRowLabel, backgroundInput } = this._createBackgroundFields();
		const { cellTypeRowLabel, cellTypeDropdown } = this._createCellTypeField();
		const { widthInput, operatorLabel, heightInput, dimensionsLabel } = this._createDimensionFields();
		const { horizontalAlignmentToolbar, verticalAlignmentToolbar, alignmentLabel } = this._createAlignmentFields();

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this.children = this.createCollection();
		this.borderStyleDropdown = borderStyleDropdown;
		this.borderWidthInput = borderWidthInput;
		this.borderColorInput = borderColorInput;
		this.backgroundInput = backgroundInput;
		this.cellTypeDropdown = cellTypeDropdown;
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
		this.backButtonView = this._createBackButton();

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
		const header = new FormHeaderView( locale, {
			label: this.t!( 'Cell properties' )
		} );

		header.children.add( this.backButtonView, 0 );

		this.children.add( header );

		// Border row.
		this.children.add( new FormRowView( locale, {
			labelView: borderRowLabel,
			children: this.options.isTableCellTypeSupported ? [
				borderRowLabel,
				borderStyleDropdown,
				borderWidthInput,
				borderColorInput
			] : [
				borderRowLabel,
				borderStyleDropdown,
				borderColorInput,
				borderWidthInput
			],
			class: `ck-table-form__border-row${ this.options.isTableCellTypeSupported ? ' ck-table-form__border-row_experimental' : '' }`
		} ) );

		// Background and cell type.
		this.children.add( new FormRowView( locale, {
			children: this.options.isTableCellTypeSupported ? [
				new FormRowView( locale, {
					labelView: cellTypeRowLabel,
					children: [
						cellTypeRowLabel,
						cellTypeDropdown
					],
					class: 'ck-table-form__cell-type-row'
				} ),
				new FormRowView( locale, {
					labelView: backgroundRowLabel,
					children: [
						backgroundRowLabel,
						backgroundInput
					],
					class: 'ck-table-form__background-row'
				} )
			] : [
				new FormRowView( locale, {
					labelView: backgroundRowLabel,
					children: [
						backgroundRowLabel,
						backgroundInput
					],
					class: 'ck-table-form__background-row'
				} )
			]
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
				this.cancelButtonView,
				this.saveButtonView
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
					'ck-table-cell-properties-form',
					'ck-table-cell-properties-form_experimental',
					this.options.isTableCellTypeSupported ? 'ck-table-cell-properties-form_experimental-no-cell-type' : ''
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
			this.cellTypeDropdown,
			this.backgroundInput,
			this.widthInput,
			this.heightInput,
			this.paddingInput,
			this.horizontalAlignmentToolbar,
			this.verticalAlignmentToolbar,
			this.cancelButtonView,
			this.saveButtonView,
			this.backButtonView
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
	 * Create cell type field.
	 *
	 * * {@link #cellTypeDropdown}.
	 *
	 * @internal
	 */
	private _createCellTypeField() {
		const locale = this.locale;
		const t = this.t!;

		const cellTypeRowLabel = new LabelView( locale );
		cellTypeRowLabel.text = t( 'Cell type' );

		const cellTypeLabels = this._cellTypeLabels;
		const cellTypeDropdown = new LabeledFieldView( locale, createLabeledDropdown );

		cellTypeDropdown.set( {
			label: t( 'Cell type' ),
			class: 'ck-table-cell-properties-form__cell-type'
		} );

		cellTypeDropdown.fieldView.buttonView.set( {
			ariaLabel: t( 'Cell type' ),
			ariaLabelledBy: undefined,
			isOn: false,
			withText: true,
			tooltip: t( 'Cell type' )
		} );

		cellTypeDropdown.fieldView.buttonView.bind( 'label' ).to( this, 'cellType', value => {
			return cellTypeLabels[ value || 'data' ];
		} );

		cellTypeDropdown.fieldView.on( 'execute', evt => {
			this.cellType = ( evt.source as Record<string, unknown> )._cellTypeValue as string;
		} );

		cellTypeDropdown.bind( 'isEmpty' ).to( this, 'cellType', value => !value );

		addListToDropdown( cellTypeDropdown.fieldView, this._getCellTypeDefinitions(), {
			role: 'menu',
			ariaLabel: t( 'Cell type' )
		} );

		return {
			cellTypeRowLabel,
			cellTypeDropdown
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
			ariaLabel: t( 'Horizontal text alignment toolbar' ),
			class: 'ck-table-cell-properties-form__horizontal-alignment-toolbar'
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
			ariaLabel: t( 'Vertical text alignment toolbar' ),
			class: 'ck-table-cell-properties-form__vertical-alignment-toolbar'
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
			class: 'ck-button-action',
			type: 'submit',
			withText: true
		} );

		saveButtonView.bind( 'isEnabled' ).toMany( fieldsThatShouldValidateToSave, 'errorText', ( ...errorTexts ) => {
			return errorTexts.every( errorText => !errorText );
		} );

		cancelButtonView.set( {
			label: t( 'Cancel' ),
			withText: true
		} );

		cancelButtonView.delegate( 'execute' ).to( this, 'cancel' );

		return {
			saveButtonView, cancelButtonView
		};
	}

	/**
	 * Creates a back button view that cancels the form.
	 */
	private _createBackButton(): ButtonView {
		const t = this.locale!.t;
		const backButton = new ButtonView( this.locale );

		backButton.set( {
			class: 'ck-button-back',
			label: t( 'Back' ),
			icon: IconPreviousArrow,
			tooltip: true
		} );

		backButton.delegate( 'execute' ).to( this, 'cancel' );

		return backButton;
	}

	/**
	 * Creates the cell type dropdown definitions.
	 */
	private _getCellTypeDefinitions(): Collection<ListDropdownItemDefinition> {
		const itemDefinitions: Collection<ListDropdownItemDefinition> = new Collection();
		const cellTypeLabels = this._cellTypeLabels;

		for ( const type of [ 'data', 'header' ] ) {
			const definition: ListDropdownItemDefinition = {
				type: 'button',
				model: new UIModel( {
					_cellTypeValue: type,
					label: cellTypeLabels[ type ],
					role: 'menuitemradio',
					withText: true
				} )
			};

			definition.model.bind( 'isOn' ).to( this, 'cellType', value => value === type );

			itemDefinitions.add( definition );
		}

		return itemDefinitions;
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

	/**
	 * Provides localized labels for {@link #cellTypeDropdown}.
	 */
	private get _cellTypeLabels(): Record<string, string> {
		const t = this.t!;

		return {
			data: t( 'Data cell' ),
			header: t( 'Header cell' )
		};
	}
}

function isBorderStyleSet( value: string ) {
	return value !== 'none';
}
