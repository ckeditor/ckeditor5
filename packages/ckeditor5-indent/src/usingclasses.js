/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module indent-block/indentblockcommand/usingclasses
 */

export default class UsingClasses {
	constructor( config ) {
		this.direction = config.direction == 'forward' ? 1 : -1;
		this.classes = config.classes;
	}

	getNewIndent( currentIndent ) {
		const currentIndex = this.classes.indexOf( currentIndent );

		return this.classes[ currentIndex + this.direction ];
	}

	checkEnabled( currentIndent ) {
		const currentIndex = this.classes.indexOf( currentIndent );

		if ( this.direction > 0 ) {
			return currentIndex < this.classes.length - 1;
		} else {
			return currentIndex >= 0 && currentIndex < this.classes.length;
		}
	}
}
