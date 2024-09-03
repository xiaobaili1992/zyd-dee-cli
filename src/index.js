import fs from 'fs-extra'
import semver from 'semver'
import minimist from 'minimist'
import prompts from 'prompts'
import simpleGit from 'simple-git'
import { Command } from 'commander'
import { execSync } from "child_process"
import pkg from '../package.json'
import { repoUrlData, getLocalPath, getFilePath } from './config.js'
import { logSuccess, logBgSuccess, logError, logBgError, logWarning, logInfo } from './log.js'

const program = new Command()
const { name, version, engines } = pkg

const cli = async () => {
  try {
    await prepare();
    registerCommand();
  } catch (e) {
    logError(e)
  }
}

const prepare = async () => {
  checkNodeVersion(process.version, engines.node, name);
  checkPkgVersion();
  await checkGlobalUpdate();
}

const registerCommand = () => {
  program
    .name(name)
    .description('zyd-dee-cli 是一个快速创建react、vue项目的命令行工具')
    .version(version);
    
  program
    .command('create <projectName>')
    .option('--template <templateName>', '选择项目框架')
    .option('--tool <toolName>', '选择包管理工具')
    .action(async (projectName, options) => {
      const args = minimist(process.argv)?._?.slice(3);
      if (args.length > 1) {
        logWarning('⚠️  检测到您输入了多个项目名称，将以第一个参数为项目名，将舍弃后续参数')
      }
      if (!options.template) {
        const template = await userSelectTemplate();
        options.template = template
        const tool = await userSelectTool();
        options.tool = tool
        cloneAndModifyRepo(projectName, options);
        return;
      }
      cloneAndModifyRepo(projectName, options);
  });

  program.parse(process.argv);
}

const checkNodeVersion = (curVersion, needNodeVersion, name) => {
  if (!semver.satisfies(curVersion, needNodeVersion)) {
    logBgError(`你使用的Node版本号为： ${curVersion}, 但 ${name} 需运行在 ${needNodeVersion} 请升级你的Node版本!`)
    process.exit(1)
  }
}

const checkPkgVersion = () => {
  if (!semver.satisfies(process.version, '18.x || >= 19.0.0')) {
    logWarning(`你使用的Node版本是${process.version}强烈建议你使用最新 LTS 版本`)
  }
}

const checkGlobalUpdate = async () => {
  try {
    logInfo(`检查 ${name} 最新版本`)
    const latestVersion = execSync(`npm show ${name} version`).toString().trim();
    if (latestVersion && semver.gt(latestVersion, version)) {
      logInfo(`请手动更新 ${name}，当前版本：${version}，最新版本：${latestVersion} 更新命令：npm install -g ${name} 或 yarn global add ${name}`)
    } else {
      logSuccess(`当前版本：${version}，已是最新版本`)
    }
  } catch (e) {
    logError(`检查 ${name} 最新版本失败，${e.message}`)
  }
}

const userSelectTemplate = async () => {
  const res = await prompts([
    {
      type: 'select',
      name: 'template',
      message: '请选择框架',
      choices: [
        { title:'react', value:'react' },
        { title: 'vue', value: 'vue' },
      ],
    }
  ]);
  return res?.template
}

const userSelectTool = async () => {
  const res = await prompts([
    {
      type:'select',
      name: 'tool',
      message: '请选择包管理工具',
      choices: [
        { title:'npm', value:'npm' },
        { title: 'yarn', value: 'yarn' },
        { title: 'pnpm', value: 'pnpm' },
        { title: 'bun', value: 'bun' },
      ],
    }
  ]);
  return res?.tool
}

const cloneAndModifyRepo = async (projectName, options) => {
  try {
    const git = simpleGit();
    const { tool, template } = options
    const repoUrl = repoUrlData[template];
    const localPath = getLocalPath(projectName);

    if (fs.existsSync(localPath)) {
      logBgError(`该项目名 ${projectName} 已存在，无法创建，请更换项目名`);
      process.exit(1)
    }
    logInfo('正在创建项目...')
    await git.clone(repoUrl, localPath);

    await modifyPackageName(projectName, 'package.json')
    await deleteFileOrDir(projectName, 'yarn.lock')
    await deleteFileOrDir(projectName, '.git')

    logInfo('正在安装依赖包...')
    execSync(`${tool} install`, { cwd: localPath, stdio: 'ignore' });
    logSuccess('依赖包安装成功')
    logBgSuccess('项目创建成功')
  } catch (e) {
    logError(e)
  }
}

const deleteFileOrDir = async (projectName, fileName) => {
  try {
    const filePath = getFilePath(projectName, fileName);
    fs.remove(filePath);
  } catch (e) {
    logError(e)
  }
}

const modifyPackageName = async (projectName, fileName) => {
  try {
    const filePath = getFilePath(projectName, fileName);
    const packageJson = await fs.readJson(filePath);
    packageJson.name = projectName;

    await fs.writeJson(filePath, packageJson, { spaces: 2 });
  } catch (e) {
    logError(e)
  }
}

cli()
