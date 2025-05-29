/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { validate } from 'schema-utils';

export default class FooterPlugin {
	/**
	 * @param {String} footer Text that will be appended to an output file.
	 */
	constructor( footer ) {
		validate( { type: 'string' }, footer, { name: FooterPlugin.name } );

		this.footer = footer;
	}

	apply( compiler ) {
		const { ConcatSource } = compiler.webpack.sources;

		const tapOptions = {
			name: FooterPlugin.name,
			stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
		};

		compiler.hooks.compilation.tap( FooterPlugin.name, compilation => {
			compilation.hooks.processAssets.tap( tapOptions, assets => {
				for ( const assetName in assets ) {
					if ( assetName.startsWith( 'translations' ) ) {
						continue;
					}

					assets[ assetName ] = new ConcatSource( assets[ assetName ], this.footer );
				}
			} );
		} );
	}
}
