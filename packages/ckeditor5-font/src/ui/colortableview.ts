/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/ui/colortableview
 */

import { icons } from 'ckeditor5/src/core';
import {
	ButtonView,
	ColorGridView,
	ColorTileView,
	FocusCycler,
	LabelView,
	Template,
	View,
	ViewCollection,
	ColorPickerView,
	icons as uiIcons,
	type ColorDefinition,
	type ColorPickerConfig
} from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils';
import type { Model } from 'ckeditor5/src/engine';

import DocumentColorCollection from '../documentcolorcollection';

import '../../theme/fontcolor.css';

/**
 * A class which represents a view with the following sub–components:
 *
 * * A {@link module:font/ui/colortableview~ColorTableView#colorGridsPageView color grids component},
 * * A {@link module:font/ui/colortableview~ColorTableView#colorPickerPageView color picker component}.
 */
export default class ColorTableView extends View {
	/**
	 * Tracks information about the DOM focus in the list.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * A collection of components.
	 */
	public readonly items: ViewCollection;

	/**
	 * The "Color grids" component.
	 */
	public colorGridsPageView: ColorGridsPageView;

	/**
	 * The "Color picker" component.
	 */
	public colorPickerPageView: ColorPickerPageView;

	/**
	 * Keeps the value of the command associated with the component for the current selection.
	 */
	declare public selectedColor?: string;

	/**
	 * State of the "Color grids" component visibility.
	 *
	 * @internal
	 */
	declare public _isColorGridsPageVisible: boolean;

	/**
	 * State of the "Color picker" component visibility.
	 *
	 * @internal
	 */
	declare public _isColorPickerPageVisible: boolean;

	/**
	 * Helps cycling over focusable {@link #items} in the list.
	 *
	 * @readonly
	 */
	protected _focusCycler: FocusCycler;

	/**
	 * A collection of views that can be focused in the view.
	 *
	 * @readonly
	 */
	protected _focusables: ViewCollection;

	/**
	 * The configuration of color picker feature.
	 */
	private _colorPickerConfig: ColorPickerConfig | false;

