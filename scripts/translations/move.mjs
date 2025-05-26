/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import fs from 'fs-extra';
import { moveTranslations } from '@ckeditor/ckeditor5-dev-translations';
import { parseArguments } from './utils.mjs';

main();

function main() {
	const options = parseArguments( process.argv.slice( 2 ) );
	const config = fs.readJsonSync( options.config, { throws: false } );

	if ( !config ) {
		const errorMessage = options.config ?
			`🔥 Unable to open configuration file: "${ options.config }".` :
			'🔥 Missing "--config" parameter.';

		console.error( errorMessage );

		process.exit( 1 );
	}

	return moveTranslations( {
		// Configuration that defines the messages to move.
		config
	} );
}
