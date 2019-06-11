/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module indent-block/indentblockcommand/usingoffset
 */

/**
 * The block indentation feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class UsingOffset {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor instance.
	 * @param {Object} config.
	 */
	constructor( config ) {
		this.direction = config.direction == 'forward' ? 1 : -1;
		this.offset = config.offset;
		this.unit = config.unit;
	}

	getNewIndent( currentIndent ) {
		const currentOffset = parseFloat( currentIndent || 0 );
		const isSameUnit = !currentIndent || currentIndent.endsWith( this.unit );

		if ( !isSameUnit ) {
			return this.direction > 0 ? this.offset + this.unit : undefined;
		}

		const offsetToSet = currentOffset + this.direction * this.offset;

		return offsetToSet && offsetToSet > 0 ? offsetToSet + this.unit : undefined;
	}

	checkEnabled( currentIndent ) {
		const currentOffset = parseFloat( currentIndent || 0 );

		// is forward
		if ( this.direction > 0 ) {
			return true;
		} else {
			return currentOffset > 0;
		}
	}
}
