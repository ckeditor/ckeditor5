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
import { labeledInputCreator, labeledDropdownCreator } from '@ckeditor/ckeditor5-ui/src/labeledview/creators';
import LabelView from '@ckeditor/ckeditor5-ui/src/label/labelview';
import { addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

// TODO: These **must** be transferred to ckeditor5-core.
import alignLeftIcon from '@ckeditor/ckeditor5-alignment/theme/icons/align-left.svg';
import alignRightIcon from '@ckeditor/ckeditor5-alignment/theme/icons/align-right.svg';
import alignCenterIcon from '@ckeditor/ckeditor5-alignment/theme/icons/align-center.svg';
import alignJustifyIcon from '@ckeditor/ckeditor5-alignment/theme/icons/align-justify.svg';

import alignTopIcon from '../../theme/icons/align-top.svg';
import alignMiddleIcon from '../../theme/icons/align-middle.svg';
import alignBottomIcon from '../../theme/icons/align-bottom.svg';

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
 * TODO
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

		this._createBorderFields();
		this._createBackgroundField();
		this._createPaddingField();
		this._createAlignmentFields();
		this._createActionButtons();

		this.set( {
			borderStyle: 'none',
			borderWidth: null,
			borderColor: null,
			padding: null,
			backgroundColor: null,
			horizontalAlignment: 'left',
			verticalAlignment: 'middle'
		} );

		const borderRowView = new FormRowView( locale, {
			labelView: this.borderRowLabel,
			children: [
				this.borderRowLabel,
				this.borderStyleDropdown,
				this.borderColorInput,
				this.borderWidthInput
			]
		} );

		borderRowView.class = 'ck-table-cell-properties-form__border-row';

		const paddingBackgroundRowView = new FormRowView( locale, {
			children: [
				this.backgroundInput,
				this.paddingInput,
			]
		} );

		const alignmentRowView = new FormRowView( locale, {
			labelView: this.alignmentLabel,
			children: [
				this.alignmentLabel,
				this.horizontalAlignmentToolbar,
				this.verticalAlignmentToolbar,
			]
		} );

		alignmentRowView.class = 'ck-table-cell-properties-form__alignment-row';

		const actionRowView = new FormRowView( locale, {
			children: [
				this.saveButtonView,
				this.cancelButtonView,
			]
		} );

		actionRowView.class = 'ck-table-form__action-row';

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
			children: [
				{
					tag: 'div',
					attributes: {
						class: [
							'ck',
							'ck-form__header'
						]
					},
					children: [
						'Cell properties'
					]
				},

				borderRowView,
				paddingBackgroundRowView,
				alignmentRowView,
				actionRowView
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		submitHandler( {
			view: this
		} );

		const focusableChildViews = [
			this.borderStyleDropdown,
			this.borderColorInput,
			this.borderWidthInput,
			this.backgroundInput,
			this.paddingInput,
			this.horizontalAlignmentToolbar,
			this.verticalAlignmentToolbar,
			this.saveButtonView,
			this.cancelButtonView
		];

		focusableChildViews.forEach( v => {
			// Register the view as focusable.
			this._focusables.add( v );

			// Register the view in the focus tracker.
			this.focusTracker.add( v.element );
		} );

		this.keystrokes.listenTo( this.element );
	}

	focus() {
		this._focusCycler.focusFirst();
	}

	resetFields() {
		this.borderWidthInput.view.element.value =
			this.borderColorInput.view.element.value =
			this.paddingInput.view.element.value =
			this.backgroundInput.view.element.value = '';
	}

	/**
	 * TODO
	 */
	_createBorderFields() {
		const locale = this.locale;
		const t = this.t;

		// -- Group label ---------------------------------------------

		const borderRowLabel = this.borderRowLabel = new LabelView( locale );
		borderRowLabel.text = t( 'Border' );

		// -- Style ---------------------------------------------------

		const borderStyleDropdown = this.borderStyleDropdown = new LabeledView( locale, labeledDropdownCreator );
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
			const value = evt.source._borderStyleValue;

			// Update the UI.
			this.borderStyle = value;

			// Update the editor model.
			this.fire( 'update', {
				borderStyle: evt.source._borderStyleValue
			} );
		} );

		addListToDropdown( borderStyleDropdown.view, this._getBorderStyleDefinitions() );

		// -- Width ---------------------------------------------------

		const borderWidthInput = this.borderWidthInput = new LabeledView( locale, labeledInputCreator );

		borderWidthInput.set( {
			label: t( 'Width' ),
			class: 'ck-table-cell-properties-form__border-width',
		} );

		borderWidthInput.view.bind( 'value' ).to( this, 'borderWidth' );
		borderWidthInput.bind( 'isEnabled' ).to( this, 'borderStyle', value => {
			return value !== 'none';
		} );
		borderWidthInput.view.on( 'input', () => {
			this.fire( 'update', {
				borderWidth: borderWidthInput.view.element.value
			} );
		} );

		// -- Color ---------------------------------------------------

		const borderColorInput = this.borderColorInput = new LabeledView( locale, labeledInputCreator );
		borderColorInput.label = t( 'Color' );
		borderColorInput.view.bind( 'value' ).to( this, 'borderColor' );
		borderColorInput.bind( 'isEnabled' ).to( this, 'borderStyle', value => {
			return value !== 'none';
		} );

		borderColorInput.view.on( 'input', () => {
			this.fire( 'update', {
				borderColor: borderColorInput.view.element.value
			} );
		} );
	}

	/**
	 * TODO
	 */
	_createBackgroundField() {
		const locale = this.locale;
		const t = this.t;
		const backgroundInput = this.backgroundInput = new LabeledView( locale, labeledInputCreator );

		backgroundInput.set( {
			label: t( 'Background' ),
			class: 'ck-table-cell-properties-form__background',
		} );

		backgroundInput.view.bind( 'value' ).to( this, 'backgroundColor' );
		backgroundInput.view.on( 'input', () => {
			this.fire( 'update', {
				backgroundColor: backgroundInput.view.element.value
			} );
		} );
	}

	/**
	 * TODO
	 */
	_createPaddingField() {
		const locale = this.locale;
		const t = this.t;
		const paddingInput = this.paddingInput = new LabeledView( locale, labeledInputCreator );

		paddingInput.set( {
			label: t( 'Padding' ),
			class: 'ck-table-cell-properties-form__padding',
		} );

		paddingInput.view.bind( 'value' ).to( this, 'padding' );
		paddingInput.view.on( 'input', () => {
			this.fire( 'update', {
				padding: paddingInput.view.element.value
			} );
		} );
	}

	/**
	 * TODO
	 */
	_createAlignmentFields() {
		const locale = this.locale;
		const t = this.t;

		this.alignmentLabel = new LabelView( locale );
		this.alignmentLabel.text = t( 'Text alignment' );

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
	 *
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
	 * TODO
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
	 * TODO
	 *
	 * @param {*} toolbar
	 * @param {*} labels
	 * @param {*} propertyName
	 */
	_fillAlignmentToolbar( toolbar, labels, propertyName ) {
		for ( const alignment in labels ) {
			const button = createAlignmentButton(
				this.locale,
				labels[ alignment ],
				ALIGNMENT_ICONS[ alignment ]
			);

			button.bind( 'isOn' ).to( this, propertyName, value => {
				return value === alignment;
			} );

			button.on( 'execute', () => {
				// Update the UI.
				this[ propertyName ] = alignment;

				// Update the editor model.
				this.fire( 'update', {
					[ propertyName ]: alignment
				} );
			} );

			toolbar.items.add( button );
		}
	}

	/**
	 * TODO
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
	 * TODO
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
	 * TODO
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

function createAlignmentButton( locale, label, icon ) {
	const button = new ButtonView( locale );

	button.set( {
		label,
		icon,
	} );

	return button;
}
