/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

import upath from 'upath';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath( import.meta.url );
const __dirname = upath.dirname( __filename );

( async () => {
	const digest = await fs.readJson( upath.join( __dirname, './features-digest-source.json' ) );

	const output = [];

	digest.forEach( capability => {
		output.push( generateCapability( capability ) );
	} );

	await fs.writeFile( upath.join( __dirname, './features-digest-output.html' ), output.join( '\n' ) );

	/**
	 * Update the features digest markdown file content by to the newest HTML structure generated based on JSON data.
	 **/
	const startMarker = '<!--MARK_START-->';
	const endMarker = '<!--MARK_END-->';
	const replacementText = output.join( '\n' );
	const filePath = upath.join( __dirname, '../features/feature-digest.md' );

	const featuresDigestMdFileContent = await fs.readFile( filePath, 'utf8' );
	const regex = new RegExp( `${ startMarker }[\\s\\S]*?${ endMarker }`, 'g' );

	const modifiedContent = featuresDigestMdFileContent.replace(
		regex, `${ startMarker }\n${ replacementText }\n${ endMarker }`
	);

	fs.writeFile( filePath, modifiedContent, 'utf8' );
} )();

function generateCapability( capability ) {
	return `
## ${ capability.name }
<p class="description">${ capability.description }</p>
<div class="features-list">
	${ capability.features.map( feature => generateFeature( feature ) ).join( '\n' ) }
</div>`;
}

function generateFeature( feature, isSubFeature = false ) {
	const subFeatures = feature.subFeatures;
	let subFeaturesOutput = '';

	if ( subFeatures ) {
		subFeaturesOutput = `<div class="subfeatures-list">
				${ subFeatures.map( subFeatures => generateFeature( subFeatures, true ) ).join( '\n' ) }
			</div>`;
	}

	const premiumBadge = `<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
			<span class="tree__item__badge__text">Premium feature</span>
		</span>`;
	const experimentalBadge = '<span class="tree__item__badge tree__item__badge_new" data-badge-tooltip="Experimental feature">Exp</span>';

	const addPremiumBadge = feature.isPremium ? premiumBadge : '';
	const addExperimentalBadge = feature.isExperimental ? experimentalBadge : '';

	return `<article id="${ feature.id }" class="feature ${ isSubFeature ? 'subfeature' : '' }">
			<h3 class="feature-title">
				{@link ${ feature.link } ${ feature.name }} ${ addPremiumBadge } ${ addExperimentalBadge }
			</h3>
			<details>
				<summary class="feature-short-description">${ feature.shortDescription }</summary>
				<p class="feature-description">${ feature.description }</p>
			</details>${ subFeaturesOutput }
		</article>`;
}
