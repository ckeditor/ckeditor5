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
	ColorPaletteIcon,
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
 * * A remove color button,
 * * A static {@link module:ui/colorgrid/colorgridview~ColorGridView} of colors defined in the configuration,
 * * A dynamic {@link module:ui/colorgrid/colorgridview~ColorGridView} of colors used in the document.
 */
export default class ColorTableView extends View {
	/**
	 * A collection of components.
	 */
	public readonly components: ViewCollection;

	/**
	 * A collection of the children of the color picker component.
	 */
	public readonly colorPickerComponentChildren: ViewCollection;

	/**
	 * A collection of the children of the color table component.
	 */
	public readonly colorTableComponentChildren: ViewCollection;

	/**
	 * An array with objects representing colors to be displayed in the grid.
	 */
	public colorDefinitions: Array<ColorDefinition>;

	/**
	 * Tracks information about the DOM focus in the list.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * The label of the button responsible for removing color attributes.
	 */
	public removeButtonLabel: string;

	/**
	 * The label of the button responsible for removing color attributes.
	 */
	public colorPickerLabel: string;

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
	 * Color picker allows to select custom colors.
	 *
	 */
	public colorPickerView?: ColorPickerView;

	/**
	 * A collection of views that can be focused in the view.
	 *
	 * @readonly
	 */
	protected _focusables: ViewCollection;

	/**
	 * Helps cycling over focusable {@link #items} in the list.
	 *
	 * @readonly
	 */
	protected _focusCycler: FocusCycler;

	/**
	 * Document color section's label.
	 *
	 * @readonly
	 */
	private _documentColorsLabel?: string;

	/**
	 * Keeps the value of the command associated with the table for the current selection.
	 */
	declare public selectedColor?: string;

	/**
	 * Keeps the original color value from current selection which is assign while dropdown is opening.
	 */
	declare public originalColor?: string;

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
	 * The "Save" button view.
	 */
	public saveButtonView: ButtonView;

	/**
	 * The "Cancel" button view.
	 */
	public cancelButtonView: ButtonView;

	/**
	 * The action bar where are "save button" and "cancel button".
	 */
	public actionBarView: View;

	/**
	 * The "Color picker" button view. When you click on it, appeares color picker view.
	 */
	public colorPickerButtonView: ButtonView;

	/**
	 * The "Remove color" button view.
	 */
	public removeColorButtonView: ButtonView;

	/**
	 * The "Color picker" component. Contains color picker itself with input and action buttons as
	 * "save" and "cancel" buttons.
	 */
	public colorPickerComponent: View;

	/**
	 * The "Color table" component. Contains "remove color" button ,"color grid" view, "document color
	 * grid" view. Also depanding on is color picker turn on or off, could be appeared the "color picker"
	 * button.
	 */
	public colorTableComponent: View;

	/**
	 * State of the "Color table" component visibility.
	 */
	declare public isColorTableVisible: boolean;

	/**
	 * State of the "Color picker" component visibility.
	 */
	declare public isColorPickerVisible: boolean;

