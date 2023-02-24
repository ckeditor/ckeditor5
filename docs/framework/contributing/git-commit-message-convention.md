---
category: framework-contributing
order: 50
modified_at: 2021-09-07
---

# Git commit message convention

Every commit made *directly* to the `master` branch must follow the convention below. Based on commits in the `master` branch CKEditor 5 release tools will generate changelog entries for the current release.

<info-box>
	Commits in the ticket branches are not analyzed for the changelog and do not have to follow any specific convention (other than finishing sentences with periods). In case of ticket branches, **only merge commits are analyzed**.

	Therefore, this guide is mainly targeted at core team members. However, it may help you understand how to write a suggested commit message when creating a pull request for CKEditor 5.
</info-box>

## Convention

Commit message template:

```
Type (package-name): A short sentence about the commit. Closes #XXX.

Type (another-package-name): If the change affects more than one package, it's possible to put multiple entries at once. Closes #YYY.

Optional description.

MAJOR BREAKING CHANGE (package-name): If any breaking changes were done, they need to be listed here.
MINOR BREAKING CHANGE (package-name): Another breaking change if needed. Closes #ZZZ.
```

### Commit types

| Type | Release | Description | Changelog |
| --- | --- | --- | --- |
| Feature | `minor` | A new feature. | Visible |
| Fix | `patch` | A bug fix. Should also be used for enhancements if they do not introduce new features at the same time. | Visible |
| Other | `patch` | An enhancement &mdash; when it is neither a bug fix nor a feature. Example: public API refactoring. Use it also if you do not want to admit that it was a bug ;). | Visible |
| Docs | `patch` | Updated documentation. | Hidden |
| Internal | `patch` | Other kinds of internal changes. | Hidden |
| Tests | `patch` | Changes in test files. | Hidden |
| Revert | `patch` | Revert of some commit. | Hidden |
| Release | `patch` | A special type of commit used by the release tools. | Hidden |

Each commit can contain additional notes that will be inserted into the changelog:

* `MAJOR BREAKING CHANGE`,
* `MINOR BREAKING CHANGE`.

If any change contains the `MAJOR BREAKING CHANGE` note, the next release will automatically be marked as `major`.

For reference on how to identify minor or major breaking change see the {@link updating/versioning-policy versioning policy guide}.

Each `MAJOR BREAKING CHANGE` or `MINOR BREAKING CHANGE` note must be followed by the package name.

<info-box>
	Remember to always specify whether the breaking change is major or minor. If you fail to do so, the system will assume all unspecified breaking changes are major.
</info-box>

### Package name

Most commits are related to one or more packages. Each affected package should be listed in parenthesis following the commit type. A package that was the most impacted by the change should be listed first.

It is, however, possible to skip this part if many packages are affected. This usually indicates a generic change. In this case having all the packages listed would reduce the changelog readability.

The package name is based on the npm package name, however, it has the `@ckeditor/ckeditor5-` prefix stripped.

If your change is related to the main package only, use `ckeditor5` as the package name.

<info-box>
	If the commit introduces a breaking change across the entire project (a generic change), the package name does not have to be specified.
</info-box>

### Referencing issues

When creating PRs that address specific issues, use the following messages to indicate it. Add these in the same line with the merge message:
* `Closes #123` &ndash; when the PR closes an issue.
* `Closes #123` (outside the merge message) &ndash; when a PR in a public repo closes an issue from a private repository.
* `See #123` &ndash; when the PR only references an issue, but does not close it yet.
* _No reference_ &ndash; when the PR does not reference any issue.

### Methods name syntax

All methods mentioned in the git commit message should use the **#** sign between the class name and the method name. And example of a properly named method:

```
MarkerCollection#has()
```

### Order of entries

The proper order of sections for a commit message is as follows:
* Entries that should be added to the changelog.
* Entries that will not be added to the changelog.
* Breaking change notes.

All entries must be separated with a blank line, otherwise the lines will not be treated as separate entries.

### Examples of correct and incorrect message formatting

An example of a proper commit message:

```
Feature (package-name-1): Message 1. Closes: #123

Fix (package-name-2): Message 2. Closes: #456

Tests: A change across the entire project.
```

An example of an invalid commit message with incorrectly separated lines (the second line will just be treated as a part of the first line):

