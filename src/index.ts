import { NetworkController, PlayerInfoRio } from '@model/network/index.js';

const nc: NetworkController = new NetworkController();
const info: Promise<PlayerInfoRio> = nc.getPlayerInfo('Myrxia2');
info.then(_ => console.log('ok')).catch(r => console.log('not ok:',r));
