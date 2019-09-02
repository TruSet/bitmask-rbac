# bitmask-rbac-portal

This is an example interface for interacting with a bitmask-rbac.  You may wish to modify the code to fit your use of the bitmask rbac provided in the parent folder (and let us know!).

The app assumes you are connected with metamask to the ethereum blockchain that your rbac is deployed on.

It will display admin functionality if you are signed in with metamask as an admin user in the app (by default the user that deploys the rbac contract is an admin).

If you are using this for your own rbac, you can change the roles that the application references in `/src/services/UserService` and `/src/components/UserTable`
