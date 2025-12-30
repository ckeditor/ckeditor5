/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * # Features Digest Automation
 *
 * This script automatically generates the content of docs/features/feature-digest.md from the structured
 * data in docs/data/features-digest-source.json. It runs as a beforeHexo hook during documentation builds.
 *
 * ## Overview
 *
 * The feature-digest-source.json file contains structured data for all CKEditor 5 features (~155 features
 * across 9 sections). During the documentation build, this script regenerates the content between the
 * markers (<!--FEATURES_DIGEST_START--> and <!--FEATURES_DIGEST_END-->) in feature-digest.md.
 *
 * ## Workflow
 *
 * ### Adding a New Feature
 * 1. Edit docs/data/features-digest-source.json
 * 2. Add your feature to the appropriate section/subsection
 * 3. Run `pnpm run docs` (the generation happens automatically via hook)
 * 4. Commit both the JSON and generated markdown file
 *
 * ### Updating an Existing Feature
 * 1. Find the feature by its `id` in features-digest-source.json
 * 2. Edit the description, link, or badge
 * 3. Regenerate via `pnpm run docs`
 * 4. Commit changes
 *
 * ### Manually Testing Generation
 * ```bash
 * node scripts/docs/generate-features-digest.mjs
 * ```
 *
 * Note: The JSON source file was created by a one-time extraction script that has since been removed.
 *
 * ## JSON Schema
 *
 * ### Section Structure
 * {
 *   "sections": [
 *     {
 *       "id": "section-id",
 *       "title": "Section Title",
 *       "description": "Section description...",
 *       "subsections": [...]
 *     }
 *   ]
 * }
 *
 * ### Subsection Types
 *
 * #### 1. Subsection with Card Grid
 * Multiple features displayed in a card grid layout.
 * {
 *   "id": "subsection-id",
 *   "title": "Subsection Title",
 *   "type": "subsection-with-grid",
 *   "description": "Description...",
 *   "features": [
 *     {
 *       "id": "feature-id",
 *       "title": "Feature Name",
 *       "badge": "premium" | null,
 *       "description": "Feature description...",
 *       "link": "{@link features/feature-name}"
 *     }
 *   ]
 * }
 *
 * #### 2. Heading Badge (Simple)
 * Feature with badge, description, and single link.
 * {
 *   "id": "feature-id",
 *   "title": "Feature Name",
 *   "type": "heading-badge",
 *   "badge": "premium" | "experiment",
 *   "description": "Feature description...",
 *   "link": "{@link features/feature-name}"
 * }
 *
 * #### 3. Heading Badge with Embedded Content
 * Feature with badge, description, and embedded card(s). No button link is rendered after the embedded content.
 * {
 *   "id": "feature-id",
 *   "title": "Feature Name",
 *   "type": "heading-badge-with-embedded-content",
 *   "badge": "premium" | "experiment",
 *   "description": "Feature description...",
 *   "link": "{@link features/feature-name}",
 *   "features": [
 *     {
 *       "id": "sub-feature-id",
 *       "title": "Sub-feature Name",
 *       "badge": "premium" | null,
 *       "description": "Sub-feature description...",
 *       "link": "{@link features/sub-feature}"
 *     }
 *   ]
 * }
 * Note: If features.length === 1, renders as single card (no columns).
 *       If features.length > 1, renders as card grid with <ck:columns>.
 *
 * #### 4. Simple Feature
 * Basic feature with description and optional link.
 * {
 *   "id": "feature-id",
 *   "title": "Feature Name",
 *   "type": "simple",
 *   "description": "Feature description...",
 *   "link": "{@link features/feature-name}" (optional)
 * }
 *
 * #### 5. Single Card
 * Standalone card (not in grid).
 * {
 *   "id": "feature-id",
 *   "title": "Feature Name",
 *   "type": "single-card",
 *   "badge": "premium" | null,
 *   "description": "Feature description...",
 *   "link": "{@link features/feature-name}"
 * }
 *
 * ## Special Features
 *
 * ### External Links
 * Links that don't use {@link} syntax (e.g., https://...) automatically get `target='_blank'` attribute.
 *
 * ### Badge Types
 * - "premium" - Premium/commercial feature
 * - "experiment" - Experimental feature
 * - null - Free/open-source feature
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
		case 'heading-badge-with-embedded-content':
			return generateHeadingBadgeWithEmbeddedContent( subsection );
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
	const targetAttr = isExternalUrl( feature.link ) ? ' target=\'_blank\'' : '';

	return `\t<ck:card>
\t\t<ck:card-title level='4' heading-id='${ feature.id }'>
\t\t\t${ feature.title }${ badge }
\t\t</ck:card-title>
\t\t<ck:card-description>
\t\t\t${ feature.description }
\t\t</ck:card-description>
\t\t<ck:card-footer>
\t\t\t<ck:button-link size='sm' variant='secondary' href='${ feature.link }'${ targetAttr }>
\t\t\t\tFeature page
\t\t\t</ck:button-link>
\t\t</ck:card-footer>
\t</ck:card>`;
}

