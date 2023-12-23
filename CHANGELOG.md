## [5.0.0](https://github.com/feathermint/core/compare/v4.0.0...v5.0.0) (2023-12-23)


### ⚠ BREAKING CHANGES

* domain modifications
* remove FeeEstimator and MockFeeEstimator classes
* remove matic related constants

### Features

* domain modifications ([d770f7b](https://github.com/feathermint/core/commit/d770f7b96f400be65354364335b0520a8013b321))
* remove FeeEstimator and MockFeeEstimator classes ([099f62e](https://github.com/feathermint/core/commit/099f62e1baa1b3ec6ed1a6a64342f45b0a827982))
* remove matic related constants ([070c3a6](https://github.com/feathermint/core/commit/070c3a6e3fa4ecf1218b255abe6779e1a50f4f11))

## [4.0.0](https://github.com/feathermint/core/compare/v3.0.0...v4.0.0) (2023-12-12)


### ⚠ BREAKING CHANGES

* add runTransaction, remove getStream
* domain modifications and additions
* remove StatusService class
* multiple breaking changes

### Features

* add Redis-related constants ([8074143](https://github.com/feathermint/core/commit/80741439ead969bcb50e2bd4c7bb8c95990d3cf1))
* add runTransaction, remove getStream ([205e2ac](https://github.com/feathermint/core/commit/205e2ac17f24640325cceadebf6234de1db3385f))
* domain modifications and additions ([36aae79](https://github.com/feathermint/core/commit/36aae797cf7868b0cb0c3900b5457fcb36f36a14))
* remove StatusService class ([25c0be9](https://github.com/feathermint/core/commit/25c0be97b9d209181541aaff69e585df46f1d1fb))


### Bug Fixes

* eslint error when accessing job status ([bf8ff4d](https://github.com/feathermint/core/commit/bf8ff4d5409f74cd851cfcc3e93b5ce5f2c9e8fc))
* update package exports ([249cf17](https://github.com/feathermint/core/commit/249cf1797cf8df772d6aec120de65e7f281fdc31))


### Code Refactoring

* multiple breaking changes ([4ff73f5](https://github.com/feathermint/core/commit/4ff73f50ba5c42c5efb3eb78f8b390b883c1b2ed))

## [3.0.0](https://github.com/feathermint/core/compare/v2.0.0...v3.0.0) (2023-11-09)


### ⚠ BREAKING CHANGES

* additional modifications to domain types
* updated RepositoryMap
* additional modifications to domain types
* **FeeEstimator:** align with EIP-1559
* modify existing domain types, new additions

### Features

* add sleep utility function ([421e64a](https://github.com/feathermint/core/commit/421e64a5f3a845af60269d5d26adef3a40721127))
* add StatusService class ([6c3f393](https://github.com/feathermint/core/commit/6c3f3935dfdceb27200aae47ce7ca8a4fd53e6c3))
* add type guard for NonEmptyArray ([c8147aa](https://github.com/feathermint/core/commit/c8147aa94983e007a8ae9762460d9a94dea7559c))
* additional modifications to domain types ([e93be3f](https://github.com/feathermint/core/commit/e93be3f86f1ac906357efe17f123831762f37e4d))
* additional modifications to domain types ([0f287fa](https://github.com/feathermint/core/commit/0f287fa60bf0be717370a9ac235aa9ce8295e672))
* modify existing domain types, new additions ([e82680e](https://github.com/feathermint/core/commit/e82680e09967e46689e99117471feeb29728016f))
* updated RepositoryMap ([2ba52be](https://github.com/feathermint/core/commit/2ba52be581840d213f4eadd9ceea7302ffa8bcfc))


### Code Refactoring

* **FeeEstimator:** align with EIP-1559 ([5f1ac1b](https://github.com/feathermint/core/commit/5f1ac1be076affea81b9106383d4836584c6d11b))

## [2.0.0](https://github.com/feathermint/core/compare/v1.0.0...v2.0.0) (2023-09-06)


### ⚠ BREAKING CHANGES

* modify domain types, add Worker type
* remove reservedAmount method

### Features

* modify domain types, add Worker type ([6ee3e31](https://github.com/feathermint/core/commit/6ee3e31c04ab1bd7792e31b0f25358f0a0d86316))
* pass methods to MockCollection contstructor ([8f807fc](https://github.com/feathermint/core/commit/8f807fc712a9fb379829e5be2a41cd16d4feb6f4))
* remove reservedAmount method ([1f222b7](https://github.com/feathermint/core/commit/1f222b7d75f3b9ec4dab37fb5115ae21a900f73d))
* update RepositoryMap with workers collection ([4b7d346](https://github.com/feathermint/core/commit/4b7d346683b258df52d849591351c03cdded254f))
* update RepositoryMap, add #dbName property ([10d6382](https://github.com/feathermint/core/commit/10d63825832e4bdea50f74c83c17bbca6af67348))


### Bug Fixes

* add changelog to .prettierignore ([0d89451](https://github.com/feathermint/core/commit/0d89451f9b3ae686606ee03412c3c4e8bb0f85e9))
* solve export issue with MockCollection ([af5d9d6](https://github.com/feathermint/core/commit/af5d9d63fecf50109e1bda26ca490d34935fed30))

## 1.0.0 (2023-09-01)


### Features

* initial commit ([5cb87c2](https://github.com/feathermint/core/commit/5cb87c261b47bf5cc117637ce92ddf8dbb442087))
