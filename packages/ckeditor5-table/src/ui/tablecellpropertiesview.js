/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/ui/tablecellpropertiesview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';
import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';

import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';

import LabeledView from '@ckeditor/ckeditor5-ui/src/labeledview/labeledview';
import { createLabeledInputText, createLabeledDropdown } from '@ckeditor/ckeditor5-ui/src/labeledview/utils';
import LabelView from '@ckeditor/ckeditor5-ui/src/label/labelview';
import { addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';
import alignLeftIcon from '@ckeditor/ckeditor5-core/theme/icons/align-left.svg';
import alignRightIcon from '@ckeditor/ckeditor5-core/theme/icons/align-right.svg';
import alignCenterIcon from '@ckeditor/ckeditor5-core/theme/icons/align-center.svg';
import alignJustifyIcon from '@ckeditor/ckeditor5-core/theme/icons/align-justify.svg';
import alignTopIcon from '@ckeditor/ckeditor5-core/theme/icons/align-top.svg';
import alignMiddleIcon from '@ckeditor/ckeditor5-core/theme/icons/align-middle.svg';
import alignBottomIcon from '@ckeditor/ckeditor5-core/theme/icons/align-bottom.svg';

import '../../theme/form.css';
import '../../theme/tablecellproperties.css';
import FormRowView from './formrowview';

const ALIGNMENT_ICONS = {
	left: alignLeftIcon,
	center: alignCenterIcon,
	right: alignRightIcon,
	justify: alignJustifyIcon,
	top: alignTopIcon,
	middle: alignMiddleIcon,
	bottom: alignBottomIcon
};

/**
 * The class representing a table cell properties form, allowing users to customize
 * certain style aspects of a table cell, for instance, border, padding, text alignment, etc..
 *
 * @extends module:ui/view~View
 */
export default class TableCellPropertiesView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

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

		this.set( {
			/**
			 * The value of the cell border style.
			 *
			 * @observable
			 * @default 'none'
			 * @member #borderStyle
			 */
			borderStyle: 'none',

			/**
			 * The value of the cell border width style.
			 *
			 * @observable
			 * @default null
			 * @member #borderWidth
			 */
			borderWidth: null,

			/**
			 * The value of the cell border color style.
			 *
			 * @observable
			 * @default null
			 * @member #borderColor
			 */
			borderColor: null,

			/**
			 * The value of the cell padding style.
			 *
			 * @observable
			 * @default null
			 * @member #padding
			 */
			padding: null,

			/**
			 * The value of the cell background color style.
			 *
			 * @observable
			 * @default null
			 * @member #backgroundColor
			 */
			backgroundColor: null,

			/**
			 * The value of the horizontal text alignment style.
			 *
			 * @observable
			 * @default 'left'
			 * @member #horizontalAlignment
			 */
			horizontalAlignment: 'left',

			/**
			 * The value of the vertical text alignment style.
			 *
			 * @observable
			 * @default 'middle'
			 * @member #verticalAlignment
			 */
			verticalAlignment: 'middle'
		} );

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

		this._createHeaderView();
		this._createBorderFields();
		this._createBackgroundField();
		this._createPaddingField();
		this._createAlignmentFields();
		this._createActionButtons();

		// Form header.
		this.children.add( this._headerView );

		// Border row.
		this.children.add( new FormRowView( locale, {
			labelView: this._borderRowLabel,
			children: [
				this._borderRowLabel,
				this.borderStyleDropdown,
				this.borderColorInput,
				this.borderWidthInput
			],
			class: 'ck-table-cell-properties-form__border-row'
		} ) );

		// Background and padding row.
		this.children.add( new FormRowView( locale, {
			children: [
				this.backgroundInput,
				this.paddingInput,
			]
		} ) );

		// Text alignment row.
		this.children.add( new FormRowView( locale, {
			labelView: this._alignmentLabel,
			children: [
				this._alignmentLabel,
				this.horizontalAlignmentToolbar,
				this.verticalAlignmentToolbar,
			],
			class: 'ck-table-cell-properties-form__alignment-row'
		} ) );

		// Action row.
		this.children.add( new FormRowView( locale, {
			children: [
				this.saveButtonView,
				this.cancelButtonView,
			],
			class: 'ck-table-form__action-row'
		} ) );

		this.setTemplate( {
			tag: 'form',
			attributes: {
				class: [
					'ck',
					'ck-form',
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
			this.paddingInput,
			this.horizontalAlignmentToolbar,
			this.verticalAlignmentToolbar,
			this.saveButtonView,
			this.cancelButtonView
		].forEach( v => {
			// Register the view as focusable.
			this._focusables.add( v );

			// Register the view in the focus tracker.
			this.focusTracker.add( v.element );
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
	 * Creates the header of the form with a localized label.
	 *
	 * @private
	 */
	_createHeaderView() {
		const locale = this.locale;
		const t = this.t;

		this._headerView = new View( locale );

		this._headerView.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-form__header'
				]
			},
			children: [
				t( 'Cell properties' )
			]
		} );
	}

	/**
	 * Creates the following form fields:
	 *
	 * * {@link #borderStyleDropdown},
	 * * {@link #borderWidthInput},
	 * * {@link #borderColorInput}.
	 *
	 * @private
	 */
	_createBorderFields() {
		const locale = this.locale;
		const t = this.t;

		// -- Group label ---------------------------------------------

		const borderRowLabel = this._borderRowLabel = new LabelView( locale );
		borderRowLabel.text = t( 'Border' );

		// -- Style ---------------------------------------------------

		const borderStyleDropdown = this.borderStyleDropdown = new LabeledView( locale, createLabeledDropdown );
		borderStyleDropdown.set( {
			label: t( 'Style' ),
			class: 'ck-table-cell-properties-form__border-style'
		} );

		borderStyleDropdown.view.buttonView.set( {
			isOn: false,
			withText: true,
			tooltip: t( 'Style' )
		} );

		borderStyleDropdown.view.buttonView.bind( 'label' ).to( this, 'borderStyle', value => {
			return this._borderStyleLabels[ value ];
		} );

		borderStyleDropdown.view.on( 'execute', evt => {
			this.borderStyle = evt.source._borderStyleValue;
		} );

		addListToDropdown( borderStyleDropdown.view, this._getBorderStyleDefinitions() );

		// -- Width ---------------------------------------------------

		const borderWidthInput = this.borderWidthInput = new LabeledView( locale, createLabeledInputText );

		borderWidthInput.set( {
			label: t( 'Width' ),
			class: 'ck-table-cell-properties-form__border-width',
		} );

		borderWidthInput.view.bind( 'value' ).to( this, 'borderWidth' );
		borderWidthInput.bind( 'isEnabled' ).to( this, 'borderStyle', value => {
			return value !== 'none';
		} );
		borderWidthInput.view.on( 'input', () => {
			this.borderWidth = borderWidthInput.view.element.value;
		} );

		// -- Color ---------------------------------------------------

		const borderColorInput = this.borderColorInput = new LabeledView( locale, createLabeledInputText );
		borderColorInput.label = t( 'Color' );
		borderColorInput.view.bind( 'value' ).to( this, 'borderColor' );
		borderColorInput.bind( 'isEnabled' ).to( this, 'borderStyle', value => {
			return value !== 'none';
		} );

		borderColorInput.view.on( 'input', () => {
			this.borderColor = borderColorInput.view.element.value;
		} );
	}

	/**
	 * Creates the following form fields:
	 *
	 * * {@link #backgroundInput}.
	 *
	 * @private
	 */
	_createBackgroundField() {
		const locale = this.locale;
		const t = this.t;
		const backgroundInput = this.backgroundInput = new LabeledView( locale, createLabeledInputText );

		backgroundInput.set( {
			label: t( 'Background' ),
			class: 'ck-table-cell-properties-form__background',
		} );

		backgroundInput.view.bind( 'value' ).to( this, 'backgroundColor' );
		backgroundInput.view.on( 'input', () => {
			this.backgroundColor = backgroundInput.view.element.value;
		} );
	}

	/**
	 * Creates the following form fields:
	 *
	 * * {@link #paddingInput}.
	 *
	 * @private
	 */
	_createPaddingField() {
		const locale = this.locale;
		const t = this.t;
		const paddingInput = this.paddingInput = new LabeledView( locale, createLabeledInputText );

		paddingInput.set( {
			label: t( 'Padding' ),
			class: 'ck-table-cell-properties-form__padding',
		} );

		paddingInput.view.bind( 'value' ).to( this, 'padding' );
		paddingInput.view.on( 'input', () => {
			this.padding = paddingInput.view.element.value;
		} );
	}

	/**
	 * Creates the following form fields:
	 *
	 * * {@link #horizontalAlignmentToolbar},
	 * * {@link #verticalAlignmentToolbar}.
	 *
	 * @private
	 */
	_createAlignmentFields() {
		const locale = this.locale;
		const t = this.t;

		this._alignmentLabel = new LabelView( locale );
		this._alignmentLabel.text = t( 'Text alignment' );

		// -- Horizontal ---------------------------------------------------

		this.horizontalAlignmentToolbar = new ToolbarView( locale );
		this.horizontalAlignmentToolbar.ariaLabel = t( 'Horizontal text alignment toolbar' );
		this._fillAlignmentToolbar( this.horizontalAlignmentToolbar, this._horizontalAlignmentLabels, 'horizontalAlignment' );

		// -- Vertical -----------------------------------------------------

		this.verticalAlignmentToolbar = new ToolbarView( locale );
		this.verticalAlignmentToolbar.ariaLabel = t( 'Vertical text alignment toolbar' );
		this._fillAlignmentToolbar( this.verticalAlignmentToolbar, this._verticalAlignmentLabels, 'verticalAlignment' );
	}

	/**
	 * Creates the following form controls:
	 *
	 * * {@link #saveButtonView},
	 * * {@link #cancelButtonView}.
	 *
	 * @private
	 */
	_createActionButtons() {
		const locale = this.locale;
		const t = this.t;

		/**
		 * The Save button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		const saveButtonView = this.saveButtonView = new ButtonView( locale );

		saveButtonView.set( {
			label: t( 'Save' ),
			icon: checkIcon,
			class: 'ck-button-save',
			type: 'submit',
			withText: true,
		} );

		/**
		 * The Cancel button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		const cancelButtonView = this.cancelButtonView = new ButtonView( locale );

		cancelButtonView.set( {
			label: t( 'Cancel' ),
			icon: cancelIcon,
			class: 'ck-button-cancel',
			type: 'cancel',
			withText: true,
		} );

		cancelButtonView.delegate( 'execute' ).to( this, 'cancel' );
	}

	/**
	 * Provides a set of {@link #borderStyleDropdown} item definitions.
	 *
	 * @private
	 * @returns {Iterable.<module:ui/dropdown/utils~ListDropdownItemDefinition>}
	 */
	_getBorderStyleDefinitions() {
		const itemDefinitions = new Collection();

		for ( const style in this._borderStyleLabels ) {
			const definition = {
				type: 'button',
				model: new Model( {
					_borderStyleValue: style,
					label: this._borderStyleLabels[ style ],
					withText: true,
				} )
			};

			definition.model.bind( 'isOn' ).to( this, 'borderStyle', value => {
				return value === style;
			} );

			itemDefinitions.add( definition );
		}

		return itemDefinitions;
	}

	/**
	 * Fills an alignment (either horizontal or vertical) with buttons
	 * that have certain labels and interact with a certain view property
	 * upon execution.
	 *
	 * @private
	 * @param {module:ui/toolbar/toolbarview~ToolbarView} toolbar
	 * @param {Array.<String>} labels
	 * @param {String} propertyName
	 */
	_fillAlignmentToolbar( toolbar, labels, propertyName ) {
		for ( const alignment in labels ) {
			const button = new ButtonView( this.locale );

			button.set( {
				label: labels[ alignment ],
				icon: ALIGNMENT_ICONS[ alignment ],
			} );

			button.bind( 'isOn' ).to( this, propertyName, value => {
				return value === alignment;
			} );

			button.on( 'execute', () => {
				this[ propertyName ] = alignment;
			} );

			toolbar.items.add( button );
		}
	}

	/**
	 * Provides localized labels for {@link #borderStyleDropdown} items.
	 *
	 * @private
	 * @type {Object.<String,String>}
	 */
	get _borderStyleLabels() {
		const t = this.t;

		return {
			none: t( 'None' ),
			solid: t( 'Solid' ),
			dotted: t( 'Dotted' ),
			dashed: t( 'Dashed' ),
			double: t( 'Double' ),
			groove: t( 'Groove' ),
			ridge: t( 'Ridge' ),
			inset: t( 'Inset' ),
			outset: t( 'Outset' ),
		};
	}

	/**
	 * Provides localized labels for {@link #horizontalAlignmentToolbar} buttons.
	 *
	 * @private
	 * @type {Object.<String,String>}
	 */
	get _horizontalAlignmentLabels() {
		const t = this.t;

		return {
			left: t( 'Align cell text to the left' ),
			center: t( 'Align cell text to the center' ),
			right: t( 'Align cell text to the right' ),
			justify: t( 'Justify cell text' ),
		};
	}

	/**
	 * Provides localized labels for {@link #verticalAlignmentToolbar} buttons.
	 *
	 * @private
	 * @type {Object.<String,String>}
	 */
	get _verticalAlignmentLabels() {
		const t = this.t;

		return {
			top: t( 'Align cell text to the top' ),
			middle: t( 'Align cell text to the middle' ),
			bottom: t( 'Align cell text to the bottom' )
		};
	}
}
