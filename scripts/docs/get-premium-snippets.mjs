/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import upath from 'upath';

/**
 * Finds snippets that use premium features, including imports from bundled helpers.
 * Uses output imports so that dependencies removed by tree shaking do not add unnecessary page assets.
 *
 * @param {import('esbuild').Metafile} metafile
 * @param {Record<string, string>} imports The document's import map.
 * @returns {Set<string>} Absolute entry paths of snippets that need premium assets.
 */
export default function getPremiumSnippets( metafile, imports ) {
	const premiumSnippets = new Set();
	const premiumBase = imports[ 'ckeditor5-premium-features/' ];

	for ( const output of Object.values( metafile.outputs ) ) {
		if ( output.entryPoint && output.imports.some( ( { external, path } ) => external && (
			path.startsWith( 'ckeditor5-premium-features/' ) || imports[ path ]?.startsWith( premiumBase )
		) ) ) {
			premiumSnippets.add( upath.resolve( output.entryPoint ) );
		}
	}

	return premiumSnippets;
}
