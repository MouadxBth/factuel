import { convexTest } from "convex-test";
import { test, expect } from "vitest";
import schema from "../schema";
import { api, internal } from "../_generated/api";
import { ConvexError } from "convex/values";
import { Id } from "../_generated/dataModel";
import { getUser } from "../users";
import * as fs from "fs";
import { join } from "path";
import { assert } from "console";

test("generateUploadUrl throws error if user is not logged in", async () => {
  const t = convexTest(schema);

  await expect(t.mutation(api.files.generateUploadUrl)).rejects.toThrow(
    new ConvexError("you must be logged in to upload a file")
  );
});

test("generateUploadUrl returns upload URL for logged in user", async () => {
  const t = convexTest(schema).withIdentity({ tokenIdentifier: "user-token" });

  const url = await t.mutation(api.files.generateUploadUrl);

  expect(url).toBeDefined();
  expect(url.length === 0).toBe(false);
});

test("createFile inserts a new file for authorized user", async () => {
  const t = convexTest(schema).withIdentity({ tokenIdentifier: "user-token" });

  const userData = {
    tokenIdentifier: "user-token",
    name: "Test User",
    image: "test-image-url",
  };

  await t.mutation(internal.users.createUser, userData);

  await t.mutation(internal.users.addOrgIdToUser, {
    orgId: "org-123",
    role: "member",
    tokenIdentifier: userData.tokenIdentifier,
  });

  const file = fs.readFileSync(join(process.cwd(), "README.md"));

  const storageId = await t.run(async (ctx) => {
    return await ctx.storage.store(new Blob([file]));
  });

  const fileData = {
    name: "test-file",
    fileId: storageId as Id<"_storage">,
    orgId: "org-123",
    type: "document",
  };

  await t.mutation(api.files.createFile, fileData);

  const files = await t.run(async (ctx) => {
    return await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", fileData.orgId))
      .collect();
  });

  expect(files.length).toBe(1);
  expect(files[0]).toMatchObject(fileData);
});

test("getFiles returns files with access and filtered by query", async () => {
  const t = convexTest(schema).withIdentity({ tokenIdentifier: "user-token" });

  const userData = {
    tokenIdentifier: "user-token",
    name: "Test User",
    image: "test-image-url",
  };

  await t.mutation(internal.users.createUser, userData);

  await t.mutation(internal.users.addOrgIdToUser, {
    orgId: "org-123",
    role: "member",
    tokenIdentifier: userData.tokenIdentifier,
  });

  const file = fs.readFileSync(join(process.cwd(), "README.md"));

  const storageId = await t.run(async (ctx) => {
    return await ctx.storage.store(new Blob([file]));
  });

  const fileData = {
    name: "test-file",
    fileId: storageId as Id<"_storage">,
    orgId: "org-123",
    type: "document",
  };

  await t.mutation(api.files.createFile, fileData);

  const result = await t.query(api.files.getFiles, {
    orgId: "org-123",
    query: "test",
  });

  expect(result.length).toBe(1);
  expect(result[0].name).toBe("test-file");
});

test("deleteFile marks file for deletion for authorized user", async () => {
  const t = convexTest(schema).withIdentity({ tokenIdentifier: "user-token" });

  const userData = {
    tokenIdentifier: "user-token",
    name: "Test User",
    image: "test-image-url",
  };

  await t.mutation(internal.users.createUser, userData);

  await t.mutation(internal.users.addOrgIdToUser, {
    orgId: "org-123",
    role: "member",
    tokenIdentifier: userData.tokenIdentifier,
  });

  const file = fs.readFileSync(join(process.cwd(), "README.md"));

  const storageId = await t.run(async (ctx) => {
    return await ctx.storage.store(new Blob([file]));
  });

  const fileData = {
    name: "test-file",
    fileId: storageId as Id<"_storage">,
    orgId: "org-123",
    type: "document",
  };

  await t.mutation(api.files.createFile, fileData);

  const fileResult = await t.run(async (ctx) => {
    return await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", fileData.orgId))
      .first();
  });

  expect(fileResult).toBeDefined();
  expect(fileResult).not.toBeNull();
  expect(fileResult).toMatchObject(fileData);

  await t.mutation(api.files.deleteFile, { fileId: fileResult!._id });

  const markedFile = await t.run(async (ctx) => {
    return await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", fileData.orgId))
      .first();
  });

  expect(markedFile).toBeDefined();
  expect(markedFile).not.toBeNull();
  expect(markedFile).toMatchObject(fileData);

  expect(markedFile!.shouldDelete).toBe(true);
});

