# contracts

Euler DeFi smart contracts (Solidity / Truffle). Archived snapshot, as-is.

This tree is a **new public commit** with no git history. The original private archive is `eulertools/contracts-archive`.

## What was built (EN)

Solidity contracts compiled with Truffle: `EulerStaking.sol` (deposit / withdraw / claim) and `EulerTools.sol` (BEP-20 token, BscScan-verified dump). OpenZeppelin 4.2.0, migrations for BSC testnet and mainnet, Mocha/Chai tests, and a small staking SDK (`src/EulerStakingSDK.ts`). Keys are read from the environment only (see `.env.example`). Licensed under MIT.

`deployed_contracts/` holds BscScan verification dumps (token, liquidity mining, liquidity pool, presale) from 2021-03-26. Those sources do not record their on-chain addresses in this tree except the token, which is listed below.

## Qué se construyó (ES)

Contratos Solidity con Truffle: `EulerStaking.sol` (depósito / retiro / reclamación) y `EulerTools.sol` (token BEP-20, dump verificado en BscScan). OpenZeppelin 4.2.0, migraciones para testnet y mainnet de BSC, tests Mocha/Chai y un SDK pequeño de staking. Las claves salen solo del entorno (`.env.example`). Licencia MIT.

## Deployments

Only addresses recorded in this repository (Truffle artifacts, tests, or the verified token) are listed. No address is invented.

### BSC mainnet (chain id 56)

| Contract | Address |
|---|---|
| EulerTools (EULER token) | [`0x3920123482070c1a2dff73aad695c60e7c6f6862`](https://bscscan.com/token/0x3920123482070c1a2dff73aad695c60e7c6f6862) |

BscScan: verified 2021-03-26, contract name `EulerTools`, compiler `0.7.6`, MIT, 100,000,000 supply.

### BSC testnet (chain id 97)

From `build/contracts/*.json` (`updatedAt` 2021-09-09):

| Contract | Address | Deploy tx |
|---|---|---|
| EulerStaking | [`0x8A25FdD7dD840bd89fC5562823Cff6Af3FAFdbc6`](https://testnet.bscscan.com/address/0x8A25FdD7dD840bd89fC5562823Cff6Af3FAFdbc6) | `0xcee11b9f1b3474c65728e6b3aa561782126fae279bc89fc66275f92f1c8dae68` |
| Migrations | `0xA374006B0071B758207fa1736Cf1f6D1CDA822F9` | `0x982708c4301593cd6f0659f67a5932ae461b32782fdeebd05a07bc87478bb82e` |

This repo’s Truffle artifact for `EulerStaking` has **no** mainnet (56) entry.

---

## Notice / Aviso

**Euler Tools ha cerrado. Euler Tools is closed.**

La empresa quebró. Este repositorio está archivado y no se mantiene. El software se ofrece tal cual (as is), sin garantía ni soporte. Parte del material puede ser reclamado por acreedores.

The company went bankrupt. This repository is archived and unmaintained. Software is provided as is, with no warranty and no support. Some material may be claimed by creditors.

Site: https://euler.tools  
Org: https://github.com/eulertools  
Enquiries: https://sinequix.com · https://github.com/tebayoso
