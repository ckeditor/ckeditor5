/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

import upath from 'upath';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath( import.meta.url );
const __dirname = upath.dirname( __filename );

async function extractFeaturesDigest() {
	const mdPath = upath.join( __dirname, '../../docs/features/feature-digest.md' );
	const content = await fs.readFile( mdPath, 'utf-8' );

	// Extract content between markers
	const startMarker = '<!--FEATURES_DIGEST_START-->';
	const endMarker = '<!--FEATURES_DIGEST_END-->';
	const regex = new RegExp( `${ startMarker }([\\s\\S]*?)${ endMarker }`, 'g' );
	const match = regex.exec( content );

	if ( !match ) {
		throw new Error( 'Could not find markers in feature-digest.md' );
	}

	const digestContent = match[ 1 ].trim();

	// Split by ## to get sections
	const sectionRegex = /^## (.+)$/gm;
	const sections = [];
	const sectionMatches = [ ...digestContent.matchAll( sectionRegex ) ];

	for ( let i = 0; i < sectionMatches.length; i++ ) {
		const sectionMatch = sectionMatches[ i ];
		const sectionTitle = sectionMatch[ 1 ];
		const sectionStart = sectionMatch.index + sectionMatch[ 0 ].length;
		const sectionEnd = i < sectionMatches.length - 1 ? sectionMatches[ i + 1 ].index : digestContent.length;
		const sectionContent = digestContent.substring( sectionStart, sectionEnd ).trim();

		// Extract section description (first paragraph)
		const descMatch = /^([^#<\n]+(?:\n[^#<\n]+)*?)(?=\n\n(?:###|<ck:heading-badge))/s.exec( sectionContent );
		const description = descMatch ? descMatch[ 1 ].trim() : '';

		// Extract subsections
		const subsections = extractSubsections( sectionContent );

		sections.push( {
			id: titleToId( sectionTitle ),
			title: sectionTitle,
			description,
			subsections
		} );
	}

	const output = { sections };

	// Ensure data directory exists
	await fs.ensureDir( upath.join( __dirname, '../../docs/data' ) );

	await fs.writeJson(
		upath.join( __dirname, '../../docs/data/features-digest-source.json' ),
		output,
		{ spaces: 2 }
	);

	console.log( `Extraction complete! Found ${ sections.length } sections.` );
	console.log( `Total subsections: ${ sections.reduce( ( sum, s ) => sum + s.subsections.length, 0 ) }` );
}

function extractSubsections( sectionContent ) {
	const subsections = [];

	// Find all ### headings and <ck:heading-badge> elements
	const subsectionMarkers = [
		...sectionContent.matchAll( /^### (.+)$/gm ),
		...sectionContent.matchAll( /<ck:heading-badge[^>]*>/g )
	].sort( ( a, b ) => a.index - b.index );

	for ( let i = 0; i < subsectionMarkers.length; i++ ) {
		const marker = subsectionMarkers[ i ];
		const start = marker.index;
		const end = i < subsectionMarkers.length - 1 ? subsectionMarkers[ i + 1 ].index : sectionContent.length;
		const subsectionContent = sectionContent.substring( start, end ).trim();

		const subsection = parseSubsection( subsectionContent );
		if ( subsection ) {
			subsections.push( subsection );
		}
	}

	return subsections;
}

function parseSubsection( content ) {
	// Check if it's a heading-badge type
	const headingBadgeMatch = /<ck:heading-badge heading-id='([^']+)' badge='([^']+)'>([^<]+)<\/ck:heading-badge>/.exec( content );
	if ( headingBadgeMatch ) {
		const [ , id, badge, title ] = headingBadgeMatch;

		// Extract description (between closing tag and button link)
		const descMatch = /<\/ck:heading-badge>\s*\n\n([^<]+?)(?=\n\n<ck:button-link)/s.exec( content );
		const description = descMatch ? descMatch[ 1 ].trim() : '';

		// Extract link
		const linkMatch = /<ck:button-link[^>]*href='([^']+)'/.exec( content );
		const link = linkMatch ? linkMatch[ 1 ] : '';

		return {
			id,
			title: title.trim(),
			type: 'heading-badge',
			badge,
			description,
			link
		};
	}

	// Check if it's a simple ### heading (with description and button)
	const simpleHeadingMatch = /^### (.+)$/m.exec( content );
	if ( simpleHeadingMatch && !content.includes( '<ck:columns>' ) && !content.includes( '<ck:card>' ) ) {
		const title = simpleHeadingMatch[ 1 ];

		// Extract description
		const descMatch = /^### .+$\n\n([^<]+?)(?=\n\n<ck:button-link)/ms.exec( content );
		const description = descMatch ? descMatch[ 1 ].trim() : '';

		// Extract link
		const linkMatch = /<ck:button-link[^>]*href='([^']+)'/.exec( content );
		const link = linkMatch ? linkMatch[ 1 ] : '';

		return {
			id: titleToId( title ),
			title,
			type: 'simple',
			description,
			link
		};
	}

	// Check if it's a subsection with card grid (###  title + <ck:columns>)
	const gridHeadingMatch = /^### (.+)$/m.exec( content );
	if ( gridHeadingMatch && content.includes( '<ck:columns>' ) ) {
		const title = gridHeadingMatch[ 1 ];

		// Extract description (between title and <ck:columns>)
		const descMatch = /^### .+$\n\n([^<]+?)(?=\n\n<ck:columns>)/ms.exec( content );
		const description = descMatch ? descMatch[ 1 ].trim() : '';

		// Extract cards from <ck:columns> block
		const columnsMatch = /<ck:columns>([\s\S]*?)<\/ck:columns>/.exec( content );
		const features = columnsMatch ? extractCards( columnsMatch[ 1 ] ) : [];

		return {
			id: titleToId( title ),
			title,
			type: 'subsection-with-grid',
			description,
			features
		};
	}

	// Check if it's a single standalone card
	if ( content.includes( '<ck:card>' ) && !content.includes( '<ck:columns>' ) ) {
		const card = extractSingleCard( content );
		if ( card ) {
			return {
				...card,
				type: 'single-card'
			};
		}
	}

	return null;
}

