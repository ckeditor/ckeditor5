/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const tools = require( './tools' );
const BOILERPLATE_REPOSITORY = 'git@github.com:ckeditor/ckeditor-boilerplate.git';
const BOILERPLATE_BRANCH = 'ckeditor5';

module.exports = {
	/**
	 * Parses GitHub URL. Extracts used server, repository and branch.
	 *
	 * @param {String} url GitHub URL from package.json file.
	 * @returns {Object} urlInfo
	 * @returns {String} urlInfo.server
	 * @returns {String} urlInfo.repository
	 * @returns {String} urlInfo.branch
	 */
	parseRepositoryUrl( url ) {
		const regexp = /^(git@github\.com:|https?:\/\/github.com\/)?([^#]+)(?:#)?(.*)$/;
		const match = url.match( regexp );
		let server;
		let repository;
		let branch;

		if ( !match ) {
			return null;
		}

		server = match[ 1 ] || 'https://github.com/';
		repository = match[ 2 ] || '';
		branch = match[ 3 ] || 'master';

		if ( !repository ) {
			return null;
		}

		return {
			server: server,
			repository: repository,
			branch: branch
		};
	},

	/**
	 * Clones repository to workspace.
	 *
	 * @param {Object} urlInfo Parsed URL object from {@link #parseRepositoryUrl}.
	 * @param {String} workspacePath Path to the workspace location where repository will be cloned.
	 */
	cloneRepository( urlInfo, workspacePath ) {
		const cloneCommands = [
			`cd ${ workspacePath }`,
			`git clone ${ urlInfo.server + urlInfo.repository }`
		];

		tools.shExec( cloneCommands.join( ' && ' ) );
	},

	/**
	 * Checks out branch on selected repository.
	 *
	 * @param {String} repositoryLocation Absolute path to repository.
	 * @param {String} branchName Name of the branch to checkout.
	 */
	checkout( repositoryLocation, branchName ) {
		const checkoutCommands = [
			`cd ${ repositoryLocation }`,
			`git checkout ${ branchName }`
		];

		tools.shExec( checkoutCommands.join( ' && ' ) );
	},

	pull( repositoryLocation, branchName ) {
		const checkoutCommands = [
			`cd ${ repositoryLocation }`,
			`git pull origin ${ branchName }`
		];

		tools.shExec( checkoutCommands.join( ' && ' ) );
	},

	initializeRepository( repositoryPath ) {
		const initializeCommands = [
			`git init ${ repositoryPath }`,
			`cd ${ repositoryPath }`,
			`git remote add boilerplate ${ BOILERPLATE_REPOSITORY }`,
			`git fetch boilerplate ${ BOILERPLATE_BRANCH }`,
			`git merge boilerplate/${ BOILERPLATE_BRANCH }`
		];

		tools.shExec( initializeCommands.join( ' && ' ) );
	}
};
