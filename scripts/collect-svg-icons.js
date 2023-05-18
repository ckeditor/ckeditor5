/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const chalk = require( 'chalk' );
const fs = require( 'fs' );
const glob = require( 'glob' );
const path = require( 'path' );
const sharp = require( 'sharp' );

const ROOT_DIRECTORY = path.join( __dirname, '..' );
const BUILD_DIRECTORY = path.join( ROOT_DIRECTORY, 'build' );
const ICONS_DIRECTORY = path.join( BUILD_DIRECTORY, 'icons' );

collectSvgIcons();

async function collectSvgIcons() {
	logProcess( 'Cleaning the build directory...' );

	if ( !fs.existsSync( BUILD_DIRECTORY ) ) {
		fs.mkdirSync( BUILD_DIRECTORY );
	}

	if ( fs.existsSync( ICONS_DIRECTORY ) ) {
		fs.rmSync( ICONS_DIRECTORY, { recursive: true, force: true } );
	}

	fs.mkdirSync( ICONS_DIRECTORY );

	logProcess( 'Collecting SVG icons...' );

	const globOptions = { cwd: ROOT_DIRECTORY, ignore: [ '**/build/**', '**/node_modules/**' ] };
	const svgFilesData = glob.sync( '**/packages/*/theme/icons/*.svg', globOptions ).map( getDataFromPath );

	logProcess( 'Converting to PNG...' );

	for ( const svgFileData of svgFilesData ) {
		await sharp( svgFileData.originalPath ).png().toFile( svgFileData.pngFilePath );
	}

	logProcess( 'Creating HTML file...' );

	const htmlPath = normalizePath( path.join( ICONS_DIRECTORY, 'index.html' ) );
	fs.writeFileSync( htmlPath, createHtmlContent( svgFilesData ), 'utf-8' );

	console.log( chalk.green( `✔️  Done. Summary: ${ chalk.underline( htmlPath ) }` ) );
}

function logProcess( message ) {
	console.log( chalk.blue( `🔹 ${ message }` ) );
}

function normalizePath( _path ) {
	return _path.split( path.sep ).join( path.posix.sep );
}

function getDataFromPath( svgFilePath ) {
	const normalizedPath = normalizePath( svgFilePath );
	const repositoryName = normalizedPath.startsWith( 'external/' ) ? normalizedPath.match( /external\/([^/]+)/ )[ 1 ] : 'ckeditor5';
	const [ , packageName, iconName ] = normalizedPath.match( /packages\/([^/]+)\S+\/([^/]+)\.svg/ );
	const originalPath = normalizePath( path.resolve( svgFilePath ) );
	const newFilename = `${ packageName }__${ iconName }.png`;
	const pngFilePath = path.join( ICONS_DIRECTORY, newFilename );
	const umbertoSnippet = `{@icon @ckeditor/${ normalizedPath.split( 'packages/' )[ 1 ] }}`;

	return { repositoryName, packageName, iconName, originalPath, newFilename, pngFilePath, umbertoSnippet };
}

function createHtmlContent( svgFilesData ) {
	return [
		'<!DOCTYPE html>',
		'<html>',
		'	<head>',
		'		<title>CKEditor 5 Icons</title>',
		'		<style>',
		'			* { box-sizing: border-box; }',
		'			body { font-family: Arial; }',
		'			table { border-collapse: collapse; margin: auto; margin-bottom: 25vh; }',
		'			.repositoryHeader tr:first-child th { padding-top: 20px; font-size: 200%; }',
		'			.packageHeader tr:first-child th { padding-top: 20px; font-size: 150%; }',
		'			tbody tr:nth-child(odd) td {background: #e5e5e5; }',
		'			td { border: 1px solid black; padding: 2px; }',
		'			img { max-height: 20px; }',
		'		</style>',
		'	</head>',
		'	<body>',
		'		<table>',
		...createTableContent( svgFilesData ),
		'		</table>',
		'	</body>',
		'</html>'
	].join( '\n' );
}

function createTableContent( svgFilesData ) {
	const repositories = [ ...new Set( svgFilesData.map( svgFileData => svgFileData.repositoryName ) ) ].sort();
	const packages = [ ...new Set( svgFilesData.map( svgFileData => svgFileData.packageName ) ) ].sort();

	const tableRows = [];

	for ( const repositoryName of repositories ) {
		tableRows.push(
			'			<thead class="repositoryHeader">',
			'				<tr>',
			`					<th colspan="3">${ repositoryName }</th>`,
			'				</tr>',
			'			</thead>'
		);

		for ( const packageName of packages ) {
			const packageBelongsToRepository = svgFilesData.some( svgFileData => {
				return svgFileData.repositoryName === repositoryName && svgFileData.packageName === packageName;
			} );

			if ( !packageBelongsToRepository ) {
				continue;
			}

			const svgFilesFromThisPackage = svgFilesData.filter( svgFileData => svgFileData.packageName === packageName )
				.sort( ( a, b ) => a.iconName.localeCompare( b.iconName ) );

			tableRows.push(
				'			<thead class="packageHeader">',
				'				<tr>',
				`					<th colspan="3">@ckeditor/${ packageName }</th>`,
				'				</tr>',
				'				<tr>',
				'					<th>Icon Name</th><th>Umberto snippet</th><th>PNG</th>',
				'				</tr>',
				'			</thead>',
				'			<tbody>',
				...svgFilesFromThisPackage.flatMap( createSvgFileRow ),
				'			</tbody>'
			);
		}
	}

	return tableRows;
}

function createSvgFileRow( svgFileData ) {
	return [
		'				<tr>',
		`					<td>${ svgFileData.iconName }</td>`,
		`					<td><code>${ svgFileData.umbertoSnippet }</code></td>`,
		'					<td>',
		`						<a href="${ svgFileData.newFilename }"><img src="${ svgFileData.newFilename }"></a>`,
		'					</td>',
		'				</tr>'
	];
}
