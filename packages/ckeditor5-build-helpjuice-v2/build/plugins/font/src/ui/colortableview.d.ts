/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import { ButtonView, ColorGridView, FocusCycler, View, ViewCollection, ColorPickerView, type ColorDefinition, type ColorPickerConfig } from 'ckeditor5/src/ui';
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
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * A collection of components.
     */
    readonly items: ViewCollection;
    /**
     * The "Color grids" component.
     */
    colorGridsPageView: ColorGridsPageView;
    /**
     * The "Color picker" component.
     */
    colorPickerPageView: ColorPickerPageView;
    /**
     * Keeps the value of the command associated with the component for the current selection.
     */
    selectedColor?: string;
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
    private _colorPickerConfig;
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
    constructor(locale: Locale, { colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount, colorPickerLabel, colorPickerConfig }: {
        colors: Array<ColorDefinition>;
        columns: number;
        removeButtonLabel: string;
        colorPickerLabel: string;
        documentColorsLabel?: string;
        documentColorsCount?: number;
        colorPickerConfig: ColorPickerConfig | false;
    });
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Appends static and document color grid views.
     */
    appendGrids(): void;
    /**
     * Renders UI in dropdown. Which sub-components are rendered
     * depends on the component configuration.
     */
    appendUI(): void;
    /**
     * Show "Color picker" and hide "Color grids".
     */
    showColorPicker(): void;
    /**
     * Show "Color grids" and hide "Color picker".
     */
    showColorGrids(): void;
    /**
     * Focuses the first focusable element in {@link #items}.
     */
    focus(): void;
    /**
     * Focuses the last focusable element in {@link #items}.
     */
    focusLast(): void;
    /**
     * Scans through the editor model and searches for text node attributes with the given attribute name.
     * Found entries are set as document colors.
     *
     * All the previously stored document colors will be lost in the process.
     *
     * @param model The model used as a source to obtain the document colors.
     * @param attributeName Determines the name of the related model's attribute for a given dropdown.
     */
    updateDocumentColors(model: Model, attributeName: string): void;
    /**
     * Refreshes the state of the selected color in one or both {@link module:ui/colorgrid/colorgridview~ColorGridView}s
     * available in the {@link module:font/ui/colortableview~ColorTableView}. It guarantees that the selection will occur only in one
     * of them.
     */
    updateSelectedColors(): void;
    /**
     * Appends the color picker view.
     */
    private _appendColorPicker;
}
/**
 * A class which represents a view with the following sub–components:
 *
 * * A remove color button,
 * * A static {@link module:ui/colorgrid/colorgridview~ColorGridView} of colors defined in the configuration,
 * * A dynamic {@link module:ui/colorgrid/colorgridview~ColorGridView} of colors used in the document.
 * * If color picker is configured, the "Color Picker" button is visible too.
 */