function extractCards( columnsContent ) {
	const cards = [];
	const cardRegex = /<ck:card>([\s\S]*?)<\/ck:card>/g;
	let match;

	while ( ( match = cardRegex.exec( columnsContent ) ) !== null ) {
		const cardContent = match[ 1 ];

		// Extract title and badge
		const titleMatch = /<ck:card-title level='4' heading-id='([^']+)'>([^<]+)(?:<ck:badge variant='([^']+)' \/>)?/.exec( cardContent );
		if ( !titleMatch ) {
			continue;
		}

		const [ , id, titleText, badge ] = titleMatch;

		// Extract description (handles backticks with < > inside)
		const descMatch = /<ck:card-description>\s*([\s\S]+?)\s*<\/ck:card-description>/.exec( cardContent );
		const description = descMatch ? descMatch[ 1 ].trim() : '';

		// Extract link
		const linkMatch = /<ck:button-link[^>]*href='([^']+)'/.exec( cardContent );
		const link = linkMatch ? linkMatch[ 1 ] : '';

		cards.push( {
			id,
			title: titleText.trim(),
			badge: badge || null,
			description,
			link
		} );
	}

	return cards;
}

function extractSingleCard( content ) {
	// Extract card content
	const cardMatch = /<ck:card>([\s\S]*?)<\/ck:card>/.exec( content );
	if ( !cardMatch ) {
		return null;
	}

	const cardContent = cardMatch[ 1 ];

	// Extract title and badge
	const titleMatch = /<ck:card-title level='4' heading-id='([^']+)'>([^<]+)(?:<ck:badge variant='([^']+)' \/>)?/.exec( cardContent );
	if ( !titleMatch ) {
		return null;
	}

	const [ , id, titleText, badge ] = titleMatch;

	// Extract description (handles backticks with < > inside)
	const descMatch = /<ck:card-description>\s*([\s\S]+?)\s*<\/ck:card-description>/.exec( cardContent );
	const description = descMatch ? descMatch[ 1 ].trim() : '';

	// Extract link
	const linkMatch = /<ck:button-link[^>]*href='([^']+)'/.exec( cardContent );
	const link = linkMatch ? linkMatch[ 1 ] : '';

	return {
		id,
		title: titleText.trim(),
		badge: badge || null,
		description,
		link
	};
}

function titleToId( title ) {
	return title
		.toLowerCase()
		.replace( /[^a-z0-9]+/g, '-' )
		.replace( /^-|-$/g, '' );
}

extractFeaturesDigest().catch( err => {
	console.error( 'Error:', err );
	process.exit( 1 );
} );
