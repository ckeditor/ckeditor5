/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { View } from 'ckeditor5/src/ui';
import StyleGridButtonView from './stylegridbuttonview';

import '../../theme/stylegrid.css';

/**
 * TODO
 *
 * @extends module:ui/view~View
 */
export default class StyleGridView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale, styleDefinitions ) {
		super( locale );

		/**
		 * TODO
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();

		for ( const definition of styleDefinitions ) {
			const gridTileView = new StyleGridButtonView( locale, definition );

			this.children.add( gridTileView );
		}

		this.children.delegate( 'execute' ).to( this );

		this.on( 'change:activeStyles', () => {
			for ( const child of this.children ) {
				child.isOn = this.activeStyles.includes( child.definition.name );
			}
		} );

		this.on( 'change:enabledStyles', () => {
			for ( const child of this.children ) {
				child.isEnabled = this.enabledStyles.includes( child.definition.name );
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
}
