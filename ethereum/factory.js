import web3, { provider } from './web3';
import compiledFactory from './build/CampaignFactory';

const instance = new web3.eth.Contract(JSON.parse(compiledFactory.interface), '0x0f6B411381a7d1A5ecF274AcBfd9caCE7715ECa3');
instance.setProvider(provider);

export default instance;
