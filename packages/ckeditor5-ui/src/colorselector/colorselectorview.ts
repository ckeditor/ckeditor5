/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/colorselector/colorselectorview
 */

import FocusCycler, { type FocusableView } from '../focuscycler.js';
import View from '../view.js';
import ViewCollection from '../viewcollection.js';
import { FocusTracker, KeystrokeHandler, type Locale } from '@ckeditor/ckeditor5-utils';

import type { ColorPickerViewConfig } from '../colorpicker/utils.js';
import type { ColorDefinition } from '../colorgrid/colorgridview.js';
import type { Model } from '@ckeditor/ckeditor5-engine';

import ColorGridsFragmentView from './colorgridsfragmentview.js';
import ColorPickerFragmentView from './colorpickerfragmentview.js';

import '../../theme/components/colorselector/colorselector.css';

/**
 * The configurable color selector view class. It allows users to select colors from a predefined set of colors as well as from
 * a color picker.
 *
 * This meta-view is is made of two components (fragments):
 *
 * * {@link module:ui/colorselector/colorselectorview~ColorSelectorView#colorGridsFragmentView},
 * * {@link module:ui/colorselector/colorselectorview~ColorSelectorView#colorPickerFragmentView}.
 *
 * ```ts
 * const colorDefinitions = [
 * 	{ color: '#000', label: 'Black', options: { hasBorder: false } },
 * 	{ color: 'rgb(255, 255, 255)', label: 'White', options: { hasBorder: true } },
 * 	{ color: 'red', label: 'Red', options: { hasBorder: false } }
 * ];
 *
 * const selectorView = new ColorSelectorView( locale, {
 * 	colors: colorDefinitions,
 * 	columns: 5,
 * 	removeButtonLabel: 'Remove color',
 * 	documentColorsLabel: 'Document colors',
 * 	documentColorsCount: 4,
 * 	colorPickerViewConfig: {
 * 		format: 'hsl'
 * 	}
 * } );
 *
 * selectorView.appendUI();
 * selectorView.selectedColor = 'red';
 * selectorView.updateSelectedColors();
 *
 * selectorView.on<ColorSelectorExecuteEvent>( 'execute', ( evt, data ) => {
 * 	console.log( 'Color changed', data.value, data.source );
 * } );
 *
 * selectorView.on<ColorSelectorColorPickerShowEvent>( 'colorPicker:show', ( evt ) => {
 * 	console.log( 'Color picker showed up', evt );
 * } );
 *
 * selectorView.on<ColorSelectorColorPickerCancelEvent>( 'colorPicker:cancel', ( evt ) => {
 * 	console.log( 'Color picker cancel', evt );
 * } );
 *
 * selectorView.render();
 *
 * document.body.appendChild( selectorView.element );
 * ```
 */
export default class ColorSelectorView extends View {
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
	 * A fragment that allows users to select colors from the a predefined set and from existing document colors.
	 */
	public readonly colorGridsFragmentView: ColorGridsFragmentView;

	/**
	 * A fragment that allows users to select a color from a color picker.
	 */
	public readonly colorPickerFragmentView: ColorPickerFragmentView;

	/**
	 * Keeps the value of the command associated with the component for the current selection.
	 */
	declare public selectedColor?: string;

	/**
	 * Reflects the visibility state of the color grids fragment.
	 *
	 * @internal
	 */
	declare public _isColorGridsFragmentVisible: boolean;

	/**
	 * Reflects the visibility state of the color picker fragment.
	 *
	 * @internal
	 */
	declare public _isColorPickerFragmentVisible: boolean;

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
	protected _focusables: ViewCollection<FocusableView>;

	/**
	 * The configuration of color picker sub-component.
	 */
	private _colorPickerViewConfig: ColorPickerViewConfig | false;