function generateCardNoIndent( feature ) {
	const badge = feature.badge ? ` <ck:badge variant='${ feature.badge }' />` : '';
	const targetAttr = isExternalUrl( feature.link ) ? ' target=\'_blank\'' : '';

	return `<ck:card>
\t<ck:card-title level='4' heading-id='${ feature.id }'>
\t\t${ feature.title }${ badge }
\t</ck:card-title>
\t<ck:card-description>
\t\t${ feature.description }
\t</ck:card-description>
\t<ck:card-footer>
\t\t<ck:button-link size='sm' variant='secondary' href='${ feature.link }'${ targetAttr }>
\t\t\tFeature page
\t\t</ck:button-link>
\t</ck:card-footer>
</ck:card>`;
}

function generateHeadingBadge( subsection ) {
	const targetAttr = isExternalUrl( subsection.link ) ? ' target=\'_blank\'' : '';

	return `<ck:heading-badge heading-id='${ subsection.id }' badge='${ subsection.badge }'>${ subsection.title }</ck:heading-badge>

${ subsection.description }

<ck:button-link size='sm' variant='secondary' href='${ subsection.link }'${ targetAttr }>
\tFeature page
</ck:button-link>`;
}

function generateHeadingBadgeWithEmbeddedContent( subsection ) {
	let embeddedContent = '';

	if ( subsection.features && subsection.features.length > 0 ) {
		if ( subsection.features.length === 1 ) {
			// Single card (no columns, no indentation, no blank line before)
			embeddedContent = '\n' + generateCardNoIndent( subsection.features[ 0 ] );
		} else {
			// Multiple cards (with columns, no blank line before)
			const cards = subsection.features.map( f => generateCard( f ) ).join( '\n\n' );
			embeddedContent = `\n<ck:columns>
${ cards }
</ck:columns>`;
		}
	}

	return `<ck:heading-badge heading-id='${ subsection.id }' badge='${ subsection.badge }'>${ subsection.title }</ck:heading-badge>

${ subsection.description }
${ embeddedContent }`;
}

function generateSimpleFeature( subsection ) {
	// Some simple subsections don't have links (e.g., "Email editing")
	if ( !subsection.link ) {
		return `### ${ subsection.title }

${ subsection.description }`;
	}

	const targetAttr = isExternalUrl( subsection.link ) ? ' target=\'_blank\'' : '';

	return `### ${ subsection.title }

${ subsection.description }

<ck:button-link size='sm' variant='secondary' href='${ subsection.link }'${ targetAttr }>
\tFeature page
</ck:button-link>`;
}

function generateSingleCard( subsection ) {
	const badge = subsection.badge ? ` <ck:badge variant='${ subsection.badge }' />` : '';
	const targetAttr = isExternalUrl( subsection.link ) ? ' target=\'_blank\'' : '';

	return `<ck:card>
\t<ck:card-title level='4' heading-id='${ subsection.id }'>
\t\t${ subsection.title }${ badge }
\t</ck:card-title>
\t<ck:card-description>
\t\t${ subsection.description }
\t</ck:card-description>
\t<ck:card-footer>
\t\t<ck:button-link size='sm' variant='secondary' href='${ subsection.link }'${ targetAttr }>
\t\t\tFeature page
\t\t</ck:button-link>
\t</ck:card-footer>
</ck:card>`;
}

/**
 * Check if a URL is external (doesn't use {@link} syntax)
 */
function isExternalUrl( url ) {
	return url && !url.startsWith( '{@link' );
}

// Run the function if this script is executed directly
if ( import.meta.url === `file://${ process.argv[ 1 ] }` ) {
	generateFeaturesDigest().catch( err => {
		console.error( 'Error:', err );
		process.exit( 1 );
	} );
}
