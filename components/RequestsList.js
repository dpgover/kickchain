import React, { Component } from 'react';
import { Icon, Message, Segment, Table } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import campaignContracts from "../ethereum/campaign";
import {campaignRequests} from "../ethereum/campaignData";
import CreateRequestForm from "./CreateRequestForm";
import ApproveRequest from "./ApproveRequest";
import FinalizeRequest from "./FinalizeRequest";

class RequestsList extends Component {
  coinbase = '';

  constructor(props, context) {
    super(props, context);

    this.state = {
      loading: false,
      campaign: props.campaign,
      coinbaseIsOwner: false,
      coinbaseCanApprove: {},
      requests: props.requests,
      approved: {},
      onSuccess: props.onSuccess,
      error: {
        hasError: false,
        message: '',
      },
    };

    this.getCoinbase();
  }

  getCoinbase = async () => {
      const accounts = await web3.eth.getAccounts();

      this.coinbase = accounts[0];

      const campaignContract = await campaignContracts(this.state.campaign.address);
      await this.checkApprovals(campaignContract);

      this.setState({
        coinbaseIsOwner: this.state.campaign.manager === this.coinbase,
      });
  };

  coinbaseCanFinalizeRequest = (request) => {
    if (request.complete || !this.state.approved[request.id]) {
      return false;
    }

    return this.state.coinbaseIsOwner;
  };

  checkApprovals = async (contract) => {
    const { requests } = this.state;

    const isContributor = await contract.methods.contributors(this.coinbase).call();

    const canApprove = {};
    const areApproved = {};
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      const hasApproved = await contract.methods.contributorVoted(request.id, this.coinbase).call();

      canApprove[request.id] = isContributor && !request.complete && !hasApproved;
      areApproved[request.id] = request.approvalCount > (this.state.campaign.contributors / 2);
    }

    this.setState({
      coinbaseCanApprove: canApprove,
      approved: areApproved,
    });
  };

  reloadRequests = async () => {
    const requests = await campaignRequests(this.state.campaign.address);

    this.setState({
      requests: requests,
    });
  };

  showError = (message) => {
    if (message !== undefined) {
      this.setState({
        error: {
          hasError: true,
          message: message,
        },
      });
    } else {
      this.setState({
        error: {
          hasError: false,
          message: '',
        },
      });
    }
  };

  render() {
    if (!this.coinbase) {
      return <div />;
    }

    return (
      <div>
        <Message
          error
          hidden={!this.state.error.hasError}
          onDismiss={this.showError}
        >
          <Message.Header>
            There was an error processing the transaction
          </Message.Header>
          {this.state.error.message}
        </Message>
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Description</Table.HeaderCell>
              <Table.HeaderCell>Payment (ETH)</Table.HeaderCell>
              <Table.HeaderCell>Supplier</Table.HeaderCell>
              <Table.HeaderCell>Approval Status</Table.HeaderCell>
              <Table.HeaderCell>Completed</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
          {
            this.state.requests.length > 0 ?
              this.state.requests.map((request, k) => {
                let completed = '';
                if (this.state.approved[request.id]) {
                  completed = request.complete ? 'Completed' : 'Not yet applied';
                } else {
                  completed = 'Not Approved';
                }

                return (
                  <Table.Row key={k}>
                    <Table.Cell>{request.description}</Table.Cell>
                    <Table.Cell>{web3.utils.fromWei(request.payment, 'ether')}</Table.Cell>
                    <Table.Cell>{request.supplier}</Table.Cell>
                    <Table.Cell negative={!this.state.approved[request.id]} positive={this.state.approved[request.id]}>
                      {request.approvalCount} / {this.state.campaign.contributors}
                      <Icon name={this.state.approved ? 'checkmark' : 'close'} />
                    </Table.Cell>
                    <Table.Cell>{completed}</Table.Cell>
                    <Table.Cell>
                      { this.state.coinbaseCanApprove[request.id] &&
                        <ApproveRequest address={this.state.campaign.address} request={request} onError={this.showError} onSuccess={() => { this.reloadRequests(); this.state.onSuccess(); }} />
                      }
                      { this.coinbaseCanFinalizeRequest(request) &&
                        <FinalizeRequest address={this.state.campaign.address} request={request} onError={this.showError} onSuccess={() => { this.reloadRequests(); this.state.onSuccess(); }} />
                      }
                    </Table.Cell>
                  </Table.Row>
                );
              }) :
              <Table.Row>
                <Table.Cell colSpan="6" textAlign="center">There are no requests yet</Table.Cell>
              </Table.Row>
          }
          </Table.Body>
        </Table>
        { this.state.coinbaseIsOwner &&
          <Segment clearing>
            <CreateRequestForm address={this.state.campaign.address} onSuccess={() => { this.reloadRequests(); this.state.onSuccess(); }} />
          </Segment>
        }
      </div>
    );
  }
}

export default RequestsList;