	/**
	 * Creates a view to be inserted as a child of {@link module:ui/dropdown/dropdownview~DropdownView}.
	 *
	 * @param locale The localization services instance.
	 * @param colors An array with definitions of colors to be displayed in the table.
	 * @param columns The number of columns in the color grid.
	 * @param removeButtonLabel The label of the button responsible for removing the color.
	 * @param colorPickerLabel The label of the button responsible for color picker appearing.
	 * @param documentColorsLabel The label for the section with the document colors.
	 * @param documentColorsCount The number of colors in the document colors section inside the color dropdown.
	 * @param colorPickerConfig The configuration of color picker feature.
	 */
	constructor(
		locale: Locale,
		{ colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount, colorPickerLabel, colorPickerConfig }: {
			colors: Array<ColorDefinition>;
			columns: number;
			removeButtonLabel: string;
			colorPickerLabel: string;
			documentColorsLabel?: string;
			documentColorsCount?: number;
			colorPickerConfig: ColorPickerConfig | false;
		}
	) {
		super( locale );
		this.items = this.createCollection();

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		this._focusables = new ViewCollection();
		this._colorPickerConfig = colorPickerConfig;
		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate list items backwards using the <kbd>Shift</kbd> + <kbd>Tab</kbd> keystroke.
				focusPrevious: 'shift + tab',

				// Navigate list items forwards using the <kbd>Tab</kbd> key.
				focusNext: 'tab'
			}
		} );

		this.colorGridsPageView = new ColorGridsPageView( locale, {
			colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount, colorPickerLabel,
			focusTracker: this.focusTracker,
			focusables: this._focusables
		} );

		this.colorPickerPageView = new ColorPickerPageView( locale, {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokes: this.keystrokes,
			colorPickerConfig
		} );

		this.set( '_isColorGridsPageVisible', true );
		this.set( '_isColorPickerPageVisible', false );

		this.set( 'selectedColor', undefined );

		this.colorGridsPageView.bind( 'isVisible' ).to( this, '_isColorGridsPageVisible' );
		this.colorPickerPageView.bind( 'isVisible' ).to( this, '_isColorPickerPageVisible' );

		/**
		 * This is kind of bindings. Unfortunately we could not use this.bind() method because the same property
		 * can not be binded twice. So this is work around how to bind 'selectedColor' property between components.
		 */
		this.on( 'change:selectedColor', ( evt, evtName, data ) => {
			this.colorGridsPageView.set( 'selectedColor', data );
			this.colorPickerPageView.set( 'selectedColor', data );
		} );

		this.colorGridsPageView.on( 'change:selectedColor', ( evt, evtName, data ) => {
			this.set( 'selectedColor', data );
		} );

		this.colorPickerPageView.on( 'change:selectedColor', ( evt, evtName, data ) => {
			this.set( 'selectedColor', data );
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-color-table'
				]
			},
			children: this.items
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		// Start listening for the keystrokes coming from #element.
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
	 * Appends static and document color grid views.
	 */
	public appendGrids(): void {
		if ( this.items.length ) {
			return;
		}
		this.items.add( this.colorGridsPageView );
		this.colorGridsPageView.delegate( 'execute' ).to( this );
		this.colorGridsPageView.delegate( 'showColorPicker' ).to( this );
	}

	/**
	 * Renders UI in dropdown. Which sub-components are rendered
	 * depends on the component configuration.
	 */
	public appendUI(): void {
		this.appendGrids();

		if ( this._colorPickerConfig ) {
			this._appendColorPicker();
		}
	}

	/**
	 * Show "Color picker" and hide "Color grids".
	 */
	public showColorPicker(): void {
		if ( !this.colorPickerPageView.colorPickerView ) {
			return;
		}

		this.set( '_isColorPickerPageVisible', true );
		this.colorPickerPageView.focus();
		this.set( '_isColorGridsPageVisible', false );
	}

	/**
	 * Show "Color grids" and hide "Color picker".
	 */
	public showColorGrids(): void {
		this.set( '_isColorGridsPageVisible', true );
		this.set( '_isColorPickerPageVisible', false );
	}

	/**
	 * Focuses the first focusable element in {@link #items}.
	 */
	public focus(): void {
		this._focusCycler.focusFirst();
	}

	/**
	 * Focuses the last focusable element in {@link #items}.
	 */
	public focusLast(): void {
		this._focusCycler.focusLast();
	}

	/**
	 * Scans through the editor model and searches for text node attributes with the given attribute name.
	 * Found entries are set as document colors.
	 *
	 * All the previously stored document colors will be lost in the process.
	 *
	 * @param model The model used as a source to obtain the document colors.
	 * @param attributeName Determines the name of the related model's attribute for a given dropdown.
	 */
	public updateDocumentColors( model: Model, attributeName: string ): void {
		this.colorGridsPageView.updateDocumentColors( model, attributeName );
	}

	/**
	 * Refreshes the state of the selected color in one or both {@link module:ui/colorgrid/colorgridview~ColorGridView}s
	 * available in the {@link module:font/ui/colortableview~ColorTableView}. It guarantees that the selection will occur only in one
	 * of them.
	 */
	public updateSelectedColors(): void {
		this.colorGridsPageView.updateSelectedColors();
	}

	/**
	 * Appends the color picker view.
	 */
	private _appendColorPicker(): void {
		if ( this.items.length === 2 ) {
			return;
		}

		this.items.add( this.colorPickerPageView );

		if ( this.colorGridsPageView.colorPickerButtonView ) {
			this.colorGridsPageView.colorPickerButtonView.on( 'execute', () => {
				this.showColorPicker();
			} );
		}

		this.colorGridsPageView.addColorPickerButton();
		this.colorPickerPageView.delegate( 'execute' ).to( this );
		this.colorPickerPageView.delegate( 'cancel' ).to( this );
	}
}

