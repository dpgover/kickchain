pragma solidity ^0.4.19;

import "./Campaign.sol";

contract CampaignFactory {
    address[] public campaigns;

    function createCampaign(uint minimum) public {
        address campaign = new Campaign(minimum, msg.sender);
        campaigns.push(campaign);
    }

    function listCampaigns() public view returns(address[]) {
        return campaigns;
    }
}
