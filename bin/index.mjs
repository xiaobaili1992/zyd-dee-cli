import fs from 'fs-extra';
import semver from 'semver';
import minimist from 'minimist';
import prompts from 'prompts';
import simpleGit from 'simple-git';
import { Command } from 'commander';
import { execSync } from 'child_process';
import path from 'node:path';
import chalk from 'chalk';

const name$1 = "zyd-dee-cli";
const version$1 = "0.0.1";
const type = "module";
const description = "zyd-dee-cli cli";
const main = "index.js";
const bin = {
	"zyd-dee-cli": "index.js"
};
const scripts = {
	dev: "unbuild --stub && cd bin && node index.mjs",
	build: "unbuild"
};
const author = "xiaobai.li";
const license = "ISC";
const repository = {
	type: "git",
	url: "https://github.com/xiaobaili1992/zyd-dee-cli.git"
};
const dependencies = {
	chalk: "^5.3.0",
	commander: "^12.1.0",
	"fs-extra": "^11.2.0",
	minimist: "^1.2.8",
	prompts: "^2.4.2",
	semver: "^7.6.3",
	"simple-git": "^3.26.0",
	typescript: "^5.5.4"
};
const devDependencies = {
	unbuild: "^2.0.0"
};
const engines$1 = {
	node: ">=18.18.0"
};
const pkg = {
	name: name$1,
	version: version$1,
	type: type,
	description: description,
	main: main,
	bin: bin,
	scripts: scripts,
	author: author,
	license: license,
	repository: repository,
	dependencies: dependencies,
	devDependencies: devDependencies,
	engines: engines$1
};

const repoUrlData = {
  react: "https://github.com/xiaobaili1992/react-template.git",
  vue: "https://github.com/xiaobaili1992/vue-template.git"
};
const getLocalPath = (projectName) => {
  return path.join(process.cwd(), projectName);
};
const getFilePath = (projectName, fileName) => {
  return path.join(getLocalPath(projectName), fileName);
};

const log = console.log;
const logSuccess = (msg) => {
  log(chalk.green(msg));
};
const logBgSuccess = (msg) => {
  log(chalk.bgGreen(msg));
};
const logError = (msg) => {
  log(chalk.red(msg));
};
const logBgError = (msg) => {
  log(chalk.bgRed(msg));
};
const logWarning = (msg) => {
  const warning = chalk.hex("#FFA500");
  log(warning(msg));
};
const logInfo = (msg) => {
  log(chalk.blue(msg));
};

