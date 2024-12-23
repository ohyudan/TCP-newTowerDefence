import { UserFields } from '../../constants/constant.js';
import CustomError from '../error/customError.js';
import { ErrorCodes } from '../error/errorCodes.js';
import { redis } from '../redis/redis.js';

/**
 * 요청한 아이디로 베이스 체력을 가져오는 함수
 * @param {*} userId
 * @returns {number}
 */
export const getBaseHp = async (userId) => {
  const baseHp = await redis.getUserField(userId, UserFields.BASE_HP);

  return baseHp;
};

/**
 * 요청한 아이디로 baseHp가 존재유무 확인, 베이스 체력을 업데이트 하는 함수
 * @param {*} damage
 * @param {*} userId
 * @returns {number}
 */
export const baseHpVerify = async (damage, userId) => {
  try {
    let baseHp = await getBaseHp(userId);

    baseHp -= damage;

    // 유저 정보 업데이트 해주기
    await redis.updateUserField(userId, UserFields.BASE_HP, baseHp);

    return baseHp;
  } catch (error) {
    throw new CustomError(ErrorCodes.GAME_STATE_UPDATE_ERROR, `기지 체력 업데이트 중 에러 발생`);
  }
};