test("restoreFile restores file for authorized user", async () => {
  const t = convexTest(schema).withIdentity({ tokenIdentifier: "user-token" });

  const userData = {
    tokenIdentifier: "user-token",
    name: "Test User",
    image: "test-image-url",
  };

  await t.mutation(internal.users.createUser, userData);

  await t.mutation(internal.users.addOrgIdToUser, {
    orgId: "org-123",
    role: "member",
    tokenIdentifier: userData.tokenIdentifier,
  });

  const file = fs.readFileSync(join(process.cwd(), "README.md"));

  const storageId = await t.run(async (ctx) => {
    return await ctx.storage.store(new Blob([file]));
  });

  const fileData = {
    name: "test-file",
    fileId: storageId as Id<"_storage">,
    orgId: "org-123",
    type: "document",
  };

  await t.mutation(api.files.createFile, fileData);

  const fileResult = await t.run(async (ctx) => {
    return await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", fileData.orgId))
      .first();
  });

  expect(fileResult).toBeDefined();
  expect(fileResult).not.toBeNull();
  expect(fileResult).toMatchObject(fileData);

  await t.mutation(api.files.restoreFile, { fileId: fileResult!._id });
  const markedFile = await t.run(async (ctx) => {
    return await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", fileData.orgId))
      .first();
  });

  expect(markedFile).toBeDefined();
  expect(markedFile).not.toBeNull();
  expect(markedFile).toMatchObject(fileData);

  expect(markedFile!.shouldDelete).toBe(false);
});

test("toggleFavorite toggles file favorite status for authorized user", async () => {
  const t = convexTest(schema).withIdentity({ tokenIdentifier: "user-token" });

  const userData = {
    tokenIdentifier: "user-token",
    name: "Test User",
    image: "test-image-url",
  };

  await t.mutation(internal.users.createUser, userData);

  await t.mutation(internal.users.addOrgIdToUser, {
    orgId: "org-123",
    role: "member",
    tokenIdentifier: userData.tokenIdentifier,
  });

  const user = await t.run(async (ctx) => {
    return await getUser(ctx, userData.tokenIdentifier);
  });
  const file = fs.readFileSync(join(process.cwd(), "README.md"));

  const storageId = await t.run(async (ctx) => {
    return await ctx.storage.store(new Blob([file]));
  });

  const fileData = {
    name: "test-file",
    fileId: storageId as Id<"_storage">,
    orgId: "org-123",
    type: "document",
  };

  await t.mutation(api.files.createFile, fileData);

  const fileResult = await t.run(async (ctx) => {
    return await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", fileData.orgId))
      .first();
  });

  expect(fileResult).toBeDefined();
  expect(fileResult).not.toBeNull();
  expect(fileResult).toMatchObject(fileData);

  await t.mutation(api.files.toggleFavorite, { fileId: fileResult!._id });

  let favorites = await t.run(async (ctx) => {
    return await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q
          .eq("userId", user._id)
          .eq("orgId", fileData.orgId)
          .eq("fileId", fileResult!._id)
      )
      .collect();
  });

  expect(favorites.length).toBe(1);

  await t.mutation(api.files.toggleFavorite, { fileId: fileResult!._id });

  favorites = await t.run(async (ctx) => {
    return await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q
          .eq("userId", user._id)
          .eq("orgId", fileData.orgId)
          .eq("fileId", fileResult!._id)
      )
      .collect();
  });

  expect(favorites.length).toBe(0);
});

test("getAllFavorites returns all favorite files for user in an organization", async () => {
  const t = convexTest(schema).withIdentity({ tokenIdentifier: "user-token" });

  const userData = {
    tokenIdentifier: "user-token",
    name: "Test User",
    image: "test-image-url",
  };

  await t.mutation(internal.users.createUser, userData);

  await t.mutation(internal.users.addOrgIdToUser, {
    orgId: "org-123",
    role: "member",
    tokenIdentifier: userData.tokenIdentifier,
  });

  const user = await t.run(async (ctx) => {
    return await getUser(ctx, userData.tokenIdentifier);
  });
  const file = fs.readFileSync(join(process.cwd(), "README.md"));

  const storageId = await t.run(async (ctx) => {
    return await ctx.storage.store(new Blob([file]));
  });

  const fileData = {
    name: "test-file",
    fileId: storageId as Id<"_storage">,
    orgId: "org-123",
    type: "document",
  };

  await t.mutation(api.files.createFile, fileData);

  const fileResult = await t.run(async (ctx) => {
    return await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", fileData.orgId))
      .first();
  });

  expect(fileResult).toBeDefined();
  expect(fileResult).not.toBeNull();
  expect(fileResult).toMatchObject(fileData);

  await t.mutation(api.files.toggleFavorite, { fileId: fileResult!._id });

  const result = await t.query(api.files.getAllFavorites, { orgId: "org-123" });

  expect(result.length).toBe(1);
  expect(result[0]).toMatchObject({
    fileId: fileResult!._id,
    userId: user._id,
    orgId: fileData.orgId,
  });
});
