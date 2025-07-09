/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import chalk from 'chalk';

/**
 * Error collector for gathering multiple validation errors instead of stopping at the first one.
 */
export class ErrorCollector {
	constructor() {
		this.errors = [];
	}

	addError( { path, message, solution } ) {
		this.errors.push( { path, message, solution } );
	}

	hasErrors() {
		return this.errors.length > 0;
	}

	printReport() {
		if ( this.hasErrors() ) {
			for ( const error of this.errors ) {
				console.log( `[${ error.path }]` );
				console.log( chalk.red( 'Error: ' + error.message ) );

				if ( error.solution ) {
					console.log( `- Possible solution: ${ error.solution }\n` );
				}
			}
		}
	}
}
