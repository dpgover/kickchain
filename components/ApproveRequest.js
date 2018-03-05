import React, { Component } from 'react';
import { Button, Confirm, Icon, Popup } from 'semantic-ui-react';
import campaignRetriever from "../ethereum/campaign";
import web3 from "../ethereum/web3";

class ApproveRequest extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      loading: false,
      showConfirmApproval: false,
      campaign: props.address,
      request: props.request,
      onSuccess: props.onSuccess,
      onError: props.onError,
    };
  }

  showConfirmApproval = () => {
    this.setState({showConfirmApproval: true});
  };

  cancelApproval = () => {
    this.setState({showConfirmApproval: false});
  };

  approveRequest = async (e) => {
    e.preventDefault();

    this.setState({
      loading: true,
      showConfirmApproval: false,
    });
    this.state.onError();

    const accounts = await web3.eth.getAccounts();

    try {
      const campaign = await campaignRetriever(this.state.campaign);

      await campaign.methods
        .approveRequest(this.state.request.id)
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
      this.state.onError(err.message);
    }
  };

  render() {
    return (
      <div>
        <Popup
          trigger={
            <Button icon loading={this.state.loading} onClick={this.showConfirmApproval}>
              <Icon name="thumbs up" />
            </Button>
          }
          content='Approve Request'
          size='mini'
        />
        <Confirm
          open={this.state.showConfirmApproval}
          onCancel={this.cancelApproval}
          onConfirm={this.approveRequest}
          content="You are about to approve this request. Are you sure you want to do this?"
        />
      </div>
    );
  }
}

export default ApproveRequest;
