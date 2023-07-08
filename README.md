# quick-release
**Quick and easy generate and publish your App/Repo releases**

[![Run tests](https://github.com/dmh/quick-release/actions/workflows/test.yml/badge.svg)](https://github.com/dmh/quick-release/actions/workflows/test.yml)
![node-current](https://img.shields.io/node/v/quick-release)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
![JSDoc](https://img.shields.io/badge/API\%20documentation-JSDoc-yellow)

[**Documentation**](http://dmh.github.io/quick-release/)

## Table of contents

* [Why?](#why)
* [Main features](#main-features)
* [Quick start](#quick-start)
* [Release types](#release-types)
* [Changelog generation](#changelog-generation)
* [GitHub Release Notes generation](#gitHub-release-notes-generation)
* [Quick Release custom config](#quick-release-custom-config)
  * [Default settings](#default-settings)
  * [Custom settings example #1](#custom-settings-example-1)
  * [Custom settings example #2](#custom-settings-example-2)
* [Screenshots](#screenshots)
* [Contributing](#contributing)
* [Changelog](CHANGELOG.md)


## Why?
* To automate recurring and routine operations and steps to create a release. In this scenario, **"release"** refers to a `git` release that follows a semantic versioning guidelines.
* To have the possibility to generate **Changelog notes** based on the `git log` and save them to a markdown file as a part of the release commit.
* To have the possibility to generate **GitHub Release Notes** based on a remote GitHub commit log and publish it as a part of the GitHub release.
* Perform all the steps above `locally` rather than as a CI step, for greater control over what to include in the release.

## Main features
* Create a release by answering a few questions in seconds.
* Two release types: **local** and **remote**.
* Lot of checks to prevent any possible problems with the release.
* Generate a new release commit with a new tag.
* Push all changes/new tag to remote repository.
* Generate **Changelog**
* Generate **GitHub Release Notes**
* Perform all release steps locally with full control.
* Possibility to stop if something goes wrong.
* Flexible configuration options based on a config file `quickrelease.json`

## Quick start


1. Install **quick-release** globally
```bash
npm install -g quick-release
```
2. Open the folder with your project and run command below to start release process

```bash
quick-release
```
or alias

```bash
qr
```

**Other options**
|Options||
| ------ | ---- |
| `-v` , `--version` | Print version information and quit |
| `-h` , `--help` | Print help information and quit |
| `-i` , `--info` | Print projected information for a new potential release and quit |
| `-d` , `--debug` | Print additional debug information during the release process |

## Release types

 * **Local release**

    A local release is the basis for every `git-based` release type. It includes a new release commit with a new tag and generated changelog notes that are added to markdown file on demand.
 * **Remote release**

    A local release as a base, as well as pushing a tagged release commit to a remote repository. Additionally, there is an option to create and publish a GitHub Release with notes.

## Changelog generation
**Changelog list** is a feature that allows you to generate a changelog based on the `git log` and publish it to a markdown file `CHANGELOG.md` as a part of the release commit. With additional options, you can also filter and separate changelog notes by generic and breaking changes. This is an `optional step` that can be skipped during the release process.


## GitHub Release Notes generation
**GitHub Release Notes** is a feature that allows you to generate a release note based on a remote GitHub commit log and publish it as a part of the GitHub release. With additional options, you can also sepparate notes by purpose (breaking changes, features, bugfixes, etc.) and add a custom header to each section. This is an `optional step` that can be skipped during the release process.
### Requirements
To publish **GitHub Release Notes**, it is necessary to include a GitHub fine-grained personal access token with `Contents` read and write repository permission in the `.env` file.
```bash
GITHUB_TOKEN=your_token
```

## Quick Release custom config

To customize your **quick-release** settings, simply add a `quickrelease.json` configuration file to the root of your project and adjust the configurations to meet your needs.

### `quickrelease.json` options
| Option | Default | Description |
| ------ | ---- | ----------- |
| `files` | `package.json,package-lock.json` | Additional `.json` files to parse, update version, and include into release |
| `changelog.file` | `CHANGELOG.md` | Changelog file name |
| `changelog.labels` | | Git commit labels/prefixes to use for building and filtering changelog notes |
| `changelog.breakingLabel` | | Label/prefix to indicate breaking changes in git log |
| `githubReleaseTitles` | | Github Release Notes titles |

***

### Default settings
In case your project lacks a `quickrelease.json` config file, default settings will be utilized.
* `package.json` and `package-lock.json` files, if present, will be updated with the new version and included in the release commit.
* `CHANGELOG.md` file will be created if it does not exist. `Optional`
  * All `git log` messages will be included in the changelog.
  * No separation in the changelog into **generic** and **breaking** changes
* All GitHub commit log messages will be included as changelist for **GitHub Release Notes**. `Optional`

#### git-log example
```git
[!!!] breaking change commit message
[FEATURE] new feature commit message
unimportant commit message
[BUGFIX] bug fix commit message
[!!!] breaking change commit message
[DOC] documentation update commit message
unimportant commit message
[FEATURE] new feature commit message
initial commit
```

#### `CHANGELOG.md` example based on git-log above with default settings
>### v1.0.0 `July 4, 2023`
>* [!!!] breaking change commit message [`af1a8a2`](#) (author_name)
>* [FEATURE] new feature commit message [`30c13f6`](#) (author_name)
>* unimportant commit message [`676d50e`](#) (author_name)
>* [BUGFIX] bug fix commit message [`1cc492f`](#) (author_name)
>* [!!!] breaking change commit message. [`1f081e1`](#) (author_name)
>* [DOC] documentation update commit message [`6ebb7ed`](#) (author_name)
>* unimportant commit message [`1418533`](#) (author_name)
>* [FEATURE] new feature commit message. [`fa36968`](#) (author_name)
>* initial commit [`7821b3c`](#) (author_name)

#### GitHub Release Notes example based on git-log above with default settings
<img width="1231" alt="GitHub Release Notes example" src="https://github.com/dmh/quick-release/assets/5150636/e8802c57-7404-4c77-9f24-8da770b2d1d4">

***

### Custom settings example #1
#### `quickrelease.json`
```json
{
  "changelog": {
    "labels": ["[FEATURE]","[BUGFIX]","[TASK]","[DOC]","[TEST]"],
    "breakingLabel": "[!!!]"
  },
  "githubReleaseTitles": ["New Features", "Bugfixes", "General", "Documentation", "Tests"]
}
```
#### git-log example
```git
[!!!] breaking change commit message
[FEATURE] new feature commit message
unimportant commit message
[BUGFIX] bug fix commit message
[!!!] breaking change commit message
[DOC] documentation update commit message
unimportant commit message
[FEATURE] new feature commit message
initial commit
```

#### `CHANGELOG.md` example based on git-log above with custom settings #1
>### v1.0.0 `July 4, 2023`
>* **[FEATURE]** new feature commit message [`30c13f6`](#) (author_name)
>* **[BUGFIX]** bug fix commit message [`1cc492f`](#) (author_name)
>* **[DOC]** documentation update commit message [`6ebb7ed`](#) (author_name)
>* **[FEATURE]** new feature commit message [`fa36968`](#) (author_name)
>
>#### Breaking Changes
>* **[!!!]** breaking change commit message [`af1a8a2`](#) (author_name)
>* **[!!!]** breaking change commit message [`1f081e1`](#) (author_name)

#### GitHub Release Notes example based on git-log above with custom settings #1
<img width="1232" alt="GitHub Release Notes example" src="https://github.com/dmh/quick-release/assets/5150636/c71f2be3-406c-41b8-8511-4183d0608537">

***

### Custom settings example #2
#### `quickrelease.json`
```json
{
  "files": ["app.json"],
  "changelog": {
    "labels": ["feat:","fix:","docs:"],
    "breakingLabel": "BREAKING CHANGE:"
  },
  "githubReleaseTitles": ["New Features", "Bugfixes", "Documentation"]
}
```

#### git-log example
```git
BREAKING CHANGE: breaking change commit message
feat: new feature commit message
unimportant commit message
fix: bug fix commit message
BREAKING CHANGE: breaking change commit message
docs: documentation update commit message
unimportant commit message
feat: new feature commit message
initial commit
```

#### `CHANGELOG.md` example based on git-log above with custom settings #2
>### v1.0.0 `July 4, 2023`
>* **feat:** new feature commit message [`30c13f6`](#) (author_name)
>* **fix:** bug fix commit message [`1cc492f`](#) (author_name)
>* **docs:** documentation update commit message [`6ebb7ed`](#) (author_name)
>* **feat:** new feature commit message [`fa36968`](#) (author_name)
>
>#### Breaking Changes
>* **BREAKING CHANGE:** breaking change commit message [`af1a8a2`](#) (author_name)
>* **BREAKING CHANGE:** breaking change commit message [`1f081e1`](#) (author_name)

#### GitHub Release Notes example based on git-log above with custom settings #2
<img width="1232" alt="GitHub Release Notes example" src="https://github.com/dmh/quick-release/assets/5150636/65f57473-7625-49fb-8cc8-cf8f683a7511">

***

## Screenshots
<img width="600" alt="Release type" src="https://github.com/dmh/quick-release/assets/5150636/d25baf5b-1397-4cf0-9475-cd0658bc963f">
<img width="600" alt="Choose version" src="https://github.com/dmh/quick-release/assets/5150636/eecf6ede-135e-4148-be14-2e5da26fcec5">
<img width="635" alt="Ready for a new release" src="https://github.com/dmh/quick-release/assets/5150636/583fd580-9f4b-438d-a1ae-d6362be04c4f">


## Contributing
1. Clone the repository and run `npm link` to install dependencies and create a symlink to the global `node_modules` folder.
2. Now you can run `quick-release` command from any folder to test your changes.
3. Add your changes to repository.
4. Run `npm test` to run tests.
5. Commit your changes and create a pull request.
