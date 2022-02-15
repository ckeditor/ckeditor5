/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { Command } from 'ckeditor5/src/core';
import { normalizeConfig } from './utils';

/**
 * TODO
 *
 * @extends module:core/command~Command
 */
export default class StyleCommand extends Command {
	constructor( editor ) {
		super( editor );

		this.set( 'enabledStyles', [] );

		this.refresh();
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const config = normalizeConfig( this.editor.config.get( 'style.definitions' ) );

		this.value = [
			'Large heading',
			'Typewriter'
		];

		this.enabledStyles = [
			...config.block.map( ( { name } ) => name ),
			...config.inline.map( ( { name } ) => name )
		].filter( ( item, index ) => {
			return ![ 2, 7 ].includes( index );
		} );

		this.isEnabled = true;
	}

	/**
	 *
	 * @param {TODO} definition
	 */
	execute( definition ) {
		// eslint-disable-next-line
		console.log( 'Style applied:', definition );
	}
}