```
Feature (package-name-1): Message 1.
Fix (package-name-2): Message 2.
Tests: Message 3.
```

An example of an invalid commit message with an incorrect section order (the "internal" message will be treated as a part of the breaking change message):

```
Feature (package-name): Message 1.

MINOR BREAKING CHANGE (package-name): A description.

Internal: Message 2.
```

### Example commits

A new feature without any breaking changes.

```
Feature (ui): Added support for RTL languages. Closes #1.

RTL content will now be rendered correctly.
```

A generic bug fix for an existing feature that affects many packages (closes two tickets):

```
Fix: The editor will be great again. Closes #3. Closes #4.
```

A commit with updated documentation:

```
Docs (link): Updated the README.
```

A commit that provides or changes the tests:

```
Tests (widget): Introduced missing tests. Closes #5.
```

An improvement that is not backward compatible and sent by a non-core contributor. Public API was changed:

```
Other (utils): Extracted the `utils#foo()` to a separate package. Closes #9.

Feature (engine): Introduced the `engine#foo()` method. Closes #9.

MAJOR BREAKING CHANGE (utils): The `utils#foo()` method was moved to the `engine` package. See #9.
```

For the commits shown above the changelog will look like this:

```md
Changelog
=========

## [1.0.0](https://github.com/ckeditor/ckeditor5/compare/v1.0.0...v0.0.1) (2017-01-04)

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[utils](http://npmjs.com/package/@ckeditor/ckeditor5-utils)**: The `utils#foo()` method was moved to the `engine` package. See [#9](https://github.com/ckeditor/ckeditor5/issue/9).

### Features

* **[engine](http://npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced the `engine#foo()` method. Thanks to [@CKEditor](https://github.com/CKEditor). Closes [#9](https://github.com/ckeditor/ckeditor5/issue/9). ([e8cc04f](https://github.com/ckeditor/ckeditor5/commit/e8cc04f))
* **[ui](http://npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added support for RTL languages. Closes [#1](https://github.com/ckeditor/ckeditor5/issue/1). ([adc59ed](https://github.com/ckeditor/ckeditor5/commit/adc59ed))

   RTL content will now be rendered correctly.

### Bug fixes

* The editor will be great again. Closes [#3](https://github.com/ckeditor/ckeditor5/issue/3). Closes [#4](https://github.com/ckeditor/ckeditor5/issue/4). ([a0b4ce8](https://github.com/ckeditor/ckeditor5/commit/a0b4ce8))

### Other changes

* **[utils](http://npmjs.com/package/@ckeditor/ckeditor5-utils)**: Extracted the `utils#foo()` to a separate package. Thanks to [@CKEditor](https://github.com/CKEditor). ([e8cc04f](https://github.com/ckeditor/ckeditor5/commit/e8cc04f))
```

### Fixing errors

If the commit message was wrong but it was already too late to fix (e.g. already merged into `master`), you can push an empty commit with the correct message straight to `master`:

```
git checkout master
git commit --allow-empty # Fix the message in the commit
git push origin master
```

<info-box>
	Two commits for the same pull request will require **manual deduplication** during the changelog generation process. To reduce the noise, **avoid this technique for minor errors** like spelling or grammar: changelog entries will be checked and corrected anyway. Use it to add missing `BREAKING CHANGE` entries or fix wrong ticket numbers in `Closes #123` (critical information for integrators). You can also notify the team about the fix.
</info-box>

## Handling pull requests

When creating a pull request, its author may (it is recommended in the pull request template) propose a merge commit message.

The reviewer's duty is to validate the proposed message and apply necessary changes. The PR description can be edited.

Things like:

* language and grammar of the message,
* type of the change,
* mentioned issue(s) number,
* breaking changes,
* and any additional information

should be checked and added if missing.

As a reviewer, remember that the message will end up in the changelog and must be understandable in a broad context of the entire editor. It is not for you &mdash; it is for other developers.

When closing a PR, remember to copy the source of the message to the textarea with the merge commit message:

{@img assets/img/closing-a-pr.gif 998 Screencast how to copy a source version of the suggested commit message when closing a PR.}

### Giving credit

When closing a non-core contributor's PR make sure to add information about the contributor to the commit message. For example:

```
Feature (ui): Added support for RTL languages. Closes #1.

Thanks to @someone!
```
