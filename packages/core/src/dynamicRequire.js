const npmLog = require('npmlog');
const path = require('path');
const npminstall = require('npminstall');
const fse = require('fs-extra');

const NODE_ENV = process.env.NODE_ENV;

// 安装pkgName到targetDir + node_modules目录下，如果pkgName是有命名空间的包，则命名空间也是一层目录
async function installPkg(pkgName, targetDir) {
  await npminstall({
    root: process.cwd(),
    pkgs: [
      {
        name: pkgName,
        version: 'latest',
      },
    ],
    targetDir,
  });
}
/**
 * 根据包名和安装目录，返回包的实际安装目录; 针对以下两种情况做了处理
 * 1. 包如果有命名空间, 则命名空间会多加一层路径;
 * 2. 还需要对得到的包路径判断是否是软连接;
 * @param {*} pkgName 包名，需要针对是否有命名空间进行进一步处理
 * @param {*} dir 安装包的目录
 */
function resolvePkgDir(pkgName, installedDir) {
  let pkgDir = path.resolve(installedDir, 'node_modules', pkgName);
  const nameSpace = pkgName.startsWith('@')
    ? pkgName.slice(0, pkgName.indexOf('/'))
    : '';
  // 需要确保模板内容的目录非符号连接
  const stats = fse.lstatSync(pkgDir);
  const isSymbolLink = stats.isSymbolicLink();
  if (isSymbolLink) {
    const realPath = fse.readlinkSync(pkgDir);
    pkgDir = path.resolve(pkgDir, `${nameSpace !== '' ? '..' : '.'}`, realPath);
  }
  return pkgDir;
}

/**
 *
 * @param {*} pkgName 包名
 * @param {*} installTargetDir 安装目录, 默认.packages
 * @returns
 */
async function dynamicRequire(pkgName, installTargetDir = '.packages') {
  try {
    await installPkg(pkgName, installTargetDir);
    const pkgDir = resolvePkgDir(pkgName, installTargetDir);
    const pkgJSON = require(path.resolve(pkgDir, './package.json'));
    const entryFile = pkgJSON.main;
    if (entryFile) {
      const pkgModule = require(path.resolve(pkgDir, './', entryFile));
      return pkgModule;
    } else {
      npmLog.error(
        `require ${pkgName} failed because of ${pkgName} has no entry file.`,
      );
      process.exit(1);
    }
  } catch (err) {
    npmLog.error(`install ${pkgName} failed because of ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  require: dynamicRequire,
  installPkg,
};
