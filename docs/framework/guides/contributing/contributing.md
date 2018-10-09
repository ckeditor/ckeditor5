---
category: framework-contributing
order: 10
---

# Contributing

## Fixing issues and coding features

Things to keep in mind:

* We expect contributions to follow the high-quality code standards that we follow, including [coding style](#code-style) and [tests](#tests). Lack of attention to this point may either make it slow to adopt a contribution or even force us to reject it altogether.
* There is no guarantee that your contribution will be incorporated in the main code. Still, pull requests make it easy for you to keep them for your own use or for others which may be interested in them.
* If you plan to start working on a bigger task, it might be worth asking the core team (beforehand) whether a specific feature or solution to an issue will be accepted.
* If you need any assistance when creating a patch or implementing a feature, ping us under a ticket or on [Twitter](https://twitter.com/ckeditor).
* Having a CLA is essential to have your contributions accepted ([see bellow](#contributor-license-agreement-cla)).

### Setting up the development environment

To learn how to set up the project and run tests see the {@link framework/guides/contributing/development-environment development environment} guide.

### Code style

Read more in [code style](https://github.com/ckeditor/ckeditor5-design/wiki/Code-Style), [naming](https://github.com/ckeditor/ckeditor5-design/wiki/Code-Style-Naming-Guidelines) and [file naming](https://github.com/ckeditor/ckeditor5-design/wiki/File-Names) guidelines.

Every package repository installs git hooks which automatically lints and check the code for code style on commit. However, not every code style issue can be discovered this way, so please do not rely on tools too much :).

### Tests

We maintain a **100% of code coverage** (including code branches) and pull requests with missing tests will not be accepted. However, keep in mind that 100% is not everything – every *change* must be tested. This means that if you are fixing a bug and your patch did not change the code coverage, the change itself needs a test anyway.

Besides automated tests, you may be asked to create a manual test for the issue. Such manual tests let us quickly validate that the issue was really fixed and are later used during a testing phase (before a release) to make sure no regressions were created.

Read more about our {@link framework/guides/contributing/testing-environment testing environment}.

### Making a pull request

<info-box>
	GitHub provides an [excellent documentation about pull requests](https://help.github.com/categories/collaborating-with-issues-and-pull-requests/). If not sure what to do, it is the right place to start.
</info-box>

Supposing you would like to propose some changes in the [Link](https://github.com/ckeditor/ckeditor5-link) feature, these are the steps you should take to create a pull request:

* Make sure your {@link framework/guides/contributing/development-environment development environment} is ready.
* Go to GitHub and [fork the repository](https://help.github.com/articles/fork-a-repo) ([ckeditor5-link](https://github.com/ckeditor/ckeditor5-link) in this particular case). The forked repository will appear in your GitHub account as `https://github.com/YOUR-USERNAME/ckeditor5-link`.
* Open your terminal, then go to the package ("repository") folder in you development environment:
   ```shell
   $ cd path/to/ckeditor5/packages/ckeditor5-link
   ```
* Start a new branch for your code. We use the `t/GITHUB-ISSUE-NUMBER` convention for branch names:
   ```shell
   $ git checkout -b t/GITHUB-ISSUE-NUMBER
   ```
* Do the changes. Stick to the [code-style guidelines](#code-style) and remember about [tests and 100% code coverage](#tests)!
* Commit your changes. Make sure your commit message text matches the {@link framework/guides/contributing/git-commit-message-convention convention}:
  ```shell
  $ git commit -m "Fix: Squashed a nasty bug in the link editing. Closes #GITHUB-ISSUE-NUMBER."
  ```
* Now it is time to make your changes public. First, we need to let `git` know about the fork you created by adding the remote:
  ```shell
  $ git remote add my-fork https://github.com/YOUR-USERNAME/ckeditor5-link
  ```
* Push your changes to your forked repository:
  ```shell
  $ git push my-fork t/GITHUB-ISSUE-NUMBER
  ```
* Go to your forked repository on GitHub. Use the [pull request button](https://help.github.com/articles/about-pull-requests/) and follow the instructions.
* **Let us know about your pull request!** The best way is to comment under the original issue.

Some additional things you should keep in mind:

* Your pull request should be minimal – i.e. change only things described in the ticket. Do not squeeze unrelated changes into your pull request.
* When making a pull request on GitHub make sure to specify which ticket(s) your pull request resolves. It is also recommended to provide more information, like how to test the patch, issues that you encountered, decisions you had to make, known problems, etc.
* Make sure you signed the [Contributor License Agreement (CLA)](#contributor-license-agreement-cla) and that tests pass. Test your changes!

<info-box>
	If want your changes to be permanent in your development environment, make sure your `mgit.json` file {@link framework/guides/contributing/development-environment#using-mgit-for-custom-packages points to your forked version of the repository} so next time you execute `mgit update` to refresh the project, the utility will use your fork.
</info-box>

## Translating

Being this a project with global impact, contributing translations is both an easy and powerful way to help.

We use the Transifex service for translations at the following address: [https://www.transifex.com/ckeditor/ckeditor5/dashboard/](https://www.transifex.com/ckeditor/ckeditor5/dashboard/).

Here as well, having a CLA in place is a requirement to become an official translator (see bellow).

## Reporting issues / requesting features

Read the {@link framework/guides/support/reporting-issues reporting issues} guide to learn more.

## Contributor License Agreement (CLA)

To accept contributions sent to us in form of code, documentation or translations, a Contributor License Agreement (CLA) must be in place in order to clarify the intellectual property license granted with them. This license is for your protection as a contributor as well as the protection of us and our users; it does not change your rights to use your own contributions for any other purpose.

To sign the CLA and to have more information, please follow this link: [http://cla.ckeditor.com/](http://cla.ckeditor.com/).
