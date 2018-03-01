import React, { Component } from 'react';
import { Icon, Table } from 'semantic-ui-react';
import web3 from '../ethereum/web3';

class RequestsList extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      loading: false,
      campaign: props.campaign,
      requests: props.requests,
      onSuccess: props.onSuccess,
      error: {
        hasError: false,
        message: '',
      },
    };
  }

  render() {
    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Description</Table.HeaderCell>
            <Table.HeaderCell>Payment (ETH)</Table.HeaderCell>
            <Table.HeaderCell>Supplier</Table.HeaderCell>
            <Table.HeaderCell>Approval Status</Table.HeaderCell>
            <Table.HeaderCell>Complete</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {this.state.requests.map((request, k) => {
            const approved = request.approvalCount > (this.state.campaign.contributors / 2);

            let completed = '';
            if(approved) {
              completed = request.complete ? 'Completed' : 'Not yet applied';
            } else {
              completed = 'Not Approved';
            }

            return (
              <Table.Row key={k}>
                <Table.Cell>{request.description}</Table.Cell>
                <Table.Cell>{web3.utils.fromWei(request.payment, 'ether')}</Table.Cell>
                <Table.Cell>{request.supplier}</Table.Cell>
                <Table.Cell negative={!approved} positive={approved}>
                  {request.approvalCount} / {this.state.campaign.contributors}
                  <Icon name={approved ? 'checkmark' : 'close'} />
                </Table.Cell>
                <Table.Cell>{completed}</Table.Cell>
                <Table.Cell>ACTION</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    );
  }
}

export default RequestsList;
