---
category: framework-contributing
order: 40
---

# Git commit message convention

Every commit made *directly* to the `master` branch must follow the below convention. Based on commits in the `master` branch CKEditor 5 release tools will generate changelog entries for the current release.

<info-box>
	Commits in the ticket branches are not analyzed for the changelog and do not have to follow any specific convention (other than finishing sentences with periods). In case of ticket branches, **only merge commits are analyzed**.

	Therefore, this guide is mainly targeted at core team members. However, it may help you understand how to write a suggested commit message when creating a pull request for CKEditor 5.
</info-box>

## Convention

Commit message template:

```
Type (package-name, other-package-name): A short sentence about the commit. Closes #XXX.

Optional description.

NOTE: Special note to be marked in the changelog.

BREAKING CHANGE: If any breaking changes were done, they need to be listed here.
BREAKING CHANGE: Another breaking change if needed. Closes #YYY.
```

### Commit types

| Type | Release | Description | Changelog |
| --- | --- | --- | --- |
| Feature | `minor` | A new feature. | Visible |
| Fix | `patch` | A bug fix. Should also be used for enhancements if they do not introduce new features at the same time. | Visible |
| Other | `patch` | An enhancement &mdash; when it is neither a bug fix nor a feature. Example: public API refactoring. Use it also if you do not want to admit that it was a bug ;). | Visible |
| Code style | `patch` | Our beloved code style improvements (used in the broad meaning of general code quality). | Hidden |
| Docs | `patch` | Updated documentation. | Hidden |
| Internal | `patch` | Other kinds of internal changes. | Hidden |
| Tests | `patch` | Changes in test files. | Hidden |
| Revert | `patch` | Revert of some commit. | Hidden |
| Release | `patch` | A special type of commit used by the release tools. | Hidden |

Each commit can contain additional notes which will be inserted into the changelog:

| Type | Is backward compatible? |
| --- | --- |
| `NOTE` | Yes |
| `MAJOR BREAKING CHANGE`, `MINOR BREAKING CHANGE` or `BREAKING CHANGE` | No |

The `BREAKING CHANGE` is an alias to a `MAJOR BREAKING CHANGE`.

If any change contains the `MAJOR BREAKING CHANGE` note, the next release will be marked as `major` automatically.

For reference on how to identify minor or major breaking change see the {@link framework/guides/support/versioning-policy versioning policy guide}.

### Package name

Most commits are related to one or more packages. Each affected package should be listed in parenthesis following the commit type. A package that was the most impacted by the change should be listed first.

It is, however, possible to skip this part if five or more packages are affected.

### Example commits

A new feature without any breaking changes.

```
Feature (ui, theme-lark): Added support for RTL languages. Closes #1.

RTL content will now be rendered correctly.

NOTE: Make sure to set `config.contentDirection` correctly.
```

A generic bug fix for an existing feature that affects many packages (closes two tickets):

```
Fix: The editor will be great again. Closes #3. Closes #4.
```

Commit with updated documentation:

```
Docs (link): Updated the README.
```

Commit which provides or changes the tests:

```
Tests (widget): Introduced missing tests. Closes #5.
```

An enhancement which is not backward compatible. Public API was changed:

```
Other (utils, moo): Extracted `utils.moo()` to a separate package. Closes #9.

BREAKING CHANGE: The `util.moo()` method is now available in the `moo` package. See #9.
```

For the commits shown above the changelog will look like this:

```md
Changelog
=========

## [1.0.0](https://github.com/ckeditor/ckeditor5/compare/v1.0.0...v0.0.1) (2017-01-04)

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* The `util.moo()` method is now available in the `moo` package. See [#9](https://github.com/ckeditor/ckeditor5/issue/9).

### Features

* [ui](http://npmjs.com/package/@ckeditor/ckeditor5-ui), [theme-lark](http://npmjs.com/package/@ckeditor/ckeditor5-theme-lark): Added support for RTL languages. Closes [#1](https://github.com/ckeditor/ckeditor5/issue/1). ([adc59ed](https://github.com/ckeditor/ckeditor5/commit/adc59ed))

   RTL content will now be rendered correctly.

### Bug fixes

* The editor will be great again. Closes [#3](https://github.com/ckeditor/ckeditor5/issue/3). Closes [#4](https://github.com/ckeditor/ckeditor5/issue/4). ([a0b4ce8](https://github.com/ckeditor/ckeditor5/commit/a0b4ce8))

### Other changes

* [utils](http://npmjs.com/package/@ckeditor/ckeditor5-utils), [moo](http://npmjs.com/package/@ckeditor/ckeditor5-moo): Extracted `utils.moo()` to a separate package. Thanks to [@CKEditor](https://github.com/CKEditor). ([e8cc04f](https://github.com/ckeditor/ckeditor5/commit/e8cc04f))

### NOTE

* Make sure to set `config.contentDirection` correctly.
```

## Handling pull requests

When making a pull request its author may (it is recommended in the pull request template) propose a merge commit message.

The reviewer's duty is to validate the proposed message and apply necessary changes (the PR description can be edited).

Things like:

* language and grammar of the message,
* type of the change,
* mentioned issue(s) number,
* breaking changes,
* and any additional information

should be checked and added if missing.

As a reviewer, remember that the message will end up in the changelog and must be understandable in a broad context of the entire editor. It is not for you &mdash; it is for other developers.

When closing a PR remember to copy the source of the message to the textarea with the merge commit message:

{@img assets/img/closing-a-pr.gif Screencast how to copy a source version of the suggested commit message when closing a PR.}

### Giving credit

When closing a non-core contributor's PR make sure to add information about the contributor to the commit message. For example:

```
Feature (ui): Added support for RTL languages. Closes #1.

Thanks to @someone!
```
