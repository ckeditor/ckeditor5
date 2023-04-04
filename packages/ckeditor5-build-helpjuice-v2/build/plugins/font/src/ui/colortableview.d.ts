/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import { ColorGridView, FocusCycler, View, ViewCollection, type ColorDefinition } from 'ckeditor5/src/ui';
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
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * The label of the button responsible for removing color attributes.
     */
    removeButtonLabel: string;
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
    private _documentColorsLabel?;
    /**
     * Keeps the value of the command associated with the table for the current selection.
     */
    selectedColor?: string;
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
     * Creates a view to be inserted as a child of {@link module:ui/dropdown/dropdownview~DropdownView}.
     *
     * @param locale The localization services instance.
     * @param colors An array with definitions of colors to be displayed in the table.
     * @param columns The number of columns in the color grid.
     * @param removeButtonLabel The label of the button responsible for removing the color.
     * @param documentColorsLabel The label for the section with the document colors.
     * @param documentColorsCount The number of colors in the document colors section inside the color dropdown.
     */
    constructor(locale: Locale, { colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount }: {
        colors: Array<ColorDefinition>;
        columns: number;
        removeButtonLabel: string;
        documentColorsLabel?: string;
        documentColorsCount?: number;
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
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Appends {@link #staticColorsGrid} and {@link #documentColorsGrid} views.
     */
    appendGrids(): void;
    /**
     * Focuses the first focusable element in {@link #items}.
     */
    focus(): void;
    /**
     * Focuses the last focusable element in {@link #items}.
     */
    focusLast(): void;
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
