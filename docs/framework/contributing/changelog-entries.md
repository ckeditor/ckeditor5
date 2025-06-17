---
category: framework-contributing
meta-title: Changelog entries | CKEditor 5 Framework Documentation
meta-description: Learn how to write structured, user-facing changelog entries for CKEditor 5 using a Markdown-based system designed for clarity, versioning, and long-term maintainability.
order: 60
modified_at: 2025-06-17
---

# Changelog entries

CKEditor 5 uses Markdown file-based changelog system inspired by tools like Changesets. Contributors are written in a human-readable Markdown files stored in the repository. These files describe the nature of the change (bug fix, feature, breaking change, etc.) and are committed alongside the actual code. These entries will be automatically compiled into the final changelog during the release process.

## How to create a new file

Create a new Markdown file in the `.changelog/` directory to add a changelog entry. Each file **must** describe **one change only**. You can create as many files as you need to explain the changes.

<info-box>
    The easiest and preferred way to create a changelog entry is by running:

    ```bash
    yarn run nice
    ```

    `nice` stands for **N**ew **I**ndividual **C**hangelog **E**ntry.
</info-box>

This command creates a new Markdown file with a filename based on the current date and Git branch name: `YYYYMMDDHHMMSS_{branch-name}.md`. The branch name is automatically slugified (only letters, numbers, `-`, and `_` are allowed).

_Example: `20250617103000_fix-toolbar-alignment.md`_

The file will include a predefined frontmatter template. **You must manually fill in the details** (like `type`, `scope`, `closes`, and the summary of your change).

## Format of a changelog entry

Each changelog entry is a Markdown file with a frontmatter section followed by a summary and optional context. Here's a breakdown of all available fields:

