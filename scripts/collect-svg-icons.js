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
	if ( !fs.existsSync( BUILD_DIRECTORY ) ) {
		fs.mkdirSync( BUILD_DIRECTORY );
	}

	if ( fs.existsSync( ICONS_DIRECTORY ) ) {
		fs.rmSync( ICONS_DIRECTORY, { recursive: true, force: true } );
	}

	fs.mkdirSync( ICONS_DIRECTORY );

	const svgFilesData = glob.sync( '**/packages/*/theme/icons/*.svg', {
		cwd: ROOT_DIRECTORY,
		ignore: [ '**/build/**', '**/node_modules/**' ]
	} ).map( svgFilePath => {
		const normalizedPath = normalizePath( svgFilePath );
		const [ , packageName, originalFilename ] = normalizedPath.match( /packages\/([^/]+)\S+\/([^/]+)\.svg/ );
		const originalPath = normalizePath( path.resolve( svgFilePath ) );
		const newFilename = `${ packageName }___${ originalFilename }.png`;
		const newPath = path.join( ICONS_DIRECTORY, newFilename );
		const shorthand = `{@icon @ckeditor/${ normalizedPath.split( 'packages/' )[ 1 ] }}`;
		const isExternal = normalizedPath.includes( 'external/' );

		return { packageName, originalFilename, originalPath, newFilename, newPath, shorthand, isExternal };
	} ).sort( ( a, b ) => {
		return a.isExternal - b.isExternal ||
		a.packageName.localeCompare( b.packageName ) ||
		a.originalFilename.localeCompare( b.originalFilename );
	} );

	for ( const svgFileData of svgFilesData ) {
		await sharp( svgFileData.originalPath ).png().toFile( svgFileData.newPath );
	}

	const htmlPath = normalizePath( path.join( ICONS_DIRECTORY, 'index.html' ) );
	fs.writeFileSync( htmlPath, createHtmlContent( svgFilesData ), 'utf-8' );

	console.log( chalk.green( `Summary: ${ chalk.underline( htmlPath ) }` ) );
}

function normalizePath( _path ) {
	return _path.split( path.sep ).join( path.posix.sep );
}

function createHtmlContent( svgFilesData ) {
	const svgFileDataByPackage = svgFilesData.reduce( ( svgFileDataByPackage, svgFileData ) => {
		if ( !svgFileDataByPackage[ svgFileData.packageName ] ) {
			svgFileDataByPackage[ svgFileData.packageName ] = [];
		}

		svgFileDataByPackage[ svgFileData.packageName ].push( svgFileData );

		return svgFileDataByPackage;
	}, {} );

	return [
		'<!DOCTYPE html>',
		'<html>',
		'	<head>',
		'		<style>',
		'			body { font-family: arial }',
		'			table { border-collapse: collapse; margin: auto; margin-bottom: 25vh; }',
		'			thead tr:first-child th { padding-top: 20px; font-size: 150%; text-transform: uppercase; }',
		'			td { border: 1px solid black; }',
		'			img { max-height: 20px; }',
		'		</style>',
		'	</head>',
		'	<body>',
		'		<table>',
		Object.values( svgFileDataByPackage ).map( createHtmlTableSection ).join( '\n' ),
		'		</table>',
		'	</body>',
		'</html>'
	].join( '\n' );
}

function createHtmlTableSection( svgFilesData ) {
	const tableRows = svgFilesData.map( svgFileData => {
		return [
			'				<tr>',
			`					<td>${ svgFileData.originalFilename }</td>`,
			`					<td>${ svgFileData.shorthand }</td>`,
			'					<td>',
			`						<a target="_blank" href="${ svgFileData.newFilename }"><img src="${ svgFileData.newFilename }"></a>`,
			'					</td>',
			'				</tr>'
		].join( '\n' );
	} ).join( '\n' );

	return [
		'			<thead>',
		'				<tr>',
		`					<th colspan="3">${ svgFilesData[ 0 ].packageName }</th>`,
		'				</tr>',
		'				<tr>',
		'					<th>Icon Name</th><th>Shorthand</th><th>PNG</th>',
		'				</tr>',
		'			</thead>',
		'			<tbody>',
		tableRows,
		'			</tbody>'
	].join( '\n' );
}
