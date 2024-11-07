import { PacketType } from '../../constants/header.js';
import { connectedSockets } from '../../events/onConnection.js';
import { monsterDeath } from '../../utils/monster/monsterUtils.js';
import { redis } from '../../utils/redis/redis.js';
import { createResponse } from '../../utils/response/createResponse.js';

export const monsterDeathHandler = async ({ socket, payload }) => {
  try {
    const fieldName = Object.keys(payload)[0];

    const { monsterId } = payload[fieldName];

    await monsterDeath(socket, monsterId);

    const S2CMonsterDeathNotification = {
      monsterId: monsterId,
    };
    const gamePacket = {
      monsterDeathNotification: S2CMonsterDeathNotification,
    };

    // 모든 유저 정보 가져옴
    const users = await redis.getUsers(socket.gameId);

    // 유저 정보중에 socket.id랑 같지 않은 => 다른 유저의 소켓을 찾음
    const socketId = users.find((user) => {
      return user !== socket.id;
    });

    // 찾은 socketId로 connectedSockets에 조회하여 찾음
    const enemySocket = connectedSockets.get(socketId);

    enemySocket.write(createResponse(PacketType.MONSTER_DEATH_NOTIFICATION, 0, gamePacket));
    // 여기 어떤 값을 적어야 하는지 잘 모르겠음
  } catch (error) {
    throw new Error('몬스터 Death 처리 중 에러 발생', error);
  }
};
