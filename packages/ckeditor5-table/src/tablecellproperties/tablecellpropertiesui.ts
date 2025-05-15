/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellproperties/tablecellpropertiesui
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { IconTableCellProperties } from 'ckeditor5/src/icons.js';
import {
	ButtonView,
	clickOutsideHandler,
	ContextualBalloon,
	getLocalizedColorOptions,
	normalizeColorOptions,
	type View
} from 'ckeditor5/src/ui.js';
import type { Batch } from 'ckeditor5/src/engine.js';

import TableCellPropertiesView from './ui/tablecellpropertiesview.js';
import {
	colorFieldValidator,
	getLocalizedColorErrorText,
	getLocalizedLengthErrorText,
	defaultColors,
	lengthFieldValidator,
	lineWidthFieldValidator
} from '../utils/ui/table-properties.js';
import { debounce } from 'es-toolkit/compat';
import { getSelectionAffectedTableWidget, getTableWidgetAncestor } from '../utils/ui/widget.js';
import { getBalloonCellPositionData, repositionContextualBalloon } from '../utils/ui/contextualballoon.js';
import {
	getNormalizedDefaultCellProperties,
	getNormalizedDefaultProperties,
	type NormalizedDefaultProperties
} from '../utils/table-properties.js';
import type { GetCallback, ObservableChangeEvent } from 'ckeditor5/src/utils.js';

import type TableCellBorderStyleCommand from './commands/tablecellborderstylecommand.js';

const ERROR_TEXT_TIMEOUT = 500;

// Map of view properties and related commands.
const propertyToCommandMap = {
	borderStyle: 'tableCellBorderStyle',
	borderColor: 'tableCellBorderColor',
	borderWidth: 'tableCellBorderWidth',
	height: 'tableCellHeight',
	width: 'tableCellWidth',
	padding: 'tableCellPadding',
	backgroundColor: 'tableCellBackgroundColor',
	horizontalAlignment: 'tableCellHorizontalAlignment',
	verticalAlignment: 'tableCellVerticalAlignment'
} as const;

/**
 * The table cell properties UI plugin. It introduces the `'tableCellProperties'` button
 * that opens a form allowing to specify the visual styling of a table cell.
 *
 * It uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 */
export default class TableCellPropertiesUI extends Plugin {
	/**
	 * The default table cell properties.
	 */
	private _defaultContentTableCellProperties!: NormalizedDefaultProperties;

	/**
	 * The default layout table cell properties.
	 */
	private _defaultLayoutTableCellProperties!: NormalizedDefaultProperties;

	/**
	 * The contextual balloon plugin instance.
	 */
	private _balloon?: ContextualBalloon;

	/**
	 * The cell properties form view displayed inside the balloon.
	 */
	public view?: TableCellPropertiesView | null;

	/**
	 * The cell properties form view displayed inside the balloon (content table).
	 */
	private _viewWithContentTableDefaults?: TableCellPropertiesView | null;

	/**
	 * The cell properties form view displayed inside the balloon (layout table).
	 */
	private _viewWithLayoutTableDefaults?: TableCellPropertiesView | null;

	/**
	 * The batch used to undo all changes made by the form (which are live, as the user types)
	 * when "Cancel" was pressed. Each time the view is shown, a new batch is created.
	 */
	private _undoStepBatch?: Batch;

