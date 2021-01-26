/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/tablepropertiesui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import TablePropertiesView from './ui/tablepropertiesview';
import tableProperties from './../../theme/icons/table-properties.svg';
import {
	colorFieldValidator,
	getLocalizedColorErrorText,
	getLocalizedLengthErrorText,
	lengthFieldValidator,
	lineWidthFieldValidator,
	defaultColors
} from '../utils/ui/table-properties';
import {
	getLocalizedColorOptions,
	normalizeColorOptions
} from '@ckeditor/ckeditor5-ui/src/colorgrid/utils';
import { debounce } from 'lodash-es';
import { getTableWidgetAncestor } from '../utils/ui/widget';
import { getBalloonTablePositionData, repositionContextualBalloon } from '../utils/ui/contextualballoon';

const ERROR_TEXT_TIMEOUT = 500;

// Map of view properties and related commands.
const propertyToCommandMap = {
	borderStyle: 'tableBorderStyle',
	borderColor: 'tableBorderColor',
	borderWidth: 'tableBorderWidth',
	backgroundColor: 'tableBackgroundColor',
	width: 'tableWidth',
	height: 'tableHeight',
	alignment: 'tableAlignment'
};

/**
 * The table properties UI plugin. It introduces the `'tableProperties'` button
 * that opens a form allowing to specify visual styling of an entire table.
 *
 * It uses the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TablePropertiesUI extends Plugin {
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
		return 'TablePropertiesUI';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'table.tableProperties', {
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
		 * The contextual balloon plugin instance.
		 *
		 * @private
		 * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
		 */
		this._balloon = editor.plugins.get( ContextualBalloon );

		/**
		 * The properties form view displayed inside the balloon.
		 *
		 * @member {module:table/tableproperties/ui/tablepropertiesview~TablePropertiesView}
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

		editor.ui.componentFactory.add( 'tableProperties', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Table properties' ),
				icon: tableProperties,
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
	 * Creates the {@link module:table/tableproperties/ui/tablepropertiesview~TablePropertiesView} instance.
	 *
	 * @private
	 * @returns {module:table/tableproperties/ui/tablepropertiesview~TablePropertiesView} The table
	 * properties form view instance.
	 */
	_createPropertiesView() {
		const editor = this.editor;
		const config = editor.config.get( 'table.tableProperties' );
		const borderColorsConfig = normalizeColorOptions( config.borderColors );
		const localizedBorderColors = getLocalizedColorOptions( editor.locale, borderColorsConfig );
		const backgroundColorsConfig = normalizeColorOptions( config.backgroundColors );
		const localizedBackgroundColors = getLocalizedColorOptions( editor.locale, backgroundColorsConfig );
		const view = new TablePropertiesView( editor.locale, {
			borderColors: localizedBorderColors,
			backgroundColors: localizedBackgroundColors
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
		view.on( 'change:borderStyle', this._getPropertyChangeCallback( 'tableBorderStyle' ) );

		view.on( 'change:borderColor', this._getValidatedPropertyChangeCallback( {
			viewField: view.borderColorInput,
			commandName: 'tableBorderColor',
			errorText: colorErrorText,
			validator: colorFieldValidator
		} ) );

		view.on( 'change:borderWidth', this._getValidatedPropertyChangeCallback( {
			viewField: view.borderWidthInput,
			commandName: 'tableBorderWidth',
			errorText: lengthErrorText,
			validator: lineWidthFieldValidator
		} ) );

		view.on( 'change:backgroundColor', this._getValidatedPropertyChangeCallback( {
			viewField: view.backgroundInput,
			commandName: 'tableBackgroundColor',
			errorText: colorErrorText,
			validator: colorFieldValidator
		} ) );

		view.on( 'change:width', this._getValidatedPropertyChangeCallback( {
			viewField: view.widthInput,
			commandName: 'tableWidth',
			errorText: lengthErrorText,
			validator: lengthFieldValidator
		} ) );

		view.on( 'change:height', this._getValidatedPropertyChangeCallback( {
			viewField: view.heightInput,
			commandName: 'tableHeight',
			errorText: lengthErrorText,
			validator: lengthFieldValidator
		} ) );

		view.on( 'change:alignment', this._getPropertyChangeCallback( 'tableAlignment' ) );

		return view;
	}

	/**
	 * In this method the "editor data -> UI" binding is happening.
	 *
	 * When executed, this method obtains selected table property values from various table commands
	 * and passes them to the {@link #view}.
	 *
	 * This way, the UI stays up–to–date with the editor data.
	 *
	 * @private
	 */
	_fillViewFormFromCommandValues() {
		const commands = this.editor.commands;

		Object.entries( propertyToCommandMap )
			.map( ( [ property, commandName ] ) => [ property, commands.get( commandName ).value || '' ] )
			.forEach( ( [ property, value ] ) => this.view.set( property, value ) );
	}

	/**
	 * Shows the {@link #view} in the {@link #_balloon}.
	 *
	 * **Note**: Each time a view is shown, the new {@link #_undoStepBatch} is created that contains
	 * all changes made to the document when the view is visible, allowing a single undo step
	 * for all of them.
	 *
	 * @protected
	 */
	_showView() {
		const editor = this.editor;

		this.listenTo( editor.ui, 'update', () => {
			this._updateView();
		} );

		// Update the view with the model values.
		this._fillViewFormFromCommandValues();

		this._balloon.add( {
			view: this.view,
			position: getBalloonTablePositionData( editor )
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
	 * Repositions the {@link #_balloon} or hides the {@link #view} if a table is no longer selected.
	 *
	 * @protected
	 */
	_updateView() {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		if ( !getTableWidgetAncestor( viewDocument.selection ) ) {
			this._hideView();
		} else if ( this._isViewVisible ) {
			repositionContextualBalloon( editor, 'table' );
		}
	}

	/**
	 * Returns `true` when the {@link #view} is the visible in the {@link #_balloon}.
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
	 * Creates a callback that when executed upon {@link #view view's} property change
	 * executes a related editor command with the new property value.
	 *
	 * @private
	 * @param {String} commandName
	 * @returns {Function}
	 */
	_getPropertyChangeCallback( commandName ) {
		return ( evt, propertyName, newValue ) => {
			this.editor.execute( commandName, {
				value: newValue,
				batch: this._undoStepBatch
			} );
		};
	}

	/**
	 * Creates a callback that when executed upon {@link #view view's} property change:
	 * * executes a related editor command with the new property value if the value is valid,
	 * * or sets the error text next to the invalid field, if the value did not pass the validation.
	 *
	 * @private
	 * @param {Object} options
	 * @param {String} options.commandName
	 * @param {module:ui/view~View} options.viewField
	 * @param {Function} options.validator
	 * @param {String} options.errorText
	 * @returns {Function}
	 */
	_getValidatedPropertyChangeCallback( { commandName, viewField, validator, errorText } ) {
		const setErrorTextDebounced = debounce( () => {
			viewField.errorText = errorText;
		}, ERROR_TEXT_TIMEOUT );

		return ( evt, propertyName, newValue ) => {
			setErrorTextDebounced.cancel();

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