	/**
	 * Creates a view to be inserted as a child of {@link module:ui/dropdown/dropdownview~DropdownView}.
	 *
	 * @param locale The localization services instance.
	 * @param colors An array with definitions of colors to be displayed in the table.
	 * @param columns The number of columns in the color grid.
	 * @param removeButtonLabel The label of the button responsible for removing the color.
	 * @param documentColorsLabel The label for the section with the document colors.
	 * @param documentColorsCount The number of colors in the document colors section inside the color dropdown.
	 */
	constructor(
		locale: Locale,
		{ colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount, colorPickerLabel }: {
			colors: Array<ColorDefinition>;
			columns: number;
			removeButtonLabel: string;
			colorPickerLabel: string;
			documentColorsLabel?: string;
			documentColorsCount?: number;
		}
	) {
		super( locale );
		this.components = this.createCollection();
		this.colorPickerComponentChildren = this.createCollection();
		this.colorTableComponentChildren = this.createCollection();
		this.colorDefinitions = colors;
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		this.set( 'isColorTableVisible', true );
		this.set( 'isColorPickerVisible', false );

		this.set( 'selectedColor', undefined );

		this.colorTableComponent = this._createColorTableComponent();
		this.removeButtonLabel = removeButtonLabel;
		this.colorPickerLabel = colorPickerLabel;
		this.columns = columns;
		this.documentColors = new DocumentColorCollection();
		this.documentColorsCount = documentColorsCount;

		// Color picker elements
		const { saveButtonView, cancelButtonView } = this._createActionButtons();
		this.saveButtonView = saveButtonView;
		this.cancelButtonView = cancelButtonView;
		this.actionBarView = this._createAtionBarView( { saveButtonView, cancelButtonView } );
		this.colorPickerButtonView = new ButtonView();
		this.colorPickerComponent = this._createColorPickerComponent();

		this._focusables = new ViewCollection();

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

		this._documentColorsLabel = documentColorsLabel;

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-color-table'
				]
			},
			children: this.components
		} );

		this.removeColorButtonView = this._createRemoveColorButton();
		this.colorTableComponentChildren.add( this.removeColorButtonView );
		this.components.add( this.colorTableComponent );
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
	 * Appends {@link #staticColorsGrid} and {@link #documentColorsGrid} views.
	 */
	public appendGrids(): void {
		if ( this.staticColorsGrid ) {
			return;
		}

		this.staticColorsGrid = this._createStaticColorsGrid();

		this.colorTableComponentChildren.add( this.staticColorsGrid );
		this.focusTracker.add( this.staticColorsGrid.element! );
		this._focusables.add( this.staticColorsGrid );

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
			this.colorTableComponentChildren.add( label );
			this.documentColorsGrid = this._createDocumentColorsGrid();

			this.colorTableComponentChildren.add( this.documentColorsGrid );
			this.focusTracker.add( this.documentColorsGrid.element! );
			this._focusables.add( this.documentColorsGrid );
		}
	}

	/**
	 * Appends {@link #colorPickerView} view.
	 */
	public appendColorPicker( pickerConfig: ColorPickerConfig ): void {
		if ( this.colorPickerView ) {
			return;
		}

		this._createColorPickerButton();

		const colorPickerView = new ColorPickerView( this.locale, pickerConfig );

		this.colorPickerView = colorPickerView;
		this.colorPickerView.render();

		this.listenTo( this, 'change:selectedColor', ( evt, name, value ) => {
			colorPickerView.color = value;
		} );

		this.colorPickerComponentChildren.add( this.colorPickerView );

		this._addColorPickersElementsToFocusTracker();

		this.colorPickerComponentChildren.add( this.actionBarView );

		this.components.add( this.colorPickerComponent );

		this.focusTracker.add( this.saveButtonView.element! );
		this._focusables.add( this.saveButtonView );

		this.focusTracker.add( this.cancelButtonView.element! );
		this._focusables.add( this.cancelButtonView );

		this._stopPropagationOnArrowsKeys();
	}

	/**
	 * Show "Color picker" and hide "Color table".
	 */
	public showColorPicker(): void {
		this.set( 'isColorPickerVisible', true );

		/**
		 * Focuses the first pointer in color picker.
		 */
		if ( this.colorPickerView ) {
			const firstSlider = this.colorPickerView.slidersView.get( 0 ) as View & { focus: () => void };
			firstSlider.focus();
		}
		this.set( 'isColorTableVisible', false );
	}

	/**
	 * Show "Color table" and hide "Color picker".
	 */
	public showColorTable(): void {
		this.set( 'isColorTableVisible', true );
		this.removeColorButtonView.focus();
		this.set( 'isColorPickerVisible', false );
	}

	/**
	 * Adds color picker elements to focus tracker.
	 */
	private _addColorPickersElementsToFocusTracker(): void {
		for ( const slider of this.colorPickerView!.slidersView ) {
			this.focusTracker.add( slider.element! );
			this._focusables.add( slider );
		}

		this.focusTracker.add( this.colorPickerView!.input.element! );
		this._focusables.add( this.colorPickerView!.input );
	}

	/**
	 * Remove default behavior of arrow keys in dropdown.
	 */
	private _stopPropagationOnArrowsKeys(): void {
		const stopPropagation = ( data: KeyboardEvent ) => data.stopPropagation();

		this.keystrokes.set( 'arrowright', stopPropagation );
		this.keystrokes.set( 'arrowleft', stopPropagation );
		this.keystrokes.set( 'arrowup', stopPropagation );
		this.keystrokes.set( 'arrowdown', stopPropagation );
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
	 * Adds the remove color button as a child of the current view.
	 */
	private _createRemoveColorButton(): ButtonView {
		const buttonView = new ButtonView();

		buttonView.set( {
			withText: true,
			icon: icons.eraser,
			label: this.removeButtonLabel
		} );

		buttonView.class = 'ck-color-table__remove-color';
		buttonView.on( 'execute', () => {
			this.fire( 'execute', { value: null } );
		} );

		buttonView.render();

		this.focusTracker.add( buttonView.element! );
		this._focusables.add( buttonView );

		return buttonView;
	}

	/**
	 * Creates bar with "save" and "cancel" buttons in it.
	 */
	private _createAtionBarView( { saveButtonView, cancelButtonView }: {
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
	 * Creates "save" and "cancel" buttons.
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
			this.fire( 'execute', {
				value: this.selectedColor
			} );
		} );

		cancelButtonView.on( 'execute', () => {
			this.selectedColor = this.originalColor;
			this.fire( 'execute', {
				value: this.originalColor
			} );
		} );

		return {
			saveButtonView, cancelButtonView
		};
	}

	/**
	 * Creates "color picker" button.
	 */
	private _createColorPickerButton(): void {
		this.colorPickerButtonView.set( {
			label: this.colorPickerLabel,
			withText: true,
			icon: ColorPaletteIcon,
			class: 'ck-color-table__color-picker'
		} );

		this.colorTableComponentChildren.add( this.colorPickerButtonView );
		this.focusTracker.add( this.colorPickerButtonView.element! );
		this._focusables.add( this.colorPickerButtonView );

		this.colorPickerButtonView.on( 'execute', () => {
			this.showColorPicker();
		} );
	}

	/**
	 * Creates a static color table grid based on the editor configuration.
	 */
	private _createStaticColorsGrid(): ColorGridView {
		const colorGrid = new ColorGridView( this.locale, {
			colorDefinitions: this.colorDefinitions,
			columns: this.columns
		} );

		colorGrid.delegate( 'execute' ).to( this );

		return colorGrid;
	}

	/**
	 * Creates a "Color picker" component.
	 */
	private _createColorPickerComponent(): View {
		const view = new View();
		const bind = Template.bind( this, view );

		view.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck-color-picker-component',
					bind.if( 'isColorPickerVisible', 'ck-hidden', value => !value )
				]
			},
			children: this.colorPickerComponentChildren
		} );

		return view;
	}

	/**
	 * Creates a "Color table" component.
	 */
	private _createColorTableComponent(): View {
		const view = new View();
		const bind = Template.bind( this, view );

		view.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck-color-table-component',
					bind.if( 'isColorTableVisible', 'ck-hidden', value => !value )
				]
			},
			children: this.colorTableComponentChildren
		} );

		return view;
	}

	/**
	 * Creates the document colors section view and binds it to {@link #documentColors}.
	 */
	private _createDocumentColorsGrid(): ColorGridView {
		const bind = Template.bind( this.documentColors, this.documentColors );
		const documentColorsGrid = new ColorGridView( this.locale, {
			columns: this.columns
		} );

		documentColorsGrid.delegate( 'execute' ).to( this );

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
					this.fire( 'execute', {
						value: colorObj.color
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
