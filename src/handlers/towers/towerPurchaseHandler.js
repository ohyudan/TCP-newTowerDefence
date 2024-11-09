import { PacketType } from '../../constants/header.js';
import { hostSocketWrite, oppoSocketWrite } from '../../utils/socket/socketUtils.js';
import { addTower, towerPurchaseCalculator } from '../../utils/towers/towerUtils.js';

export const towerPurchaseHandler = async ({ socket, payload }) => {
  try {
    // 타워를 구입했을 때 생성된 타워의 데이터를 담는 객체
    const towerData = await addTower(socket, payload);
    // towerId를 다시 클라이언트로 보내줘야 함

    await towerPurchaseCalculator(socket);

    const hostPacket = {
      towerPurchaseResponse: { towerId: towerData.towerId },
    };
    const oppoPacket = {
      addEnemyTowerNotification: { towerId: towerData.towerId, x: towerData.x, y: towerData.y },
    };

    await hostSocketWrite(socket, PacketType.TOWER_PURCHASE_RESPONSE, hostPacket);
    await oppoSocketWrite(socket, PacketType.ADD_ENEMY_TOWER_NOTIFICATION, oppoPacket);
  } catch (error) {
    console.error(`타워 구입 정보 처리 중 에러 발생: ${error}`);
  }
};
