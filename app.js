"use strict";

const fs = require("fs");

const readline = require("readline");

const readStream = fs.createReadStream("./popu-pref.csv");

const readlineInterface = readline.createInterface({
  input: readStream,
  output: {},
});

///key: 都道府県 value: 集計データのオブジェクト
const prefectureDataMap = new Map();

readlineInterface.on("line", (lineStr) => {
  const columns = lineStr.split(",").map((e) => {
    return isNaN(e) ? e : parseInt(e);
  });
  const [year, prefecture, popu] = columns;

  if (!(year === 2010 || year === 2015)) {
    return;
  }

  let value = prefectureDataMap.get(prefecture);

  if (!value) {
    value = {
      popu10: 0,
      popu15: 0,
      change: null,
    };
  }

  switch (year) {
    case 2010:
      value.popu10 = popu;
      break;
    case 2015:
      value.popu15 = popu;
      break;
  }

  prefectureDataMap.set(prefecture, value);
});

readlineInterface.on("close", () => {
  for (const [_, value] of prefectureDataMap) {
    value.change = value.popu15 / value.popu10;
  }

  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
    return pair2[1].change - pair1[1].change;
  });

  const rankingStrArray = rankingArray.map(([key, value]) => {
    return `${key}: ${value.popu10}=>${value.popu15} 変化率: ${value.change}`;
  });

  console.log(rankingStrArray);
});