/**
 * A class which represents a view with the following sub–components:
 *
 * * A remove color button,
 * * A static {@link module:ui/colorgrid/colorgridview~ColorGridView} of colors defined in the configuration,
 * * A dynamic {@link module:ui/colorgrid/colorgridview~ColorGridView} of colors used in the document.
 * * If color picker is configured, the "Color Picker" button is visible too.
 */
class ColorGridsPageView extends View {
	/**
	 * A collection of the children of the table.
	 */
	public readonly items: ViewCollection;

	/**
	 * An array with objects representing colors to be displayed in the grid.
	 */
	public colorDefinitions: Array<ColorDefinition>;

	/**
	 * Tracks information about the DOM focus in the list.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * The number of columns in the color grid.
	 */
	public columns: number;

	/**
	 * A collection of definitions that store the document colors.
	 *
	 * @readonly
	 */
	public documentColors: DocumentColorCollection;

	/**
	 * The maximum number of colors in the document colors section.
	 * If it equals 0, the document colors section is not added.
	 *
	 * @readonly
	 */
	public documentColorsCount?: number;

	/**
	 * Keeps the value of the command associated with the table for the current selection.
	 */
	declare public selectedColor: string;

	/**
	 * Preserves the reference to {@link module:ui/colorgrid/colorgridview~ColorGridView} used to create
	 * the default (static) color set.
	 *
	 * The property is loaded once the the parent dropdown is opened the first time.
	 *
	 * @readonly
	 */
	public staticColorsGrid: ColorGridView | undefined;

	/**
	 * Preserves the reference to {@link module:ui/colorgrid/colorgridview~ColorGridView} used to create
	 * the document colors. It remains undefined if the document colors feature is disabled.
	 *
	 * The property is loaded once the the parent dropdown is opened the first time.
	 *
	 * @readonly
	 */
	public documentColorsGrid: ColorGridView | undefined;

	/**
	 * The "Color picker" button view.
	 */
	public colorPickerButtonView?: ButtonView;

	/**
	 * The "Remove color" button view.
	 */
	public removeColorButtonView: ButtonView;

	/**
	 * The property which is responsible for is component visible or not.
	 */
	declare public isVisible: boolean;

	/**
	 * A collection of views that can be focused in the view.
	 *
	 * @readonly
	 */
	protected _focusables: ViewCollection;

	/**
	 * Document color section's label.
	 *
	 * @readonly
	 */
	private _documentColorsLabel?: string;

	/**
	 * The label of the button responsible for removing color attributes.
	 */
	private _removeButtonLabel: string;

	/**
	 * The label of the button responsible for switching to the color picker component.
	 */
	public _colorPickerLabel: string;

