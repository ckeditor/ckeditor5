/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/ui/stylegridview
 */

import { View } from 'ckeditor5/src/ui';
import StyleGridButtonView from './stylegridbuttonview';

import '../../theme/stylegrid.css';

/**
 * A class representing a grid of styles ({@link module:style/ui/stylegridbuttonview~StyleGridButtonView buttons}).
 * Allows users to select a style.
 *
 * @protected
 * @extends module:ui/view~View
 */
export default class StyleGridView extends View {
	/**
	 * Creates an instance of the {@link module:style/ui/stylegridview~StyleGridView} class.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 * @param {Array.<module:style/style~StyleDefinition>} styleDefinitions Definitions of the styles.
	 */
	constructor( locale, styleDefinitions ) {
		super( locale );

		/**
		 * Array of active style names. They must correspond to the names of styles from
		 * definitions passed to the {@link #constructor}.
		 *
		 * @observable
		 * @readonly
		 * @default []
		 * @member {Array.<String>} #activeStyles
		 */
		this.set( 'activeStyles', [] );

		/**
		 * Array of enabled style names. They must correspond to the names of styles from
		 * definitions passed to the {@link #constructor}.
		 *
		 * @observable
		 * @readonly
		 * @default []
		 * @member {Array.<String>} #enabledStyles
		 */
		this.set( 'enabledStyles', [] );

		/**
		 * A collection of style {@link module:style/ui/stylegridbuttonview~StyleGridButtonView buttons}.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();
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

		/**
		 * Fired when a {@link module:style/ui/stylegridbuttonview~StyleGridButtonView style} was selected (clicked) by the user.
		 *
		 * @event execute
		 */
	}
}
