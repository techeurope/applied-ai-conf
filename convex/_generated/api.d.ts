/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _auth from "../_auth.js";
import type * as _tokens from "../_tokens.js";
import type * as abuse_tests from "../abuse_tests.js";
import type * as admin from "../admin.js";
import type * as admin_email from "../admin_email.js";
import type * as agenda from "../agenda.js";
import type * as claim from "../claim.js";
import type * as consents from "../consents.js";
import type * as contacts from "../contacts.js";
import type * as crons from "../crons.js";
import type * as email from "../email.js";
import type * as favorites from "../favorites.js";
import type * as goals from "../goals.js";
import type * as luma from "../luma.js";
import type * as me from "../me.js";
import type * as partners from "../partners.js";
import type * as scans from "../scans.js";
import type * as seed from "../seed.js";
import type * as ticket from "../ticket.js";
import type * as transfer_test from "../transfer_test.js";
import type * as users from "../users.js";
import type * as vouchers from "../vouchers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  _auth: typeof _auth;
  _tokens: typeof _tokens;
  abuse_tests: typeof abuse_tests;
  admin: typeof admin;
  admin_email: typeof admin_email;
  agenda: typeof agenda;
  claim: typeof claim;
  consents: typeof consents;
  contacts: typeof contacts;
  crons: typeof crons;
  email: typeof email;
  favorites: typeof favorites;
  goals: typeof goals;
  luma: typeof luma;
  me: typeof me;
  partners: typeof partners;
  scans: typeof scans;
  seed: typeof seed;
  ticket: typeof ticket;
  transfer_test: typeof transfer_test;
  users: typeof users;
  vouchers: typeof vouchers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
