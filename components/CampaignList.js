import React, { Component } from 'react';
import { Card } from 'semantic-ui-react';
import CampaignItem from "./CampaignItem";

class CampaignList extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      campaigns: props.campaigns,
    }
  }

  render() {
    return (
      <Card.Group itemsPerRow={3} stackable>
        {this.state.campaigns.map((campaign, k) => {
          return <CampaignItem key={k} campaign={campaign} />;
        })}
      </Card.Group>
    );
  }
}

export default CampaignList;
