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
	type ColorDefinition
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
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * The label of the button responsible for removing color attributes.
	 */
	public removeButtonLabel: string;

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
		{ colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount }: {

			colors: Array<ColorDefinition>;
			columns: number;
			removeButtonLabel: string;
			documentColorsLabel?: string;
			documentColorsCount?: number;
		}
	) {
		super( locale );

		this.items = this.createCollection();
		this.colorDefinitions = colors;
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		this.set( 'selectedColor', undefined );

		this.removeButtonLabel = removeButtonLabel;
		this.columns = columns;
		this.documentColors = new DocumentColorCollection();
		this.documentColorsCount = documentColorsCount;

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
			children: this.items
		} );

		this.items.add( this._createRemoveColorButton() );
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

		this.items.add( this.staticColorsGrid );
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
			this.items.add( label );
			this.documentColorsGrid = this._createDocumentColorsGrid();

			this.items.add( this.documentColorsGrid );
			this.focusTracker.add( this.documentColorsGrid.element! );
			this._focusables.add( this.documentColorsGrid );
		}
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
