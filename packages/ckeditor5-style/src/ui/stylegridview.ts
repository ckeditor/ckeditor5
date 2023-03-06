/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/ui/stylegridview
 */

import { View, addKeyboardHandlingForGrid, type ViewCollection } from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils';

import StyleGridButtonView from './stylegridbuttonview';
import type { StyleDefinition } from '../styleconfig';

import '../../theme/stylegrid.css';

/**
 * A class representing a grid of styles ({@link module:style/ui/stylegridbuttonview~StyleGridButtonView buttons}).
 * Allows users to select a style.
 */
export default class StyleGridView extends View<HTMLDivElement> {
	/**
	 * Tracks information about the DOM focus in the view.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * A collection of style {@link module:style/ui/stylegridbuttonview~StyleGridButtonView buttons}.
	 */
	public readonly children: ViewCollection<StyleGridButtonView>;

	/**
	 * Array of active style names. They must correspond to the names of styles from
	 * definitions passed to the {@link #constructor}.
	 *
	 * @observable
	 */
	declare public readonly activeStyles: Array<string>;

	/**
	 * Array of enabled style names. They must correspond to the names of styles from
	 * definitions passed to the {@link #constructor}.
	 *
	 * @observable
	 */
	declare public readonly enabledStyles: Array<string>;

	/**
	 * Creates an instance of the {@link module:style/ui/stylegridview~StyleGridView} class.
	 *
	 * @param locale The localization services instance.
	 * @param styleDefinitions Definitions of the styles.
	 */
	constructor( locale: Locale, styleDefinitions: Array<StyleDefinition> ) {
		super( locale );

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		this.set( 'activeStyles', [] );
		this.set( 'enabledStyles', [] );

		this.children = this.createCollection<StyleGridButtonView>();
		this.children.delegate( 'execute' ).to( this );

		for ( const definition of styleDefinitions ) {
			const gridTileView = new StyleGridButtonView( locale, definition );

			this.children.add( gridTileView );
		}

		this.on( 'change:activeStyles', () => {
			for ( const child of this.children ) {
				child.isOn = this.activeStyles.includes( child.styleDefinition.name );
			}
		} );

		this.on( 'change:enabledStyles', () => {
			for ( const child of this.children ) {
				child.isEnabled = this.enabledStyles.includes( child.styleDefinition.name );
			}
		} );

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-style-grid'
				],
				role: 'listbox'
			},

			children: this.children
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		for ( const child of this.children ) {
			this.focusTracker.add( child.element! );
		}

		addKeyboardHandlingForGrid( {
			keystrokeHandler: this.keystrokes,
			focusTracker: this.focusTracker,
			gridItems: this.children,
			numberOfColumns: 3,
			uiLanguageDirection: this.locale && this.locale.uiLanguageDirection
		} );

		// Start listening for the keystrokes coming from the grid view.
		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * Focuses the first style button in the grid.
	 */
	public focus(): void {
		this.children.first!.focus();
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
 * Fired when a {@link module:style/ui/stylegridbuttonview~StyleGridButtonView style} was selected (clicked) by the user.
 *
 * @eventName ~StyleGridView#execute
 */
export type StyleGridViewExecuteEvent = {
	name: 'execute';
	args: [];
};
