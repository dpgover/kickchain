import React, { Component } from 'react';
import { Card, Container, Divider, Grid, Header} from 'semantic-ui-react';
import Layout from '../../components/layout/Layout';
import { campaignData } from '../../ethereum/campaignData';
import CampaignCard from '../../components/CampaignCard';
import web3 from '../../ethereum/web3';
import ContributeForm from "../../components/ContributeForm";

class CampaignsShow extends Component {
  static async getInitialProps(props) {
    const campaign = await campaignData(props.query.address);
    return { campaign };
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      campaign: props.campaign,
    };
  }

  reloadCampaign = async () => {
    const campaign = await campaignData(this.state.campaign.address);

    this.setState({
      campaign: campaign,
    });
  };

  render() {
    return (
      <Layout>
        <Container fluid>
          <Header as="h1">{this.state.campaign.name}</Header>
          <p>{this.state.campaign.description}</p>
        </Container>
        <Divider section />
        <Grid padded={'vertically'}>
          <Grid.Column width={12}>
            <Card.Group stackable itemsPerRow={3}>
              <CampaignCard
                label={'Address'}
                value={this.state.campaign.address}
                color="green"
                size="mini"
              />
              <CampaignCard
                label={'Manager'}
                value={this.state.campaign.manager}
                color="teal"
                size="mini"
              />
              <CampaignCard
                label={'ETH Minimum Contribution'}
                value={web3.utils.fromWei(this.state.campaign.minimum, 'ether')}
                color="blue"
                size="large"
              />
              <CampaignCard
                label={'Contributors'}
                value={this.state.campaign.contributors}
                color="violet"
                size="large"
              />
              <CampaignCard
                label={'ETH Funds'}
                value={web3.utils.fromWei(this.state.campaign.funds, 'ether')}
                color="purple"
                size="large"
              />
              <CampaignCard
                label={'Open Requests'}
                value={this.state.campaign.openRequests}
                color="pink"
                size="large"
              />
            </Card.Group>
          </Grid.Column>
          <Grid.Column width={4}>
            <ContributeForm address={this.state.campaign.address} minimum={this.state.campaign.minimum} onSuccess={this.reloadCampaign} />
          </Grid.Column>
        </Grid>
      </Layout>
    );
  }
}

export default CampaignsShow;
