/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module indent/indentcommandbehavior/indentusingoffset
 */

/**
 * The block indentation behavior that uses offsets to set indentation.
 *
 * @implements module:indent/indentblockcommand~IndentBehavior
 */
export default class IndentUsingOffset {
	/**
	 * Creates an instance of the indentation behavior.
	 *
	 * @param {Object} config
	 * @param {String} config.direction The direction of indentation.
	 * @param {Number} config.offset The offset of the next indentation step.
	 * @param {String} config.unit Indentation unit.
	 */
	constructor( config ) {
		/**
		 * The direction of indentation.
		 *
		 * @type {Boolean}
		 */
		this.isForward = config.direction === 'forward';

		/**
		 * The offset of the next indentation step.
		 *
		 * @type {Number}
		 */
		this.offset = config.offset;

		/**
		 * Indentation unit.
		 *
		 * @type {String}
		 */
		this.unit = config.unit;
	}

	/**
	 * @inheritDoc
	 */
	checkEnabled( indentAttributeValue ) {
		const currentOffset = parseFloat( indentAttributeValue || 0 );

		// The command is always enabled for forward indentation.
		return this.isForward || currentOffset > 0;
	}

	/**
	 * @inheritDoc
	 */
	getNextIndent( indentAttributeValue ) {
		const currentOffset = parseFloat( indentAttributeValue || 0 );
		const isSameUnit = !indentAttributeValue || indentAttributeValue.endsWith( this.unit );

		if ( !isSameUnit ) {
			return this.isForward ? this.offset + this.unit : undefined;
		}

		const nextOffset = this.isForward ? this.offset : -this.offset;

		const offsetToSet = currentOffset + nextOffset;

		return offsetToSet > 0 ? offsetToSet + this.unit : undefined;
	}
}
