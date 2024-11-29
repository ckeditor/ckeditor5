/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

import upath from 'upath';
import fs from 'fs-extra';

( async () => {
	const digest = await fs.readJson( upath.join( import.meta.dirname, './features-digest-source.json' ) );

	const output = [];

	digest.forEach( capability => {
		output.push( generateCapability( capability ) );
	} );

	await fs.writeFile( upath.join( import.meta.dirname, './features-digest-output.html' ), output.join( '\n' ) );
} )();

function generateCapability( capability ) {
	return `
		<section class="capability">
			<h2>${ capability.name }</h2>
			<p class="description">${ capability.description }</p>
			<div class="features-list">
				${ capability.features.map( feature => generateFeature( feature ) ).join( '\n' ) }
			</div>
		</section>
	`;
}

function generateFeature( feature, isSubFeature = false ) {
	const subFeatures = feature.subFeatures;
	let subFeaturesOutput = '';

	if ( subFeatures ) {
		subFeaturesOutput = `
			<div class="subfeatures-list">
				${ subFeatures.map( subFeatures => generateFeature( subFeatures, true ) ).join( '\n' ) }
			</div>
		`;
	}

	return `
		<article class="feature ${ isSubFeature ? 'subfeature' : '' }">
			<h3>${ feature.name }</h3>
			<p>
				<span class="short-description">${ feature.shortDescription }</span>
				<span class="description">${ feature.description }</span>
			</p>
			${ subFeaturesOutput }
		</article>
	`;
}
