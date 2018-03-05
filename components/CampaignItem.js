import React, { Component } from 'react';
import { Button, Card, Icon } from 'semantic-ui-react';
import { Router } from '../routes/routes';
import web3 from '../ethereum/web3';

class CampaignItem extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      campaign: props.campaign,
    }
  }

  seeMore = () => {
    Router.pushRoute(`/campaigns/${this.state.campaign.address}`);
  };

  render() {
    return (
      <Card fluid>
        <Card.Content>
          <Card.Header>
            {this.state.campaign.name}
          </Card.Header>
          <Card.Meta style={{overflowWrap: 'break-word'}}>
            {this.state.campaign.address}
          </Card.Meta>
          <Card.Description style={{overflowWrap: 'break-word'}}>
            {this.state.campaign.description}
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <Icon name="user" /> {this.state.campaign.contributors} Contributors<br/>
          <Icon name="money" /> {web3.utils.fromWei(this.state.campaign.funds, 'ether')} ETH Funds<br/>
          <Icon name="tasks" /> {this.state.campaign.openRequests} Open Requests
        </Card.Content>
        <Card.Content extra textAlign="right">
          <div className="ui buttons">
            <Button basic color="blue" onClick={this.seeMore}>See More</Button>
          </div>
        </Card.Content>
      </Card>
    );
  }
}

export default CampaignItem;
