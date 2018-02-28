import React, { Component } from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { Router } from '../../routes/routes';

export default class Header extends Component {
  state = {};

  handleItemClick = (e, { name }) => {
    this.setState({ activeItem: name });

    switch (name) {
      case 'create':
        Router.pushRoute('/campaigns/create');
        break;
      case 'campaigns':
        Router.pushRoute('/campaigns');
        break;
      case 'home':
      default:
        Router.pushRoute('/');
        break;
    }
  };

  render() {
    const { activeItem } = this.state;

    return (
      <Menu stackable inverted icon='labeled' style={{ marginTop: '10px' }}>
        <Menu.Item name="home" active={activeItem === "home"} onClick={this.handleItemClick}>
          <h1><strong>KICK</strong>Chain</h1>
        </Menu.Item>
        <Menu.Item name="campaigns" active={activeItem === "campaigns"} onClick={this.handleItemClick}>
          <Icon name='lab' /> Campaigns
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item name="create" active={activeItem === "create"} onClick={this.handleItemClick}>
            <Icon name='idea' /> Create
          </Menu.Item>
        </Menu.Menu>
      </Menu>
    )
  }
}