	/**
	 * Creates a view to be inserted as a child of {@link module:ui/dropdown/dropdownview~DropdownView}.
	 *
	 * @param locale The localization services instance.
	 * @param options Constructor options.
	 * @param options.colors An array with definitions of colors to be displayed in the table.
	 * @param options.columns The number of columns in the color grid.
	 * @param options.removeButtonLabel The label of the button responsible for removing the color.
	 * @param options.colorPickerLabel The label of the button responsible for color picker appearing.
	 * @param options.documentColorsLabel The label for the section with the document colors.
	 * @param options.documentColorsCount The number of colors in the document colors section inside the color dropdown.
	 * @param options.colorPickerViewConfig The configuration of color picker feature. If set to `false`, the color picker will be hidden.
	 */
	constructor(
		locale: Locale,
		{
			colors,
			columns,
			removeButtonLabel,
			documentColorsLabel,
			documentColorsCount,
			colorPickerLabel,
			colorPickerViewConfig
		}: {
			colors: Array<ColorDefinition>;
			columns: number;
			removeButtonLabel: string;
			documentColorsLabel?: string;
			documentColorsCount?: number;
			colorPickerLabel: string;
			colorPickerViewConfig: ColorPickerViewConfig | false;
		}
	) {
		super( locale );
		this.items = this.createCollection();

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		this._focusables = new ViewCollection();
		this._colorPickerViewConfig = colorPickerViewConfig;
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

		this.colorGridsFragmentView = new ColorGridsFragmentView( locale, {
			colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount, colorPickerLabel,
			focusTracker: this.focusTracker,
			focusables: this._focusables
		} );

		this.colorPickerFragmentView = new ColorPickerFragmentView( locale, {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokes: this.keystrokes,
			colorPickerViewConfig
		} );

		this.set( '_isColorGridsFragmentVisible', true );
		this.set( '_isColorPickerFragmentVisible', false );

		this.set( 'selectedColor', undefined );

		this.colorGridsFragmentView.bind( 'isVisible' ).to( this, '_isColorGridsFragmentVisible' );
		this.colorPickerFragmentView.bind( 'isVisible' ).to( this, '_isColorPickerFragmentVisible' );

		/**
		 * This is kind of bindings. Unfortunately we could not use this.bind() method because the same property
		 * cannot be bound twice. So this is work around how to bind 'selectedColor' property between components.
		 */
		this.on( 'change:selectedColor', ( evt, evtName, data ) => {
			this.colorGridsFragmentView.set( 'selectedColor', data );
			this.colorPickerFragmentView.set( 'selectedColor', data );
		} );

		this.colorGridsFragmentView.on( 'change:selectedColor', ( evt, evtName, data ) => {
			this.set( 'selectedColor', data );
		} );

		this.colorPickerFragmentView.on( 'change:selectedColor', ( evt, evtName, data ) => {
			this.set( 'selectedColor', data );
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-color-selector'
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
	 * Renders the internals of the component on demand:
	 * * {@link #colorPickerFragmentView},
	 * * {@link #colorGridsFragmentView}.
	 *
	 * It allows for deferring component initialization to improve the performance.
	 *
	 * See {@link #showColorPickerFragment}, {@link #showColorGridsFragment}.
	 */
	public appendUI(): void {
		this._appendColorGridsFragment();

		if ( this._colorPickerViewConfig ) {
			this._appendColorPickerFragment();
		}
	}

	/**
	 * Shows the {@link #colorPickerFragmentView} and hides the {@link #colorGridsFragmentView}.
	 *
	 * **Note**: It requires {@link #appendUI} to be called first.
	 *
	 * See {@link #showColorGridsFragment}, {@link ~ColorSelectorView#event:colorPicker:show}.
	 */
	public showColorPickerFragment(): void {
		if ( !this.colorPickerFragmentView.colorPickerView || this._isColorPickerFragmentVisible ) {
			return;
		}

		this._isColorPickerFragmentVisible = true;
		this.colorPickerFragmentView.focus();
		this.colorPickerFragmentView.resetValidationStatus();
		this._isColorGridsFragmentVisible = false;
	}

	/**
	 * Shows the {@link #colorGridsFragmentView} and hides the {@link #colorPickerFragmentView}.
	 *
	 * See {@link #showColorPickerFragment}.
	 *
	 * **Note**: It requires {@link #appendUI} to be called first.
	 */
	public showColorGridsFragment(): void {
		if ( this._isColorGridsFragmentVisible ) {
			return;
		}

		this._isColorGridsFragmentVisible = true;
		this.colorGridsFragmentView.focus();
		this._isColorPickerFragmentVisible = false;
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
	 * Scans through the editor model and searches for text node attributes with the given `attributeName`.
	 * Found entries are set as document colors in {@link #colorGridsFragmentView}.
	 *
	 * All the previously stored document colors will be lost in the process.
	 *
	 * @param model The model used as a source to obtain the document colors.
	 * @param attributeName Determines the name of the related model's attribute for a given dropdown.
	 */
	public updateDocumentColors( model: Model, attributeName: string ): void {
		this.colorGridsFragmentView.updateDocumentColors( model, attributeName );
	}

	/**
	 * Refreshes the state of the selected color in one or both grids located in {@link #colorGridsFragmentView}.
	 *
	 * It guarantees that the selection will occur only in one of them.
	 */
	public updateSelectedColors(): void {
		this.colorGridsFragmentView.updateSelectedColors();
	}

	/**
	 * Appends the view containing static and document color grid views.
	 */
	private _appendColorGridsFragment(): void {
		if ( this.items.length ) {
			return;
		}

		this.items.add( this.colorGridsFragmentView );
		this.colorGridsFragmentView.delegate( 'execute' ).to( this );
		this.colorGridsFragmentView.delegate( 'colorPicker:show' ).to( this );
	}

	/**
	 * Appends the view with the color picker.
	 */
	private _appendColorPickerFragment(): void {
		if ( this.items.length === 2 ) {
			return;
		}

		this.items.add( this.colorPickerFragmentView );

		if ( this.colorGridsFragmentView.colorPickerButtonView ) {
			this.colorGridsFragmentView.colorPickerButtonView.on( 'execute', () => {
				this.showColorPickerFragment();
			} );
		}

		this.colorGridsFragmentView.addColorPickerButton();
		this.colorPickerFragmentView.delegate( 'execute' ).to( this );
		this.colorPickerFragmentView.delegate( 'colorPicker:cancel' ).to( this );
	}
}

/**
 * Fired whenever the color was changed. There are multiple sources of this event and you can distinguish them
 * using the `source` property passed along this event.
 *
 * @eventName ~ColorSelectorView#execute
 */
export type ColorSelectorExecuteEvent = {
	name: 'execute';
	args: [ {
		value: string;
		source: 'staticColorsGrid' | 'documentColorsGrid' | 'removeColorButton' | 'colorPicker' | 'colorPickerSaveButton';
	} ];
};

/**
 * Fired when the user pressed the "Cancel" button in the
 * {@link module:ui/colorselector/colorselectorview~ColorSelectorView#colorPickerFragmentView}.
 *
 * @eventName ~ColorSelectorView#colorPicker:cancel
 */
export type ColorSelectorColorPickerCancelEvent = {
	name: 'colorPicker:cancel';
	args: [];
};

/**
 * Fired whenever {@link module:ui/colorselector/colorselectorview~ColorSelectorView#colorPickerFragmentView} is shown.
 *
 * See {@link ~ColorSelectorView#showColorPickerFragment}.
 *
 * @eventName ~ColorSelectorView#colorPicker:show
 */
export type ColorSelectorColorPickerShowEvent = {
	name: 'colorPicker:show';
	args: [];
};