	/**
	 * Creates a view to be inserted as a child of {@link module:ui/dropdown/dropdownview~DropdownView}.
	 *
	 * @param locale The localization services instance.
	 * @param colors An array with definitions of colors to be displayed in the table.
	 * @param columns The number of columns in the color grid.
	 * @param removeButtonLabel The label of the button responsible for removing the color.
	 * @param colorPickerLabel The label of the button responsible for color picker appearing.
	 * @param documentColorsLabel The label for the section with the document colors.
	 * @param documentColorsCount The number of colors in the document colors section inside the color dropdown.
	 * @param focusTracker Tracks information about the DOM focus in the list.
	 * @param focusables A collection of views that can be focused in the view.
	 */
	constructor(
		locale: Locale,
		{
			colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount,
			colorPickerLabel, focusTracker, focusables
		}: {
			colors: Array<ColorDefinition>;
			columns: number;
			removeButtonLabel: string;
			colorPickerLabel: string;
			documentColorsLabel?: string;
			documentColorsCount?: number;
			focusTracker: FocusTracker;
			focusables: ViewCollection;
		}
	) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'isVisible', true );

		this.focusTracker = focusTracker;
		this.items = this.createCollection();
		this.colorDefinitions = colors;
		this.columns = columns;
		this.documentColors = new DocumentColorCollection();
		this.documentColorsCount = documentColorsCount;

		this._focusables = focusables;
		this._removeButtonLabel = removeButtonLabel;
		this._colorPickerLabel = colorPickerLabel;
		this._documentColorsLabel = documentColorsLabel;

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck-color-grids-page-view',
					bind.if( 'isVisible', 'ck-hidden', value => !value )
				]
			},
			children: this.items
		} );

		this.removeColorButtonView = this._createRemoveColorButton();

		this.items.add( this.removeColorButtonView );
	}

	/**
	 * Scans through the editor model and searches for text node attributes with the given attribute name.
	 * Found entries are set as document colors.
	 *
	 * All the previously stored document colors will be lost in the process.
	 *
	 * @param model The model used as a source to obtain the document colors.
	 * @param attributeName Determines the name of the related model's attribute for a given dropdown.
	 */
	public updateDocumentColors( model: Model, attributeName: string ): void {
		const document = model.document;
		const maxCount = this.documentColorsCount;

		this.documentColors.clear();

		for ( const rootName of document.getRootNames() ) {
			const root = document.getRoot( rootName )!;
			const range = model.createRangeIn( root );

			for ( const node of range.getItems() ) {
				if ( node.is( '$textProxy' ) && node.hasAttribute( attributeName ) ) {
					this._addColorToDocumentColors( node.getAttribute( attributeName ) as string );

					if ( this.documentColors.length >= maxCount! ) {
						return;
					}
				}
			}
		}
	}

	/**
	 * Refreshes the state of the selected color in one or both {@link module:ui/colorgrid/colorgridview~ColorGridView}s
	 * available in the {@link module:font/ui/colortableview~ColorTableView}. It guarantees that the selection will occur only in one
	 * of them.
	 */
	public updateSelectedColors(): void {
		const documentColorsGrid = this.documentColorsGrid;
		const staticColorsGrid = this.staticColorsGrid!;
		const selectedColor = this.selectedColor;

		staticColorsGrid.selectedColor = selectedColor;

		if ( documentColorsGrid ) {
			documentColorsGrid.selectedColor = selectedColor;
		}
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.staticColorsGrid = this._createStaticColorsGrid();

		this.items.add( this.staticColorsGrid );

		if ( this.documentColorsCount ) {
			// Create a label for document colors.
			const bind = Template.bind( this.documentColors, this.documentColors );
			const label = new LabelView( this.locale );
			label.text = this._documentColorsLabel;
			label.extendTemplate( {
				attributes: {
					class: [
						'ck',
						'ck-color-grid__label',
						bind.if( 'isEmpty', 'ck-hidden' )
					]
				}
			} );
			this.items.add( label );
			this.documentColorsGrid = this._createDocumentColorsGrid();

			this.items.add( this.documentColorsGrid );
		}
		this._createColorPickerButton();

		this._addColorTablesElementsToFocusTracker();
		this.focus();
	}

	/**
	 * Focuses the component.
	 */
	public focus(): void {
		this.removeColorButtonView.focus();
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();
	}

	/**
	 * Handles displaying the color picker button (if it was previously created) and making it focusable.
	 */
	public addColorPickerButton(): void {
		if ( this.colorPickerButtonView ) {
			this.items.add( this.colorPickerButtonView );
			this.focusTracker.add( this.colorPickerButtonView.element! );
			this._focusables.add( this.colorPickerButtonView );
		}
	}

	/**
	 * Adds color table elements to focus tracker.
	 */
	private _addColorTablesElementsToFocusTracker(): void {
		this.focusTracker.add( this.removeColorButtonView.element! );
		this._focusables.add( this.removeColorButtonView );

		if ( this.staticColorsGrid ) {
			this.focusTracker.add( this.staticColorsGrid.element! );
			this._focusables.add( this.staticColorsGrid );
		}

		if ( this.documentColorsGrid ) {
			this.focusTracker.add( this.documentColorsGrid.element! );
			this._focusables.add( this.documentColorsGrid );
		}
	}

	/**
	 * Creates the button responsible for displaying the color picker component.
	 */
	private _createColorPickerButton(): void {
		this.colorPickerButtonView = new ButtonView();

		this.colorPickerButtonView.set( {
			label: this._colorPickerLabel,
			withText: true,
			icon: uiIcons.colorPaletteIcon,
			class: 'ck-color-table__color-picker'
		} );

		this.colorPickerButtonView.on( 'execute', () => {
			this.fire<ColorTableShowColorPickerEvent>( 'showColorPicker' );
		} );
	}

	/**
	 * Adds the remove color button as a child of the current view.
	 */
	private _createRemoveColorButton(): ButtonView {
		const buttonView = new ButtonView();

		buttonView.set( {
			withText: true,
			icon: icons.eraser,
			label: this._removeButtonLabel
		} );

		buttonView.class = 'ck-color-table__remove-color';
		buttonView.on( 'execute', () => {
			this.fire( 'execute', {
				value: null,
				source: 'removeColorButton'
			} );
		} );

		buttonView.render();

		return buttonView;
	}

	/**
	 * Creates a static color table grid based on the editor configuration.
	 */
	private _createStaticColorsGrid(): ColorGridView {
		const colorGrid = new ColorGridView( this.locale, {
			colorDefinitions: this.colorDefinitions,
			columns: this.columns
		} );

		colorGrid.on( 'execute', ( evt, data ) => {
			this.fire<ColorTableExecuteEvent>( 'execute', {
				value: data.value,
				source: 'staticColorsGrid'
			} );
		} );

		return colorGrid;
	}

	/**
	 * Creates the document colors section view and binds it to {@link #documentColors}.
	 */
	private _createDocumentColorsGrid(): ColorGridView {
		const bind = Template.bind( this.documentColors, this.documentColors );
		const documentColorsGrid = new ColorGridView( this.locale, {
			columns: this.columns
		} );

		documentColorsGrid.extendTemplate( {
			attributes: {
				class: bind.if( 'isEmpty', 'ck-hidden' )
			}
		} );

		documentColorsGrid.items.bindTo( this.documentColors ).using(
			colorObj => {
				const colorTile = new ColorTileView();

				colorTile.set( {
					color: colorObj.color,
					hasBorder: colorObj.options && colorObj.options.hasBorder
				} );

				if ( colorObj.label ) {
					colorTile.set( {
						label: colorObj.label,
						tooltip: true
					} );
				}

				colorTile.on( 'execute', () => {
					this.fire<ColorTableExecuteEvent>( 'execute', {
						value: colorObj.color,
						source: 'documentColorsGrid'
					} );
				} );

				return colorTile;
			}
		);

		// Selected color should be cleared when document colors became empty.
		this.documentColors.on( 'change:isEmpty', ( evt, name, val ) => {
			if ( val ) {
				documentColorsGrid.selectedColor = null;
			}
		} );

		return documentColorsGrid;
	}

	/**
	 * Adds a given color to the document colors list. If possible, the method will attempt to use
	 * data from the {@link #colorDefinitions} (label, color options).
	 *
	 * @param color A string that stores the value of the recently applied color.
	 */
	private _addColorToDocumentColors( color: string ): void {
		const predefinedColor = this.colorDefinitions
			.find( definition => definition.color === color );

		if ( !predefinedColor ) {
			this.documentColors.add( {
				color,
				label: color,
				options: {
					hasBorder: false
				}
			} );
		} else {
			this.documentColors.add( Object.assign( {}, predefinedColor ) );
		}
	}
}

