#! /usr/bin/env node
var fs = require("fs");
var path = require("path");

function delDir(path){
  let files = [];
  if(fs.existsSync(path)){
      files = fs.readdirSync(path);
      files.forEach((file, index) => {
          let curPath = path + "/" + file;
          if(fs.statSync(curPath).isDirectory()){
              delDir(curPath); //递归删除文件夹
          } else {
              fs.unlinkSync(curPath); //删除文件
          }
      });
      fs.rmdirSync(path);
  }
}

/**
 * 递归目录及下面的文件，找出目标文件
 * @param {String} dir 文件夹路径
 */
function readDir(dir) {
  var exist = fs.existsSync(dir);
  // 排除不需要遍历的文件夹或文件
  var excludeDir = /^(\.|node_module)/;
  if (!exist) {
    console.error("目录路径不存在");
    return;
  }
  var pa = fs.readdirSync(dir);

  for (let index = 0; index < pa.length; index++) {
    let file = pa[index];
    var pathName = path.join(dir, file);
    var info = fs.statSync(pathName);
    if (info.isDirectory() && !excludeDir.test(file)) {
      readDir(pathName);
    } else {
      let fileName = path.basename(file);
      let fileNameArr = fileName.split('.');
      let fileNameArrFirst = fileNameArr[0];
      if (/^[0-9]*$/.test(fileNameArrFirst) && path.extname(file) === ".md") {
        fileArr.push(pathName);
      }
    }
  }
}

function traverseFile(file) {
  // 同步创建目录，没有回调
  fs.mkdirSync('./bky', { recursive: true }, (err) => {});
  fs.mkdirSync('./jj', { recursive: true }, (err) => {});
  fs.mkdirSync('./sf', { recursive: true }, (err) => {});

  file.length &&
  file.forEach(ele => {
    dealFile(ele);
  });
}

function dealFile(filePath) {
  var fileName = path.basename(filePath);
  const fileNameArr = fileName.split('.');
  const articleLink = fileNameArr[2];

  const urlPrefix = 'https://xxholic.github.io/segment';
  const addText = '\r\n- [Origin][url-origin]\r\n- [My GitHub][url-my-github]\r\n\r\n';
  const addUrl = `\r\n\r\n[url-origin]:https://github.com/XXHolic/segment/issues/${articleLink}\r\n[url-my-github]:https://github.com/XXHolic`;
  const str = fs.readFileSync(filePath,{encoding:'utf-8'});
  let splitArr = [];
  let commonDealStr='';

  splitArr = str.split('##');
  // 判断是否有目录,在开始第一段插入 origin GitHub 显示文字
  const indexIndex = str.indexOf('name="index"');
  if (indexIndex > -1) {
    splitArr[2] = splitArr[2] + addText
  } else {
    splitArr[1] = splitArr[1] + addText
  }

  // 替换 .. 为实际地址
  commonDealStr = splitArr.join('##');
  commonDealStr = commonDealStr.replace(/\.\./g,urlPrefix);

  // 最末尾加上 URL
  commonDealStr = commonDealStr + addUrl;

  // 针对 博客园 的格式
  let bkyStr = commonDealStr;
  //去掉 emoji 符号 :wastebasket:  :arrow_up:
  const wastebasketIndex = commonDealStr.indexOf(':wastebasket:');
  const arrowUpIndex = commonDealStr.indexOf(':arrow_up:');
  // const hasArrowUp = commonDealStr.indexOf(':arrow_up:');

  if(arrowUpIndex>-1) {
    bkyStr = bkyStr.replace(/:arrow_up:/g,'');
  }

  if (wastebasketIndex>-1) {
    bkyStr = bkyStr.replace(/:wastebasket:/g,'');
    const detailsIndex = bkyStr.lastIndexOf('<details>');
    bkyStr = bkyStr.slice(0, detailsIndex);

    // 最末尾加上 URL
    bkyStr = bkyStr + addUrl;
  }

  // 针对 掘金 的格式
  let jjStr = commonDealStr;
  let jjStrArr = [];
  if (indexIndex>-1) {
    jjStrArr = jjStr.split('##');
    jjStrArr.splice(1,1);
  }

  jjStr = jjStrArr.join('##');

  if (wastebasketIndex>-1) {
    jjStr = jjStr.replace(/:wastebasket:/g,'');
  }

  if(arrowUpIndex>-1) {
    let replaceStr1 = '<div align="right"><a href="#index">Top :arrow_up:</a></div>';
    let replaceStr2 = '<div align="right"><a href="#index">Back to top :arrow_up:</a></div>';
    jjStr = jjStr.replace(new RegExp(replaceStr1,'g'),'');
    jjStr = jjStr.replace(new RegExp(replaceStr2,'g'),'');
  }


  // 针对 segmentFault CSDN 简书 格式
  let secondStr = jjStr;
  let secondStrArr = secondStr.split('##');
  let secondStrArrLen = secondStrArr.length;
  // 清除 title 上的 html 标签
  for (let index = 0; index < secondStrArrLen; index++) {
    let element = secondStrArr[index];
    const aEndIndex = element.indexOf('</a>');
    if (aEndIndex > -1) {
      const aStartIndex = element.indexOf('<a');
      let startPartStr = '';
      if (aStartIndex > -1) {
        startPartStr = element.slice(0, aStartIndex);
      }
      secondStrArr[index] = startPartStr + element.slice(aEndIndex+5)
    }
  }

  secondStr = secondStrArr.join('##');

  // 去除 details
  if (wastebasketIndex > -1) {
    const detailsIndex = secondStr.lastIndexOf('<details>');
    secondStr = secondStr.slice(0, detailsIndex);
    // 最末尾加上 URL
    secondStr = secondStr + addUrl;
  }





  fs.writeFile(`./bky/${fileName}`, bkyStr, dealError);
  fs.writeFile(`./jj/${fileName}`, jjStr, dealError);
  fs.writeFile(`./sf/${fileName}`, secondStr, dealError);
}

function dealError(err) {
  if (err) {
    console.error("文件写入失败");
  } else {
    console.info("文件写入成功");
  }
}


var currentPath = process.cwd(); // 获取当前执行路径
var fileArr = []; // 存储目标文件路径

delDir('./bky');
delDir('./jj');
delDir('./sf');
readDir(currentPath);
traverseFile(fileArr);
