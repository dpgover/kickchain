const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);
fs.ensureDirSync(buildPath);

const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const campaignFactoryPath = path.resolve(__dirname, 'contracts', 'CampaignFactory.sol');

const compiled = solc.compile(
  {
    sources: {
	    'Campaign.sol': fs.readFileSync(campaignPath, 'utf8'),
	    'CampaignFactory.sol': fs.readFileSync(campaignFactoryPath, 'utf8'),
    }
  },
  1
).contracts;

for (let contract in compiled) {
  fs.outputJsonSync(
    path.resolve(buildPath, `${contract.split(':')[1]}.json`),
    compiled[contract]
  );
}
