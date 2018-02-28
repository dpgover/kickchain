import factory from "./factory";
import campaignContracts from "./campaign";
import web3 from "./web3";

export const campaignsData = async (max) => {
  const campaigns = [];

  let campaignsAddress = await factory.methods.listCampaigns().call();

  campaignsAddress = campaignsAddress.reverse();
  if(max !== undefined) {
    campaignsAddress = campaignsAddress.slice(0, max);
  }

  for (let key in campaignsAddress) {
    campaigns.push(await campaignData(campaignsAddress[key]));
  }

  return campaigns;
};

export const campaignData = async (address) => {

    const campaign = await campaignContracts(address);

    const campaignData = await campaign.methods.getCampaignData().call();
    const funds = await web3.eth.getBalance(campaign.options.address);

    const [manager, minimum, name, description, contributors, openRequests] = Object.values(campaignData);

    return {
      name,
      description,
      address,
      minimum,
      manager,
      contributors,
      openRequests,
      funds,
    };
};
