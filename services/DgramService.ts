import dgram from 'node:dgram';

export default dgram.createSocket('udp4');
