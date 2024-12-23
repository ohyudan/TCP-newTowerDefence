import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CustomError from '../utils/error/customError.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, '../../assets/');

/**
 * 현재 파일을 읽어오는 함수
 * @param {filename}
 */
const readFileAsync = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(basePath, filename), 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
};

/**
 * 게임 에셋(json 파일)을 gameAssets에 등록하는 함수
 * @returns {Object}
 */
export const loadGameAssets = async () => {
  try {
    const [gameState, monsterLevel] = await Promise.all([
      readFileAsync('gameState.json'),
      readFileAsync('monsterLevel.json'),
    ]);

    gameAssets = { gameState, monsterLevel };
    return gameAssets;
  } catch (error) {
    throw new CustomError(ErrorCodes.ASSETS_LOADING_FAIL, 'assets 파일 로드에 실패했습니다.');
  }
};

let gameAssets = {};

/**
 * 게임 에셋을 가져오는 함수
 * @returns {Object}
 */
export const getGameAssets = () => {
  return gameAssets;
};
