import React, { Component } from 'react';
import { Button, Form, Header, Icon, Input, Message } from 'semantic-ui-react';
import campaignRetriever from "../ethereum/campaign";
import { Router } from "../routes/routes";
import web3 from "../ethereum/web3";

class CreateRequestForm extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      loading: false,
      campaign: props.address,
      description: '',
      value: '',
      supplier: '',
      onSuccess: props.onSuccess,
      error: {
        hasError: false,
        message: '',
      },
    };
  }

  createRequest = async (e) => {
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
      const campaign = await campaignRetriever(this.state.campaign);

      await campaign.methods
        .createRequest(
          this.state.description,
          web3.utils.toWei(this.state.value, 'ether'),
          this.state.supplier,
        )
        .send({
          from: accounts[0]
        });

      this.state.onSuccess();

      this.setState({
        description: '',
        value: '',
        supplier: '',
        loading: false,
        error: {
          hasError: false,
          message: '',
        }
      });

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
      <div>
        <Header as="h4">New Request</Header>
        <Form error={this.state.error.hasError} onSubmit={this.createRequest}>
          <Message
            error
            header="There was an error processing the transaction"
            content={this.state.error.message}
          />
          <Form.Field>
            <label>Description</label>
            <Input
              value={this.state.description}
              onChange={e => this.setState({ description: e.target.value })}
              required
            />
          </Form.Field>
          <Form.Field>
            <label>Value</label>
            <Input
              label="ETH"
              value={this.state.value}
              onChange={e => this.setState({ value: e.target.value })}
              required
            />
          </Form.Field>
          <Form.Field>
            <label>Supplier</label>
            <Input
              value={this.state.supplier}
              onChange={e => this.setState({ supplier: e.target.value })}
              required
            />
          </Form.Field>
          <Button primary floated={"right"} loading={this.state.loading} disabled={this.state.loading} type="submit">
            <Icon name="shop" /> Create Request
          </Button>
        </Form>
      </div>
    );
  }
}

export default CreateRequestForm;
