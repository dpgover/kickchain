import React, { Component } from 'react';
import { Button, Confirm, Icon, Popup } from 'semantic-ui-react';
import campaignRetriever from "../ethereum/campaign";
import web3 from "../ethereum/web3";

class FinalizeRequest extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      loading: false,
      showConfirmFinalize: false,
      campaign: props.address,
      request: props.request,
      onSuccess: props.onSuccess,
      onError: props.onError,
    };
  }

  showConfirmFinalize = () => {
    this.setState({showConfirmFinalize: true});
  };

  cancelFinalize = () => {
    this.setState({showConfirmFinalize: false});
  };

  finalizeRequest = async (e) => {
    e.preventDefault();

    this.setState({
      loading: true,
      showConfirmFinalize: false,
    });
    this.state.onError();

    const accounts = await web3.eth.getAccounts();

    try {
      const campaign = await campaignRetriever(this.state.campaign);

      await campaign.methods
        .finalizeRequest(this.state.request.id)
        .send({
          from: accounts[0]
        });

      this.state.onSuccess();

      this.setState({
        loading: false,
      });
      this.state.onError();

    } catch (err) {
      this.setState({
        loading: false,
      });
      this.state.onError(err);
    }
  };

  render() {
    return (
      <div>
        <Popup
          trigger={
            <Button icon loading={this.state.loading} onClick={this.showConfirmFinalize}>
              <Icon name="flag checkered" />
            </Button>
          }
          content='Finalize Request'
          size='mini'
        />
        <Confirm
          open={this.state.showConfirmFinalize}
          onCancel={this.cancelFinalize}
          onConfirm={this.finalizeRequest}
          content="You are about to close this request and transfer the money to the supplier. Are you sure you want to do this?"
        />
      </div>
    );
  }
}

export default FinalizeRequest;
