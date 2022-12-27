/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/colorgrid/colorgrid
 */

import View from '../view';
import ColorTileView from './colortileview';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import addKeyboardHandlingForGrid from '../bindings/addkeyboardhandlingforgrid';

import {
	FocusTracker,
	type CollectionAddEvent,
	type CollectionRemoveEvent,
	type Locale,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';

import '../../theme/components/colorgrid/colorgrid.css';

import type { ButtonExecuteEvent } from '../button/button';
import type DropdownPanelFocusable from '../dropdown/dropdownpanelfocusable';
import type ViewCollection from '../viewcollection';

/**
 * A grid of {@link module:ui/colorgrid/colortile~ColorTileView color tiles}.
 *
 * @extends module:ui/view~View
 */
export default class ColorGridView extends View implements DropdownPanelFocusable {
	public readonly columns: number;
	public readonly items: ViewCollection;
	public readonly focusTracker: FocusTracker;
	public readonly keystrokes: KeystrokeHandler;

	declare public selectedColor: string | undefined;

	/**
	 * Creates an instance of a color grid containing {@link module:ui/colorgrid/colortile~ColorTileView tiles}.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 * @param {Object} options Component configuration
	 * @param {Array.<module:ui/colorgrid/colorgrid~ColorDefinition>} [options.colorDefinitions] Array with definitions
	 * required to create the {@link module:ui/colorgrid/colortile~ColorTileView tiles}.
	 * @param {Number} [options.columns=5] A number of columns to display the tiles.
	 */
	constructor(
		locale?: Locale,
		options?: {
			colorDefinitions?: Array<ColorDefinition>;
			columns?: number;
		}
	) {
		super( locale );

		const colorDefinitions = options && options.colorDefinitions || [];

		/**
		 * A number of columns for the tiles grid.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.columns = options && options.columns ? options.columns : 5;

		const viewStyleAttribute = {
			gridTemplateColumns: `repeat( ${ this.columns }, 1fr)`
		};

		/**
		 * The color of the currently selected color tile in {@link #items}.
		 *
		 * @observable
		 * @type {String}
		 */
		this.set( 'selectedColor', undefined );

		/**
		 * Collection of the child tile views.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.items = this.createCollection();

		/**
		 * Tracks information about DOM focus in the grid.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		this.items.on<CollectionAddEvent<ColorTileView>>( 'add', ( evt, colorTile ) => {
			colorTile.isOn = colorTile.color === this.selectedColor;
		} );

		colorDefinitions.forEach( color => {
			const colorTile = new ColorTileView();

			colorTile.set( {
				color: color.color,
				label: color.label,
				tooltip: true,
				hasBorder: color.options.hasBorder
			} );

			colorTile.on<ButtonExecuteEvent>( 'execute', () => {
				this.fire<ColorGridViewExecuteEvent>( 'execute', {
					value: color.color,
					hasBorder: color.options.hasBorder,
					label: color.label
				} );
			} );

			this.items.add( colorTile );
		} );

		this.setTemplate( {
			tag: 'div',
			children: this.items,
			attributes: {
				class: [
					'ck',
					'ck-color-grid'
				],
				style: viewStyleAttribute
			}
		} );

		this.on<ObservableChangeEvent<string | undefined>>( 'change:selectedColor', ( evt, name, selectedColor ) => {
			for ( const item of this.items ) {
				( item as ColorTileView ).isOn = ( item as ColorTileView ).color === selectedColor;
			}
		} );
	}

	/**
	 * Focuses the first focusable in {@link #items}.
	 */
	public focus(): void {
		if ( this.items.length ) {
			( this.items.first as ColorTileView ).focus();
		}
	}

	/**
	 * Focuses the last focusable in {@link #items}.
	 */
	public focusLast(): void {
		if ( this.items.length ) {
			( this.items.last as ColorTileView ).focus();
		}
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		// Items added before rendering should be known to the #focusTracker.
		for ( const item of this.items ) {
			this.focusTracker.add( item.element! );
		}

		this.items.on<CollectionAddEvent<ColorTileView>>( 'add', ( evt, item ) => {
			this.focusTracker.add( item.element! );
		} );

		this.items.on<CollectionRemoveEvent<ColorTileView>>( 'remove', ( evt, item ) => {
			this.focusTracker.remove( item.element! );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element! );

		addKeyboardHandlingForGrid( {
			keystrokeHandler: this.keystrokes,
			focusTracker: this.focusTracker,
			gridItems: this.items,
			numberOfColumns: this.columns,
			uiLanguageDirection: this.locale && this.locale.uiLanguageDirection
		} );
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
	 * Fired when the `ColorTileView` for the picked item is executed.
	 *
	 * @event execute
	 * @param {Object} data Additional information about the event.
	 * @param {String} data.value The value of the selected color
	 * ({@link module:ui/colorgrid/colorgrid~ColorDefinition#color `color.color`}).
	 * @param {Boolean} data.hasBorder The `hasBorder` property of the selected color
	 * ({@link module:ui/colorgrid/colorgrid~ColorDefinition#options `color.options.hasBorder`}).
	 * @param {String} data.Label The label of the selected color
	 * ({@link module:ui/colorgrid/colorgrid~ColorDefinition#label `color.label`})
	 */
}

/**
 * A color definition used to create a {@link module:ui/colorgrid/colortile~ColorTileView}.
 *
 *		{
 *			color: 'hsl(0, 0%, 75%)',
 *			label: 'Light Grey',
 *			options: {
 *				hasBorder: true
 *			}
 *		}
 *
 * @typedef {Object} module:ui/colorgrid/colorgrid~ColorDefinition
 * @type Object
 *
 * @property {String} color String representing a color.
 * It is used as value of background-color style in {@link module:ui/colorgrid/colortile~ColorTileView}.
 * @property {String} label String used as label for {@link module:ui/colorgrid/colortile~ColorTileView}.
 * @property {Object} options Additional options passed to create a {@link module:ui/colorgrid/colortile~ColorTileView}.
 * @property {Boolean} options.hasBorder A flag that indicates if special a CSS class should be added
 * to {@link module:ui/colorgrid/colortile~ColorTileView}, which renders a border around it.
 */
export interface ColorDefinition {
	color: string;
	label: string;
	options: {
		hasBorder: boolean;
	};
}

export type ColorGridViewExecuteEvent = {
	name: 'execute';
	args: [ {
		value: string;
		hasBorder: boolean;
		label: string;
	} ];
};
