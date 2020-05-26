/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

// TODO: Implement converters (now "rules") (if necessary).
// TODO: Delete the legacy lib/to-markdown directory.
// import converters from './lib/to-markdown/converters';

const turndownService = new TurndownService();
turndownService.use( gfm );

export default function html2markdown( html ) {
	return turndownService.turndown( html );
}