<table>
  <thead>
    <tr>
      <th style="width: 20%;">Field</th>
      <th style="width: 10%;">Required?</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>type</code></td>
      <td>✅ Yes</td>
      <td>
        Type of the change. See the allowed values and their impact in the table below.
      </td>
    </tr>
    <tr>
      <td><code>scope</code></td>
      <td>❌ No</td>
      <td>Affected package(s), using short names like <code>ckeditor5-core</code>.</td>
    </tr>
    <tr>
      <td><code>closes</code></td>
      <td>❌ No</td>
      <td>List of issues this change resolves. Use numbers (<code>123</code>), full references (<code>ckeditor/ckeditor5#123</code>), or full URLs.</td>
    </tr>
    <tr>
      <td><code>see</code></td>
      <td>❌ No</td>
      <td>Related issues that provide context but are not directly resolved by this change. Same format as <code>closes</code>.</td>
    </tr>
    <tr>
      <td><code>communityCredits</code></td>
      <td>❌ No</td>
      <td>GitHub usernames of external contributors who should be credited for this change.</td>
    </tr>
    <tr>
      <td><em>(body)</em></td>
      <td>✅ Yes</td>
      <td>After the frontmatter, add a short and meaningful summary of the change. Optionally include extended context or rationale.</td>
    </tr>
  </tbody>
</table>

<info-box>
    **Tip**: Keep the summary clear and user-facing - this is what will appear in the final changelog.
</info-box>

The changelog entry format is designed to be both human-friendly and machine-readable. It uses a simple frontmatter structure followed by a short description of the change. Each field in the frontmatter serves a specific purpose, from determining the entry's visibility to linking it with related issues or acknowledging community contributions.

Using these fields correctly ensures that the changelog remains accurate, meaningful, and consistent across releases. The sections below explain the available fields in more detail and provide guidance on when and how to use them.

### Allowed values for the `type` field

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Type</th>
      <th style="width: 10%;">Release</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Feature</td>
      <td><code>minor</code></td>
      <td>A new feature. Introduces user-facing functionality.</td>
    </tr>
    <tr>
      <td>Fix</td>
      <td><code>patch</code></td>
      <td>A bug fix. Use also for small improvements that do not qualify as new features.</td>
    </tr>
    <tr>
      <td>Other</td>
      <td><code>patch</code></td>
      <td>Enhancement or refactor. It's not a fix or feature. Example: public API cleanup.</td>
    </tr>
    <tr>
      <td>Major breaking change</td>
      <td><code>major</code></td>
      <td>A change in the integration layer or the plugin development API. See {@link updating/versioning-policy versioning policy} for details.</td>
    </tr>
    <tr>
      <td>Minor breaking change</td>
      <td><code>minor</code></td>
      <td>Low-level customizable API layer. See {@link updating/versioning-policy versioning policy} for details.</td>
    </tr>
  </tbody>
</table>

### Package name (`scope`)

Changes affect one or more packages. List the package that was most impacted by the change first.

However, it is possible to skip this part if many packages are affected. This usually indicates a generic change. In this case, having all the packages listed would reduce the changelog's readability.

The package name is based on the npm package name, but the `@ckeditor/` prefix is stripped.

If your change is related to the main package, use `ckeditor5` as the package name.

<info-box>
    If the commit introduces a breaking change across the entire project (a generic change), you do not need to specify the package name.
</info-box>

### Referencing issues

When creating PRs that address specific issues, use the following messages to indicate them.

* `Closes` &ndash; When the PR resolves an issue.
* `See` &ndash; When the PR references an issue but has not resolved it yet.

Both fields (`closes` and `see`) can contain multiple references, but they must follow the same format:

* `14724` &ndash; A simple issue number.
* `ckeditor/ckeditor5#14724` &ndash; A full reference to an issue in the CKEditor 5 repository.
* `https://github.com/ckeditor/ckeditor5/issues/14724` &ndash; A full URL to an issue in the CKEditor 5 repository.

### Giving credit

When closing a non-core contributor's PR, add information about the contributor to the changelog entry file using the `communityCredits` field. It should contain a list of GitHub usernames of contributors who should be credited for this change.

### Description

Write a concise and meaningful summary of the change. This main message will appear in the public changelog, so keep it clear, user-facing, and relevant.

Use the `ClassName#methodName()` format when referencing methods. This ensures consistency across all entries.

**Example:**

```
MarkerCollection#has()
```

You may include multiple sentences if additional context is helpful.

### Examples of correct entry formatting

<info-box>
    Unlike the previous Git-based system, which captured all commit types, including internal changes, the new file-based changelog focuses exclusively on public, user-facing changes, ensuring the final changelog remains clear and relevant to end users.
</info-box>

A new feature without any breaking changes.

```md
---
type: Feature
scope:
  - ckeditor5-ui
closes:
  - 1
---

Added support for RTL languages.

RTL content will now be rendered correctly.
```

A generic bug fix for an existing feature that affects many packages (closes two tickets):

```md
---
type: Fix
closes:
  - 2
  - 3
---

The editor will be great again.
```

An improvement that is not backward compatible and sent by a non-core contributor. Public API was changed:

```md
---
type: Other
scope:
  - ckeditor5-utils
closes:
  - 9
---

Extracted the `utils#foo()` to a separate package.
```

```md
---
type: Feature
scope:
  - ckeditor5-engine
closes:
  - 9
---

Introduced the `engine#foo()` method.
```

```md
---
type: Major breaking change
scope:
  - ckeditor5-utils
see:
  - 9
---

The `utils#foo()` method was moved to the `engine` package.
```

For the entries shown above, the changelog will look like this:

```md
Changelog
=========

## [51.0.0](https://github.com/ckeditor/ckeditor5/compare/v50.1.1...v51.0.0) (June 17, 2025)

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: The `utils#foo()` method was moved to the `engine` package. See [#9](https://github.com/ckeditor/ckeditor5/issues/9).

### Features

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced the `engine#foo()` method. Closes [#9](https://github.com/ckeditor/ckeditor5/issues/9).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added support for RTL languages. Closes [#1](https://github.com/ckeditor/ckeditor5/issues/1).

  RTL content will now be rendered correctly.

### Bug fixes

* The editor will be great again. Closes [#2](https://github.com/ckeditor/ckeditor5/issues/2), [#3](https://github.com/ckeditor/ckeditor5/issues/3).

### Other changes

* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Extracted the `utils#foo()` to a separate package. Closes [#9](https://github.com/ckeditor/ckeditor5/issues/9).
```

### Fixing errors

If the entry message is wrong, you can fix it by editing the Markdown file in the `.changelog/` directory and preparing a new pull request.

## Handling pull requests

When creating a pull request, you may propose a changelog entry (as recommended in the pull request template).

The reviewer must validate the proposed message and apply necessary changes. It can be done using the GitHub interface (as suggestions).

As a reviewer, make sure to check the following aspects of the proposed changelog entry and add or correct them if needed:

* The language and grammar of the message
* The type of the change
* Mentioned issue(s) number
* Breaking changes
* Any additional relevant information

You must be aware that the message will end up in the changelog and must be understandable in the broad context of the entire editor. It is not for you &ndash; it is for other developers.

When closing a PR, you do not have to copy anything. Pick your merge strategy (e.g., "Squash and merge"), and GitHub will handle the rest.
