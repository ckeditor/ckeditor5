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

		/**
		 * TODO
		 */
		this.set( 'enabledStyles', [] );

		this.refresh();
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const editor = this.editor;
		const dataSchema = editor.plugins.get( 'DataSchema' );
		const normalizedStyleDefinitions = normalizeConfig( dataSchema, editor.config.get( 'style.definitions' ) );

		// TODO: This is just a mock.
		this.value = [
			'Large heading',
			'Typewriter'
		];

		// TODO: This is just a mock.
		this.enabledStyles = [
			...normalizedStyleDefinitions.block.map( ( { name } ) => name ),
			...normalizedStyleDefinitions.inline.map( ( { name } ) => name )
		].filter( ( item, index ) => {
			return ![ 2, 7 ].includes( index );
		} );

		// TODO: This is just a mock.
		this.isEnabled = true;
	}

	/**
	 * TODO: This is just a mock.
	 *
	 * @param {TODO} definition
	 */
	execute( definition ) {
		// eslint-disable-next-line
		console.log( 'Style applied:', definition );
	}
}