declare class ColorGridsPageView extends View {
    /**
     * A collection of the children of the table.
     */
    readonly items: ViewCollection;
    /**
     * An array with objects representing colors to be displayed in the grid.
     */
    colorDefinitions: Array<ColorDefinition>;
    /**
     * Tracks information about the DOM focus in the list.
     */
    readonly focusTracker: FocusTracker;
    /**
     * The number of columns in the color grid.
     */
    columns: number;
    /**
     * A collection of definitions that store the document colors.
     *
     * @readonly
     */
    documentColors: DocumentColorCollection;
    /**
     * The maximum number of colors in the document colors section.
     * If it equals 0, the document colors section is not added.
     *
     * @readonly
     */
    documentColorsCount?: number;
    /**
     * Keeps the value of the command associated with the table for the current selection.
     */
    selectedColor: string;
    /**
     * Preserves the reference to {@link module:ui/colorgrid/colorgridview~ColorGridView} used to create
     * the default (static) color set.
     *
     * The property is loaded once the the parent dropdown is opened the first time.
     *
     * @readonly
     */
    staticColorsGrid: ColorGridView | undefined;
    /**
     * Preserves the reference to {@link module:ui/colorgrid/colorgridview~ColorGridView} used to create
     * the document colors. It remains undefined if the document colors feature is disabled.
     *
     * The property is loaded once the the parent dropdown is opened the first time.
     *
     * @readonly
     */
    documentColorsGrid: ColorGridView | undefined;
    /**
     * The "Color picker" button view.
     */
    colorPickerButtonView?: ButtonView;
    /**
     * The "Remove color" button view.
     */
    removeColorButtonView: ButtonView;
    /**
     * The property which is responsible for is component visible or not.
     */
    isVisible: boolean;
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
    private _documentColorsLabel?;
    /**
     * The label of the button responsible for removing color attributes.
     */
    private _removeButtonLabel;
    /**
     * The label of the button responsible for switching to the color picker component.
     */
    _colorPickerLabel: string;
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
    constructor(locale: Locale, { colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount, colorPickerLabel, focusTracker, focusables }: {
        colors: Array<ColorDefinition>;
        columns: number;
        removeButtonLabel: string;
        colorPickerLabel: string;
        documentColorsLabel?: string;
        documentColorsCount?: number;
        focusTracker: FocusTracker;
        focusables: ViewCollection;
    });
    /**
     * Scans through the editor model and searches for text node attributes with the given attribute name.
     * Found entries are set as document colors.
     *
     * All the previously stored document colors will be lost in the process.
     *
     * @param model The model used as a source to obtain the document colors.
     * @param attributeName Determines the name of the related model's attribute for a given dropdown.
     */
    updateDocumentColors(model: Model, attributeName: string): void;
    /**
     * Refreshes the state of the selected color in one or both {@link module:ui/colorgrid/colorgridview~ColorGridView}s
     * available in the {@link module:font/ui/colortableview~ColorTableView}. It guarantees that the selection will occur only in one
     * of them.
     */
    updateSelectedColors(): void;
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Focuses the component.
     */
    focus(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Handles displaying the color picker button (if it was previously created) and making it focusable.
     */
    addColorPickerButton(): void;
    /**
     * Adds color table elements to focus tracker.
     */
    private _addColorTablesElementsToFocusTracker;
    /**
     * Creates the button responsible for displaying the color picker component.
     */
    private _createColorPickerButton;
    /**
     * Adds the remove color button as a child of the current view.
     */
    private _createRemoveColorButton;
    /**
     * Creates a static color table grid based on the editor configuration.
     */
    private _createStaticColorsGrid;
    /**
     * Creates the document colors section view and binds it to {@link #documentColors}.
     */
    private _createDocumentColorsGrid;
    /**
     * Adds a given color to the document colors list. If possible, the method will attempt to use
     * data from the {@link #colorDefinitions} (label, color options).
     *
     * @param color A string that stores the value of the recently applied color.
     */
    private _addColorToDocumentColors;
}
/**
 * A class which represents a color picker component view with the following sub–components:
 *
 * * Color picker saturation and hue sliders,
 * * Input accepting colors in HEX format,
 * * "Save" and "Cancel" action buttons.
 */
declare class ColorPickerPageView extends View {
    /**
     * A collection of component's children.
     */
    readonly items: ViewCollection;
    /**
     * A view with saturation and hue sliders and color input.
     */
    colorPickerView?: ColorPickerView;
    /**
     * The "Save" button view.
     */
    saveButtonView: ButtonView;
    /**
     * The "Cancel" button view.
     */
    cancelButtonView: ButtonView;
    /**
     * The action bar where are "Save" button and "Cancel" button.
     */
    actionBarView: View;
    /**
     * Tracks information about the DOM focus in the list.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * Indicates whether the component is visible or not.
     */
    isVisible: boolean;
    /**
     * Keeps the value of the command associated with the component for the current selection.
     */
    selectedColor?: string;
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
    private _pickerConfig;
    /**
     * @param locale The localization services instance.
     * @param focusTracker Tracks information about the DOM focus in the list.
     * @param focusables A collection of views that can be focused in the view..
     * @param keystrokes An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     * @param colorPickerConfig The configuration of color picker feature.
     */
    constructor(locale: Locale, { focusTracker, focusables, keystrokes, colorPickerConfig }: {
        focusTracker: FocusTracker;
        focusables: ViewCollection;
        keystrokes: KeystrokeHandler;
        colorPickerConfig: ColorPickerConfig | false;
    });
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Focuses the color picker.
     */
    focus(): void;
    /**
     * When color picker is focused and "enter" is pressed it executes command.
     */
    private _executeOnEnterPress;
    /**
     * Removes default behavior of arrow keys in dropdown.
     */
    private _stopPropagationOnArrowsKeys;
    /**
     * Adds color picker elements to focus tracker.
     */
    private _addColorPickersElementsToFocusTracker;
    /**
     * Creates bar containing "Save" and "Cancel" buttons.
     */
    private _createActionBarView;
    /**
     * Creates "Save" and "Cancel" buttons.
     */
    private _createActionButtons;
    /**
     * Fires the `execute` event if color in color picker changed.
     *
     * @fires execute
     */
    private _executeUponColorChange;
}
/**
 * Fired whenever the color was changed.
 *
 * @eventName ~ColorTableView#execute
 */
export type ColorTableExecuteEvent = {
    name: 'execute';
    args: [
        {
            value: string;
            source: 'staticColorsGrid' | 'documentColorsGrid' | 'removeColorButton' | 'colorPicker' | 'saveButton';
        }
    ];
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
export {};
