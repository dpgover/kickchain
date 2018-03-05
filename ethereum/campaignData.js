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

export const campaignRequests = async (address) => {
  const requests = [];

  const campaign = await campaignContracts(address);

  const openRequests = await campaign.methods.openRequestsCount().call();

  for(let i = 0; i < openRequests; i++) {
    const request = await campaign.methods.requests(i).call();
    requests.push({
      id: i,
      description: request.description,
      payment: request.payment,
      supplier: request.supplier,
      approvalCount: request.approvalCount,
      complete: request.complete,
    });
  }

  return requests;
};
