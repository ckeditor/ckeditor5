/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module indent/indentcommandbehavior/indentusingclasses
 */

/**
 * The block indentation behavior that uses classes to set indentation.
 *
 * @implements module:indent/indentblockcommand~IndentBehavior
 */
export default class IndentUsingClasses {
	/**
	 * Creates an instance of the indentation behavior.
	 *
	 * @param {Object} config
	 * @param {String} config.direction The direction of indentation.
	 * @param {Array.<String>} config.classes A list of classes used for indentation.
	 */
	constructor( config ) {
		/**
		 * The direction of indentation.
		 *
		 * @type {Boolean}
		 */
		this.isForward = config.direction === 'forward';

		/**
		 * A list of classes used for indentation.
		 *
		 * @type {Array.<String>}
		 */
		this.classes = config.classes;
	}

	/**
	 * @inheritDoc
	 */
	checkEnabled( indentAttributeValue ) {
		const currentIndex = this.classes.indexOf( indentAttributeValue );

		if ( this.isForward ) {
			return currentIndex < this.classes.length - 1;
		} else {
			return currentIndex >= 0;
		}
	}

	/**
	 * @inheritDoc
	 */
	getNextIndent( indentAttributeValue ) {
		const currentIndex = this.classes.indexOf( indentAttributeValue );
		const indexStep = this.isForward ? 1 : -1;

		return this.classes[ currentIndex + indexStep ];
	}
}