/**
 * A class which represents a color picker component view with the following sub–components:
 *
 * * Color picker saturation and hue sliders,
 * * Input accepting colors in HEX format,
 * * "Save" and "Cancel" action buttons.
 */
class ColorPickerPageView extends View {
	/**
	 * A collection of component's children.
	 */
	public readonly items: ViewCollection;

	/**
	 * A view with saturation and hue sliders and color input.
	 */
	public colorPickerView?: ColorPickerView;

	/**
	 * The "Save" button view.
	 */
	public saveButtonView: ButtonView;

	/**
	 * The "Cancel" button view.
	 */
	public cancelButtonView: ButtonView;

	/**
	 * The action bar where are "Save" button and "Cancel" button.
	 */
	public actionBarView: View;

	/**
	 * Tracks information about the DOM focus in the list.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * Indicates whether the component is visible or not.
	 */
	declare public isVisible: boolean;

	/**
	 * Keeps the value of the command associated with the component for the current selection.
	 */
	declare public selectedColor?: string;

	/**
	 * A collection of views that can be focused in the view.
	 *
	 * @readonly
	 */
	protected _focusables: ViewCollection;

	/**
	 * Color picker's config.
	 *
	 * @readonly
	 */
	private _pickerConfig: ColorPickerConfig | false;

