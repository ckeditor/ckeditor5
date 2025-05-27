#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import path from 'upath';
import fsExtra from 'fs-extra';
import { checkbox } from '@inquirer/prompts';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';

const OUTPUT_DIRECTORY = path.join( CKEDITOR5_ROOT_PATH, 'build', 'emoji-cdn' );

await fsExtra.remove( OUTPUT_DIRECTORY );
await fsExtra.mkdirp( OUTPUT_DIRECTORY );

const languages = await checkbox( {
	message: 'Select languages to process',
	choices: [
		{ value: 'en', checked: true }
	]
} );

const versions = await checkbox( {
	message: 'Select Unicode versions to process',
	choices: [
		{ value: 15, checked: true },
		{ value: 16, checked: true }
	]
} );

for ( const language of languages ) {
	for ( const version of versions ) {
		const shortcode = await fetchResource( version, language, 'shortcodes/emojibase.json' );
		const items = await fetchResource( version, language, 'data.json' );

		const results = items
			.filter( entry => 'group' in entry )
			.map( entry => {
				const output = {
					emoji: entry.emoji,
					group: entry.group,
					order: entry.order,
					tags: entry.tags,
					version: entry.version,
					annotation: entry.label
				};

				if ( entry.emoticon ) {
					output.emoticon = toArray( entry.emoticon ).at( -1 );
				}

				if ( shortcode[ entry.hexcode ] ) {
					output.shortcodes = toArray( shortcode[ entry.hexcode ] );
				}

				if ( 'skins' in entry ) {
					output.skins = entry.skins.map( emojiSkin => ( {
						tone: emojiSkin.tone,
						emoji: emojiSkin.emoji,
						version: emojiSkin.version
					} ) );
				}

				return output;
			} );

		const outputFilePath = path.join( OUTPUT_DIRECTORY, `${ version }/${ language }.json` );
		await fsExtra.ensureDir( path.dirname( outputFilePath ) );
		await fsExtra.writeJson( outputFilePath, results );
	}
}

/**
 * @param {string} packageVersion
 * @param {string} language
 * @param {string} file
 * @returns {Promise}
 */
function fetchResource( packageVersion, language, file ) {
	return fetch( `https://cdn.jsdelivr.net/npm/emojibase-data@^${ packageVersion }/${ language }/${ file }` )
		.then( response => {
			if ( !response.ok ) {
				return null;
			}

			return response.json();
		} );
}

/**
 * @param data
 * @returns {Array}
 */
function toArray( data ) {
	return Array.isArray( data ) ? data : [ data ];
}
