#! /usr/bin/env node
var fs = require("fs");
var path = require("path");
const program = require("commander");
const package = require("./package.json");
const currentPath = process.cwd();

var fileArr = []; // 存储目标文件路径


program.version(package.version);

program.command("-p <path>").description("absolute path");

program.option('-p, --path <path>','add dir absolute path');

/**
 * 递归目录及下面的文件，找出目标文件
 * @param {String} dir 文件夹路径
 */
function readDir(dir) {
  var exist = fs.existsSync(dir);
  if (!exist) {
    console.error("目录路径不存在");
    return;
  }
  var excludeDir = /^(\.|node_modules)/;
  var pa = fs.readdirSync(dir);

  for (let index = 0; index < pa.length; index++) {
    let file = pa[index];
    var pathName = path.join(dir, file);
    var info = fs.statSync(pathName);
    if (info.isDirectory() && !excludeDir.test(file)) {
      readDir(pathName);
    } else {
      if (path.extname(file) === ".json") {
        fileArr.push(pathName);
      }
    }
  }
}

/**
 * 合并文件
 * @param {Array} arr 包含了所有 JSON 文件的路径
 * @returns {String} 返回合并后 JSON 字符串
 */
function combineFile(arr) {
  var obj = {};
  arr.length &&
    arr.forEach(ele => {
      var str = deleDom(ele);
      var contentObj = JSON.parse(str);
      Object.assign(obj, contentObj);
    });
  return JSON.stringify(obj);
}

/**
 * 删除 dom 符号，防止异常
 * @param {String} filePath 文件路径
 */
function deleDom(filePath) {
  var bin = fs.readFileSync(filePath);
  if (bin[0] === 0xef && bin[1] === 0xbb && bin[2] === 0xbf) {
    bin = bin.slice(3);
  }

  return bin.toString("utf-8");
}

program.parse(process.argv);

// console.info("program.args", program.args);
// 这个是放在 parse 之后值是 [], 放之前是 undefined
// if (!program.args.length) {
//   program.help();
// }

const findPath = program.path ? program.path : currentPath;

readDir(findPath);
var jsonStr = combineFile(fileArr);
fs.writeFile("./data.json", jsonStr, function(err) {
  if (err) {
    console.error("文件写入失败");
  } else {
    console.info("文件写入成功，路径为：", findPath);
  }
});

