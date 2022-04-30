module.exports = {
  plugins: [
    ["@semantic-release/commit-analyzer", {
      preset: "angular",
      releaseRules: [
        {
          type: "docs",
          scope: "README",
          release: "patch",
        },
        {
          type: "chore",
          release: "patch",
        },
        {
          type: "fix",
          release: "patch",
        },
        {
          type: "refactor",
          release: "patch",
        }
      ]
    }],
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    ["@semantic-release/npm", {
      tarballDir: "release"
    }],
    ["@semantic-release/github", {
      assets: "release/*.tgz",
    }],
    "@semantic-release/git",
  ],
  branches: ["main"],
  rootDir: "dist"
}