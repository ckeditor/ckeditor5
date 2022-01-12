/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/tablecellpropertiesui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView, clickOutsideHandler, ContextualBalloon, getLocalizedColorOptions, normalizeColorOptions } from 'ckeditor5/src/ui';

import TableCellPropertiesView from './ui/tablecellpropertiesview';
import {
	colorFieldValidator,
	getLocalizedColorErrorText,
	getLocalizedLengthErrorText,
	defaultColors,
	lengthFieldValidator,
	lineWidthFieldValidator
} from '../utils/ui/table-properties';
import { debounce } from 'lodash-es';
import { getTableWidgetAncestor } from '../utils/ui/widget';
import { getBalloonCellPositionData, repositionContextualBalloon } from '../utils/ui/contextualballoon';

import tableCellProperties from './../../theme/icons/table-cell-properties.svg';
import { getNormalizedDefaultProperties } from '../utils/table-properties';

const ERROR_TEXT_TIMEOUT = 500;

// Map of view properties and related commands.
const propertyToCommandMap = {
	borderStyle: 'tableCellBorderStyle',
	borderColor: 'tableCellBorderColor',
	borderWidth: 'tableCellBorderWidth',
	width: 'tableCellWidth',
	height: 'tableCellHeight',
	padding: 'tableCellPadding',
	backgroundColor: 'tableCellBackgroundColor',
	horizontalAlignment: 'tableCellHorizontalAlignment',
	verticalAlignment: 'tableCellVerticalAlignment'
};

