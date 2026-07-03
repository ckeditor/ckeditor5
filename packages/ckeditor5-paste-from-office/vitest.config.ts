/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { readFileSync } from 'node:fs';
import { mergeConfig, defineConfig, type ViteUserConfig } from 'vitest/config';
import { createVitestConfig } from '../../vitest.config';

const base: ViteUserConfig = createVitestConfig( import.meta.dirname, {
	name: 'paste-from-office',
	exclude: [
		'**/_data/**'
	]
} );

const config: ViteUserConfig = mergeConfig( base, defineConfig( {
	plugins: [
		{
			name: 'load-html-rtf',
			enforce: 'pre',
			load( id: string ) {
				if ( id.endsWith( '.html' ) || id.endsWith( '.rtf' ) ) {
					const content = readFileSync( id, 'utf-8' );

					return `export default ${ JSON.stringify( content ) };`;
				}
			}
		}
	]
} ) );

export default config;
