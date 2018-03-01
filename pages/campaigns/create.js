import React, { Component } from 'react';
import { Button, Form, Icon, Input, Message } from 'semantic-ui-react'
import Layout from '../../components/layout/Layout';
import { Router } from '../../routes/routes';
import factory from '../../ethereum/factory';
import web3 from '../../ethereum/web3';

class CampaignsCreate extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      loading: false,
      name: '',
      description: '',
      minimumContribution: '',
      error: {
        hasError: false,
        message: '',
      },
    };
  }

  createCampaign = async (e) => {
    e.preventDefault();

    this.setState({
      loading: true,
      error: {
        hasError: false,
        message: '',
      }
    });

    const accounts = await web3.eth.getAccounts();

    try {
      await factory.methods
        .createCampaign(
          this.state.name,
          this.state.description,
          web3.utils.toWei(this.state.minimumContribution, 'ether')
        )
        .send({
          from: accounts[0]
        });

      Router.pushRoute('/');

    } catch (err) {
      this.setState({
        loading: false,
        error: {
          hasError: true,
          message: err.message,
        }
      });
    }
  };

  render() {
    return (
      <Layout>
        <h2>New Campaign</h2>
        <Form error={this.state.error.hasError} onSubmit={this.createCampaign}>
          <Message
            error
            header="There was an error processing the transaction"
            content={this.state.error.message}
          />
          <Form.Field>
            <label>Name</label>
            <Input
              placeholder="My biggest idea yet!"
              value={this.state.name}
              onChange={e => this.setState({ name: e.target.value })}
            />
          </Form.Field>
          <Form.Field>
            <label>Description</label>
            <Input
              placeholder="Tell us what you want to do..."
              value={this.state.description}
              onChange={e => this.setState({ description: e.target.value })}
              required
            />
          </Form.Field>
          <Form.Field>
            <label>Minimum Contribution</label>
            <Input
              label="ETH"
              placeholder="0.01"
              value={this.state.minimumContribution}
              onChange={e => this.setState({ minimumContribution: e.target.value })}
              required
            />
          </Form.Field>
          <Button primary floated={"right"} loading={this.state.loading} disabled={this.state.loading} type="submit">
            <Icon name="add" /> Create Campaign
          </Button>
        </Form>
      </Layout>
    );
  }
}

export default CampaignsCreate;