const program = new Command();
const { name, version, engines } = pkg;
const cli = async () => {
  try {
    await prepare();
    registerCommand();
  } catch (e) {
    logError(e);
  }
};
const prepare = async () => {
  checkNodeVersion(process.version, engines.node, name);
  checkPkgVersion();
  await checkGlobalUpdate();
};
const registerCommand = () => {
  program.name(name).description("zyd-dee-cli \u662F\u4E00\u4E2A\u5FEB\u901F\u521B\u5EFAreact\u3001vue\u9879\u76EE\u7684\u547D\u4EE4\u884C\u5DE5\u5177").version(version);
  program.command("create <projectName>").option("--template <templateName>", "\u9009\u62E9\u9879\u76EE\u6846\u67B6").option("--tool <toolName>", "\u9009\u62E9\u5305\u7BA1\u7406\u5DE5\u5177").action(async (projectName, options) => {
    const args = minimist(process.argv)?._?.slice(3);
    if (args.length > 1) {
      logWarning("\u26A0\uFE0F  \u68C0\u6D4B\u5230\u60A8\u8F93\u5165\u4E86\u591A\u4E2A\u9879\u76EE\u540D\u79F0\uFF0C\u5C06\u4EE5\u7B2C\u4E00\u4E2A\u53C2\u6570\u4E3A\u9879\u76EE\u540D\uFF0C\u5C06\u820D\u5F03\u540E\u7EED\u53C2\u6570");
    }
    if (!options.template) {
      const template = await userSelectTemplate();
      options.template = template;
      const tool = await userSelectTool();
      options.tool = tool;
      cloneAndModifyRepo(projectName, options);
      return;
    }
    cloneAndModifyRepo(projectName, options);
  });
  program.parse(process.argv);
};
const checkNodeVersion = (curVersion, needNodeVersion, name2) => {
  if (!semver.satisfies(curVersion, needNodeVersion)) {
    logBgError(`\u4F60\u4F7F\u7528\u7684Node\u7248\u672C\u53F7\u4E3A\uFF1A ${curVersion}, \u4F46 ${name2} \u9700\u8FD0\u884C\u5728 ${needNodeVersion} \u8BF7\u5347\u7EA7\u4F60\u7684Node\u7248\u672C!`);
    process.exit(1);
  }
};
const checkPkgVersion = () => {
  if (!semver.satisfies(process.version, "18.x || >= 19.0.0")) {
    logWarning(`\u4F60\u4F7F\u7528\u7684Node\u7248\u672C\u662F${process.version}\u5F3A\u70C8\u5EFA\u8BAE\u4F60\u4F7F\u7528\u6700\u65B0 LTS \u7248\u672C`);
  }
};
const checkGlobalUpdate = async () => {
  try {
    logInfo(`\u68C0\u67E5 ${name} \u6700\u65B0\u7248\u672C`);
    const latestVersion = execSync(`npm show ${name} version`).toString().trim();
    if (latestVersion && semver.gt(latestVersion, version)) {
      logInfo(`\u8BF7\u624B\u52A8\u66F4\u65B0 ${name}\uFF0C\u5F53\u524D\u7248\u672C\uFF1A${version}\uFF0C\u6700\u65B0\u7248\u672C\uFF1A${latestVersion} \u66F4\u65B0\u547D\u4EE4\uFF1Anpm install -g ${name} \u6216 yarn global add ${name}`);
    } else {
      logSuccess(`\u5F53\u524D\u7248\u672C\uFF1A${version}\uFF0C\u5DF2\u662F\u6700\u65B0\u7248\u672C`);
    }
  } catch (e) {
    logError(`\u68C0\u67E5 ${name} \u6700\u65B0\u7248\u672C\u5931\u8D25\uFF0C${e.message}`);
  }
};
const userSelectTemplate = async () => {
  const res = await prompts([
    {
      type: "select",
      name: "template",
      message: "\u8BF7\u9009\u62E9\u6846\u67B6",
      choices: [
        { title: "react", value: "react" },
        { title: "vue", value: "vue" }
      ]
    }
  ]);
  return res?.template;
};
const userSelectTool = async () => {
  const res = await prompts([
    {
      type: "select",
      name: "tool",
      message: "\u8BF7\u9009\u62E9\u5305\u7BA1\u7406\u5DE5\u5177",
      choices: [
        { title: "npm", value: "npm" },
        { title: "yarn", value: "yarn" },
        { title: "pnpm", value: "pnpm" },
        { title: "bun", value: "bun" }
      ]
    }
  ]);
  return res?.tool;
};
const cloneAndModifyRepo = async (projectName, options) => {
  try {
    const git = simpleGit();
    const { tool, template } = options;
    const repoUrl = repoUrlData[template];
    const localPath = getLocalPath(projectName);
    if (fs.existsSync(localPath)) {
      logBgError(`\u8BE5\u9879\u76EE\u540D ${projectName} \u5DF2\u5B58\u5728\uFF0C\u65E0\u6CD5\u521B\u5EFA\uFF0C\u8BF7\u66F4\u6362\u9879\u76EE\u540D`);
      process.exit(1);
    }
    logInfo("\u6B63\u5728\u521B\u5EFA\u9879\u76EE...");
    await git.clone(repoUrl, localPath);
    await modifyPackageName(projectName, "package.json");
    await deleteFileOrDir(projectName, "yarn.lock");
    await deleteFileOrDir(projectName, ".git");
    logInfo("\u6B63\u5728\u5B89\u88C5\u4F9D\u8D56\u5305...");
    execSync(`${tool} install`, { cwd: localPath, stdio: "ignore" });
    logSuccess("\u4F9D\u8D56\u5305\u5B89\u88C5\u6210\u529F");
    logBgSuccess("\u9879\u76EE\u521B\u5EFA\u6210\u529F");
  } catch (e) {
    logError(e);
  }
};
const deleteFileOrDir = async (projectName, fileName) => {
  try {
    const filePath = getFilePath(projectName, fileName);
    fs.remove(filePath);
  } catch (e) {
    logError(e);
  }
};
const modifyPackageName = async (projectName, fileName) => {
  try {
    const filePath = getFilePath(projectName, fileName);
    const packageJson = await fs.readJson(filePath);
    packageJson.name = projectName;
    await fs.writeJson(filePath, packageJson, { spaces: 2 });
  } catch (e) {
    logError(e);
  }
};
cli();
