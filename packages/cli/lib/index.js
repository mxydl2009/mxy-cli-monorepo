const pkg = require('../package.json');
const { create } = require('@mxy-cli/core');
const npmLog = require('npmlog');
const { program } = require('commander');
console.log(require.resolve('./checkBase.js'));
const checkBase = require('./checkBase');

npmLog.addLevel('success', 2000, { fg: 'green', bold: true }); // 添加自定义日志等级

// 注册命令
program
  .name('mxy')
  .description('a command line tool for create project')
  .version(pkg.version);

program
  .command('create')
  .description('创建JavaScript库')
  .action(async () => {
    try {
      // 检查基础环境和当前cli的版本
      await checkBase();
      await create();
    } catch (err) {
      npmLog.error(`创建失败，原因: ${err.message}`);
      process.exit(1);
    }
  });

// 解析命令行参数，一定要在所有命令注册后，再调用
program.parse(process.argv);