	/**
	 * Flag used to indicate whether view is ready to execute update commands
	 * (it finished loading initial data).
	 */
	private _isReady?: boolean;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ContextualBalloon ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableCellPropertiesUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'table.tableCellProperties', {
			borderColors: defaultColors,
			backgroundColors: defaultColors
		} );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		this._defaultContentTableCellProperties = getNormalizedDefaultCellProperties(
			editor.config.get( 'table.tableCellProperties.defaultProperties' )!,
			{
				includeVerticalAlignmentProperty: true,
				includeHorizontalAlignmentProperty: true,
				includePaddingProperty: true,
				isRightToLeftContent: editor.locale.contentLanguageDirection === 'rtl'
			}
		);
		this._defaultLayoutTableCellProperties = getNormalizedDefaultProperties( undefined, {
			includeVerticalAlignmentProperty: true,
			includeHorizontalAlignmentProperty: true,
			isRightToLeftContent: editor.locale.contentLanguageDirection === 'rtl'
		} );

		this._balloon = editor.plugins.get( ContextualBalloon );
		this.view = null;
		this._isReady = false;

		editor.ui.componentFactory.add( 'tableCellProperties', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Cell properties' ),
				icon: IconTableCellProperties,
				tooltip: true
			} );

			this.listenTo( view, 'execute', () => this._showView() );

			const commands = Object.values( propertyToCommandMap )
				.map( commandName => editor.commands.get( commandName )! );

			view.bind( 'isEnabled' ).toMany( commands, 'isEnabled', ( ...areEnabled ) => (
				areEnabled.some( isCommandEnabled => isCommandEnabled )
			) );

			return view;
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		// Destroy created UI components as they are not automatically destroyed.
		// See https://github.com/ckeditor/ckeditor5/issues/1341.
		if ( this.view ) {
			this.view.destroy();
		}
	}

	/**
	 * Creates the {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView} instance.
	 *
	 * @returns The cell properties form view instance.
	 */
	private _createPropertiesView( defaultTableCellProperties: NormalizedDefaultProperties ) {
		const editor = this.editor;
		const config = editor.config.get( 'table.tableCellProperties' )!;
		const borderColorsConfig = normalizeColorOptions( config.borderColors! );
		const localizedBorderColors = getLocalizedColorOptions( editor.locale, borderColorsConfig );
		const backgroundColorsConfig = normalizeColorOptions( config.backgroundColors! );
		const localizedBackgroundColors = getLocalizedColorOptions( editor.locale, backgroundColorsConfig );
		const hasColorPicker = config.colorPicker !== false;

		const view = new TableCellPropertiesView( editor.locale, {
			borderColors: localizedBorderColors,
			backgroundColors: localizedBackgroundColors,
			defaultTableCellProperties,
			colorPickerConfig: hasColorPicker ? ( config.colorPicker || {} ) : false
		} );
		const t = editor.t;

		// Render the view so its #element is available for the clickOutsideHandler.
		view.render();

		this.listenTo( view, 'submit', () => {
			this._hideView();
		} );

		this.listenTo( view, 'cancel', () => {
			// https://github.com/ckeditor/ckeditor5/issues/6180
			if ( this._undoStepBatch!.operations.length ) {
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
			contextElements: [ this._balloon!.view.element! ],
			callback: () => this._hideView()
		} );

		const colorErrorText = getLocalizedColorErrorText( t );
		const lengthErrorText = getLocalizedLengthErrorText( t );

		// Create the "UI -> editor data" binding.
		// These listeners update the editor data (via table commands) when any observable
		// property of the view has changed. They also validate the value and display errors in the UI
		// when necessary. This makes the view live, which means the changes are
		// visible in the editing as soon as the user types or changes fields' values.
		view.on<ObservableChangeEvent<string>>(
			'change:borderStyle',
			this._getPropertyChangeCallback( 'tableCellBorderStyle' )
		);

		view.on<ObservableChangeEvent<string>>( 'change:borderColor', this._getValidatedPropertyChangeCallback( {
			viewField: view.borderColorInput,
			commandName: 'tableCellBorderColor',
			errorText: colorErrorText,
			validator: colorFieldValidator
		} ) );

		view.on<ObservableChangeEvent<string>>( 'change:borderWidth', this._getValidatedPropertyChangeCallback( {
			viewField: view.borderWidthInput,
			commandName: 'tableCellBorderWidth',
			errorText: lengthErrorText,
			validator: lineWidthFieldValidator
		} ) );

		view.on<ObservableChangeEvent<string>>( 'change:padding', this._getValidatedPropertyChangeCallback( {
			viewField: view.paddingInput,
			commandName: 'tableCellPadding',
			errorText: lengthErrorText,
			validator: lengthFieldValidator
		} ) );

		view.on<ObservableChangeEvent<string>>( 'change:width', this._getValidatedPropertyChangeCallback( {
			viewField: view.widthInput,
			commandName: 'tableCellWidth',
			errorText: lengthErrorText,
			validator: lengthFieldValidator
		} ) );

		view.on<ObservableChangeEvent<string>>( 'change:height', this._getValidatedPropertyChangeCallback( {
			viewField: view.heightInput,
			commandName: 'tableCellHeight',
			errorText: lengthErrorText,
			validator: lengthFieldValidator
		} ) );

		view.on<ObservableChangeEvent<string>>( 'change:backgroundColor', this._getValidatedPropertyChangeCallback( {
			viewField: view.backgroundInput,
			commandName: 'tableCellBackgroundColor',
			errorText: colorErrorText,
			validator: colorFieldValidator
		} ) );

		view.on<ObservableChangeEvent<string>>(
			'change:horizontalAlignment',
			this._getPropertyChangeCallback( 'tableCellHorizontalAlignment' )
		);
		view.on<ObservableChangeEvent<string>>(
			'change:verticalAlignment',
			this._getPropertyChangeCallback( 'tableCellVerticalAlignment' )
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
	 */
	private _fillViewFormFromCommandValues() {
		const commands = this.editor.commands;
		const borderStyleCommand: TableCellBorderStyleCommand = commands.get( 'tableCellBorderStyle' )!;

		Object.entries( propertyToCommandMap )
			.map( ( [ property, commandName ] ) => {
				const propertyKey = property as keyof typeof propertyToCommandMap;
				const defaultValue = this.view === this._viewWithContentTableDefaults ?
					this._defaultContentTableCellProperties[ propertyKey ] || '' :
					this._defaultLayoutTableCellProperties[ propertyKey ] || '';

				return [
					property as keyof typeof propertyToCommandMap,
					commands.get( commandName )!.value as string || defaultValue
				] as const;
			} )
			.forEach( ( [ property, value ] ) => {
				// Do not set the `border-color` and `border-width` fields if `border-style:none`.
				if ( ( property === 'borderColor' || property === 'borderWidth' ) && borderStyleCommand.value === 'none' ) {
					return;
				}

				this.view!.set( property, value );
			} );

		this._isReady = true;
	}

	/**
	 * Shows the {@link #view} in the {@link #_balloon}.
	 *
	 * **Note**: Each time a view is shown, a new {@link #_undoStepBatch} is created. It contains
	 * all changes made to the document when the view is visible, allowing a single undo step
	 * for all of them.
	 */
	protected _showView(): void {
		const editor = this.editor;

		const viewTable = getSelectionAffectedTableWidget( editor.editing.view.document.selection );
		const modelTable = viewTable && editor.editing.mapper.toModelElement( viewTable );
		const useDefaults = !modelTable || modelTable.getAttribute( 'tableType' ) !== 'layout';

		if ( useDefaults && !this._viewWithContentTableDefaults ) {
			this._viewWithContentTableDefaults = this._createPropertiesView( this._defaultContentTableCellProperties );
		} else if ( !useDefaults && !this._viewWithLayoutTableDefaults ) {
			this._viewWithLayoutTableDefaults = this._createPropertiesView( this._defaultLayoutTableCellProperties );
		}

		this.view = useDefaults ? this._viewWithContentTableDefaults! : this._viewWithLayoutTableDefaults!;

		this.listenTo( editor.ui, 'update', () => {
			this._updateView();
		} );

		// Update the view with the model values.
		this._fillViewFormFromCommandValues();

		this._balloon!.add( {
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
	 */
	protected _hideView(): void {
		const editor = this.editor;

		this.stopListening( editor.ui, 'update' );

		this._isReady = false;

		// Blur any input element before removing it from DOM to prevent issues in some browsers.
		// See https://github.com/ckeditor/ckeditor5/issues/1501.
		this.view!.saveButtonView.focus();

		this._balloon!.remove( this.view! );

		// Make sure the focus is not lost in the process by putting it directly
		// into the editing view.
		this.editor.editing.view.focus();
	}

	/**
	 * Repositions the {@link #_balloon} or hides the {@link #view} if a table cell is no longer selected.
	 */
	protected _updateView(): void {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		if ( !getTableWidgetAncestor( viewDocument.selection ) ) {
			this._hideView();
		} else if ( this._isViewVisible ) {
			repositionContextualBalloon( editor, 'cell' );
		}
	}

	/**
	 * Returns `true` when the {@link #view} is visible in the {@link #_balloon}.
	 */
	private get _isViewVisible() {
		return !!this.view && this._balloon!.visibleView === this.view;
	}

	/**
	 * Returns `true` when the {@link #view} is in the {@link #_balloon}.
	 */
	private get _isViewInBalloon() {
		return !!this.view && this._balloon!.hasView( this.view );
	}

	/**
	 * Creates a callback that when executed upon the {@link #view view's} property change
	 * executes a related editor command with the new property value.
	 *
	 * @param commandName The default value of the command.
	 */
	private _getPropertyChangeCallback(
		commandName: 'tableCellBorderStyle' | 'tableCellHorizontalAlignment' | 'tableCellVerticalAlignment'
	): GetCallback<ObservableChangeEvent<string>> {
		return ( evt, propertyName, newValue ) => {
			if ( !this._isReady ) {
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
	 */
	private _getValidatedPropertyChangeCallback(
		options: {
			commandName: `tableCell${ 'BorderColor' | 'BorderWidth' | 'Padding' | 'Width' | 'Height' | 'BackgroundColor' }`;
			viewField: View & { errorText?: string | null };
			validator: ( arg0: string ) => boolean;
			errorText: string;
		}
	): GetCallback<ObservableChangeEvent<string>> {
		const { commandName, viewField, validator, errorText } = options;
		const setErrorTextDebounced = debounce( () => {
			viewField.errorText = errorText;
		}, ERROR_TEXT_TIMEOUT );

		return ( evt, propertyName, newValue ) => {
			setErrorTextDebounced.cancel();
			// Do not execute the command on initial call (opening the table properties view).
			if ( !this._isReady ) {
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
