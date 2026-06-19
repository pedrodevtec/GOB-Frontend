# Frontend permissions model

The frontend uses two independent permission layers.

## Global account role

`accountRole` (or `systemRole` when supplied by the backend) is the global account role.

Allowed values:

- `USER`
- `ADMIN`

Use it only for system-wide features such as admin navigation, admin pages, global user management, and global content management.

Legacy user responses may still expose `role`. The API mapper treats that field as a global account role only and normalizes any non-`ADMIN` value to `USER`.

## Table-specific role

Table list and detail responses expose:

- `currentUserRole`: `MASTER` or `PLAYER`
- `isMaster`: boolean compatibility flag
- `memberStatus`: `ACTIVE`, `INVITED`, or `REMOVED`
- `membersCount`: number of table members

Use these fields for campaign permissions. Master access is granted only when `isMaster === true` or `currentUserRole` normalizes to `MASTER`. When membership status is enforced, it must be `ACTIVE`.

Player actions are available when `currentUserRole` is `PLAYER` or the user is an active table member.

## Invariants

- Global `ADMIN` does not imply table `MASTER`.
- A global `USER` may be `MASTER` in a table.
- A global `ADMIN` may be `PLAYER` in a table.
- `MASTER` is valid only inside a table/campaign context.
- Legacy table `role` is not used to infer table access. Missing `currentUserRole`/`isMaster` data produces an integration warning in development.
