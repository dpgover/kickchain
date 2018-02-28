import React, { Component } from 'react';
import Layout from '../components/layout/Layout';
import CampaignList from '../components/CampaignList';
import { campaignsData } from '../ethereum/campaignData';

class Index extends Component {
  static async getInitialProps() {
    const campaigns = await campaignsData(6);
    return { campaigns };
  }

  render() {
    return (
      <Layout>
        <div>
          <h2>New Campaigns</h2>
          <CampaignList campaigns={this.props.campaigns} />
        </div>
      </Layout>
    );
  }
}

export default Index;
