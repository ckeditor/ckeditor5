/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const tools = require( './tools' );

module.exports = {

	/**
	 * Parses GitHub URL. Extracts used server, repository and branch.
	 *
	 * @param {String} url GitHub URL from package.json file.
	 * @returns {Object} urlInfo
	 * @returns {String} urlInfo.server
	 * @returns {String} urlInfo.repository
	 * @returns {String} urlInfo.user
	 * @returns {String} urlInfo.name
	 * @returns {String} urlInfo.branch
	 */
	parseRepositoryUrl( url ) {
		const regexp = /^((?:git@|(?:http[s]?|git):\/\/)github\.com(?:\/|:))?(([\w-]+)\/([\w-]+(?:\.git)?))(?:#([\w-\/]+))?$/;
		const match = url.match( regexp );
		let server;
		let repository;
		let branch;
		let name;
		let user;

		if ( !match ) {
			return null;
		}

		server = match[ 1 ] || 'git@github.com:';
		repository = match[ 2 ];
		user = match[ 3 ];
		name = match[ 4 ];
		branch = match[ 5 ] || 'master';

		name = /\.git$/.test( name ) ? name.slice( 0, -4 ) : name;

		return {
			server: server,
			repository: repository,
			branch: branch,
			user: user,
			name: name
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

	/**
	 * Pulls specified branch from origin.
	 *
	 * @param {String} repositoryLocation Absolute path to repository.
	 * @param {String} branchName Branch name to pull.
	 */
	pull( repositoryLocation, branchName ) {
		const pullCommands = [
			`cd ${ repositoryLocation }`,
			`git pull origin ${ branchName }`
		];

		tools.shExec( pullCommands.join( ' && ' ) );
	},

	/**
	 * Fetch all branches from each origin on selected repository.
	 *
	 * @param {String} repositoryLocation
     */
	fetchAll( repositoryLocation ) {
		const fetchCommands = [
			`cd ${ repositoryLocation }`,
			`git fetch --all`
		];

		tools.shExec( fetchCommands.join( ' && ' ) );
	},

	/**
	 * Initializes new repository, adds and merges CKEditor5 boilerplate project.
	 *
	 * @param {String} repositoryPath Absolute path where repository should be created.
	 */
	initializeRepository( repositoryPath ) {
		tools.shExec( `git init ${ repositoryPath }` );
	},

	/**
	 * Returns Git status of repository stored under specified path. It runs `git status --porcelain -sb` command.
	 *
	 * @param {String} repositoryPath Absolute path to repository.
	 * @returns {String} Executed command's result.
	 */
	getStatus( repositoryPath ) {
		return tools.shExec( `cd ${ repositoryPath } && git status --porcelain -sb`, false );
	},

	/**
	 * Creates initial commit on repository under specified path.
	 *
	 * @param {String} pluginName
	 * @param {String} repositoryPath
	 */
	initialCommit( pluginName, repositoryPath ) {
		const commitCommands = [
			`cd ${ repositoryPath }`,
			`git add .`,
			`git commit -m "Initial commit for ${ pluginName }."`
		];

		tools.shExec( commitCommands.join( ' && ' ) );
	}
};
