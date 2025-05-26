/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-disable @stylistic/max-len */

export default {
	GITHUB_TOKEN: process.env.CKE5_GITHUB_TOKEN,
	REPOSITORY_SLUG: 'ckeditor/ckeditor5',
	DAYS_BEFORE_STALE: 365,
	DAYS_BEFORE_STALE_PENDING_ISSUE: 14,
	DAYS_BEFORE_CLOSE: 30,
	PENDING_ISSUE_LABELS: [
		'pending:feedback'
	],
	IGNORED_ISSUE_LABELS: [
		'support:1',
		'support:2',
		'support:3',
		'domain:accessibility'
	],
	IGNORED_PR_LABELS: [
		'support:1',
		'support:2',
		'support:3',
		'domain:accessibility'
	],
	IGNORED_ACTIVITY_LABELS: [
		'stale'
	],
	STALE_LABELS: [
		'status:stale'
	],
	CLOSE_ISSUE_LABELS: [
		'resolution:expired'
	],
	CLOSE_PR_LABELS: [
		'resolution:expired'
	],
	STALE_ISSUE_MESSAGE: 'There has been no activity on this issue for the past year. We\'ve marked it as stale and will close it in 30 days. We understand it may still be relevant, so if you\'re interested in the solution, leave a comment or reaction under this issue.',
	STALE_PENDING_ISSUE_MESSAGE: 'The issue lacks the feedback we asked for two weeks. Hence, we\'ve marked it as stale and will close it in 30 days. We understand it may still be relevant, so if you\'re interested in the solution, leave a comment or reaction under this issue.',
	STALE_PR_MESSAGE: 'There has been no activity on this PR for the past year. We\'ve marked it as stale and will close it in 30 days. We understand it may still be relevant, so if you\'re interested in the contribution, leave a comment or reaction under this PR.',
	CLOSE_ISSUE_MESSAGE: 'We\'ve closed your issue due to inactivity. We understand that the issue may still be relevant. If so, feel free to open a new one (and link this issue to it).',
	CLOSE_PR_MESSAGE: 'We\'ve closed your PR due to inactivity. While time has passed, the core of your contribution might still be relevant. If you\'re able, consider reopening a similar PR.'
};