	/**
	 * @param locale The localization services instance.
	 * @param focusTracker Tracks information about the DOM focus in the list.
	 * @param focusables A collection of views that can be focused in the view..
	 * @param keystrokes An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 * @param colorPickerConfig The configuration of color picker feature.
	 */
	constructor(
		locale: Locale,
		{
			focusTracker,
			focusables,
			keystrokes,
			colorPickerConfig
		}:
			{
				focusTracker: FocusTracker;
				focusables: ViewCollection;
				keystrokes: KeystrokeHandler;
				colorPickerConfig: ColorPickerConfig | false;
			}
	) {
		super( locale );

		this.items = this.createCollection();
		this.focusTracker = focusTracker;
		this.keystrokes = keystrokes;

		this.set( 'isVisible', false );
		this.set( 'selectedColor', undefined );

		this._focusables = focusables;
		this._pickerConfig = colorPickerConfig;

		const bind = this.bindTemplate;
		const { saveButtonView, cancelButtonView } = this._createActionButtons();

		this.saveButtonView = saveButtonView;
		this.cancelButtonView = cancelButtonView;
		this.actionBarView = this._createActionBarView( { saveButtonView, cancelButtonView } );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck-color-picker-page-view',
					bind.if( 'isVisible', 'ck-hidden', value => !value )
				]
			},
			children: this.items
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		const colorPickerView = new ColorPickerView( this.locale, this._pickerConfig as ColorPickerConfig );

		this.colorPickerView = colorPickerView;
		this.colorPickerView.render();

		if ( this.selectedColor ) {
			colorPickerView.color = this.selectedColor;
		}

		this.listenTo( this, 'change:selectedColor', ( evt, name, value ) => {
			colorPickerView.color = value;
		} );

		this.items.add( this.colorPickerView );
		this.items.add( this.actionBarView );

		this._addColorPickersElementsToFocusTracker();
		this._stopPropagationOnArrowsKeys();
		this._executeOnEnterPress();
		this._executeUponColorChange();
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();
	}

	/**
	 * Focuses the color picker.
	 */
	public focus(): void {
		this.colorPickerView!.focus();
	}

	/**
	 * When color picker is focused and "enter" is pressed it executes command.
	 */
	private _executeOnEnterPress(): void {
		this.keystrokes.set( 'enter', evt => {
			if ( this.isVisible && this.focusTracker.focusedElement !== this.cancelButtonView.element ) {
				this.fire( 'execute', {
					value: this.selectedColor!
				} );

				evt.stopPropagation();
				evt.preventDefault();
			}
		} );
	}

	/**
	 * Removes default behavior of arrow keys in dropdown.
	 */
	private _stopPropagationOnArrowsKeys(): void {
		const stopPropagation = ( data: KeyboardEvent ) => data.stopPropagation();

		this.keystrokes.set( 'arrowright', stopPropagation );
		this.keystrokes.set( 'arrowleft', stopPropagation );
		this.keystrokes.set( 'arrowup', stopPropagation );
		this.keystrokes.set( 'arrowdown', stopPropagation );
	}

	/**
	 * Adds color picker elements to focus tracker.
	 */
	private _addColorPickersElementsToFocusTracker(): void {
		for ( const slider of this.colorPickerView!.slidersView ) {
			this.focusTracker.add( slider.element! );
			this._focusables.add( slider );
		}

		this.focusTracker.add( this.colorPickerView!.hexInputRow.children.get( 1 )!.element! );
		this._focusables.add( this.colorPickerView!.hexInputRow.children.get( 1 )! );

		this.focusTracker.add( this.saveButtonView.element! );
		this._focusables.add( this.saveButtonView );

		this.focusTracker.add( this.cancelButtonView.element! );
		this._focusables.add( this.cancelButtonView );
	}

	/**
	 * Creates bar containing "Save" and "Cancel" buttons.
	 */
	private _createActionBarView( { saveButtonView, cancelButtonView }: {
		saveButtonView: ButtonView;
		cancelButtonView: ButtonView;
	} ): View {
		const actionBarRow = new View();
		const children = this.createCollection();

		children.add( saveButtonView );
		children.add( cancelButtonView );

		actionBarRow.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-color-table_action-bar'
				]
			},
			children
		} );

		return actionBarRow;
	}

	/**
	 * Creates "Save" and "Cancel" buttons.
	 */
	private _createActionButtons() {
		const locale = this.locale;
		const t = locale!.t;
		const saveButtonView = new ButtonView( locale );
		const cancelButtonView = new ButtonView( locale );

		saveButtonView.set( {
			icon: icons.check,
			class: 'ck-button-save',
			withText: false,
			label: t( 'Accept' ),
			type: 'submit'
		} );

		cancelButtonView.set( {
			icon: icons.cancel,
			class: 'ck-button-cancel',
			withText: false,
			label: t( 'Cancel' )
		} );

		saveButtonView.on( 'execute', () => {
			this.fire<ColorTableExecuteEvent>( 'execute', {
				source: 'saveButton',
				value: this.selectedColor!
			} );
		} );

		cancelButtonView.on( 'execute', () => {
			this.fire<ColorTableCancelEvent>( 'cancel' );
		} );

		return {
			saveButtonView, cancelButtonView
		};
	}

	/**
	 * Fires the `execute` event if color in color picker changed.
	 *
	 * @fires execute
	 */
	private _executeUponColorChange() {
		this.colorPickerView!.on( 'change:color', ( evt, evtName, newValue ) => {
			this.fire<ColorTableExecuteEvent>( 'execute', {
				value: newValue,
				source: 'colorPicker'
			} );
		} );
	}
}

/**
 * Fired whenever the color was changed.
 *
 * @eventName ~ColorTableView#execute
 */
export type ColorTableExecuteEvent = {
	name: 'execute';
	args: [ {
		value: string;
		source: 'staticColorsGrid' | 'documentColorsGrid' | 'removeColorButton' | 'colorPicker' | 'saveButton';
	} ];
};

/**
 * Fired whenever color changes should be canceled.
 *
 * @eventName ~ColorTableView#cancel
 */
export type ColorTableCancelEvent = {
	name: 'cancel';
	args: [];
};

/**
 * Fired whenever color picker will be shown.
 *
 * @eventName ~ColorTableView#showColorPicker
 */
export type ColorTableShowColorPickerEvent = {
	name: 'showColorPicker';
	args: [];
};
