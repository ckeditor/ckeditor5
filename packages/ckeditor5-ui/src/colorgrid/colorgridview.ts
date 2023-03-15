/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/colorgrid/colorgridview
 */

import View from '../view';
import ColorTileView from './colortileview';
import addKeyboardHandlingForGrid from '../bindings/addkeyboardhandlingforgrid';

import type { ButtonExecuteEvent } from '../button/button';
import type DropdownPanelFocusable from '../dropdown/dropdownpanelfocusable';
import type ViewCollection from '../viewcollection';

import {
	FocusTracker,
	KeystrokeHandler,
	type CollectionAddEvent,
	type CollectionRemoveEvent,
	type Locale,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';

import '../../theme/components/colorgrid/colorgrid.css';

/**
 * A grid of {@link module:ui/colorgrid/colortileview~ColorTileView color tiles}.
 */
export default class ColorGridView extends View implements DropdownPanelFocusable {
	/**
	 * A number of columns for the tiles grid.
	 */
	public readonly columns: number;

	/**
	 * Collection of the child tile views.
	 */
	public readonly items: ViewCollection<ColorTileView>;

	/**
	 * Tracks information about DOM focus in the grid.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * The color of the currently selected color tile in {@link #items}.
	 *
	 * @observable
	 */
	declare public selectedColor: string | undefined | null;

	/**
	 * Creates an instance of a color grid containing {@link module:ui/colorgrid/colortileview~ColorTileView tiles}.
	 *
	 * @fires execute
	 * @param locale The localization services instance.
	 * @param options Component configuration
	 * @param options.colorDefinitions Array with definitions
	 * required to create the {@link module:ui/colorgrid/colortileview~ColorTileView tiles}.
	 * @param options.columns A number of columns to display the tiles.
	 */
	constructor(
		locale?: Locale,
		options?: {
			colorDefinitions?: Array<ColorDefinition>;
			columns?: number;
		}
	) {
		super( locale );

		const colorDefinitions = options && options.colorDefinitions ? options.colorDefinitions : [];

		this.columns = options && options.columns ? options.columns : 5;

		const viewStyleAttribute = {
			gridTemplateColumns: `repeat( ${ this.columns }, 1fr)`
		};

		this.set( 'selectedColor', undefined );

		this.items = this.createCollection();
		this.focusTracker = new FocusTracker();
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
				item.isOn = item.color === selectedColor;
			}
		} );
	}

	/**
	 * Focuses the first focusable in {@link #items}.
	 */
	public focus(): void {
		if ( this.items.length ) {
			this.items.first!.focus();
		}
	}

	/**
	 * Focuses the last focusable in {@link #items}.
	 */
	public focusLast(): void {
		if ( this.items.length ) {
			this.items.last!.focus();
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
}

/**
 * A color definition used to create a {@link module:ui/colorgrid/colortileview~ColorTileView}.
 *
 * ```json
 * {
 * 	color: 'hsl(0, 0%, 75%)',
 * 	label: 'Light Grey',
 * 	options: {
 * 		hasBorder: true
 * 	}
 * }
 * ```
 */
export interface ColorDefinition {

	/**
	 * String representing a color.
	 * It is used as value of background-color style in {@link module:ui/colorgrid/colortileview~ColorTileView}.
	 */
	color: string;

	/**
	 * String used as label for {@link module:ui/colorgrid/colortileview~ColorTileView}.
	 */
	label: string;

	/**
	 * Additional options passed to create a {@link module:ui/colorgrid/colortileview~ColorTileView}.
	 */
	options: {

		/**
		 * A flag that indicates if special a CSS class should be added
		 * to {@link module:ui/colorgrid/colortileview~ColorTileView}, which renders a border around it.
		 */
		hasBorder: boolean;
	};
}

/**
 * Fired when the `ColorTileView` for the picked item is executed.
 *
 * @eventName ~ColorGridView#execute
 * @param data Additional information about the event.
*/
export type ColorGridViewExecuteEvent = {
	name: 'execute';
	args: [ data: ColorGridViewExecuteEventData ];
};

/**
 * The data of {@link ~ColorGridViewExecuteEvent execute event}.
 */
export interface ColorGridViewExecuteEventData {

	/**
	 * The value of the selected color ({@link module:ui/colorgrid/colorgridview~ColorDefinition#color `color.color`}).
	 */
	value: string;

	/**
	 * The `hasBorder` property of the selected color
	 * ({@link module:ui/colorgrid/colorgridview~ColorDefinition#options `color.options.hasBorder`}).
	 */
	hasBorder: boolean;

	/**
	 * The label of the selected color ({@link module:ui/colorgrid/colorgridview~ColorDefinition#label `color.label`})
	 */
	label: string;
}
