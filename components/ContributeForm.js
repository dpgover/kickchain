import React, { Component } from 'react';
import { Button, Form, Icon, Input, Message } from 'semantic-ui-react';
import campaignRetriever from "../ethereum/campaign";
import { Router } from "../routes/routes";
import web3 from "../ethereum/web3";

class ContributeForm extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      loading: false,
      campaign: props.address,
      minimum: props.minimum,
      contribution: '',
      onSuccess: props.onSuccess,
      error: {
        hasError: false,
        message: '',
      },
    };
  }

  contribute = async (e) => {
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
      const contribution = web3.utils.toWei(this.state.contribution, 'ether');

      if (web3.utils.toBN(contribution).lt(web3.utils.toBN(this.state.minimum))) {
        this.setState({
          loading: false,
          error: {
            hasError: true,
            message: `Minimum contribution is ${web3.utils.fromWei(this.state.minimum, 'ether')}`,
          }
        });

        return;
      }

      const campaign = await campaignRetriever(this.state.campaign);

      await campaign.methods
        .contribute()
        .send({
          from: accounts[0],
          value: contribution
        });

      this.state.onSuccess();

      this.setState({
        contribution: '',
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
      <Form error={this.state.error.hasError} onSubmit={this.contribute}>
        <Message
          error
          header="There was an error processing the transaction"
          content={this.state.error.message}
        />
        <Form.Field>
          <label>Contribution (Min: {web3.utils.fromWei(this.state.minimum, 'ether')} ETH)</label>
          <Input
            label="ETH"
            value={this.state.contribution}
            onChange={e => this.setState({ contribution: e.target.value })}
            required
          />
        </Form.Field>
        <Button primary floated={"right"} loading={this.state.loading} disabled={this.state.loading} type="submit">
          <Icon name="money" /> Contribute
        </Button>
      </Form>
    );
  }
}

export default ContributeForm;
