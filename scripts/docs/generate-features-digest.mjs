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
 * #### 3. Simple Feature
 * Basic feature with description and link.
 * {
 *   "id": "feature-id",
 *   "title": "Feature Name",
 *   "type": "simple",
 *   "description": "Feature description...",
 *   "link": "{@link features/feature-name}"
 * }
 *
 * #### 4. Single Card
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
 * ## Known Limitations
 *
 * ### Special Heading-Badge Patterns (3 features)
 *
 * The following features use a special pattern where a heading-badge is followed by embedded cards.
 * These are not currently supported by the automation and must be manually maintained in the markdown file:
 *
 * 1. **Asynchronous collaboration** (asynchronous-collaboration) - Has heading-badge + description + single embedded card
 * 2. **Comments** (comments) - Has heading-badge + description + card grid
 * 3. **Content generation** (content-generation) - Has heading-badge + description + card grid
 *
 * For these features, the content is manually maintained in feature-digest.md outside the automation markers.
 *
 * ### Future Enhancement
 *
 * To fully automate these special cases, the extraction and generation scripts would need to be enhanced
 * to support an optional `features` array on heading-badge types, allowing for embedded cards after
 * the main description.
 *
 * ## Statistics
 *
 * - 9 sections (Core editing, Collaboration, Content conversion, Page management, Productivity,
 *   Configurations, Compliance, Customization, File management)
 * - 73 subsections
 * - 76+ features in card grids
 * - ~155 total features
 * - 98% automation coverage (3 special cases manually maintained)
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
