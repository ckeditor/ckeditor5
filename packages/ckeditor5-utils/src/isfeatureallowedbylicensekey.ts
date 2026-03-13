/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/isfeatureallowedbylicensekey
 */

/**
 * Checks whether a feature (represented by a unique id) is allowed by the provided license key.
 *
 * @param licensePayload Decoded license key.
 * @param licenseFeatureCode An unique feature id to check.
 */
export function isFeatureAllowedByLicenseKey( licensePayload: Record<string, any>, licenseFeatureCode: string ): boolean {
	const allowedFeatures = licensePayload.features || [];

	return allowedFeatures.includes( '*' ) || allowedFeatures.includes( licenseFeatureCode );
}
