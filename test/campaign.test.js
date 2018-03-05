const assert = require('assert');
const Web3 = require('web3');
const compiledFactory = require('../ethereum/build/CampaignFactory');
const compiledCampaign = require('../ethereum/build/Campaign');

const provider = new Web3.providers.HttpProvider('http://ganache:8545');
const web3 = new Web3(provider);

let accounts;
let factory;
let campaign;
let campaignAddress;
const minimum = '100';

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({
      data: compiledFactory.bytecode,
    })
    .send({
      from: accounts[0],
      gas: '5000000',
    });

  factory.setProvider(provider);

  await factory.methods.createCampaign('Name', 'Description', minimum).send({
    from: accounts[0],
    gas: '5000000',
  });

  [campaignAddress] = await factory.methods.listCampaigns().call();
  campaign = await new web3.eth.Contract(JSON.parse(compiledCampaign.interface), campaignAddress);
});

describe('Campaigns', () => {
  it('Should have deployed the Factory and a Campaign', () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it('Campaign creator should be the manager', async () => {
    const manager = await campaign.methods.manager().call();
    assert.equal(manager, accounts[0], `Manager should be "${accounts[0]}"`);
  });

  it('Should allow people to contribute and mark them as contributor', async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: (minimum * 2).toString(),
      gas: '5000000',
    });

    const isContributor = await campaign.methods.contributors(accounts[1]).call();

    assert(isContributor);
  });

  it('Should not allow people to contribute for less than the minimum', async () => {
    try {
      await campaign.methods.contribute().send({
        from: accounts[1],
        value: (minimum - 1).toString(),
        gas: '5000000',
      });

      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('Should allow the manager to create a request', async () => {
    const description = 'description';
    const payment = '1000';
    const supplier = accounts[2];

    await campaign.methods.createRequest(description, payment, supplier).send({
      from: accounts[0],
      gas: '5000000',
    });

    const request = await campaign.methods.requests(0).call();

    assert.equal(request.description, description, `Request Description should be ${description}`);
    assert.equal(request.payment, payment, `Request Payment should be ${payment}`);
    assert.equal(request.supplier, supplier, `Request Supplier should be ${supplier}`);
    assert.equal(request.complete, false, 'Request Complete should be FALSE');
    assert.equal(request.approvalCount, 0, 'Request Approval Count should be 0');
  });

  it('Should allow ONLY the manager to create a request', async () => {
    try {
      await campaign.methods.createRequest('description', '1000', accounts[2]).send({
        from: accounts[1],
        gas: '5000000',
      });

      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('Should allow to vote on a request', async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '200',
      gas: '5000000',
    });

    const payment = web3.utils.toWei('200', 'ether');
    const supplier = accounts[2];

    await campaign.methods.createRequest('Batteries!', payment, supplier).send({
      from: accounts[0],
      gas: '5000000',
    });

    await campaign.methods.approveRequest(0).send({
      from: accounts[1],
      gas: '5000000',
    });

    const request = await campaign.methods.requests(0).call();

    assert.equal(request.complete, false, 'Request Complete should be FALSE');
    assert.equal(request.approvalCount, 1, 'Request ApprovalCount should be 1');
  });

  it('Should only allow contributors to vote', async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '200',
      gas: '5000000',
    });

    const payment = web3.utils.toWei('200', 'ether');
    const supplier = accounts[2];

    await campaign.methods.createRequest('Batteries!', payment, supplier).send({
      from: accounts[0],
      gas: '5000000',
    });

    try {
      await campaign.methods.approveRequest(0).send({
        from: accounts[2],
        gas: '5000000',
      });

      assert(false);
    } catch (err) {
      assert.ok(err);
    }
  });

  it('Should allow only one vote per contributor', async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '200',
      gas: '5000000',
    });

    const payment = web3.utils.toWei('200', 'ether');
    const supplier = accounts[2];

    await campaign.methods.createRequest('Batteries!', payment, supplier).send({
      from: accounts[0],
      gas: '5000000',
    });

    await campaign.methods.approveRequest(0).send({
      from: accounts[1],
      gas: '5000000',
    });

    try {
      await campaign.methods.approveRequest(0).send({
        from: accounts[1],
        gas: '5000000',
      });

      assert(false);
    } catch (err) {
      assert(err);

      const request = await campaign.methods.requests(0).call();

      assert.equal(request.complete, false, 'Request Complete should be FALSE');
      assert.equal(request.approvalCount, 1, 'Request ApprovalCount should be 1');
    }
  });

  it('Should process a request', async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: web3.utils.toWei('10', 'ether'),
      gas: '5000000',
    });

    const payment = web3.utils.toWei('5', 'ether');
    const supplier = accounts[2];

    let preBalance = await web3.eth.getBalance(supplier);
    preBalance = web3.utils.fromWei(preBalance, 'ether');
    preBalance = parseFloat(preBalance);

    await campaign.methods.createRequest('Batteries!', payment, supplier).send({
      from: accounts[0],
      gas: '5000000',
    });

    await campaign.methods.approveRequest(0).send({
      from: accounts[1],
      gas: '5000000',
    });

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: '5000000',
    });

    let postBalance = await web3.eth.getBalance(supplier);
    postBalance = web3.utils.fromWei(postBalance, 'ether');
    postBalance = parseFloat(postBalance);

    assert(preBalance < postBalance);

    const request = await campaign.methods.requests(0).call();

    assert.equal(request.complete, true, 'Request Complete should be TRUE');
  });

  it('Should not allow to vote on a completed request', async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '200',
      gas: '5000000',
    });

    await campaign.methods.contribute().send({
      from: accounts[2],
      value: '200',
      gas: '5000000',
    });

    await campaign.methods.contribute().send({
      from: accounts[0],
      value: '200',
      gas: '5000000',
    });

    const payment = '100';
    const supplier = accounts[2];

    await campaign.methods.createRequest('Batteries!', payment, supplier).send({
      from: accounts[0],
      gas: '5000000',
    });

    await campaign.methods.approveRequest(0).send({
      from: accounts[1],
      gas: '5000000',
    });

    await campaign.methods.approveRequest(0).send({
      from: accounts[0],
      gas: '5000000',
    });

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: '5000000',
    });

    try {
      await campaign.methods.approveRequest(0).send({
        from: accounts[2],
        gas: '5000000',
      });

      assert(false);
    } catch (err) {
      assert (err);

      const request = await campaign.methods.requests(0).call();

      assert.equal(request.complete, true, 'Request Complete should be TRUE');
      assert.equal(request.approvalCount, 2, 'Request ApprovalCount should be 2');
    }
  });

  it('Should not allow to finalize a completed request', async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '200',
      gas: '5000000',
    });

    const payment = '200';
    const supplier = accounts[2];

    await campaign.methods.createRequest('Batteries!', payment, supplier).send({
      from: accounts[0],
      gas: '5000000',
    });

    await campaign.methods.approveRequest(0).send({
      from: accounts[1],
      gas: '5000000',
    });

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: '5000000',
    });

    try {
      await campaign.methods.finalizeRequest(0).send({
        from: accounts[0],
        gas: '5000000',
      });

      assert(false);
    } catch (err) {
      assert (err);
    }
  });

  it('Should only allow the owner to finalize the request', async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '200',
      gas: '5000000',
    });

    const payment = '200';
    const supplier = accounts[2];

    await campaign.methods.createRequest('Batteries!', payment, supplier).send({
      from: accounts[0],
      gas: '5000000',
    });

    await campaign.methods.approveRequest(0).send({
      from: accounts[1],
      gas: '5000000',
    });

    try {
      await campaign.methods.finalizeRequest(0).send({
        from: accounts[1],
        gas: '5000000',
      });

      assert(false);
    } catch (err) {
      assert (err);

      const request = await campaign.methods.requests(0).call();

      assert.equal(request.complete, false, 'Request Complete should be FALSE');
    }
  });

  it('Should not allow to finalize the request if there is not enough money', async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '200',
      gas: '5000000',
    });

    const payment = '500';
    const supplier = accounts[2];

    await campaign.methods.createRequest('Batteries!', payment, supplier).send({
      from: accounts[0],
      gas: '5000000',
    });

    await campaign.methods.approveRequest(0).send({
      from: accounts[1],
      gas: '5000000',
    });

    try {
      await campaign.methods.finalizeRequest(0).send({
        from: accounts[1],
        gas: '5000000',
      });

      assert(false);
    } catch (err) {
      assert (err);

      const request = await campaign.methods.requests(0).call();

      assert.equal(request.complete, false, 'Request Complete should be FALSE');
    }
  });

  it('Should not allow to finalize the request if there are not enough votes', async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '200',
      gas: '5000000',
    });

    await campaign.methods.contribute().send({
      from: accounts[2],
      value: '200',
      gas: '5000000',
    });

    await campaign.methods.contribute().send({
      from: accounts[0],
      value: '200',
      gas: '5000000',
    });

    const payment = '500';
    const supplier = accounts[2];

    await campaign.methods.createRequest('Batteries!', payment, supplier).send({
      from: accounts[0],
      gas: '5000000',
    });

    await campaign.methods.approveRequest(0).send({
      from: accounts[1],
      gas: '5000000',
    });

    try {
      await campaign.methods.finalizeRequest(0).send({
        from: accounts[1],
        gas: '5000000',
      });

      assert(false);
    } catch (err) {
      assert (err);

      const request = await campaign.methods.requests(0).call();

      assert.equal(request.complete, false, 'Request Complete should be FALSE');
    }
  });
});
