const npmLog = require('npmlog');
const fse = require('fs-extra');
const path = require('path');
const { getLicense } = require('license');
const runPrompts = require('./prompts');
const initTemplate = require('./initTemplate');
const dynamicRequire = require('./dynamicRequire');
const gitInit = require('./gitInit');
const installDeps = require('./installDeps');

const { mergePkg } = require('./mergePkg');

npmLog.addLevel('success', 2000, { fg: 'green', bold: true }); // 添加自定义日志等级

async function create() {
  // 获取用户配置
  const userConfig = await runPrompts();
  const cwd = process.cwd();
  const projectName = userConfig.projectName;
  const projectDir = path.join(cwd, projectName);
  // const projectDir = await initTemplate.init(userConfig);
  await initTemplate.init(userConfig);
  // 生成LICENSE文件;
  const license = getLicense(userConfig.license, {
    author: userConfig.author,
    year: new Date().getFullYear().toString(),
  });
  const licenseFilePath = path.resolve(projectDir, 'LICENSE');
  fse.ensureFileSync(licenseFilePath);
  fse.writeFileSync(licenseFilePath, license, 'utf-8');

  const pkgObject = require(path.join(projectDir, './package.json'));
  const configPkg = [];
  // git初始化
  await gitInit.init(projectDir);

  if (userConfig.prettier) {
    const prettierModule = await dynamicRequire.require(
      '@mxy-cli/prettier-init',
    );
    // prettier初始化
    const prettierPkg = prettierModule.init(userConfig, projectDir);
    configPkg.push(prettierPkg);
  }

  if (userConfig.eslint) {
    const eslintModule = await dynamicRequire.require('@mxy-cli/eslint-init');
    // eslint初始化
    const eslintPkg = eslintModule.init(userConfig, projectDir);
    configPkg.push(eslintPkg);
  }

  if (userConfig.commitizen) {
    const commitizenModule = await dynamicRequire.require(
      '@mxy-cli/commitizen-init',
    );
    // commitizen初始化
    const commitizenPkg = commitizenModule.init(userConfig);
    configPkg.push(commitizenPkg);
  }

  if (userConfig.commitlint) {
    const commitlintModule = await dynamicRequire.require(
      '@mxy-cli/commitlint-init',
    );
    // commitlint初始化
    const commitlintPkg = commitlintModule.init(userConfig, projectDir);
    configPkg.push(commitlintPkg);
  }

  // 后进行Husky初始化，commitlint依赖husky的git hook来执行
  if (userConfig.husky) {
    // husky初始化
    try {
      const huskyModule = await dynamicRequire.require('@mxy-cli/husky-init');
      const huskyPkg = await huskyModule.init(userConfig, projectDir);
      configPkg.push(huskyPkg);
    } catch (e) {
      npmLog.error('husky', e);
      process.exit(1);
    }
  }

  // const npmHookPkg = npmHookModule.init(userConfig, projectDir);
  // configPkg.push(npmHookPkg);

  const lastPkg = mergePkg(pkgObject, ...configPkg);

  // 将合并后的package.json写入
  fse.writeFileSync(
    path.join(projectDir, './package.json'),
    JSON.stringify(lastPkg, null, 2),
  );

  await installDeps(projectDir);

  // 删除已下载的初始化工具包
  fse.removeSync(path.resolve(projectDir, '.packages'));

  npmLog.success(`创建${userConfig.projectName}完成!`);
}

module.exports = {
  create,
};
