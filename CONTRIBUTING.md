Contributing
========================================

## Fixing issues and coding features

Things to keep in mind:

* We expect contributions to follow the high-quality code standards that we follow, including [coding style](#code-style) and [tests](#tests). Lack of attention to this point may either make it slow to adopt a contribution or even force us to reject it altogether.
* There is no guarantee that your contribution will be incorporated in the main code. Still, pull requests make it easy for you to keep them for your own use or for others which may be interested in them.
* If you plan to start working on a bigger task, it might be worth asking the core team (beforehand) whether a specific feature or solution to an issue will be accepted.
* If you need any assistance when creating a patch or implementing a feature, ping us under a ticket or on [Twitter](https://twitter.com/ckeditor).
* Having a CLA is essential to have your contributions accepted ([see bellow](#contributor-license-agreement-cla)).

### Setting up the development environment

To learn how to set up the project and run tests see the [development environment](https://github.com/ckeditor/ckeditor5/wiki/Development-environment) guide.

### Code style

Read more in [code style](https://github.com/ckeditor/ckeditor5-design/wiki/Code-Style), [naming](https://github.com/ckeditor/ckeditor5-design/wiki/Code-Style-Naming-Guidelines) and [file naming](https://github.com/ckeditor/ckeditor5-design/wiki/File-Names) guidelines.

Every package repository installs git hooks which automatically lints and check the code for code style on commit. However, not every code style issue can be discovered this way, so please do not rely on tools too much :).

### Tests

We maintain a 100% of code coverage (including code branches) and pull requests with missing tests will not be accepted. However, keep in mind that 100% is not everything – every *change* must be tested. This means that if you are fixing a bug and your patch did not change the code coverage, the change itself needs a test anyway.

Besides automated tests, you may be asked to create a manual test for the issue. Such manual tests let us quickly validate that the issue was really fixed and are later used during a testing phase (before a release) to make sure no regressions were created.

Read more about our [testing environment](https://github.com/ckeditor/ckeditor5/wiki/Testing-environment).

### Making a pull request

GitHub provides an [extensive documentation about pull requests](https://help.github.com/categories/collaborating-with-issues-and-pull-requests/), so we will skip that.

The only additional things you need to remember is to:

* Fork the repository (CKEditor 5 is a multi-repo project) in which you want to propose a pull request.
* Start a branch for your code (we use `t/<ticket name>` convention for branch names).
* Your pull request should be minimal – i.e. change only things described in the ticket. Do not squeeze unrelated changes into your pull request.
* When making a pull request on GitHub make sure to specify which ticket(s) your pull request resolves. It is also recommended to provide more information, like how to test the patch, issues that you encountered, decisions you had to make, known problems, etc.
* Make sure you signed the [Contributor License Agreement (CLA)](#contributor-license-agreement-cla) and that tests pass. Test your changes.

## Translating

Being this a project with global impact, contributing translations is both an easy and powerful way to help.

We use the Transifex service for translations at the following address: [https://www.transifex.com/ckeditor/ckeditor5/dashboard/](https://www.transifex.com/ckeditor/ckeditor5/dashboard/).

Here as well, having a CLA in place is a requirement to become an official translator (see bellow).

## Reporting issues / requesting features

[Each repository](https://github.com/ckeditor/ckeditor5#packages) independently handles its issues. However, it's recommended to report issues in [the main repository](https://github.com/ckeditor/ckeditor5/issues) unless you know to which specific repository the issue belongs.

Things to keep in mind:

* Search for existing issues before starting a new one. This helps our team to have the backlog in order.
* Be concise and informative, making it easy for our team to understand the problem.
* Do not use the issues pages for asking for help.
* Feel free to jump into discussions around issues, exposing your opinion.

The issues pages can be used for feature requests.

## Contributor License Agreement (CLA)

To accept contributions sent to us in form of code, documentation or translations, a Contributor License Agreement (CLA) must be in place in order to clarify the intellectual property license granted with them. This license is for your protection as a contributor as well as the protection of us and our users; it does not change your rights to use your own contributions for any other purpose.

To sign the CLA and to have more information, please follow this link: [http://cla.ckeditor.com/](http://cla.ckeditor.com/).
