/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Error collector for gathering multiple validation errors instead of stopping at the first one.
 */
export class ErrorCollector {
	constructor() {
		this.errors = [];
	}

	addError( message, context = {} ) {
		this.errors.push( { message, context } );
	}

	hasErrors() {
		return this.errors.length > 0;
	}

	printReport() {
		if ( this.hasErrors() ) {
			for ( const error of this.errors ) {
				console.log( `${ error.message }` );

				// Show solution if available
				if ( error.context && error.context.solution ) {
					console.log( `- Possible solution: ${ error.context.solution }\n` );
				}
			}
		}
	}
}
