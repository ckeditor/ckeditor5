/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

const fs = require( 'fs' );
const path = require( 'path' );

const ROOT_DIRECTORY = path.join( __dirname, '..', '..' );
const VERSIONS_TO_PRINT = 3;

/**
 * Returns changelogs formatted in markdown for the last three versions of the CKEditor 5 releases.
 * Additionally, the following sections for each entry are modified:
 *
 * - The "ℹ️" symbol is removed.
 * - The "Released packages" section is removed.
 * - If the "Release highlights" section contains a paragraph with link to a blog post,
 *   then the entire section except for the paragraph with the link is removed.
 *
 * @returns {String}
 */
module.exports = () => {
	const changelogContent = fs.readFileSync( path.join( ROOT_DIRECTORY, 'CHANGELOG.md' ), 'utf-8' );

	// Get all releases from the changelog file.
	return [ ...changelogContent.matchAll( /## \[(?<version>\d+\.\d+\.\d+)\]/g ) ]
		// Take `version` from matches.
		.map( match => match.groups.version )
		// Take three latest.
		.slice( 0, VERSIONS_TO_PRINT )
		// And map each version to its changelog entries.
		.map( version => {
			// `slice` removes the `v` prefix.
			const changelog = getChangesForVersion( changelogContent, version )
				// Remove the `ℹ️` character along with its link from breaking change headers.
				.replace( / \[ℹ️\]\(.+\)$/gm, '' )
				// Replace `Release highlights` section with just a single paragraph containing the link to the blog post.
				.replace( getSectionRegexp( 'Release highlights' ), section => {
					// Blog post paragraph starts with a new line, contains the link and ends with a new line.
					const blogPostLink = 'https://ckeditor.com/blog/';
					const blogPostParagraphRegexp = new RegExp( `(?<=\n).*?${ blogPostLink }.*?(?=\n)` );
					const result = section.match( blogPostParagraphRegexp );

					// If there is no blog post link, then keep the highlights section.
					if ( !result ) {
						return section;
					}

					// Replace the raw text url with a functioning link.
					return result[ 0 ].replace(
						new RegExp( blogPostLink + '\\S+' ),
						url => `[${ url }](${ url })`
					);
				} )
				// Remove `Released packages` section.
				.replace( getSectionRegexp( 'Released packages' ), '' );

			return [
				`## CKEditor 5 ${ version } release`,
				'',
				`${ changelog }`,
				''
			].join( '\n' );
		} )
		// Then, merge everything into a single string.
		.join( '\n' );
};

function getChangesForVersion( content, version ) {
	version = version.replace( /^v/, '' );

	const changelog = content.replace( 'Changelog\n=========\n\n', '\n' );
	const match = changelog.match( new RegExp( `\\n(## \\[?${ version }\\]?[\\s\\S]+?)(?:\\n## \\[?|$)` ) );

	if ( !match || !match[ 1 ] ) {
		return null;
	}

	return match[ 1 ].replace( /##[^\n]+\n/, '' ).trim();
}

/**
 * Returns regexp that matches entire section of the given name,
 * along with its header. RegExp logic is as follows:
 *
 * - Title is case insensitive. (flag `i`)
 * - Section starts with one or more `#` followed by a space and the title.
 * - Section ends with either:
 *     - Newline followed by `#`.
 *     - End of the string.
 *
 * @param {String} sectionTitle
 * @returns {RegExp}
 */
function getSectionRegexp( sectionTitle ) {
	return new RegExp( `#+ ${ sectionTitle }[\\s\\S]+?(?=\\n#|$)`, 'i' );
}
