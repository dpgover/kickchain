import web3, { provider } from './web3';
import compiledFactory from './build/CampaignFactory';

const instance = new web3.eth.Contract(JSON.parse(compiledFactory.interface), '0xFB4A87D7ceEB747fac402CaEDAe52961bb140406');
instance.setProvider(provider);

export default instance;
