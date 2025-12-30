/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

import fs from 'fs-extra';
import upath from 'upath';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath( import.meta.url );
const __dirname = upath.dirname( __filename );

export default async function generateFeaturesDigest() {
	// Read JSON source
	const sourcePath = upath.join( __dirname, '../../docs/data/features-digest-source.json' );
	const { sections } = await fs.readJson( sourcePath );

	// Generate markdown
	const output = sections.map( section => generateSection( section ) ).join( '\n\n' );

	// Replace content between markers
	const mdPath = upath.join( __dirname, '../../docs/features/feature-digest.md' );
	const content = await fs.readFile( mdPath, 'utf-8' );

	const startMarker = '<!--FEATURES_DIGEST_START-->';
	const endMarker = '<!--FEATURES_DIGEST_END-->';
	const regex = new RegExp( `${ startMarker }[\\s\\S]*?${ endMarker }`, 'g' );

	const modified = content.replace(
		regex,
		`${ startMarker }\n\n${ output }\n${ endMarker }`
	);

	await fs.writeFile( mdPath, modified, 'utf-8' );

	console.log( 'Feature digest generated successfully!' );
}

function generateSection( section ) {
	const subsections = section.subsections.map( s => generateSubsection( s ) ).join( '\n\n' );

	return `## ${ section.title }

${ section.description }

${ subsections }`;
}

function generateSubsection( subsection ) {
	switch ( subsection.type ) {
		case 'subsection-with-grid':
			return generateCardGrid( subsection );
		case 'heading-badge':
			return generateHeadingBadge( subsection );
		case 'simple':
			return generateSimpleFeature( subsection );
		case 'single-card':
			return generateSingleCard( subsection );
		default:
			throw new Error( `Unknown subsection type: ${ subsection.type }` );
	}
}

function generateCardGrid( subsection ) {
	const cards = subsection.features.map( f => generateCard( f ) ).join( '\n\n' );

	return `### ${ subsection.title }

${ subsection.description }

<ck:columns>
${ cards }
</ck:columns>`;
}

function generateCard( feature ) {
	const badge = feature.badge ? ` <ck:badge variant='${ feature.badge }' />` : '';

	return `\t<ck:card>
\t\t<ck:card-title level='4' heading-id='${ feature.id }'>
\t\t\t${ feature.title }${ badge }
\t\t</ck:card-title>
\t\t<ck:card-description>
\t\t\t${ feature.description }
\t\t</ck:card-description>
\t\t<ck:card-footer>
\t\t\t<ck:button-link size='sm' variant='secondary' href='${ feature.link }'>
\t\t\t\tFeature page
\t\t\t</ck:button-link>
\t\t</ck:card-footer>
\t</ck:card>`;
}

function generateHeadingBadge( subsection ) {
	return `<ck:heading-badge heading-id='${ subsection.id }' badge='${ subsection.badge }'>${ subsection.title }</ck:heading-badge>

${ subsection.description }

<ck:button-link size='sm' variant='secondary' href='${ subsection.link }'>
\tFeature page
</ck:button-link>`;
}

function generateSimpleFeature( subsection ) {
	return `### ${ subsection.title }

${ subsection.description }

<ck:button-link size='sm' variant='secondary' href='${ subsection.link }'>
\tFeature page
</ck:button-link>`;
}

function generateSingleCard( subsection ) {
	const badge = subsection.badge ? ` <ck:badge variant='${ subsection.badge }' />` : '';

	return `<ck:card>
\t<ck:card-title level='4' heading-id='${ subsection.id }'>
\t\t${ subsection.title }${ badge }
\t</ck:card-title>
\t<ck:card-description>
\t\t${ subsection.description }
\t</ck:card-description>
\t<ck:card-footer>
\t\t<ck:button-link size='sm' variant='secondary' href='${ subsection.link }'>
\t\t\tFeature page
\t\t</ck:button-link>
\t</ck:card-footer>
</ck:card>`;
}

// Run the function if this script is executed directly
if ( import.meta.url === `file://${ process.argv[ 1 ] }` ) {
	generateFeaturesDigest().catch( err => {
		console.error( 'Error:', err );
		process.exit( 1 );
	} );
}
