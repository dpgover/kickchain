import web3, { provider } from './web3';
import compiledCampaign from './build/Campaign';

export default async (address) => {
  const campaign = await new web3.eth.Contract(JSON.parse(compiledCampaign.interface), address);
  campaign.setProvider(provider);

  return campaign;
};
