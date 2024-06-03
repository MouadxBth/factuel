import { convexTest } from "convex-test";
import { test, expect } from "vitest";
import schema from "../schema";
import { getUser } from "../users";
import { api, internal } from "../_generated/api";
import { fail } from "assert";
import { ConvexError } from "convex/values";

test("getUser returns user data for valid tokenIdentifier", async () => {
  const t = convexTest(schema);

  const tokenIdentifier = "valid-token";
  const data = {
    tokenIdentifier,
    orgIds: [],
    name: "Test User",
    image: "test-image-url",
  };

  await t.run(async (ctx) => {
    await ctx.db.insert("users", data);
  });

  const user = await t.run(async (ctx) => {
    return await getUser(ctx, tokenIdentifier);
  });

  expect(user).toMatchObject(data);
});

test("createUser inserts a new user", async () => {
  const t = convexTest(schema);
  const data = {
    tokenIdentifier: "new-token",
    name: "New User",
    image: "new-image-url",
  };

  await t.mutation(internal.users.createUser, data);

  const user = await t.run(async (ctx) => {
    return await getUser(ctx, data.tokenIdentifier);
  });

  expect(user).toMatchObject({
    tokenIdentifier: "new-token",
    orgIds: [],
    name: "New User",
    image: "new-image-url",
  });
});

test("updateUser updates user data", async () => {
  const t = convexTest(schema);

  const tokenIdentifier = "existing-token";
  const data = {
    tokenIdentifier,
    name: "Old Name",
    image: "old-image-url",
  };

  await t.mutation(internal.users.createUser, data);

  const args = {
    tokenIdentifier,
    name: "Updated Name",
    image: "updated-image-url",
  };

  await t.mutation(internal.users.updateUser, args);

  const user = await t.run(async (ctx) => {
    return await getUser(ctx, data.tokenIdentifier);
  });

  expect(user).toMatchObject({
    tokenIdentifier,
    orgIds: [],
    name: "Updated Name",
    image: "updated-image-url",
  });
});

test("getMe returns null if no identity", async () => {
  const t = convexTest(schema);

  const result = await t.query(api.users.getMe);
  expect(result).toBeNull();
});

test("getMe returns user data for valid identity", async () => {
  const tokenIdentifier = "valid-token";
  const t = convexTest(schema).withIdentity({ tokenIdentifier });

  const data = {
    tokenIdentifier,
    name: "Test User",
    image: "test-image-url",
  };

  await t.mutation(internal.users.createUser, data);

  const result = await t.query(api.users.getMe);

  expect(result).toMatchObject({
    tokenIdentifier,
    orgIds: [],
    name: "Test User",
    image: "test-image-url",
  });
});

test("addOrgIdToUser adds orgId to user's orgIds", async () => {
  const t = convexTest(schema);

  const tokenIdentifier = "user-token";
  const userData = {
    tokenIdentifier,
    name: "Test User",
    image: "test-image-url",
  };

  await t.mutation(internal.users.createUser, userData);

  const args = { tokenIdentifier, orgId: "org-123", role: "member" as const };

  await t.mutation(internal.users.addOrgIdToUser, args);

  const user = await t.run(async (ctx) => {
    return await getUser(ctx, tokenIdentifier);
  });

  expect(user.orgIds).toEqual([{ orgId: "org-123", role: "member" }]);
});

test("updateRoleInOrgForUser updates role in orgIds", async () => {
  const t = convexTest(schema);

  const tokenIdentifier = "user-token";
  const orgId = "org-123";
  const newRole = "admin" as const;

  const userData = {
    tokenIdentifier,
    name: "Test User",
    image: "test-image-url",
  };

  await t.mutation(internal.users.createUser, userData);

  const args = { tokenIdentifier, orgId: "org-123", role: "member" as const };

  await t.mutation(internal.users.addOrgIdToUser, args);

  const newArgs = { tokenIdentifier, orgId, role: newRole };

  await t.mutation(internal.users.updateRoleInOrgForUser, newArgs);

  const user = await t.run(async (ctx) => {
    return await getUser(ctx, tokenIdentifier);
  });

  expect(user.orgIds).toEqual([{ orgId, role: newRole }]);
});

test("getUserProfile returns user profile data", async () => {
  const t = convexTest(schema);

  const userData = {
    tokenIdentifier: "hello",
    name: "Test User",
    image: "test-image-url",
  };

  await t.mutation(internal.users.createUser, userData);

  const user = await t.run(async (ctx) => {
    return await getUser(ctx, userData.tokenIdentifier);
  });

  if (!user) fail("User was not inserted");

  const result = await t.query(api.users.getUserProfile, { userId: user._id });

  expect(result).toEqual({
    name: "Test User",
    image: "test-image-url",
  });
});

test("getUser throws error for invalid tokenIdentifier", async () => {
  const t = convexTest(schema);

  const invalidTokenIdentifier = "invalid-token";

  await t.run(async (ctx) => {
    await expect(getUser(ctx, invalidTokenIdentifier)).rejects.toThrow(
      new ConvexError("expected user to be defined")
    );
  });
});
