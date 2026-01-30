/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * A lightweight HTTP server tailored for memory testing.
 *
 * It serves assets from the provided assets directory and injects security headers
 * required for high-resolution memory measurement in Chromium.
 *
 * Security / hardening notes:
 * - Binds to `127.0.0.1` and port 8080 (local-only server).
 * - Rejects malformed URLs and disallows backslashes / NUL bytes in the path to avoid
 *   platform-specific path parsing quirks.
 * - Prevents directory traversal and symlink escapes:
 *   - The requested path is resolved against the provided assets directory.
 *   - Both the base directory and the target path are dereferenced via `realpath()`,
 *     and the request is allowed only if the resulting target stays within the provided assets directory.
 * - Restricts served files to an allowlist of extensions (`.html`, `.js`, `.css`).
 *
 * Cross-Origin Isolation:
 * - Injects `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`
 *   (plus `Cross-Origin-Resource-Policy: same-origin`) to enable cross-origin isolation, a prerequisite
 *   for `performance.measureUserAgentSpecificMemory()`.
 */

import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

const CONTENT_TYPES = new Map( [
	[ '.html', 'text/html; charset=utf-8' ],
	[ '.js', 'text/javascript; charset=utf-8' ],
	[ '.css', 'text/css; charset=utf-8' ]
] );

export async function startServer( assetsDir ) {
	const server = createServer( ( req, res ) => {
		handleRequest( req, res, assetsDir ).catch( () => badRequest( res ) );
	} );

	await new Promise( resolve => server.listen( 8080, '127.0.0.1', resolve ) );

	return server;
}

function badRequest( res ) {
	res.writeHead( 400 );
	res.end( 'Bad Request' );
}

async function handleRequest( req, res, assetsDir ) {
	if ( req.method !== 'GET' && req.method !== 'HEAD' ) {
		return badRequest( res );
	}

	let pathname = '/';

	try {
		pathname = new URL( req.url ?? '/', 'http://localhost' ).pathname;
		pathname = decodeURIComponent( pathname );
		pathname = pathname.replace( /^\/+/, '' );
	} catch {
		return badRequest( res );
	}

	if ( pathname.includes( '\\' ) || pathname.includes( '\0' ) ) {
		return badRequest( res );
	}

	const absoluteFilePath = resolve( assetsDir, pathname );

	try {
		const [ realBase, realTarget ] = await Promise.all( [
			realpath( assetsDir ),
			realpath( absoluteFilePath )
		] );

		const base = realBase.endsWith( sep ) ? realBase : realBase + sep;
		const extension = extname( realTarget ).toLowerCase();
		const type = CONTENT_TYPES.get( extension );

		if ( !realTarget.startsWith( base ) || !type ) {
			return badRequest( res );
		}

		const body = await readFile( realTarget );

		res.setHeader( 'Cross-Origin-Opener-Policy', 'same-origin' );
		res.setHeader( 'Cross-Origin-Embedder-Policy', 'require-corp' );
		res.setHeader( 'Cross-Origin-Resource-Policy', 'same-origin' );
		res.setHeader( 'X-Content-Type-Options', 'nosniff' );
		res.setHeader( 'Content-Type', type );
		res.setHeader( 'Cache-Control', 'no-store' );
		res.writeHead( 200 );
		res.end( body );
	} catch {
		return badRequest( res );
	}
}
