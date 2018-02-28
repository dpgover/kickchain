import React, { Component } from 'react';
import Layout from '../../components/layout/Layout';
import CampaignList from '../../components/CampaignList';
import { campaignsData } from '../../ethereum/campaignData';

class CampaignsIndex extends Component {
  static async getInitialProps() {
    const campaigns = await campaignsData();
    return { campaigns };
  }

  render() {
    return (
      <Layout>
        <div>
          <h2>Running Campaigns</h2>
          <CampaignList campaigns={this.props.campaigns} />
        </div>
      </Layout>
    );
  }
}

export default CampaignsIndex;