/**
 * The table cell properties UI plugin. It introduces the `'tableCellProperties'` button
 * that opens a form allowing to specify the visual styling of a table cell.
 *
 * It uses the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableCellPropertiesUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ContextualBalloon ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableCellPropertiesUI';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'table.tableCellProperties', {
			borderColors: defaultColors,
			backgroundColors: defaultColors
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		/**
		 * The default table cell properties.
		 *
		 * @protected
		 * @member {module:table/tablecellproperties~TableCellPropertiesOptions}
		 */
		this._defaultTableCellProperties = getNormalizedDefaultProperties(
			editor.config.get( 'table.tableCellProperties.defaultProperties' ),
			{
				includeVerticalAlignmentProperty: true,
				includeHorizontalAlignmentProperty: true,
				includePaddingProperty: true,
				isRightToLeftContent: editor.locale.contentLanguageDirection === 'rtl'
			}
		);

		/**
		 * The contextual balloon plugin instance.
		 *
		 * @private
		 * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
		 */
		this._balloon = editor.plugins.get( ContextualBalloon );

		/**
		 * The cell properties form view displayed inside the balloon.
		 *
		 * @member {module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView}
		 */
		this.view = this._createPropertiesView();

		/**
		 * The batch used to undo all changes made by the form (which are live, as the user types)
		 * when "Cancel" was pressed. Each time the view is shown, a new batch is created.
		 *
		 * @protected
		 * @member {module:engine/model/batch~Batch}
		 */
		this._undoStepBatch = null;

		editor.ui.componentFactory.add( 'tableCellProperties', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Cell properties' ),
				icon: tableCellProperties,
				tooltip: true
			} );

			this.listenTo( view, 'execute', () => this._showView() );

			const commands = Object.values( propertyToCommandMap )
				.map( commandName => editor.commands.get( commandName ) );

			view.bind( 'isEnabled' ).toMany( commands, 'isEnabled', ( ...areEnabled ) => (
				areEnabled.some( isCommandEnabled => isCommandEnabled )
			) );

			return view;
		} );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		// Destroy created UI components as they are not automatically destroyed.
		// See https://github.com/ckeditor/ckeditor5/issues/1341.
		this.view.destroy();
	}

	/**
	 * Creates the {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView} instance.
	 *
	 * @private
	 * @returns {module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView} The cell
	 * properties form view instance.
	 */
	_createPropertiesView() {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;
		const config = editor.config.get( 'table.tableCellProperties' );
		const borderColorsConfig = normalizeColorOptions( config.borderColors );
		const localizedBorderColors = getLocalizedColorOptions( editor.locale, borderColorsConfig );
		const backgroundColorsConfig = normalizeColorOptions( config.backgroundColors );
		const localizedBackgroundColors = getLocalizedColorOptions( editor.locale, backgroundColorsConfig );
		const view = new TableCellPropertiesView( editor.locale, {
			borderColors: localizedBorderColors,
			backgroundColors: localizedBackgroundColors,
			defaultTableCellProperties: this._defaultTableCellProperties
		} );
		const t = editor.t;

		// Render the view so its #element is available for the clickOutsideHandler.
		view.render();

		this.listenTo( view, 'submit', () => {
			this._hideView();
		} );

		this.listenTo( view, 'cancel', () => {
			// https://github.com/ckeditor/ckeditor5/issues/6180
			if ( this._undoStepBatch.operations.length ) {
				editor.execute( 'undo', this._undoStepBatch );
			}

			this._hideView();
		} );

		// Close the balloon on Esc key press.
		view.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hideView();
			cancel();
		} );

		// Reposition the balloon or hide the form if a table cell is no longer selected.
		this.listenTo( editor.ui, 'update', () => {
			if ( !getTableWidgetAncestor( viewDocument.selection ) ) {
				this._hideView();
			} else if ( this._isViewVisible ) {
				repositionContextualBalloon( editor, 'cell' );
			}
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: view,
			activator: () => this._isViewInBalloon,
			contextElements: [ this._balloon.view.element ],
			callback: () => this._hideView()
		} );

		const colorErrorText = getLocalizedColorErrorText( t );
		const lengthErrorText = getLocalizedLengthErrorText( t );

		// Create the "UI -> editor data" binding.
		// These listeners update the editor data (via table commands) when any observable
		// property of the view has changed. They also validate the value and display errors in the UI
		// when necessary. This makes the view live, which means the changes are
		// visible in the editing as soon as the user types or changes fields' values.
		view.on(
			'change:borderStyle',
			this._getPropertyChangeCallback( 'tableCellBorderStyle', this._defaultTableCellProperties.borderStyle )
		);

		view.on( 'change:borderColor', this._getValidatedPropertyChangeCallback( {
			viewField: view.borderColorInput,
			commandName: 'tableCellBorderColor',
			errorText: colorErrorText,
			validator: colorFieldValidator,
			defaultValue: this._defaultTableCellProperties.borderColor
		} ) );

		view.on( 'change:borderWidth', this._getValidatedPropertyChangeCallback( {
			viewField: view.borderWidthInput,
			commandName: 'tableCellBorderWidth',
			errorText: lengthErrorText,
			validator: lineWidthFieldValidator,
			defaultValue: this._defaultTableCellProperties.borderWidth
		} ) );

		view.on( 'change:padding', this._getValidatedPropertyChangeCallback( {
			viewField: view.paddingInput,
			commandName: 'tableCellPadding',
			errorText: lengthErrorText,
			validator: lengthFieldValidator,
			defaultValue: this._defaultTableCellProperties.padding
		} ) );

		view.on( 'change:width', this._getValidatedPropertyChangeCallback( {
			viewField: view.widthInput,
			commandName: 'tableCellWidth',
			errorText: lengthErrorText,
			validator: lengthFieldValidator,
			defaultValue: this._defaultTableCellProperties.width
		} ) );

		view.on( 'change:height', this._getValidatedPropertyChangeCallback( {
			viewField: view.heightInput,
			commandName: 'tableCellHeight',
			errorText: lengthErrorText,
			validator: lengthFieldValidator,
			defaultValue: this._defaultTableCellProperties.height
		} ) );

		view.on( 'change:backgroundColor', this._getValidatedPropertyChangeCallback( {
			viewField: view.backgroundInput,
			commandName: 'tableCellBackgroundColor',
			errorText: colorErrorText,
			validator: colorFieldValidator,
			defaultValue: this._defaultTableCellProperties.backgroundColor
		} ) );

		view.on(
			'change:horizontalAlignment',
			this._getPropertyChangeCallback( 'tableCellHorizontalAlignment', this._defaultTableCellProperties.horizontalAlignment )
		);
		view.on(
			'change:verticalAlignment',
			this._getPropertyChangeCallback( 'tableCellVerticalAlignment', this._defaultTableCellProperties.verticalAlignment )
		);

		return view;
	}

	/**
	 * In this method the "editor data -> UI" binding is happening.
	 *
	 * When executed, this method obtains selected cell property values from various table commands
	 * and passes them to the {@link #view}.
	 *
	 * This way, the UI stays up–to–date with the editor data.
	 *
	 * @private
	 */
	_fillViewFormFromCommandValues() {
		const commands = this.editor.commands;
		const borderStyleCommand = commands.get( 'tableCellBorderStyle' );

		Object.entries( propertyToCommandMap )
			.map( ( [ property, commandName ] ) => {
				const defaultValue = this._defaultTableCellProperties[ property ] || '';

				return [ property, commands.get( commandName ).value || defaultValue ];
			} )
			.forEach( ( [ property, value ] ) => {
				// Do not set the `border-color` and `border-width` fields if `border-style:none`.
				if ( ( property === 'borderColor' || property === 'borderWidth' ) && borderStyleCommand.value === 'none' ) {
					return;
				}

				this.view.set( property, value );
			} );
	}

	/**
	 * Shows the {@link #view} in the {@link #_balloon}.
	 *
	 * **Note**: Each time a view is shown, a new {@link #_undoStepBatch} is created. It contains
	 * all changes made to the document when the view is visible, allowing a single undo step
	 * for all of them.
	 *
	 * @protected
	 */
	_showView() {
		const editor = this.editor;

		// Update the view with the model values.
		this._fillViewFormFromCommandValues();

		this._balloon.add( {
			view: this.view,
			position: getBalloonCellPositionData( editor )
		} );

		// Create a new batch. Clicking "Cancel" will undo this batch.
		this._undoStepBatch = editor.model.createBatch();

		// Basic a11y.
		this.view.focus();
	}

	/**
	 * Removes the {@link #view} from the {@link #_balloon}.
	 *
	 * @protected
	 */
	_hideView() {
		if ( !this._isViewInBalloon ) {
			return;
		}

		const editor = this.editor;

		this.stopListening( editor.ui, 'update' );

		// Blur any input element before removing it from DOM to prevent issues in some browsers.
		// See https://github.com/ckeditor/ckeditor5/issues/1501.
		this.view.saveButtonView.focus();

		this._balloon.remove( this.view );

		// Make sure the focus is not lost in the process by putting it directly
		// into the editing view.
		this.editor.editing.view.focus();
	}

	/**
	 * Returns `true` when the {@link #view} is visible in the {@link #_balloon}.
	 *
	 * @private
	 * @type {Boolean}
	 */
	get _isViewVisible() {
		return this._balloon.visibleView === this.view;
	}

	/**
	 * Returns `true` when the {@link #view} is in the {@link #_balloon}.
	 *
	 * @private
	 * @type {Boolean}
	 */
	get _isViewInBalloon() {
		return this._balloon.hasView( this.view );
	}

	/**
	 * Creates a callback that when executed upon the {@link #view view's} property change
	 * executes a related editor command with the new property value.
	 *
	 * @private
	 * @param {String} commandName
	 * @param {String} defaultValue The default value of the command.
	 * @returns {Function}
	 */
	_getPropertyChangeCallback( commandName, defaultValue ) {
		return ( evt, propertyName, newValue, oldValue ) => {
			// If the "oldValue" is missing and "newValue" is set to the default value, do not execute the command.
			// It is an initial call (when opening the table properties view).
			if ( !oldValue && defaultValue === newValue ) {
				return;
			}

			this.editor.execute( commandName, {
				value: newValue,
				batch: this._undoStepBatch
			} );
		};
	}

	/**
	 * Creates a callback that when executed upon the {@link #view view's} property change:
	 * * Executes a related editor command with the new property value if the value is valid,
	 * * Or sets the error text next to the invalid field, if the value did not pass the validation.
	 *
	 * @private
	 * @param {Object} options
	 * @param {String} options.commandName
	 * @param {module:ui/view~View} options.viewField
	 * @param {Function} options.validator
	 * @param {String} options.errorText
	 * @param {String} options.defaultValue
	 * @returns {Function}
	 */
	_getValidatedPropertyChangeCallback( options ) {
		const { commandName, viewField, validator, errorText, defaultValue } = options;
		const setErrorTextDebounced = debounce( () => {
			viewField.errorText = errorText;
		}, ERROR_TEXT_TIMEOUT );

		return ( evt, propertyName, newValue, oldValue ) => {
			setErrorTextDebounced.cancel();

			// If the "oldValue" is missing and "newValue" is set to the default value, do not execute the command.
			// It is an initial call (when opening the table properties view).
			if ( !oldValue && defaultValue === newValue ) {
				return;
			}

			if ( validator( newValue ) ) {
				this.editor.execute( commandName, {
					value: newValue,
					batch: this._undoStepBatch
				} );

				viewField.errorText = null;
			} else {
				setErrorTextDebounced();
			}
		};
	}
}
