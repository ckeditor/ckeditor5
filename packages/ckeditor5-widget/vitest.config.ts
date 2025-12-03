/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

// In monorepo we can use "Projects" feature of Vitest: https://vitest.dev/guide/projects.html.
export default defineConfig( {
	test: {
		isolate: false,

		/**
		 * Test configuration.
		 */
		include: [
			'tests/**/*.{js,ts}'
		],
		exclude: [
			'**/_utils',
			'**/fixtures',
			'**/manual'
		],
		setupFiles: [
			'./test_setup.js'
		],
		testTimeout: 5_000,

		/**
		 * Browser configuration.
		 */
		browser: {
			enabled: true,
			provider: playwright(),
			screenshotFailures: false,
			instances: [
				{ browser: 'chromium' }
			]
		},

		/**
		 * Coverage configuration.
		 */
		coverage: {
			provider: 'v8',
			clean: true,
			thresholds: {
				100: true
			}
		}
	},

	publicDir: resolve( fileURLToPath( import.meta.resolve( '@ckeditor/ckeditor5-utils/package.json' ) ), '../tests/_assets' ),

	plugins: [
		{
			name: 'load-svg',
			enforce: 'pre',
			load( id: string ) {
				if ( id.endsWith( '.svg' ) ) {
					const escaped = readFileSync( id, 'utf-8' ).replace( /`/g, '\\`' );

					return `export default \`${ escaped }\`;`;
				}
			}
		}

		/*
    // We can use this plugin if we dont want to remove `/assets/` prefix from asset URLs in tests.
    {
      name: 'serve-test-assets',
      configureServer( server ) {
        const rootDir = resolve( fileURLToPath( import.meta.resolve( '@ckeditor/ckeditor5-utils/package.json' ) ), '../tests/_assets' );

        server.middlewares.use( '/assets', ( req, res, next ) => {
          const url = req.url || '';
          const filePath = join( rootDir, url.replace( /^\/+/, '' ) );

          if ( !filePath.startsWith( rootDir ) ) {
            // Basic security: don’t escape rootDir
            res.statusCode = 403;
            res.end( 'Forbidden' );
            return;
          }

          try {
            const file = readFileSync( filePath );

            res.statusCode = 200;
            res.end( file );
          } catch {
            next();
          }
        } );
      }
    }
    */
	]
} );
