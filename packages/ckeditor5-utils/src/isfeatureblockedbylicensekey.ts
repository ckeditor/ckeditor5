/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/isfeatureblockedbylicensekey
 */

/**
 * Checks whether a feature (represented by an unique id) is blocked by the provided license key.
 *
 * @param licensePayload Decoded license key.
 * @param licenseFeatureCode An unique feature id to check.
 */
export function isFeatureBlockedByLicenseKey( licensePayload: Record<string, any>, licenseFeatureCode: string ): boolean {
	const blockedFeatures = licensePayload.removeFeatures || [];

	return blockedFeatures.includes( licenseFeatureCode );
}
