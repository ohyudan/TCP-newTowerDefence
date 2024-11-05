import Config from '../config/config.js';
import { getPacketType } from '../handlers/index.js';
import { getProtoMessages } from '../init/loadProtos.js';
import { packetParser } from '../utils/parser/packetParser.js';
const onData = (socket) => async (data) => {
  // 버퍼를 조금씩 받는 것
  socket.buffer = Buffer.concat([socket.buffer, data]);

  const totalHeaderLength =
    Config.PACKETS.PACKET_TYPE_LENGTH + // 2
    Config.PACKETS.VERSION_LENGTH + // 1
    5 +
    Config.PACKETS.SEQUENCE_LENGTH + // 4
    Config.PACKETS.PAYLOAD_LENGTH;

  while (socket.buffer.length >= totalHeaderLength) {
    let offset = 0;

    const packetType = socket.buffer.readUInt16BE(offset); //2바이트
    offset += Config.PACKETS.PACKET_TYPE_LENGTH;

    const versionLength = socket.buffer.readUInt8(offset); //1바이트
    offset += +Config.PACKETS.VERSION_LENGTH;

    const version = socket.buffer.subarray(offset, offset + versionLength).toString('utf-8'); // 크기 가변적 '1.0.0'=5
    offset += versionLength;

    const sequence = socket.buffer.readUInt32BE(offset); //4바이트

    offset += Config.PACKETS.SEQUENCE_LENGTH;

    const payloadLength = socket.buffer.readUInt32BE(offset); //4바이트
    if (version !== Config.ClIENT.VERSION) {
      throw new Error(`버전이 일치하지 않습니다.`);
    }

    offset += Config.PACKETS.PAYLOAD_LENGTH;

    //if(sequence !== ) => 패킷 호출이 지금과 같지 않다면 에러 발생 처리
    //패킷의 순서 보장 싱글 스레드에서는 잘 일어나지 않으나 패킷이 1,3,2 순서로 올 경우 맞게 처리하는 용도
    //console.log(sequence);

    const requiredLength = offset + payloadLength;

    if (socket.buffer.length >= requiredLength) {
      const packet = socket.buffer.subarray(offset, requiredLength);
      socket.buffer = socket.buffer.subarray(requiredLength);

      // 0x0a (줄바꿈) , 0x0d (캐리지 리턴) 붙어서 +2 되어있음
      // 실제 페이로드는 헤더 + \n, \0 을 제외한 길이
      try {
        const payload = packetParser(packet);

        console.log(packetType, payload);
        const packetTypes = getPacketType(packetType);
        await packetTypes({ socket, payload });
      } catch (error) {
        throw new Error(`패킷 변환중 에러 발생`, error);
      }
    }
  }
};

export default onData;
